import type { RegistroVolta, PerfilPiloto, PerfilEquipe, ResultadoEstrategia } from "../types/F1Types";

/**
 * Calcula a Pontuação de Eficiência Estratégica (0 a 100)
 */
export function calcularEficienciaEstrategica(mudancaPosicao: number, perdaPitTotal: number, posicaoFinal: number): number {
  // Uma boa estratégia minimiza a perda no pit, maximiza ganhos de posição e resulta em uma boa posição final
  const fatorPosicao = Math.max(0, 100 * (1 - (posicaoFinal - 1) / 20));
  const fatorGanho = mudancaPosicao * 5; // ganho de posições soma pontos
  const fatorPerdaPit = Math.max(-30, -(perdaPitTotal - 20) * 1.5); // perda excessiva de pit diminui

  const score = 60 + fatorPosicao * 0.3 + fatorGanho + fatorPerdaPit;
  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * Calcula a Eficiência de Pit Stop (0 a 100) baseada no tempo médio perdido
 */
export function calcularEficienciaPitStop(perdaPitMedia: number): number {
  if (!perdaPitMedia || perdaPitMedia <= 0) return 80; // padrão razoável
  // Tempo de pit padrão é por volta de 20-22 segundos de perda líquida.
  // Se a perda média for menor que 20s, pontuação excelente (>90). Se for >28s, pontuação baixa (<50).
  const score = 100 - (perdaPitMedia - 18) * 4.5;
  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * Calcula a Pontuação de Gestão de Pneus (0 a 100)
 */
export function calcularGestaoPneus(degradacaoMedia: number): number {
  if (degradacaoMedia === undefined || degradacaoMedia === null) return 75;
  // Degradação média costuma ser de 0.05 a 0.45 por volta.
  // Valores menores que 0.10 são excelentes (>90). Valores maiores que 0.35 indicam alto desgaste (<40).
  const score = 100 - Math.max(0, degradacaoMedia) * 180;
  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * Calcula a Pontuação de Consistência de Corrida (0 a 100)
 */
export function calcularConsistenciaCorrida(desvioConsistenciaMedio: number): number {
  if (!desvioConsistenciaMedio || desvioConsistenciaMedio <= 0) return 75;
  // A consistência reflete o desvio em segundos do ritmo de corrida.
  // Desvio < 1.0s é excelente (>90). Desvio > 5.0s é muito inconsistente (<40).
  const score = 100 - desvioConsistenciaMedio * 10;
  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * Calcula a Pontuação de Recuperação de Posição (0 a 100)
 */
export function calcularRecuperacaoPosicao(mudancaPosicaoMedia: number): number {
  // Média de mudança: positiva significa que ganhou posições (ex: +3 posições ganhas)
  const score = 50 + mudancaPosicaoMedia * 8;
  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * Calcula a eficácia de Undercut e Overcut
 */
export function calcularEficaciaUndercutOvercut(voltas: RegistroVolta[]): { undercut: number; overcut: number } {
  // Filtramos todas as voltas de pit stop
  const paradas = voltas.filter((v) => v.pit_flag === 1);
  if (paradas.length === 0) {
    return { undercut: 70, overcut: 65 }; // Valores padrão históricos se não houver paradas
  }

  let totalUndercutGains = 0;
  let totalUndercutCount = 0;
  let totalOvercutGains = 0;
  let totalOvercutCount = 0;

  paradas.forEach((parada) => {
    // Verificamos a posição 3 voltas antes e 3 voltas depois do pit
    const lapsDriver = voltas.filter(
      (v) => v.driver_number === parada.driver_number
    );
    const lapAntes = lapsDriver.find((v) => v.lap_number === parada.lap_number - 2);
    const lapDepois = lapsDriver.find((v) => v.lap_number === parada.lap_number + 2);

    if (lapAntes && lapDepois) {
      const ganhoPosicao = lapAntes.position - lapDepois.position; // Pos antes era P10, depois P8, ganho = +2
      
      // Undercut ocorre geralmente em janelas mais precoces (stints curtos, pneus macios)
      if (parada.compound === "SOFT" || parada.compound === "MEDIUM") {
        totalUndercutGains += ganhoPosicao;
        totalUndercutCount++;
      } else {
        totalOvercutGains += ganhoPosicao;
        totalOvercutCount++;
      }
    }
  });

  const uRate = totalUndercutCount > 0 ? 50 + (totalUndercutGains / totalUndercutCount) * 15 : 72;
  const oRate = totalOvercutCount > 0 ? 50 + (totalOvercutGains / totalOvercutCount) * 15 : 68;

  return {
    undercut: Math.max(20, Math.min(98, Math.round(uRate))),
    overcut: Math.max(20, Math.min(98, Math.round(oRate))),
  };
}

/**
 * Agrega os dados para criar o Perfil dos Pilotos
 */
export function compilarPerfisPilotos(dados: RegistroVolta[]): PerfilPiloto[] {
  const pilotosMap = new Map<number, RegistroVolta[]>();

  dados.forEach((row) => {
    if (!pilotosMap.has(row.driver_number)) {
      pilotosMap.set(row.driver_number, []);
    }
    pilotosMap.get(row.driver_number)!.push(row);
  });

  const perfis: PerfilPiloto[] = [];

  pilotosMap.forEach((voltasPiloto, driverNum) => {
    const primeiro = voltasPiloto[0];
    const finalPos = voltasPiloto[voltasPiloto.length - 1].final_position;
    
    // Obter voltas de pit stop
    const voltasPit = voltasPiloto.filter((v) => v.pit_flag === 1);
    const pitCount = voltasPit.length > 0 ? voltasPit[0].pit_count : 0;

    // Degradação média por composto
    const compostos = Array.from(new Set(voltasPiloto.map((v) => v.compound).filter(Boolean)));
    const degProfile = compostos.map((comp) => {
      const voltasComp = voltasPiloto.filter((v) => v.compound === comp);
      const avgDeg = voltasComp.reduce((acc, v) => acc + (v.degradation || 0), 0) / voltasComp.length;
      return { compound: comp, avg_deg: avgDeg };
    });

    // Consistência média
    const avgConsistency = voltasPiloto.reduce((acc, v) => acc + (v.consistency_score || 0), 0) / voltasPiloto.length;

    // Estratégias preferidas
    const ests = Array.from(new Set(voltasPiloto.map((v) => v.strategy_type).filter(Boolean)));

    perfis.push({
      driver_name: primeiro.driver_name,
      driver_number: driverNum,
      team_name: primeiro.team_name,
      avg_final_position: finalPos || 10,
      avg_pit_count: pitCount || 1.8,
      preferred_strategies: ests.slice(0, 2),
      degradation_profile: degProfile,
      consistency_score: calcularConsistenciaCorrida(avgConsistency),
    });
  });

  return perfis.sort((a, b) => a.avg_final_position - b.avg_final_position);
}

/**
 * Agrega os dados para criar o Perfil das Equipes
 */
export function compilarPerfisEquipes(dados: RegistroVolta[]): PerfilEquipe[] {
  const equipesMap = new Map<string, RegistroVolta[]>();

  dados.forEach((row) => {
    if (row.team_name) {
      if (!equipesMap.has(row.team_name)) {
        equipesMap.set(row.team_name, []);
      }
      equipesMap.get(row.team_name)!.push(row);
    }
  });

  const perfis: PerfilEquipe[] = [];

  equipesMap.forEach((voltasEquipe, nomeEquipe) => {
    // Paradas de pit da equipe
    const paradas = voltasEquipe.filter((v) => v.pit_flag === 1);
    const avgPitLoss = paradas.length > 0 
      ? paradas.reduce((acc, v) => acc + (v.pit_loss || 0), 0) / paradas.length
      : 22.5;

    const { undercut, overcut } = calcularEficaciaUndercutOvercut(voltasEquipe);

    // Mudança de posição média
    const finalPosList = Array.from(new Set(voltasEquipe.map(v => `${v.driver_number}_${v.meeting_id}`))).map(key => {
      const [drv, meet] = key.split('_');
      const vts = voltasEquipe.filter(v => v.driver_number === Number(drv) && v.meeting_id === Number(meet));
      const ult = vts[vts.length - 1];
      return { change: ult.position_change || 0, final: ult.final_position || 10, pitLoss: vts.reduce((acc,v) => acc + (v.pit_loss || 0), 0) };
    });

    const avgChange = finalPosList.reduce((acc, f) => acc + f.change, 0) / finalPosList.length;
    const avgFinal = finalPosList.reduce((acc, f) => acc + f.final, 0) / finalPosList.length;
    const avgPitLossTotal = finalPosList.reduce((acc, f) => acc + f.pitLoss, 0) / finalPosList.length;

    const strategyEfficiency = calcularEficienciaEstrategica(avgChange, avgPitLossTotal, avgFinal);

    perfis.push({
      team_name: nomeEquipe,
      avg_pit_duration: avgPitLoss,
      undercut_success_rate: undercut,
      overcut_success_rate: overcut,
      strategy_efficiency: strategyEfficiency,
    });
  });

  return perfis.sort((a, b) => b.strategy_efficiency - a.strategy_efficiency);
}

/**
 * Compara eficácia geral de estratégias (1 stop, 2 stops, 3 stops)
 */
export function compilarDadosEstrategias(dados: RegistroVolta[]): ResultadoEstrategia[] {
  const estMap = new Map<string, RegistroVolta[]>();

  dados.forEach((row) => {
    if (row.strategy_type) {
      if (!estMap.has(row.strategy_type)) {
        estMap.set(row.strategy_type, []);
      }
      estMap.get(row.strategy_type)!.push(row);
    }
  });

  const resultados: ResultadoEstrategia[] = [];

  estMap.forEach((voltasEst, estTipo) => {
    // Pegar finais de corrida únicos para esta estratégia
    const finaisUnicos = Array.from(new Set(voltasEst.map(v => `${v.driver_number}_${v.meeting_id}`))).map(key => {
      const [drv, meet] = key.split('_');
      const vts = voltasEst.filter(v => v.driver_number === Number(drv) && v.meeting_id === Number(meet));
      return vts[vts.length - 1];
    });

    const count = finaisUnicos.length;
    const avgFinal = finaisUnicos.reduce((acc, f) => acc + (f.final_position || 10), 0) / count;
    
    const paradas = voltasEst.filter(v => v.pit_flag === 1);
    const avgPitLoss = paradas.length > 0 
      ? paradas.reduce((acc, p) => acc + (p.pit_loss || 0), 0) / paradas.length
      : 22.5;

    const avgDeg = voltasEst.reduce((acc, v) => acc + (v.degradation || 0), 0) / voltasEst.length;
    const avgCons = voltasEst.reduce((acc, v) => acc + (v.consistency_score || 0), 0) / voltasEst.length;

    resultados.push({
      strategy_type: estTipo,
      count,
      avg_final_position: parseFloat(avgFinal.toFixed(2)),
      avg_pit_loss: parseFloat(avgPitLoss.toFixed(2)),
      avg_degradation: parseFloat(avgDeg.toFixed(4)),
      avg_consistency: parseFloat(avgCons.toFixed(2)),
    });
  });

  return resultados.sort((a, b) => a.avg_final_position - b.avg_final_position);
}
