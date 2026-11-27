import LookupForm from "@/components/ui/LookupForm";
import HeroCard from "@/components/ui/HeroCard";
import ReputationMountGrid from "@/components/ui/ReputationMountGrid";
import { DEFAULT_REGION } from "@/lib/blizzard";
import { parseRegion } from "@/lib/regions";
import { lookupCharacter, LookupError, type LookupResult } from "@/lib/lookup";

interface PageProps {
  searchParams: Promise<{ character?: string; realm?: string; region?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const character = params.character?.trim();
  const realm = params.realm?.trim();
  const region = parseRegion(params.region, DEFAULT_REGION);
  const hasQuery = !!(character && realm);

  let result: LookupResult | null = null;
  let error: string | null = null;

  if (hasQuery) {
    try {
      result = await lookupCharacter(region, realm!, character!);
    } catch (e) {
      // LookupError messages are written for users; anything else is a bug, so keep details in the server log.
      if (e instanceof LookupError) error = e.message;
      else {
        console.error(e);
        error = "Something went wrong looking up that character. Try again in a moment.";
      }
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
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          <p className="text-red-400 text-sm text-center">{error}</p>
          {/* Prefilled so a typo can be fixed without retyping everything */}
          <LookupForm defaultValues={{ character, realm, region }} />
        </div>
      )}

      {hasQuery && result && (
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <div className="flex items-center justify-between w-full">
            <a href="/" className="text-sm text-muted hover:text-primary transition-colors">← New search</a>
          </div>
          <HeroCard
            name={result.summary.name}
            className={result.summary.character_class.name}
            realm={result.summary.realm.name}
            race={result.summary.race.name}
            avatarUrl={result.avatarUrl}
          />
          <ReputationMountGrid
            available={result.mounts.available}
            almostThere={result.mounts.almostThere}
          />
        </div>
      )}
    </main>
  );
}
