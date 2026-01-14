import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    // Extract the JWT token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    console.log('Auth result:', {
      user: user?.id,
      error: userError?.message
    });
    if (userError || !user) {
      throw new Error(`Unauthorized: ${userError?.message || 'No user found'}`);
    }
    const body = await req.json();
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16'
    });
    // Check if customer already exists
    const { data: existingCustomer } = await supabase.from('billing_customers').select('stripe_customer_id').eq('user_id', user.id).single();
    let stripeCustomerId;
    if (existingCustomer?.stripe_customer_id) {
      // Update existing Stripe customer
      await stripe.customers.update(existingCustomer.stripe_customer_id, {
        email: body.email,
        name: body.name,
        address: body.address
      });
      stripeCustomerId = existingCustomer.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: body.email,
        name: body.name,
        address: body.address,
        metadata: {
          supabase_user_id: user.id
        }
      });
      stripeCustomerId = customer.id;
    }
    // Check if billing record exists
    const { data: existingBilling } = await supabase.from('billing_customers').select('id').eq('user_id', user.id).maybeSingle();
    const billingData = {
      user_id: user.id,
      email: body.email,
      stripe_customer_id: stripeCustomerId,
      billing_address_line1: body.address.line1,
      billing_address_line2: body.address.line2 || null,
      billing_city: body.address.city,
      billing_state: body.address.state,
      billing_zip: body.address.postal_code,
      billing_validated_at: new Date().toISOString()
    };
    let dbError;
    if (existingBilling) {
      // Update existing record
      const { error } = await supabase.from('billing_customers').update(billingData).eq('user_id', user.id);
      dbError = error;
    } else {
      // Insert new record
      const { error } = await supabase.from('billing_customers').insert(billingData);
      dbError = error;
    }
    if (dbError) {
      throw dbError;
    }
    return new Response(JSON.stringify({
      success: true,
      stripe_customer_id: stripeCustomerId
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Function error:', error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null) {
      message = JSON.stringify(error);
    } else if (typeof error === 'string') {
      message = error;
    }
    return new Response(JSON.stringify({
      error: message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
