import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const VALID_ROLES = [
  'user',
  'manager',
  'admin'
];
/**
 * Edge Function: assign-role
 *
 * Assigns a role to a user by updating their app_metadata.
 *
 * SECURITY:
 * - Uses service role key to update auth.users.app_metadata
 * - Verifies the requester has admin role before proceeding
 * - Denial-by-default: rejects if requester is not admin
 * - Logs all role changes for audit purposes
 *
 * Only admins can assign roles. This is enforced server-side.
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
    // Create Supabase client with service role key (required to update app_metadata)
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get the requesting user
    const { data: { user: requester }, error: requesterError } = await supabase.auth.getUser(token);
    if (requesterError || !requester) {
      throw new Error(`Unauthorized: ${requesterError?.message || 'No user found'}`);
    }
    // CRITICAL: Verify requester has admin role
    // Denial-by-default: only proceed if requester.app_metadata.role === 'admin'
    const requesterRole = requester.app_metadata?.role;
    if (requesterRole !== 'admin') {
      console.warn(`[SECURITY] Non-admin attempted role assignment. Requester: ${requester.id}, Role: ${requesterRole}`);
      throw new Error('Forbidden: Only admins can assign roles');
    }
    // Parse request body
    const body = await req.json();
    const { targetUserId, newRole } = body;
    // Validate target user ID
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new Error('Invalid targetUserId');
    }
    // Validate new role (must be valid role or null to remove)
    if (newRole !== null && !VALID_ROLES.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}. Must be one of: ${VALID_ROLES.join(', ')} or null`);
    }
    // Prevent self-demotion (admin cannot remove their own admin role)
    if (targetUserId === requester.id && newRole !== 'admin') {
      throw new Error('Cannot remove your own admin role');
    }
    // Log the role change attempt (for audit purposes)
    console.log(`[AUDIT] Role change: Requester=${requester.id} (${requester.email}), ` + `Target=${targetUserId}, NewRole=${newRole}`);
    // Update the target user's app_metadata.role
    // Uses admin API which requires service role key
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(targetUserId, {
      app_metadata: {
        role: newRole
      }
    });
    if (updateError) {
      console.error('[ERROR] Failed to update user role:', updateError);
      throw new Error(`Failed to update role: ${updateError.message}`);
    }
    // Log successful role change
    console.log(`[AUDIT] Role change SUCCESS: Target=${targetUserId}, NewRole=${newRole}, ` + `UpdatedBy=${requester.id}`);
    // TODO: In Phase 6, insert audit log record into database
    // await supabase.from('audit_logs').insert({
    //   action: 'role_change',
    //   actor_id: requester.id,
    //   target_id: targetUserId,
    //   details: { newRole, previousRole: ... },
    //   timestamp: new Date().toISOString(),
    // })
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
    console.error('[ERROR] assign-role function error:', error);
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null) {
      message = JSON.stringify(error);
    } else if (typeof error === 'string') {
      message = error;
    }
    const response = {
      success: false,
      error: message
    };
    // Use 403 for authorization errors, 400 for other errors
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
