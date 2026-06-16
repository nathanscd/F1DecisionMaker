import type { RegistroVolta } from "../types/F1Types";

export interface CasoHistorico {
  driver_name: string;
  driver_number: number;
  team_name: string;
  race_name: string;
  location: string;
  ano: number;
  pit_count: number;
  pit_lap: number;
  tire_age: number;
  degradation: number;
  rolling_pace: number;
  consistency_score: number;
  position_before_pit: number;
  compound: string;
  final_position: number;
  position_change: number;
  distancia?: number;
}

export interface EntradaKNN {
  pit_count: number;
  pit_lap: number;
  tire_age: number;
  degradation: number;
  rolling_pace: number;
  consistency_score: number;
  position_before_pit: number;
  compound: string;
}

export interface PrevisaoKNN {
  posicao_esperada: number;
  saldo_posicoes_esperado: number;
  distribuicao_probabilidade: { faixa: string; probabilidade: number }[];
  vizinhos: CasoHistorico[];
  grau_confianca: number;
}

export function compilarCasosHistoricos(dados: RegistroVolta[], ano: number): CasoHistorico[] {
  const grupos = new Map<string, RegistroVolta[]>();

  dados.forEach((row) => {
    const chave = `${row.meeting_id}_${row.driver_number}`;
    if (!grupos.has(chave)) {
      grupos.set(chave, []);
    }
    grupos.get(chave)!.push(row);
  });

  const casos: CasoHistorico[] = [];

  grupos.forEach((voltas) => {
    if (voltas.length < 5) return;

    const primeiraVolta = voltas[0];
    const ultimaVolta = voltas[voltas.length - 1];

    const voltasPit = voltas.filter((v) => v.pit_flag === 1);
    const primeiraParada = voltasPit[0];

    const pitCount = voltasPit.length;
    const pitLap = primeiraParada ? primeiraParada.lap_number : 0;
    const tireAge = primeiraParada ? primeiraParada.tire_age : 0;

    const voltasStint1 = primeiraParada 
      ? voltas.filter((v) => v.lap_number < primeiraParada.lap_number)
      : voltas;
    const avgDeg = voltasStint1.length > 0
      ? voltasStint1.reduce((acc, v) => acc + (v.degradation || 0), 0) / voltasStint1.length
      : 0.15;

    let posBefore = primeiraVolta.position;
    if (primeiraParada) {
      const vAntes = voltas.find((v) => v.lap_number === primeiraParada.lap_number - 1);
      if (vAntes) posBefore = vAntes.position;
    }

    const rollingPaceMedio = voltas.reduce((acc, v) => acc + (v.rolling_pace || 100), 0) / voltas.length;
    const consistenciaMedia = voltas.reduce((acc, v) => acc + (v.consistency_score || 0), 0) / voltas.length;

    casos.push({
      driver_name: primeiraVolta.driver_name,
      driver_number: primeiraVolta.driver_number,
      team_name: primeiraVolta.team_name,
      race_name: primeiraVolta.race_name,
      location: primeiraVolta.location,
      ano,
      pit_count: pitCount,
      pit_lap: pitLap,
      tire_age: tireAge,
      degradation: avgDeg,
      rolling_pace: rollingPaceMedio,
      consistency_score: consistenciaMedia,
      position_before_pit: posBefore,
      compound: primeiraVolta.compound || "MEDIUM",
      final_position: ultimaVolta.final_position || ultimaVolta.position,
      position_change: ultimaVolta.position_change || 0,
    });
  });

  return casos;
}

export function executarKNN(
  casos: CasoHistorico[],
  entrada: EntradaKNN,
  k: number = 7
): PrevisaoKNN {
  if (casos.length === 0) {
    return {
      posicao_esperada: 10,
      saldo_posicoes_esperado: 0,
      distribuicao_probabilidade: [],
      vizinhos: [],
      grau_confianca: 50,
    };
  }

  const limites = {
    pit_count: { min: 0, max: 4 },
    pit_lap: { min: 1, max: 60 },
    tire_age: { min: 0, max: 40 },
    degradation: { min: 0, max: 0.8 },
    rolling_pace: { min: 70, max: 130 },
    consistency_score: { min: 0, max: 10 },
    position_before_pit: { min: 1, max: 20 },
  };

  const norm = (val: number, lim: { min: number; max: number }) => {
    return (val - lim.min) / (lim.max - lim.min || 1);
  };

  const entradaNorm = {
    pit_count: norm(entrada.pit_count, limites.pit_count),
    pit_lap: norm(entrada.pit_lap, limites.pit_lap),
    tire_age: norm(entrada.tire_age, limites.tire_age),
    degradation: norm(entrada.degradation, limites.degradation),
    rolling_pace: norm(entrada.rolling_pace, limites.rolling_pace),
    consistency_score: norm(entrada.consistency_score, limites.consistency_score),
    position_before_pit: norm(entrada.position_before_pit, limites.position_before_pit),
  };

  const casosComDistancia = casos.map((caso) => {
    const casoNorm = {
      pit_count: norm(caso.pit_count, limites.pit_count),
      pit_lap: norm(caso.pit_lap, limites.pit_lap),
      tire_age: norm(caso.tire_age, limites.tire_age),
      degradation: norm(caso.degradation, limites.degradation),
      rolling_pace: norm(caso.rolling_pace, limites.rolling_pace),
      consistency_score: norm(caso.consistency_score, limites.consistency_score),
      position_before_pit: norm(caso.position_before_pit, limites.position_before_pit),
    };

    const d2 =
      Math.pow(entradaNorm.pit_count - casoNorm.pit_count, 2) * 0.5 +
      Math.pow(entradaNorm.pit_lap - casoNorm.pit_lap, 2) * 1.5 +
      Math.pow(entradaNorm.tire_age - casoNorm.tire_age, 2) * 0.8 +
      Math.pow(entradaNorm.degradation - casoNorm.degradation, 2) * 0.5 +
      Math.pow(entradaNorm.rolling_pace - casoNorm.rolling_pace, 2) * 2.5 +
      Math.pow(entradaNorm.consistency_score - casoNorm.consistency_score, 2) * 2.2 +
      Math.pow(entradaNorm.position_before_pit - casoNorm.position_before_pit, 2) * 2.0;

    const penalidadeComposto = entrada.compound !== caso.compound ? 0.25 : 0;
    const distancia = Math.sqrt(d2) + penalidadeComposto;

    return { ...caso, distancia };
  });

  casosComDistancia.sort((a, b) => a.distancia! - b.distancia!);

  const vizinhosProximos = casosComDistancia.slice(0, k);

  const somaPosFinal = vizinhosProximos.reduce((acc, v) => acc + v.final_position, 0);
  const somaSaldoPos = vizinhosProximos.reduce((acc, v) => acc + v.position_change, 0);

  const posicaoEsperada = parseFloat((somaPosFinal / k).toFixed(1));
  const saldoPosicoesEsperado = parseFloat((somaSaldoPos / k).toFixed(1));

  let p1_p3 = 0;
  let p4_p5 = 0;
  let p6_p10 = 0;
  let p11_p20 = 0;

  vizinhosProximos.forEach((v) => {
    const p = v.final_position;
    if (p <= 3) p1_p3++;
    else if (p <= 5) p4_p5++;
    else if (p <= 10) p6_p10++;
    else p11_p20++;
  });

  const distribuicao = [
    { faixa: "Pódio (P1-P3)", probabilidade: Math.round((p1_p3 / k) * 100) },
    { faixa: "Top 5 (P4-P5)", probabilidade: Math.round((p4_p5 / k) * 100) },
    { faixa: "Pontos (P6-P10)", probabilidade: Math.round((p6_p10 / k) * 100) },
    { faixa: "Fora dos Pontos (P11-P20)", probabilidade: Math.round((p11_p20 / k) * 100) },
  ];

  const distMedia = vizinhosProximos.reduce((acc, v) => acc + v.distancia!, 0) / k;
  const grauConfianca = Math.max(10, Math.min(98, Math.round(100 - distMedia * 90)));

  return {
    posicao_esperada: posicaoEsperada,
    saldo_posicoes_esperado: saldoPosicoesEsperado,
    distribuicao_probabilidade: distribuicao,
    vizinhos: vizinhosProximos,
    grau_confianca: grauConfianca,
  };
}