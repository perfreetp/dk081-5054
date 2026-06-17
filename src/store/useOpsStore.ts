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
  AlertMark,
  Area,
  AreaStrategy,
  ClearanceResult,
  HandoverChecklist,
  LinkageEvent,
  LinkageType,
  Personnel,
  Shift,
} from "@/types";
import { LEVEL_RANK, formatClock } from "@/lib/meta";

let alertSeq = INITIAL_ALERTS.length;

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
    set((state) => ({
      alerts: state.alerts.map((a) => {
        if (a.id !== id) return a;
        if (mark === "false") return { ...a, mark, status: "falseAlarm" };
        if (mark === "watch") return { ...a, mark, status: "watch" };
        return { ...a, mark, level: "critical", status: "pending" };
      }),
    })),

  dispatchNearest: (id) => {
    const state = get();
    const alert = state.alerts.find((a) => a.id === id);
    if (!alert) return;
    const area = state.areas.find((a) => a.id === alert.areaId);
    if (!area) return;
    const guard = nearestPatrol(area, state.patrol);
    if (!guard) return;
    const newLinkages: LinkageEvent[] = [];
    const strat = state.strategies.find((s) => s.areaId === alert.areaId);
    if (strat?.linkage.intercom) {
      newLinkages.push({
        id: `LK-${Date.now()}`,
        type: "intercom",
        areaId: area.id,
        areaName: area.name,
        triggeredAt: `2026-06-17 ${state.clock}`,
        sourceAlertId: alert.id,
        action: `对讲呼叫巡逻岗·${guard.name}（${guard.post}）`,
        result: "success",
      });
    }
    set({
      alerts: state.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "dispatched",
              handlerId: guard.id,
              handlerName: guard.name,
              level: "critical",
            }
          : a,
      ),
      patrol: state.patrol.map((p) =>
        p.id === guard.id ? { ...p, status: "handling" } : p,
      ),
      linkages: [...newLinkages, ...state.linkages],
    });
  },

  closeAlert: (id, arrivalSec, result) =>
    set((state) => {
      const alert = state.alerts.find((a) => a.id === id);
      const handlerId = alert?.handlerId;
      return {
        alerts: state.alerts.map((a) =>
          a.id === id
            ? { ...a, status: "closed", arrivalSec, clearanceResult: result }
            : a,
        ),
        patrol: handlerId
          ? state.patrol.map((p) =>
              p.id === handlerId && p.status === "handling"
                ? { ...p, status: "standby" }
                : p,
            )
          : state.patrol,
      };
    }),

  updateStrategy: (areaId, patch) =>
    set((state) => ({
      strategies: state.strategies.map((s) =>
        s.areaId === areaId ? { ...s, ...patch } : s,
      ),
    })),

  toggleLinkage: (areaId, type) =>
    set((state) => ({
      strategies: state.strategies.map((s) =>
        s.areaId === areaId
          ? { ...s, linkage: { ...s.linkage, [type]: !s.linkage[type] } }
          : s,
      ),
    })),

  signHandover: (name) =>
    set((state) => ({
      handover: {
        ...state.handover,
        signedBy: state.handover.signedBy.includes(name)
          ? state.handover.signedBy
          : [...state.handover.signedBy, name],
      },
    })),

  addAlert: (seed) => {
    const s = seed ?? ALERT_SEEDS[Math.floor(Math.random() * ALERT_SEEDS.length)];
    alertSeq += 1;
    const id = `AL-2506-${String(alertSeq).padStart(3, "0")}`;
    const newAlert: Alert = {
      id,
      areaId: s.areaId,
      areaName: s.areaName,
      level: s.level,
      status: "pending",
      durationSec: 30 + Math.floor(Math.random() * 120),
      triggeredAt: `2026-06-17 ${get().clock.slice(0, 5)}`,
      isRecurrent: Math.random() > 0.8,
      description: s.description,
    };
    set((state) => ({ alerts: [newAlert, ...state.alerts].slice(0, 24) }));
  },

  tick: () => {
    const state = get();
    const next = state.tickCount + 1;
    const now = new Date();
    const alerts = state.alerts.map((a) => {
      if (a.status === "pending" || a.status === "dispatched" || a.status === "handling") {
        return { ...a, durationSec: a.durationSec + 1 };
      }
      return a;
    });
    const patrol = state.patrol.map((p) => {
      if (p.status !== "patrol") return p;
      const nx = Math.max(8, Math.min(92, p.x + (Math.random() - 0.5) * 4));
      const ny = Math.max(8, Math.min(92, p.y + (Math.random() - 0.5) * 4));
      return { ...p, x: Math.round(nx), y: Math.round(ny) };
    });
    const areas = state.areas.map((area) => {
      const maxDur = alerts
        .filter((a) => a.areaId === area.id && a.status !== "closed" && a.status !== "falseAlarm")
        .reduce((m, a) => Math.max(m, a.durationSec), 0);
      const active = alerts.filter(
        (a) => a.areaId === area.id && a.status !== "closed" && a.status !== "falseAlarm",
      ).length;
      const status = maxDur > 600 || active >= 3 ? "critical" : maxDur > 360 || active >= 1 ? "warning" : "normal";
      return { ...area, maxDurationSec: maxDur, currentLoitering: active, status };
    });
    set({ clock: formatClock(now), tickCount: next, alerts, patrol, areas });
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
