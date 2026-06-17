import { MapPin, MonitorPlay } from "lucide-react";
import { useOpsStore } from "@/store/useOpsStore";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/Bits";
import { AlertQueue } from "@/components/alert/AlertQueue";
import { VideoPane } from "@/components/alert/VideoPane";
import { HandlingPanel } from "@/components/alert/HandlingPanel";
import { AreaMap } from "@/components/map/AreaMap";

export default function Alerts() {
  const alerts = useOpsStore((s) => s.alerts);
  const selectedId = useOpsStore((s) => s.selectedAlertId);
  const clock = useOpsStore((s) => s.clock);
  const areas = useOpsStore((s) => s.areas);
  const patrol = useOpsStore((s) => s.patrol);

  const selected = alerts.find((a) => a.id === selectedId) ?? alerts[0];

  return (
    <div className="grid h-[calc(100vh-96px)] grid-cols-[320px_minmax(0,1fr)_348px] gap-4">
      <Panel title="告警队列" bodyClass="p-0" className="min-h-0 overflow-hidden">
        <AlertQueue selectedId={selected?.id ?? null} />
      </Panel>

      <div className="flex h-full min-h-0 flex-col gap-4">
        <Panel
          title="视频画面"
          icon={<MonitorPlay className="h-4 w-4" />}
          accent
          className="shrink-0"
          bodyClass="p-3"
        >
          <div className="h-[260px]">
            {selected ? (
              <VideoPane alert={selected} clock={clock} />
            ) : (
              <EmptyState text="请选择告警查看视频" />
            )}
          </div>
        </Panel>

        <Panel
          title="点位地图"
          icon={<MapPin className="h-4 w-4" />}
          className="min-h-0 flex-1"
          bodyClass="p-3 min-h-0"
        >
          <AreaMap
            areas={areas}
            patrol={patrol}
            focusAreaId={selected?.areaId}
            className="h-full w-full"
          />
        </Panel>
      </div>

      <Panel title="处置面板" bodyClass="p-0" className="min-h-0 overflow-hidden">
        {selected ? <HandlingPanel alert={selected} /> : <EmptyState text="请选择告警" />}
      </Panel>
    </div>
  );
}
