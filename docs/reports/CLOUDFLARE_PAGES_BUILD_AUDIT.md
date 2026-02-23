# Cloudflare Pages build audit (Next.js)

This report is based on the current project configuration and a scan of build/runtime requirements in the codebase. It’s intended to help you quickly pinpoint *why a Cloudflare Pages build fails* and what to change.

## Project snapshot (from repo)

- **Framework**: Next.js `15.1.7` (React `19.0.0`)
- **Cloudflare adapter**: `@cloudflare/next-on-pages` `1.13.16` (note: this project is deprecated/archived upstream; see “Migration note”)
- **Expected Node**: `>=18.18.0` (from `package.json` `engines.node`)
- **Configured Pages output**: `.vercel/output/static` (from `wrangler.json`)

## Cloudflare Pages settings that must match this repo

In Cloudflare Pages (Project → Settings → Builds & deployments):

- **Build command**: `npm run pages:build`
  - This runs `npx @cloudflare/next-on-pages` (as defined in `package.json`).
- **Build output directory**: `.vercel/output/static`
  - This matches `wrangler.json` (`pages_build_output_dir`).
- **Node.js version**: set **`NODE_VERSION` to `20`** (recommended) or at least **`18.18.0`**
  - If Cloudflare uses a lower Node (example: 18.17.x), installs/builds can fail due to the engines requirement and/or Next.js requirements.

If you’re deploying from a monorepo or non-root folder, ensure the **Root directory** in Pages points at the folder that contains `package.json` (this repo appears to expect `C:\aez\package.json` at project root).

## Most common Cloudflare Pages build-fail causes (ranked) + what to look for

### 1) Wrong build command / wrong output directory

**Symptom in logs**

- “No build output found”, “Output directory not found”, “Cannot find `.vercel/output/static`”, or Pages deploy succeeds but site is blank/404.

**Fix**

- Use **Build command** `npm run pages:build`
- Use **Output dir** `.vercel/output/static`

### 2) Node version mismatch (very common with Next 15)

**Symptom in logs**

- `Unsupported engine` / `The engine "node" is incompatible` / Next complaining about Node version.

**Fix**

- Set Pages env var **`NODE_VERSION=20`** (or `18.18.0+`).

### 3) Missing environment variables (works locally via `.env.local`, fails on Pages)

Cloudflare Pages **does not automatically use your local `.env.local`**. Anything needed at build/runtime must be set in Pages:

Project → Settings → Environment variables (set for **Production** and optionally **Preview**).

**Environment variable inventory referenced in code**

- **Secrets / internal auth**
  - `INTERNAL_API_SECRET`
  - `CRON_SECRET`
  - `REVALIDATION_TOKEN`
- **Public (bundled into client code, must be prefixed `NEXT_PUBLIC_`)**
  - `NEXT_PUBLIC_BASE_URL` (used by a server action as fallback)
  - `NEXT_PUBLIC_ALGOLIA_APP_ID`
  - `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- **Server-only**
  - `CLOUDINARY_API_SECRET`
  - `RESEND_API_KEY`
  - `EMAILJS_SERVICE_ID`
  - `EMAILJS_TEMPLATE_ID`
  - `EMAILJS_PUBLIC_KEY`
  - `EMAILJS_PRIVATE_KEY`
  - `GMAIL_USER_1`, `GMAIL_PASS_1` (present but current Edge mail path prefers HTTP providers)
  - `FB_PIXEL_ID`, `FB_ACCESS_TOKEN`
  - `DOCUMENT_SECRET_SALT`

**Symptom in logs**

- Build succeeds but runtime routes/actions return 403/500.
- Or build fails if some module throws during import when env vars are missing.

**Fix**

- Set the needed variables in Pages (Production/Preview as appropriate).
- For anything used by client components, ensure it is `NEXT_PUBLIC_*`.

### 4) Edge runtime incompatibilities (Node-only modules)

Your repo already indicates Edge migration work (example: `lib/firebase-admin.ts` is stubbed).

**Symptom in logs**

- `Module not found: Can't resolve 'fs'` / `'net'` / `'tls'` / “Node.js API used in Edge runtime”.

**Fix**

- Keep API routes that need Node APIs off Edge (remove `export const runtime = 'edge'` for those routes), or replace Node libraries with Fetch/HTTP-based providers.

## Migration note (important)

Cloudflare has deprecated/archived `next-on-pages`. Even if it works today, future Next.js upgrades can break unexpectedly. The longer-term path is to migrate to the **OpenNext Cloudflare adapter**.

## What I still need from your Cloudflare build log to give the exact “why it failed”

Paste **the first error** from the Cloudflare Pages build log (and ~30 lines above it). With that, I can map it to one of the categories above and tell you the exact single fix (command/output/node/env/code change).

