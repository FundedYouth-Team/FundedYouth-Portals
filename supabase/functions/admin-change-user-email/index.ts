import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
/**
 * Edge Function: admin-change-user-email
 *
 * Two-step process to change a user's email:
 * 1. Validate - Confirm the provided user details match what's on file
 * 2. Change - Update email in auth.users, billing_customers, and Stripe
 *
 * SECURITY:
 * - Uses service role key
 * - Verifies the requester has admin role
 */ serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Verify auth header exists
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    // Create Supabase client with service role key
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get the requesting user
    const { data: { user: requester }, error: requesterError } = await supabase.auth.getUser(token);
    if (requesterError || !requester) {
      throw new Error(`Unauthorized: ${requesterError?.message || 'No user found'}`);
    }
    // Verify requester has admin role
    const requesterRole = requester.app_metadata?.role;
    if (requesterRole !== 'admin') {
      console.warn(`[SECURITY] Non-admin attempted to change user email. Requester: ${requester.id}, Role: ${requesterRole}`);
      throw new Error('Forbidden: Only admins can change user emails');
    }
    const body = await req.json();
    if (body.action === 'validate') {
      // Step 1: Validate user details
      const { userId, currentEmail, firstName, lastName, phone, address } = body;
      // Get user from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData.user) {
        throw new Error('User not found');
      }
      const user = userData.user;
      const userMeta = user.user_metadata || {};
      // Get billing info
      const { data: billing } = await supabase.from('billing_customers').select('*').eq('user_id', userId).single();
      // Validate each field
      const errors = [];
      // Email check
      if (user.email?.toLowerCase() !== currentEmail.toLowerCase()) {
        errors.push('Email does not match');
      }
      // Name check (check both snake_case and camelCase)
      const storedFirstName = userMeta.first_name || userMeta.firstName || '';
      const storedLastName = userMeta.last_name || userMeta.lastName || '';
      if (storedFirstName.toLowerCase() !== firstName.toLowerCase()) {
        errors.push('First name does not match');
      }
      if (storedLastName.toLowerCase() !== lastName.toLowerCase()) {
        errors.push('Last name does not match');
      }
      // Phone check
      const storedPhone = (userMeta.phone || userMeta.phone_number || '').replace(/\D/g, '');
      const providedPhone = phone.replace(/\D/g, '');
      if (storedPhone !== providedPhone) {
        errors.push('Phone number does not match');
      }
      // Address check (if billing exists)
      if (billing) {
        if (billing.billing_address_line1?.toLowerCase() !== address.line1.toLowerCase()) {
          errors.push('Address does not match');
        }
        if (billing.billing_city?.toLowerCase() !== address.city.toLowerCase()) {
          errors.push('City does not match');
        }
        if (billing.billing_state?.toLowerCase() !== address.state.toLowerCase()) {
          errors.push('State does not match');
        }
        if (billing.billing_zip !== address.zip) {
          errors.push('ZIP code does not match');
        }
      }
      if (errors.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          validated: false,
          error: errors.join(', ')
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        validated: true
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else if (body.action === 'change') {
      // Step 2: Change email
      const { userId, newEmail } = body;
      // Get current user data
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData.user) {
        throw new Error('User not found');
      }
      const oldEmail = userData.user.email;
      // 1. Update auth.users email
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
        email: newEmail,
        email_confirm: true
      });
      if (updateAuthError) {
        console.error('[ERROR] Failed to update auth email:', updateAuthError);
        throw new Error(`Failed to update auth email: ${updateAuthError.message}`);
      }
      // 2. Update billing_customers email
      const { data: billing } = await supabase.from('billing_customers').select('stripe_customer_id').eq('user_id', userId).single();
      if (billing) {
        const { error: billingError } = await supabase.from('billing_customers').update({
          email: newEmail,
          updated_at: new Date().toISOString()
        }).eq('user_id', userId);
        if (billingError) {
          console.error('[ERROR] Failed to update billing email:', billingError);
        // Don't throw - auth is already updated, log and continue
        }
        // 3. Update Stripe customer email
        if (billing.stripe_customer_id) {
          try {
            const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
              apiVersion: '2023-10-16'
            });
            await stripe.customers.update(billing.stripe_customer_id, {
              email: newEmail
            });
            console.log('[INFO] Stripe customer email updated:', billing.stripe_customer_id);
          } catch (stripeError) {
            console.error('[ERROR] Failed to update Stripe email:', stripeError);
          // Don't throw - auth and billing are already updated
          }
        }
      }
      // 4. Send confirmation email to new address
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: Deno.env.get('EMAIL_FROM') || 'noreply@example.com',
              to: [
                newEmail
              ],
              subject: 'Your Email Address Has Been Changed',
              html: `
                <h2>Email Address Changed</h2>
                <p>Hello,</p>
                <p>Your email address has been successfully changed.</p>
                <p><strong>Previous email:</strong> ${oldEmail}</p>
                <p><strong>New email:</strong> ${newEmail}</p>
                <p>If you did not request this change, please contact support immediately.</p>
                <p>Thank you,<br>The Team</p>
              `
            })
          });
          console.log('[INFO] Confirmation email sent to:', newEmail);
        } catch (emailError) {
          console.error('[ERROR] Failed to send confirmation email:', emailError);
        // Don't throw - email change is complete
        }
      }
      console.log(`[INFO] Email changed for user ${userId}: ${oldEmail} -> ${newEmail}`);
      return new Response(JSON.stringify({
        success: true
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    throw new Error('Invalid action');
  } catch (error) {
    console.error('[ERROR] admin-change-user-email function error:', error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    const response = {
      success: false,
      error: message
    };
    const status = message.includes('Forbidden') ? 403 : 400;
    return new Response(JSON.stringify(response), {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
