/**
 * MT5 Create Invoice Edge Function
 *
 * Purpose:
 * - Receives balance data from MT5 EA
 * - Validates per-account API key for security
 * - Resolves broker account → user → Stripe customer
 * - Calculates profit and applies billing percentage
 * - Creates Stripe invoice ONLY if profit > 0
 * - Persists audit record in mt5_billing_reports
 *
 * Endpoint: POST /functions/v1/mt5-create-invoice
 *
 * Expected payload:
 * {
 *   "broker_account": 105179833,
 *   "api_key": "abc123...",              <-- Per-account API key (required)
 *   "interval_start": "2025-11-06T22:31:00Z",
 *   "interval_end": "2025-11-13T22:30:00Z",
 *   "starting_balance": 10000.00,
 *   "ending_balance": 10976.02,
 *   "report_id": "105179833_2025-11-06T22-31-00Z_..."
 * }
 *
 * Authentication:
 * - Supabase anon key (in apikey header) - public, safe on VPS
 * - Per-account api_key (in payload) - unique per broker account, revocable
 *
 * Security Model:
 * - No service_role key on VPS machines
 * - Each broker account has its own api_key
 * - If VPS is compromised, only that account's key needs regeneration
 * - Edge Function uses service_role internally (from environment)
 */ import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    console.log('MT5 Create Invoice: Request received');
    // Initialize Supabase client with service role (internal use only)
    // The service_role key stays on Supabase servers, never on VPS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Parse request body
    const payload = await req.json();
    console.log('Payload received:', JSON.stringify({
      ...payload,
      api_key: '[REDACTED]'
    }));
    // Validate required fields
    if (!payload.broker_account || !payload.api_key || !payload.interval_start || !payload.interval_end || payload.starting_balance === undefined || payload.ending_balance === undefined) {
      throw new Error('Missing required fields: broker_account, api_key, interval_start, interval_end, starting_balance, ending_balance');
    }
    // Check for duplicate submission (idempotency)
    const { data: existingReport } = await supabase.from('mt5_billing_reports').select('id, status, stripe_invoice_id').eq('broker_account_number', payload.broker_account).eq('interval_start', payload.interval_start).eq('interval_end', payload.interval_end).maybeSingle();
    if (existingReport) {
      console.log('Duplicate report detected:', existingReport.id);
      return new Response(JSON.stringify({
        success: true,
        message: 'Report already processed',
        report_id: existingReport.id,
        status: existingReport.status,
        stripe_invoice_id: existingReport.stripe_invoice_id
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Look up broker account AND validate API key in one query
    // This ensures the api_key matches the broker_account
    const { data: brokerAccount, error: brokerError } = await supabase.from('broker_accounts').select('id, user_id, broker_account_number, api_key, billing_percentage, service_agreement_id').eq('broker_account_number', payload.broker_account.toString()).eq('api_key', payload.api_key) // API key must match!
    .maybeSingle();
    if (brokerError) {
      console.error('Broker account lookup error:', brokerError);
      throw new Error(`Database error: ${brokerError.message}`);
    }
    if (!brokerAccount) {
      // Could be: account doesn't exist OR api_key is wrong
      // Check if account exists to give appropriate error
      const { data: accountExists } = await supabase.from('broker_accounts').select('id').eq('broker_account_number', payload.broker_account.toString()).maybeSingle();
      if (accountExists) {
        // Account exists but API key is wrong
        console.error('Invalid API key for broker account:', payload.broker_account);
        // Log failed authentication attempt (don't store the bad api_key)
        await supabase.from('mt5_billing_reports').insert({
          report_id: payload.report_id,
          broker_account_number: payload.broker_account,
          interval_start: payload.interval_start,
          interval_end: payload.interval_end,
          starting_balance: payload.starting_balance,
          ending_balance: payload.ending_balance,
          profit: payload.ending_balance - payload.starting_balance,
          status: 'error',
          error_message: 'Invalid API key - authentication failed'
        });
        // Return 401 Unauthorized
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid API key for this broker account'
        }), {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Account doesn't exist
        console.error('Broker account not found:', payload.broker_account);
        await supabase.from('mt5_billing_reports').insert({
          report_id: payload.report_id,
          broker_account_number: payload.broker_account,
          interval_start: payload.interval_start,
          interval_end: payload.interval_end,
          starting_balance: payload.starting_balance,
          ending_balance: payload.ending_balance,
          profit: payload.ending_balance - payload.starting_balance,
          status: 'error',
          error_message: 'Broker account not found in database'
        });
        throw new Error(`Broker account ${payload.broker_account} not found`);
      }
    }
    console.log('Broker account authenticated:', brokerAccount.id, 'User:', brokerAccount.user_id);
    // Get billing customer (Stripe customer ID)
    const { data: billingCustomer } = await supabase.from('billing_customers').select('stripe_customer_id').eq('user_id', brokerAccount.user_id).maybeSingle();
    // Get billing percentage (from broker_accounts or fall back to services table)
    let billingPercentage = brokerAccount.billing_percentage;
    if (billingPercentage === null && brokerAccount.service_agreement_id) {
      // Look up from service agreement → service
      const { data: serviceAgreement } = await supabase.from('service_agreements').select('service_id').eq('id', brokerAccount.service_agreement_id).maybeSingle();
      if (serviceAgreement?.service_id) {
        const { data: service } = await supabase.from('services').select('pricing_percentage').eq('id', serviceAgreement.service_id).maybeSingle();
        billingPercentage = service?.pricing_percentage ?? null;
      }
    }
    // Default to 45% if not configured
    if (billingPercentage === null) {
      console.log('No billing percentage configured, using default 45%');
      billingPercentage = 45;
    }
    console.log('Billing percentage:', billingPercentage);
    // Calculate profit
    const profit = payload.ending_balance - payload.starting_balance;
    console.log('Profit calculated:', profit);
    // Determine invoice amount and status
    let invoiceAmount = 0;
    let stripeInvoiceId = null;
    let stripeInvoiceStatus = null;
    let status;
    if (profit <= 0) {
      // No profit - skip billing
      console.log('No profit - skipping invoice creation');
      status = 'skipped';
      invoiceAmount = 0;
    } else {
      // Calculate invoice amount
      invoiceAmount = profit * (billingPercentage / 100);
      console.log('Invoice amount:', invoiceAmount);
      // Check if we have a Stripe customer
      if (!billingCustomer?.stripe_customer_id) {
        console.log('No Stripe customer ID - marking as processed without invoice');
        status = 'processed';
      } else {
        // Create Stripe invoice
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
          console.error('STRIPE_SECRET_KEY not configured');
          status = 'error';
        } else {
          try {
            const stripe = new Stripe(stripeSecretKey, {
              apiVersion: '2023-10-16'
            });
            // Format dates for invoice description
            const startDate = new Date(payload.interval_start).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const endDate = new Date(payload.interval_end).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            // Create invoice item
            await stripe.invoiceItems.create({
              customer: billingCustomer.stripe_customer_id,
              amount: Math.round(invoiceAmount * 100),
              currency: 'usd',
              description: `Trading Profit Share (${billingPercentage}%) - ${startDate} to ${endDate}`,
              metadata: {
                broker_account: payload.broker_account.toString(),
                interval_start: payload.interval_start,
                interval_end: payload.interval_end,
                starting_balance: payload.starting_balance.toString(),
                ending_balance: payload.ending_balance.toString(),
                profit: profit.toString()
              }
            });
            // Create and send invoice
            const invoice = await stripe.invoices.create({
              customer: billingCustomer.stripe_customer_id,
              auto_advance: true,
              collection_method: 'send_invoice',
              days_until_due: 7,
              metadata: {
                source: 'mt5_billing',
                broker_account: payload.broker_account.toString(),
                report_id: payload.report_id || ''
              }
            });
            // Finalize the invoice (this sends it to the customer)
            const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
            stripeInvoiceId = finalizedInvoice.id;
            stripeInvoiceStatus = finalizedInvoice.status;
            status = 'invoiced';
            console.log('Stripe invoice created:', stripeInvoiceId);
          } catch (stripeError) {
            console.error('Stripe error:', stripeError);
            status = 'error';
            const errorMsg = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error';
            // Insert error record
            await supabase.from('mt5_billing_reports').insert({
              report_id: payload.report_id,
              broker_account_number: payload.broker_account,
              user_id: brokerAccount.user_id,
              interval_start: payload.interval_start,
              interval_end: payload.interval_end,
              starting_balance: payload.starting_balance,
              ending_balance: payload.ending_balance,
              profit: profit,
              billing_percentage: billingPercentage,
              invoice_amount: invoiceAmount,
              stripe_customer_id: billingCustomer.stripe_customer_id,
              status: 'error',
              error_message: `Stripe error: ${errorMsg}`
            });
            throw new Error(`Stripe error: ${errorMsg}`);
          }
        }
      }
    }
    // Insert audit record
    const { data: reportRecord, error: insertError } = await supabase.from('mt5_billing_reports').insert({
      report_id: payload.report_id,
      broker_account_number: payload.broker_account,
      user_id: brokerAccount.user_id,
      interval_start: payload.interval_start,
      interval_end: payload.interval_end,
      starting_balance: payload.starting_balance,
      ending_balance: payload.ending_balance,
      profit: profit,
      billing_percentage: billingPercentage,
      invoice_amount: profit > 0 ? invoiceAmount : 0,
      stripe_customer_id: billingCustomer?.stripe_customer_id || null,
      stripe_invoice_id: stripeInvoiceId,
      stripe_invoice_status: stripeInvoiceStatus,
      status: status,
      processed_at: new Date().toISOString()
    }).select().single();
    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Database error: ${insertError.message}`);
    }
    console.log('Report record created:', reportRecord.id);
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      report_id: reportRecord.id,
      status: status,
      profit: profit,
      invoice_amount: profit > 0 ? invoiceAmount : 0,
      stripe_invoice_id: stripeInvoiceId,
      message: status === 'skipped' ? 'No profit - no invoice created' : status === 'invoiced' ? 'Invoice created and sent' : status === 'processed' ? 'Processed but no Stripe customer configured' : 'Report recorded'
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
      success: false,
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
