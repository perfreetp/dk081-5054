import { useState } from "react";
import { useOpsStore } from "@/store/useOpsStore";
import { LEVEL_RANK } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { AlertRow } from "./AlertRow";

type Filter = "active" | "watch" | "closed";

const TABS: { key: Filter; label: string }[] = [
  { key: "active", label: "待处置" },
  { key: "watch", label: "关注" },
  { key: "closed", label: "已处置" },
];

export function AlertQueue({ selectedId }: { selectedId: string | null }) {
  const alerts = useOpsStore((s) => s.alerts);
  const [filter, setFilter] = useState<Filter>("active");

  const counts = {
    active: alerts.filter(
      (a) => a.status === "pending" || a.status === "dispatched" || a.status === "handling",
    ).length,
    watch: alerts.filter((a) => a.status === "watch" || a.isRecurrent).length,
    closed: alerts.filter((a) => a.status === "closed" || a.status === "falseAlarm").length,
  };

  const list = alerts
    .filter((a) => {
      if (filter === "active")
        return a.status === "pending" || a.status === "dispatched" || a.status === "handling";
      if (filter === "watch") return a.status === "watch" || a.isRecurrent;
      return a.status === "closed" || a.status === "falseAlarm";
    })
    .sort((a, b) => {
      if (filter === "closed") return b.triggeredAt.localeCompare(a.triggeredAt);
      return LEVEL_RANK[b.level] - LEVEL_RANK[a.level] || b.durationSec - a.durationSec;
    });

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-[12px] transition-colors",
              filter === t.key
                ? "border-amber text-amber"
                : "border-transparent text-ink-mute hover:text-ink-dim",
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded px-1 font-mono text-[10px]",
                filter === t.key ? "bg-amber/15 text-amber" : "bg-white/5 text-ink-mute",
              )}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {list.length ? (
          list.map((a) => <AlertRow key={a.id} alert={a} active={a.id === selectedId} />)
        ) : (
          <div className="py-10 text-center text-[12px] text-ink-mute">暂无相关告警</div>
        )}
      </div>
    </div>
  );
}
