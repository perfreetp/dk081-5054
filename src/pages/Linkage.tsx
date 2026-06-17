import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DoorClosed,
  Filter,
  Phone,
  Radio,
  Send,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LinkageType } from "@/types";
import { useOpsStore } from "@/store/useOpsStore";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/Bits";
import { LEVEL_META, LINKAGE_META } from "@/lib/meta";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<LinkageType, typeof Radio> = {
  access: DoorClosed,
  broadcast: Radio,
  intercom: Phone,
};

interface ChainNode {
  key: string;
  label: string;
  sub?: string;
  kind: "trigger" | "dispatch" | "linkage" | "arrival" | "clear" | "escalate" | "mute";
  tone: "crit" | "amber" | "info" | "ok" | "focus" | "mute";
  icon?: typeof Radio;
  result?: "success" | "failed" | "pending";
}

const RESULT_META: Record<string, { label: string; icon: typeof Radio; text: string; bg: string }> = {
  success: { label: "成功", icon: CheckCircle2, text: "text-ok", bg: "bg-ok/12" },
  failed: { label: "失败", icon: XCircle, text: "text-crit", bg: "bg-crit/12" },
  pending: { label: "执行中", icon: Clock, text: "text-amber", bg: "bg-amber/12" },
};

const NODE_BG: Record<string, string> = {
  crit: "bg-crit/15 text-crit",
  amber: "bg-amber/15 text-amber",
  info: "bg-info/15 text-info",
  ok: "bg-ok/15 text-ok",
  focus: "bg-focus/15 text-focus",
  mute: "bg-white/5 text-ink-dim",
};

function buildChain(
  alertId: string,
  alerts: ReturnType<typeof useOpsStore>["alerts"],
  linkages: ReturnType<typeof useOpsStore>["linkages"],
): ChainNode[] {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return [];
  const myLinkages = linkages.filter((l) => l.sourceAlertId === alertId);
  const nodes: ChainNode[] = [];

  nodes.push({
    key: "trigger",
    label: `告警触发 · ${alert.areaName}`,
    sub: alert.triggeredAt.slice(-5),
    kind: "trigger",
    tone: "crit",
  });

  for (const tl of alert.timeline ?? []) {
    let match: ChainNode | null = null;
    if (tl.action.includes("分派")) {
      match = {
        key: `disp-${tl.at}`,
        label: tl.action,
        sub: tl.at.slice(-5),
        kind: "dispatch",
        tone: "amber",
        icon: Send,
      };
    } else if (tl.action.includes("升级")) {
      match = {
        key: `esc-${tl.at}`,
        label: tl.action,
        sub: tl.at.slice(-5),
        kind: "escalate",
        tone: "crit",
      };
    } else if (tl.action.includes("到场")) {
      match = {
        key: `arr-${tl.at}`,
        label: tl.action,
        sub: tl.at.slice(-5),
        kind: "arrival",
        tone: "info",
      };
    } else if (tl.action.includes("清场")) {
      match = {
        key: `clr-${tl.at}`,
        label: tl.action,
        sub: tl.at.slice(-5),
        kind: "clear",
        tone: "ok",
      };
    } else if (tl.action.includes("误报")) {
      match = {
        key: `mute-${tl.at}`,
        label: tl.action,
        sub: tl.at.slice(-5),
        kind: "mute",
        tone: "mute",
      };
    } else if (tl.action.includes("关注")) {
      match = {
        key: `f-${tl.at}`,
        label: tl.action,
        sub: tl.at.slice(-5),
        kind: "mute",
        tone: "focus",
      };
    }
    if (match) nodes.push(match);
  }

  for (const l of myLinkages) {
    const meta = LINKAGE_META[l.type];
    const Icon = TYPE_ICON[l.type];
    nodes.push({
      key: l.id,
      label: l.action,
      sub: l.triggeredAt.slice(-5),
      kind: "linkage",
      tone: meta.text === "text-info" ? "info" : meta.text === "text-amber" ? "amber" : "ok",
      icon: Icon,
      result: l.result,
    });
  }

  nodes.sort((a, b) => (a.sub ?? "").localeCompare(b.sub ?? ""));
  return nodes;
}

export default function Linkage() {
  const navigate = useNavigate();
  const alerts = useOpsStore((s) => s.alerts);
  const selectAlert = useOpsStore((s) => s.selectAlert);
  const linkages = useOpsStore((s) => s.linkages);
  const [filter, setFilter] = useState<LinkageType | "all">("all");

  const alertIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of alerts) ids.add(a.id);
    for (const l of linkages) ids.add(l.sourceAlertId);
    return Array.from(ids);
  }, [alerts, linkages]);

  const chains = useMemo(() => {
    return alertIds
      .map((id) => {
        const alert = alerts.find((a) => a.id === id);
        const linkagesFor = linkages.filter((l) => l.sourceAlertId === id);
        const filteredLinkages =
          filter === "all" ? linkagesFor : linkagesFor.filter((l) => l.type === filter);
        if (!alert && filteredLinkages.length === 0) return null;
        const nodes = buildChain(id, alerts, linkages).filter((n) => {
          if (filter === "all") return true;
          if (n.kind !== "linkage") return true;
          return linkagesFor.some((l) => l.id === n.key && l.type === filter);
        });
        return { id, alert, nodes, linkagesFor };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const la = a!.nodes[a!.nodes.length - 1]?.sub ?? "";
        const lb = b!.nodes[b!.nodes.length - 1]?.sub ?? "";
        return lb.localeCompare(la);
      }) as {
      id: string;
      alert: ReturnType<typeof useOpsStore>["alerts"][number] | undefined;
      nodes: ChainNode[];
      linkagesFor: typeof linkages;
    }[];
  }, [alertIds, alerts, linkages, filter]);

  const counts = {
    all: linkages.length,
    access: linkages.filter((l) => l.type === "access").length,
    broadcast: linkages.filter((l) => l.type === "broadcast").length,
    intercom: linkages.filter((l) => l.type === "intercom").length,
  };

  const tabs: {
    key: LinkageType | "all";
    label: string;
    icon?: typeof Radio;
  }[] = [
    { key: "all", label: "全部" },
    { key: "access", label: "门禁", icon: DoorClosed },
    { key: "broadcast", label: "广播", icon: Radio },
    { key: "intercom", label: "对讲", icon: Phone },
  ];

  const goAlert = (id: string) => {
    selectAlert(id);
    navigate("/alerts");
  };

  return (
    <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-5">
      <Panel title="联动类型" icon={<Filter className="h-4 w-4" />} bodyClass="p-2">
        <div className="space-y-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "flex w-full items-center gap-2 rounded px-3 py-2.5 text-[13px] transition-colors",
                filter === t.key
                  ? "bg-amber/10 text-amber"
                  : "text-ink-dim hover:bg-white/5 hover:text-ink",
              )}
            >
              {t.icon && <t.icon className="h-3.5 w-3.5" />}
              <span className="flex-1 text-left">{t.label}</span>
              <span className="font-mono text-[11px] text-ink-mute">{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded border border-line bg-void/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-mute">处置链路数</div>
          <div className="mt-1 font-mono text-2xl font-bold tabular text-ok">{chains.length}</div>
        </div>
      </Panel>

      <Panel title="处置链路视图" action={<span className="font-mono text-[10px] text-ink-mute">按告警聚合</span>} bodyClass="p-0">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {chains.length ? (
            <div className="space-y-3 px-4 py-4">
              {chains.map((chain) => {
                const alert = chain.alert;
                const lvl = alert ? LEVEL_META[alert.level] : null;
                return (
                  <div key={chain.id} className="rounded-md border border-line bg-panel/60 p-3">
                    <div className="flex items-center gap-2">
                      {lvl && (
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", lvl.bg, lvl.text)}>
                          {lvl.label}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-ink">{chain.id}</span>
                      <span className="text-[12px] text-ink-dim">
                        {alert?.areaName ?? chain.linkagesFor[0]?.areaName ?? "—"}
                      </span>
                      <button
                        onClick={() => goAlert(chain.id)}
                        className="ml-auto flex items-center gap-1 rounded border border-amber/30 bg-amber/5 px-2 py-0.5 font-mono text-[10px] text-amber hover:bg-amber/15"
                      >
                        <ArrowRight className="h-2.5 w-2.5" />
                        查看处置时间线
                      </button>
                    </div>
                    {alert?.description && (
                      <p className="mt-1 text-[11px] text-ink-dim">{alert.description}</p>
                    )}
                    <div className="relative mt-3 flex flex-wrap items-center gap-1.5 pl-2">
                      <span className="absolute left-0 top-1 bottom-1 w-px bg-line" />
                      {chain.nodes.map((n, i) => {
                        const Icon = n.icon ?? Clock;
                        const rm = n.result ? RESULT_META[n.result] : null;
                        return (
                          <div key={n.key} className="flex items-center gap-1.5">
                            <div
                              className={cn(
                                "flex items-center gap-1 rounded border border-line px-2 py-1",
                                rm ? rm.bg : NODE_BG[n.tone],
                              )}
                            >
                              <Icon className={cn("h-3 w-3", rm ? rm.text : "")} />
                              <span className={cn("text-[10.5px]", rm ? rm.text : "")}>{n.label}</span>
                              {rm && <rm.icon className={cn("h-2.5 w-2.5", rm.text)} />}
                            </div>
                            {i < chain.nodes.length - 1 && (
                              <span className="text-[10px] text-ink-mute">›</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState text="暂无处置链路" />
          )}
        </div>
      </Panel>
    </div>
  );
}
