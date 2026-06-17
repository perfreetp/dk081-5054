import type {
  Alert,
  Area,
  AreaStat,
  AreaStrategy,
  EfficiencyPoint,
  FocusPersonStat,
  HandoverChecklist,
  HourHeat,
  LinkageEvent,
  Personnel,
  Shift,
} from "@/types";

export const AREAS: Area[] = [
  { id: "A01", name: "门诊大厅", type: "门诊大厅", campus: "总院", floor: "1F", cameraCount: 8, currentLoitering: 3, maxDurationSec: 742, status: "critical", x: 47, y: 47 },
  { id: "A02", name: "急诊入口", type: "急诊入口", campus: "总院", floor: "1F", cameraCount: 5, currentLoitering: 1, maxDurationSec: 395, status: "warning", x: 18, y: 71 },
  { id: "A03", name: "ICU外走廊", type: "ICU外走廊", campus: "总院", floor: "3F", cameraCount: 4, currentLoitering: 0, maxDurationSec: 0, status: "normal", x: 81, y: 27 },
  { id: "A04", name: "药房取药区", type: "药房取药区", campus: "总院", floor: "1F", cameraCount: 6, currentLoitering: 2, maxDurationSec: 528, status: "warning", x: 34, y: 21 },
  { id: "A05", name: "收费窗口", type: "收费窗口", campus: "总院", floor: "1F", cameraCount: 7, currentLoitering: 4, maxDurationSec: 612, status: "critical", x: 67, y: 66 },
  { id: "A06", name: "自助机区", type: "自助机区", campus: "总院", floor: "1F", cameraCount: 5, currentLoitering: 1, maxDurationSec: 244, status: "normal", x: 83, y: 77 },
];

export const PATROL: Personnel[] = [
  { id: "P01", name: "张磊", role: "巡逻岗", post: "东区巡查", status: "patrol", x: 31, y: 55 },
  { id: "P02", name: "王芳", role: "巡逻岗", post: "西区巡查", status: "standby", x: 60, y: 37 },
  { id: "P03", name: "李强", role: "巡逻岗", post: "急诊驻点", status: "handling", x: 23, y: 68 },
  { id: "P04", name: "赵敏", role: "监控值班", post: "监控室", status: "standby", x: 50, y: 9 },
  { id: "P05", name: "孙浩", role: "巡逻岗", post: "门诊巡查", status: "patrol", x: 55, y: 50 },
];

export const INITIAL_ALERTS: Alert[] = [
  { id: "AL-2506-001", areaId: "A01", areaName: "门诊大厅", level: "critical", status: "pending", durationSec: 742, triggeredAt: "2026-06-17 09:18", isRecurrent: true, description: "大厅中部人员持续徘徊12分钟，多次往返取号区未就诊", timeline: [{ at: "2026-06-17 09:18", action: "告警触发·门诊大厅", tone: "crit" }, { at: "2026-06-17 09:20", action: "触发定向广播提醒", tone: "amber" }] },
  { id: "AL-2506-002", areaId: "A05", areaName: "收费窗口", level: "critical", status: "dispatched", durationSec: 612, triggeredAt: "2026-06-17 09:25", handlerId: "P03", handlerName: "李强", isRecurrent: false, description: "5号窗口前人员滞留，疑似插队纠纷", timeline: [{ at: "2026-06-17 09:25", action: "告警触发·收费窗口", tone: "crit" }, { at: "2026-06-17 09:26", action: "对讲呼叫巡逻岗·李强（急诊驻点）", tone: "amber", by: "系统" }, { at: "2026-06-17 09:26", action: "分派李强前往处置", tone: "amber" }] },
  { id: "AL-2506-003", areaId: "A04", areaName: "药房取药区", level: "high", status: "pending", durationSec: 528, triggeredAt: "2026-06-17 09:31", isRecurrent: false, description: "取药等候区人员静止站立超8分钟", timeline: [{ at: "2026-06-17 09:31", action: "告警触发·药房取药区", tone: "crit" }, { at: "2026-06-17 09:32", action: "对讲呼叫药房窗口工作人员协助核验", tone: "info" }] },
  { id: "AL-2506-004", areaId: "A02", areaName: "急诊入口", level: "medium", status: "watch", durationSec: 395, triggeredAt: "2026-06-17 09:02", isRecurrent: true, mark: "watch", description: "急诊入口外人员反复逗留，已标记关注", timeline: [{ at: "2026-06-17 09:02", action: "告警触发·急诊入口", tone: "crit" }, { at: "2026-06-17 09:05", action: "对讲呼叫巡逻岗·李强（最近岗）", tone: "amber" }, { at: "2026-06-17 09:10", action: "标记关注·反复出现人员", tone: "focus" }] },
  { id: "AL-2506-005", areaId: "A06", areaName: "自助机区", level: "low", status: "pending", durationSec: 244, triggeredAt: "2026-06-17 09:40", isRecurrent: false, description: "自助机区域人员操作超时停留", timeline: [{ at: "2026-06-17 09:40", action: "告警触发·自助机区", tone: "crit" }] },
  { id: "AL-2506-006", areaId: "A05", areaName: "收费窗口", level: "high", status: "handling", durationSec: 488, triggeredAt: "2026-06-17 08:55", handlerId: "P01", handlerName: "张磊", arrivalSec: 142, isRecurrent: false, description: "3号窗口人员长时间逗留，巡逻已到场处置", timeline: [{ at: "2026-06-17 08:55", action: "告警触发·收费窗口", tone: "crit" }, { at: "2026-06-17 08:56", action: "对讲呼叫巡逻岗·张磊", tone: "amber" }, { at: "2026-06-17 08:57", action: "张磊到场处置（142秒）", tone: "info", by: "张磊" }] },
  { id: "AL-2506-007", areaId: "A01", areaName: "门诊大厅", level: "medium", status: "closed", durationSec: 366, triggeredAt: "2026-06-17 08:30", handlerId: "P05", handlerName: "孙浩", arrivalSec: 188, clearanceResult: "cleared", isRecurrent: false, description: "大厅东侧人员滞留，已劝导离开", timeline: [{ at: "2026-06-17 08:30", action: "告警触发·门诊大厅", tone: "crit" }, { at: "2026-06-17 08:33", action: "分派孙浩前往处置", tone: "amber" }, { at: "2026-06-17 08:33", action: "孙浩到场处置（188秒）", tone: "info" }, { at: "2026-06-17 08:36", action: "清场完成·已清场", tone: "ok", by: "孙浩" }] },
  { id: "AL-2506-008", areaId: "A04", areaName: "药房取药区", level: "low", status: "falseAlarm", durationSec: 210, triggeredAt: "2026-06-17 08:12", isRecurrent: false, mark: "false", description: "候诊高峰误报，实为排队取药", timeline: [{ at: "2026-06-17 08:12", action: "告警触发·药房取药区", tone: "crit" }, { at: "2026-06-17 08:15", action: "标记误报·候诊高峰", tone: "mute" }] },
  { id: "AL-2506-009", areaId: "A03", areaName: "ICU外走廊", level: "high", status: "closed", durationSec: 540, triggeredAt: "2026-06-17 07:48", handlerId: "P02", handlerName: "王芳", arrivalSec: 95, clearanceResult: "relocated", isRecurrent: true, description: "ICU外走廊探视者超时停留，已引导至家属等候区", timeline: [{ at: "2026-06-17 07:48", action: "告警触发·ICU外走廊", tone: "crit" }, { at: "2026-06-17 07:49", action: "对讲呼叫护士站协同劝导", tone: "info" }, { at: "2026-06-17 07:52", action: "ICU探视通道门禁临时降权", tone: "amber" }, { at: "2026-06-17 07:50", action: "王芳到场处置（95秒）", tone: "info" }, { at: "2026-06-17 07:55", action: "清场完成·已转移等候区", tone: "ok", by: "王芳" }] },
  { id: "AL-2506-010", areaId: "A02", areaName: "急诊入口", level: "medium", status: "closed", durationSec: 422, triggeredAt: "2026-06-17 07:20", handlerId: "P03", handlerName: "李强", arrivalSec: 120, clearanceResult: "moved", isRecurrent: false, description: "急诊入口人员滞留，已引导至候诊区", timeline: [{ at: "2026-06-17 07:20", action: "告警触发·急诊入口", tone: "crit" }, { at: "2026-06-17 07:22", action: "李强到场处置（120秒）", tone: "info" }, { at: "2026-06-17 07:27", action: "清场完成·已引导离开", tone: "ok", by: "李强" }] },
  { id: "AL-2506-011", areaId: "A06", areaName: "自助机区", level: "low", status: "closed", durationSec: 188, triggeredAt: "2026-06-17 06:55", handlerId: "P05", handlerName: "孙浩", arrivalSec: 210, clearanceResult: "unresolved", isRecurrent: false, description: "自助机故障导致人员滞留，转报后勤", timeline: [{ at: "2026-06-17 06:55", action: "告警触发·自助机区", tone: "crit" }, { at: "2026-06-17 06:58", action: "广播引导至人工窗口", tone: "amber" }, { at: "2026-06-17 06:59", action: "孙浩到场处置（210秒）", tone: "info" }, { at: "2026-06-17 07:02", action: "清场完成·未解决转报", tone: "mute", by: "孙浩" }] },
  { id: "AL-2506-012", areaId: "A01", areaName: "门诊大厅", level: "critical", status: "closed", durationSec: 690, triggeredAt: "2026-06-17 06:30", handlerId: "P01", handlerName: "张磊", arrivalSec: 132, clearanceResult: "cleared", isRecurrent: true, description: "大厅入口可疑人员长时间逗留，已核验清场", timeline: [{ at: "2026-06-17 06:30", action: "告警触发·门诊大厅", tone: "crit" }, { at: "2026-06-17 06:32", action: "大厅侧门门禁临时开启便于引导", tone: "amber" }, { at: "2026-06-17 06:32", action: "张磊到场处置（132秒）", tone: "info" }, { at: "2026-06-17 06:38", action: "清场完成·已清场", tone: "ok", by: "张磊" }] },
];

export const STRATEGIES: AreaStrategy[] = [
  { areaId: "A01", areaName: "门诊大厅", thresholdSec: 480, peakHours: [{ start: "08:00", end: "11:00", patientWaitToleranceSec: 900 }, { start: "14:00", end: "16:30", patientWaitToleranceSec: 780 }], nightRule: { enabled: true, thresholdSec: 300, start: "22:00", end: "06:00" }, holidayRule: { enabled: true, thresholdSec: 420 }, abnormalStayRule: { motionlessSec: 180, revisitWithinMin: 30, maxRevisitCount: 3 }, linkage: { access: true, broadcast: true, intercom: true } },
  { areaId: "A02", areaName: "急诊入口", thresholdSec: 360, peakHours: [{ start: "00:00", end: "06:00", patientWaitToleranceSec: 720 }], nightRule: { enabled: true, thresholdSec: 240, start: "23:00", end: "07:00" }, holidayRule: { enabled: true, thresholdSec: 300 }, abnormalStayRule: { motionlessSec: 120, revisitWithinMin: 20, maxRevisitCount: 2 }, linkage: { access: false, broadcast: true, intercom: true } },
  { areaId: "A03", areaName: "ICU外走廊", thresholdSec: 300, peakHours: [{ start: "10:00", end: "11:00", patientWaitToleranceSec: 600 }, { start: "15:00", end: "16:00", patientWaitToleranceSec: 600 }], nightRule: { enabled: true, thresholdSec: 180, start: "20:00", end: "06:00" }, holidayRule: { enabled: true, thresholdSec: 240 }, abnormalStayRule: { motionlessSec: 90, revisitWithinMin: 15, maxRevisitCount: 2 }, linkage: { access: true, broadcast: false, intercom: true } },
  { areaId: "A04", areaName: "药房取药区", thresholdSec: 420, peakHours: [{ start: "09:00", end: "11:30", patientWaitToleranceSec: 840 }, { start: "14:30", end: "16:00", patientWaitToleranceSec: 720 }], nightRule: { enabled: false, thresholdSec: 300, start: "22:00", end: "06:00" }, holidayRule: { enabled: true, thresholdSec: 360 }, abnormalStayRule: { motionlessSec: 150, revisitWithinMin: 25, maxRevisitCount: 3 }, linkage: { access: false, broadcast: true, intercom: false } },
  { areaId: "A05", areaName: "收费窗口", thresholdSec: 360, peakHours: [{ start: "08:30", end: "11:00", patientWaitToleranceSec: 780 }, { start: "14:00", end: "16:00", patientWaitToleranceSec: 660 }], nightRule: { enabled: false, thresholdSec: 240, start: "22:00", end: "06:00" }, holidayRule: { enabled: true, thresholdSec: 300 }, abnormalStayRule: { motionlessSec: 120, revisitWithinMin: 20, maxRevisitCount: 2 }, linkage: { access: false, broadcast: true, intercom: true } },
  { areaId: "A06", areaName: "自助机区", thresholdSec: 300, peakHours: [{ start: "08:00", end: "10:00", patientWaitToleranceSec: 600 }], nightRule: { enabled: true, thresholdSec: 180, start: "22:00", end: "06:00" }, holidayRule: { enabled: true, thresholdSec: 240 }, abnormalStayRule: { motionlessSec: 90, revisitWithinMin: 15, maxRevisitCount: 2 }, linkage: { access: false, broadcast: true, intercom: false } },
];

export const LINKAGES: LinkageEvent[] = [
  { id: "LK-2026-118", type: "intercom", areaId: "A05", areaName: "收费窗口", triggeredAt: "2026-06-17 09:26:12", sourceAlertId: "AL-2506-002", action: "对讲呼叫巡逻岗·李强（急诊驻点）", result: "success" },
  { id: "LK-2026-117", type: "broadcast", areaId: "A01", areaName: "门诊大厅", triggeredAt: "2026-06-17 09:20:05", sourceAlertId: "AL-2506-001", action: "大厅定向广播提醒：请勿长时间逗留", result: "success" },
  { id: "LK-2026-116", type: "access", areaId: "A03", areaName: "ICU外走廊", triggeredAt: "2026-06-17 07:52:30", sourceAlertId: "AL-2506-009", action: "ICU探视通道门禁临时降权（30分钟）", result: "success" },
  { id: "LK-2026-115", type: "intercom", areaId: "A04", areaName: "药房取药区", triggeredAt: "2026-06-17 09:32:40", sourceAlertId: "AL-2506-003", action: "对讲呼叫药房窗口工作人员协助核验", result: "pending" },
  { id: "LK-2026-114", type: "broadcast", areaId: "A05", areaName: "收费窗口", triggeredAt: "2026-06-17 08:57:18", sourceAlertId: "AL-2506-006", action: "收费区广播引导有序排队", result: "success" },
  { id: "LK-2026-113", type: "intercom", areaId: "A02", areaName: "急诊入口", triggeredAt: "2026-06-17 09:05:22", sourceAlertId: "AL-2506-004", action: "对讲呼叫巡逻岗·李强（最近岗）", result: "success" },
  { id: "LK-2026-112", type: "access", areaId: "A01", areaName: "门诊大厅", triggeredAt: "2026-06-17 06:33:50", sourceAlertId: "AL-2506-012", action: "大厅侧门门禁临时开启便于引导", result: "success" },
  { id: "LK-2026-111", type: "broadcast", areaId: "A06", areaName: "自助机区", triggeredAt: "2026-06-17 06:58:09", sourceAlertId: "AL-2506-011", action: "自助机区广播引导至人工窗口", result: "failed" },
  { id: "LK-2026-110", type: "intercom", areaId: "A03", areaName: "ICU外走廊", triggeredAt: "2026-06-17 07:49:01", sourceAlertId: "AL-2506-009", action: "对讲呼叫护士站协同劝导", result: "success" },
];

const LEADS = ["赵敏", "张磊", "王芳", "李强", "孙浩"];

function buildShifts(): Shift[] {
  const out: Shift[] = [];
  const today = new Date("2026-06-17");
  for (let i = -3; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    const isHoliday = dow === 0 || dow === 6;
    const dayShift: Shift = {
      id: `S-${iso}-D`,
      date: iso,
      shiftType: isHoliday ? "holiday" : "day",
      lead: LEADS[(i + 3) % LEADS.length],
      personnel: PATROL.slice(0, 4),
      status: i < 0 ? "handedOver" : i === 0 ? "active" : "planned",
    };
    const nightShift: Shift = {
      id: `S-${iso}-N`,
      date: iso,
      shiftType: "night",
      lead: LEADS[(i + 4) % LEADS.length],
      personnel: [PATROL[2], PATROL[3], PATROL[4]],
      status: i < 0 ? "handedOver" : i === 0 ? "active" : "planned",
    };
    out.push(dayShift, nightShift);
  }
  return out;
}

export const SHIFTS: Shift[] = buildShifts();

export const HANDOVER: HandoverChecklist = {
  shiftId: "S-2026-06-17-D",
  generatedAt: "2026-06-17 11:32",
  newAlerts: 12,
  handledAlerts: 8,
  pendingItems: [
    { id: "PI-1", area: "收费窗口", desc: "AL-2506-002 处置中，待李强反馈清场结果" },
    { id: "PI-2", area: "药房取药区", desc: "AL-2506-003 已对讲药房，待核验" },
    { id: "PI-3", area: "门诊大厅", desc: "AL-2506-001 高风险，需夜班持续盯控" },
  ],
  focusPersons: [
    { name: "人员 #F-2207", count: 4, areas: ["门诊大厅", "收费窗口"] },
    { name: "人员 #F-3190", count: 3, areas: ["急诊入口"] },
    { name: "人员 #F-4412", count: 2, areas: ["ICU外走廊", "药房取药区"] },
  ],
  focusSlots: [
    { slot: "07:30-08:30", area: "急诊入口", count: 5 },
    { slot: "09:00-10:00", area: "收费窗口", count: 6 },
    { slot: "14:30-15:30", area: "药房取药区", count: 4 },
  ],
  focusAreas: [
    { area: "门诊大厅", count: 4 },
    { area: "收费窗口", count: 3 },
    { area: "急诊入口", count: 3 },
  ],
  signedBy: ["赵敏"],
};

export const AREA_STATS: AreaStat[] = [
  { areaId: "A01", areaName: "门诊大厅", campus: "总院", floor: "1F", loiterCount: 42, avgArrivalSec: 158, clearanceRate: 0.94, falseRate: 0.08 },
  { areaId: "A02", areaName: "急诊入口", campus: "总院", floor: "1F", loiterCount: 35, avgArrivalSec: 112, clearanceRate: 0.9, falseRate: 0.12 },
  { areaId: "A03", areaName: "ICU外走廊", campus: "总院", floor: "3F", loiterCount: 18, avgArrivalSec: 95, clearanceRate: 0.97, falseRate: 0.04 },
  { areaId: "A04", areaName: "药房取药区", campus: "总院", floor: "1F", loiterCount: 29, avgArrivalSec: 176, clearanceRate: 0.88, falseRate: 0.18 },
  { areaId: "A05", areaName: "收费窗口", campus: "总院", floor: "1F", loiterCount: 38, avgArrivalSec: 168, clearanceRate: 0.85, falseRate: 0.1 },
  { areaId: "A06", areaName: "自助机区", campus: "总院", floor: "1F", loiterCount: 22, avgArrivalSec: 142, clearanceRate: 0.91, falseRate: 0.22 },
];

export const EFFICIENCY: EfficiencyPoint[] = [
  { day: "06-11", avgArrivalSec: 182, clearanceRate: 0.86, falseRate: 0.14, escalateRate: 0.06 },
  { day: "06-12", avgArrivalSec: 174, clearanceRate: 0.88, falseRate: 0.12, escalateRate: 0.05 },
  { day: "06-13", avgArrivalSec: 165, clearanceRate: 0.89, falseRate: 0.13, escalateRate: 0.07 },
  { day: "06-14", avgArrivalSec: 158, clearanceRate: 0.9, falseRate: 0.1, escalateRate: 0.05 },
  { day: "06-15", avgArrivalSec: 170, clearanceRate: 0.87, falseRate: 0.16, escalateRate: 0.08 },
  { day: "06-16", avgArrivalSec: 151, clearanceRate: 0.92, falseRate: 0.09, escalateRate: 0.04 },
  { day: "06-17", avgArrivalSec: 144, clearanceRate: 0.93, falseRate: 0.11, escalateRate: 0.05 },
];

export const FOCUS_PERSONS: FocusPersonStat[] = [
  { name: "人员 #F-2207", count: 8, areas: ["门诊大厅", "收费窗口", "急诊入口"], lastSeen: "2026-06-17 09:18" },
  { name: "人员 #F-3190", count: 6, areas: ["急诊入口"], lastSeen: "2026-06-17 09:02" },
  { name: "人员 #F-4412", count: 5, areas: ["ICU外走廊", "药房取药区"], lastSeen: "2026-06-17 07:48" },
  { name: "人员 #F-5581", count: 4, areas: ["门诊大厅", "自助机区"], lastSeen: "2026-06-16 15:22" },
  { name: "人员 #F-6634", count: 3, areas: ["收费窗口"], lastSeen: "2026-06-16 14:05" },
];

export function buildHourHeat(): HourHeat[] {
  const areaNames = AREAS.map((a) => a.id);
  const peak: Record<number, Partial<Record<string, number>>> = {
    7: { A02: 5, A01: 3 },
    8: { A01: 7, A05: 5, A04: 4, A06: 3 },
    9: { A01: 9, A05: 8, A04: 6, A06: 4, A02: 3 },
    10: { A01: 8, A05: 7, A04: 5 },
    14: { A01: 6, A04: 5, A05: 6 },
    15: { A01: 7, A04: 6, A05: 5 },
    21: { A02: 4, A01: 3 },
  };
  const out: HourHeat[] = [];
  for (let h = 0; h < 24; h++) {
    const values: Record<string, number> = {};
    const base = peak[h] || {};
    areaNames.forEach((aid) => {
      values[aid] = base[aid] ?? Math.floor(Math.random() * 2);
    });
    out.push({ hour: h, values });
  }
  return out;
}

export const ALERT_SEEDS: { areaId: string; areaName: string; level: Alert["level"]; description: string }[] = [
  { areaId: "A01", areaName: "门诊大厅", level: "medium", description: "大厅西侧人员滞留，疑似寻人" },
  { areaId: "A05", areaName: "收费窗口", level: "high", description: "收费区人员长时间逗留，情绪激动" },
  { areaId: "A04", areaName: "药房取药区", level: "medium", description: "取药区人员往返徘徊超阈值" },
  { areaId: "A02", areaName: "急诊入口", level: "low", description: "急诊入口外人员短暂逗留" },
  { areaId: "A06", areaName: "自助机区", level: "medium", description: "自助机区域操作超时停留" },
  { areaId: "A03", areaName: "ICU外走廊", level: "high", description: "ICU外走廊探视者超时停留" },
];
