import { useMemo } from "react";
import { useF1 } from "../context/F1Context";
import DashboardLayout from "../layouts/DashboardLayout";
import { compilarDadosEstrategias } from "../services/analyticsService";

export default function CorridasPagina() {
  const { dados, anoSelecionado, gpsDisponiveis, setGPSelecionado, gpSelecionado } = useF1();

  const resumosPorGP = useMemo(() => {
    return gpsDisponiveis.map(({ location, race_name }) => {
      const voltasGP = dados.filter(d => d.location === location);
      if (!voltasGP.length) return null;

      const pilotos = new Set(voltasGP.map(d => d.driver_number)).size;
      const paradas = voltasGP.filter(d => d.pit_flag === 1).length;

      // Estratégia mais usada
      const contEst = new Map<string, number>();
      voltasGP.forEach(d => {
        if (d.strategy_type) contEst.set(d.strategy_type, (contEst.get(d.strategy_type) || 0) + 1);
      });
      let estDominante = "—";
      let maxCount = 0;
      contEst.forEach((c, k) => { if (c > maxCount) { maxCount = c; estDominante = k; } });

      // Piloto vencedor: final_position = 1
      const vencedores = voltasGP.filter(d => d.final_position === 1 && d.pit_flag === 1);
      const vencedor = vencedores.length ? vencedores[0] : voltasGP.find(d => d.final_position === 1);

      // Degradação média
      const degMedia = (voltasGP.reduce((acc, d) => acc + (d.degradation || 0), 0) / voltasGP.length).toFixed(3);

      return { location, race_name, pilotos, paradas, estDominante, vencedor, degMedia };
    }).filter(Boolean);
  }, [dados, gpsDisponiveis]);

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="pagina-cabecalho">
          <div className="pagina-cabecalho-linha">
            <span className="pagina-tag">CORRIDAS</span>
          </div>
          <h1 className="pagina-titulo">Histórico de Corridas — {anoSelecionado}</h1>
          <p className="pagina-descricao">
            Todos os GPs da temporada. Clique em uma corrida para filtrar o Dashboard.
          </p>
        </div>

        <div className="tabela-container painel">
          <table>
            <thead>
              <tr>
                <th>GP</th>
                <th>Localização</th>
                <th>Pilotos</th>
                <th>Pit Stops</th>
                <th>Estratégia Dominante</th>
                <th>Vencedor</th>
                <th>Deg. Média</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {resumosPorGP.map((gp: any) => (
                <tr key={gp.location} style={{ cursor: 'pointer', background: gpSelecionado === gp.location ? 'rgba(225,6,0,0.07)' : '' }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{gp.race_name}</td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--fonte-mono)', fontSize: '0.75rem' }}>{gp.location}</td>
                  <td style={{ fontFamily: 'var(--fonte-mono)' }}>{gp.pilotos}</td>
                  <td style={{ fontFamily: 'var(--fonte-mono)' }}>{gp.paradas}</td>
                  <td><span className="badge badge-cinza">{gp.estDominante}</span></td>
                  <td style={{ fontWeight: 500, color: 'var(--f1-amarelo)' }}>
                    {gp.vencedor ? `${gp.vencedor.driver_name} (${gp.vencedor.team_name})` : "—"}
                  </td>
                  <td style={{ fontFamily: 'var(--fonte-mono)', fontSize: '0.75rem' }}>{gp.degMedia}</td>
                  <td>
                    <button className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => setGPSelecionado(gp.location)}>
                      Ver Dados
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
