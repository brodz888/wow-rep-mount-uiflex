# Roadmap

## Phase 0 — Foundation ✅
- [x] Repo scaffold, folder structure, docs
- [x] Install dependencies, confirm dev server runs
- [x] Create Battle.net developer client (ID + secret), add to `.env.local`
- [x] Encode color tokens + class-color lookup table (`lib/classColors.ts`)

## Phase 1 — Data layer ✅
- [x] `lib/blizzard.ts` — client-credentials token fetch/cache, typed
      helpers for character summary + reputations endpoints
- [x] `app/api/character/route.ts` — character summary proxy (name, class,
      realm, avatar)
- [x] `app/api/reputations/route.ts` — reputations proxy, cross-references
      standings against dataset, returns `{ available, almostThere }`
- [x] `data/reputation-mounts.json` — initial seed dataset (4 factions,
      enough to validate both buckets)
- [x] `lib/reputations.ts` — pure cross-reference function:
      standings + dataset → `{ available, almostThere }`
- [x] `lib/types.ts` — shared TypeScript types (Mount, FactionEntry,
      ReputationStanding, MountResults)
- [ ] Verify warband reputation behavior — deferred, test in Phase 3

## Phase 2 — Core UI ✅
- [x] Root layout with fonts (Inter + Barlow) + global styles
- [x] `tailwind.config.js` — custom color tokens + font variables registered
- [x] `next.config.js` — Blizzard image domain whitelisted
- [x] `LookupForm` component — character / realm / region inputs,
      submits → URL query params (`/?character=&realm=&region=`)
- [x] `HeroCard` component — name, class, realm, race, avatar with
      class-color ambient glow
- [x] `ReputationMountGrid` component — two sections (Available Now /
      Almost There), full mount cards with faction, cost, vendor, zone
- [x] `page.tsx` — reads URL query params (Next.js 15 async searchParams),
      fetches all data server-side in parallel, renders form or results

## Phase 3 — The "flex" pass (next)
- [ ] Framer Motion animations — form fade-out, results fade/slide in,
      mount card stagger entrance
- [ ] Polish HeroCard — make class-color glow more impactful
- [ ] Polish mount cards — hover states, spacing rhythm, border refinement
- [ ] "Search again" button on results page
- [ ] Standing tier colors on section headers
- [ ] Typography and spacing pass
- [ ] URL-shareable results already implemented via query params ✅

## Phase 4 — Ship
- [ ] Accessibility pass (contrast, reduced-motion, keyboard nav)
- [ ] Performance pass (image optimization, Lighthouse check)
- [ ] Deploy to Vercel, set production env vars
- [ ] Custom domain (if applicable)

## Not in scope (for now)
- Battle.net OAuth login / "already owned" mount filtering (clear upgrade
  path exists — see `docs/MOUNT-PLANNER.md`)
- Boss-drop, currency-vendor, rare-spawn, or other mount acquisition types
- Live-scraping Wowhead or any third-party site
- Database / persistent storage (static JSON dataset is sufficient for v1)
- Analytics/tracking

## Known issues / deferred
- `blizzard.ts` helper return types are currently `any` — tighten with
  proper response types before Phase 4
- `data/reputation-mounts.json` is a minimal seed (4 factions) — expand
  before shipping
- Warband reputation behavior unverified — the `/reputations` endpoint
  may or may not reflect warband-shared standings

---
Revisit and reorder freely — this is a plan, not a contract.
