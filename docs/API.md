# Blizzard Battle.net API — integration notes

## What this gets you
Two API families matter here:
- **Profile API** — data tied to a specific character: reputations,
  equipment, achievements, Mythic+ score, etc. All public — no user
  login required.
- **Game Data API** — reference data not tied to a player: faction info,
  item info, realms, class/spec data.

This app uses **client-credentials auth only**. No user OAuth flow.

## Auth — client credentials (app-level)

```
POST https://{region}.battle.net/oauth/token
  grant_type=client_credentials
  (client ID + secret as HTTP Basic auth)
→ { access_token, expires_in, ... }
```

The token is cached server-side and reused until it expires (~24h).
`lib/blizzard.ts` handles fetch + cache transparently — the rest of the
app just calls typed helpers and never thinks about tokens.

## Key endpoints

### Character summary
```
GET https://{region}.api.blizzard.com/profile/wow/character/{realm-slug}/{character-name}
  ?namespace=profile-{region}
  &locale=en_US
  Authorization: Bearer {access_token}
```
Returns name, class, level, realm, avatar media key, etc. This is what
populates the hero card.

### Character reputations
```
GET https://{region}.api.blizzard.com/profile/wow/character/{realm-slug}/{character-name}/reputations
  ?namespace=profile-{region}
  &locale=en_US
  Authorization: Bearer {access_token}
```
Returns an array of every faction the character has standing with:
```json
{
  "reputations": [
    {
      "faction": { "id": 2507, "name": "Valdrakken Accord" },
      "standing": {
        "raw": 20999,
        "value": 5999,
        "max": 6000,
        "tier": { "id": 6 },
        "name": "Exalted"
      }
    }
  ]
}
```
`standing.name` is the human-readable tier (Neutral / Friendly / Honored /
Revered / Exalted). `standing.raw` is the total accumulated value, useful
for computing progress toward the next tier.

**Warband reputations:** The War Within introduced account-wide "warband"
reputation that is shared across all characters. Based on available
evidence the character reputations endpoint reflects the effective standing
(warband or character, whichever is higher), but **verify this during
Phase 1 development** — it's the one behavioral assumption that needs a
real API call to confirm.

### Character media (avatar)
```
GET https://{region}.api.blizzard.com/profile/wow/character/{realm-slug}/{character-name}/character-media
  ?namespace=profile-{region}
  &locale=en_US
```
Returns asset URLs including the character's in-game portrait render.

## What the API can and can't tell us

| Data | Available? | How |
|---|---|---|
| Character reputations (all factions) | Yes | `/reputations` — public, client-credentials |
| Warband-shared reputation values | Likely yes (verify) | Same endpoint — game server appears to merge them |
| Which mounts a reputation vendor sells | **No** | No Blizzard endpoint for this — hand-curated dataset, see `docs/MOUNT-PLANNER.md` |
| Whether the character already owns a mount | **No (without OAuth)** | Collections API requires user login — out of scope for v1 |
| Character summary, gear, M+ score | Yes | Profile API, public |

The "already owns" gap is a known limitation of the no-login approach.
The app shows mounts that are *purchasable* based on standing — it can't
filter out ones already in the collection without OAuth. This is acceptable
for v1; a "Sign in to filter owned mounts" upgrade path exists if wanted later.

## Fetching conventions
- `{region}` is one of `us`, `eu`, `kr`, `tw`
- `{realm-slug}` and `{character-name}` are lowercase with hyphens,
  e.g. `area-52`, `thrall`
- The frontend never calls Blizzard directly — always through our own
  `/api/*` routes, which set cache headers and shape the response

## Rate limits
36,000 requests/hour, 100/sec per client. Fine for a personal site.
Cache server-side with Next.js fetch cache (`next: { revalidate: 300 }`)
so repeated lookups of the same character don't re-hit Blizzard.

## Where this lives in the repo
- `lib/blizzard.ts` — token fetch/cache + typed fetch helpers
- `app/api/character/route.ts` — character summary proxy
- `app/api/reputations/route.ts` — reputations proxy + cache

## Env vars needed
```
BLIZZARD_CLIENT_ID=...
BLIZZARD_CLIENT_SECRET=...
BLIZZARD_REGION=us
```
No `SESSION_SECRET` or `DATABASE_URL` needed — there's no login and no
persistent storage in v1.
