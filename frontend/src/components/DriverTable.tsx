import { drivers } from "../../data/drivers";

export default function DriverTable() {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "30px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h3>🏁 Classificação dos Pilotos</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "15px",
        }}
      >
        <thead>
          <tr>
            <th>Piloto</th>
            <th>Equipe</th>
            <th>Pontos</th>
            <th>Vitórias</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.piloto}>
              <td>{driver.piloto}</td>
              <td>{driver.equipe}</td>
              <td>{driver.pontos}</td>
              <td>{driver.vitorias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}