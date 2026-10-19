"use client";

import { motion, useReducedMotion } from "framer-motion";

interface Mount {
  mountId: number;
  name: string;
  factionName: string;
  cost: string;
  vendorName: string;
  vendorId: number;
  vendorZone: string;
}

interface Props {
  available: Mount[];
  almostThere: Mount[];
}

function MountCard({ mount, accentColor, index }: { mount: Mount; accentColor: string; index: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="rounded-xl border border-border bg-surface px-5 py-4 flex flex-col gap-1 border-l-2"
      style={{ borderLeftColor: accentColor }}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduced ? {} : { y: -2, transition: { duration: 0.15 } }}
    >
      <p className="font-display font-semibold text-primary">{mount.name}</p>
      <p className="text-sm text-muted">{mount.factionName}</p>
      <p className="text-sm text-gold mt-1">{mount.cost}</p>
      <a
        href={`https://www.wowhead.com/npc=${mount.vendorId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted hover:text-primary transition-colors mt-1"
      >
        {mount.vendorName} · {mount.vendorZone}
      </a>
    </motion.div>
  );
}

function Section({ title, mounts, accentColor }: { title: string; mounts: Mount[]; accentColor: string }) {
  if (mounts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3">
        <span className="text-xs font-display font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
          {title}
        </span>
        <span className="text-xs text-muted">{mounts.length} mount{mounts.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mounts.map((m, i) => <MountCard key={m.mountId} mount={m} accentColor={accentColor} index={i} />)}
      </div>
    </div>
  );
}

export default function ReputationMountGrid({ available, almostThere }: Props) {
  if (available.length === 0 && almostThere.length === 0) {
    return (
      <p className="text-sm text-muted text-center">
        No reputation vendor mounts found for this character.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <Section title="Available Now" mounts={available} accentColor="var(--rep-exalted)" />
      <Section title="Almost There" mounts={almostThere} accentColor="var(--rep-revered)" />
    </div>
  );
}
