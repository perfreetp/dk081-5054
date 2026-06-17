import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, CheckCircle2, Clock, Moon, Play, RotateCcw, Sun } from "lucide-react";
import type { AlertLevel, AreaStrategy } from "@/types";
import { effectiveRule, effectiveThreshold, useOpsStore } from "@/store/useOpsStore";
import { AREA_STATUS_META, LEVEL_META, formatDuration } from "@/lib/meta";
import { cn } from "@/lib/utils";

const RULE_META: Record<string, { label: string; text: string; bg: string; icon: typeof Sun }> = {
  holiday: { label: "节假日", text: "text-focus", bg: "bg-focus/15", icon: Calendar },
  night: { label: "夜间", text: "text-info", bg: "bg-info/15", icon: Moon },
  peak: { label: "高峰", text: "text-amber", bg: "bg-amber/15", icon: Sun },
  base: { label: "基础", text: "text-ink", bg: "bg-white/5", icon: Clock },
};

function reevaluateLevel(durationSec: number, thresholdSec: number): AlertLevel {
  const ratio = durationSec / thresholdSec;
  if (ratio >= 1.6) return "critical";
  if (ratio >= 1.2) return "high";
  if (ratio >= 0.9) return "medium";
  return "low";
}
const LEVEL_RANK: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

export function StrategySandbox() {
  const strategies = useOpsStore((s) => s.strategies);
  const alerts = useOpsStore((s) => s.alerts);
  const updateStrategy = useOpsStore((s) => s.updateStrategy);

  const now = new Date();
  const [hour, setHour] = useState<number>(now.getHours());
  const [forceNight, setForceNight] = useState(false);
  const [forceHoliday, setForceHoliday] = useState(false);
  const [sandboxActive, setSandboxActive] = useState(false);

  const sandboxDate = useMemo(() => {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return d;
  }, [hour]);

  const effOpts = useMemo(
    () => ({ forceHoliday: sandboxActive && forceHoliday }),
    [sandboxActive, forceHoliday],
  );

  const previews = useMemo(() => {
    if (!sandboxActive) return [];
    return strategies.map((s: AreaStrategy) => {
      const strat = forceNight
        ? { ...s, nightRule: { ...s.nightRule, enabled: true, start: "00:00", end: "23:59" } }
        : s;
      const rule = effectiveRule(strat, sandboxDate, effOpts);
      const threshold = effectiveThreshold(strat, sandboxDate, effOpts);
      const areaAlerts = alerts.filter(
        (a) => a.areaId === s.areaId && a.status !== "closed" && a.status !== "falseAlarm",
      );
      const projected = areaAlerts.map((a) => {
        const next = a.mark === "escalate" ? "critical" : reevaluateLevel(a.durationSec, threshold);
        return { alert: a, next, changed: next !== a.level };
      });
      const maxDur = areaAlerts.reduce((m, a) => Math.max(m, a.durationSec), 0);
      const maxRatio = threshold ? maxDur / threshold : 0;
      const active = areaAlerts.length;
      const status: "normal" | "warning" | "critical" =
        maxRatio >= 1.6 || active >= 3
          ? "critical"
          : maxRatio >= 1 || active >= 1
            ? "warning"
            : "normal";
      const escalations = projected.filter(
        (p) => p.changed && LEVEL_RANK[p.next] > LEVEL_RANK[p.alert.level],
      ).length;
      return { strat, rule, threshold, status, projected, escalations, areaAlerts };
    });
  }, [sandboxActive, strategies, alerts, sandboxDate, effOpts, forceNight]);

  const applySandbox = () => {
    if (!sandboxActive) return;
    for (const p of previews) {
      if (forceNight) {
        updateStrategy(p.strat.areaId, {
          nightRule: { ...p.strat.nightRule, enabled: true },
        });
      }
      if (forceHoliday) {
        updateStrategy(p.strat.areaId, {
          holidayRule: { ...p.strat.holidayRule, enabled: true },
        });
      }
    }
    setSandboxActive(false);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-line bg-void/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-ink-mute">时间沙盘</span>
          {sandboxActive ? (
            <span className="flex items-center gap-1 font-mono text-[10px] text-amber">
              <Play className="h-2.5 w-2.5" /> 沙盘运行中
            </span>
          ) : (
            <span className="font-mono text-[10px] text-ink-mute">未激活</span>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <div className="mb-1 flex items-center justify-between text-[10px] text-ink-mute">
              <span>模拟时间</span>
              <span className="font-mono text-amber">{String(hour).padStart(2, "0")}:00</span>
            </div>
            <input
              type="range"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => {
                setHour(Number(e.target.value));
                setSandboxActive(true);
              }}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-void accent-amber"
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-ink-mute">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>23</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setForceNight((v) => !v);
                setSandboxActive(true);
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded border py-1.5 text-[11px] transition-colors",
                forceNight
                  ? "border-info/40 bg-info/15 text-info"
                  : "border-line text-ink-dim hover:bg-white/5",
              )}
            >
              <Moon className="h-3 w-3" /> 强制夜间
            </button>
            <button
              onClick={() => {
                setForceHoliday((v) => !v);
                setSandboxActive(true);
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded border py-1.5 text-[11px] transition-colors",
                forceHoliday
                  ? "border-focus/40 bg-focus/15 text-focus"
                  : "border-line text-ink-dim hover:bg-white/5",
              )}
            >
              <Calendar className="h-3 w-3" /> 强制节假日
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSandboxActive(false)}
              className="flex flex-1 items-center justify-center gap-1 rounded border border-line py-1.5 text-[11px] text-ink-dim hover:bg-white/5"
            >
              <RotateCcw className="h-3 w-3" /> 还原
            </button>
            <button
              disabled={!sandboxActive}
              onClick={applySandbox}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-[11px] font-medium transition-colors",
                sandboxActive
                  ? "bg-amber text-void hover:bg-amber-dim"
                  : "bg-white/5 text-ink-mute cursor-not-allowed",
              )}
            >
              <CheckCircle2 className="h-3 w-3" /> 应用到真实策略
            </button>
          </div>
        </div>
      </div>

      {sandboxActive ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-mute">
            <span>区域沙盘预览</span>
            <span className="font-mono">{previews.length} 个区域</span>
          </div>
          {previews.map((p) => {
            const meta = RULE_META[p.rule.type];
            const Icon = meta.icon;
            const statusMeta = AREA_STATUS_META[p.status];
            return (
              <div key={p.strat.areaId} className="rounded-md border border-line bg-void/40 p-2.5">
                <div className="flex items-center gap-2">
                  <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", meta.bg, meta.text)}>
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[12px] font-medium text-ink">{p.strat.areaName}</span>
                      <span className={cn("rounded px-1 text-[9px]", statusMeta.bg, statusMeta.text)}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-ink-mute">
                      {meta.label} · 阈值 {formatDuration(p.threshold)}
                    </div>
                  </div>
                  {p.escalations > 0 && (
                    <span className="flex items-center gap-0.5 rounded border border-crit/30 bg-crit/10 px-1.5 py-0.5 text-[9px] text-crit">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      {p.escalations}条升级
                    </span>
                  )}
                </div>
                {p.projected.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {p.projected.slice(0, 3).map((x) => {
                      const cur = LEVEL_META[x.alert.level];
                      const nxt = LEVEL_META[x.next];
                      return (
                        <div key={x.alert.id} className="flex items-center gap-1.5 text-[10px]">
                          <span className="font-mono text-ink-mute">{x.alert.id.slice(-6)}</span>
                          <span className={cn("rounded px-1 text-[9px]", cur.bg, cur.text)}>{cur.label}</span>
                          {x.changed ? (
                            <>
                              <span className="text-ink-mute">→</span>
                              <span className={cn("rounded px-1 text-[9px] font-medium", nxt.bg, nxt.text)}>{nxt.label}</span>
                            </>
                          ) : (
                            <span className="text-ink-mute">·维持</span>
                          )}
                        </div>
                      );
                    })}
                    {p.projected.length > 3 && (
                      <div className="text-[10px] text-ink-mute">··· 另有 {p.projected.length - 3} 条</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-line bg-void/20 px-3 py-6 text-center text-[11px] text-ink-mute">
          调整时间或场景即可预览规则命中情况
        </div>
      )}
    </div>
  );
}
