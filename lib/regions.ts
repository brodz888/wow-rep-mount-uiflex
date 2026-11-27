// Shared by server and client code, so it must not import anything server-only.
export const REGIONS = ["us", "eu", "kr", "tw"] as const;
export type Region = (typeof REGIONS)[number];

/** Narrow an untrusted string (URL param, env var) to a Region, or return the fallback. */
export function parseRegion(value: string | null | undefined, fallback: Region = "us"): Region {
  const v = value?.toLowerCase();
  return (REGIONS as readonly string[]).includes(v ?? "") ? (v as Region) : fallback;
}
