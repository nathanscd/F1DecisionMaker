import { useEffect, useState } from "react";
import { loadF1Data } from "../../services/f1Service";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ChartProps {
  selectedTeam: string;
}

export default function Chart({
  selectedTeam,
}: ChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function carregarDados() {
      const data = await loadF1Data();

      const filteredData =
        selectedTeam === "all"
          ? data
          : data.filter(
              (row: any) =>
                row.team_name === selectedTeam
            );

      const teamPitStops: Record<string, number> = {};

      filteredData.forEach((row: any) => {
        if (row.pit_lap) {
          const team = row.team_name;

          teamPitStops[team] =
            (teamPitStops[team] || 0) + 1;
        }
      });

      const formattedData = Object.entries(teamPitStops)
        .map(([team, pitStops]) => ({
          team,
          pitStops,
        }))
        .sort((a, b) => b.pitStops - a.pitStops);

      setChartData(formattedData);
    }

    carregarDados();
  }, [selectedTeam]);

  return (
    <div
      style={{
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "30px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
      }}
    >
      <h3
        style={{
          marginBottom: "20px",
          color: "#ffffff",
        }}
      >
        🔧 Pit Stops por Equipe
      </h3>

      <ResponsiveContainer
        width="100%"
        height={400}
      >
        <BarChart data={chartData}>
          <CartesianGrid stroke="#333" />

          <XAxis
            dataKey="team"
            stroke="#ffffff"
          />

          <YAxis
            stroke="#ffffff"
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (
                active &&
                payload &&
                payload.length
              ) {
                return (
                  <div
                    style={{
                      background: "#ffffff",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                    }}
                  >
                    <p
                      style={{
                        color: "#000000",
                        fontWeight: "bold",
                        margin: 0,
                      }}
                    >
                      {label}
                    </p>

                    <p
                      style={{
                        color: "#000000",
                        margin: "5px 0 0 0",
                      }}
                    >
                      Pit Stops:{" "}
                      <strong>
                        {payload[0].value}
                      </strong>
                    </p>
                  </div>
                );
              }

              return null;
            }}
          />

          <Bar
            dataKey="pitStops"
            fill="#e10600"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}