import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Ban, Eye, Flame, RefreshCw } from "lucide-react";
import type { Alert } from "@/types";
import { LEVEL_META, STATUS_META, formatDuration } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { useOpsStore } from "@/store/useOpsStore";
import { LevelBar, Tag } from "@/components/ui/Bits";

export function AlertRow({ alert, active }: { alert: Alert; active?: boolean }) {
  const navigate = useNavigate();
  const selectAlert = useOpsStore((s) => s.selectAlert);
  const markAlert = useOpsStore((s) => s.markAlert);
  const lvl = LEVEL_META[alert.level];
  const st = STATUS_META[alert.status];
  const isPending = alert.status === "pending";

  const open = () => {
    selectAlert(alert.id);
    navigate("/alerts");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={open}
      className={cn(
        "group flex cursor-pointer items-stretch gap-3 border-b border-line/60 px-3 py-2.5 transition-colors hover:bg-white/5",
        active && "bg-amber/5",
      )}
    >
      <LevelBar className={lvl.dot} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-ink">{alert.areaName}</span>
          <Tag>{alert.id.slice(-6)}</Tag>
          {alert.isRecurrent && (
            <span className="flex items-center gap-0.5 text-[10px] text-focus">
              <RefreshCw className="h-2.5 w-2.5" />
              反复
            </span>
          )}
          <span className="ml-auto font-mono text-[11px] text-ink-mute">
            {alert.triggeredAt.slice(-5)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="truncate text-[11px] text-ink-dim">{alert.description}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={cn("font-mono text-sm font-semibold tabular", lvl.text)}>
            {formatDuration(alert.durationSec)}
          </span>
          <span className="text-[10px] text-ink-mute">滞留时长</span>
          <span
            className={cn(
              "ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium",
              st.bg,
              st.text,
            )}
          >
            {st.label}
          </span>
        </div>
      </div>
      {isPending && (
        <div className="flex flex-col justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              markAlert(alert.id, "false");
            }}
            title="标记误报"
            className="flex h-6 w-6 items-center justify-center rounded text-ink-mute hover:bg-crit/15 hover:text-crit"
          >
            <Ban className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              markAlert(alert.id, "watch");
            }}
            title="标记关注"
            className="flex h-6 w-6 items-center justify-center rounded text-ink-mute hover:bg-focus/15 hover:text-focus"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {alert.mark === "escalate" && (
        <Flame className="my-auto h-3.5 w-3.5 shrink-0 text-crit" />
      )}
    </motion.div>
  );
}
