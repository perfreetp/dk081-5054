import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium leading-none",
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      {children}
    </span>
  );
}

export function StatusDot({
  className,
  pulse,
}: {
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            className,
          )}
        />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", className)} />
    </span>
  );
}

export function LevelBar({ className }: { className?: string }) {
  return <span className={cn("h-full w-1 shrink-0 rounded-full", className)} />;
}

export function Tag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-line bg-void/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-ink-dim",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  icon,
  delta,
  deltaUp,
  tone = "text-amber",
  progress,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  delta?: string;
  deltaUp?: boolean;
  tone?: string;
  progress?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-panel/70 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-mute">
          {label}
        </span>
        {icon && <span className={tone}>{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={cn("font-mono text-3xl font-semibold tabular", tone)}>
          {value}
        </span>
        {unit && <span className="text-xs text-ink-mute">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {delta ? (
          <span
            className={cn(
              "flex items-center gap-1 text-[11px]",
              deltaUp ? "text-ok" : "text-crit",
            )}
          >
            {deltaUp ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta}
          </span>
        ) : (
          <span />
        )}
        <span className="font-mono text-[10px] text-ink-mute">vs 昨日</span>
      </div>
      {progress !== undefined && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-void">
          <motion.div
            className={cn("h-full rounded-full", tone.replace("text-", "bg-"))}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center py-10 text-sm text-ink-mute">
      {text}
    </div>
  );
}
