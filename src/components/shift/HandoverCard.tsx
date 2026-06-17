import { useEffect } from "react";
import { ClipboardList, Clock, MapPin, RefreshCw, TrendingUp, UserCheck } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { Tag } from "@/components/ui/Bits";
import { cn } from "@/lib/utils";

export type DrillKey =
  | { kind: "newAlerts" }
  | { kind: "handled" }
  | { kind: "pending" }
  | { kind: "persons" }
  | { kind: "areas"; area?: string }
  | null;

export function HandoverCard({ onDrill, drill }: { onDrill: (d: DrillKey) => void; drill: DrillKey }) {
  const handover = useOpsStore((s) => s.handover);
  const shifts = useOpsStore((s) => s.shifts);
  const signHandover = useOpsStore((s) => s.signHandover);
  const refreshHandover = useOpsStore((s) => s.refreshHandover);
  const lead = shifts.find((s) => s.status === "active")?.lead ?? "值班主管";
  const signed = handover.signedBy.includes(lead);

  useEffect(() => {
    refreshHandover();
  }, [refreshHandover]);

  const isActive = (k: DrillKey) => JSON.stringify(k) === JSON.stringify(drill);

  const Stat = ({
    label,
    value,
    tone,
    onClick,
    active,
  }: {
    label: string;
    value: number;
    tone: string;
    onClick: () => void;
    active: boolean;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded border p-2 text-center transition-colors",
        active ? "border-amber/50 bg-amber/10" : "border-line bg-void/40 hover:bg-white/5",
      )}
    >
      <div className={cn("font-mono text-lg font-bold tabular", tone)}>{value}</div>
      <div className="text-[10px] text-ink-mute">{label}</div>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-amber" />
          <span className="text-[13px] font-semibold text-ink">班次交接清单</span>
          {signed && <Tag>已签收</Tag>}
        </div>
        <Tag>{handover.generatedAt.slice(-5)}</Tag>
      </div>

      <div className="rounded-md border border-amber/30 bg-amber/5 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-mute">
            <TrendingUp className="h-3 w-3" /> 本班复盘摘要
          </span>
          {signed && <span className="font-mono text-[10px] text-ink-mute">最新刷新</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat
            label="本班新增"
            value={handover.newAlerts}
            tone="text-amber"
            onClick={() => onDrill(isActive({ kind: "newAlerts" }) ? null : { kind: "newAlerts" })}
            active={isActive({ kind: "newAlerts" })}
          />
          <Stat
            label="已处置"
            value={handover.handledAlerts}
            tone="text-ok"
            onClick={() => onDrill(isActive({ kind: "handled" }) ? null : { kind: "handled" })}
            active={isActive({ kind: "handled" })}
          />
          <Stat
            label="待跟进"
            value={handover.pendingItems.length}
            tone="text-crit"
            onClick={() => onDrill(isActive({ kind: "pending" }) ? null : { kind: "pending" })}
            active={isActive({ kind: "pending" })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <button
            onClick={() => onDrill(isActive({ kind: "persons" }) ? null : { kind: "persons" })}
            className={cn(
              "mb-1.5 flex w-full items-center justify-between gap-1 rounded px-1 py-0.5 text-left text-[11px] uppercase tracking-wider transition-colors",
              isActive({ kind: "persons" }) ? "bg-amber/10 text-amber" : "text-ink-mute hover:bg-white/5",
            )}
          >
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> 反复人员
            </span>
            <span className="font-mono">{handover.focusPersons.length}</span>
          </button>
          <div className="space-y-1">
            {handover.focusPersons.length ? (
              handover.focusPersons.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-[11px]">
                  <span className="text-ink-dim">{p.name}</span>
                  <span className="font-mono text-focus">{p.count}次</span>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-ink-mute">无反复人员</div>
            )}
          </div>
        </div>
        <div>
          <button
            onClick={() => onDrill(isActive({ kind: "areas" }) ? null : { kind: "areas" })}
            className={cn(
              "mb-1.5 flex w-full items-center justify-between gap-1 rounded px-1 py-0.5 text-left text-[11px] uppercase tracking-wider transition-colors",
              isActive({ kind: "areas" }) ? "bg-amber/10 text-amber" : "text-ink-mute hover:bg-white/5",
            )}
          >
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> 高频区域
            </span>
            <span className="font-mono">{handover.focusAreas.length}</span>
          </button>
          <div className="space-y-1">
            {handover.focusAreas.length ? (
              handover.focusAreas.map((a) => (
                <button
                  key={a.area}
                  onClick={() =>
                    onDrill(isActive({ kind: "areas", area: a.area }) ? null : { kind: "areas", area: a.area })
                  }
                  className={cn(
                    "flex w-full items-center justify-between rounded px-1 py-0.5 text-[11px] transition-colors",
                    isActive({ kind: "areas", area: a.area }) ? "bg-amber/10" : "hover:bg-white/5",
                  )}
                >
                  <span className="text-ink-dim">{a.area}</span>
                  <span className="font-mono text-amber">{a.count}</span>
                </button>
              ))
            ) : (
              <div className="text-[10px] text-ink-mute">无高频区域</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-mute">
          <Clock className="h-3 w-3" /> 高频时段
        </div>
        <div className="space-y-1">
          {handover.focusSlots.length ? (
            handover.focusSlots.map((s) => (
              <div key={s.slot} className="flex items-center justify-between text-[11px]">
                <span className="text-ink-dim">{s.slot}</span>
                <span className="font-mono text-info">{s.count}</span>
              </div>
            ))
          ) : (
            <div className="text-[10px] text-ink-mute">无高频时段</div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-wider text-ink-mute">未办事项</div>
        <div className="space-y-1.5">
          {handover.pendingItems.length ? (
            handover.pendingItems.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-2 rounded border border-line bg-void/30 px-2.5 py-1.5"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-crit" />
                <div>
                  <div className="text-[12px] text-ink">{p.area}</div>
                  <div className="text-[10px] text-ink-mute">{p.desc}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-ink-mute">全部已办结</div>
          )}
        </div>
      </div>

      <button
        onClick={() => signHandover(lead)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded py-2.5 text-[13px] font-semibold transition-colors",
          signed
            ? "border border-ok/40 bg-ok/10 text-ok hover:bg-ok/20"
            : "bg-amber text-void hover:bg-amber-dim",
        )}
      >
        <UserCheck className="h-4 w-4" />
        {signed ? "已签收 · 刷新统计" : `签收（${lead}）`}
      </button>
      {handover.signedBy.length > 0 && (
        <div className="text-center text-[10px] text-ink-mute">
          已签收：{handover.signedBy.join("、")}
        </div>
      )}
    </div>
  );
}
