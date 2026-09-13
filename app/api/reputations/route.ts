import { NextRequest, NextResponse } from "next/server";
import { getReputations } from "@/lib/blizzard";
import { crossReferenceMounts } from "@/lib/reputations";
import dataset from "@/data/reputation-mounts.json";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const realm = searchParams.get("realm")?.toLowerCase();
  const character = searchParams.get("character")?.toLowerCase();

  if (!realm || !character)
    return NextResponse.json({ error: "Missing realm or character" }, { status: 400 });

  try {
    const data = await getReputations(realm, character) as { reputations: any[] };
    const results = crossReferenceMounts(data.reputations, dataset);
    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
