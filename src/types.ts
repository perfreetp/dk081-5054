export type AreaType =
  | "门诊大厅"
  | "急诊入口"
  | "ICU外走廊"
  | "药房取药区"
  | "收费窗口"
  | "自助机区";

export type AreaStatus = "normal" | "warning" | "critical";

export type AlertLevel = "low" | "medium" | "high" | "critical";

export type AlertStatus =
  | "pending"
  | "dispatched"
  | "handling"
  | "closed"
  | "falseAlarm"
  | "watch";

export type AlertMark = "false" | "watch" | "escalate";

export type ClearanceResult = "cleared" | "moved" | "relocated" | "unresolved";

export type LinkageType = "access" | "broadcast" | "intercom";

export type LinkageResult = "success" | "failed" | "pending";

export type ShiftType = "day" | "night" | "holiday";

export type ShiftStatus = "planned" | "active" | "handedOver";

export type PersonnelStatus = "patrol" | "standby" | "handling";

export interface Area {
  id: string;
  name: string;
  type: AreaType;
  campus: string;
  floor: string;
  cameraCount: number;
  currentLoitering: number;
  maxDurationSec: number;
  status: AreaStatus;
  x: number;
  y: number;
}

export interface Personnel {
  id: string;
  name: string;
  role: string;
  post: string;
  status: PersonnelStatus;
  x: number;
  y: number;
}

export interface Alert {
  id: string;
  areaId: string;
  areaName: string;
  level: AlertLevel;
  status: AlertStatus;
  durationSec: number;
  triggeredAt: string;
  handlerId?: string;
  handlerName?: string;
  arrivalSec?: number;
  clearanceResult?: ClearanceResult;
  description: string;
  isRecurrent: boolean;
  mark?: AlertMark;
}

export interface PeakHour {
  start: string;
  end: string;
  patientWaitToleranceSec: number;
}

export interface AreaStrategy {
  areaId: string;
  areaName: string;
  thresholdSec: number;
  peakHours: PeakHour[];
  nightRule: { enabled: boolean; thresholdSec: number; start: string; end: string };
  holidayRule: { enabled: boolean; thresholdSec: number };
  abnormalStayRule: {
    motionlessSec: number;
    revisitWithinMin: number;
    maxRevisitCount: number;
  };
  linkage: { access: boolean; broadcast: boolean; intercom: boolean };
}

export interface LinkageEvent {
  id: string;
  type: LinkageType;
  areaId: string;
  areaName: string;
  triggeredAt: string;
  sourceAlertId: string;
  action: string;
  result: LinkageResult;
}

export interface Shift {
  id: string;
  date: string;
  shiftType: ShiftType;
  lead: string;
  personnel: Personnel[];
  status: ShiftStatus;
}

export interface HandoverChecklist {
  shiftId: string;
  generatedAt: string;
  handledAlerts: number;
  pendingItems: { id: string; area: string; desc: string }[];
  focusPersons: { name: string; count: number; areas: string[] }[];
  focusSlots: { slot: string; area: string; count: number }[];
  signedBy: string[];
}

export interface AreaStat {
  areaId: string;
  areaName: string;
  campus: string;
  floor: string;
  loiterCount: number;
  avgArrivalSec: number;
  clearanceRate: number;
  falseRate: number;
}

export interface EfficiencyPoint {
  day: string;
  avgArrivalSec: number;
  clearanceRate: number;
  falseRate: number;
  escalateRate: number;
}

export interface FocusPersonStat {
  name: string;
  count: number;
  areas: string[];
  lastSeen: string;
}

export interface HourHeat {
  hour: number;
  values: Record<string, number>;
}
