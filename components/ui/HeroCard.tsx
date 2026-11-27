"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getClassColor } from "@/lib/classColors";

interface Props {
  name: string;
  className: string;
  realm: string;
  race: string;
  avatarUrl: string | null;
}

export default function HeroCard({ name, className, realm, race, avatarUrl }: Props) {
  const classColor = getClassColor(className);

  const reduced = useReducedMotion();

  return (
    <motion.div
      className="relative flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 w-full max-w-2xl"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-10 blur-2xl pointer-events-none"
        style={{ background: classColor }}
      />

      {/* Avatar — Blizzard bust crop, upscaled */}
      <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 80, height: 80 }}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={100}
            height={100}
            className="block w-full h-full"
          />
        ) : (
          // No portrait from the API: show the initial in the class color instead
          <div
            className="flex w-full h-full items-center justify-center font-display text-3xl font-semibold"
            style={{ background: `${classColor}22`, color: classColor }}
            aria-hidden="true"
          >
            {name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5">
        <h2 className="font-display text-xl font-semibold text-primary">{name}</h2>
        <p className="text-sm font-medium" style={{ color: classColor }}>{className}</p>
        <p className="text-xs text-muted">{race} · {realm}</p>
      </div>
    </motion.div>
  );
}
