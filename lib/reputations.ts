import type { FactionEntry, ReputationStanding, MountResults, EnrichedMount, CharacterContext } from "./types";

/** The classic ladder. Blizzard's `standing.tier` is the index into it (Hated = 0 … Exalted = 7). */
export const STANDARD_RANKS = ["Hated", "Hostile", "Unfriendly", "Neutral", "Friendly", "Honored", "Revered", "Exalted"];

/** Renown mounts this many levels (or fewer) short count as "almost there". */
export const RENOWN_ALMOST_THERE_LEVELS = 2;

type Standing = ReputationStanding["standing"];

/**
 * Index of the character's current rank in the faction's ladder.
 * Matches by name first: some ladders (e.g. Court of Night) reuse classic
 * names but start at tier 0, so raw tier numbers aren't comparable across
 * factions. Falls back to `tier` if the name is unrecognised.
 */
function rankIndex(ladder: string[], standing: Standing): number {
  const byName = ladder.findIndex((r) => r.toLowerCase() === standing.name.toLowerCase());
  if (byName !== -1) return byName;
  return Math.min(standing.tier ?? -1, ladder.length - 1);
}

function requiredIndex(ladder: string[], required: string | undefined): number {
  if (!required) return ladder.length - 1;
  const i = ladder.findIndex((r) => r.toLowerCase() === required.toLowerCase());
  return i === -1 ? ladder.length - 1 : i;
}

export function crossReferenceMounts(
  reputations: ReputationStanding[],
  dataset: FactionEntry[],
  { playerFaction, covenant, ownedMountIds = new Set() }: CharacterContext = {}
): MountResults {
  const standingMap = new Map(reputations.map((r) => [r.faction.id, r.standing]));

  const available: MountResults["available"] = [];
  const almostThere: MountResults["almostThere"] = [];

  for (const faction of dataset) {
    // Covenant renown isn't in the reputations list; it comes from the character summary.
    let standing: Standing | undefined;
    if (faction.covenantId !== undefined) {
      if (covenant?.covenantId === faction.covenantId) {
        standing = { name: `Renown ${covenant.renownLevel}`, renown_level: covenant.renownLevel };
      }
    } else if (faction.factionId !== null) {
      standing = standingMap.get(faction.factionId);
    }
    if (!standing) continue;

    const enriched = faction.mounts
      .map((m): EnrichedMount => ({
        ...m,
        faction: m.faction ?? faction.faction,
        factionName: faction.factionName,
        expansion: faction.expansion ?? "Other",
        owned: m.mountId !== null && ownedMountIds.has(m.mountId),
      }))
      .filter((m) => !playerFaction || !m.faction || m.faction === playerFaction);

    if (standing.renown_level !== undefined) {
      const level = standing.renown_level;
      for (const m of enriched) {
        const levelsToGo = (m.requiredRenown ?? 0) - level;
        if (levelsToGo <= 0) available.push(m);
        else if (levelsToGo <= RENOWN_ALMOST_THERE_LEVELS) almostThere.push({ ...m, kind: "renown", currentLevel: level, levelsToGo });
      }
      continue;
    }

    const ladder = faction.ranks ?? STANDARD_RANKS;
    const current = rankIndex(ladder, standing);
    for (const m of enriched) {
      const required = requiredIndex(ladder, m.requiredStanding);
      if (current >= required) available.push(m);
      else if (current === required - 1) almostThere.push({ ...m, kind: "standing", tier: current, tierCount: ladder.length });
    }
  }

  return { available, almostThere };
}
