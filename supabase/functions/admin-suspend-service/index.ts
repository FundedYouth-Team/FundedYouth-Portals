import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
/**
 * Edge Function: admin-suspend-service
 *
 * Suspends or unsuspends a user's service agreement.
 *
 * SECURITY:
 * - Uses service role key
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
      console.warn(`[SECURITY] Unauthorized role attempted to suspend service. Requester: ${requester.id}, Role: ${requesterRole}`);
      throw new Error('Forbidden: Only admins and managers can suspend services');
    }
    const body = await req.json();
    // Get the service agreement
    const { data: agreement, error: agreementError } = await supabase.from('service_agreements').select('*').eq('id', body.agreementId).single();
    if (agreementError) {
      console.error('[ERROR] Failed to fetch service agreement:', agreementError);
      throw new Error(`Service agreement not found: ${agreementError.message}`);
    }
    if (!agreement) {
      throw new Error('Service agreement not found');
    }
    // Get user info separately to avoid join issues
    let userEmail = null;
    let userName = null;
    if (agreement.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(agreement.user_id);
      userEmail = userData?.user?.email || null;
      const firstName = userData?.user?.user_metadata?.first_name || '';
      const lastName = userData?.user?.user_metadata?.last_name || '';
      userName = `${firstName} ${lastName}`.trim() || userEmail;
    }
    if (body.action === 'suspend') {
      // Validate reason code
      const { data: reason, error: reasonError } = await supabase.from('suspension_reasons').select('label').eq('code', body.reasonCode).eq('is_active', true).single();
      if (reasonError || !reason) {
        throw new Error('Invalid suspension reason');
      }
      // Update the service agreement
      const { error: updateError } = await supabase.from('service_agreements').update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspension_reason: body.reasonCode,
        suspended_by: requester.id,
        suspension_notes: body.notes || null
      }).eq('id', body.agreementId);
      if (updateError) {
        console.error('[ERROR] Failed to suspend service:', updateError);
        throw new Error('Failed to suspend service');
      }
      console.log(`[INFO] Service ${body.agreementId} suspended by ${requester.email}. Reason: ${body.reasonCode}`);
      // Log to audit trail (if available)
      try {
        await supabase.from('audit_logs').insert({
          actor_id: requester.id,
          actor_email: requester.email,
          actor_role: requesterRole,
          action: 'service_suspended',
          resource_type: 'service_agreement',
          resource_id: body.agreementId,
          details: {
            reason_code: body.reasonCode,
            reason_label: reason.label,
            notes: body.notes,
            user_email: userEmail
          }
        });
      } catch  {
      // Audit log failure shouldn't block the operation
      }
      // Create admin notification
      try {
        await supabase.from('admin_notifications').insert({
          type: 'service_suspended',
          title: 'Service Suspended',
          message: `${userName || 'A user'}'s ${agreement.service_name} service has been suspended`,
          user_id: agreement.user_id,
          metadata: {
            service_name: agreement.service_name,
            agreement_id: body.agreementId,
            reason_code: body.reasonCode,
            reason_label: reason.label,
            suspended_by_email: requester.email,
            user_email: userEmail,
            notes: body.notes
          }
        });
      } catch  {
      // Notification failure shouldn't block the operation
      }
    } else if (body.action === 'unsuspend') {
      // Verify the service is currently suspended
      if (agreement.status !== 'suspended') {
        throw new Error('Service is not currently suspended');
      }
      // Update the service agreement back to active
      const { error: updateError } = await supabase.from('service_agreements').update({
        status: 'active',
        suspended_at: null,
        suspension_reason: null,
        suspended_by: null,
        suspension_notes: null
      }).eq('id', body.agreementId);
      if (updateError) {
        console.error('[ERROR] Failed to unsuspend service:', updateError);
        throw new Error('Failed to unsuspend service');
      }
      console.log(`[INFO] Service ${body.agreementId} unsuspended by ${requester.email}`);
      // Log to audit trail
      try {
        await supabase.from('audit_logs').insert({
          actor_id: requester.id,
          actor_email: requester.email,
          actor_role: requesterRole,
          action: 'service_unsuspended',
          resource_type: 'service_agreement',
          resource_id: body.agreementId,
          details: {
            notes: body.notes,
            user_email: userEmail,
            previous_reason: agreement.suspension_reason
          }
        });
      } catch  {
      // Audit log failure shouldn't block the operation
      }
    } else {
      throw new Error('Invalid action');
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[ERROR] admin-suspend-service function error:', error);
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
