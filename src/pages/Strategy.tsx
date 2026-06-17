import { useState } from "react";
import { Moon, SlidersHorizontal, Sun } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Bits";
import { StrategyForm } from "@/components/strategy/StrategyForm";
import { formatDuration } from "@/lib/meta";
import { cn } from "@/lib/utils";

export default function Strategy() {
  const strategies = useOpsStore((s) => s.strategies);
  const [selectedId, setSelectedId] = useState(strategies[0]?.areaId ?? "");
  const selected = strategies.find((s) => s.areaId === selectedId) ?? strategies[0];

  return (
    <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-5">
      <Panel title="区域列表" icon={<SlidersHorizontal className="h-4 w-4" />} bodyClass="p-2">
        <div className="space-y-1.5">
          {strategies.map((s) => {
            const active = s.areaId === selectedId;
            const linkageCount =
              Number(s.linkage.access) + Number(s.linkage.broadcast) + Number(s.linkage.intercom);
            return (
              <button
                key={s.areaId}
                onClick={() => setSelectedId(s.areaId)}
                className={cn(
                  "w-full rounded border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-amber/40 bg-amber/10"
                    : "border-line bg-void/30 hover:bg-white/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-[13px] font-medium", active ? "text-amber" : "text-ink")}>
                    {s.areaName}
                  </span>
                  <Tag>{formatDuration(s.thresholdSec)}</Tag>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-ink-mute">
                  <span className="flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    {s.peakHours.length} 峰段
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      s.nightRule.enabled ? "text-info" : "text-ink-mute",
                    )}
                  >
                    <Moon className="h-3 w-3" />
                    夜{s.nightRule.enabled ? "开" : "关"}
                  </span>
                  <span className="ml-auto">联动 {linkageCount}/3</span>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel
        title={`${selected?.areaName ?? ""} · 策略配置`}
        icon={<SlidersHorizontal className="h-4 w-4" />}
        accent
        action={<Tag>已生效</Tag>}
        bodyClass="p-5"
      >
        {selected && <StrategyForm strategy={selected} />}
      </Panel>
    </div>
  );
}
