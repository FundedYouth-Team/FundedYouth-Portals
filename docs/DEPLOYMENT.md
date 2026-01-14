# Deployment Guide - Cloudflare Pages

This document explains how to deploy the Customer Portal and Admin Portal to Cloudflare Pages.

## Project Structure

After building, the `/dist` folder contains:

```
/dist
├── index.html              # Customer Portal entry
├── assets/                 # Customer Portal assets
├── admin/
│   ├── index.html          # Admin Portal entry
│   └── assets/             # Admin Portal assets
├── _redirects              # Cloudflare Pages SPA routing
├── favicon.svg
└── robots.txt
```

## Build Configuration

### Local Build

```bash
# Install dependencies for both portals
pnpm install:all

# Build both portals
pnpm build

# Or build individually
pnpm build:frontend
pnpm build:admin
```

### Build Output

- Customer Portal: `/dist/index.html` and `/dist/assets/`
- Admin Portal: `/dist/admin/index.html` and `/dist/admin/assets/`
- Redirects: `/dist/_redirects`

## Cloudflare Pages Configuration

### Dashboard Setup

1. Go to Cloudflare Dashboard → Pages
2. Create a new project or connect to your Git repository
3. Configure build settings:

| Setting | Value |
|---------|-------|
| **Framework preset** | None |
| **Build command** | `pnpm build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (repository root) |
| **Node.js version** | 18 or higher |

### Environment Variables

Set these in Cloudflare Pages → Settings → Environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

**Important**: Set these for both Production and Preview environments.

### Build Command Details

The root `pnpm build` command runs:
1. `pnpm build:frontend` - Builds customer portal to `/dist`
2. `pnpm build:admin` - Builds admin portal to `/dist/admin`
3. `pnpm build:redirects` - Copies `_redirects` to `/dist`

## SPA Routing (_redirects)

The `_redirects` file handles client-side routing:

```
# Admin portal SPA routing
/admin/*  /admin/index.html  200

# Customer portal SPA routing (catch-all)
/*  /index.html  200
```

**How it works:**
- Requests to `/admin/*` are served by `/admin/index.html`
- All other requests are served by `/index.html`
- Both apps handle their own client-side routing

## URLs After Deployment

| URL | Portal |
|-----|--------|
| `https://your-domain.pages.dev/` | Customer Portal |
| `https://your-domain.pages.dev/login` | Customer Login |
| `https://your-domain.pages.dev/dashboard` | Customer Dashboard |
| `https://your-domain.pages.dev/admin/` | Admin Portal |
| `https://your-domain.pages.dev/admin/login` | Admin Login |
| `https://your-domain.pages.dev/admin/customers` | Admin Customers |

## Troubleshooting

### Admin portal shows 404

Ensure the `_redirects` file exists in `/dist` after build. The build script automatically copies it.

### Environment variables not working

- Vite requires `VITE_` prefix for client-side variables
- Rebuild after changing environment variables
- Check both Production and Preview environments in Cloudflare

### Build fails

```bash
# Check TypeScript errors
pnpm typecheck

# Check linting errors
pnpm lint

# Build individually to isolate issues
pnpm build:frontend
pnpm build:admin
```

## CI/CD Integration

Cloudflare Pages automatically builds on:
- Push to main branch (Production)
- Push to other branches (Preview)

No additional CI configuration needed - just connect your repository.

## Security Considerations

1. **Never commit `.env` files** - Use Cloudflare environment variables
2. **Supabase anon key is public** - It's safe to expose, RLS handles security
3. **Admin routes are protected** - By React Router guards and Supabase RLS
4. **Role assignment requires Edge Function** - Cannot be bypassed client-side
