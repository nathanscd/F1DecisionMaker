import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useF1 } from "../context/F1Context";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const { carregando, erro } = useF1();

  return (
    <div className="layout-container">
      <Sidebar />

      <div className="layout-content">
        <Header />
        
        <main className="layout-main">
          {carregando ? (
            <div className="telemetry-loading">
              <div className="loading-spinner"></div>
              <p>INICIALIZANDO RITMO DA TELEMETRIA...</p>
              <span>Carregando dados históricos de estratégia...</span>
            </div>
          ) : erro ? (
            <div className="telemetry-error">
              <h2>⚠️ FALHA NO SISTEMA DE TELEMETRIA</h2>
              <p>{erro}</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}