import { CalendarClock, Timer } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { SHIFT_META } from "@/lib/meta";
import { cn } from "@/lib/utils";

function nextBoundary(now: Date): Date {
  const target = new Date(now);
  if (now.getHours() < 20) {
    target.setHours(20, 0, 0, 0);
  } else {
    target.setDate(target.getDate() + 1);
    target.setHours(8, 0, 0, 0);
  }
  return target;
}

export function DutyBar() {
  const clock = useOpsStore((s) => s.clock);
  const patrol = useOpsStore((s) => s.patrol);
  const shifts = useOpsStore((s) => s.shifts);
  const active = shifts.find((s) => s.status === "active");
  const meta = SHIFT_META[active?.shiftType ?? "day"];

  const now = new Date();
  const [hh, mm, ss] = clock.split(":").map(Number);
  now.setHours(hh, mm, ss, 0);
  const remain = Math.max(0, Math.floor((nextBoundary(now).getTime() - now.getTime()) / 1000));
  const rh = String(Math.floor(remain / 3600)).padStart(2, "0");
  const rm = String(Math.floor((remain % 3600) / 60)).padStart(2, "0");
  const rs = String(remain % 60).padStart(2, "0");

  const statusColor: Record<string, string> = {
    handling: "bg-amber",
    patrol: "bg-info",
    standby: "bg-ok",
  };

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-md border border-line bg-panel/70 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-amber/30 bg-amber/10">
          <CalendarClock className="h-4 w-4 text-amber" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", meta.bg, meta.text)}>
              {meta.label}
            </span>
            <span className="text-[13px] font-medium text-ink">{active?.lead ?? "—"}</span>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-ink-mute">
            {active?.date} · 值班主管
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-1.5 text-[10px] uppercase tracking-wider text-ink-mute">在岗巡逻</div>
        <div className="flex flex-wrap gap-2">
          {patrol.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 rounded border border-line bg-void/50 px-2 py-1"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusColor[p.status])} />
              <span className="text-[11px] text-ink">{p.name}</span>
              <span className="text-[10px] text-ink-mute">{p.post}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-right">
        <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-wider text-ink-mute">
          <Timer className="h-3 w-3" />
          交接倒计时
        </div>
        <div className="mt-1 font-mono text-2xl font-semibold tabular text-amber text-glow">
          {rh}:{rm}:{rs}
        </div>
      </div>
    </div>
  );
}
