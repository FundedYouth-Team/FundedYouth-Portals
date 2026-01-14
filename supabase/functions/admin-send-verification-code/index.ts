import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
/**
 * Edge Function: admin-send-verification-code
 *
 * Generates and sends a 6-digit verification code for step-up authentication.
 *
 * SECURITY:
 * - Uses service role key
 * - Verifies the requester has admin or manager role
 * - Stores code with expiration in verification_codes table
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
    // Verify requester has admin or manager role
    const requesterRole = requester.app_metadata?.role;
    if (requesterRole !== 'admin' && requesterRole !== 'manager') {
      console.warn(`[SECURITY] Unauthorized role attempted to send verification code. Requester: ${requester.id}, Role: ${requesterRole}`);
      throw new Error('Forbidden: Only admins and managers can request verification codes');
    }
    // Parse request body
    const body = await req.json();
    const { delivery_method, purpose, resource_id } = body;
    if (!delivery_method || ![
      'email',
      'sms'
    ].includes(delivery_method)) {
      throw new Error('Invalid delivery_method. Must be "email" or "sms"');
    }
    if (!purpose || typeof purpose !== 'string') {
      throw new Error('Invalid purpose');
    }
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Code expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    // Store the verification code
    const { error: insertError } = await supabase.from('verification_codes').insert({
      user_id: requester.id,
      code,
      purpose,
      resource_id: resource_id || null,
      delivery_method,
      expires_at: expiresAt,
      used: false
    });
    if (insertError) {
      console.error('[ERROR] Failed to store verification code:', insertError);
      throw new Error('Failed to generate verification code');
    }
    // Send the code
    let maskedDestination = '';
    if (delivery_method === 'email') {
      // Send via email using Supabase's email service or custom SMTP
      const email = requester.email;
      if (!email) {
        throw new Error('No email address on file');
      }
      // Mask email for display
      const [localPart, domain] = email.split('@');
      maskedDestination = `${localPart.charAt(0)}${'*'.repeat(Math.max(localPart.length - 2, 1))}${localPart.charAt(localPart.length - 1)}@${domain}`;
      // For now, use a simple approach - in production you'd use a proper email service
      // We'll use the Resend API if available, otherwise log the code
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: Deno.env.get('EMAIL_FROM') || 'noreply@example.com',
            to: [
              email
            ],
            subject: 'Your Verification Code',
            html: `
              <h2>Verification Code</h2>
              <p>Your verification code is:</p>
              <h1 style="font-size: 32px; letter-spacing: 8px; font-family: monospace;">${code}</h1>
              <p>This code expires in 10 minutes.</p>
              <p>If you did not request this code, please ignore this email.</p>
            `
          })
        });
        if (!emailResponse.ok) {
          console.error('[ERROR] Failed to send email:', await emailResponse.text());
          throw new Error('Failed to send verification email');
        }
      } else {
        // Development mode - log the code
        console.log(`[DEV] Verification code for ${email}: ${code}`);
      }
    } else if (delivery_method === 'sms') {
      // Get phone from user metadata
      const phone = requester.user_metadata?.phone || requester.phone;
      if (!phone) {
        throw new Error('No phone number on file');
      }
      // Mask phone for display
      const digits = phone.replace(/\D/g, '');
      maskedDestination = `***-***-${digits.slice(-4)}`;
      // For SMS, you'd integrate with Twilio or similar
      // For now, log in development
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
      if (twilioSid && twilioToken && twilioPhone) {
        const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioPhone,
            Body: `Your verification code is: ${code}. It expires in 10 minutes.`
          })
        });
        if (!twilioResponse.ok) {
          console.error('[ERROR] Failed to send SMS:', await twilioResponse.text());
          throw new Error('Failed to send verification SMS');
        }
      } else {
        // Development mode - log the code
        console.log(`[DEV] Verification code for ${phone}: ${code}`);
      }
    }
    console.log(`[INFO] Verification code sent via ${delivery_method} to ${requester.email}`);
    const response = {
      success: true,
      delivery_method,
      masked_destination: maskedDestination
    };
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[ERROR] admin-send-verification-code function error:', error);
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
