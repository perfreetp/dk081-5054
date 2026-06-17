import type { Area, AreaStatus, Personnel } from "@/types";
import { AREA_STATUS_META } from "@/lib/meta";
import { cn } from "@/lib/utils";

const STATUS_FILL: Record<AreaStatus, string> = {
  normal: "#3DD68C",
  warning: "#F5B544",
  critical: "#FF4D5E",
};

interface AreaMapProps {
  areas: Area[];
  patrol?: Personnel[];
  focusAreaId?: string;
  showPath?: boolean;
  className?: string;
}

export function AreaMap({
  areas,
  patrol,
  focusAreaId,
  showPath = true,
  className,
}: AreaMapProps) {
  const focus = areas.find((a) => a.id === focusAreaId);

  let guide: (Personnel & { d: number }) | undefined;
  if (focus && patrol) {
    const pool = patrol.filter((p) => p.status !== "handling");
    const list = pool.length ? pool : patrol;
    for (const p of list) {
      const d = Math.hypot(p.x - focus.x, p.y - focus.y);
      if (!guide || d < guide.d) guide = { ...p, d };
    }
  }

  return (
    <div
      className={cn(
        "panel-grid relative aspect-[10/7] w-full overflow-hidden rounded border border-line bg-void/60",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="gridline" width="6.25" height="6.25" patternUnits="userSpaceOnUse">
            <path d="M 6.25 0 L 0 0 0 6.25" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#gridline)" />
        {areas.map((a) => (
          <rect
            key={a.id}
            x={a.x - 6}
            y={a.y - 4}
            width="12"
            height="8"
            rx="1"
            fill={STATUS_FILL[a.status]}
            fillOpacity={a.id === focusAreaId ? 0.16 : 0.07}
            stroke={STATUS_FILL[a.status]}
            strokeOpacity={a.id === focusAreaId ? 0.7 : 0.25}
            strokeWidth="0.3"
          />
        ))}
        {focus && guide && showPath && (
          <line
            x1={guide.x}
            y1={guide.y}
            x2={focus.x}
            y2={focus.y}
            stroke="#4FC3F7"
            strokeWidth="0.4"
            strokeDasharray="1.6 1.6"
            opacity="0.7"
          />
        )}
      </svg>

      {areas.map((a) => {
        const meta = AREA_STATUS_META[a.status];
        const isFocus = a.id === focusAreaId;
        return (
          <div
            key={a.id}
            className="absolute"
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
          >
            <div className="-translate-x-1/2 -translate-y-1/2">
              {isFocus && (
                <span
                  className="animate-pulse-ring absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: STATUS_FILL[a.status] }}
                />
              )}
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STATUS_FILL[a.status] }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-medium text-ink-dim">
                {a.name}
              </span>
              {isFocus && (
                <span className={cn("absolute left-3 -top-2 text-[8px]", meta.text)}>
                  ● 目标
                </span>
              )}
            </div>
          </div>
        );
      })}

      {patrol?.map((p) => (
        <div key={p.id} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <div className="-translate-x-1/2 -translate-y-1/2">
            <div className="flex h-4 w-4 rotate-45 items-center justify-center rounded-sm border border-info bg-info/20">
              <span className="-rotate-45 text-[8px] font-semibold text-info">
                {p.name[0]}
              </span>
            </div>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] text-info/80">
              {p.name}
            </span>
          </div>
        </div>
      ))}

      <div className="absolute bottom-2 right-2 flex gap-2 font-mono text-[9px] text-ink-mute">
        <span>● 区域</span>
        <span className="text-info">◆ 巡逻</span>
      </div>
    </div>
  );
}
