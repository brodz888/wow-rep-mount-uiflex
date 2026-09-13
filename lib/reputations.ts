import type { FactionEntry, ReputationStanding, MountResults } from "./types";

export function crossReferenceMounts(
  reputations: ReputationStanding[],
  dataset: FactionEntry[]
): MountResults {
  const standingMap = new Map(
    reputations.map((r) => [r.faction.id, r.standing.name])
  );

  const available: MountResults["available"] = [];
  const almostThere: MountResults["almostThere"] = [];

  for (const faction of dataset) {
    const standing = standingMap.get(faction.factionId);
    const mounts = faction.mounts.map((m) => ({ ...m, factionName: faction.factionName }));

    if (standing === "Exalted") available.push(...mounts);
    else if (standing === "Revered") almostThere.push(...mounts);
  }

  return { available, almostThere };
}
