


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."cancel_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.service_agreements
  SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = p_reason
  WHERE id = p_agreement_id AND user_id = p_user_id AND status = 'active';

  IF NOT FOUND THEN RETURN false; END IF;

  UPDATE public.broker_accounts SET is_active = false
  WHERE service_agreement_id = p_agreement_id AND user_id = p_user_id;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."cancel_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN auth.jwt() -> 'app_metadata' ->> 'role';
END;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_audit_log"("p_action" "text", "p_actor_id" "uuid", "p_actor_email" "text", "p_actor_role" "text", "p_target_id" "text" DEFAULT NULL::"text", "p_target_description" "text" DEFAULT NULL::"text", "p_details" "jsonb" DEFAULT '{}'::"jsonb", "p_ip_address" "inet" DEFAULT NULL::"inet", "p_user_agent" "text" DEFAULT NULL::"text", "p_success" boolean DEFAULT true, "p_error_message" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    action, actor_id, actor_email, actor_role, target_id,
    target_description, details, ip_address, user_agent, success, error_message
  ) VALUES (
    p_action, p_actor_id, p_actor_email, p_actor_role, p_target_id,
    p_target_description, p_details, p_ip_address, p_user_agent, p_success, p_error_message
  )
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;


ALTER FUNCTION "public"."insert_audit_log"("p_action" "text", "p_actor_id" "uuid", "p_actor_email" "text", "p_actor_role" "text", "p_target_id" "text", "p_target_description" "text", "p_details" "jsonb", "p_ip_address" "inet", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_or_manager"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := auth.jwt() -> 'app_metadata' ->> 'role';
  RETURN user_role IN ('admin', 'manager');
END;
$$;


ALTER FUNCTION "public"."is_admin_or_manager"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_notification_completed"("p_notification_id" "uuid", "p_admin_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.admin_notifications
  SET
    completed_at = NOW(),
    completed_by = p_admin_id,
    read_at = COALESCE(read_at, NOW()),
    read_by = COALESCE(read_by, p_admin_id)
  WHERE id = p_notification_id;
END;
$$;


ALTER FUNCTION "public"."mark_notification_completed"("p_notification_id" "uuid", "p_admin_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_billing_added"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF OLD.billing_validated_at IS NULL AND NEW.billing_validated_at IS NOT NULL THEN
    SELECT email,
           COALESCE(raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(raw_user_meta_data->>'last_name', '')
    INTO user_email, user_name
    FROM auth.users WHERE id = NEW.user_id;

    user_name := TRIM(user_name);
    IF user_name = '' THEN user_name := user_email; END IF;

    INSERT INTO public.admin_notifications (type, title, message, user_id, metadata)
    VALUES (
      'billing_added',
      'Billing Information Added',
      user_name || ' has added their billing information',
      NEW.user_id,
      jsonb_build_object('user_email', user_email, 'billing_customer_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_billing_added"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_billing_added_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  IF NEW.billing_validated_at IS NOT NULL THEN
    SELECT email,
           COALESCE(raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(raw_user_meta_data->>'last_name', '')
    INTO user_email, user_name
    FROM auth.users WHERE id = NEW.user_id;

    user_name := TRIM(user_name);
    IF user_name = '' THEN user_name := user_email; END IF;

    INSERT INTO public.admin_notifications (type, title, message, user_id, metadata)
    VALUES (
      'billing_added',
      'Billing Information Added',
      user_name || ' has added their billing information',
      NEW.user_id,
      jsonb_build_object('user_email', user_email, 'billing_customer_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_billing_added_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_service_enrollment"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  service_display_name TEXT;
BEGIN
  IF NEW.status = 'active' THEN
    -- Get user info
    SELECT email,
           COALESCE(raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(raw_user_meta_data->>'last_name', '')
    INTO user_email, user_name
    FROM auth.users WHERE id = NEW.user_id;

    -- Get service display name
    SELECT display_name INTO service_display_name FROM public.services WHERE name = NEW.service_name;

    user_name := TRIM(user_name);
    IF user_name = '' THEN user_name := user_email; END IF;

    INSERT INTO public.admin_notifications (type, title, message, user_id, metadata)
    VALUES (
      'service_enrollment',
      'New Service Enrollment',
      user_name || ' has enrolled in ' || COALESCE(service_display_name, NEW.service_name),
      NEW.user_id,
      jsonb_build_object(
        'service_name', NEW.service_name,
        'service_display_name', service_display_name,
        'agreement_id', NEW.id,
        'user_email', user_email
      )
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_service_enrollment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."pause_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.service_agreements
  SET status = 'paused', cancelled_at = NOW(), cancellation_reason = p_reason
  WHERE id = p_agreement_id AND user_id = p_user_id AND status = 'active';

  IF NOT FOUND THEN RETURN false; END IF;

  -- Deactivate linked broker accounts
  UPDATE public.broker_accounts SET is_active = false
  WHERE service_agreement_id = p_agreement_id AND user_id = p_user_id;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."pause_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reactivate_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.service_agreements
  SET status = 'active', cancelled_at = NULL, cancellation_reason = NULL
  WHERE id = p_agreement_id AND user_id = p_user_id AND status = 'paused';

  IF NOT FOUND THEN RETURN false; END IF;

  -- Reactivate linked broker accounts
  UPDATE public.broker_accounts SET is_active = true
  WHERE service_agreement_id = p_agreement_id AND user_id = p_user_id;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."reactivate_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."regenerate_broker_api_key"("account_number" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  new_key TEXT;
BEGIN
  -- Generate new key
  new_key := encode(gen_random_bytes(32), 'hex');

  -- Update the account
  UPDATE public.broker_accounts
  SET api_key = new_key
  WHERE broker_account_number = account_number;

  -- Check if account was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Broker account % not found', account_number;
  END IF;

  RETURN new_key;
END;
$$;


ALTER FUNCTION "public"."regenerate_broker_api_key"("account_number" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."regenerate_broker_api_key"("account_number" "text") IS 'Regenerates the API key for a broker account. Use if VPS is compromised.';



CREATE OR REPLACE FUNCTION "public"."remove_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  DELETE FROM public.broker_accounts
  WHERE service_agreement_id = p_agreement_id AND user_id = p_user_id;

  DELETE FROM public.service_agreements
  WHERE id = p_agreement_id AND user_id = p_user_id;

  IF NOT FOUND THEN RETURN false; END IF;
  RETURN true;
END;
$$;


ALTER FUNCTION "public"."remove_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_services_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_services_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" character varying(50) NOT NULL,
    "title" character varying(255) NOT NULL,
    "message" "text" NOT NULL,
    "user_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "read_at" timestamp with time zone,
    "read_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "completed_by" "uuid"
);


ALTER TABLE "public"."admin_notifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."admin_notifications" IS 'Notifications for admin users about user actions (enrollments, billing, etc.)';



COMMENT ON COLUMN "public"."admin_notifications"."type" IS 'Type of notification: service_enrollment, billing_added, etc.';



COMMENT ON COLUMN "public"."admin_notifications"."metadata" IS 'Additional JSON data relevant to the notification';



CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "text" NOT NULL,
    "actor_id" "uuid" NOT NULL,
    "actor_email" "text" NOT NULL,
    "actor_role" "text",
    "target_id" "text",
    "target_description" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "success" boolean DEFAULT true,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."billing_customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "stripe_customer_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "billing_address_line1" "text",
    "billing_address_line2" "text",
    "billing_city" "text",
    "billing_state" "text",
    "billing_zip" "text",
    "billing_validated_at" timestamp with time zone,
    CONSTRAINT "billing_state_format" CHECK ((("billing_state" IS NULL) OR ("length"("billing_state") = 2))),
    CONSTRAINT "billing_zip_format" CHECK ((("billing_zip" IS NULL) OR ("billing_zip" ~ '^\d{5}(-\d{4})?$'::"text")))
);


ALTER TABLE "public"."billing_customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."broker_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "broker_name" "text" NOT NULL,
    "broker_account_number" "text" NOT NULL,
    "broker_account_password" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "service_agreement_id" "uuid",
    "billing_percentage" numeric(5,2),
    "api_key" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'hex'::"text") NOT NULL
);


ALTER TABLE "public"."broker_accounts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."broker_accounts"."billing_percentage" IS 'Per-account billing percentage override. Falls back to services.pricing_percentage if null.';



COMMENT ON COLUMN "public"."broker_accounts"."api_key" IS 'Unique API key for MT5 EA authentication. Regenerate if VPS is compromised.';



CREATE TABLE IF NOT EXISTS "public"."mt5_billing_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "text",
    "broker_account_number" bigint NOT NULL,
    "user_id" "uuid",
    "interval_start" timestamp with time zone NOT NULL,
    "interval_end" timestamp with time zone NOT NULL,
    "starting_balance" numeric(15,2) NOT NULL,
    "ending_balance" numeric(15,2) NOT NULL,
    "profit" numeric(15,2) NOT NULL,
    "billing_percentage" numeric(5,2),
    "invoice_amount" numeric(15,2),
    "stripe_customer_id" "text",
    "stripe_invoice_id" "text",
    "stripe_invoice_status" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone,
    CONSTRAINT "mt5_billing_reports_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processed'::"text", 'invoiced'::"text", 'skipped'::"text", 'error'::"text"]))),
    CONSTRAINT "valid_balances" CHECK ((("starting_balance" >= (0)::numeric) AND ("ending_balance" >= (0)::numeric))),
    CONSTRAINT "valid_interval" CHECK (("interval_end" > "interval_start"))
);


ALTER TABLE "public"."mt5_billing_reports" OWNER TO "postgres";


COMMENT ON TABLE "public"."mt5_billing_reports" IS 'Audit table for MT5 weekly balance reports and billing';



COMMENT ON COLUMN "public"."mt5_billing_reports"."report_id" IS 'Deterministic ID from EA for idempotency';



COMMENT ON COLUMN "public"."mt5_billing_reports"."profit" IS 'Calculated: ending_balance - starting_balance';



COMMENT ON COLUMN "public"."mt5_billing_reports"."invoice_amount" IS 'Amount invoiced: profit * (billing_percentage / 100)';



COMMENT ON COLUMN "public"."mt5_billing_reports"."status" IS 'pending=received, processed=calculated, invoiced=stripe invoice created, skipped=no profit, error=failed';



CREATE TABLE IF NOT EXISTS "public"."service_agreements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "service_name" "text" NOT NULL,
    "service_version" "text" NOT NULL,
    "confirmed_fields" "jsonb" NOT NULL,
    "agreed_to_terms" boolean DEFAULT false NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "agreed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "cancelled_at" timestamp with time zone,
    "cancellation_reason" "text",
    "suspended_at" timestamp with time zone,
    "suspension_reason" "text",
    "suspended_by" "uuid",
    "suspension_notes" "text",
    "service_id" "uuid",
    CONSTRAINT "agreement_must_be_true" CHECK (("agreed_to_terms" = true)),
    CONSTRAINT "service_agreements_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'paused'::"text", 'cancelled'::"text", 'expired'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."service_agreements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "display_name" character varying(200) NOT NULL,
    "description" "text",
    "version" character varying(20) DEFAULT '1.0'::character varying NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "requires_agreement" boolean DEFAULT true NOT NULL,
    "terms_content" "text",
    "terms_updated_at" timestamp with time zone,
    "required_fields" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "acknowledgments" "jsonb" DEFAULT '[]'::"jsonb",
    "display_description" "text",
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "pricing_type" character varying(20) DEFAULT 'fixed'::character varying,
    "pricing_amount" numeric(10,2),
    "pricing_percentage" numeric(5,2),
    "pricing_period" character varying(20),
    "max_instances_per_user" integer DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."services" OWNER TO "postgres";


COMMENT ON COLUMN "public"."services"."acknowledgments" IS 'JSON array of acknowledgment checkboxes. Each item: {"id": "unique_id", "text": "Checkbox text", "required": true/false}';



COMMENT ON COLUMN "public"."services"."display_description" IS 'Short description for service card display (separate from legal terms)';



COMMENT ON COLUMN "public"."services"."features" IS 'JSON array of feature strings to display on service card';



COMMENT ON COLUMN "public"."services"."max_instances_per_user" IS 'Maximum number of times a single user can enroll in this service. Default is 1.';



CREATE TABLE IF NOT EXISTS "public"."suspension_reasons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" character varying(50) NOT NULL,
    "label" character varying(200) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."suspension_reasons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "status" character varying(20) DEFAULT 'todo'::character varying NOT NULL,
    "priority" character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    "due_date" "date" NOT NULL,
    "completed_at" timestamp with time zone,
    "assignee_id" "uuid" NOT NULL,
    "support_assignees" "uuid"[] DEFAULT '{}'::"uuid"[],
    "related_user_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read_at" timestamp with time zone,
    "read_by" "uuid",
    CONSTRAINT "tickets_priority_check" CHECK ((("priority")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::"text"[]))),
    CONSTRAINT "tickets_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['todo'::character varying, 'active'::character varying, 'complete'::character varying])::"text"[])))
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


COMMENT ON TABLE "public"."tickets" IS 'Internal ticketing system for admin/manager tasks';



COMMENT ON COLUMN "public"."tickets"."status" IS 'Ticket status: todo, active, complete';



COMMENT ON COLUMN "public"."tickets"."priority" IS 'Ticket priority: low, medium, high';



COMMENT ON COLUMN "public"."tickets"."assignee_id" IS 'Primary person responsible for this ticket';



COMMENT ON COLUMN "public"."tickets"."support_assignees" IS 'Additional team members supporting this ticket';



COMMENT ON COLUMN "public"."tickets"."related_user_id" IS 'Optional: the customer this ticket is about';



COMMENT ON COLUMN "public"."tickets"."read_at" IS 'When the assignee marked this ticket as read';



COMMENT ON COLUMN "public"."tickets"."read_by" IS 'Who marked this ticket as read';



CREATE TABLE IF NOT EXISTS "public"."verification_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "purpose" "text" NOT NULL,
    "resource_id" "text",
    "delivery_method" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "verification_codes_delivery_method_check" CHECK (("delivery_method" = ANY (ARRAY['email'::"text", 'sms'::"text"])))
);


ALTER TABLE "public"."verification_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vps_instances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "host_provider" "text" NOT NULL,
    "provider_vps_name" "text" NOT NULL,
    "ip_address" "inet",
    "region" "text" NOT NULL,
    "operating_system" "text" NOT NULL,
    "vcpu" integer NOT NULL,
    "vram_gb" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "assigned_user_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "port" integer,
    CONSTRAINT "vps_instances_port_check" CHECK ((("port" IS NULL) OR (("port" >= 1) AND ("port" <= 65535)))),
    CONSTRAINT "vps_instances_status_check" CHECK (("status" = ANY (ARRAY['running'::"text", 'pending'::"text", 'disabled'::"text"])))
);


ALTER TABLE "public"."vps_instances" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."billing_customers"
    ADD CONSTRAINT "billing_customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."billing_customers"
    ADD CONSTRAINT "billing_customers_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."billing_customers"
    ADD CONSTRAINT "billing_customers_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."broker_accounts"
    ADD CONSTRAINT "broker_accounts_api_key_key" UNIQUE ("api_key");



ALTER TABLE ONLY "public"."broker_accounts"
    ADD CONSTRAINT "broker_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mt5_billing_reports"
    ADD CONSTRAINT "mt5_billing_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mt5_billing_reports"
    ADD CONSTRAINT "mt5_billing_reports_report_id_key" UNIQUE ("report_id");



ALTER TABLE ONLY "public"."service_agreements"
    ADD CONSTRAINT "service_agreements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suspension_reasons"
    ADD CONSTRAINT "suspension_reasons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."suspension_reasons"
    ADD CONSTRAINT "suspension_reasons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verification_codes"
    ADD CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vps_instances"
    ADD CONSTRAINT "vps_instances_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_admin_notifications_completed" ON "public"."admin_notifications" USING "btree" ("completed_at") WHERE ("completed_at" IS NOT NULL);



CREATE INDEX "idx_admin_notifications_completed_by" ON "public"."admin_notifications" USING "btree" ("completed_by");



CREATE INDEX "idx_admin_notifications_created_at" ON "public"."admin_notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_admin_notifications_read_at" ON "public"."admin_notifications" USING "btree" ("read_at");



CREATE INDEX "idx_admin_notifications_read_by" ON "public"."admin_notifications" USING "btree" ("read_by");



CREATE INDEX "idx_admin_notifications_type" ON "public"."admin_notifications" USING "btree" ("type");



CREATE INDEX "idx_admin_notifications_user_id" ON "public"."admin_notifications" USING "btree" ("user_id");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_actor_id" ON "public"."audit_logs" USING "btree" ("actor_id");



CREATE INDEX "idx_audit_logs_target_id" ON "public"."audit_logs" USING "btree" ("target_id");



CREATE INDEX "idx_audit_logs_timestamp" ON "public"."audit_logs" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_billing_customers_validated" ON "public"."billing_customers" USING "btree" ("user_id") WHERE ("billing_validated_at" IS NOT NULL);



CREATE INDEX "idx_broker_accounts_api_key" ON "public"."broker_accounts" USING "btree" ("api_key");



CREATE INDEX "idx_broker_accounts_service_agreement" ON "public"."broker_accounts" USING "btree" ("service_agreement_id");



CREATE INDEX "idx_broker_accounts_user_id" ON "public"."broker_accounts" USING "btree" ("user_id");



CREATE INDEX "idx_mt5_billing_reports_broker_account" ON "public"."mt5_billing_reports" USING "btree" ("broker_account_number");



CREATE INDEX "idx_mt5_billing_reports_created_at" ON "public"."mt5_billing_reports" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_mt5_billing_reports_interval" ON "public"."mt5_billing_reports" USING "btree" ("interval_start", "interval_end");



CREATE INDEX "idx_mt5_billing_reports_status" ON "public"."mt5_billing_reports" USING "btree" ("status");



CREATE UNIQUE INDEX "idx_mt5_billing_reports_unique_interval" ON "public"."mt5_billing_reports" USING "btree" ("broker_account_number", "interval_start", "interval_end");



CREATE INDEX "idx_mt5_billing_reports_user_id" ON "public"."mt5_billing_reports" USING "btree" ("user_id");



CREATE INDEX "idx_service_agreements_service_id" ON "public"."service_agreements" USING "btree" ("service_id");



CREATE INDEX "idx_service_agreements_status" ON "public"."service_agreements" USING "btree" ("user_id", "status");



CREATE INDEX "idx_service_agreements_suspended" ON "public"."service_agreements" USING "btree" ("status") WHERE ("status" = 'suspended'::"text");



CREATE INDEX "idx_service_agreements_suspended_by" ON "public"."service_agreements" USING "btree" ("suspended_by");



CREATE INDEX "idx_services_created_by" ON "public"."services" USING "btree" ("created_by");



CREATE INDEX "idx_services_enabled" ON "public"."services" USING "btree" ("enabled");



CREATE INDEX "idx_services_name" ON "public"."services" USING "btree" ("name");



CREATE INDEX "idx_tickets_assignee" ON "public"."tickets" USING "btree" ("assignee_id");



CREATE INDEX "idx_tickets_created_at" ON "public"."tickets" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_tickets_created_by" ON "public"."tickets" USING "btree" ("created_by");



CREATE INDEX "idx_tickets_due_date" ON "public"."tickets" USING "btree" ("due_date");



CREATE INDEX "idx_tickets_priority" ON "public"."tickets" USING "btree" ("priority");



CREATE INDEX "idx_tickets_read_at" ON "public"."tickets" USING "btree" ("read_at");



CREATE INDEX "idx_tickets_related_user" ON "public"."tickets" USING "btree" ("related_user_id");



CREATE INDEX "idx_tickets_status" ON "public"."tickets" USING "btree" ("status");



CREATE INDEX "idx_verification_codes_expires" ON "public"."verification_codes" USING "btree" ("expires_at");



CREATE INDEX "idx_verification_codes_user" ON "public"."verification_codes" USING "btree" ("user_id");



CREATE INDEX "idx_vps_instances_assigned_user" ON "public"."vps_instances" USING "btree" ("assigned_user_id");



CREATE INDEX "idx_vps_instances_status" ON "public"."vps_instances" USING "btree" ("status");



CREATE UNIQUE INDEX "service_agreements_unique_acceptance" ON "public"."service_agreements" USING "btree" ("user_id", "service_name", "service_version");



CREATE OR REPLACE TRIGGER "services_updated_at_trigger" BEFORE UPDATE ON "public"."services" FOR EACH ROW EXECUTE FUNCTION "public"."update_services_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_notify_billing_added" AFTER UPDATE ON "public"."billing_customers" FOR EACH ROW EXECUTE FUNCTION "public"."notify_billing_added"();



CREATE OR REPLACE TRIGGER "trigger_notify_billing_added_insert" AFTER INSERT ON "public"."billing_customers" FOR EACH ROW EXECUTE FUNCTION "public"."notify_billing_added_on_insert"();



CREATE OR REPLACE TRIGGER "trigger_notify_service_enrollment" AFTER INSERT ON "public"."service_agreements" FOR EACH ROW EXECUTE FUNCTION "public"."notify_service_enrollment"();



CREATE OR REPLACE TRIGGER "update_tickets_updated_at" BEFORE UPDATE ON "public"."tickets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vps_instances_updated_at" BEFORE UPDATE ON "public"."vps_instances" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_read_by_fkey" FOREIGN KEY ("read_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."billing_customers"
    ADD CONSTRAINT "billing_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."broker_accounts"
    ADD CONSTRAINT "broker_accounts_service_agreement_id_fkey" FOREIGN KEY ("service_agreement_id") REFERENCES "public"."service_agreements"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."broker_accounts"
    ADD CONSTRAINT "broker_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mt5_billing_reports"
    ADD CONSTRAINT "mt5_billing_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_agreements"
    ADD CONSTRAINT "service_agreements_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id");



ALTER TABLE ONLY "public"."service_agreements"
    ADD CONSTRAINT "service_agreements_suspended_by_fkey" FOREIGN KEY ("suspended_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."service_agreements"
    ADD CONSTRAINT "service_agreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_read_by_fkey" FOREIGN KEY ("read_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_related_user_id_fkey" FOREIGN KEY ("related_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."verification_codes"
    ADD CONSTRAINT "verification_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vps_instances"
    ADD CONSTRAINT "vps_instances_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admin delete services" ON "public"."services" FOR DELETE USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin insert services" ON "public"."services" FOR INSERT WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admin update services" ON "public"."services" FOR UPDATE USING (( SELECT "public"."is_admin"() AS "is_admin")) WITH CHECK (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins and managers can delete VPS" ON "public"."vps_instances" FOR DELETE USING ("public"."is_admin_or_manager"());



CREATE POLICY "Admins and managers can insert VPS" ON "public"."vps_instances" FOR INSERT WITH CHECK ("public"."is_admin_or_manager"());



CREATE POLICY "Admins and managers can manage tickets" ON "public"."tickets" USING (( SELECT "public"."is_admin_or_manager"() AS "is_admin_or_manager")) WITH CHECK (( SELECT "public"."is_admin_or_manager"() AS "is_admin_or_manager"));



CREATE POLICY "Admins and managers can update VPS" ON "public"."vps_instances" FOR UPDATE USING ("public"."is_admin_or_manager"());



CREATE POLICY "Admins and managers can view all VPS" ON "public"."vps_instances" FOR SELECT USING ("public"."is_admin_or_manager"());



CREATE POLICY "Anyone can read suspension reasons" ON "public"."suspension_reasons" FOR SELECT USING (true);



CREATE POLICY "Delete own broker account" ON "public"."broker_accounts" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Delete own service agreement" ON "public"."service_agreements" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Deny delete audit logs" ON "public"."audit_logs" FOR DELETE USING (false);



CREATE POLICY "Deny insert audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK (false);



CREATE POLICY "Deny update audit logs" ON "public"."audit_logs" FOR UPDATE USING (false);



CREATE POLICY "Insert own billing record" ON "public"."billing_customers" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Insert own broker account" ON "public"."broker_accounts" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Insert own service agreement" ON "public"."service_agreements" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "No direct client access to verification codes" ON "public"."verification_codes" USING (false);



CREATE POLICY "Select audit logs" ON "public"."audit_logs" FOR SELECT USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Select billing customers" ON "public"."billing_customers" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR ( SELECT "public"."is_admin_or_manager"() AS "is_admin_or_manager")));



CREATE POLICY "Select broker accounts" ON "public"."broker_accounts" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR ( SELECT "public"."is_admin"() AS "is_admin")));



CREATE POLICY "Select mt5 billing reports" ON "public"."mt5_billing_reports" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR ( SELECT "public"."is_admin_or_manager"() AS "is_admin_or_manager")));



CREATE POLICY "Select service agreements" ON "public"."service_agreements" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR ( SELECT "public"."is_admin"() AS "is_admin")));



CREATE POLICY "Select services" ON "public"."services" FOR SELECT USING ((("enabled" = true) OR ( SELECT "public"."is_admin_or_manager"() AS "is_admin_or_manager")));



CREATE POLICY "Service role can manage admin_notifications" ON "public"."admin_notifications" USING (true) WITH CHECK (true);



CREATE POLICY "Update own billing record" ON "public"."billing_customers" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Update own broker account" ON "public"."broker_accounts" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Update own service agreement" ON "public"."service_agreements" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."admin_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."billing_customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."broker_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mt5_billing_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_agreements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suspension_reasons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verification_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vps_instances" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."admin_notifications";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."cancel_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cancel_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancel_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_audit_log"("p_action" "text", "p_actor_id" "uuid", "p_actor_email" "text", "p_actor_role" "text", "p_target_id" "text", "p_target_description" "text", "p_details" "jsonb", "p_ip_address" "inet", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_audit_log"("p_action" "text", "p_actor_id" "uuid", "p_actor_email" "text", "p_actor_role" "text", "p_target_id" "text", "p_target_description" "text", "p_details" "jsonb", "p_ip_address" "inet", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_audit_log"("p_action" "text", "p_actor_id" "uuid", "p_actor_email" "text", "p_actor_role" "text", "p_target_id" "text", "p_target_description" "text", "p_details" "jsonb", "p_ip_address" "inet", "p_user_agent" "text", "p_success" boolean, "p_error_message" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_or_manager"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_completed"("p_notification_id" "uuid", "p_admin_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_completed"("p_notification_id" "uuid", "p_admin_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_completed"("p_notification_id" "uuid", "p_admin_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_billing_added"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_billing_added"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_billing_added"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_billing_added_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_billing_added_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_billing_added_on_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_service_enrollment"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_service_enrollment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_service_enrollment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."pause_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."pause_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."pause_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reactivate_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reactivate_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reactivate_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."regenerate_broker_api_key"("account_number" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."regenerate_broker_api_key"("account_number" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regenerate_broker_api_key"("account_number" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regenerate_broker_api_key"("account_number" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_service_agreement"("p_agreement_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_services_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_services_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_services_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_notifications" TO "anon";
GRANT ALL ON TABLE "public"."admin_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."billing_customers" TO "anon";
GRANT ALL ON TABLE "public"."billing_customers" TO "authenticated";
GRANT ALL ON TABLE "public"."billing_customers" TO "service_role";



GRANT ALL ON TABLE "public"."broker_accounts" TO "anon";
GRANT ALL ON TABLE "public"."broker_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."broker_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."mt5_billing_reports" TO "anon";
GRANT ALL ON TABLE "public"."mt5_billing_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."mt5_billing_reports" TO "service_role";



GRANT ALL ON TABLE "public"."service_agreements" TO "anon";
GRANT ALL ON TABLE "public"."service_agreements" TO "authenticated";
GRANT ALL ON TABLE "public"."service_agreements" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."suspension_reasons" TO "anon";
GRANT ALL ON TABLE "public"."suspension_reasons" TO "authenticated";
GRANT ALL ON TABLE "public"."suspension_reasons" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON TABLE "public"."verification_codes" TO "anon";
GRANT ALL ON TABLE "public"."verification_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."verification_codes" TO "service_role";



GRANT ALL ON TABLE "public"."vps_instances" TO "anon";
GRANT ALL ON TABLE "public"."vps_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."vps_instances" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

alter table "public"."tickets" drop constraint "tickets_priority_check";

alter table "public"."tickets" drop constraint "tickets_status_check";

alter table "public"."tickets" add constraint "tickets_priority_check" CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))) not valid;

alter table "public"."tickets" validate constraint "tickets_priority_check";

alter table "public"."tickets" add constraint "tickets_status_check" CHECK (((status)::text = ANY ((ARRAY['todo'::character varying, 'active'::character varying, 'complete'::character varying])::text[]))) not valid;

alter table "public"."tickets" validate constraint "tickets_status_check";


