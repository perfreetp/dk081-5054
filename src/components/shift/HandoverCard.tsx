import { ClipboardList, Clock, RefreshCw, UserCheck } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { Tag } from "@/components/ui/Bits";

export function HandoverCard() {
  const handover = useOpsStore((s) => s.handover);
  const shifts = useOpsStore((s) => s.shifts);
  const signHandover = useOpsStore((s) => s.signHandover);
  const lead = shifts.find((s) => s.status === "active")?.lead ?? "值班主管";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-amber" />
          <span className="text-[13px] font-semibold text-ink">班次交接清单</span>
        </div>
        <Tag>{handover.generatedAt.slice(-5)}</Tag>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded border border-line bg-void/40 p-2.5 text-center">
          <div className="font-mono text-xl font-bold text-ok">{handover.handledAlerts}</div>
          <div className="text-[10px] text-ink-mute">已处置</div>
        </div>
        <div className="rounded border border-line bg-void/40 p-2.5 text-center">
          <div className="font-mono text-xl font-bold text-crit">{handover.pendingItems.length}</div>
          <div className="text-[10px] text-ink-mute">待办事项</div>
        </div>
        <div className="rounded border border-line bg-void/40 p-2.5 text-center">
          <div className="font-mono text-xl font-bold text-focus">{handover.focusPersons.length}</div>
          <div className="text-[10px] text-ink-mute">关注人员</div>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[11px] uppercase tracking-wider text-ink-mute">未办事项</div>
        <div className="space-y-1.5">
          {handover.pendingItems.map((p) => (
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
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-mute">
            <RefreshCw className="h-3 w-3" /> 反复人员
          </div>
          <div className="space-y-1">
            {handover.focusPersons.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-[11px]">
                <span className="text-ink-dim">{p.name}</span>
                <span className="font-mono text-focus">{p.count}次</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-mute">
            <Clock className="h-3 w-3" /> 高频时段
          </div>
          <div className="space-y-1">
            {handover.focusSlots.map((s) => (
              <div key={s.slot} className="flex items-center justify-between text-[11px]">
                <span className="text-ink-dim">{s.slot}</span>
                <span className="font-mono text-amber">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => signHandover(lead)}
        className="flex w-full items-center justify-center gap-2 rounded bg-amber py-2.5 text-[13px] font-semibold text-void transition-colors hover:bg-amber-dim"
      >
        <UserCheck className="h-4 w-4" />
        {handover.signedBy.includes(lead) ? "已签收 · 待接班确认" : `签收（${lead}）`}
      </button>
      {handover.signedBy.length > 0 && (
        <div className="text-center text-[10px] text-ink-mute">
          已签收：{handover.signedBy.join("、")}
        </div>
      )}
    </div>
  );
}
