import { useMemo, useState } from "react";
import { useF1 } from "../context/F1Context";
import DashboardLayout from "../layouts/DashboardLayout";
import { simularEstrategiaCorrida, type EstrategiaSimulada } from "../services/simulationService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const COMPOSTOS = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE"];

export default function SimuladorPagina() {
  const { dados, gpSelecionado, pilotosDisponiveis } = useF1();

  const [pilotoNum, setPilotoNum] = useState<number>(0);
  const [compostoInicial, setCompostoInicial] = useState("MEDIUM");
  const [paradas, setParadas] = useState<{ lap: number; composto_novo: string }[]>([{ lap: 20, composto_novo: "HARD" }]);
  const [resultado, setResultado] = useState<ReturnType<typeof simularEstrategiaCorrida> | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const dadosCorrida = useMemo(() => dados.filter(d => d.location === gpSelecionado), [dados, gpSelecionado]);

  const adicionarParada = () => setParadas(p => [...p, { lap: 35, composto_novo: "SOFT" }]);
  const removerParada = (i: number) => setParadas(p => p.filter((_, idx) => idx !== i));
  const atualizarParada = (i: number, campo: string, val: any) =>
    setParadas(p => p.map((item, idx) => idx === i ? { ...item, [campo]: campo === "lap" ? Number(val) : val } : item));

  const simular = () => {
    setErro(null);
    setResultado(null);
    if (!pilotoNum) { setErro("Selecione um piloto para simular."); return; }
    if (!dadosCorrida.length) { setErro("Selecione um GP com dados disponíveis."); return; }
    try {
      const estrategia: EstrategiaSimulada = { composto_inicial: compostoInicial, paradas };
      const res = simularEstrategiaCorrida(dadosCorrida, pilotoNum, estrategia);
      setResultado(res);
    } catch (e: any) {
      setErro(e.message || "Erro na simulação.");
    }
  };

  const dadosDistribuicao = resultado?.distribuicao_posicoes.map(p => ({
    posicao: p.posicao,
    probabilidade: p.probabilidade,
  })) ?? [];

  const dadosCurvaRitmo = resultado?.curva_ritmo_projetado.slice(0, 60).map(c => ({
    volta: c.volta,
    ritmo_projetado: parseFloat(c.ritmo.toFixed(3)),
    composto: c.composto,
  })) ?? [];

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="pagina-cabecalho">
          <div className="pagina-cabecalho-linha">
            <span className="pagina-tag">SIMULADOR DE ESTRATÉGIA</span>
          </div>
          <h1 className="pagina-titulo">Simulador de Pit Stop — {gpSelecionado}</h1>
          <p className="pagina-descricao">Defina uma estratégia customizada e veja o resultado projetado. Usa Monte Carlo com dados reais de ritmo e degradação.</p>
        </div>

        <div className="painel-grid painel-grid-2" style={{ alignItems: 'start' }}>
          {/* Formulário */}
          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">⚙️ Configurar Estratégia</span>
            </div>
            <div className="painel-corpo" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="campo-label">Piloto</label>
                <select className="campo-select" value={pilotoNum} onChange={e => setPilotoNum(Number(e.target.value))}>
                  <option value={0}>Selecione um piloto...</option>
                  {pilotosDisponiveis.map(p => (
                    <option key={p.driver_number} value={p.driver_number}>{p.driver_name} — {p.team_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="campo-label">Composto Inicial</label>
                <select className="campo-select" value={compostoInicial} onChange={e => setCompostoInicial(e.target.value)}>
                  {COMPOSTOS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="campo-label" style={{ marginBottom: 8 }}>Paradas de Pit ({paradas.length})</label>
                {paradas.map((parada, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <div>
                      <label className="campo-label">Volta</label>
                      <input className="campo-input" type="number" min={1} max={70} value={parada.lap}
                        onChange={e => atualizarParada(i, 'lap', e.target.value)} />
                    </div>
                    <div>
                      <label className="campo-label">Composto</label>
                      <select className="campo-select" value={parada.composto_novo}
                        onChange={e => atualizarParada(i, 'composto_novo', e.target.value)}>
                        {COMPOSTOS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <button className="btn" style={{ alignSelf: 'flex-end', padding: '8px', color: 'var(--f1-vermelho)', borderColor: 'var(--border-accent)' }}
                      onClick={() => removerParada(i)}>✕</button>
                  </div>
                ))}
                <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={adicionarParada}>
                  + Adicionar Parada
                </button>
              </div>

              {erro && <p style={{ color: 'var(--f1-amarelo)', fontSize: '0.8rem' }}>⚠️ {erro}</p>}

              <button className="btn btn-primario" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} onClick={simular}>
                ▶ Executar Simulação
              </button>
            </div>
          </div>

          {/* Resultado */}
          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">📊 Resultado da Simulação</span>
              <span className="painel-subtitulo">200 iterações Monte Carlo</span>
            </div>
            <div className="painel-corpo">
              {!resultado ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Configure e execute a simulação para ver o resultado.</p>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div className="kpi-card">
                      <div className="kpi-card-rotulo">Posição Projetada</div>
                      <div className="kpi-card-valor" style={{ color: resultado.posicao_final_projetada <= 5 ? 'var(--f1-verde)' : 'var(--f1-amarelo)' }}>
                        P{resultado.posicao_final_projetada}
                      </div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-card-rotulo">Saldo de Posições</div>
                      <div className="kpi-card-valor" style={{ color: resultado.ganho_perda_posicao >= 0 ? 'var(--f1-verde)' : 'var(--f1-vermelho)' }}>
                        {resultado.ganho_perda_posicao >= 0 ? `+${resultado.ganho_perda_posicao}` : resultado.ganho_perda_posicao}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 10 }}>Distribuição de Resultados Prováveis</h4>
                    <div className="prob-lista">
                      {dadosDistribuicao.map(d => (
                        <div key={d.posicao} className="prob-item">
                          <span className="prob-faixa">{d.posicao}</span>
                          <div className="prob-track"><div className="prob-preenchimento" style={{ width: `${d.probabilidade}%` }} /></div>
                          <span className="prob-valor">{d.probabilidade}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={dadosDistribuicao} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                      <XAxis dataKey="posicao" tick={{ fill: '#8b9ac4', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, color: '#f0f2f8', fontSize: '11px' }} />
                      <Bar dataKey="probabilidade" name="Probabilidade (%)" fill="#e10600" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          </div>
        </div>

        {resultado && dadosCurvaRitmo.length > 0 && (
          <div className="painel" style={{ marginTop: 20 }}>
            <div className="painel-titulo-barra">
              <span className="painel-titulo">Curva de Ritmo Projetado (1ª Simulação)</span>
            </div>
            <div className="painel-corpo">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={dadosCurvaRitmo} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                  <XAxis dataKey="volta" tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, color: '#f0f2f8', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="ritmo_projetado" name="Ritmo Projetado (s)" stroke="#00d2be" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}