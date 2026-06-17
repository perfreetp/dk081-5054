import { useLocation } from "react-router-dom";
import { Activity, AlertTriangle, Clock, Users } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { SHIFT_META } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/Bits";

const TITLES: Record<string, string> = {
  "/": "实时总览",
  "/alerts": "告警处置",
  "/strategy": "区域策略",
  "/linkage": "联动记录",
  "/shift": "排班值守",
  "/reports": "统计报表",
};

export function TopBar() {
  const { pathname } = useLocation();
  const clock = useOpsStore((s) => s.clock);
  const alerts = useOpsStore((s) => s.alerts);
  const shifts = useOpsStore((s) => s.shifts);

  const pending = alerts.filter(
    (a) => a.status === "pending" || a.status === "dispatched" || a.status === "handling",
  ).length;
  const activeShift = shifts.find((s) => s.status === "active");
  const onDuty = activeShift?.personnel.length ?? 0;
  const title = TITLES[pathname] ?? "指挥中台";

  return (
    <header className="z-20 flex h-14 shrink-0 items-center gap-4 border-b border-line bg-void/70 px-5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <StatusDot className="bg-ok" pulse />
        <span className="font-mono text-[11px] tracking-widest text-ok">LIVE</span>
        <span className="text-ink-mute">/</span>
        <span className="text-[13px] font-medium text-ink">{title}</span>
      </div>

      <div className="ml-auto flex items-center gap-5">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-ink-mute" />
          <span className="text-[11px] text-ink-mute">班次</span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[11px] font-medium",
              SHIFT_META[activeShift?.shiftType ?? "day"].bg,
              SHIFT_META[activeShift?.shiftType ?? "day"].text,
            )}
          >
            {SHIFT_META[activeShift?.shiftType ?? "day"].label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-info" />
          <span className="font-mono text-sm text-ink">{onDuty}</span>
          <span className="text-[11px] text-ink-mute">在岗</span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-crit" />
          <span className="font-mono text-sm text-crit">{pending}</span>
          <span className="text-[11px] text-ink-mute">待处置</span>
        </div>

        <div className="flex items-center gap-2 border-l border-line pl-5">
          <Clock className="h-4 w-4 text-amber" />
          <span className="font-mono text-base font-semibold tabular text-amber text-glow">
            {clock}
          </span>
        </div>
      </div>
    </header>
  );
}
