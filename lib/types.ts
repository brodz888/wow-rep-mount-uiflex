export interface Mount {
  mountId: number | null;
  name: string;
  cost?: string;
  faction?: "alliance" | "horde";
  requiredStanding?: string;
  requiredRenown?: number;
  vendorName: string | null;
  vendorId: number | null;
  vendorZone: string | null;
}

export interface FactionEntry {
  factionId: number | null;
  factionName: string;
  expansion?: string;
  faction?: "alliance" | "horde";
  mounts: Mount[];
}

export interface ReputationStanding {
  faction: { id: number; name: string };
  standing: { name: string; tier: number };
}

export interface MountResults {
  available: (Mount & { factionName: string })[];
  almostThere: (Mount & { factionName: string; tier: number })[];
}
