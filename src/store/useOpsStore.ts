import { create } from "zustand";
import {
  ALERT_SEEDS,
  AREAS,
  HANDOVER,
  INITIAL_ALERTS,
  LINKAGES,
  PATROL,
  SHIFTS,
  STRATEGIES,
} from "@/data/mock";
import type {
  Alert,
  AlertLevel,
  AlertMark,
  Area,
  AreaStrategy,
  ClearanceResult,
  HandoverChecklist,
  LinkageEvent,
  LinkageType,
  Personnel,
  Shift,
  TimelineEntry,
} from "@/types";
import { CLEARANCE_META, LEVEL_RANK, formatClock } from "@/lib/meta";

let alertSeq = INITIAL_ALERTS.length;
let linkageSeq = LINKAGES.length;

function genLinkageId() {
  linkageSeq += 1;
  return `LK-2026-${String(118 + linkageSeq).padStart(3, "0")}`;
}

function pushTimeline(alert: Alert, entry: Omit<TimelineEntry, "at">, clock: string): TimelineEntry[] {
  return [...(alert.timeline ?? []), { at: `2026-06-17 ${clock.slice(0, 5)}`, ...entry }];
}

function nearestPatrol(area: Area, patrol: Personnel[]): Personnel | undefined {
  const avail = patrol.filter((p) => p.status !== "handling");
  const pool = avail.length ? avail : patrol;
  let best = pool[0];
  let bestD = Infinity;
  for (const p of pool) {
    const d = Math.hypot(p.x - area.x, p.y - area.y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) * 10);
}

function isHoliday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const w = d.getDay();
  return w === 0 || w === 6;
}

export type EffectiveRuleType = "holiday" | "night" | "peak" | "base";

export function effectiveRule(strategy: AreaStrategy, now: Date): { type: EffectiveRuleType; threshold: number } {
  const h = now.getHours();
  const m = now.getMinutes();
  const t = h + m / 60;
  if (strategy.holidayRule.enabled && isHoliday("2026-06-17")) {
    return { type: "holiday", threshold: strategy.holidayRule.thresholdSec };
  }
  if (strategy.nightRule.enabled) {
    const nsh = Number(strategy.nightRule.start.slice(0, 2)) + Number(strategy.nightRule.start.slice(3)) / 60;
    const neh = Number(strategy.nightRule.end.slice(0, 2)) + Number(strategy.nightRule.end.slice(3)) / 60;
    const inNight = nsh < neh ? t >= nsh && t < neh : t >= nsh || t < neh;
    if (inNight) return { type: "night", threshold: strategy.nightRule.thresholdSec };
  }
  for (const p of strategy.peakHours) {
    const ps = Number(p.start.slice(0, 2)) + Number(p.start.slice(3)) / 60;
    const pe = Number(p.end.slice(0, 2)) + Number(p.end.slice(3)) / 60;
    if (t >= ps && t < pe) return { type: "peak", threshold: p.patientWaitToleranceSec };
  }
  return { type: "base", threshold: strategy.thresholdSec };
}

export function effectiveThreshold(strategy: AreaStrategy, now: Date): number {
  return effectiveRule(strategy, now).threshold;
}

function reevaluateLevel(durationSec: number, thresholdSec: number): AlertLevel {
  const ratio = durationSec / thresholdSec;
  if (ratio >= 1.6) return "critical";
  if (ratio >= 1.2) return "high";
  if (ratio >= 0.9) return "medium";
  return "low";
}

function buildLinkageFor(
  alert: Alert,
  area: Area,
  strategy: AreaStrategy,
  types: LinkageType[],
  clock: string,
  extra: { guardName?: string; guardPost?: string; result?: LinkageEvent["result"] } = {},
): LinkageEvent[] {
  const out: LinkageEvent[] = [];
  for (const t of types) {
    if (!strategy.linkage[t]) continue;
    let action = "";
    if (t === "intercom") {
      if (extra.guardName) {
        action = `对讲呼叫巡逻岗·${extra.guardName}（${extra.guardPost ?? "最近岗"}）`;
      } else {
        action = `对讲通报${area.name}高风险告警`;
      }
    } else if (t === "broadcast") {
      action = `${area.name}定向广播提醒：请勿长时间逗留`;
    } else if (t === "access") {
      action = `${area.name}门禁临时降权（30分钟）`;
    }
    out.push({
      id: genLinkageId(),
      type: t,
      areaId: area.id,
      areaName: area.name,
      triggeredAt: `2026-06-17 ${clock}`,
      sourceAlertId: alert.id,
      action,
      result: extra.result ?? "success",
    });
  }
  return out;
}

function recomputeAreas(alerts: Alert[], strategies: AreaStrategy[], now: Date): Area[] {
  return AREAS.map((area) => {
    const areaAlerts = alerts.filter(
      (a) => a.areaId === area.id && a.status !== "closed" && a.status !== "falseAlarm",
    );
    const strat = strategies.find((s) => s.areaId === area.id);
    const threshold = strat ? effectiveThreshold(strat, now) : 300;
    const maxDur = areaAlerts.reduce((m, a) => Math.max(m, a.durationSec), 0);
    const active = areaAlerts.length;
    const maxRatio = threshold ? maxDur / threshold : 0;
    const status: Area["status"] =
      maxRatio >= 1.6 || active >= 3
        ? "critical"
        : maxRatio >= 1 || active >= 1
          ? "warning"
          : "normal";
    return { ...area, maxDurationSec: maxDur, currentLoitering: active, status };
  });
}

function recomputeHandover(alerts: Alert[], clock: string, existingSignedBy: string[] = [] ): HandoverChecklist {
  const closed = alerts.filter((a) => a.status === "closed");
  const newAlerts = alerts.filter((a) => a.triggeredAt.startsWith("2026-06-17")).length;
  const pendingItems = alerts
    .filter((a) => a.status !== "closed" && a.status !== "falseAlarm")
    .map((a) => {
      let desc = `${a.id} 滞留 ${Math.floor(a.durationSec / 60)}分钟`;
      if (a.status === "handling" && a.handlerName) desc += `，${a.handlerName}处置中`;
      else if (a.status === "dispatched") desc += `，已分派${a.handlerName ?? "巡逻岗"}`;
      else if (a.mark === "escalate") desc += `，已升级`;
      else desc += "，待处置";
      return { id: `PI-${a.id}`, area: a.areaName, desc };
    });

  const persons: { name: string; count: number; areas: string[]; lastSeen: string }[] = [];
  for (let i = 0; i < alerts.length; i++) {
    const a = alerts[i];
    if (!a.isRecurrent) continue;
    const idx = persons.findIndex((p) => p.name === `人员 #F-${2207 + (i % 50)}`);
    const name = `人员 #F-${2207 + (i % 50)}`;
    if (idx >= 0) {
      persons[idx].count += 1;
      if (!persons[idx].areas.includes(a.areaName)) persons[idx].areas.push(a.areaName);
      persons[idx].lastSeen = a.triggeredAt;
    } else {
      persons.push({ name, count: 1, areas: [a.areaName], lastSeen: a.triggeredAt });
    }
  }

  const slotCounts: Record<string, { slot: string; area: string; count: number }> = {};
  const areaCounts: Record<string, { area: string; count: number }> = {};
  for (const a of alerts) {
    if (a.status === "falseAlarm") continue;
    const hh = Number(a.triggeredAt.slice(11, 13));
    const slot = `${String(hh).padStart(2, "0")}:00-${String(hh + 1).padStart(2, "0")}:00`;
    const key = `${slot}@${a.areaName}`;
    if (!slotCounts[key]) slotCounts[key] = { slot, area: a.areaName, count: 0 };
    slotCounts[key].count += 1;
    if (!areaCounts[a.areaName]) areaCounts[a.areaName] = { area: a.areaName, count: 0 };
    areaCounts[a.areaName].count += 1;
  }
  const slots = Object.values(slotCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const focusAreas = Object.values(areaCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    shiftId: "S-2026-06-17-D",
    generatedAt: `2026-06-17 ${clock.slice(0, 5)}`,
    newAlerts,
    handledAlerts: closed.length,
    pendingItems,
    focusPersons: persons.slice(0, 3),
    focusSlots: slots,
    focusAreas,
    signedBy: existingSignedBy,
  };
}

export interface OpsState {
  clock: string;
  alerts: Alert[];
  areas: Area[];
  patrol: Personnel[];
  strategies: AreaStrategy[];
  linkages: LinkageEvent[];
  shifts: Shift[];
  handover: HandoverChecklist;
  selectedAlertId: string | null;
  tickCount: number;

  selectAlert: (id: string | null) => void;
  markAlert: (id: string, mark: AlertMark) => void;
  dispatchNearest: (id: string) => void;
  closeAlert: (id: string, arrivalSec: number, result: ClearanceResult) => void;
  updateStrategy: (areaId: string, patch: Partial<AreaStrategy>) => void;
  toggleLinkage: (areaId: string, type: LinkageType) => void;
  signHandover: (name: string) => void;
  tick: () => void;
  addAlert: (seed?: (typeof ALERT_SEEDS)[number]) => void;
  reevaluateFromStrategy: (areaId: string) => void;
}

export const useOpsStore = create<OpsState>((set, get) => ({
  clock: formatClock(new Date()),
  alerts: INITIAL_ALERTS,
  areas: AREAS,
  patrol: PATROL,
  strategies: STRATEGIES,
  linkages: LINKAGES,
  shifts: SHIFTS,
  handover: HANDOVER,
  selectedAlertId: INITIAL_ALERTS[0]?.id ?? null,
  tickCount: 0,

  selectAlert: (id) => set({ selectedAlertId: id }),

  markAlert: (id, mark) =>
    set((state) => {
      const alert = state.alerts.find((a) => a.id === id);
      if (!alert) return state;
      const area = state.areas.find((a) => a.id === alert.areaId);
      const strat = state.strategies.find((s) => s.areaId === alert.areaId);
      let newLinkages: LinkageEvent[] = [];
      if (mark === "escalate" && area && strat) {
        newLinkages = buildLinkageFor(alert, area, strat, ["access", "broadcast", "intercom"], state.clock);
      }
      const now = new Date();
      const alerts: Alert[] = state.alerts.map((a) => {
        if (a.id !== id) return a;
        if (mark === "false")
          return {
            ...a,
            mark,
            status: "falseAlarm" as const,
            timeline: pushTimeline(a, { action: "标记误报", tone: "mute" }, state.clock),
          };
        if (mark === "watch")
          return {
            ...a,
            mark,
            status: "watch" as const,
            timeline: pushTimeline(a, { action: "标记关注", tone: "focus" }, state.clock),
          };
        return {
          ...a,
          mark,
          level: "critical" as const,
          status: "pending" as const,
          timeline: pushTimeline(a, { action: "升级处置·高风险", tone: "crit" }, state.clock),
        };
      });
      const areas = recomputeAreas(alerts, state.strategies, now);
      const handover = recomputeHandover(alerts, state.clock, state.handover.signedBy);
      return {
        alerts,
        areas,
        handover,
        linkages: [...newLinkages, ...state.linkages],
      };
    }),

  dispatchNearest: (id) => {
    const state = get();
    const alert = state.alerts.find((a) => a.id === id);
    if (!alert) return;
    const area = state.areas.find((a) => a.id === alert.areaId);
    if (!area) return;
    const guard = nearestPatrol(area, state.patrol);
    if (!guard) return;
    const strat = state.strategies.find((s) => s.areaId === alert.areaId);
    const newLinkages = strat
      ? buildLinkageFor(alert, area, strat, ["access", "broadcast", "intercom"], state.clock, {
          guardName: guard.name,
          guardPost: guard.post,
        })
      : [];
    const now = new Date();
    const alerts: Alert[] = state.alerts.map((a) =>
      a.id === id
        ? {
            ...a,
            status: "dispatched" as const,
            handlerId: guard.id,
            handlerName: guard.name,
            level: "critical" as const,
            timeline: pushTimeline(a, { action: `分派${guard.name}前往处置`, tone: "amber", by: guard.name }, state.clock),
          }
        : a,
    );
    const areas = recomputeAreas(alerts, state.strategies, now);
    const handover = recomputeHandover(alerts, state.clock, state.handover.signedBy);
    set({
      alerts,
      areas,
      handover,
      patrol: state.patrol.map((p) => (p.id === guard.id ? { ...p, status: "handling" as const } : p)),
      linkages: [...newLinkages, ...state.linkages],
    });
  },

  closeAlert: (id, arrivalSec, result) =>
    set((state) => {
      const alert = state.alerts.find((a) => a.id === id);
      const handlerId = alert?.handlerId;
      const handlerName = alert?.handlerName;
      const now = new Date();
      const alerts: Alert[] = state.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "closed" as const,
              arrivalSec,
              clearanceResult: result,
              timeline: pushTimeline(
                pushTimeline(a, { action: `到场处置（${arrivalSec}秒）`, tone: "info", by: handlerName }, state.clock),
                { action: `清场完成·${CLEARANCE_META[result]}`, tone: "ok", by: handlerName },
                state.clock,
              ),
            }
          : a,
      );
      const areas = recomputeAreas(alerts, state.strategies, now);
      const handover = recomputeHandover(alerts, state.clock, state.handover.signedBy);
      return {
        alerts,
        areas,
        handover,
        patrol: handlerId
          ? state.patrol.map((p) =>
              p.id === handlerId && p.status === "handling" ? { ...p, status: "standby" as const } : p,
            )
          : state.patrol,
      };
    }),

  reevaluateFromStrategy: (areaId) =>
    set((state) => {
      const strat = state.strategies.find((s) => s.areaId === areaId);
      if (!strat) return state;
      const now = new Date();
      const threshold = effectiveThreshold(strat, now);
      const alerts: Alert[] = state.alerts.map((a) => {
        if (a.areaId !== areaId) return a;
        if (a.status === "closed" || a.status === "falseAlarm") return a;
        if (a.mark === "escalate") return { ...a, level: "critical" as const };
        const level = reevaluateLevel(a.durationSec, threshold);
        return { ...a, level };
      });
      const areas = recomputeAreas(alerts, state.strategies, now);
      const handover = recomputeHandover(alerts, state.clock, state.handover.signedBy);
      return { alerts, areas, handover };
    }),

  updateStrategy: (areaId, patch) =>
    set((state) => {
      const strategies = state.strategies.map((s) =>
        s.areaId === areaId ? { ...s, ...patch } : s,
      );
      const newStrat = strategies.find((s) => s.areaId === areaId);
      if (!newStrat) return { strategies };
      const now = new Date();
      const threshold = effectiveThreshold(newStrat, now);
      const alerts: Alert[] = state.alerts.map((a) => {
        if (a.areaId !== areaId) return a;
        if (a.status === "closed" || a.status === "falseAlarm") return a;
        if (a.mark === "escalate") return { ...a, level: "critical" as const };
        const level = reevaluateLevel(a.durationSec, threshold);
        return { ...a, level };
      });
      const areas = recomputeAreas(alerts, strategies, now);
      const handover = recomputeHandover(alerts, state.clock, state.handover.signedBy);
      return { strategies, alerts, areas, handover };
    }),

  toggleLinkage: (areaId, type) =>
    set((state) => ({
      strategies: state.strategies.map((s) =>
        s.areaId === areaId ? { ...s, linkage: { ...s.linkage, [type]: !s.linkage[type] } } : s,
      ),
    })),

  signHandover: (name) => {
    const state = get();
    const now = new Date();
    const signedBy = state.handover.signedBy.includes(name)
      ? state.handover.signedBy
      : [...state.handover.signedBy, name];
    set({
      handover: { ...recomputeHandover(state.alerts, formatClock(now), signedBy), signedBy },
    });
  },

  addAlert: (seed) => {
    const s = seed ?? ALERT_SEEDS[Math.floor(Math.random() * ALERT_SEEDS.length)];
    alertSeq += 1;
    const id = `AL-2506-${String(alertSeq).padStart(3, "0")}`;
    const state0 = get();
    const strat = state0.strategies.find((st) => st.areaId === s.areaId);
    const now = new Date();
    const threshold = strat ? effectiveThreshold(strat, now) : 300;
    const durationSec = threshold + Math.floor(Math.random() * 240);
    const level = reevaluateLevel(durationSec, threshold);
    const newAlert: Alert = {
      id,
      areaId: s.areaId,
      areaName: s.areaName,
      level,
      status: "pending" as const,
      durationSec,
      triggeredAt: `2026-06-17 ${state0.clock.slice(0, 5)}`,
      isRecurrent: Math.random() > 0.8,
      description: s.description,
      timeline: [{ at: `2026-06-17 ${state0.clock.slice(0, 5)}`, action: `告警触发·${s.areaName}`, tone: "crit" }],
    };
    set((state) => {
      const alerts: Alert[] = [newAlert, ...state.alerts].slice(0, 24);
      const areas = recomputeAreas(alerts, state.strategies, now);
      const handover = recomputeHandover(alerts, state.clock, state.handover.signedBy);
      return { alerts, areas, handover };
    });
  },

  tick: () => {
    const state = get();
    const next = state.tickCount + 1;
    const now = new Date();
    const alerts: Alert[] = state.alerts.map((a) => {
      if (a.status === "pending" || a.status === "dispatched" || a.status === "handling") {
        return { ...a, durationSec: a.durationSec + 1 };
      }
      return a;
    });
    for (const strat of state.strategies) {
      const threshold = effectiveThreshold(strat, now);
      for (let i = 0; i < alerts.length; i++) {
        const a = alerts[i];
        if (a.areaId !== strat.areaId) continue;
        if (a.status === "closed" || a.status === "falseAlarm") continue;
        if (a.mark === "escalate") continue;
        alerts[i] = { ...a, level: reevaluateLevel(a.durationSec, threshold) };
      }
    }
    const patrol = state.patrol.map((p) => {
      if (p.status !== "patrol") return p;
      const nx = Math.max(8, Math.min(92, p.x + (Math.random() - 0.5) * 4));
      const ny = Math.max(8, Math.min(92, p.y + (Math.random() - 0.5) * 4));
      return { ...p, x: Math.round(nx), y: Math.round(ny) };
    });
    const areas = recomputeAreas(alerts, state.strategies, now);
    const handover = recomputeHandover(alerts, formatClock(now), state.handover.signedBy);
    set({ clock: formatClock(now), tickCount: next, alerts, patrol, areas, handover });
    if (next % 22 === 0 && state.alerts.length < 20) {
      get().addAlert();
    }
  },
}));

export function selectActiveAlerts(state: OpsState): Alert[] {
  return [...state.alerts]
    .filter((a) => a.status !== "closed" && a.status !== "falseAlarm")
    .sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level] || b.durationSec - a.durationSec);
}

export { dist };
