import type { Area, HourHeat } from "@/types";

export function Heatmap({ heat, areas }: { heat: HourHeat[]; areas: Area[] }) {
  const max = Math.max(
    1,
    ...heat.flatMap((h) => areas.map((a) => h.values[a.id] ?? 0)),
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px]">
        <div className="flex items-center">
          <div className="w-20 shrink-0" />
          {heat.map((h) => (
            <div
              key={h.hour}
              className="flex-1 text-center text-[9px] text-ink-mute"
            >
              {h.hour}
            </div>
          ))}
        </div>
        {areas.map((a) => (
          <div key={a.id} className="flex items-center py-[2px]">
            <div className="w-20 shrink-0 truncate pr-2 text-[10px] text-ink-dim">
              {a.name}
            </div>
            {heat.map((h) => {
              const v = h.values[a.id] ?? 0;
              return (
                <div key={h.hour} className="flex-1 px-0.5">
                  <div
                    title={`${a.name} ${String(h.hour).padStart(2, "0")}:00 · ${v} 次`}
                    className="h-4 rounded-sm"
                    style={{
                      background: v
                        ? `rgba(245,181,68,${0.12 + (v / max) * 0.85})`
                        : "rgba(255,255,255,0.03)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-ink-mute">
          <span>低</span>
          <div className="h-2 w-32 rounded-sm bg-gradient-to-r from-white/5 to-amber" />
          <span>高</span>
          <span className="ml-auto">单位：次/小时</span>
        </div>
      </div>
    </div>
  );
}
