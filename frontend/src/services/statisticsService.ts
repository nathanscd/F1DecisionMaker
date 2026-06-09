import type { RegistroVolta } from "../types/F1Types";

export interface ItemCorrelacao {
  variavel1: string;
  variavel2: string;
  valor: number;
}

export interface ResultadoCorrelacao {
  rotulos: string[];
  matriz: number[][];
  interpretacao: string[];
}

// Chaves internas correspondentes nas linhas do CSV
const CHAVES_METRICAS = [
  "pit_count",
  "pit_loss",
  "degradation",
  "tire_age",
  "rolling_pace",
  "consistency_score",
  "position_change",
  "final_position",
];

// Rótulos amigáveis para exibição na UI
const ROTULOS_EXIBICAO = [
  "Qtd Paradas (Pit Count)",
  "Perda em Pit (s)",
  "Degradação de Pneus",
  "Idade do Pneu (Voltas)",
  "Ritmo de Volta (Rolling Pace)",
  "Desvio de Consistência",
  "Saldo de Posições (Ganhos)",
  "Posição de Chegada (Final)",
];

/**
 * Calcula o coeficiente de correlação de Pearson entre dois vetores de números
 */
function calcularPearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const mediaX = x.reduce((a, b) => a + b, 0) / n;
  const mediaY = y.reduce((a, b) => a + b, 0) / n;

  let numerador = 0;
  let somaXQuadrado = 0;
  let somaYQuadrado = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - mediaX;
    const diffY = y[i] - mediaY;
    numerador += diffX * diffY;
    somaXQuadrado += diffX * diffX;
    somaYQuadrado += diffY * diffY;
  }

  if (somaXQuadrado === 0 || somaYQuadrado === 0) return 0;

  return parseFloat((numerador / Math.sqrt(somaXQuadrado * somaYQuadrado)).toFixed(3));
}

/**
 * Gera a matriz de correlação completa e descrições qualitativas
 */
export function processarMatrizCorrelacao(dados: RegistroVolta[]): ResultadoCorrelacao {
  // Filtra linhas nulas
  const dadosLimpos = dados.filter((row) => {
    return CHAVES_METRICAS.every(
      (key) =>
        row[key as keyof RegistroVolta] !== undefined &&
        row[key as keyof RegistroVolta] !== null &&
        !isNaN(Number(row[key as keyof RegistroVolta]))
    );
  });

  const matriz: number[][] = [];

  // Cria vetores para cada métrica
  const vetores = CHAVES_METRICAS.map((key) =>
    dadosLimpos.map((row) => Number(row[key as keyof RegistroVolta]))
  );

  // Calcula coeficientes cruzados
  for (let i = 0; i < CHAVES_METRICAS.length; i++) {
    matriz[i] = [];
    for (let j = 0; j < CHAVES_METRICAS.length; j++) {
      matriz[i][j] = calcularPearson(vetores[i], vetores[j]);
    }
  }

  // Gera explicações estatísticas automáticas
  const interpretacao: string[] = [];

  // Correlação: Pit Count vs Final Position (i=0, j=7)
  const corrPitFinal = matriz[0][7];
  if (Math.abs(corrPitFinal) > 0.4) {
    interpretacao.push(
      `O número de paradas (Pit Count) possui uma correlação ${
        corrPitFinal > 0 ? "positiva" : "negativa"
      } expressiva (${corrPitFinal}) com a posição de chegada. Isso prova estatisticamente que a quantidade de paradas de pit afeta diretamente o resultado final da corrida.`
    );
  } else {
    interpretacao.push(
      `O número de paradas (Pit Count) possui uma correlação fraca (${corrPitFinal}) diretamente com a posição de chegada, sugerindo que a eficácia da estratégia depende da janela ideal do pit e não apenas da quantidade pura de paradas.`
    );
  }

  // Correlação: Degradacao vs Ritmo (i=2, j=4)
  const corrDegRitmo = matriz[2][4];
  interpretacao.push(
    `A degradação dos pneus e o ritmo de volta apresentam uma correlação de ${corrDegRitmo}. ${
      corrDegRitmo > 0.3
        ? "À medida que a degradação sobe, o tempo de volta aumenta de forma visível, justificando a troca estratégica de pneus antes da perda severa de ritmo."
        : "O impacto da degradação nos tempos de volta é mitigado pelo consumo de combustível ao longo do GP, que deixa o carro mais leve."
    }`
  );

  // Correlação: Pit Loss vs Posição Final (i=1, j=7)
  const corrLossFinal = matriz[1][7];
  if (corrLossFinal > 0.2) {
    interpretacao.push(
      `A perda de tempo total nos boxes (Pit Loss) tem correlação de ${corrLossFinal} com a posição final, o que demonstra que erros nos pits ou paradas em janelas com muito tráfego degradam o resultado da corrida.`
    );
  }

  // Correlação: Consistência vs Posição Final (i=5, j=7)
  const corrConsistFinal = matriz[5][7];
  interpretacao.push(
    `O desvio de consistência apresenta correlação de ${corrConsistFinal} com a posição final. ${
      corrConsistFinal > 0.3
        ? "Pilotos mais irregulares (com desvios altos) tendem a terminar a corrida em posições piores, ressaltando o valor estratégico de manter stints estáveis."
        : "A estabilidade do ritmo volta a volta é vital para proteger posições e viabilizar estratégias de undercut."
    }`
  );

  return {
    rotulos: ROTULOS_EXIBICAO,
    matriz,
    interpretacao,
  };
}
