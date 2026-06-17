import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import type { EfficiencyPoint } from "@/types";

export function EfficiencyChart({ data }: { data: EfficiencyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "#5b6678", fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
        />
        <YAxis
          yAxisId="l"
          tick={{ fill: "#5b6678", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="r"
          orientation="right"
          domain={[0.7, 1]}
          tick={{ fill: "#5b6678", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#0c1119",
            border: "1px solid rgba(245,181,68,0.3)",
            borderRadius: 6,
            fontSize: 12,
          }}
          labelStyle={{ color: "#F5B544" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar
          yAxisId="l"
          dataKey="avgArrivalSec"
          name="平均到场(秒)"
          fill="#F5B544"
          radius={[2, 2, 0, 0]}
          barSize={14}
        />
        <Line
          yAxisId="r"
          dataKey="clearanceRate"
          name="清场率"
          stroke="#34D399"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          yAxisId="r"
          dataKey="falseRate"
          name="误报率"
          stroke="#F87171"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
