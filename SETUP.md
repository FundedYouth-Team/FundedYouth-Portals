# Setup Guide

This monorepo contains three independent applications that deploy to separate subdomains:

| App | Folder | Domain |
|-----|--------|--------|
| Public Site | `public-site/` | `yourdomain.com` |
| User Portal | `user-portal/` | `user.yourdomain.com` |
| Admin Portal | `admin-portal/` | `admin.yourdomain.com` |

---

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A Cloudflare account (domain managed here)
- A Supabase account
- A Resend account (for transactional emails)

---

## 1. Supabase Setup

### Create a New Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Enter a project name and database password
4. Select a region close to your users
5. Click **Create new project**

### Get Your API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values (you'll need them for Cloudflare):
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Database Schema

Run the SQL migrations in `supabase/migrations/` or use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Authentication Setup

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider (enabled by default)
3. Configure any additional providers as needed (Google, GitHub, etc.)

### URL Configuration

Go to **Authentication** → **URL Configuration** and set the following:

**Site URL:**
```
https://user.usasoftwareleasing.com
```

> The Site URL is set to the user portal (not the root domain) because that's where authentication happens. When Supabase sends confirmation or password reset emails, the links redirect to this URL. The public site has no auth functionality.

**Redirect URLs:**

Add all URLs where users can be redirected after authentication:

| URL | Purpose |
|-----|---------|
| `https://user.usasoftwareleasing.com/**` | User portal auth redirects |
| `https://admin.usasoftwareleasing.com/**` | Admin portal auth redirects |
| `http://localhost:5173/**` | Local dev - public site |
| `http://localhost:5174/**` | Local dev - user portal |
| `http://localhost:5175/**` | Local dev - admin portal |

The `/**` wildcard allows any path on that domain.

### Row Level Security (RLS)

Ensure RLS policies are set up for your tables. Check `supabase/migrations/` for existing policies.

### Edge Function Secrets

Go to **Project Settings** → **Edge Functions** and add these secrets:

| Secret | Value | Used By |
|--------|-------|---------|
| `FRONTEND_URL` | `https://user.usasoftwareleasing.com` | Password reset redirect URL |
| `RESEND_API_KEY` | Your Resend API key (`re_...`) | Sending emails directly via Resend |
| `EMAIL_FROM` | `no-reply@usasoftwareleasing.com` | Sender address for admin emails |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (`sk_...`) | Stripe API operations |

These secrets are used by Edge Functions for:
- `admin-reset-password` - Sends password reset emails
- `admin-change-user-email` - Sends email change confirmations
- `admin-send-verification-code` - Sends 2FA codes for sensitive operations
- `admin-list-users` - Lists users with profile data for admin portal

### Deploy Edge Functions

Deploy all Edge Functions to Supabase:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy admin-reset-password
supabase functions deploy admin-change-user-email
supabase functions deploy admin-send-verification-code
supabase functions deploy admin-list-users
supabase functions deploy admin-get-user-metadata
supabase functions deploy admin-suspend-service
supabase functions deploy stripe-admin-get-invoices
```

> **Note:** Edge Functions must be redeployed after any code changes.

### Edge Function Behaviors

| Function | Purpose |
|----------|---------|
| `admin-list-users` | Lists all users from `auth.users` with profile data for the Users table |
| `admin-get-user-metadata` | Fetches user metadata (name, phone, email, created_at) from `auth.users` |
| `admin-reset-password` | Sends password reset emails via Resend |
| `admin-change-user-email` | Validates identity and changes user email across auth, billing, and Stripe |
| `admin-send-verification-code` | Sends 2FA codes for step-up authentication on sensitive operations |
| `admin-suspend-service` | Suspends/unsuspends user service agreements |
| `stripe-admin-get-invoices` | Fetches invoice history from Stripe for a customer |
| `mt5-broker-api` | Provides MT5 broker account operations API |

**Important: New User Visibility**

When a new user signs up and confirms their email, they exist in `auth.users` but may not yet have a record in the `billing_customers` table. The admin portal handles this gracefully:

- **Users Table**: Shows all users from `auth.users` via `admin-list-users`, regardless of billing status
- **User Details Page**: Falls back to `admin-get-user-metadata` when no billing record exists

This means admins can view newly registered users immediately, even before they complete their profile or billing setup. The User Details page will display:
- Basic account info (email, user ID, member since)
- "Pending" profile status (until firstName, lastName, and phone are added)
- "No Billing" status (until Stripe customer is created)
- Empty sections for broker accounts, VPS, service agreements, and invoices

---

## 2. Cloudflare Pages Setup

You'll create **three separate Cloudflare Pages projects**, one for each app.

### Create a Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** > **Create application** > **Pages**
4. Connect your GitHub repository

### Project Configuration

#### Public Site (`yourdomain.com`)

| Setting | Value |
|---------|-------|
| **Project name** | `your-public-site` |
| **Production branch** | `main` |
| **Root directory** | `public-site` |
| **Build command** | `pnpm install && pnpm build` |
| **Build output directory** | `dist` |

**Environment Variables:**

| Variable | Value |
|----------|-------|
| `VITE_USER_PORTAL_URL` | `https://user.yourdomain.com` |

---

#### User Portal (`user.yourdomain.com`)

| Setting | Value |
|---------|-------|
| **Project name** | `your-user-portal` |
| **Production branch** | `main` |
| **Root directory** | `user-portal` |
| **Build command** | `pnpm install && pnpm build` |
| **Build output directory** | `dist` |

**Environment Variables:**

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `VITE_PUBLIC_SITE_URL` | `https://yourdomain.com` |

---

#### Admin Portal (`admin.yourdomain.com`)

| Setting | Value |
|---------|-------|
| **Project name** | `your-admin-portal` |
| **Production branch** | `main` |
| **Root directory** | `admin-portal` |
| **Build command** | `pnpm install && pnpm build` |
| **Build output directory** | `dist` |

**Environment Variables:**

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |

---

### Custom Domains

For each Cloudflare Pages project, add a custom domain:

| Pages Project | Custom Domain to Add |
|---------------|---------------------|
| `usoftlease-public` | `usasoftwareleasing.com` |
| `usoftlease-public` | `www.usasoftwareleasing.com` |
| `usoftlease-user` | `user.usasoftwareleasing.com` |
| `usoftlease-admin` | `admin.usasoftwareleasing.com` |

**Steps:**

1. Go to **Workers & Pages** in Cloudflare dashboard
2. Click on your project (e.g., `usoftlease-public`)
3. Go to the **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter the domain (without `https://`):
   - For public site: `usasoftwareleasing.com` AND `www.usasoftwareleasing.com`
   - For user portal: `user.usasoftwareleasing.com`
   - For admin portal: `admin.usasoftwareleasing.com`
6. Click **Continue** → **Activate domain**

Since the domain is managed by Cloudflare, DNS records are added automatically. No manual DNS configuration needed.

### WWW Subdomain Configuration

The `www` subdomain must be configured for the public site to work with both `usasoftwareleasing.com` and `www.usasoftwareleasing.com`.

**DNS Records (Cloudflare DNS):**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` (root) | `usoftlease-public.pages.dev` | Proxied |
| CNAME | `www` | `usoftlease-public.pages.dev` | Proxied |
| CNAME | `user` | `usoftlease-user.pages.dev` | Proxied |
| CNAME | `admin` | `usoftlease-admin.pages.dev` | Proxied |

> **Important:** The `www` CNAME must point to `usoftlease-public.pages.dev` (the same as the root domain). If it points to a different or non-existent Pages project, you will see Cloudflare Error 1014 (CNAME Cross-User Banned).

### Environment Variables Summary

After setting up custom domains, configure environment variables for each project:

| Pages Project | Variable | Value |
|---------------|----------|-------|
| `usoftlease-public` | `VITE_USER_PORTAL_URL` | `https://user.usasoftwareleasing.com` |
| `usoftlease-user` | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `usoftlease-user` | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `usoftlease-user` | `VITE_PUBLIC_SITE_URL` | `https://usasoftwareleasing.com` |
| `usoftlease-admin` | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `usoftlease-admin` | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |

To add environment variables:
1. Go to your Pages project → **Settings** → **Environment variables**
2. Click **Add variable**
3. Add for both **Production** and **Preview** environments

---

## 3. Email Setup (Resend + Cloudflare)

This setup enables:
- **Sending** transactional emails (password resets, confirmations) via Resend
- **Receiving** emails (forwarding to your inbox) via Cloudflare Email Routing

### Prerequisites

- A [Resend](https://resend.com) account (free tier: 3,000 emails/month)
- Domain managed by Cloudflare

### Step 1: Add Domain to Resend

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `usasoftwareleasing.com`
4. Choose **Sign into Cloudflare** (automatically adds DNS records)
5. Wait for verification (1-5 minutes)

### Step 2: Add DMARC Record

Add a DMARC record in Cloudflare DNS to improve email deliverability:

| Type | Name | Content |
|------|------|---------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:your-email@gmail.com` |

### Step 3: Set Up Cloudflare Email Routing

This forwards incoming emails to your personal inbox.

1. Go to Cloudflare → `usasoftwareleasing.com` → **Email** → **Email Routing**
2. Click **Enable Email Routing** (adds MX records automatically)
3. Go to **Routing Rules** → **Create address**
4. Add routing rules:

| Custom Address | Action | Destination |
|----------------|--------|-------------|
| `support` | Forward | `your-email@gmail.com` |
| `no-reply` | Drop | - |

5. Verify destination email if prompted

### Step 4: Connect Resend to Supabase

Use Resend's built-in Supabase integration for auth emails:

1. Go to Resend → **Settings** → **Integrations**
2. Click **Connect to Supabase**
3. Authorize and select your Supabase project
4. Configure:
   - **Sender email:** `no-reply@usasoftwareleasing.com`
   - **Sender name:** `USA Software Leasing`

This automatically configures SMTP in Supabase.

### Email Addresses Summary

| Address | Purpose |
|---------|---------|
| `no-reply@usasoftwareleasing.com` | Automated emails (password reset, confirmations) |
| `support@usasoftwareleasing.com` | Forwarded to your inbox for customer inquiries |

### Test Email Setup

1. **Test sending:** Sign up on user portal → confirmation email should arrive
2. **Test receiving:** Send email to `support@usasoftwareleasing.com` → should forward to Gmail

> **Note:** New domains may have emails go to spam initially. This improves as your domain builds reputation and users mark emails as "not spam".

---

## 4. Local Development

### Install Dependencies

```bash
# Install all dependencies
pnpm install:all

# Or install individually
cd public-site && pnpm install
cd ../user-portal && pnpm install
cd ../admin-portal && pnpm install
```

### Environment Variables

Create `.env` files in each app folder:

**`public-site/.env`**
```
VITE_USER_PORTAL_URL=http://localhost:5174
```

**`user-portal/.env`**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_PUBLIC_SITE_URL=http://localhost:5173
```

**`admin-portal/.env`**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Run Development Servers

```bash
# From root directory
pnpm dev:public    # http://localhost:5173
pnpm dev:user      # http://localhost:5174 (may vary)
pnpm dev:admin     # http://localhost:5175 (may vary)

# Or from each app folder
cd public-site && pnpm dev
cd user-portal && pnpm dev
cd admin-portal && pnpm dev
```

### Build

```bash
# Build individual apps
pnpm build:public
pnpm build:user
pnpm build:admin

# Or from each app folder
cd public-site && pnpm build
```

### Build Documentation (Public Site)

The public site includes a `/docs` page with user documentation. Documentation is written in markdown and compiled to TypeScript before building.

**Directory Structure:**
```
public-site/
├── docs-source/
│   ├── images/              # Shared images for all documents
│   ├── 01-welcome.md        # First document (order by filename)
│   └── 02-user-portal-guide.md
├── scripts/
│   └── build-docs.js        # Markdown → TypeScript compiler
└── src/data/
    └── docs.ts              # Auto-generated (do not edit directly)
```

**Build the documentation:**
```bash
cd public-site
pnpm docs:build
```

**Markdown Format:**
```markdown
---
id: unique-id
title: Document Title
description: Brief description shown in header
order: 1
---

## Section Title
Content here becomes a navigable section...

### Subsection
Renders as h4 heading...

![Screenshot](/docs-images/filename.png)
```

**GitHub-Style Alerts:**

The documentation system supports GitHub-style alert blockquotes for callouts:

```markdown
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!ERROR]
> Advises about risks or negative outcomes of certain actions.
```

**Custom Alert Labels:**

You can override the default label by adding text after the alert type:

```markdown
> [!TIP Check Your Spam]
> Check your SPAM folder - it might have ended up there.

> [!WARNING Data Loss]
> This action cannot be undone.
```

**Alert Color Scheme:**

| Type | Dark Mode | Light Mode |
|------|-----------|------------|
| NOTE | Blue background/border | Light blue bg, blue border |
| TIP | Green background/border | Light green bg, green border |
| IMPORTANT | Purple background/border | Light purple bg, purple border |
| WARNING | Yellow background/border | Light yellow bg, yellow border |
| ERROR | Red background/border | Light red bg, red border |

**Legacy Blockquotes:**

Simple blockquotes and `> **Warning:**` syntax are still supported for backwards compatibility and will render as NOTE (blue) or WARNING (yellow) alerts respectively.

**To add a new document:**
1. Create a new `.md` file in `docs-source/` (e.g., `03-new-guide.md`)
2. Add frontmatter with `id`, `title`, `description`, and `order`
3. Write content using `##` for main sections
4. Run `pnpm docs:build`
5. The sidebar and navigation update automatically

**Images:**
- Place images in `docs-source/images/`
- Reference as `![Alt text](/docs-images/filename.png)`
- Images are copied to `public/docs-images/` during build

### Type Checking

```bash
# Check all apps
pnpm typecheck

# Check individual apps
pnpm typecheck:public
pnpm typecheck:user
pnpm typecheck:admin
```

---

## 5. Project Structure

```
customer-portal/
├── public-site/           # Marketing/landing page
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   └── pages/
│   ├── public/
│   │   └── _redirects     # SPA routing for Cloudflare
│   ├── dist/              # Build output
│   └── package.json
│
├── user-portal/           # Customer dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/      # AuthContext
│   │   ├── layouts/
│   │   ├── lib/           # Supabase client
│   │   └── pages/
│   ├── public/
│   │   └── _redirects
│   ├── dist/
│   └── package.json
│
├── admin-portal/          # Admin management portal
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/      # AuthContext, StepUpAuthContext
│   │   ├── guards/        # Role-based access
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── services/
│   ├── public/
│   │   └── _redirects
│   ├── dist/
│   └── package.json
│
├── supabase/              # Database migrations
├── docs/                  # Documentation
├── package.json           # Root scripts
└── SETUP.md               # This file
```

---

## 6. Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 + Vite + TypeScript |
| Styling | TailwindCSS 3 |
| Routing | React Router v7 |
| Backend/Auth | Supabase |
| Hosting | Cloudflare Pages |
| Email | Resend + Cloudflare Email Routing |
| Testing | Vitest + Testing Library |

---

## 7. Troubleshooting

### Build Fails on Cloudflare

- Ensure the **Root directory** is set correctly for each project
- Check that environment variables are set in Cloudflare dashboard
- Verify `pnpm` is available (Cloudflare Pages supports it by default)

### SPA Routes Return 404

- Verify `_redirects` file exists in `public/` folder
- Check that it contains: `/*  /index.html  200`
- Ensure the file is being copied to `dist/` during build

### Authentication Not Working

- Verify Supabase URL and anon key are correct
- Check Supabase Authentication settings
- Ensure your domain is added to Supabase's allowed redirect URLs:
  - Go to **Authentication** > **URL Configuration**
  - Add your domains to **Redirect URLs**

### CORS Errors

- Add your domains to Supabase's allowed origins
- Check browser console for specific CORS messages

---

## 8. Security Notes

- Never commit `.env` files to version control
- The `anon` key is safe to expose in frontend code (it's designed for this)
- Use Row Level Security (RLS) in Supabase to protect data
- The admin portal uses role-based access control - ensure roles are properly configured

### Leaked Password Protection

Supabase can prevent users from signing up with passwords that have appeared in known data breaches (via HaveIBeenPwned.org).

**Location:** Supabase Dashboard → **Authentication** → **Attack Protection** → **Prevent use of leaked passwords**

> **Note:** This feature requires a **Supabase Pro plan**. On the free tier, this option will be disabled/unavailable.

---

## 9. Supabase Advisor

Supabase provides Security and Performance advisors in the Dashboard under **Database** → **Linter**. After running all migrations, you should see:

| Advisor | Expected Status |
|---------|-----------------|
| Security Errors | 0 |
| Security Warnings | 1 (Leaked Password Protection - requires Pro plan) |
| Performance Warnings | 0 |
| Performance Suggestions | ~20+ unused indexes (expected - see below) |

### Security Migrations

The following migrations address security advisor warnings:

| Migration | Purpose |
|-----------|---------|
| `20250101_fix_function_search_paths.sql` | Adds `SET search_path = ''` to all functions to prevent search path manipulation attacks |

### Performance Migrations

The following migrations address performance advisor warnings:

| Migration | Purpose |
|-----------|---------|
| `20250101_fix_rls_performance.sql` | Wraps `auth.uid()` in subqueries and consolidates multiple permissive RLS policies |
| `20250101_fix_services_policy.sql` | Splits `FOR ALL` policy into separate INSERT/UPDATE/DELETE to avoid SELECT overlap |
| `20250101_add_missing_fk_indexes.sql` | Adds indexes for foreign key columns |

### Why "Unused Index" Suggestions Can Be Ignored

After running all migrations, the Performance Advisor will show **INFO-level suggestions** for unused indexes. These are **expected and should be ignored**.

**Why they appear:**
- PostgreSQL tracks index usage statistics starting from zero
- New databases haven't had enough query traffic to use the indexes yet
- The suggestions will disappear naturally as your application gets real users

**What these indexes do:**

| Index Pattern | Used For |
|---------------|----------|
| `idx_audit_logs_*` | Filtering/searching audit logs in admin portal |
| `idx_mt5_billing_reports_*` | Querying billing reports by user, status, date |
| `idx_service_agreements_*` | Filtering agreements by status (active, suspended, etc.) |
| `idx_broker_accounts_*` | Looking up accounts by user or service agreement |
| `idx_verification_codes_*` | Validating 2FA codes during step-up authentication |
| `idx_admin_notifications_*` | Filtering admin notifications |

**Do NOT remove these indexes.** They are proactive performance optimizations. Removing them would cause slow queries once your application scales.
