import { useMemo, useState } from "react";
import { Building2, Download, Flame, Gauge, Layers, Timer } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { KpiCard, Tag } from "@/components/ui/Bits";
import { Heatmap } from "@/components/reports/Heatmap";
import { EfficiencyChart } from "@/components/reports/EfficiencyChart";
import { FocusTable } from "@/components/reports/FocusTable";
import {
  AREAS,
  AREA_STATS,
  buildHourHeat,
  EFFICIENCY,
  FOCUS_PERSONS,
  HANDOVER,
} from "@/data/mock";
import { formatDurationZh } from "@/lib/meta";
import { cn } from "@/lib/utils";

const FLOORS = ["全部", "1F", "3F"];

export default function Reports() {
  const [floor, setFloor] = useState("全部");
  const heat = useMemo(() => buildHourHeat(), []);

  const stats = AREA_STATS.filter((s) => floor === "全部" || s.floor === floor);
  const totalLoiter = stats.reduce((a, s) => a + s.loiterCount, 0);
  const avgArrival = Math.round(
    stats.reduce((a, s) => a + s.avgArrivalSec, 0) / Math.max(1, stats.length),
  );
  const avgClearance = stats.reduce((a, s) => a + s.clearanceRate, 0) / Math.max(1, stats.length);
  const avgFalse = stats.reduce((a, s) => a + s.falseRate, 0) / Math.max(1, stats.length);

  const maxLoiter = Math.max(...AREA_STATS.map((s) => s.loiterCount));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-panel/60 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[12px] text-ink-dim">
          <Building2 className="h-3.5 w-3.5" /> 总院
        </span>
        <span className="h-4 w-px bg-line" />
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-ink-mute" />
          {FLOORS.map((f) => (
            <button
              key={f}
              onClick={() => setFloor(f)}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] transition-colors",
                floor === f ? "bg-amber/15 text-amber" : "text-ink-mute hover:text-ink",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="ml-auto flex items-center gap-1.5 rounded border border-amber/30 px-3 py-1 text-[11px] text-amber hover:bg-amber/10">
          <Download className="h-3.5 w-3.5" /> 导出复盘
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="滞留总量"
          value={totalLoiter}
          unit="次"
          icon={<Flame className="h-4 w-4" />}
          tone="text-amber"
          delta="6.2%"
          deltaUp
          progress={78}
        />
        <KpiCard
          label="平均到场"
          value={formatDurationZh(avgArrival)}
          icon={<Timer className="h-4 w-4" />}
          tone="text-info"
          delta="4.1%"
          deltaUp={false}
          progress={62}
        />
        <KpiCard
          label="平均清场率"
          value={`${Math.round(avgClearance * 100)}%`}
          icon={<Gauge className="h-4 w-4" />}
          tone="text-ok"
          delta="1.8%"
          deltaUp
          progress={Math.round(avgClearance * 100)}
        />
        <KpiCard
          label="平均误报率"
          value={`${Math.round(avgFalse * 100)}%`}
          icon={<Flame className="h-4 w-4" />}
          tone="text-crit"
          delta="0.9%"
          deltaUp={false}
          progress={Math.round(avgFalse * 100)}
        />
      </div>

      <Panel title="滞留热力图 · 24h × 区域" icon={<Flame className="h-4 w-4" />} accent bodyClass="p-4">
        <Heatmap heat={heat} areas={AREAS} />
      </Panel>

      <div className="grid grid-cols-2 gap-5">
        <Panel title="处置效率趋势" icon={<Gauge className="h-4 w-4" />} bodyClass="p-3">
          <EfficiencyChart data={EFFICIENCY} />
        </Panel>
        <Panel title="重点关注人员" icon={<Flame className="h-4 w-4" />} bodyClass="p-3">
          <FocusTable persons={FOCUS_PERSONS} />
        </Panel>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-5">
        <Panel title="区域处置明细" icon={<Layers className="h-4 w-4" />} bodyClass="p-3">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.areaId} className="rounded-md border border-line bg-void/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink">{s.areaName}</span>
                  <Tag>{s.floor}</Tag>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-mono text-lg font-bold text-amber">{s.loiterCount}</div>
                    <div className="text-[9px] text-ink-mute">滞留</div>
                  </div>
                  <div>
                    <div className="font-mono text-lg font-bold text-info">
                      {formatDurationZh(s.avgArrivalSec)}
                    </div>
                    <div className="text-[9px] text-ink-mute">到场</div>
                  </div>
                  <div>
                    <div className="font-mono text-lg font-bold text-ok">
                      {Math.round(s.clearanceRate * 100)}%
                    </div>
                    <div className="text-[9px] text-ink-mute">清场</div>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-[9px] text-ink-mute">滞留</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-void">
                      <div
                        className="h-full rounded-full bg-amber"
                        style={{ width: `${(s.loiterCount / maxLoiter) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-[9px] text-ink-mute">误报</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-void">
                      <div
                        className="h-full rounded-full bg-crit"
                        style={{ width: `${s.falseRate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="高频时段" icon={<Timer className="h-4 w-4" />} bodyClass="p-3">
          <div className="space-y-2">
            {HANDOVER.focusSlots.map((s) => (
              <div
                key={s.slot}
                className="flex items-center gap-3 rounded border border-line bg-void/40 px-3 py-2"
              >
                <div className="font-mono text-[12px] text-amber">{s.slot}</div>
                <div className="flex-1 text-[11px] text-ink-dim">{s.area}</div>
                <div className="font-mono text-sm font-bold text-crit">{s.count}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded border border-line bg-void/30 p-3 text-[10px] leading-relaxed text-ink-mute">
            建议在 09:00-10:00 收费窗口与门诊大厅增配 1 名巡逻岗，缩短到场时长。
          </div>
        </Panel>
      </div>
    </div>
  );
}
