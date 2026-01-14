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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    // Extract the JWT token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }
    const body = await req.json();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16'
    });
    // Get the invoice to verify it belongs to this user
    const invoice = await stripe.invoices.retrieve(body.invoice_id);
    // Verify customer ownership
    const { data: billingCustomer } = await supabase.from('billing_customers').select('stripe_customer_id').eq('user_id', user.id).single();
    if (invoice.customer !== billingCustomer?.stripe_customer_id) {
      throw new Error('Invoice does not belong to this user');
    }
    // For open invoices, redirect to Stripe's hosted invoice page
    if (invoice.status === 'open' && invoice.hosted_invoice_url) {
      return new Response(JSON.stringify({
        url: invoice.hosted_invoice_url
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // For paid invoices, return the PDF
    if (invoice.status === 'paid' && invoice.invoice_pdf) {
      return new Response(JSON.stringify({
        url: invoice.invoice_pdf
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    throw new Error('Invoice cannot be accessed');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
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
