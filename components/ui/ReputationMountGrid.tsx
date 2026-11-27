"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// Same types the cross-reference logic produces, so the two can't drift apart.
import type { AlmostThereMount, EnrichedMount as Mount } from "@/lib/types";

interface Props {
  available: Mount[];
  almostThere: AlmostThereMount[];
}

const EXPANSION_ORDER = [
  "Midnight",
  "The War Within",
  "Dragonflight",
  "Shadowlands",
  "Battle for Azeroth",
  "Legion",
  "Warlords of Draenor",
  "Mists of Pandaria",
  "Cataclysm",
  "Wrath of the Lich King",
  "The Burning Crusade",
  "Other",
];

const EXPANSION_COLORS: Record<string, string> = {
  "Midnight":               "#6B3FA0",
  "The War Within":         "#C4762A",
  "Dragonflight":           "#1BA8A0",
  "Shadowlands":            "#5C6BC0",
  "Battle for Azeroth":     "#1A6B9A",
  "Legion":                 "#7DB249",
  "Warlords of Draenor":    "#B5471B",
  "Mists of Pandaria":      "#4E9A51",
  "Cataclysm":              "#C41E1E",
  "Wrath of the Lich King": "#2A7FBF",
  "The Burning Crusade":    "#8B5DB5",
  "Other":                  "#C8AA6E",
};

/** One segment per rank/level; `filled` segments are ones already reached. */
function TierBar({ filled, total, label, color }: { filled: number; total: number; label: string; color: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className="flex gap-0.5 mt-2"
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full"
          style={{ background: i < filled ? color : "var(--surface-border)" }}
        />
      ))}
    </div>
  );
}

function Progress({ mount, color }: { mount: AlmostThereMount; color: string }) {
  if (mount.kind === "standing") {
    const reached = mount.tier + 1; // tier is a 0-based index into the ladder
    return <TierBar filled={reached} total={mount.tierCount} label={`Rank ${reached} of ${mount.tierCount}`} color={color} />;
  }
  const required = mount.currentLevel + mount.levelsToGo;
  return (
    <p className="text-xs font-display font-semibold mt-2" style={{ color }}>
      Requires Renown {required} · Currently at {mount.currentLevel}
    </p>
  );
}

function MountCard({ mount, color, index }: { mount: Mount | AlmostThereMount; color: string; index: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="rounded-xl border border-border bg-surface px-5 py-4 flex flex-col gap-1 border-l-2"
      style={{ borderLeftColor: color, opacity: mount.owned ? 0.45 : 1 }}
      initial={reduced ? false : { opacity: mount.owned ? 0.2 : 0, y: 12 }}
      animate={{ opacity: mount.owned ? 0.45 : 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduced ? {} : { y: -2, transition: { duration: 0.15 } }}
    >
      <div className="flex items-center justify-between gap-2">
        {mount.itemId ? (
          <a
            href={`https://www.wowhead.com/item=${mount.itemId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-semibold text-primary hover:text-gold transition-colors"
          >
            {mount.name}
          </a>
        ) : (
          <p className="font-display font-semibold text-primary">{mount.name}</p>
        )}
        {mount.owned && (
          <span className="text-[10px] font-display font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0" style={{ background: "#16a34a33", color: "#4ade80", border: "1px solid #16a34a" }}>
            ✓ Owned
          </span>
        )}
      </div>
      <p className="text-sm text-muted">{mount.factionName}</p>
      <p className="text-sm text-gold mt-1">{mount.cost}</p>
      {mount.vendorId ? (
        <a
          href={`https://www.wowhead.com/npc=${mount.vendorId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted hover:text-primary transition-colors mt-1"
        >
          {mount.vendorName} · {mount.vendorZone}
        </a>
      ) : (
        <p className="text-xs text-muted mt-1">{mount.vendorName} · {mount.vendorZone}</p>
      )}
      {"kind" in mount && <Progress mount={mount} color={color} />}
    </motion.div>
  );
}

export default function ReputationMountGrid({ available, almostThere }: Props) {
  const all = [...available, ...almostThere];

  const expansions = EXPANSION_ORDER.filter((exp) =>
    all.some((m) => m.expansion === exp)
  );

  const [activeTab, setActiveTab] = useState(expansions[0] ?? "");

  if (all.length === 0) {
    return (
      <p className="text-sm text-muted text-center">
        No reputation vendor mounts found for this character.
      </p>
    );
  }

  const color = EXPANSION_COLORS[activeTab] ?? "#C8AA6E";
  const tabAvailable = available.filter((m) => m.expansion === activeTab);
  const tabAlmostThere = almostThere.filter((m) => m.expansion === activeTab);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {expansions.map((exp) => {
          const expColor = EXPANSION_COLORS[exp] ?? "#C8AA6E";
          const isActive = exp === activeTab;
          const count = all.filter((m) => m.expansion === exp).length;
          return (
            <button
              key={exp}
              onClick={() => setActiveTab(exp)}
              className="relative px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200"
              style={{
                color: isActive ? "#0A0B0F" : expColor,
                background: isActive ? expColor : `${expColor}18`,
                border: `1px solid ${expColor}${isActive ? "ff" : "40"}`,
              }}
            >
              {exp}
              <span
                className="ml-1.5 opacity-70"
                style={{ color: isActive ? "#0A0B0F" : expColor }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mount grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6"
        >
          {tabAvailable.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-display font-semibold uppercase tracking-widest" style={{ color }}>
                  Available Now
                </span>
                <span className="text-xs text-muted">{tabAvailable.length} mount{tabAvailable.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...tabAvailable].sort((a, b) => Number(a.owned) - Number(b.owned)).map((m, i) => (
                  <MountCard key={`${m.factionName}-${m.mountId}-${m.name}`} mount={m} color={color} index={i} />
                ))}
              </div>
            </div>
          )}

          {tabAlmostThere.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-display font-semibold uppercase tracking-widest" style={{ color: "var(--rep-revered)" }}>
                  Almost There
                </span>
                <span className="text-xs text-muted">{tabAlmostThere.length} mount{tabAlmostThere.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tabAlmostThere.map((m, i) => (
                  <MountCard key={`${m.factionName}-${m.mountId}-${m.name}`} mount={m} color="var(--rep-revered)" index={i} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
