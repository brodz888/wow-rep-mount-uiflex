import type { FactionEntry, ReputationStanding, MountResults } from "./types";

export function crossReferenceMounts(
  reputations: ReputationStanding[],
  dataset: FactionEntry[]
): MountResults {
  const standingMap = new Map(
    reputations.map((r) => [r.faction.id, { name: r.standing.name.toLowerCase(), tier: r.standing.tier }])
  );

  const available: MountResults["available"] = [];
  const almostThere: MountResults["almostThere"] = [];

  for (const faction of dataset) {
    const standing = standingMap.get(faction.factionId);
    if (!standing) continue;

    const enriched = faction.mounts.map((m) => ({ ...m, factionName: faction.factionName }));

    if (standing.name === "exalted") {
      available.push(...enriched);
    } else if (standing.name === "revered") {
      almostThere.push(...enriched.map((m) => ({ ...m, tier: standing.tier })));
    }
  }

  return { available, almostThere };
}
