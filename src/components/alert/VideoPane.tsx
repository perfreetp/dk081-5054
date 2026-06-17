import { motion } from "framer-motion";
import { Crosshair, Radio } from "lucide-react";
import type { Alert } from "@/types";
import { LEVEL_META, formatDuration } from "@/lib/meta";
import { Corners } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";

export function VideoPane({ alert, clock }: { alert: Alert; clock: string }) {
  const lvl = LEVEL_META[alert.level];

  return (
    <div className="relative h-full w-full overflow-hidden rounded border border-line bg-black">
      <div
        className="panel-grid absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, #18222f 0%, #090c12 70%, #05070b 100%)",
        }}
      />

      <motion.div
        className="absolute"
        style={{ left: "44%", top: "40%" }}
        animate={{ x: [0, 44, 8, -24, 0], y: [0, 20, -14, 10, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative">
          <div className="h-12 w-7 rounded-sm border border-amber/70 bg-amber/25" />
          <div className="absolute -inset-3 rounded border border-dashed border-amber/50" />
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{ boxShadow: "0 0 12px 2px rgba(245,181,68,0.4)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
      >
        <div className="h-full w-full bg-amber/40" />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 90px 24px rgba(0,0,0,0.85)" }}
      />

      <Corners />

      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] font-medium text-crit">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-crit" />
          REC
        </span>
        <span className="font-mono text-[10px] text-ink-dim">CAM-{alert.areaId}-01</span>
        <span className="text-[10px] text-ink">{alert.areaName}</span>
      </div>
      <div className="absolute right-3 top-3 font-mono text-[10px] text-ink-dim">{clock}</div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-amber/25">
        <Crosshair className="h-9 w-9" />
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
        <div>
          <div className={cn("font-mono text-2xl font-bold tabular text-glow", lvl.text)}>
            {formatDuration(alert.durationSec)}
          </div>
          <div className="text-[10px] text-ink-mute">滞留计时 · 阈值触发中</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-ok">
          <Radio className="h-3 w-3" />
          信号正常
        </div>
      </div>
    </div>
  );
}
