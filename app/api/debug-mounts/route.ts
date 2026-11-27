import { NextRequest, NextResponse } from "next/server";
import { getMountCollection, DEFAULT_REGION, type CharacterRef } from "@/lib/blizzard";
import { parseRegion } from "@/lib/regions";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const realm = searchParams.get("realm")?.toLowerCase();
  const character = searchParams.get("character")?.toLowerCase();

  if (!realm || !character)
    return NextResponse.json({ error: "Missing realm or character" }, { status: 400 });

  // Expects a realm slug (e.g. "area-52"); the page resolves typed realm names itself.
  const ref: CharacterRef = { region: parseRegion(searchParams.get("region"), DEFAULT_REGION), realmSlug: realm, name: character };

  const data = await getMountCollection(ref) as any;
  return NextResponse.json(data);
}
