export interface Mount {
  mountId: number;
  name: string;
  cost: string;
  faction?: "alliance" | "horde";
  requiredStanding?: "revered" | "honored" | "friendly";
  vendorName: string;
  vendorId: number;
  vendorZone: string;
}

export interface FactionEntry {
  factionId: number;
  factionName: string;
  mounts: Mount[];
}

export interface ReputationStanding {
  faction: { id: number; name: string };
  standing: { name: string; tier: number };
}

export interface MountResults {
  available: (Mount & { factionName: string })[];
  almostThere: (Mount & { factionName: string })[];
}
