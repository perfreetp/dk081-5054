import { useState } from "react";
import { DoorClosed, Filter, Phone, Radio } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, Tag } from "@/components/ui/Bits";
import { LINKAGE_META } from "@/lib/meta";
import { cn } from "@/lib/utils";
import type { LinkageType } from "@/types";

const TYPE_ICON: Record<LinkageType, typeof Radio> = {
  access: DoorClosed,
  broadcast: Radio,
  intercom: Phone,
};

const RESULT_META: Record<string, { label: string; text: string; bg: string }> = {
  success: { label: "成功", text: "text-ok", bg: "bg-ok/12" },
  failed: { label: "失败", text: "text-crit", bg: "bg-crit/12" },
  pending: { label: "执行中", text: "text-amber", bg: "bg-amber/12" },
};

export default function Linkage() {
  const linkages = useOpsStore((s) => s.linkages);
  const [filter, setFilter] = useState<LinkageType | "all">("all");

  const counts = {
    all: linkages.length,
    access: linkages.filter((l) => l.type === "access").length,
    broadcast: linkages.filter((l) => l.type === "broadcast").length,
    intercom: linkages.filter((l) => l.type === "intercom").length,
  };
  const list = filter === "all" ? linkages : linkages.filter((l) => l.type === filter);
  const successRate = linkages.length
    ? Math.round((linkages.filter((l) => l.result === "success").length / linkages.length) * 100)
    : 0;

  const tabs: {
    key: LinkageType | "all";
    label: string;
    icon?: typeof Radio;
  }[] = [
    { key: "all", label: "全部" },
    { key: "access", label: "门禁", icon: DoorClosed },
    { key: "broadcast", label: "广播", icon: Radio },
    { key: "intercom", label: "对讲", icon: Phone },
  ];

  return (
    <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-5">
      <Panel title="联动类型" icon={<Filter className="h-4 w-4" />} bodyClass="p-2">
        <div className="space-y-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-3 py-2.5 text-[13px] transition-colors",
                filter === t.key
                  ? "bg-amber/10 text-amber"
                  : "text-ink-dim hover:bg-white/5 hover:text-ink",
              )}
            >
              {t.icon && <t.icon className="h-3.5 w-3.5" />}
              <span className="flex-1 text-left">{t.label}</span>
              <span className="font-mono text-[11px] text-ink-mute">{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded border border-line bg-void/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-mute">执行成功率</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular text-ok">{successRate}%</div>
        </div>
      </Panel>

      <Panel
        title="联动事件时间线"
        action={<Tag>{list.length} 条</Tag>}
        bodyClass="p-0"
      >
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {list.length ? (
            <div className="relative px-5 py-4 pl-9">
              <span className="absolute left-[26px] top-4 bottom-4 w-px bg-line" />
              {list.map((l) => {
                const meta = LINKAGE_META[l.type];
                const res = RESULT_META[l.result];
                const Icon = TYPE_ICON[l.type];
                return (
                  <div key={l.id} className="relative mb-4">
                    <span
                      className={cn(
                        "absolute -left-[27px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-panel",
                        meta.text,
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="rounded-md border border-line bg-panel/60 p-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", meta.bg, meta.text)}>
                          {meta.label}
                        </span>
                        <span className="text-[13px] font-medium text-ink">{l.areaName}</span>
                        <span className="ml-auto font-mono text-[11px] text-ink-mute">
                          {l.triggeredAt.slice(11)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] text-ink-dim">{l.action}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px]", res.bg, res.text)}>
                          {res.label}
                        </span>
                        <span className="font-mono text-[10px] text-ink-mute">
                          来源 {l.sourceAlertId}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="暂无联动记录" />
          )}
        </div>
      </Panel>
    </div>
  );
}
