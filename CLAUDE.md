# Madarasi Studio — Claude Code project guide

This file is read automatically by Claude Code at the start of every session
in this repo. It exists so you don't have to re-explain the project's
history, conventions, and known gotchas every time.

## What this is

Madarasi Studio (**www.madarasistudio.com**) is a personalised photobook,
journal, diary, planner, and notebook e-commerce site with a Chennai/Madras
cultural theme, expanding into a broader "memories, everywhere" catalog
(occasions, places, memories). Products are named after Chennai landmarks
and cultural touchstones — Marina Mornings, Mylapore Memories, Filter Kaapi
Rituals, etc.

The owner is **not a developer**. They've been building this by pasting
terminal commands from a chat assistant. Explain things in plain language,
give complete self-contained commands, and confirm before anything
destructive (force-push, deleting env vars, deleting storage, dropping
data).

## Brand identity

- Tagline / hero headline: **"Your precious memories, bound in paper"**
- Palette (bright pastel, not dark): ivory `#F8F5EC`, olive `#5C6B3E`, pine
  `#3B4229`, cloud `#FFFFFF`, mist `#DBD7C9`, rust `#A6553D`, marigold
  `#E2A93D`, sage `#8FA876`
- No stock photography — visuals are hand-drawn SVG icons
  (`src/components/Icons.tsx`) plus Tamil cultural motifs (kolam patterns,
  filter-coffee davara) used as recurring accents
  (`src/components/CulturalAccents.tsx`)
- Logo: `public/logo-badge.png` — a vintage circular stamp reading "MADARASI
  STUDIO — YOUR PRECIOUS MOMENTS BOUND IN PAPER" with an "MS" monogram. Used
  in the hero section.
- AI/gift-finder assistant is branded **"Ask your Madarasi!"**

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- NextAuth v4 — Google, Apple, email magic link, phone OTP (Credentials
  provider)
- Prisma ORM + PostgreSQL
- Vercel Blob (public store) for customer photo uploads
- Deployed on Vercel, built and pushed via GitHub

## Repo & deployment

- GitHub: `github.com/madarasistudioo-stack/madarasistudio-webpage` (public
  repo, `main` branch, auto-deploys to Vercel on push). Moved here in Sept
  2026 as a fork of the old `github.com/cxentric/madarasistudio`, which is
  kept as a read-only backup (git remote `old-origin`). The local Mac pushes
  as GitHub user **`cxentric-guy`** (a collaborator on the new repo), which
  is a different account from `cxentric`, so don't mix the two up.
- Hosting: **Cloudflare Workers (free plan)** via OpenNext (`@opennextjs/cloudflare`),
  connected to GitHub through Workers Builds; build command `npm run cf-build`
  (runs `prisma db push` then the OpenNext build), deploy `npx opennextjs-cloudflare deploy`.
  Config: `wrangler.jsonc`, `open-next.config.ts`. DNS for madarasistudio.com is on
  Cloudflare (moved from GoDaddy in Oct 2026; domain still registered at GoDaddy).
- Moved off Vercel in Oct 2026: the Hobby plan paused the site after exceeding
  Fast Origin Transfer (18 GB / 10 GB) and Active CPU, caused by uncached,
  server-rendered shop pages being crawled through endless filter URLs.
  **Keep shop pages static** (filters run in the browser), keep `robots.ts`
  blocking `/*?`, and don't reintroduce per-request rendering for public pages.
  Vercel's Hobby plan is also non-commercial only.
- Pages are pre-built per deploy (static-assets incremental cache, no ISR).
  Admin inventory edits save to the DB immediately (checkout uses them) and
  reach the shop pages via Admin → Inventory → **Publish to website**, which
  POSTs the Cloudflare deploy hook in `DEPLOY_HOOK_URL`.
- Free-plan limits to respect: Worker ≤ 3 MB gzipped (currently ~1.9 MB),
  ~10 ms CPU per request, KV 1 GB / 1,000 writes a day.
- Customer photos: Cloudflare KV namespace bound as `PHOTOS` (resized to
  2400px in the browser before upload), served from `/api/photo/...`.
- Email: Resend HTTP API (`src/lib/mailer.ts`, key in `EMAIL_SERVER_PASSWORD`
  or `RESEND_API_KEY`) — Workers can't do SMTP.
- Database: Neon Postgres via Prisma 6 with `@prisma/adapter-neon` and the
  Rust-free client (`engineType = "client"`).
- **Local copy lives at `~/Projects/madarasi-studio`** — NOT on the Desktop,
  which is iCloud-synced (iCloud filled up and created `node_modules 2`
  conflict copies). Never put the project or `node_modules` back under
  Desktop/Documents.

## Cost consciousness — important

**Avoid live LLM/API calls where a local or rule-based alternative works.**
The site previously called the Anthropic API directly from the "Ask your
Madarasi!" assistant and was deliberately switched off that to avoid token
costs on every visitor interaction. The current assistant is fully local:

- `src/lib/assistantReplies.ts` — regex/pattern-matched free-text replies
- `src/lib/giftFinder.ts` — guided recipient → occasion → budget button flow
  with a scoring function (`findGifts`) and an FAQ menu
- No `ANTHROPIC_API_KEY` is required for the assistant to work. Don't
  reintroduce a live API dependency for it unless explicitly asked.

## Key source files

| File | Purpose |
|---|---|
| `src/lib/products.ts` | Product catalog (10 Chennai items). `Product` type carries both legacy tags (`occasions`, `recipients` — lowercase strings) and newer taxonomy fields (`primaryCollection`, `places`, `memoryTypes`, `personalisation`, `style`) — **most products don't have the new fields populated yet**, only the legacy ones. |
| `src/lib/taxonomy.ts` | Canonical lists: `COLLECTIONS`, `RECIPIENTS`, `OCCASIONS` (20), `PLACES` (20), `MEMORIES`/`MEMORY_TYPES` (20), `PRICE_RANGES`, `PERSONALISATION_OPTIONS`, `STYLES`, `SIZES` (Small 6"×6" / Medium 8"×5" / Large 11"×6"), `PAGE_COUNTS` (30/60/90 pages with price deltas). |
| `src/lib/quotes.ts` | `QUOTE_BANK` — predefined personalisation quote suggestions keyed by `Collection`. |
| `src/lib/giftFinder.ts` | Guided gift-finder button flow + FAQ data. |
| `src/lib/assistantReplies.ts` | Free-text fallback replies for the chat widget (rule-based, zero API cost). |
| `src/lib/utils.ts` | `formatRupees()`, `cn()`, `slugify()`. |
| `src/components/Icons.tsx` | Hand-drawn SVG icon library (`ICONS` record, `IconName` type) — used everywhere instead of stock photos. |
| `src/components/CulturalAccents.tsx` | Fixed-position faint kolam/davara background watermarks, added in `layout.tsx`. |
| `src/components/TemplateCard.tsx` | Showcase card used on the homepage for occasion/place/memory previews. |
| `src/components/PhotoTemplatePicker.tsx` | Photo upload grid with layout templates (`grid`/`hero`/`strip`, chosen via `layoutForCollection()`). Uploads go through `/api/upload` to Vercel Blob. Google Drive button is currently a placeholder `alert()` — needs a real Google Picker API credential. iCloud works automatically via the native macOS/iOS file picker, no extra code needed. |
| `src/components/SizePicker.tsx`, `PageCountPicker.tsx` | Size / page-count selectors with price deltas. |
| `src/app/api/upload/route.ts` | Vercel Blob upload endpoint (validates image type, 15MB max). |
| `src/app/product/[slug]/page.tsx` | Main product configurator page (colors, size, page count, photo picker, personalisation text + quote suggestions, quantity, add-to-bag). |
| `src/app/collections/[type]/[value]/page.tsx` | Dedicated landing page per occasion/place/memory (`/collections/occasion/birthday`, etc.). Occasion pages show real filtered products via legacy tags; Place/Memory pages currently say "coming soon" until real products carry those tags — **intentionally not faked**. Budget/Personalisation/Style show as filter chips here, not on the homepage. |
| `src/app/page.tsx` | Homepage — hero, category tiles, three showcase grids (occasion/place/memory, 4 cards each), assistant section, testimonials. The old "Made to be personalised" product-grid section was removed. |
| `src/components/Hero.tsx` | Hero copy + `logo-badge.png` image. |

## Known deployment gotchas (already solved once — don't rediscover)

1. **nodemailer v6/v7 peer conflict with next-auth** → fixed by `.npmrc`
   with `legacy-peer-deps=true`. Don't remove that file.
2. **"Event handlers cannot be passed to Client Component props"** → any
   component with an event handler or hook needs `"use client";` as the
   literal first line of the file (bit us once on `Footer.tsx`).
3. **`TypeError: Invalid URL` during static generation** → `NEXTAUTH_URL`
   and `NEXTAUTH_SECRET` must be set in Vercel for Production *and*
   Preview, not just Development.
4. **Vercel dashboard "no environment created" bug** when adding env vars
   via the web UI → use the CLI instead: `npx vercel env add VAR_NAME
   <environment>`.
5. **"Hobby plan does not support collaboration" deploy block** → happened
   when the repo was private; making it public resolved it.
6. **The most important lesson**: *a green Vercel build does not mean the
   live site actually changed.* If a file edit silently fails to save
   before `git commit`, the build will succeed and deploy cleanly — just
   with the old content. **Always verify a distinctive string is actually
   present in the file (e.g. `grep -c "some new text" path/to/file`)
   before running `git add`/`commit`/`push`.** This has bitten us twice.
7. `ESLint must be installed in order to run during builds` shows as a
   warning in build logs (harmless, build still succeeds) — not an error
   to chase.

## Working conventions

- Prefer editing files directly and running `npm run build` locally
  before committing, rather than pushing and waiting on a Vercel build to
  find out something broke.
- The owner previously had to paste `cat > file <<'EOF' ... EOF` heredocs
  because manual editing in `nano`/`pico` kept producing garbled files.
  That workaround was needed for a copy-paste chat workflow — since you can
  edit files directly here, it no longer applies, but the underlying
  lesson (verify before committing) still does.
- Confirm before: force-push, deleting environment variables, deleting
  Vercel Blob storage, or any destructive database operation.
- Don't reintroduce a live LLM API call for the assistant without asking
  first (see "Cost consciousness" above).

## Open items / not yet done

1. **Sub-theme filters** — whether each collection's dedicated page should
   show sub-theme options (e.g. For Her / For Him / For Mom / For Dad under
   Birthday; 1st / 5th / 10th / 25th Anniversary; Bride / Groom / Couple
   under Wedding) has been asked but not yet answered by the owner.
2. **Real product catalog expansion** — new destination-themed products
   (Goa, Kerala, Europe, etc.) plus reworked versions of existing Chennai
   products, needed to populate `primaryCollection`, `places`,
   `memoryTypes`, `personalisation`, `style` on real products so Place/
   Memory collection pages show real matches instead of "coming soon".
3. **Google Drive photo upload** is a non-functional placeholder pending a
   Google Cloud Picker API credential.
4. **Per-page (not just per-cover) photo layout editor** for the 30/60/90
   page books — explicitly scoped as a separate future project.
5. `README.md` still describes the old `ANTHROPIC_API_KEY`-based assistant
   setup and doesn't mention the taxonomy/collections system, photo
   upload/Blob storage, or size/page-count options yet — worth a refresh.
