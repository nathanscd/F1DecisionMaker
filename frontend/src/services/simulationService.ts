import type { RegistroVolta } from "../types/F1Types";

export interface EstrategiaSimulada {
  paradas: { lap: number; composto_novo: string }[];
  composto_inicial: string;
}

export interface ResultadoSimulacao {
  posicao_final_projetada: number;
  ganho_perda_posicao: number;
  tempo_total_projetado: number;
  tempo_real: number;
  curva_ritmo_projetado: { volta: number; ritmo: number; composto: string }[];
  distribuicao_posicoes: { posicao: string; probabilidade: number }[];
}

/**
 * Retorna a taxa de degradação padrão de um pneu por composto
 */
function obterDegradacaoPorComposto(composto: string): number {
  switch (composto.toUpperCase()) {
    case "SOFT":
      return 0.085; // Degradação agressiva (perde 0.085s por volta)
    case "MEDIUM":
      return 0.045; // Degradação moderada (perde 0.045s por volta)
    case "HARD":
      return 0.022; // Degradação baixa (perde 0.022s por volta)
    case "INTERMEDIATE":
      return 0.065;
    case "WET":
      return 0.095;
    default:
      return 0.045;
  }
}

/**
 * Simula a corrida inteira de um piloto com uma estratégia customizada
 * e compara com os tempos reais dos outros pilotos na mesma corrida.
 */
export function simularEstrategiaCorrida(
  dadosCorrida: RegistroVolta[], // Todas as voltas do GP selecionado
  numeroPiloto: number,
  estrategia: EstrategiaSimulada
): ResultadoSimulacao {
  const voltasPilotoReal = dadosCorrida.filter((v) => v.driver_number === numeroPiloto);
  if (voltasPilotoReal.length === 0) {
    throw new Error(`Dados reais do piloto ${numeroPiloto} não encontrados para simulação.`);
  }

  const totalVoltasGP = Math.max(...dadosCorrida.map((v) => v.lap_number));
  const primeiroRegistro = voltasPilotoReal[0];
  const gridPos = primeiroRegistro.position || 10;
  
  // Calcular o ritmo base do piloto (ritmo de volta limpa sem degradação extrema)
  const temposVoltaValidos = voltasPilotoReal
    .map((v) => v.lap_time)
    .filter((t) => t > 60 && t < 120); // volta padrão
  const ritmoBase = temposVoltaValidos.length > 0 
    ? temposVoltaValidos.sort((a,b) => a - b)[Math.floor(temposVoltaValidos.length * 0.25)] // 25º percentil (ritmo ideal)
    : 85.0;

  // Obter tempo real total do piloto na corrida para comparação
  const tempoRealTotal = voltasPilotoReal.reduce((acc, v) => acc + (v.lap_time || 0), 0);

  // Mapear tempos totais reais de cada concorrente na corrida
  const competidoresMap = new Map<number, number>();
  dadosCorrida.forEach((v) => {
    if (v.driver_number !== numeroPiloto) {
      competidoresMap.set(v.driver_number, (competidoresMap.get(v.driver_number) || 0) + (v.lap_time || 0));
    }
  });

  // Lista dos tempos totais reais dos concorrentes ordenados
  const temposCompetidores = Array.from(competidoresMap.values())
    .filter((t) => t > 0)
    .sort((a, b) => a - b);

  // Executar 200 simulações de Monte Carlo para gerar a distribuição de posições
  const contagemPosicoes = new Array(21).fill(0);
  let somaTempoProjetado = 0;
  let curvaExemplo: { volta: number; ritmo: number; composto: string }[] = [];

  for (let sim = 0; sim < 200; sim++) {
    let tempoAcumulado = 0;
    let compostoAtual = estrategia.composto_inicial;
    let idadePneu = 0;
    const curvaSimulacao: { volta: number; ritmo: number; composto: string }[] = [];

    for (let lap = 1; lap <= totalVoltasGP; lap++) {
      // Verifica se há pit stop nesta volta
      const pitStop = estrategia.paradas.find((p) => p.lap === lap);
      let tempoPerdidoPit = 0;

      if (pitStop) {
        compostoAtual = pitStop.composto_novo;
        idadePneu = 0;
        // Perda de tempo padrão do box com variância aleatória
        tempoPerdidoPit = 21.5 + (Math.random() - 0.5) * 1.5;
      }

      const taxaDeg = obterDegradacaoPorComposto(compostoAtual);
      // Efeito do combustível (carro fica mais leve e rápido: ~0.06s mais rápido por volta)
      const efeitoCombustivel = -0.065 * (lap - 1);

      // Ritmo projetado com ruído estocástico
      const ruidoConsistencia = (Math.random() - 0.5) * 0.6; // Simula a variabilidade física do piloto
      const tempoVoltaProjetado =
        ritmoBase +
        taxaDeg * idadePneu +
        efeitoCombustivel +
        tempoPerdidoPit +
        ruidoConsistencia;

      tempoAcumulado += tempoVoltaProjetado;
      idadePneu++;

      if (sim === 0) {
        curvaExemplo.push({
          volta: lap,
          ritmo: parseFloat(tempoVoltaProjetado.toFixed(3)),
          composto: compostoAtual,
        });
      }
    }

    somaTempoProjetado += tempoAcumulado;

    // Comparar tempo acumulado desta simulação com os competidores para obter a posição
    let posicaoSimulada = 1;
    for (const tComp of temposCompetidores) {
      if (tempoAcumulado > tComp) {
        posicaoSimulada++;
      }
    }
    posicaoSimulada = Math.min(20, posicaoSimulada);
    contagemPosicoes[posicaoSimulada]++;
  }

  const tempoMedioProjetado = somaTempoProjetado / 200;

  // Achar posição média projetada
  let posicaoMediaProjetada = 1;
  for (const tComp of temposCompetidores) {
    if (tempoMedioProjetado > tComp) {
      posicaoMediaProjetada++;
    }
  }
  posicaoMediaProjetada = Math.min(20, posicaoMediaProjetada);

  // Formatar distribuição de posições
  const distribuicaoPosicoes = contagemPosicoes
    .map((count, index) => ({
      posicao: `P${index}`,
      probabilidade: Math.round((count / 200) * 100),
    }))
    .filter((p) => p.probabilidade > 0);

  return {
    posicao_final_projetada: posicaoMediaProjetada,
    ganho_perda_posicao: gridPos - posicaoMediaProjetada,
    tempo_total_projetado: parseFloat(tempoMedioProjetado.toFixed(3)),
    tempo_real: parseFloat(tempoRealTotal.toFixed(3)),
    curva_ritmo_projetado: curvaExemplo,
    distribuicao_posicoes: distribuicaoPosicoes.slice(0, 5), // retornar top 5 posições prováveis
  };
}
