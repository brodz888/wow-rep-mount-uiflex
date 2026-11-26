import { NextRequest, NextResponse } from "next/server";
import { getMountCollection } from "@/lib/blizzard";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const realm = searchParams.get("realm")?.toLowerCase();
  const character = searchParams.get("character")?.toLowerCase();

  if (!realm || !character)
    return NextResponse.json({ error: "Missing realm or character" }, { status: 400 });

  const data = await getMountCollection(realm, character) as any;
  return NextResponse.json(data);
}
