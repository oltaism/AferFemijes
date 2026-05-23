import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function ChildAvatar({
  name,
  hue = 200,
  size = 44,
  className,
}: {
  name: string;
  hue?: number;
  size?: number;
  className?: string;
}) {
  const bg = `hsl(${hue} 75% 92%)`;
  const fg = `hsl(${hue} 60% 30%)`;
  return (
    <div
      role="img"
      aria-label={`Avatar for ${name}`}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-slate-200",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </div>
  );
}
