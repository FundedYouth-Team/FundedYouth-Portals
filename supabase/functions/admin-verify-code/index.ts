// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
console.info('server started');
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
/**
 * Edge Function: admin-verify-code
 *
 * Verifies a 6-digit verification code for step-up authentication.
 *
 * SECURITY:
 * - Uses service role key
 * - Verifies the requester has admin or manager role
 * - Marks code as used after successful verification
 * - Checks expiration
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
      console.warn(`[SECURITY] Unauthorized role attempted to verify code. Requester: ${requester.id}, Role: ${requesterRole}`);
      throw new Error('Forbidden: Only admins and managers can verify codes');
    }
    // Parse request body
    const body = await req.json();
    const { code, purpose, resource_id } = body;
    if (!code || typeof code !== 'string' || code.length !== 6) {
      throw new Error('Invalid code. Must be 6 digits.');
    }
    if (!purpose || typeof purpose !== 'string') {
      throw new Error('Invalid purpose');
    }
    // Look up the verification code
    const { data: codeRecord, error: lookupError } = await supabase.from('verification_codes').select('*').eq('user_id', requester.id).eq('code', code).eq('purpose', purpose).eq('used', false).gt('expires_at', new Date().toISOString()).order('created_at', {
      ascending: false
    }).limit(1).single();
    if (lookupError || !codeRecord) {
      console.warn(`[SECURITY] Invalid or expired code attempt by ${requester.email}`);
      const response = {
        success: true,
        verified: false,
        error: 'Invalid or expired verification code'
      };
      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Mark the code as used
    const { error: updateError } = await supabase.from('verification_codes').update({
      used: true,
      used_at: new Date().toISOString()
    }).eq('id', codeRecord.id);
    if (updateError) {
      console.error('[ERROR] Failed to mark code as used:', updateError);
    // Continue anyway - the code was valid
    }
    // Clean up old codes for this user
    await supabase.from('verification_codes').delete().eq('user_id', requester.id).lt('expires_at', new Date().toISOString());
    console.log(`[INFO] Verification code verified for ${requester.email}, purpose: ${purpose}`);
    const response = {
      success: true,
      verified: true
    };
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[ERROR] admin-verify-code function error:', error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    const response = {
      success: false,
      verified: false,
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
Deno.serve(async (req)=>{
  const { name } = await req.json();
  const data = {
    message: `Hello ${name}!`
  };
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    }
  });
});
