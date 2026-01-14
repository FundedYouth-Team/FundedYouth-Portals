import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
/**
 * Edge Function: admin-reset-password
 *
 * Sends a password reset email to a user.
 *
 * SECURITY:
 * - Uses service role key to access admin API
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
      console.warn(`[SECURITY] Unauthorized role attempted password reset. Requester: ${requester.id}, Role: ${requesterRole}`);
      throw new Error('Forbidden: Only admins and managers can reset passwords');
    }
    // Parse request body
    const body = await req.json();
    const { email } = body;
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email');
    }
    // Get the frontend URL for the redirect
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';
    // Send password reset email using Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/reset-password`
    });
    if (resetError) {
      console.error('[ERROR] Failed to send reset email:', resetError);
      throw new Error(`Failed to send reset email: ${resetError.message}`);
    }
    console.log(`[INFO] Password reset email sent to ${email} by ${requester.email}`);
    const response = {
      success: true
    };
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[ERROR] admin-reset-password function error:', error);
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
