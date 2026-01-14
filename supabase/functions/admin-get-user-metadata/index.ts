import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
/**
 * Edge Function: admin-get-user-metadata
 *
 * Fetches user metadata from auth.users for a specific user.
 *
 * SECURITY:
 * - Uses service role key to access auth.users
 * - Verifies the requester has admin or manager role
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
      console.warn(`[SECURITY] Unauthorized role attempted to get user metadata. Requester: ${requester.id}, Role: ${requesterRole}`);
      throw new Error('Forbidden: Only admins and managers can access user metadata');
    }
    // Parse request body
    const body = await req.json();
    const { userId } = body;
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }
    // Fetch the target user using admin API
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) {
      console.error('[ERROR] Failed to get user:', userError);
      throw new Error(`Failed to get user: ${userError.message}`);
    }
    if (!userData.user) {
      throw new Error('User not found');
    }
    // Extract metadata
    const userMeta = userData.user.user_metadata || {};
    const metadata = {
      firstName: userMeta.first_name || userMeta.firstName || null,
      lastName: userMeta.last_name || userMeta.lastName || null,
      phone: userMeta.phone || userMeta.phone_number || null,
      email: userData.user.email || null,
      created_at: userData.user.created_at || null
    };
    const response = {
      metadata
    };
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[ERROR] admin-get-user-metadata function error:', error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    const response = {
      metadata: null,
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
