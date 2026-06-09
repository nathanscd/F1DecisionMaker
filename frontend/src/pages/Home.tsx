import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="layout-main fade-in home-wrapper">
      <div className="pagina-cabecalho home-header">
        <span className="pagina-tag home-tag">F1 STRATEGY HUB</span>
        <h1 className="pagina-titulo home-title">INTELIGÊNCIA DE CORRIDA</h1>
        <p className="pagina-descricao home-desc">
          Plataforma analítica avançada de telemetria. Escolha o módulo de operação para iniciar.
        </p>
      </div>

      <div className="painel-grid painel-grid-2 home-grid">
        <Link to="/simulacao" className="kpi-card home-card">
          <div className="home-card-top">
            <span className="badge pneu-SOFT home-badge-soft">AI ENGINE</span>
            <span className="home-icon">🏎️</span>
          </div>
          <div>
            <h2 className="kpi-card-valor home-card-title">Simulação</h2>
            <p className="kpi-card-subtitulo home-card-subtitle">
              Engine de simulação histórica volta a volta com insights estratégicos preditivos gerados por inteligência artificial.
            </p>
          </div>
        </Link>

        <Link to="/dados" className="kpi-card home-card">
          <div className="home-card-top">
            <span className="badge home-badge-data">DATA CENTER</span>
            <span className="home-icon">📊</span>
          </div>
          <div>
            <h2 className="kpi-card-valor home-card-title">Dados Brutos</h2>
            <p className="kpi-card-subtitulo home-card-subtitle">
              Acesso direto à telemetria completa utilizada no modelo, tempos de volta, degradação de pneus e análise de pit stops.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Home;