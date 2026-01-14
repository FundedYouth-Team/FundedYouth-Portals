import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
/**
 * Edge Function: admin-list-users
 *
 * Lists all users from auth.users for admin role management.
 *
 * SECURITY:
 * - Uses service role key to access auth.users
 * - Verifies the requester has admin role before proceeding
 * - Denial-by-default: rejects if requester is not admin
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
    // CRITICAL: Verify requester has admin role
    const requesterRole = requester.app_metadata?.role;
    if (requesterRole !== 'admin') {
      console.warn(`[SECURITY] Non-admin attempted to list users. Requester: ${requester.id}, Role: ${requesterRole}`);
      throw new Error('Forbidden: Only admins can list users for role management');
    }
    // Parse request body for pagination and search
    let requestBody = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
      }
    } catch  {
    // Ignore parse errors, use defaults
    }
    const page = requestBody.page || 1;
    const pageSize = requestBody.pageSize || 10;
    const search = requestBody.search?.toLowerCase().trim();
    // List all users using admin API (we'll filter and paginate in memory)
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    if (listError) {
      console.error('[ERROR] Failed to list users:', listError);
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    // Fetch billing data for all users
    const { data: billingData, error: billingError } = await supabase.from('billing_customers').select('id, user_id, email, stripe_customer_id, billing_city, billing_state, created_at');
    if (billingError) {
      console.error('[ERROR] Failed to fetch billing data:', billingError);
    // Continue without billing data
    }
    // Create a map of billing data by user_id
    const billingByUserId = new Map();
    if (billingData) {
      for (const billing of billingData){
        billingByUserId.set(billing.user_id, billing);
      }
    }
    // Fetch suspended service agreements
    const { data: suspendedAgreements, error: suspendedError } = await supabase.from('service_agreements').select('user_id').eq('status', 'suspended');
    if (suspendedError) {
      console.error('[ERROR] Failed to fetch suspended agreements:', suspendedError);
    // Continue without suspension data
    }
    // Create a set of user IDs with suspended services
    const usersWithSuspendedServices = new Set();
    if (suspendedAgreements) {
      for (const agreement of suspendedAgreements){
        usersWithSuspendedServices.add(agreement.user_id);
      }
    }
    // Map to AdminUser format with firstName, lastName, phone, billing, and suspension status
    // Note: user_metadata uses snake_case (first_name, last_name)
    let users = usersData.users.map((u)=>({
        id: u.id,
        email: u.email || '',
        firstName: u.user_metadata?.first_name || u.user_metadata?.firstName || null,
        lastName: u.user_metadata?.last_name || u.user_metadata?.lastName || null,
        phone: u.user_metadata?.phone || null,
        role: u.app_metadata?.role || null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at || null,
        billing: billingByUserId.get(u.id) || null,
        hasSuspendedService: usersWithSuspendedServices.has(u.id)
      }));
    // Apply search filter (search by email, firstName, or lastName)
    if (search) {
      users = users.filter((u)=>{
        const email = u.email.toLowerCase();
        const firstName = (u.firstName || '').toLowerCase();
        const lastName = (u.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        return email.includes(search) || firstName.includes(search) || lastName.includes(search) || fullName.includes(search);
      });
    }
    // Sort by created_at descending
    users.sort((a, b)=>new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // Calculate pagination
    const total = users.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = users.slice(startIndex, startIndex + pageSize);
    const response = {
      users: paginatedUsers,
      total,
      totalPages
    };
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[ERROR] admin-list-users function error:', error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    const response = {
      users: [],
      total: 0,
      totalPages: 0,
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
