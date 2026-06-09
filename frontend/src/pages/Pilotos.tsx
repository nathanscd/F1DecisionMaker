import { useMemo, useState } from "react";
import { useF1 } from "../context/F1Context";
import DashboardLayout from "../layouts/DashboardLayout";
import { compilarPerfisPilotos, calcularGestaoPneus, calcularRecuperacaoPosicao } from "../services/analyticsService";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

export default function PilotosPagina() {
  const { dados, anoSelecionado } = useF1();
  const [pilotoAtivo, setPilotoAtivo] = useState<string | null>(null);

  const perfis = useMemo(() => compilarPerfisPilotos(dados), [dados]);

  const perfilSelecionado = useMemo(() =>
    pilotoAtivo ? perfis.find(p => p.driver_name === pilotoAtivo) : null,
  [pilotoAtivo, perfis]);

  const dadosRadar = useMemo(() => {
    if (!perfilSelecionado) return [];
    const degMedia = perfilSelecionado.degradation_profile.reduce((acc, d) => acc + d.avg_deg, 0) / (perfilSelecionado.degradation_profile.length || 1);
    return [
      { metrica: 'Consistência', valor: perfilSelecionado.consistency_score },
      { metrica: 'Gestão de Pneus', valor: calcularGestaoPneus(degMedia) },
      { metrica: 'Posição Final', valor: Math.max(10, 100 - (perfilSelecionado.avg_final_position - 1) * 5) },
      { metrica: 'Pit Stops', valor: Math.max(10, 100 - perfilSelecionado.avg_pit_count * 15) },
      { metrica: 'Recuperação', valor: calcularRecuperacaoPosicao(perfilSelecionado.avg_final_position > 5 ? -1 : 2) },
    ];
  }, [perfilSelecionado]);

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="pagina-cabecalho">
          <div className="pagina-cabecalho-linha">
            <span className="pagina-tag">PILOTOS</span>
          </div>
          <h1 className="pagina-titulo">Perfis dos Pilotos — {anoSelecionado}</h1>
          <p className="pagina-descricao">Selecione um piloto para ver seu perfil estratégico detalhado, incluindo gestão de pneus, consistência e tendências de estratégia.</p>
        </div>

        <div className="painel-grid painel-grid-2">
          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">Lista de Pilotos</span>
              <span className="painel-subtitulo">ordenado por posição final média</span>
            </div>
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Piloto</th>
                    <th>Equipe</th>
                    <th>Pos. Média</th>
                    <th>Pit Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {perfis.map(p => (
                    <tr key={p.driver_number} style={{ cursor: 'pointer', background: pilotoAtivo === p.driver_name ? 'rgba(225,6,0,0.07)' : '' }}
                      onClick={() => setPilotoAtivo(p.driver_name)}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.driver_name}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.team_name}</td>
                      <td style={{ fontFamily: 'var(--fonte-mono)', color: p.avg_final_position <= 3 ? 'var(--f1-amarelo)' : 'var(--text-secondary)' }}>
                        P{p.avg_final_position.toFixed(1)}
                      </td>
                      <td style={{ fontFamily: 'var(--fonte-mono)' }}>{p.avg_pit_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">
                {perfilSelecionado ? perfilSelecionado.driver_name : "Selecione um Piloto"}
              </span>
              <span className="painel-subtitulo">perfil estratégico</span>
            </div>
            <div className="painel-corpo">
              {!perfilSelecionado ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Clique em um piloto na tabela para ver o perfil.</p>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div className="kpi-card-rotulo">Equipe</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{perfilSelecionado.team_name}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div className="kpi-card-rotulo">Posição Final Média</div>
                        <div style={{ fontFamily: 'var(--fonte-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--f1-amarelo)' }}>P{perfilSelecionado.avg_final_position.toFixed(1)}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div className="kpi-card-rotulo" style={{ marginBottom: 6 }}>Estratégias Usadas</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {perfilSelecionado.preferred_strategies.map(s => (
                          <span key={s} className="badge badge-cinza">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="kpi-card-rotulo" style={{ marginBottom: 6 }}>Perfil de Degradação por Composto</div>
                      {perfilSelecionado.degradation_profile.map(d => (
                        <div key={d.compound} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span className={`pneu-badge pneu-${d.compound}`}>{d.compound}</span>
                          <span style={{ fontFamily: 'var(--fonte-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.avg_deg.toFixed(4)}/volta</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={dadosRadar}>
                      <PolarGrid stroke="#1e2640" />
                      <PolarAngleAxis dataKey="metrica" tick={{ fill: '#8b9ac4', fontSize: 10 }} />
                      <Radar name={perfilSelecionado.driver_name} dataKey="valor" stroke="#e10600" fill="#e10600" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
