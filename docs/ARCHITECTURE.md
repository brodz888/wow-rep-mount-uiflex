# Architecture

## Purpose
A World of Warcraft companion app with one focused feature:

**Reputation Mount Lookup** — enter any character name, realm, and region.
The app fetches their full faction reputation standings and cross-references
them against a curated dataset of mounts sold by reputation vendors. The
result: a clean list of every mount they can purchase right now, plus which
ones they're close to unlocking (e.g. Revered → Exalted).

No login required. Everything runs on public Profile API data via
client-credentials auth.

## Stack
- **Framework:** Next.js (App Router) + React
- **Styling:** Tailwind CSS for layout/utility, with a small set of custom
  CSS variables for theme tokens (color, spacing, easing curves)
- **Animation:** Framer Motion for page/element transitions; CSS for
  micro-interactions
- **Fonts:** next/font for zero-layout-shift custom typography
- **Auth:** Client-credentials only — app-level token, no user login.
  The character reputations endpoint is public Profile API data.
- **Database:** Not needed for v1. The faction→mount dataset lives in
  `data/reputation-mounts.json` (a static, hand-curated file).
- **Data sources:** Blizzard Battle.net Profile API for live reputation
  data; a hand-curated JSON dataset mapping factions to their mount
  vendors — see `docs/API.md` and `docs/MOUNT-PLANNER.md`
- **Deployment target:** Vercel

## Auth model
Everything uses the **client-credentials** flow — the app authenticates
itself with a Blizzard client ID + secret, gets an app-level access token,
and uses that to call public Profile API endpoints. The character's owner
never needs to log in.

The character reputations endpoint
(`/profile/wow/character/{realm}/{name}/reputations`) is public data,
the same as gear or achievements. Warband-shared reputations appear to
be reflected here as well (the game server merges them), but this should
be verified during development.

## Design direction

**Subject:** your WoW character's reputation standing — the audience is
you, guildmates, or anyone curious what mounts they're sitting on without
realizing it. The page's job: answer "what can I buy right now?" in five
seconds.

**Why dark + high-contrast fits, specifically:** Azeroth's own UI language
(obsidian panels, glowing accents, ornate metal borders) is already
dark-chrome-plus-glow. We're borrowing that logic and executing it with
SaaS-dashboard restraint — no scrollwork borders, no torch-lit textures.

**Color:**
- `--bg-void: #0A0B0F` — near-black base, slightly blue rather than pure
  black (Azeroth-night, not generic dark-mode gray)
- `--surface-raised: #14161D` — card/panel surface, one step up from void
- `--accent-class: <driven by character class>` — the accent color is set
  dynamically from the looked-up character's class color (e.g. Death Knight
  red `#C41E3A`, Druid orange `#FF7C0A`, Priest white `#FFFFFF`, Shaman
  blue `#0070DE`). The whole palette reacts to whose page it is.
- `--accent-gold: #C8AA6E` — muted metallic gold, used sparingly for
  dividers/labels, nodding to WoW's own UI chrome
- Standing tier colors mirror the in-game reputation bar colors
  (Neutral/Friendly/Honored/Revered/Exalted) — structure that encodes
  real information, not decoration.

**Type:** a geometric, slightly angular display face for headings (numbers
and faction names should feel precise, HUD-like), paired with a clean
neutral sans for body text.

**Layout:** mobile-first stacked cards that reflow into a dashboard grid on
desktop. The lookup form is the entry point — prominent, centered, minimal.
Results appear below (or replace the form on mobile).

**Signature element:** the character hero card — name, class, realm — with
a soft ambient glow in the class accent color. Below it: the mount results
grid, grouped by "Available now" vs. "Almost there" (Revered).

## Folder structure
```
app/
  layout.tsx                   Root layout (fonts, metadata, providers)
  page.tsx                     Character lookup form + results
  api/character/route.ts       Fetches character summary (name, class, etc.)
  api/reputations/route.ts     Fetches character's full reputation list
components/
  ui/                          Small reusable presentational pieces
  sections/                    HeroCard, ReputationMountGrid, LookupForm
lib/
  blizzard.ts                  Client-credentials token fetch/cache + fetch helpers
  classColors.ts               Class-color lookup table
  reputations.ts               Cross-reference logic: standings → purchasable mounts
data/
  reputation-mounts.json       Curated faction → mount vendor dataset
public/
  images/                      Static assets
styles/                        Global CSS, theme tokens
docs/                          This planning material
```

## Design principles
1. **Restraint over density.** One clear question answered well.
2. **Motion with intent.** Animate to guide attention, not as decoration.
   Respect `prefers-reduced-motion`.
3. **One typographic voice.** Two font families max (display + body).
4. **Consistent spacing scale.** Tailwind's default scale everywhere —
   no one-off pixel values.
5. **Performance is part of the craft.** Cache Blizzard responses
   server-side; keep JS light.

## Open questions (fill in as decisions are made)
- Confirm whether the reputations endpoint reflects warband-shared
  standings or only character-level standings — test during Phase 1
- Should "almost there" (Revered) mounts be shown by default, or behind
  a toggle?
- Should results be shareable via URL (e.g. `/?character=arthas&realm=stormrage&region=us`)?
- One character lookup at a time, or a comparison view across multiple?
