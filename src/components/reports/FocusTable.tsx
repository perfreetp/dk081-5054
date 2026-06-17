import { AlertTriangle, Clock, User } from "lucide-react";
import type { FocusPersonStat } from "@/types";
import { cn } from "@/lib/utils";

export function FocusTable({ persons }: { persons: FocusPersonStat[] }) {
  const max = Math.max(1, ...persons.map((p) => p.count));
  return (
    <div className="space-y-2">
      {persons.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-3 rounded-md border border-line bg-void/40 px-3 py-2"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-crit/15 text-crit">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-ink">{p.name}</span>
              {p.count >= 5 && (
                <span className="flex items-center gap-0.5 rounded bg-crit/15 px-1 text-[9px] text-crit">
                  <AlertTriangle className="h-2.5 w-2.5" /> 高频
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {p.areas.map((a) => (
                <span key={a} className="rounded bg-white/5 px-1 text-[9px] text-ink-mute">
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-mono text-sm font-bold text-crit">{p.count}</div>
            <div className="flex items-center gap-0.5 text-[9px] text-ink-mute">
              <Clock className="h-2.5 w-2.5" /> {p.lastSeen.slice(5)}
            </div>
          </div>
          <div className="hidden w-16 shrink-0 sm:block">
            <div className="h-1.5 overflow-hidden rounded-full bg-void">
              <div
                className={cn("h-full rounded-full", p.count >= 5 ? "bg-crit" : "bg-amber")}
                style={{ width: `${(p.count / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
