import { useEffect, useState } from "react";
import { loadF1Data } from "../../services/f1Service";

export default function DriverRanking() {

  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {

    async function carregar() {

      const data = await loadF1Data();

      const ranking: Record<number, number> = {};

      data.forEach((row: any) => {

        ranking[row.driver_number] =
          (ranking[row.driver_number] || 0) + 1;

      });

      const resultado = Object.entries(ranking)
        .map(([driver, registros]) => ({
          driver,
          registros,
        }))
        .sort(
          (a, b) =>
            b.registros - a.registros
        );

      setDrivers(resultado);

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
        👨‍✈️ Ranking de Pilotos
      </h3>

      <table
        style={{
          width: "100%",
          color: "#fff",
        }}
      >
        <thead>
          <tr>
            <th>Piloto</th>
            <th>Registros</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.driver}>
              <td>{driver.driver}</td>
              <td>{driver.registros}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}