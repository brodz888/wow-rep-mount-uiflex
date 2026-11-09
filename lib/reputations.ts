import type { FactionEntry, ReputationStanding, MountResults } from "./types";

export function crossReferenceMounts(
  reputations: ReputationStanding[],
  dataset: FactionEntry[]
): MountResults {
  const standingMap = new Map(
    reputations.map((r) => [r.faction.id, r.standing.name.toLowerCase()])
  );

  const available: MountResults["available"] = [];
  const almostThere: MountResults["almostThere"] = [];

  for (const faction of dataset) {
    const standing = standingMap.get(faction.factionId);
    if (!standing) continue;

    const enriched = faction.mounts.map((m) => ({ ...m, factionName: faction.factionName }));

    if (standing === "exalted") {
      available.push(...enriched);
    } else if (standing === "revered") {
      almostThere.push(...enriched);
    }
  }

  return { available, almostThere };
}
