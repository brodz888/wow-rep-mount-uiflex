import {
  BlizzardApiError,
  getCharacter,
  getCharacterMedia,
  getMountCollection,
  getReputations,
  resolveRealmSlug,
  type CharacterRef,
  type Region,
} from "./blizzard";
import { crossReferenceMounts } from "./reputations";
import dataset from "@/data/reputation-mounts.json";
import type { FactionEntry, MountResults } from "./types";

/** An error whose message is safe and helpful to show the user as-is. */
export class LookupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LookupError";
  }
}

export interface LookupResult {
  summary: any;
  avatarUrl: string | null;
  mounts: MountResults;
}

function friendly(e: unknown, who: string): Error {
  if (!(e instanceof BlizzardApiError)) return e as Error;
  if (e.status === 404)
    return new LookupError(
      `Couldn't find ${who}. Check the spelling — characters that haven't logged in for a while also don't show up.`
    );
  if (e.status === 401 || e.status === 403) return new LookupError("Couldn't sign in to the Blizzard API. The app's credentials may be misconfigured.");
  if (e.status === 429) return new LookupError("Too many lookups right now — try again in a minute.");
  if (e.status >= 500) return new LookupError("Blizzard's API isn't responding right now. Try again shortly.");
  return e;
}

export async function lookupCharacter(region: Region, realmInput: string, character: string): Promise<LookupResult> {
  const realmSlug = await resolveRealmSlug(region, realmInput).catch((e) => {
    throw friendly(e, `the realm list for ${region.toUpperCase()}`);
  });
  if (!realmSlug) throw new LookupError(`No realm called "${realmInput}" in ${region.toUpperCase()}. Check the spelling or the region.`);

  const ref: CharacterRef = { region, realmSlug, name: character.trim() };
  const who = `"${ref.name}" on ${realmInput} (${region.toUpperCase()})`;

  // The portrait and mount collection are nice-to-haves: if either fails, still show results.
  const [summary, reps, media, mountCollection] = await Promise.all([
    getCharacter(ref),
    getReputations(ref),
    getCharacterMedia(ref).catch(() => null),
    getMountCollection(ref).catch(() => null),
  ]).catch((e) => {
    throw friendly(e, who);
  }) as any[];

  const assets: { key: string; value: string }[] = media?.assets ?? [];
  const avatarUrl = assets.find((a) => a.key === "avatar")?.value ?? assets.find((a) => a.key === "main-raw")?.value ?? null;

  const ownedMountIds = new Set<number>(((mountCollection?.mounts ?? []) as any[]).map((m) => m.mount.id));
  const cp = summary.covenant_progress;
  const mounts = crossReferenceMounts(reps.reputations ?? [], dataset as unknown as FactionEntry[], {
    ownedMountIds,
    playerFaction: summary.faction?.type?.toLowerCase(),
    covenant: cp ? { covenantId: cp.chosen_covenant.id, renownLevel: cp.renown_level } : null,
  });

  return { summary, avatarUrl, mounts };
}
