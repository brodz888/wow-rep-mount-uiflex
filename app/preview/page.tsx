import MountCardPreview from "@/components/ui/MountCardPreview";

export default function PreviewPage() {
  const mount = {
    mountId: 1514,
    name: "Resonant Echo",
    factionName: "Death's Advance",
    cost: "5,000g",
    vendorName: "Duchess Mynx",
    vendorZone: "Korthia",
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 gap-12">
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <p className="text-muted text-xs uppercase tracking-widest font-display">Variant 1 — Minimal</p>
        <MountCardPreview mount={mount} variant="minimal" />
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <p className="text-muted text-xs uppercase tracking-widest font-display">Variant 2 — Standard</p>
        <MountCardPreview mount={mount} variant="standard" />
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <p className="text-muted text-xs uppercase tracking-widest font-display">Variant 3 — Full</p>
        <MountCardPreview mount={mount} variant="full" />
      </div>
    </main>
  );
}
