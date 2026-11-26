// Run with: npm test  (Node's built-in test runner; Node strips the TS types on import)
import { test } from "node:test";
import assert from "node:assert/strict";
import { crossReferenceMounts } from "../lib/reputations.ts";

const mount = (name, extra = {}) => ({ mountId: null, name, vendorName: null, vendorId: null, vendorZone: null, ...extra });
const rep = (id, standing) => ({ faction: { id, name: `Faction ${id}` }, standing });
const names = (list) => list.map((m) => m.name).sort();

test("classic faction: default requirement is Exalted, Revered is almost there", () => {
  const dataset = [{ factionId: 1, factionName: "Classic", mounts: [mount("Exalted Mount")] }];
  assert.deepEqual(names(crossReferenceMounts([rep(1, { name: "Exalted", tier: 7 })], dataset).available), ["Exalted Mount"]);

  const r = crossReferenceMounts([rep(1, { name: "Revered", tier: 6 })], dataset);
  assert.deepEqual(r.available, []);
  assert.equal(r.almostThere[0].kind, "standing");
  assert.equal(r.almostThere[0].tier, 6);
  assert.equal(r.almostThere[0].tierCount, 8);

  assert.deepEqual(crossReferenceMounts([rep(1, { name: "Honored", tier: 5 })], dataset).almostThere, []);
});

test("classic faction: requiredStanding below Exalted is honoured", () => {
  const dataset = [{ factionId: 1, factionName: "Hodir", mounts: [mount("Ice Mammoth", { requiredStanding: "revered" }), mount("Grand Ice Mammoth")] }];
  const r = crossReferenceMounts([rep(1, { name: "Revered", tier: 6 })], dataset);
  assert.deepEqual(names(r.available), ["Ice Mammoth"]);
  assert.deepEqual(names(r.almostThere), ["Grand Ice Mammoth"]);
});

test("paragon Exalted still counts as Exalted", () => {
  const dataset = [{ factionId: 1, factionName: "Classic", mounts: [mount("M", { requiredStanding: "revered" })] }];
  const r = crossReferenceMounts([rep(1, { name: "Exalted", tier: 7, raw: 42000, value: 0, max: 0 })], dataset);
  assert.deepEqual(names(r.available), ["M"]);
});

test("custom ladder compares by rank name, not raw tier", () => {
  // Court of Night: Neutral is tier 0, so Revered is tier 3 — a raw-tier check against 6 would be wrong
  const dataset = [{ factionId: 1, factionName: "Court of Night", ranks: ["Neutral", "Friendly", "Honored", "Revered", "Exalted"], mounts: [mount("Runestag", { requiredStanding: "revered" })] }];
  assert.deepEqual(names(crossReferenceMounts([rep(1, { name: "Revered", tier: 3 })], dataset).available), ["Runestag"]);
  const r = crossReferenceMounts([rep(1, { name: "Honored", tier: 2 })], dataset);
  assert.deepEqual(r.available, []);
  assert.equal(r.almostThere[0].tierCount, 5);
});

test("friendship ladder: Best Friend required, top rank (e.g. Mastermind) above requirement works", () => {
  const friend = [{ factionId: 1, factionName: "Nat Pagle", ranks: ["Stranger", "Pal", "Buddy", "Friend", "Good Friend", "Best Friend"], mounts: [mount("Strider", { requiredStanding: "best friend" })] }];
  assert.deepEqual(names(crossReferenceMounts([rep(1, { name: "Best Friend", tier: 5 })], friend).available), ["Strider"]);
  assert.deepEqual(names(crossReferenceMounts([rep(1, { name: "Good Friend", tier: 4 })], friend).almostThere), ["Strider"]);

  const weaver = [{ factionId: 2, factionName: "The Weaver", ranks: ["Stranger", "Acquaintance", "Crony", "Accomplice", "Collaborator", "Accessory", "Abettor", "Conspirator", "Mastermind"], mounts: [mount("Undercrawler", { requiredStanding: "conspirator" })] }];
  assert.deepEqual(names(crossReferenceMounts([rep(2, { name: "Mastermind", tier: 8 })], weaver).available), ["Undercrawler"]);
  assert.deepEqual(crossReferenceMounts([rep(2, { name: "Collaborator", tier: 4 })], weaver).available, []);
});

test("renown faction gates on renown level", () => {
  const dataset = [{ factionId: 1, factionName: "Renown", mounts: [mount("Low", { requiredRenown: 5 }), mount("Exact", { requiredRenown: 10 }), mount("High", { requiredRenown: 20 }), mount("Any")] }];
  const r = crossReferenceMounts([rep(1, { name: "Renown 10", renown_level: 10 })], dataset);
  assert.deepEqual(names(r.available), ["Any", "Exact", "Low"]);
  assert.deepEqual(r.almostThere, []);
});

test("renown mounts 1–2 levels short are almost there; 3+ are hidden", () => {
  const dataset = [{ factionId: 1, factionName: "Renown", mounts: [mount("OneAway", { requiredRenown: 11 }), mount("TwoAway", { requiredRenown: 12 }), mount("ThreeAway", { requiredRenown: 13 })] }];
  const r = crossReferenceMounts([rep(1, { name: "Renown 10", renown_level: 10 })], dataset);
  assert.deepEqual(r.available, []);
  assert.deepEqual(names(r.almostThere), ["OneAway", "TwoAway"]);
  const one = r.almostThere.find((m) => m.name === "OneAway");
  assert.equal(one.kind, "renown");
  assert.equal(one.currentLevel, 10);
  assert.equal(one.levelsToGo, 1);
});

test("covenant renown also gets the almost-there window", () => {
  const dataset = [{ factionId: null, covenantId: 1, factionName: "Kyrian Covenant", mounts: [mount("Phalynx", { requiredRenown: 23 })] }];
  const r = crossReferenceMounts([], dataset, { covenant: { covenantId: 1, renownLevel: 21 } });
  assert.equal(r.almostThere[0].levelsToGo, 2);
});

test("covenant mounts use covenant progress, only for the chosen covenant", () => {
  const dataset = [
    { factionId: null, covenantId: 1, factionName: "Kyrian Covenant", mounts: [mount("Phalynx", { requiredRenown: 23 })] },
    { factionId: null, covenantId: 4, factionName: "Necrolord Covenant", mounts: [mount("Tauralus", { requiredRenown: 23 })] },
  ];
  const r = crossReferenceMounts([], dataset, { covenant: { covenantId: 1, renownLevel: 80 } });
  assert.deepEqual(names(r.available), ["Phalynx"]);
  assert.deepEqual(crossReferenceMounts([], dataset).available, []);
});

test("other side's mounts are hidden; owned flag is set from mount IDs", () => {
  const dataset = [{ factionId: 1, factionName: "Hodir", mounts: [mount("A", { faction: "alliance", mountId: 259 }), mount("H", { faction: "horde", mountId: 258 })] }];
  const r = crossReferenceMounts([rep(1, { name: "Exalted", tier: 7 })], dataset, { playerFaction: "horde", ownedMountIds: new Set([258]) });
  assert.deepEqual(names(r.available), ["H"]);
  assert.equal(r.available[0].owned, true);
});
