"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const REGIONS = ["us", "eu", "kr", "tw"];

export default function LookupForm() {
  const router = useRouter();
  const [character, setCharacter] = useState("");
  const [realm, setRealm] = useState("");
  const [region, setRegion] = useState("us");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!character.trim() || !realm.trim()) return;
    router.push(
      `/?character=${character.trim().toLowerCase()}&realm=${realm.trim().toLowerCase()}&region=${region}`
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-sm">
      <input
        type="text"
        placeholder="Character name"
        value={character}
        onChange={(e) => setCharacter(e.target.value)}
        className="bg-surface border border-border rounded-lg px-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
      />
      <input
        type="text"
        placeholder="Realm (e.g. stormrage)"
        value={realm}
        onChange={(e) => setRealm(e.target.value)}
        className="bg-surface border border-border rounded-lg px-4 py-3 text-primary placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
      />
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="bg-surface border border-border rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-gold transition-colors"
      >
        {REGIONS.map((r) => (
          <option key={r} value={r}>{r.toUpperCase()}</option>
        ))}
      </select>
      <button
        type="submit"
        className="bg-gold text-void font-display font-semibold rounded-lg px-4 py-3 hover:opacity-90 transition-opacity"
      >
        Look up
      </button>
    </form>
  );
}
