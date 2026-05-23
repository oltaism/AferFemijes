import { ShieldCheck } from "lucide-react";

export function SafetyBanner({
  variant = "default",
  className,
}: {
  variant?: "default" | "ai";
  className?: string;
}) {
  const text =
    variant === "ai"
      ? "AI nuk diagnozon — tregon boshllëqet parandaluese dhe sugjeron ndjekje me mjek."
      : "Informacion vetëm — konfirmo me mjek sipas udhëzimeve zyrtare.";

  return (
    <div
      role="note"
      className={
        "flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4 text-sm text-violet-900 " +
        (className ?? "")
      }
    >
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden />
      <p>{text}</p>
    </div>
  );
}
