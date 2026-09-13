interface Mount {
  mountId: number;
  name: string;
  factionName: string;
  cost: string;
  vendorName: string;
  vendorZone: string;
}

interface Props {
  available: Mount[];
  almostThere: Mount[];
}

function MountCard({ mount }: { mount: Mount }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4 flex flex-col gap-1">
      <p className="font-display font-semibold text-primary">{mount.name}</p>
      <p className="text-sm text-muted">{mount.factionName}</p>
      <p className="text-sm text-gold mt-1">{mount.cost}</p>
      <p className="text-xs text-muted mt-1">{mount.vendorName} · {mount.vendorZone}</p>
    </div>
  );
}

function Section({ title, mounts, accent }: { title: string; mounts: Mount[]; accent: string }) {
  if (mounts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3">
        <span className="text-xs font-display font-semibold uppercase tracking-widest" style={{ color: accent }}>
          {title}
        </span>
        <span className="text-xs text-muted">{mounts.length} mount{mounts.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mounts.map((m) => <MountCard key={m.mountId} mount={m} />)}
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
      <Section title="Available Now" mounts={available} accent="#4ADE80" />
      <Section title="Almost There" mounts={almostThere} accent="#FACC15" />
    </div>
  );
}
