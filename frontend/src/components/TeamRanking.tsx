import { useEffect, useState } from "react";
import { loadF1Data } from "../../services/f1Service";

export default function TeamRanking() {

  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {

    async function carregar() {

      const data = await loadF1Data();

      const ranking: Record<string, number> = {};

      data.forEach((row: any) => {

        if (row.pit_lap) {

          ranking[row.team_name] =
            (ranking[row.team_name] || 0) + 1;
        }

      });

      const resultado = Object.entries(ranking)
        .map(([team, pitStops]) => ({
          team,
          pitStops,
        }))
        .sort(
          (a, b) =>
            b.pitStops - a.pitStops
        );

      setTeams(resultado);

    }

    carregar();

  }, []);

  return (
    <div
      style={{
        background: "#1e1e1e",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "30px",
      }}
    >
      <h3
        style={{
          color: "#fff",
          marginBottom: "20px",
        }}
      >
        🏆 Ranking de Equipes
      </h3>

      <table
        style={{
          width: "100%",
          color: "#fff",
        }}
      >
        <thead>
          <tr>
            <th>Equipe</th>
            <th>Pit Stops</th>
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => (
            <tr key={team.team}>
              <td>{team.team}</td>
              <td>{team.pitStops}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}