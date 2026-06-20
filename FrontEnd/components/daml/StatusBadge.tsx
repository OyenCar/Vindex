import { STATUS_LABEL } from "@/lib/daml/vindex";

// Semantic tone per milestone state — mirrors the protocol's meaning (accept = green, dispute =
// pink, violation = red, in-flight = amber/sky).
const TONE: Record<string, string> = {
  Active: "text-accent-soft bg-accent/15 border-accent/30",
  Submitted: "text-warning bg-warning/10 border-warning/30",
  RejPending: "text-pink-300 bg-pink-500/10 border-pink-500/30",
  Revision: "text-sky-300 bg-sky-500/10 border-sky-500/30",
  Accepted: "text-success bg-success/10 border-success/30",
  Completed: "text-success bg-success/10 border-success/30",
  Failed: "text-red-300 bg-red-500/10 border-red-500/30",
  Inactive: "text-text-secondary bg-white/5 border-white/10",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONE[status] ?? "text-text-secondary bg-white/5 border-white/10";
  const label = STATUS_LABEL[status] ?? status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
