# Roadmap

## Phase 0 — Foundation (this commit)
- [x] Repo scaffold, folder structure, docs
- [ ] Install dependencies, confirm dev server runs
- [ ] Create Battle.net developer client (ID + secret), add to `.env.local`
      — see `docs/API.md` (client-credentials only, no redirect URI needed)
- [ ] Encode color tokens + class-color lookup table (`lib/classColors.ts`)

## Phase 1 — Data layer
- [ ] `lib/blizzard.ts` — client-credentials token fetch/cache, typed
      helpers for character summary + reputations endpoints
- [ ] `app/api/character/route.ts` — character summary proxy (name, class,
      realm, avatar)
- [ ] `app/api/reputations/route.ts` — reputations proxy with server-side
      cache (`revalidate: 300`)
- [ ] `data/reputation-mounts.json` — initial hand-curated dataset of
      faction → mount vendor entries (start with current-expansion factions,
      expand from there) — see `docs/MOUNT-PLANNER.md`
- [ ] `lib/reputations.ts` — pure cross-reference function:
      standings + dataset → `{ available, almostThere }`
- [ ] Verify warband reputation behavior: confirm the `/reputations`
      endpoint reflects warband-shared standings, not just character-level

## Phase 2 — Core UI
- [ ] Root layout with fonts + global styles
- [ ] `LookupForm` component — character name / realm / region inputs,
      submit → navigates to results (or updates state)
- [ ] `HeroCard` component — character name, class, realm, avatar with
      class-color ambient glow
- [ ] `ReputationMountGrid` component — two sections: "Available now"
      (Exalted) and "Almost there" (Revered), mount cards with faction
      name, mount name, cost, vendor location

## Phase 3 — The "flex" pass
- [ ] Class-color ambient glow on hero card
- [ ] Standing tier colors on faction/mount cards (mirror in-game rep bar
      colors)
- [ ] Micro-interactions: hover states, result load transition
- [ ] Polish typography and spacing rhythm
- [ ] URL-shareable results
      (`/?character=thrall&realm=area-52&region=us`) so lookups are
      linkable

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

---
Revisit and reorder freely — this is a plan, not a contract.
