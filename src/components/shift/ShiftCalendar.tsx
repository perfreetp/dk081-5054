import type { Shift } from "@/types";
import { SHIFT_META } from "@/lib/meta";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export function ShiftCalendar({
  shifts,
  selected,
  onSelect,
}: {
  shifts: Shift[];
  selected: string;
  onSelect: (date: string) => void;
}) {
  const year = 2026;
  const month = 5;
  const today = "2026-06-17";
  const first = new Date(year, month, 1);
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const iso = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink">2026 年 6 月</span>
        <span className="font-mono text-[10px] text-ink-mute">JUN</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-[10px] text-ink-mute">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const date = iso(d);
          const dayShifts = shifts.filter((s) => s.date === date);
          const isToday = date === today;
          const isSelected = date === selected;
          const weekend = i % 7 >= 5;
          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              className={cn(
                "flex min-h-[52px] flex-col gap-1 rounded border p-1 text-left transition-colors",
                isSelected
                  ? "border-amber/50 bg-amber/10"
                  : "border-line bg-void/30 hover:bg-white/5",
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-medium",
                  isToday ? "text-amber" : weekend ? "text-ink-mute" : "text-ink",
                )}
              >
                {d}
                {isToday && <span className="ml-1 text-[8px]">今</span>}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayShifts.map((s) => {
                  const meta = SHIFT_META[s.shiftType];
                  return (
                    <span
                      key={s.id}
                      className={cn("rounded px-1 text-[8px] leading-tight", meta.bg, meta.text)}
                    >
                      {meta.label}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
