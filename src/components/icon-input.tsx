"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type IconInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
  endSlot?: React.ReactNode;
};

/**
 * Input me ikonë majtas — ikona në kolonë të veçantë, pa mbivendosje me placeholder.
 */
export function IconInput({
  icon: Icon,
  endSlot,
  className,
  id,
  disabled,
  ...props
}: IconInputProps) {
  return (
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-inset ring-slate-200 transition-shadow",
        "focus-within:ring-2 focus-within:ring-brand-500",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span
        className="flex w-11 shrink-0 items-center justify-center text-slate-400"
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <input
        id={id}
        disabled={disabled}
        className={cn(
          "icon-input-field min-w-0 flex-1 border-0 bg-transparent py-2.5 text-sm text-slate-900",
          "placeholder:text-slate-400 focus:outline-none focus:ring-0",
          endSlot ? "pr-1" : "pr-3",
          className,
        )}
        {...props}
      />
      {endSlot ? (
        <div className="flex shrink-0 items-center pr-1">{endSlot}</div>
      ) : null}
    </div>
  );
}
