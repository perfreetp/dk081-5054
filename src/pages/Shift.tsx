import { useState } from "react";
import { CalendarClock, ListFilter, MapPin, Users } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { Panel } from "@/components/ui/Panel";
import { ShiftCalendar } from "@/components/shift/ShiftCalendar";
import { DrillKey, HandoverCard } from "@/components/shift/HandoverCard";
import { HandoverDrill } from "@/components/shift/HandoverDrill";
import { AreaMap } from "@/components/map/AreaMap";
import { SHIFT_META } from "@/lib/meta";
import { cn } from "@/lib/utils";

export default function Shift() {
  const shifts = useOpsStore((s) => s.shifts);
  const areas = useOpsStore((s) => s.areas);
  const patrol = useOpsStore((s) => s.patrol);
  const [selected, setSelected] = useState("2026-06-17");
  const [drill, setDrill] = useState<DrillKey>(null);
  const dayShifts = shifts.filter((s) => s.date === selected);

  return (
    <div className="grid grid-cols-[320px_minmax(0,1fr)_340px_340px] gap-5">
      <Panel title="班次排班" icon={<CalendarClock className="h-4 w-4" />} bodyClass="p-3">
        <ShiftCalendar shifts={shifts} selected={selected} onSelect={setSelected} />
      </Panel>

      <div className="space-y-5">
        <Panel title={`当日值守 · ${selected}`} icon={<Users className="h-4 w-4" />} accent bodyClass="p-3">
          <div className="space-y-3">
            {dayShifts.length ? (
              dayShifts.map((s) => {
                const meta = SHIFT_META[s.shiftType];
                return (
                  <div key={s.id} className="rounded-md border border-line bg-void/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", meta.bg, meta.text)}>
                        {meta.label}
                      </span>
                      <span className="text-[13px] font-medium text-ink">主管 · {s.lead}</span>
                      <span className="ml-auto rounded border border-line bg-void/50 px-2 py-0.5 font-mono text-[10px] text-ink-mute">
                        {s.status === "active" ? "值守中" : s.status === "handedOver" ? "已交接" : "待排"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.personnel.map((p) => (
                        <span
                          key={p.id}
                          className="flex items-center gap-1 rounded border border-line bg-void/50 px-2 py-1 text-[11px] text-ink"
                        >
                          {p.name}
                          <span className="text-[10px] text-ink-mute">{p.post}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-[12px] text-ink-mute">该日暂无排班</div>
            )}
          </div>
        </Panel>

        <Panel title="巡逻岗位置" icon={<MapPin className="h-4 w-4" />} bodyClass="p-3">
          <AreaMap areas={areas} patrol={patrol} className="h-[260px] w-full" />
        </Panel>
      </div>

      <Panel title="交接清单" bodyClass="p-4">
        <HandoverCard drill={drill} onDrill={setDrill} />
      </Panel>

      <Panel title="下钻明细" icon={<ListFilter className="h-4 w-4" />} bodyClass="p-3">
        <HandoverDrill drill={drill} />
      </Panel>
    </div>
  );
}
