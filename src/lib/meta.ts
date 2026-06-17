import type {
  AlertLevel,
  AlertStatus,
  AreaStatus,
  ClearanceResult,
  LinkageType,
  ShiftType,
} from "@/types";

export const LEVEL_META: Record<
  AlertLevel,
  { label: string; text: string; bg: string; border: string; dot: string }
> = {
  critical: { label: "危急", text: "text-crit", bg: "bg-crit/12", border: "border-crit/40", dot: "bg-crit" },
  high: { label: "高", text: "text-amber", bg: "bg-amber/12", border: "border-amber/40", dot: "bg-amber" },
  medium: { label: "中", text: "text-info", bg: "bg-info/12", border: "border-info/30", dot: "bg-info" },
  low: { label: "低", text: "text-ink-dim", bg: "bg-white/5", border: "border-line", dot: "bg-ink-mute" },
};

export const LEVEL_RANK: Record<AlertLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const STATUS_META: Record<AlertStatus, { label: string; text: string; bg: string }> = {
  pending: { label: "待处置", text: "text-crit", bg: "bg-crit/12" },
  dispatched: { label: "已分派", text: "text-amber", bg: "bg-amber/12" },
  handling: { label: "处置中", text: "text-info", bg: "bg-info/12" },
  closed: { label: "已清场", text: "text-ok", bg: "bg-ok/12" },
  falseAlarm: { label: "误报", text: "text-ink-dim", bg: "bg-white/5" },
  watch: { label: "关注", text: "text-focus", bg: "bg-focus/12" },
};

export const AREA_STATUS_META: Record<
  AreaStatus,
  { label: string; text: string; dot: string; border: string; bg: string }
> = {
  normal: { label: "正常", text: "text-ok", dot: "bg-ok", border: "border-ok/30", bg: "bg-ok/12" },
  warning: { label: "预警", text: "text-amber", dot: "bg-amber", border: "border-amber/40", bg: "bg-amber/12" },
  critical: { label: "告警", text: "text-crit", dot: "bg-crit", border: "border-crit/50", bg: "bg-crit/12" },
};

export const LINKAGE_META: Record<LinkageType, { label: string; text: string; bg: string }> = {
  access: { label: "门禁", text: "text-info", bg: "bg-info/12" },
  broadcast: { label: "广播", text: "text-amber", bg: "bg-amber/12" },
  intercom: { label: "对讲", text: "text-focus", bg: "bg-focus/12" },
};

export const SHIFT_META: Record<ShiftType, { label: string; text: string; bg: string }> = {
  day: { label: "白班", text: "text-amber", bg: "bg-amber/15" },
  night: { label: "夜班", text: "text-info", bg: "bg-info/15" },
  holiday: { label: "节假日", text: "text-focus", bg: "bg-focus/15" },
};

export const CLEARANCE_META: Record<ClearanceResult, string> = {
  cleared: "已清场",
  moved: "已引导离开",
  relocated: "已转移至等候区",
  unresolved: "未解决转报",
};

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDurationZh(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${s}秒`;
}

export function formatClock(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
