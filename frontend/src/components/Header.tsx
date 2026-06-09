import { useMemo } from "react";
import { useF1 } from "../context/F1Context";
import { obterEquipes } from "../services/f1Service";

export default function Header() {
  const {
    anoSelecionado,
    setAnoSelecionado,
    gpSelecionado,
    setGPSelecionado,
    pilotoSelecionado,
    setPilotoSelecionado,
    equipeSelecionada,
    setEquipeSelecionada,
    dados,
    carregando,
    gpsDisponiveis,
    pilotosDisponiveis,
  } = useF1();

  const equipesDisponiveis = useMemo(() => {
    return obterEquipes(dados);
  }, [dados]);

  return (
    <header className="header-container">
      <div className="header-info">
        <span className="header-tag">STATUS: ONLINE</span>
        <h3 className="header-title">F1 STRATEGY ENGINE</h3>
      </div>

      <div className="header-filters">
        {/* Seletor de Temporada */}
        <div className="filter-group">
          <label>Temporada</label>
          <select
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(Number(e.target.value))}
            className="filter-select"
            disabled={carregando}
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
          </select>
        </div>

        {/* Seletor de GP */}
        <div className="filter-group">
          <label>Grande Prêmio</label>
          <select
            value={gpSelecionado}
            onChange={(e) => setGPSelecionado(e.target.value)}
            className="filter-select"
            disabled={carregando || gpsDisponiveis.length === 0}
          >
            {gpsDisponiveis.map((gp) => (
              <option key={gp.location} value={gp.location}>
                {gp.race_name}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Equipe */}
        <div className="filter-group">
          <label>Equipe</label>
          <select
            value={equipeSelecionada}
            onChange={(e) => {
              setEquipeSelecionada(e.target.value);
              setPilotoSelecionado("todos"); // reseta piloto ao mudar equipe
            }}
            className="filter-select"
            disabled={carregando || equipesDisponiveis.length === 0}
          >
            <option value="todas">Todas as Equipes</option>
            {equipesDisponiveis.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Piloto */}
        <div className="filter-group">
          <label>Piloto</label>
          <select
            value={pilotoSelecionado}
            onChange={(e) => {
              const val = e.target.value;
              setPilotoSelecionado(val === "todos" ? "todos" : Number(val));
            }}
            className="filter-select"
            disabled={carregando || pilotosDisponiveis.length === 0}
          >
            <option value="todos">Todos os Pilotos</option>
            {pilotosDisponiveis
              .filter(
                (p) =>
                  equipeSelecionada === "todas" || p.team_name === equipeSelecionada
              )
              .map((p) => (
                <option key={p.driver_number} value={p.driver_number}>
                  {p.driver_name} (#{p.driver_number})
                </option>
              ))}
          </select>
        </div>
      </div>
    </header>
  );
}