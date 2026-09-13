interface Mount {
  mountId: number;
  name: string;
  factionName: string;
  cost: string;
  vendorName: string;
  vendorZone: string;
}

interface Props {
  mount: Mount;
  variant: "minimal" | "standard" | "full";
}

export default function MountCardPreview({ mount, variant }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4 flex flex-col gap-1">
      <p className="font-display font-semibold text-primary">{mount.name}</p>
      <p className="text-sm text-muted">{mount.factionName}</p>

      {(variant === "standard" || variant === "full") && (
        <p className="text-sm text-gold mt-1">{mount.cost}</p>
      )}

      {variant === "full" && (
        <p className="text-xs text-muted mt-1">
          {mount.vendorName} · {mount.vendorZone}
        </p>
      )}
    </div>
  );
}
