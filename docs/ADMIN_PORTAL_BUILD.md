# ADMIN PORTAL BUILD INSTRUCTIONS (AUTHORITATIVE)

This document is the authoritative source of truth.
No deviations are allowed unless explicitly approved.

---

## GLOBAL RULES (NON-NEGOTIABLE)

- Do NOT modify /frontend unless explicitly instructed.
- Do NOT use Next.js.
- Do NOT introduce subdomains.
- Do NOT allow client-side writes to auth.users.app_metadata.
- Roles are: user, manager, admin.
- Only admin can assign or revoke roles.
- Manager can access /admin but cannot assign roles.
- Admin bootstrap is complete (Option A).
- Sensitive data requires step-up authentication every time.
- No hardcoded emails, no bypass logic.
- Use denial-by-default security.

If anything is unclear, STOP and ask.

---

## PROJECT CONTEXT

- /frontend is the existing customer portal (Vite + React).
- Create a new Vite + React admin portal at /admin.
- Both portals share the same Supabase project.
- Hosting: Cloudflare Pages.
- Output structure:
  - /dist/index.html (customer)
  - /dist/admin/index.html (admin)

---

## EXPECTED DIRECTORY STRUCTURE

/frontend (unchanged)
/admin
/src
/auth
/pages
/components
index.html
vite.config.ts
package.json
/dist
index.html
/admin
index.html
/_redirects



Do not create additional folders without explanation.

---

## PHASE 1 — ADMIN APP SCAFFOLD

1. Create a Vite + React + TypeScript app in /admin
2. Configure vite.config.ts:
   - base = "/admin/"
   - outDir = "../dist/admin"
3. Add React Router with basename "/admin"
4. Ensure direct navigation to /admin/* works

STOP and summarize after this phase.

---

## PHASE 2 — AUTHENTICATION & ROLE GUARDS

1. Integrate Supabase Auth
2. Read role from auth.users.app_metadata.role
3. Implement:
   - requireAdmin()
   - requireAdminOrManager()
4. Restrict admin portal access to:
   - admin
   - manager
5. Redirect unauthorized users to "/"

STOP and summarize after this phase.

---

## PHASE 3 — CUSTOMER ADMIN PAGES

### Customer List Page
- Searchable
- Paginated
- Click navigates to customer detail

### Customer Detail Page
Sections:
- Basic account info
- Billing address
- Invoices (paid/unpaid)
- Broker account (password masked)
- VPS assignment
- Options subscriptions (editable via 2FA)

Mock data acceptable initially.

STOP and summarize after this phase.

---

## PHASE 4 — ROLE MANAGEMENT (ADMIN ONLY)

1. Add role management UI visible only to admin
2. Managers must not see role controls
3. Create Supabase Edge Function stub:
   - Name: assign-role
   - Uses service role key
   - Verifies requester role === admin
4. Frontend must call this function
5. Frontend must never modify app_metadata directly

STOP and summarize after this phase.

---

## PHASE 5 — STEP-UP AUTHENTICATION (SENSITIVE DATA)

1. Implement step-up flow for:
   - Viewing broker passwords
   - Modifying options subscriptions
2. Require verification code per access
3. Password visibility revokes on:
   - Navigation
   - Refresh
   - Tab focus loss
   - Timeout
4. Stub SMS/email delivery with TODOs

STOP and summarize after this phase.

---

## PHASE 6 — AUDIT LOGGING

1. Define audit log schema
2. Log:
   - Role changes
   - Sensitive data access
   - Service modifications
3. Logs are admin-only

STOP and summarize after this phase.

---

## PHASE 7 — BUILD & DEPLOYMENT

1. Configure root build script
2. Output to /dist
3. Provide _redirects file
4. Explain Cloudflare Pages build configuration

STOP and summarize after this phase.

---

## FINAL RULE

Claude must follow phases sequentially.
No phase skipping.
No assumptions.
No security shortcuts.

