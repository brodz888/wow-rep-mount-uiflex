# Reputation Mount Lookup

## What it does
1. User enters a character name, realm, and region
2. App fetches the character's full reputation standings from the
   Blizzard Profile API (public, no login)
3. App cross-references those standings against `data/reputation-mounts.json`
   — a curated map of factions → mounts they sell at Exalted
4. Results are displayed in two groups:
   - **Available now** — Exalted with the faction; mount is purchasable today
   - **Almost there** — Revered with the faction; one tier away

## The cross-reference logic (`lib/reputations.ts`)
Pure function, no external calls:
```
input:  character's reputation array + reputation-mounts dataset
output: { available: Mount[], almostThere: Mount[] }
```

Steps:
1. Build a map of `factionId → standing` from the API response
2. For each entry in the dataset, look up the character's standing with
   that faction
3. Bucket into `available` (Exalted) or `almostThere` (Revered)
4. Everything else is omitted from results

## The dataset (`data/reputation-mounts.json`)

Hand-curated. Each entry maps a faction to one or more mounts it sells
at Exalted standing.

### Schema
```json
[
  {
    "factionId": 2507,
    "factionName": "Valdrakken Accord",
    "mounts": [
      {
        "mountId": 1657,
        "name": "Renewed Proto-Drake",
        "cost": "5,000g",
        "vendorName": "Mythressa",
        "vendorZone": "Valdrakken"
      }
    ]
  }
]
```

Fields per mount entry:

| Field | Description |
|---|---|
| `mountId` | Blizzard's spell/mount ID (for deduplication + future use) |
| `name` | Display name |
| `cost` | Gold cost as a string (e.g. `"5,000g"`) |
| `vendorName` | NPC name, for reference |
| `vendorZone` | Zone/city where the vendor is found |

The dataset only covers `reputation_vendor` mounts — factions that sell
a mount directly at Exalted. It does not attempt to cover boss drops,
currency vendors, rare spawns, or other acquisition methods. That scope
keeps the dataset small, accurate, and easy to maintain by hand.

## Maintaining the dataset
- Add new entries when a patch or expansion introduces a new faction with
  a mount vendor
- Verify faction IDs against the Blizzard Game Data API:
  `GET /data/wow/reputation-faction/{factionId}?namespace=static-{region}`
- Mount IDs can be confirmed via Wowhead or the item Game Data API
- The file is static — no build step, no script. Edit it directly.

## Known limitation — "already owned" filtering
Without user OAuth login, the app cannot check whether the character
already owns a given mount. The results show all purchasable mounts based
on standing, including ones the character may already have collected.

This is acceptable for v1. A future upgrade path:
- Add an optional "Sign in with Battle.net" flow
- Use `/profile/user/wow/collections/mounts` to get owned mounts
- Filter them out of the results (or mark them as "already collected")

## Open questions
- Should "almost there" (Revered) be shown by default or behind a toggle?
- Should results be URL-shareable
  (e.g. `/?character=thrall&realm=area-52&region=us`)?
- Worth showing progress bars for Revered factions (raw value toward
  Exalted threshold) to give a sense of how close they actually are?
- As the dataset grows, does it stay a flat JSON file or move into the
  database? A JSON file is fine up to a few hundred entries.
