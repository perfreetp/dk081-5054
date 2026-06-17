import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarClock,
  Crosshair,
  LayoutDashboard,
  Radio,
  ShieldPlus,
  Siren,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusDot } from "@/components/ui/Bits";

const NAV = [
  { to: "/", label: "实时总览", code: "OVR", icon: LayoutDashboard },
  { to: "/alerts", label: "告警处置", code: "ALT", icon: Siren },
  { to: "/strategy", label: "区域策略", code: "STR", icon: SlidersHorizontal },
  { to: "/linkage", label: "联动记录", code: "LNK", icon: Radio },
  { to: "/shift", label: "排班值守", code: "SFT", icon: CalendarClock },
  { to: "/reports", label: "统计报表", code: "RPT", icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-panel/50">
      <div className="flex items-center gap-3 border-b border-line px-4 py-4">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-md border border-amber/40 bg-amber/10">
          <ShieldPlus className="h-5 w-5 text-amber" />
          <Crosshair className="absolute -right-1 -top-1 h-3 w-3 text-amber" />
        </div>
        <div className="leading-tight">
          <div className="font-mono text-[13px] font-semibold tracking-wider text-ink">
            SENTINEL<span className="text-amber"> OPS</span>
          </div>
          <div className="text-[10px] tracking-wide text-ink-mute">
            医院安保指挥中台
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded px-3 py-2.5 text-[13px] transition-colors",
                isActive
                  ? "bg-amber/10 text-amber"
                  : "text-ink-dim hover:bg-white/5 hover:text-ink",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber" />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="font-mono text-[9px] tracking-widest text-ink-mute group-hover:text-ink-dim">
                  {item.code}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-ink-dim">
          <StatusDot className="bg-ok" pulse />
          <span>系统在线</span>
          <span className="ml-auto font-mono text-ink-mute">v2.4.1</span>
        </div>
        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-ink-mute">
          <span>UPTIME 99.98%</span>
          <span className="ml-auto">CN-CDN</span>
        </div>
      </div>
    </aside>
  );
}
