import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
        checked ? "border-amber bg-amber/30" : "border-line bg-void",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full transition-transform",
          checked ? "translate-x-4 bg-amber" : "translate-x-0.5 bg-ink-mute",
        )}
      />
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[11px] text-ink-dim">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-[10px] text-ink-mute">{hint}</span>}
    </label>
  );
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded border border-line bg-void/50 px-2 py-1 focus-within:border-amber/50">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="text-ink-mute hover:text-amber"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 bg-transparent text-center font-mono text-sm text-ink outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className="text-ink-mute hover:text-amber"
      >
        +
      </button>
      {unit && <span className="text-[10px] text-ink-mute">{unit}</span>}
    </div>
  );
}

export function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-line bg-void/50 px-2 py-1 font-mono text-[12px] text-ink outline-none focus:border-amber/50 [color-scheme:dark]"
    />
  );
}
