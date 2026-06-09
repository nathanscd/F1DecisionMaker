import { useMemo } from "react";
import { useF1 } from "../context/F1Context";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, BarChart, Bar, Legend
} from "recharts";

const CORES_PILOTOS = ["#e10600","#00d2be","#ffd600","#0067ff","#ff8800","#c92d4b","#00a550","#9b59b6","#e67e22","#3498db","#1abc9c","#e74c3c","#f39c12","#8e44ad","#27ae60","#2980b9","#c0392b","#d35400","#7f8c8d","#2c3e50"];

export default function DashboardPagina() {
  const { dados, gpSelecionado, pilotoSelecionado, equipeSelecionada } = useF1();

  const dadosCorrida = useMemo(() => {
    return dados.filter(d => d.location === gpSelecionado);
  }, [dados, gpSelecionado]);

  const pilotos = useMemo(() => {
    const map = new Map<number, string>();
    dadosCorrida.forEach(d => map.set(d.driver_number, d.driver_name));
    return Array.from(map.entries()).map(([num, nome]) => ({ num, nome }));
  }, [dadosCorrida]);

  const dadosFiltrados = useMemo(() => {
    let f = dadosCorrida;
    if (pilotoSelecionado !== "todos") f = f.filter(d => d.driver_number === pilotoSelecionado);
    if (equipeSelecionada !== "todas") f = f.filter(d => d.team_name === equipeSelecionada);
    return f;
  }, [dadosCorrida, pilotoSelecionado, equipeSelecionada]);

  // Evolução de posição por volta por piloto
  const evolucaoPosicao = useMemo(() => {
    if (!dadosFiltrados.length) return [];
    const porVolta = new Map<number, any>();
    dadosFiltrados.forEach(d => {
      if (!porVolta.has(d.lap_number)) porVolta.set(d.lap_number, { volta: d.lap_number });
      const cur = porVolta.get(d.lap_number)!;
      cur[`p${d.driver_number}`] = d.position;
    });
    return Array.from(porVolta.values()).sort((a,b) => a.volta - b.volta);
  }, [dadosFiltrados]);

  // Degradação por idade do pneu
  const dadosDegradacao = useMemo(() => {
    return dadosFiltrados
      .filter(d => d.tire_age !== undefined && d.degradation !== undefined && d.tire_age >= 0)
      .map(d => ({ tire_age: d.tire_age, degradation: d.degradation, compound: d.compound, driver: d.driver_name }))
      .slice(0, 300);
  }, [dadosFiltrados]);

  // Pit Stop Timeline: voltas onde houve pit
  const pitStops = useMemo(() => {
    return dadosFiltrados
      .filter(d => d.pit_flag === 1)
      .map(d => ({ volta: d.lap_number, piloto: d.driver_name, composto: d.compound, perda: d.pit_loss }));
  }, [dadosFiltrados]);

  // Saldo de posições por piloto
  const saldoPilotos = useMemo(() => {
    const mapa = new Map<string, { driver: string; change: number; finalPos: number }>();
    dadosFiltrados.forEach(d => {
      mapa.set(d.driver_name, { driver: d.driver_name, change: d.position_change || 0, finalPos: d.final_position || 10 });
    });
    return Array.from(mapa.values()).sort((a,b) => b.change - a.change).slice(0, 12);
  }, [dadosFiltrados]);

  const pilotosParaLinha = pilotos.slice(0, pilotoSelecionado !== "todos" ? pilotos.length : 8);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, padding: '8px 12px' }}>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color, fontSize: '11px' }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="pagina-cabecalho">
          <div className="pagina-cabecalho-linha">
            <span className="pagina-tag">DASHBOARD</span>
          </div>
          <h1 className="pagina-titulo">Análise de Corrida — {gpSelecionado}</h1>
          <p className="pagina-descricao">Telemetria estratégica volta a volta. Use os filtros no topo para selecionar GP, piloto ou equipe.</p>
        </div>

        {dadosFiltrados.length === 0 ? (
          <div className="telemetry-error"><h2>Sem dados para esta seleção</h2><p>Selecione um GP e temporada válidos.</p></div>
        ) : (
          <>
            {/* Evolução de posição */}
            <div className="painel" style={{ marginBottom: 20 }}>
              <div className="painel-titulo-barra">
                <span className="painel-titulo">📈 Evolução de Posições por Volta</span>
                <span className="painel-subtitulo">posição no grid ao longo da corrida</span>
              </div>
              <div className="painel-corpo">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={evolucaoPosicao} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                    <XAxis dataKey="volta" tick={{ fill: '#8b9ac4', fontSize: 11 }} label={{ value: 'Volta', position: 'insideBottomRight', fill: '#4a5580', fontSize: 11 }} />
                    <YAxis reversed domain={[1, 20]} tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    {pilotosParaLinha.map((p, i) => (
                      <Line key={p.num} type="monotone" dataKey={`p${p.num}`} name={p.nome}
                        stroke={CORES_PILOTOS[i % CORES_PILOTOS.length]} strokeWidth={2}
                        dot={false} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="painel-grid painel-grid-2">
              {/* Degradação de Pneus */}
              <div className="painel">
                <div className="painel-titulo-barra">
                  <span className="painel-titulo">🔴 Degradação de Pneus</span>
                  <span className="painel-subtitulo">deg vs idade do pneu</span>
                </div>
                <div className="painel-corpo">
                  <ResponsiveContainer width="100%" height={220}>
                    <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                      <XAxis dataKey="tire_age" name="Idade do Pneu" tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                      <YAxis dataKey="degradation" name="Degradação" tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, color: '#f0f2f8', fontSize: '11px' }} />
                      <Scatter data={dadosDegradacao} fill="#e10600" opacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Saldo de posições */}
              <div className="painel">
                <div className="painel-titulo-barra">
                  <span className="painel-titulo">🏆 Saldo de Posições por Piloto</span>
                  <span className="painel-subtitulo">ganho positivo = subiu, negativo = perdeu</span>
                </div>
                <div className="painel-corpo">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={saldoPilotos} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                      <XAxis type="number" tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                      <YAxis dataKey="driver" type="category" tick={{ fill: '#8b9ac4', fontSize: 10 }} width={60} />
                      <Tooltip contentStyle={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, color: '#f0f2f8', fontSize: '11px' }} />
                      <Bar dataKey="change" name="Saldo de Posições" fill="#00d2be" radius={[0,4,4,0]}
                        label={{ position: 'right', fill: '#8b9ac4', fontSize: 10 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Timeline de Pit Stops */}
            <div className="painel" style={{ marginTop: 20 }}>
              <div className="painel-titulo-barra">
                <span className="painel-titulo">🔧 Timeline de Pit Stops</span>
                <span className="painel-subtitulo">voltas em que cada piloto parou nos boxes</span>
              </div>
              <div className="painel-corpo">
                {pitStops.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>Nenhuma parada de pit encontrada para este filtro.</p>
                ) : (
                  <div className="tabela-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Piloto</th>
                          <th>Volta</th>
                          <th>Composto</th>
                          <th>Perda no Pit (s)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pitStops.map((p, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.piloto}</td>
                            <td style={{ fontFamily: 'var(--fonte-mono)' }}>{p.volta}</td>
                            <td><span className={`pneu-badge pneu-${p.composto}`}>{p.composto}</span></td>
                            <td style={{ fontFamily: 'var(--fonte-mono)' }}>{p.perda?.toFixed(2) ?? "—"}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}