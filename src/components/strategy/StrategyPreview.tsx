import { AlertTriangle, Calendar, Clock, Gauge, Moon, Sun, TrendingUp } from "lucide-react";
import type { AreaStrategy } from "@/types";
import { effectiveRule, type EffectiveRuleType } from "@/store/useOpsStore";
import { useOpsStore } from "@/store/useOpsStore";
import { AREA_STATUS_META, LEVEL_META, formatDuration } from "@/lib/meta";
import { cn } from "@/lib/utils";

const RULE_META: Record<EffectiveRuleType, { label: string; text: string; bg: string; icon: typeof Sun }> = {
  holiday: { label: "节假日规则", text: "text-focus", bg: "bg-focus/15", icon: Calendar },
  night: { label: "夜间规则", text: "text-info", bg: "bg-info/15", icon: Moon },
  peak: { label: "候诊高峰", text: "text-amber", bg: "bg-amber/15", icon: Sun },
  base: { label: "基础阈值", text: "text-ink", bg: "bg-white/5", icon: Gauge },
};

export function StrategyPreview({ strategy }: { strategy: AreaStrategy }) {
  const alerts = useOpsStore((s) => s.alerts);
  const areas = useOpsStore((s) => s.areas);
  const now = new Date();
  const rule = effectiveRule(strategy, now);
  const meta = RULE_META[rule.type];
  const RuleIcon = meta.icon;

  const areaAlerts = alerts.filter(
    (a) =>
      a.areaId === strategy.areaId &&
      a.status !== "closed" &&
      a.status !== "falseAlarm",
  );
  const area = areas.find((a) => a.id === strategy.areaId);
  const areaMeta = area ? AREA_STATUS_META[area.status] : AREA_STATUS_META.normal;

  const affectedLevels = areaAlerts.map((a) => {
    const ratio = a.durationSec / rule.threshold;
    const next: "low" | "medium" | "high" | "critical" =
      ratio >= 1.6 ? "critical" : ratio >= 1.2 ? "high" : ratio >= 0.9 ? "medium" : "low";
    const changed = next !== a.level;
    return { alert: a, ratio, next, changed };
  });
  const wouldEscalate = affectedLevels.filter(
    (x) => x.changed && LEVEL_RANK_NEXT[x.next] > LEVEL_RANK_NEXT[x.alert.level],
  );

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-amber/30 bg-amber/5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-ink-mute">当前生效规则</span>
          <span className="font-mono text-[10px] text-ink-mute">{now.toTimeString().slice(0, 5)}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", meta.bg, meta.text)}>
            <RuleIcon className="h-4 w-4" />
          </span>
          <div>
            <div className={cn("text-[14px] font-semibold", meta.text)}>{meta.label}</div>
            <div className="font-mono text-[11px] text-ink-mute">阈值 {rule.threshold}秒</div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-mono text-2xl font-bold tabular text-amber">{formatDuration(rule.threshold)}</div>
            <div className="text-[9px] text-ink-mute">判定阈值</div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-line bg-void/40 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-mute">
            <TrendingUp className="h-3 w-3" /> 受影响活跃告警
          </span>
          <span className="font-mono text-[10px] text-ink-mute">{areaAlerts.length} 条</span>
        </div>
        {areaAlerts.length ? (
          <div className="space-y-1.5">
            {affectedLevels.map((x) => {
              const cur = LEVEL_META[x.alert.level];
              const nxt = LEVEL_META[x.next];
              return (
                <div
                  key={x.alert.id}
                  className="flex items-center gap-2 rounded border border-line bg-void/50 px-2 py-1.5"
                >
                  <span className="font-mono text-[10px] text-ink-mute">{x.alert.id.slice(-6)}</span>
                  <span className={cn("rounded px-1 text-[9px]", cur.bg, cur.text)}>{cur.label}</span>
                  {x.changed ? (
                    <>
                      <span className="text-ink-mute">→</span>
                      <span className={cn("rounded px-1 text-[9px] font-medium", nxt.bg, nxt.text)}>{nxt.label}</span>
                      {LEVEL_RANK_NEXT[x.next] > LEVEL_RANK_NEXT[x.alert.level] && (
                        <AlertTriangle className="h-3 w-3 text-crit" />
                      )}
                    </>
                  ) : (
                    <span className="text-[9px] text-ink-mute">·维持</span>
                  )}
                  <span className="ml-auto font-mono text-[10px] text-amber">{Math.round(x.ratio * 100)}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-3 text-center text-[11px] text-ink-mute">该区域暂无活跃告警</div>
        )}
      </div>

      <div className="rounded-md border border-line bg-void/40 p-3">
        <div className="mb-2 flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-mute">
          <Clock className="h-3 w-3" /> 区域风险预览
        </div>
        {area && (
          <div className="flex items-center gap-3">
            <span className={cn("h-2.5 w-2.5 rounded-full", areaMeta.dot)} />
            <span className={cn("text-[13px] font-medium", areaMeta.text)}>{areaMeta.label}</span>
            <span className="ml-auto font-mono text-[11px] text-ink-mute">
              在滞留 {area.currentLoitering} · 最长 {formatDuration(area.maxDurationSec)}
            </span>
          </div>
        )}
        {wouldEscalate.length > 0 && (
          <div className="mt-2 rounded border border-crit/30 bg-crit/10 px-2 py-1.5 text-[11px] text-crit">
            预警：{wouldEscalate.length} 条告警将升级，区域风险等级同步上调
          </div>
        )}
      </div>
    </div>
  );
}

const LEVEL_RANK_NEXT: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
