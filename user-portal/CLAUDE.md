# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at http://localhost:5173
pnpm build        # TypeScript check + production build
pnpm lint         # ESLint with zero warnings allowed
pnpm lint --fix   # Auto-fix lint issues
pnpm typecheck    # TypeScript check only
pnpm test         # Run tests in watch mode
pnpm test:ui      # Run tests with Vitest UI
```

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS 3
- **Auth/Backend**: Supabase (no Express server)
- **Routing**: React Router v7
- **Testing**: Vitest + Testing Library + happy-dom
- **Hosting Target**: Cloudflare Pages

## Architecture

### Routing Structure

Routes are defined in `src/components/App.tsx` using nested layout routes:

- `/` - Public homepage (PublicLayout)
- `/login`, `/signup` - Auth pages (AuthLayout)
- `/dashboard` - Protected route (DashboardLayout with AuthGuard)

### Layout System

Three layouts wrap pages via React Router's `<Outlet>`:

- **PublicLayout** - Nav bar with Home/Login/Sign Up links
- **AuthLayout** - Centered card for auth forms
- **DashboardLayout** - Sidebar + content area, wraps children in AuthGuard

### Authentication Flow

- `src/lib/supabaseClient.ts` - Supabase client (uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
- `src/contexts/AuthContext.tsx` - Provides `useAuth()` hook with user, session, signIn, signUp, signOut
- `src/components/AuthGuard.tsx` - Redirects unauthenticated users to `/login`

### Path Aliases

TypeScript baseUrl is `./src`, so imports use absolute paths from src:
```typescript
import { useAuth } from 'contexts/AuthContext'
import { HomePage } from 'pages/HomePage'
```

## Testing

Test files must be named `test.tsx` or `test.ts` (configured in vite.config.ts). Tests are co-located with components in the same directory.

Run a single test file:
```bash
pnpm test src/components/Avatar/test.tsx
```

## Environment Variables

Copy `.env.example` to `.env` and set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Constraints

- Scope limited to `frontend/` directory only
- Do not add Next.js or backend servers
- Do not change existing tooling (Vite, Tailwind, ESLint)
