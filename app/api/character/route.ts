import { NextRequest, NextResponse } from "next/server";
import { getCharacter, getCharacterMedia, DEFAULT_REGION, type CharacterRef } from "@/lib/blizzard";
import { parseRegion } from "@/lib/regions";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const realm = searchParams.get("realm")?.toLowerCase();
  const character = searchParams.get("character")?.toLowerCase();

  if (!realm || !character)
    return NextResponse.json({ error: "Missing realm or character" }, { status: 400 });

  // Expects a realm slug (e.g. "area-52"); the page resolves typed realm names itself.
  const ref: CharacterRef = { region: parseRegion(searchParams.get("region"), DEFAULT_REGION), realmSlug: realm, name: character };

  try {
    const [summary, media] = await Promise.all([
      getCharacter(ref),
      getCharacterMedia(ref),
    ]);
    return NextResponse.json({ summary, media });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
