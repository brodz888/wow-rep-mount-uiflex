import LookupForm from "@/components/ui/LookupForm";
import HeroCard from "@/components/ui/HeroCard";
import ReputationMountGrid from "@/components/ui/ReputationMountGrid";
import { getCharacter, getCharacterMedia, getReputations } from "@/lib/blizzard";
import { crossReferenceMounts } from "@/lib/reputations";
import dataset from "@/data/reputation-mounts.json";

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
      const [summary, media, reps] = await Promise.all([
        getCharacter(realm!, character!),
        getCharacterMedia(realm!, character!),
        getReputations(realm!, character!),
      ]) as any[];

      characterData = { summary, media };
      mountResults = crossReferenceMounts(reps.reputations, dataset);
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
          <LookupForm />
        </>
      )}

      {hasQuery && error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {hasQuery && characterData && (
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <HeroCard
            name={characterData.summary.name}
            className={characterData.summary.character_class.name}
            realm={characterData.summary.realm.name}
            race={characterData.summary.race.name}
            avatarUrl={characterData.media.assets[0].value}
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
