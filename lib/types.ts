export interface Mount {
  mountId: number;
  name: string;
  cost: string;
  vendorName: string;
  vendorZone: string;
}

export interface FactionEntry {
  factionId: number;
  factionName: string;
  mounts: Mount[];
}

export interface ReputationStanding {
  faction: { id: number; name: string };
  standing: { name: string };
}

export interface MountResults {
  available: (Mount & { factionName: string })[];
  almostThere: (Mount & { factionName: string })[];
}
