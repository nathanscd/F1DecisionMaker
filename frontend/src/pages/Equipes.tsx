import { useMemo } from "react";
import { useF1 } from "../context/F1Context";
import DashboardLayout from "../layouts/DashboardLayout";
import { compilarPerfisEquipes } from "../services/analyticsService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function EquipesPagina() {
  const { dados, anoSelecionado } = useF1();
  const perfisEquipes = useMemo(() => compilarPerfisEquipes(dados), [dados]);

  const dadosGrafico = perfisEquipes.map(e => ({
    equipe: e.team_name.replace(" Racing", "").replace(" F1 Team", ""),
    eficiencia: e.strategy_efficiency,
    undercut: e.undercut_success_rate,
    overcut: e.overcut_success_rate,
    pit_medio: parseFloat(e.avg_pit_duration.toFixed(1)),
  }));

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="pagina-cabecalho">
          <div className="pagina-cabecalho-linha">
            <span className="pagina-tag">EQUIPES</span>
          </div>
          <h1 className="pagina-titulo">Análise Estratégica por Equipe — {anoSelecionado}</h1>
          <p className="pagina-descricao">Comparação da eficiência de pit stop, taxa de undercut e overcut entre as equipes da temporada.</p>
        </div>

        <div className="painel" style={{ marginBottom: 24 }}>
          <div className="painel-titulo-barra">
            <span className="painel-titulo">🏆 Pontuação de Eficiência Estratégica</span>
            <span className="painel-subtitulo">0 a 100 — baseado em posição final, saldo de posições e perda no pit</span>
          </div>
          <div className="painel-corpo">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dadosGrafico} margin={{ top: 5, right: 30, left: -10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                <XAxis dataKey="equipe" tick={{ fill: '#8b9ac4', fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, color: '#f0f2f8', fontSize: '11px' }} />
                <Bar dataKey="eficiencia" name="Eficiência Estratégica" fill="#e10600" radius={[4,4,0,0]} />
                <Bar dataKey="undercut" name="Taxa Undercut" fill="#00d2be" radius={[4,4,0,0]} />
                <Bar dataKey="overcut" name="Taxa Overcut" fill="#ffd600" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="painel">
          <div className="painel-titulo-barra">
            <span className="painel-titulo">Tabela de Equipes</span>
          </div>
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Equipe</th>
                  <th>Eficiência Estratégica</th>
                  <th>Taxa Undercut (%)</th>
                  <th>Taxa Overcut (%)</th>
                  <th>Perda Média no Pit (s)</th>
                </tr>
              </thead>
              <tbody>
                {perfisEquipes.map((e, i) => (
                  <tr key={e.team_name}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {i < 3 && <span style={{ color: 'var(--f1-amarelo)', marginRight: 6 }}>{['🥇','🥈','🥉'][i]}</span>}
                      {e.team_name}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="score-track" style={{ width: 80 }}>
                          <div className="score-preenchimento" style={{ width: `${e.strategy_efficiency}%`, background: 'var(--f1-vermelho)' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--fonte-mono)', fontSize: '0.75rem' }}>{e.strategy_efficiency}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-verde">{e.undercut_success_rate}%</span></td>
                    <td><span className="badge badge-amarelo">{e.overcut_success_rate}%</span></td>
                    <td style={{ fontFamily: 'var(--fonte-mono)' }}>{e.avg_pit_duration.toFixed(1)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
