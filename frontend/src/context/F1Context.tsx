import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { RegistroVolta } from "../types/F1Types";
import { carregarDadosF1, obterListaGPs, obterPilotosPorGP } from "../services/f1Service";

interface ProvedorF1ContextProps {
  anoSelecionado: number;
  setAnoSelecionado: (ano: number) => void;
  gpSelecionado: string; // localização do GP (ex: Sakhir)
  setGPSelecionado: (gp: string) => void;
  pilotoSelecionado: number | "todos";
  setPilotoSelecionado: (piloto: number | "todos") => void;
  equipeSelecionada: string | "todas";
  setEquipeSelecionada: (equipe: string | "todas") => void;
  dados: RegistroVolta[];
  carregando: boolean;
  erro: string | null;
  gpsDisponiveis: { location: string; race_name: string }[];
  pilotosDisponiveis: { driver_number: number; driver_name: string; team_name: string }[];
}

const F1Context = createContext<ProvedorF1ContextProps | undefined>(undefined);

export function F1Provider({ children }: { children: ReactNode }) {
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2023);
  const [gpSelecionado, setGPSelecionado] = useState<string>("");
  const [pilotoSelecionado, setPilotoSelecionado] = useState<number | "todos">("todos");
  const [equipeSelecionada, setEquipeSelecionada] = useState<string | "todas">("todas");
  const [dados, setDados] = useState<RegistroVolta[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const [gpsDisponiveis, setGpsDisponiveis] = useState<{ location: string; race_name: string }[]>([]);
  const [pilotosDisponiveis, setPilotosDisponiveis] = useState<
    { driver_number: number; driver_name: string; team_name: string }[]
  >([]);

  // Carrega os dados sempre que a temporada mudar
  useEffect(() => {
    async function inicializarDados() {
      setCarregando(true);
      setErro(null);
      try {
        const dadosCarregados = await carregarDadosF1(anoSelecionado);
        setDados(dadosCarregados);

        // Preenche GPs disponíveis
        const listaGPs = obterListaGPs(dadosCarregados);
        setGpsDisponiveis(listaGPs);

        // Define o GP padrão como o primeiro da lista
        if (listaGPs.length > 0) {
          const primeiroGP = listaGPs[0].location;
          setGPSelecionado(primeiroGP);
          
          // Preenche pilotos do GP selecionado
          const listaPilotos = obterPilotosPorGP(dadosCarregados, primeiroGP);
          setPilotosDisponiveis(listaPilotos);
          setPilotoSelecionado("todos");
          setEquipeSelecionada("todas");
        }
      } catch (err: any) {
        setErro(err.message || "Erro desconhecido ao processar base de dados.");
      } finally {
        setCarregando(false);
      }
    }

    inicializarDados();
  }, [anoSelecionado]);

  // Atualiza pilotos disponíveis quando o GP selecionado muda
  useEffect(() => {
    if (dados.length > 0 && gpSelecionado) {
      const listaPilotos = obterPilotosPorGP(dados, gpSelecionado);
      setPilotosDisponiveis(listaPilotos);
      
      // Reseta seleções específicas para evitar inconsistência
      setPilotoSelecionado("todos");
      setEquipeSelecionada("todas");
    }
  }, [gpSelecionado, dados]);

  return (
    <F1Context.Provider
      value={{
        anoSelecionado,
        setAnoSelecionado,
        gpSelecionado,
        setGPSelecionado,
        pilotoSelecionado,
        setPilotoSelecionado,
        equipeSelecionada,
        setEquipeSelecionada,
        dados,
        carregando,
        erro,
        gpsDisponiveis,
        pilotosDisponiveis,
      }}
    >
      {children}
    </F1Context.Provider>
  );
}

export function useF1() {
  const context = useContext(F1Context);
  if (!context) {
    throw new Error("useF1 deve ser utilizado dentro de um F1Provider");
  }
  return context;
}
