import { Activity, CheckCircle2, Clock, Siren } from "lucide-react";
import { useOpsStore, selectActiveAlerts } from "@/store/useOpsStore";
import { Panel } from "@/components/ui/Panel";
import { KpiCard } from "@/components/ui/Bits";
import { AreaCard } from "@/components/overview/AreaCard";
import { DutyBar } from "@/components/overview/DutyBar";
import { AlertRow } from "@/components/alert/AlertRow";

export default function Overview() {
  const areas = useOpsStore((s) => s.areas);
  const alerts = useOpsStore((s) => s.alerts);
  const active = selectActiveAlerts(useOpsStore.getState());

  const handled = alerts.filter((a) => a.status === "closed");
  const arrivals = handled.map((a) => a.arrivalSec ?? 0).filter((n) => n > 0);
  const avgArrival = arrivals.length
    ? Math.round(arrivals.reduce((x, y) => x + y, 0) / arrivals.length)
    : 0;
  const clearanceRate = alerts.length
    ? Math.round((handled.length / alerts.length) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="活跃告警"
          value={active.length}
          unit="起"
          icon={<Siren className="h-4 w-4" />}
          tone="text-crit"
          delta="↑ 3"
          deltaUp={false}
          progress={Math.min(100, active.length * 12)}
        />
        <KpiCard
          label="今日已处置"
          value={handled.length}
          unit="起"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="text-ok"
          delta="↑ 12%"
          deltaUp
          progress={75}
        />
        <KpiCard
          label="平均到场"
          value={avgArrival}
          unit="秒"
          icon={<Clock className="h-4 w-4" />}
          tone="text-amber"
          delta="↓ 18s"
          deltaUp
          progress={62}
        />
        <KpiCard
          label="清场率"
          value={`${clearanceRate}%`}
          icon={<Activity className="h-4 w-4" />}
          tone="text-info"
          delta="↑ 5%"
          deltaUp
          progress={clearanceRate}
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <Panel
            title="区域态势 · 6 重点区域"
            accent
            action={
              <span className="font-mono text-[10px] text-ink-mute">实时刷新 1s</span>
            }
          >
            <div className="grid grid-cols-3 gap-3">
              {areas.map((a) => (
                <AreaCard key={a.id} area={a} />
              ))}
            </div>
          </Panel>

          <DutyBar />
        </div>

        <Panel
          title="实时告警流"
          action={
            <span className="rounded bg-crit/15 px-1.5 py-0.5 font-mono text-[10px] text-crit">
              {active.length} ACTIVE
            </span>
          }
          bodyClass="p-0"
        >
          <div className="max-h-[calc(100vh-230px)] overflow-y-auto">
            {active.length ? (
              active.map((a) => <AlertRow key={a.id} alert={a} />)
            ) : (
              <div className="py-12 text-center text-sm text-ink-mute">
                暂无活跃告警，态势平稳
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
