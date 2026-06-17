import { useNavigate } from "react-router-dom";
import { Camera, Clock, Users } from "lucide-react";
import type { Area } from "@/types";
import { AREA_STATUS_META, formatDuration } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { effectiveThreshold, useOpsStore } from "@/store/useOpsStore";
import { StatusDot, Tag } from "@/components/ui/Bits";

export function AreaCard({ area }: { area: Area }) {
  const navigate = useNavigate();
  const selectAlert = useOpsStore((s) => s.selectAlert);
  const strategies = useOpsStore((s) => s.strategies);
  const strat = strategies.find((s) => s.areaId === area.id);
  const now = new Date();
  const threshold = strat ? effectiveThreshold(strat, now) : 300;
  const meta = AREA_STATUS_META[area.status];
  const pct = Math.min(100, Math.round((area.maxDurationSec / threshold) * 100));
  const isCritical = area.status === "critical";

  const open = () => {
    selectAlert(null);
    navigate("/alerts");
  };

  return (
    <button
      onClick={open}
      className={cn(
        "group relative overflow-hidden rounded-md border bg-panel/70 p-3 text-left transition-colors hover:bg-elevated",
        meta.border,
        isCritical && "animate-crit-breath",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot className={meta.dot} pulse={isCritical} />
          <span className="text-[13px] font-semibold text-ink">{area.name}</span>
        </div>
        <Tag>{area.floor}</Tag>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className={cn("font-mono text-2xl font-bold tabular", meta.text)}>
              {area.currentLoitering}
            </span>
            <span className="text-[10px] text-ink-mute">在滞留</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-ink-mute">
            <Camera className="h-2.5 w-2.5" />
            {area.cameraCount} 路
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 font-mono text-sm tabular text-ink">
            <Clock className="h-3 w-3 text-amber" />
            {formatDuration(area.maxDurationSec)}
          </div>
          <div className="mt-0.5 text-[10px] text-ink-mute">阈值 {formatDuration(threshold)}</div>
        </div>
      </div>

      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-void">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100 ? "bg-crit" : pct >= 70 ? "bg-amber" : "bg-ok",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] text-ink-mute">
          <Users className="h-2.5 w-2.5" />
          {area.type}
        </span>
        <span className={cn("text-[10px] font-medium", meta.text)}>{meta.label}</span>
      </div>
    </button>
  );
}
