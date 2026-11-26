import LookupForm from "@/components/ui/LookupForm";
import HeroCard from "@/components/ui/HeroCard";
import ReputationMountGrid from "@/components/ui/ReputationMountGrid";
import { getCharacter, getCharacterMedia, getReputations, getMountCollection } from "@/lib/blizzard";
import { crossReferenceMounts } from "@/lib/reputations";
import dataset from "@/data/reputation-mounts.json";
import type { FactionEntry } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ character?: string; realm?: string; region?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { character, realm, region = "us" } = await searchParams;
  const hasQuery = !!(character && realm);

  let characterData: any = null;
  let mountResults: any = null;
  let error: string | null = null;

  if (hasQuery) {
    try {
      // The mount collection is a nice-to-have: if it fails (privacy settings,
      // API hiccup), still show results — just without "owned" badges.
      const mountsPromise = getMountCollection(realm!, character!).catch(() => null);

      const [summary, media, reps, mounts] = await Promise.all([
        getCharacter(realm!, character!),
        getCharacterMedia(realm!, character!),
        getReputations(realm!, character!),
        mountsPromise,
      ]) as any[];

      const ownedMountIds = new Set<number>(
        ((mounts?.mounts ?? []) as any[]).map((m: any) => m.mount.id)
      );

      const avatar = media.assets.find((a: any) => a.key === "avatar")?.value
        ?? media.assets.find((a: any) => a.key === "main-raw")?.value;
      characterData = { summary, avatarUrl: avatar };
      const cp = summary.covenant_progress;
      mountResults = crossReferenceMounts(reps.reputations, dataset as unknown as FactionEntry[], {
        ownedMountIds,
        playerFaction: summary.faction?.type?.toLowerCase(),
        covenant: cp ? { covenantId: cp.chosen_covenant.id, renownLevel: cp.renown_level } : null,
      });
    } catch (e: any) {
      error = e.message;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-16">
      {!hasQuery && (
        <>
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-semibold text-primary">RepMount</h1>
            <p className="mt-1 text-sm text-muted">Find every mount you can buy right now.</p>
          </div>
          <LookupForm defaultValues={{ character, realm, region }} />
        </>
      )}

      {hasQuery && error && (
        <>
          <p className="text-red-400 text-sm">{error}</p>
          <a href="/" className="mt-4 text-sm text-muted hover:text-primary transition-colors">← New search</a>
        </>
      )}

      {hasQuery && characterData && (
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <div className="flex items-center justify-between w-full">
            <a href="/" className="text-sm text-muted hover:text-primary transition-colors">← New search</a>
          </div>
          <HeroCard
            name={characterData.summary.name}
            className={characterData.summary.character_class.name}
            realm={characterData.summary.realm.name}
            race={characterData.summary.race.name}
            avatarUrl={characterData.avatarUrl}
          />
          <ReputationMountGrid
            available={mountResults.available}
            almostThere={mountResults.almostThere}
          />
        </div>
      )}
    </main>
  );
}
