import { useState } from "react";
import { Ban, CheckCircle2, Crosshair, Eye, Flame, Send } from "lucide-react";
import type { Alert, ClearanceResult } from "@/types";
import { useOpsStore, dist } from "@/store/useOpsStore";
import { LEVEL_META, STATUS_META, formatDuration } from "@/lib/meta";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/ui/Bits";

export function HandlingPanel({ alert }: { alert: Alert }) {
  const patrol = useOpsStore((s) => s.patrol);
  const areas = useOpsStore((s) => s.areas);
  const markAlert = useOpsStore((s) => s.markAlert);
  const dispatchNearest = useOpsStore((s) => s.dispatchNearest);
  const closeAlert = useOpsStore((s) => s.closeAlert);

  const [arrival, setArrival] = useState(120);
  const [result, setResult] = useState<ClearanceResult>("cleared");

  const lvl = LEVEL_META[alert.level];
  const st = STATUS_META[alert.status];
  const area = areas.find((a) => a.id === alert.areaId);
  const ranked = patrol
    .map((p) => ({ p, d: area ? dist(p, area) : 0 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
  const closed = alert.status === "closed" || alert.status === "falseAlarm";

  const TONE_TEXT: Record<string, string> = {
    crit: "text-crit",
    amber: "text-amber",
    info: "text-info",
    ok: "text-ok",
    focus: "text-focus",
    mute: "text-ink-mute",
  };
  const timeline = alert.timeline ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-4">
        <div className="flex items-center gap-2">
          <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", lvl.bg, lvl.text)}>
            {lvl.label}级
          </span>
          <span className="text-sm font-semibold text-ink">{alert.areaName}</span>
          <Tag>{alert.id.slice(-6)}</Tag>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={cn("font-mono text-3xl font-bold tabular", lvl.text)}>
            {formatDuration(alert.durationSec)}
          </span>
          <span className={cn("rounded px-1.5 py-0.5 text-[10px]", st.bg, st.text)}>{st.label}</span>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">{alert.description}</p>
        {alert.isRecurrent && (
          <div className="mt-2 rounded border border-focus/30 bg-focus/10 px-2 py-1 text-[11px] text-focus">
            ⚠ 反复出现人员，已纳入重点关注
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-line p-3">
        <button
          onClick={() => markAlert(alert.id, "false")}
          disabled={closed}
          className="flex flex-col items-center gap-1 rounded border border-crit/30 py-2 text-[11px] text-crit transition-colors hover:bg-crit/10 disabled:opacity-40"
        >
          <Ban className="h-4 w-4" />
          误报
        </button>
        <button
          onClick={() => markAlert(alert.id, "watch")}
          disabled={closed}
          className="flex flex-col items-center gap-1 rounded border border-focus/30 py-2 text-[11px] text-focus transition-colors hover:bg-focus/10 disabled:opacity-40"
        >
          <Eye className="h-4 w-4" />
          关注
        </button>
        <button
          onClick={() => markAlert(alert.id, "escalate")}
          disabled={closed}
          className="flex flex-col items-center gap-1 rounded border border-crit/50 bg-crit/15 py-2 text-[11px] font-medium text-crit transition-colors hover:bg-crit/25 disabled:opacity-40"
        >
          <Flame className="h-4 w-4" />
          升级
        </button>
      </div>

      <div className="border-b border-line p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-mute">
          <Crosshair className="h-3 w-3" /> 最近巡逻岗
        </div>
        <div className="space-y-1.5">
          {ranked.map(({ p, d }, i) => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded border border-line bg-void/40 px-2 py-1.5"
            >
              <span className="font-mono text-[10px] text-ink-mute">#{i + 1}</span>
              <span className="text-[12px] text-ink">{p.name}</span>
              <span className="text-[10px] text-ink-mute">{p.post}</span>
              <span className="ml-auto font-mono text-[11px] text-info">~{d}m</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => dispatchNearest(alert.id)}
          disabled={closed}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded bg-amber py-2 text-[12px] font-semibold text-void transition-colors hover:bg-amber-dim disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          分派最近巡逻岗
        </button>
      </div>

      <div className="border-b border-line p-3">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-ink-mute">处置闭环</div>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="text-[10px] text-ink-mute">到场时长(s)</span>
            <input
              type="number"
              value={arrival}
              onChange={(e) => setArrival(Number(e.target.value))}
              disabled={closed}
              className="mt-0.5 w-full rounded border border-line bg-void/50 px-2 py-1 font-mono text-sm text-ink outline-none focus:border-amber/50 disabled:opacity-40"
            />
          </label>
          <label className="flex-1">
            <span className="text-[10px] text-ink-mute">清场结果</span>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as ClearanceResult)}
              disabled={closed}
              className="mt-0.5 w-full rounded border border-line bg-void/50 px-2 py-1 text-[12px] text-ink outline-none focus:border-amber/50 disabled:opacity-40"
            >
              <option value="cleared">已清场</option>
              <option value="moved">已引导离开</option>
              <option value="relocated">已转移等候区</option>
              <option value="unresolved">未解决转报</option>
            </select>
          </label>
        </div>
        <button
          onClick={() => closeAlert(alert.id, arrival, result)}
          disabled={closed}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-ok/40 py-2 text-[12px] font-medium text-ok transition-colors hover:bg-ok/10 disabled:opacity-40"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          记录清场
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-ink-mute">处置时间线</span>
          <span className="font-mono text-[10px] text-ink-mute">{timeline.length} 步</span>
        </div>
        {timeline.length ? (
          <div className="relative space-y-3 pl-4">
            <span className="absolute left-1 top-1 bottom-1 w-px bg-line" />
            {timeline.map((t, i) => {
              const tone = TONE_TEXT[t.tone ?? "mute"] ?? "text-ink-mute";
              return (
                <div key={i} className="relative">
                  <span className={cn("absolute -left-3 top-1 h-2 w-2 rounded-full bg-current", tone)} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-ink">{t.action}</span>
                    <span className="font-mono text-[10px] text-ink-mute shrink-0">{t.at.slice(-5)}</span>
                  </div>
                  {t.by && (
                    <div className="mt-0.5 text-[10px] text-ink-mute">操作人 · {t.by}</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-[11px] text-ink-mute">暂无处置记录</div>
        )}
      </div>
    </div>
  );
}
