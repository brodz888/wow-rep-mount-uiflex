const REGION = process.env.BLIZZARD_REGION ?? "us";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`https://${REGION}.battle.net/oauth/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

async function blizzardFetch<T>(path: string): Promise<T> {
  const token = await getToken();
  const res = await fetch(
    `https://${REGION}.api.blizzard.com${path}&locale=en_US`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) throw new Error(`Blizzard API error: ${res.status}`);
  return res.json();
}

export function getCharacter(realm: string, character: string) {
  return blizzardFetch(
    `/profile/wow/character/${realm}/${character}?namespace=profile-${REGION}`
  );
}

export function getReputations(realm: string, character: string) {
  return blizzardFetch(
    `/profile/wow/character/${realm}/${character}/reputations?namespace=profile-${REGION}`
  );
}

export function getCharacterMedia(realm: string, character: string) {
  return blizzardFetch(
    `/profile/wow/character/${realm}/${character}/character-media?namespace=profile-${REGION}`
  );
}
