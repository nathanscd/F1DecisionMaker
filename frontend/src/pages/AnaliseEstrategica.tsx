import { useMemo } from "react";
import { useF1 } from "../context/F1Context";
import DashboardLayout from "../layouts/DashboardLayout";
import { compilarDadosEstrategias } from "../services/analyticsService";
import { processarMatrizCorrelacao } from "../services/statisticsService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend } from "recharts";

export default function AnaliseEstrategicaPagina() {
  const { dados } = useF1();

  const estrategias = useMemo(() => compilarDadosEstrategias(dados), [dados]);

  const { rotulos, matriz, interpretacao } = useMemo(() => {
    if (!dados.length) return { rotulos: [], matriz: [], interpretacao: [] };
    return processarMatrizCorrelacao(dados);
  }, [dados]);

  const scatterData = useMemo(() => {
    return dados.filter(d => d.pit_flag === 1 && d.pit_loss && d.final_position)
      .map(d => ({ pit_loss: d.pit_loss, final_position: d.final_position, strategy: d.strategy_type }))
      .slice(0, 400);
  }, [dados]);

  // Cor do coeficiente de correlação
  const corCelula = (val: number): string => {
    if (val >= 0.6)  return 'rgba(225, 6, 0, 0.7)';
    if (val >= 0.3)  return 'rgba(225, 6, 0, 0.35)';
    if (val >= 0.1)  return 'rgba(225, 6, 0, 0.15)';
    if (val <= -0.3) return 'rgba(0, 210, 190, 0.4)';
    if (val <= -0.1) return 'rgba(0, 210, 190, 0.2)';
    return 'transparent';
  };

  const rotulosCurtos = rotulos.map(r => r.split('(')[1]?.replace(')', '') || r.split(' ')[0]);

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="pagina-cabecalho">
          <div className="pagina-cabecalho-linha">
            <span className="pagina-tag">ANÁLISE ESTRATÉGICA</span>
          </div>
          <h1 className="pagina-titulo">Comparação de Estratégias & Correlação Estatística</h1>
          <p className="pagina-descricao">Análise comparativa de 1, 2 e 3 paradas com Matriz de Correlação de Pearson para identificar quais variáveis influenciam diretamente a posição final de corrida.</p>
        </div>

        {/* Comparação de Estratégias */}
        <div className="painel-grid painel-grid-2" style={{ marginBottom: 24 }}>
          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">Posição Final Média por Estratégia</span>
            </div>
            <div className="painel-corpo">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={estrategias} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                  <XAxis dataKey="strategy_type" tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                  <YAxis reversed domain={[1,20]} tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, color: '#f0f2f8', fontSize: '11px' }} />
                  <Bar dataKey="avg_final_position" name="Pos. Final Média" fill="#e10600" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">Perda em Pit × Posição Final</span>
            </div>
            <div className="painel-corpo">
              <ResponsiveContainer width="100%" height={220}>
                <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                  <XAxis dataKey="pit_loss" name="Perda no Pit (s)" tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                  <YAxis dataKey="final_position" name="Posição Final" reversed domain={[1,20]} tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, color: '#f0f2f8', fontSize: '11px' }} />
                  <Scatter data={scatterData} fill="#00d2be" opacity={0.5} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabela de Estratégias */}
        <div className="painel" style={{ marginBottom: 24 }}>
          <div className="painel-titulo-barra">
            <span className="painel-titulo">Resumo por Tipo de Estratégia</span>
          </div>
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Estratégia</th>
                  <th>Casos</th>
                  <th>Pos. Final Média</th>
                  <th>Perda Pit Média (s)</th>
                  <th>Degradação Média</th>
                  <th>Consistência Média</th>
                </tr>
              </thead>
              <tbody>
                {estrategias.map(e => (
                  <tr key={e.strategy_type}>
                    <td><span className="badge badge-cinza">{e.strategy_type}</span></td>
                    <td style={{ fontFamily: 'var(--fonte-mono)' }}>{e.count}</td>
                    <td style={{ fontFamily: 'var(--fonte-mono)', color: e.avg_final_position <= 5 ? 'var(--f1-verde)' : 'var(--text-secondary)' }}>P{e.avg_final_position}</td>
                    <td style={{ fontFamily: 'var(--fonte-mono)' }}>{e.avg_pit_loss}s</td>
                    <td style={{ fontFamily: 'var(--fonte-mono)' }}>{e.avg_degradation}</td>
                    <td style={{ fontFamily: 'var(--fonte-mono)' }}>{e.avg_consistency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matriz de Correlação de Pearson */}
        <div className="painel" style={{ marginBottom: 24 }}>
          <div className="painel-titulo-barra">
            <span className="painel-titulo">🔬 Matriz de Correlação de Pearson</span>
            <span className="painel-subtitulo">vermelho = positivo | verde = negativo | diagonal = 1.0</span>
          </div>
          <div className="painel-corpo" style={{ overflowX: 'auto' }}>
            {matriz.length > 0 && (
              <div style={{ fontFamily: 'var(--fonte-mono)', fontSize: '0.7rem' }}>
                {/* Cabeçalho */}
                <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${rotulosCurtos.length}, 80px)`, gap: 2, marginBottom: 2 }}>
                  <div />
                  {rotulosCurtos.map(r => (
                    <div key={r} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4px 2px', fontSize: '0.625rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r}>{r}</div>
                  ))}
                </div>
                {/* Linhas */}
                {matriz.map((linha, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: `120px repeat(${rotulosCurtos.length}, 80px)`, gap: 2, marginBottom: 2 }}>
                    <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', fontSize: '0.625rem', paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rotulos[i]}>{rotulos[i].split(' ')[0]}</div>
                    {linha.map((val, j) => (
                      <div key={j} style={{ background: corCelula(val), border: '1px solid var(--border)', borderRadius: 3, padding: '6px 4px', textAlign: 'center', color: Math.abs(val) > 0.3 ? 'white' : 'var(--text-secondary)', fontWeight: i === j ? 700 : 400 }}>
                        {val.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interpretações */}
        <div className="painel">
          <div className="painel-titulo-barra">
            <span className="painel-titulo">📝 Interpretação Estatística</span>
          </div>
          <div className="painel-corpo">
            {interpretacao.map((txt, i) => (
              <div key={i} className="insight-box">
                <p>{txt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
