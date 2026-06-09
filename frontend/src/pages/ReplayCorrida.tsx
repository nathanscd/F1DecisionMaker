import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useF1 } from "../context/F1Context";
import DashboardLayout from "../layouts/DashboardLayout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const VELOCIDADES = [1, 2, 5, 10];

export default function ReplayCorrida() {
  const { dados, gpSelecionado } = useF1();
  const [voltaAtual, setVoltaAtual] = useState(1);
  const [rodando, setRodando] = useState(false);
  const [velocidade, setVelocidade] = useState(1);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dadosCorrida = useMemo(() => dados.filter(d => d.location === gpSelecionado), [dados, gpSelecionado]);
  const totalVoltas = useMemo(() => Math.max(...dadosCorrida.map(d => d.lap_number), 1), [dadosCorrida]);

  const voltaSnapshot = useMemo(() => {
    const pilotos = new Map<number, any>();
    dadosCorrida.filter(d => d.lap_number <= voltaAtual).forEach(d => {
      pilotos.set(d.driver_number, d);
    });
    return Array.from(pilotos.values()).sort((a,b) => (a.position||99) - (b.position||99));
  }, [dadosCorrida, voltaAtual]);

  const histEvol = useMemo(() => {
    const lider = voltaSnapshot[0];
    if (!lider) return [];
    const voltas: any[] = [];
    for (let v = 1; v <= voltaAtual; v++) {
      const snap: any = { volta: v };
      const pilotos = dadosCorrida.filter(d => d.lap_number === v);
      pilotos.forEach(d => { snap[`p${d.driver_number}`] = d.position; });
      voltas.push(snap);
    }
    return voltas;
  }, [dadosCorrida, voltaAtual]);

  const pilotos10 = useMemo(() => {
    const map = new Map<number, string>();
    dadosCorrida.slice(0,200).forEach(d => map.set(d.driver_number, d.driver_name));
    return Array.from(map.entries()).slice(0,10).map(([num, nome]) => ({ num, nome }));
  }, [dadosCorrida]);

  const cores = ["#e10600","#00d2be","#ffd600","#0067ff","#ff8800","#c92d4b","#00a550","#9b59b6","#e67e22","#3498db"];

  const iniciar = useCallback(() => {
    if (voltaAtual >= totalVoltas) setVoltaAtual(1);
    setRodando(true);
  }, [voltaAtual, totalVoltas]);

  const pausar = () => setRodando(false);
  const reiniciar = () => { setRodando(false); setVoltaAtual(1); };

  useEffect(() => {
    if (rodando) {
      intervaloRef.current = setInterval(() => {
        setVoltaAtual(v => {
          if (v >= totalVoltas) { setRodando(false); return v; }
          return v + 1;
        });
      }, 1000 / velocidade);
    } else {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    }
    return () => { if (intervaloRef.current) clearInterval(intervaloRef.current); };
  }, [rodando, velocidade, totalVoltas]);

  return (
    <DashboardLayout>
      <div className="fade-in">
        <div className="pagina-cabecalho">
          <div className="pagina-cabecalho-linha">
            <span className="pagina-tag">REPLAY DE CORRIDA</span>
            {rodando && <span className="live-dot" />}
          </div>
          <h1 className="pagina-titulo">Replay Histórico — {gpSelecionado}</h1>
          <p className="pagina-descricao">Reviva a corrida volta a volta. Observe como as decisões de pit stop impactaram as posições em tempo real.</p>
        </div>

        <div className="painel" style={{ marginBottom: 20 }}>
          {/* Barra de progresso da corrida */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--fonte-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                VOLTA <span style={{ color: 'var(--f1-vermelho)', fontWeight: 700, fontSize: '1rem' }}>{voltaAtual}</span> / {totalVoltas}
              </span>
              <span style={{ fontFamily: 'var(--fonte-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {((voltaAtual / totalVoltas) * 100).toFixed(0)}% COMPLETO
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--f1-vermelho)', width: `${(voltaAtual / totalVoltas) * 100}%`, transition: 'width 0.3s', borderRadius: 10 }} />
            </div>
          </div>

          {/* Timing Screen */}
          <div className="timing-screen" style={{ maxHeight: 380, overflowY: 'auto' }}>
            <div className="timing-header">
              <div>POS</div>
              <div>#</div>
              <div>PILOTO</div>
              <div>EQUIPE</div>
              <div>COMPOSTO</div>
              <div>PIT</div>
              <div>ÚLTIMA VLT</div>
              <div>SALDO</div>
            </div>
            {voltaSnapshot.map((d, i) => {
              const isPit = d.pit_flag === 1;
              return (
                <div key={d.driver_number} className="timing-linha" style={{ borderLeft: isPit ? '2px solid var(--f1-amarelo)' : '2px solid transparent' }}>
                  <div className="timing-pos" style={{ color: i === 0 ? 'var(--f1-amarelo)' : i < 3 ? 'var(--f1-verde)' : 'var(--text-accent)' }}>P{d.position}</div>
                  <div className="timing-num">{d.driver_number}</div>
                  <div>
                    <div className="timing-nome">{d.driver_name?.split(' ').slice(-1)[0]}</div>
                    <div className="timing-equipe">{d.driver_name?.split(' ')[0]}</div>
                  </div>
                  <div className="timing-valor" style={{ fontSize: '0.625rem' }}>{d.team_name?.replace(" Racing","").replace(" F1 Team","")}</div>
                  <div><span className={`pneu-badge pneu-${d.compound}`}>{d.compound?.slice(0,3) || '—'}</span></div>
                  <div className="timing-valor">{isPit ? <span style={{ color: 'var(--f1-amarelo)' }}>⬛ PIT</span> : '—'}</div>
                  <div className="timing-valor" style={{ fontFamily: 'var(--fonte-mono)' }}>{d.lap_time?.toFixed(3) ?? '—'}</div>
                  <div className={`timing-valor ${(d.position_change||0) > 0 ? 'timing-ganho' : (d.position_change||0) < 0 ? 'timing-perda' : ''}`}>
                    {d.position_change > 0 ? `+${d.position_change}` : d.position_change || '—'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles */}
          <div className="replay-controls">
            <button className={`btn-replay ${rodando ? '' : 'btn-replay-primary'}`} onClick={rodando ? pausar : iniciar}>
              {rodando ? '⏸ Pausar' : '▶ Reproduzir'}
            </button>
            <button className="btn-replay" onClick={reiniciar}>↩ Reiniciar</button>
            <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
              {VELOCIDADES.map(v => (
                <button key={v} className={`btn-replay ${velocidade === v ? 'velocidade-ativa' : ''}`} onClick={() => setVelocidade(v)}>
                  {v}×
                </button>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--fonte-mono)', fontSize: '0.625rem', color: 'var(--text-muted)' }}>
              VELOCIDADE: {velocidade}× — {(velocidade).toFixed(0)} VOLTA(S)/s
            </span>
          </div>
        </div>

        {/* Gráfico de evolução de posições */}
        <div className="painel">
          <div className="painel-titulo-barra">
            <span className="painel-titulo">Evolução de Posições (até a volta atual)</span>
          </div>
          <div className="painel-corpo">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={histEvol} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2640" />
                <XAxis dataKey="volta" tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                <YAxis reversed domain={[1,20]} tick={{ fill: '#8b9ac4', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#111520', border: '1px solid #1e2640', borderRadius: 6, color: '#f0f2f8', fontSize: '11px' }} />
                {pilotos10.map((p, i) => (
                  <Line key={p.num} type="monotone" dataKey={`p${p.num}`} name={p.nome}
                    stroke={cores[i % cores.length]} strokeWidth={1.5} dot={false} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
