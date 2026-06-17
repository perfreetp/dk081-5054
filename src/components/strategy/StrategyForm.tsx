import { Plus, Trash2 } from "lucide-react";
import type { AreaStrategy } from "@/types";
import { useOpsStore } from "@/store/useOpsStore";
import { Field, NumberInput, TimeInput, Toggle } from "@/components/ui/Controls";
import { LINKAGE_META } from "@/lib/meta";
import type { LinkageType } from "@/types";

const toH = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

function Band({
  start,
  end,
  color,
  label,
}: {
  start: number;
  end: number;
  color: string;
  label: string;
}) {
  const left = (start / 24) * 100;
  const width = ((end - start) / 24) * 100;
  return (
    <div
      className="absolute top-0 flex h-full items-center justify-center text-[8px] text-void/80"
      style={{ left: `${left}%`, width: `${width}%`, background: color }}
    >
      {label}
    </div>
  );
}

export function StrategyForm({ strategy }: { strategy: AreaStrategy }) {
  const update = useOpsStore((s) => s.updateStrategy);
  const toggleLinkage = useOpsStore((s) => s.toggleLinkage);
  const set = (patch: Partial<AreaStrategy>) => update(strategy.areaId, patch);

  const night = strategy.nightRule;
  const nightBands = night.enabled
    ? toH(night.start) < toH(night.end)
      ? [{ s: toH(night.start), e: toH(night.end) }]
      : [{ s: 0, e: toH(night.end) }, { s: toH(night.start), e: 24 }]
    : [];

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-line bg-void/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink">滞留时长阈值</span>
          <span className="font-mono text-[10px] text-ink-mute">基础判定参数</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <NumberInput
            value={strategy.thresholdSec}
            onChange={(v) => set({ thresholdSec: v })}
            min={60}
            max={1800}
            step={30}
            unit="秒"
          />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-void">
            <div
              className="h-full rounded-full bg-amber"
              style={{ width: `${(strategy.thresholdSec / 1800) * 100}%` }}
            />
          </div>
        </div>
        <p className="mt-2 text-[10px] text-ink-mute">
          超过该时长的静止停留即触发告警，高峰时段按候诊容忍度上浮
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink">候诊高峰时段</span>
          <button
            onClick={() =>
              set({
                peakHours: [
                  ...strategy.peakHours,
                  { start: "10:00", end: "11:00", patientWaitToleranceSec: 600 },
                ],
              })
            }
            className="flex items-center gap-1 rounded border border-amber/30 px-2 py-1 text-[11px] text-amber hover:bg-amber/10"
          >
            <Plus className="h-3 w-3" /> 新增
          </button>
        </div>
        <div className="space-y-2">
          {strategy.peakHours.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded border border-line bg-void/40 px-3 py-2"
            >
              <TimeInput
                value={p.start}
                onChange={(v) =>
                  set({
                    peakHours: strategy.peakHours.map((q, idx) =>
                      idx === i ? { ...q, start: v } : q,
                    ),
                  })
                }
              />
              <span className="text-ink-mute">→</span>
              <TimeInput
                value={p.end}
                onChange={(v) =>
                  set({
                    peakHours: strategy.peakHours.map((q, idx) =>
                      idx === i ? { ...q, end: v } : q,
                    ),
                  })
                }
              />
              <div className="ml-auto flex items-center gap-1.5">
                <NumberInput
                  value={p.patientWaitToleranceSec}
                  onChange={(v) =>
                    set({
                      peakHours: strategy.peakHours.map((q, idx) =>
                        idx === i ? { ...q, patientWaitToleranceSec: v } : q,
                      ),
                    })
                  }
                  min={60}
                  max={1800}
                  step={60}
                  unit="容忍秒"
                />
                <button
                  onClick={() =>
                    set({ peakHours: strategy.peakHours.filter((_, idx) => idx !== i) })
                  }
                  className="text-ink-mute hover:text-crit"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-line bg-void/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink">夜间规则</span>
            <Toggle
              checked={night.enabled}
              onChange={() => set({ nightRule: { ...night, enabled: !night.enabled } })}
            />
          </div>
          {night.enabled && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <TimeInput
                  value={night.start}
                  onChange={(v) => set({ nightRule: { ...night, start: v } })}
                />
                <span className="text-ink-mute">→</span>
                <TimeInput
                  value={night.end}
                  onChange={(v) => set({ nightRule: { ...night, end: v } })}
                />
              </div>
              <NumberInput
                value={night.thresholdSec}
                onChange={(v) => set({ nightRule: { ...night, thresholdSec: v } })}
                min={60}
                max={900}
                step={30}
                unit="秒阈值"
              />
            </div>
          )}
        </div>

        <div className="rounded-md border border-line bg-void/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink">节假日规则</span>
            <Toggle
              checked={strategy.holidayRule.enabled}
              onChange={() =>
                set({
                  holidayRule: {
                    ...strategy.holidayRule,
                    enabled: !strategy.holidayRule.enabled,
                  },
                })
              }
            />
          </div>
          {strategy.holidayRule.enabled && (
            <div className="mt-3">
              <NumberInput
                value={strategy.holidayRule.thresholdSec}
                onChange={(v) =>
                  set({ holidayRule: { ...strategy.holidayRule, thresholdSec: v } })
                }
                min={60}
                max={1200}
                step={30}
                unit="秒阈值"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border border-line bg-void/40 p-3">
        <span className="text-[12px] font-medium text-ink">非正常停留判定</span>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Field label="静止时长">
            <NumberInput
              value={strategy.abnormalStayRule.motionlessSec}
              onChange={(v) =>
                set({ abnormalStayRule: { ...strategy.abnormalStayRule, motionlessSec: v } })
              }
              min={30}
              max={600}
              step={30}
              unit="秒"
            />
          </Field>
          <Field label="往返窗口">
            <NumberInput
              value={strategy.abnormalStayRule.revisitWithinMin}
              onChange={(v) =>
                set({
                  abnormalStayRule: { ...strategy.abnormalStayRule, revisitWithinMin: v },
                })
              }
              min={5}
              max={120}
              step={5}
              unit="分"
            />
          </Field>
          <Field label="往返上限">
            <NumberInput
              value={strategy.abnormalStayRule.maxRevisitCount}
              onChange={(v) =>
                set({
                  abnormalStayRule: { ...strategy.abnormalStayRule, maxRevisitCount: v },
                })
              }
              min={1}
              max={10}
              step={1}
              unit="次"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-md border border-line bg-void/40 p-3">
        <span className="text-[12px] font-medium text-ink">联动提醒开关</span>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {(["access", "broadcast", "intercom"] as LinkageType[]).map((t) => (
            <div
              key={t}
              className="flex items-center justify-between rounded border border-line bg-void/50 px-3 py-2"
            >
              <span className="text-[12px] text-ink">{LINKAGE_META[t].label}</span>
              <Toggle
                checked={strategy.linkage[t]}
                onChange={() => toggleLinkage(strategy.areaId, t)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-line bg-void/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink">规则生效预览（24h）</span>
          <span className="font-mono text-[10px] text-ink-mute">00 — 24</span>
        </div>
        <div className="relative h-7 overflow-hidden rounded bg-void">
          <div className="absolute inset-0 panel-grid" />
          {nightBands.map((b, i) => (
            <Band key={`n${i}`} start={b.s} end={b.e} color="rgba(79,195,247,0.45)" label="夜" />
          ))}
          {strategy.peakHours.map((p, i) => (
            <Band
              key={`p${i}`}
              start={toH(p.start)}
              end={toH(p.end)}
              color="rgba(245,181,68,0.5)"
              label="峰"
            />
          ))}
        </div>
        <div className="mt-2 flex gap-4 text-[10px] text-ink-mute">
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-info/45" /> 夜间规则
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-amber/50" /> 候诊高峰
          </span>
        </div>
      </div>
    </div>
  );
}
