import type { ParticipationStatus } from "@/lib/types";

export function Stat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{value}</div>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    confirmed: "border-amber-300/35 bg-amber-400/10 text-amber-100",
    pending: "border-amber-300/35 bg-amber-400/10 text-amber-200",
    cancelled: "border-slate-400/25 bg-slate-400/10 text-slate-300",
    open: "border-amber-300/35 bg-amber-400/10 text-amber-100",
    funded: "border-yellow-300/35 bg-yellow-400/10 text-yellow-100",
    purchased: "border-orange-300/35 bg-orange-400/10 text-orange-100",
    sold: "border-amber-300/35 bg-amber-400/10 text-amber-100",
    closed: "border-slate-400/25 bg-slate-400/10 text-slate-300"
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] shadow-[0_0_24px_rgba(244,182,63,0.14)] ${classes[status] ?? classes.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full border border-amber-300/10 bg-slate-950/80">
      <div
        className="h-full rounded-full bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-500 shadow-[0_0_28px_rgba(244,182,63,0.48)]"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export function statusText(status: ParticipationStatus) {
  if (status === "pending") return "Awaiting payment confirmation";
  if (status === "confirmed") return "Confirmed";
  return "Cancelled";
}
