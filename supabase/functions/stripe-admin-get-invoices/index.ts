import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
/**
 * Admin Edge Function to fetch invoices for any customer.
 *
 * Request body:
 *   { stripe_customer_id: string }
 *
 * Response:
 *   { invoices: StripeInvoice[] }
 *
 * Security:
 *   - Requires authenticated user
 *   - Requires admin or manager role in app_metadata
 */ serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    // Extract the JWT token from "Bearer <token>"
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    // Verify user and get their role
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }
    // Check if user has admin or manager role
    const userRole = user.app_metadata?.role;
    if (userRole !== "admin" && userRole !== "manager") {
      throw new Error("Forbidden: Admin or manager role required");
    }
    // Parse request body
    const { stripe_customer_id } = await req.json();
    if (!stripe_customer_id) {
      throw new Error("stripe_customer_id is required");
    }
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16"
    });
    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: stripe_customer_id,
      limit: 50
    });
    // Map to simplified structure
    const invoiceData = invoices.data.map((inv)=>({
        id: inv.id,
        number: inv.number,
        amount_due: inv.amount_due,
        amount_paid: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        due_date: inv.due_date,
        created: inv.created,
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf: inv.invoice_pdf,
        description: inv.description
      }));
    return new Response(JSON.stringify({
      invoices: invoiceData
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Forbidden") ? 403 : 400;
    return new Response(JSON.stringify({
      error: message
    }), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
