import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CircleDot } from "lucide-react";
import type { DrillKey } from "./HandoverCard";
import { useOpsStore } from "@/store/useOpsStore";
import { CLEARANCE_META, LEVEL_META, STATUS_META } from "@/lib/meta";
import { cn } from "@/lib/utils";

const DRILL_LABEL: Record<string, string> = {
  newAlerts: "本班新增告警",
  handled: "已处置告警",
  pending: "待跟进告警",
  persons: "反复人员相关告警",
  areas: "高频区域告警",
};

export function HandoverDrill({ drill }: { drill: DrillKey }) {
  const navigate = useNavigate();
  const alerts = useOpsStore((s) => s.alerts);
  const selectAlert = useOpsStore((s) => s.selectAlert);

  const list = useMemo(() => {
    if (!drill) return [];
    switch (drill.kind) {
      case "newAlerts":
        return alerts.filter((a) => a.triggeredAt.startsWith("2026-06-17"));
      case "handled":
        return alerts.filter((a) => a.status === "closed");
      case "pending":
        return alerts.filter((a) => a.status !== "closed" && a.status !== "falseAlarm");
      case "persons":
        return alerts.filter((a) => a.isRecurrent);
      case "areas":
        return drill.area
          ? alerts.filter((a) => a.areaName === drill.area)
          : alerts.filter((a) => a.status !== "falseAlarm");
      default:
        return [];
    }
  }, [drill, alerts]);

  if (!drill) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-line bg-void/20 p-6 text-center text-[11px] text-ink-mute">
        点击左侧本班新增、已处置、待跟进、反复人员或高频区域即可下钻查看对应告警
      </div>
    );
  }

  const title = DRILL_LABEL[drill.kind] + (drill.kind === "areas" && drill.area ? ` · ${drill.area}` : "");

  const goAlert = (id: string) => {
    selectAlert(id);
    navigate("/alerts");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-ink-mute">{title}</span>
        <span className="font-mono text-[10px] text-ink-mute">{list.length} 条</span>
      </div>
      <div className="max-h-[calc(100vh-280px)] space-y-1.5 overflow-y-auto pr-1">
        {list.length ? (
          list.map((a) => {
            const lvl = LEVEL_META[a.level];
            const st = STATUS_META[a.status];
            return (
              <button
                key={a.id}
                onClick={() => goAlert(a.id)}
                className="group flex w-full items-center gap-2 rounded-md border border-line bg-void/30 px-2.5 py-2 text-left transition-colors hover:border-amber/40 hover:bg-amber/5"
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", lvl.dot)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-ink">{a.id.slice(-6)}</span>
                    <span className={cn("rounded px-1 text-[9px]", lvl.bg, lvl.text)}>{lvl.label}</span>
                    <span className={cn("rounded px-1 text-[9px]", st.bg, st.text)}>{st.label}</span>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-ink-dim">{a.areaName} · {a.description}</div>
                  {a.status === "closed" && a.clearanceResult && (
                    <div className="mt-0.5 text-[10px] text-ink-mute">
                      处置结果 · {CLEARANCE_META[a.clearanceResult]}
                      {a.handlerName ? ` · ${a.handlerName}` : ""}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-3 w-3 shrink-0 text-ink-mute transition-transform group-hover:translate-x-0.5 group-hover:text-amber" />
              </button>
            );
          })
        ) : (
          <div className="py-6 text-center text-[11px] text-ink-mute">
            <CircleDot className="mx-auto mb-1 h-5 w-5 text-ink-mute/50" />
            该分类下暂无告警
          </div>
        )}
      </div>
    </div>
  );
}
