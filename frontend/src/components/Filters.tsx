type Props = {
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
};

export default function Filters({
  selectedTeam,
  setSelectedTeam,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "30px",
        marginTop: "20px",
      }}
    >
      <select
        value={selectedTeam}
        onChange={(e) =>
          setSelectedTeam(e.target.value)
        }
        style={{
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <option value="all">
          Todas as Equipes
        </option>

        <option value="Ferrari">
          Ferrari
        </option>

        <option value="McLaren">
          McLaren
        </option>

        <option value="Red Bull Racing">
          Red Bull Racing
        </option>

        <option value="Mercedes">
          Mercedes
        </option>

        <option value="Williams">
          Williams</option>

        <option value="Haas F1 Team">
          Haas F1 Team</option>

        <option value="Aston Martin">
          Aston Martin</option>

        <option value="Kick Sauber">
          Kick Sauber</option>

        <option value="Alpine">
          Alpine</option>

        <option value="Racing Bulls">
          Racing Bulls</option>
      </select>
    </div>
  );
}