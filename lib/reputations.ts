import type { FactionEntry, ReputationStanding, MountResults } from "./types";

export function crossReferenceMounts(
  reputations: ReputationStanding[],
  dataset: FactionEntry[]
): MountResults {
  const standingMap = new Map(
    reputations.map((r) => [r.faction.id, r.standing])
  );

  const available: MountResults["available"] = [];
  const almostThere: MountResults["almostThere"] = [];

  for (const faction of dataset) {
    if (faction.factionId === null) continue;
    const standing = standingMap.get(faction.factionId);
    if (!standing) continue;

    const enriched = faction.mounts.map((m) => ({
      ...m,
      faction: m.faction ?? faction.faction,
      factionName: faction.factionName,
      expansion: faction.expansion ?? "Other",
    }));

    const isRenown = standing.renown_level !== undefined;

    if (isRenown) {
      const level = standing.renown_level!;
      for (const m of enriched) {
        if (m.requiredRenown === undefined || level >= m.requiredRenown) {
          available.push(m);
        }
      }
    } else {
      const tierName = standing.name.toLowerCase();
      const tier = standing.tier ?? 0;
      if (tierName === "exalted" || tierName === "mastermind") {
        available.push(...enriched);
      } else if (tierName === "revered") {
        almostThere.push(...enriched.map((m) => ({ ...m, tier })));
      }
    }
  }

  return { available, almostThere };
}
