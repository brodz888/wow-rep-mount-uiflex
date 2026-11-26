export interface Mount {
  mountId: number | null;
  name: string;
  cost?: string;
  faction?: "alliance" | "horde";
  /** Rank name from the faction's ladder (case-insensitive). Defaults to the top rank. */
  requiredStanding?: string;
  requiredRenown?: number;
  vendorName: string | null;
  vendorId: number | null;
  vendorZone: string | null;
}

export interface FactionEntry {
  /** Blizzard reputation-faction ID. Null for Covenants, which are matched by covenantId. */
  factionId: number | null;
  /** Shadowlands covenant ID (1 Kyrian, 2 Venthyr, 3 Night Fae, 4 Necrolord). */
  covenantId?: number;
  factionName: string;
  expansion?: string;
  faction?: "alliance" | "horde";
  /** Rank ladder, lowest first, for factions that don't use Hated → Exalted. */
  ranks?: string[];
  mounts: Mount[];
}

export interface ReputationStanding {
  faction: { id: number; name: string };
  standing: { name: string; tier?: number; renown_level?: number; raw?: number; value?: number; max?: number };
}

/** From the character summary's `covenant_progress`. */
export interface CovenantProgress {
  covenantId: number;
  renownLevel: number;
}

export interface CharacterContext {
  /** The character's own side, used to hide the other side's mounts. */
  playerFaction?: "alliance" | "horde";
  covenant?: CovenantProgress | null;
  ownedMountIds?: Set<number>;
}

export type EnrichedMount = Mount & { factionName: string; expansion: string; owned: boolean };

/**
 * Why a mount is "almost there" — a discriminated union, so code that checks
 * `kind` gets the right fields (like a sealed interface with two records in Java).
 */
export type AlmostThereProgress =
  /** One rank short. `tier` is the current rank's index, `tierCount` the ladder's length. */
  | { kind: "standing"; tier: number; tierCount: number }
  /** A few renown levels short (see RENOWN_ALMOST_THERE_LEVELS). */
  | { kind: "renown"; currentLevel: number; levelsToGo: number };

export type AlmostThereMount = EnrichedMount & AlmostThereProgress;

export interface MountResults {
  available: EnrichedMount[];
  almostThere: AlmostThereMount[];
}
