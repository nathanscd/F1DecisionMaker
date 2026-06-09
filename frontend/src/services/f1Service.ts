import Papa from "papaparse";
import type { RegistroVolta } from "../types/F1Types";

const cacheDados: { [ano: number]: RegistroVolta[] } = {};

/**
 * Carrega os dados da temporada selecionada (2023 ou 2024) com cache em memória
 */
export async function carregarDadosF1(ano: number = 2023): Promise<RegistroVolta[]> {
  if (cacheDados[ano]) {
    return cacheDados[ano];
  }

  const response = await fetch(`/data/f1_dataset_${ano}.csv`);
  if (!response.ok) {
    throw new Error(`Erro ao carregar dados de F1 para o ano: ${ano}`);
  }

  const csvText = await response.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  // Filtra linhas nulas ou corrompidas e garante a tipagem correta
  const dadosValidos = (parsed.data as any[])
    .filter(
      (row) =>
        row.driver_name &&
        row.lap_number !== undefined &&
        row.location !== undefined
    )
    .map((row) => ({
      ...row,
      // Se o race_name vier vazio, usa a localização (Ex: Sakhir, Jeddah)
      race_name: row.race_name || `GP de ${row.location || row.country}`,
    })) as RegistroVolta[];

  cacheDados[ano] = dadosValidos;
  return dadosValidos;
}

/**
 * Retorna a lista única de GPs ordenada pela ordem em que ocorrem nos dados
 */
export function obterListaGPs(dados: RegistroVolta[]): { location: string; race_name: string }[] {
  const gps: { location: string; race_name: string }[] = [];
  const vistos = new Set<string>();

  dados.forEach((row) => {
    if (!vistos.has(row.location)) {
      vistos.add(row.location);
      gps.push({
        location: row.location,
        race_name: row.race_name,
      });
    }
  });

  return gps;
}

/**
 * Retorna pilotos únicos para uma corrida
 */
export function obterPilotosPorGP(dados: RegistroVolta[], localGP: string): { driver_number: number; driver_name: string; team_name: string }[] {
  const pilotos: { driver_number: number; driver_name: string; team_name: string }[] = [];
  const vistos = new Set<number>();

  dados
    .filter((row) => row.location === localGP)
    .forEach((row) => {
      if (!vistos.has(row.driver_number)) {
        vistos.add(row.driver_number);
        pilotos.push({
          driver_number: row.driver_number,
          driver_name: row.driver_name,
          team_name: row.team_name,
        });
      }
    });

  return pilotos.sort((a, b) => a.driver_name.localeCompare(b.driver_name));
}

/**
 * Retorna equipes únicas presentes nos dados
 */
export function obterEquipes(dados: RegistroVolta[]): string[] {
  const equipes = new Set<string>();
  dados.forEach((row) => {
    if (row.team_name) equipes.add(row.team_name);
  });
  return Array.from(equipes).sort();
}