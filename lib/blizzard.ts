import { parseRegion, type Region } from "./regions";
export type { Region };

export const DEFAULT_REGION = parseRegion(process.env.BLIZZARD_REGION);

/** Carries the HTTP status so callers can turn it into a friendly message. */
export class BlizzardApiError extends Error {
  constructor(public readonly status: number, public readonly path: string) {
    super(`Blizzard API error ${status} for ${path}`);
    this.name = "BlizzardApiError";
  }
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

// One token works for US, EU, KR and TW, so a single cache is enough.
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new BlizzardApiError(res.status, "/oauth/token");

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

async function blizzardFetch<T>(
  region: Region,
  path: string,
  { namespace, revalidate = 300, locale = "en_US" }: { namespace: string; revalidate?: number; locale?: string | null }
): Promise<T> {
  const token = await getToken();
  const url = new URL(path, `https://${region}.api.blizzard.com`);
  url.searchParams.set("namespace", namespace);
  if (locale) url.searchParams.set("locale", locale);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate },
  });
  if (!res.ok) throw new BlizzardApiError(res.status, path);
  return res.json();
}

/** Identifies a character. `realmSlug` must already be Blizzard's slug (see resolveRealmSlug). */
export interface CharacterRef {
  region: Region;
  realmSlug: string;
  name: string;
}

function profile<T>(c: CharacterRef, suffix = "") {
  const path = `/profile/wow/character/${encodeURIComponent(c.realmSlug)}/${encodeURIComponent(c.name.toLowerCase())}${suffix}`;
  return blizzardFetch<T>(c.region, path, { namespace: `profile-${c.region}` });
}

export const getCharacter = (c: CharacterRef) => profile(c);
export const getReputations = (c: CharacterRef) => profile(c, "/reputations");
export const getCharacterMedia = (c: CharacterRef) => profile(c, "/character-media");
export const getMountCollection = (c: CharacterRef) => profile(c, "/collections/mounts");

type LocalizedName = string | Record<string, string>;
interface RealmIndex {
  realms: { name: LocalizedName; slug: string }[];
}

/** Lowercase, strip accents and everything that isn't a letter or digit: "Mal'Ganis" → "malganis". */
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Turn whatever the user typed ("Area 52", "area-52", "Mal'Ganis") into Blizzard's realm slug.
 * Slugs don't follow one rule (Azjol-Nerub → "azjolnerub", Grizzly Hills → "grizzly-hills",
 * La Croisade écarlate → "la-croisade-écarlate"), so we look it up in the realm index.
 * Returns null if no realm in that region matches.
 */
export async function resolveRealmSlug(region: Region, input: string): Promise<string | null> {
  const wanted = normalize(input);
  if (!wanted) return null;
  // No locale → names come back in every language, so "아즈샤라" works as well as "Azshara".
  const { realms } = await blizzardFetch<RealmIndex>(region, "/data/wow/realm/index", {
    namespace: `dynamic-${region}`,
    revalidate: 86400,
    locale: null,
  });
  const names = (n: LocalizedName) => (typeof n === "string" ? [n] : Object.values(n));
  const match = realms.find((r) => normalize(r.slug) === wanted || names(r.name).some((n) => normalize(n) === wanted));
  return match?.slug ?? null;
}
