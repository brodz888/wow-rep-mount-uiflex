import { NextRequest, NextResponse } from "next/server";
import { getCharacter, getCharacterMedia } from "@/lib/blizzard";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const realm = searchParams.get("realm")?.toLowerCase();
  const character = searchParams.get("character")?.toLowerCase();

  if (!realm || !character)
    return NextResponse.json({ error: "Missing realm or character" }, { status: 400 });

  try {
    const [summary, media] = await Promise.all([
      getCharacter(realm, character),
      getCharacterMedia(realm, character),
    ]);
    return NextResponse.json({ summary, media });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
