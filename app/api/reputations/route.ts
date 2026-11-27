import { NextRequest, NextResponse } from "next/server";
import { getReputations, DEFAULT_REGION, type CharacterRef } from "@/lib/blizzard";
import { parseRegion } from "@/lib/regions";
import { crossReferenceMounts } from "@/lib/reputations";
import dataset from "@/data/reputation-mounts.json";
import type { FactionEntry } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const realm = searchParams.get("realm")?.toLowerCase();
  const character = searchParams.get("character")?.toLowerCase();

  if (!realm || !character)
    return NextResponse.json({ error: "Missing realm or character" }, { status: 400 });

  // Expects a realm slug (e.g. "area-52"); the page resolves typed realm names itself.
  const ref: CharacterRef = { region: parseRegion(searchParams.get("region"), DEFAULT_REGION), realmSlug: realm, name: character };

  try {
    const data = await getReputations(ref) as { reputations: any[] };
    const results = crossReferenceMounts(data.reputations, dataset as unknown as FactionEntry[]);
    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
