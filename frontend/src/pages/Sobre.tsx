import DashboardLayout from "../layouts/DashboardLayout";

export default function Sobre() {
  return (
    <DashboardLayout>
      <div className="layout-main fade-in">
        <div className="pagina-cabecalho">
          <span className="pagina-tag">PROJETO</span>
          <h1 className="pagina-titulo">ESTRATÉGIA DE PIT STOP</h1>
          <p className="pagina-descricao">Tópicos de Big Data em Python — Desenvolvido por Nathanael Secundo, Daniel Silva e Eudanni Serafim.</p>
        </div>

        <div className="painel-grid painel-grid-2">
          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">O Problema</span>
            </div>
            <div className="painel-corpo">
              <p>Na Fórmula 1, vencer nem sempre significa ser o piloto mais rápido. A posição final possui relação direta com a estratégia de pitstop adotada pela equipe.</p>
              <div className="insight-box" style={{ marginTop: '16px' }}>
                <p><strong>Mas até que ponto essas decisões realmente impactam o resultado final?</strong> Muitas corridas são decididas por escolhas feitas fora da pista. Atualmente, grande parte dessas análises fica restrita às próprias equipes, sem ferramentas acessíveis para demonstrar estatisticamente o impacto dessas escolhas.</p>
              </div>
            </div>
          </div>

          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">O Objetivo</span>
            </div>
            <div className="painel-corpo">
              <p>Quantificar o impacto das estratégias de pitstop no resultado final dos pilotos e simular cenários alternativos baseados em probabilidade e evidências reais a partir de dados históricos.</p>
              <ul className="lista-f1">
                <li>E se o piloto tivesse parado três voltas antes?</li>
                <li>E se tivesse utilizado outra estratégia de pneus?</li>
                <li>E se tivesse realizado mais uma parada?</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="painel" style={{ marginBottom: '32px' }}>
          <div className="painel-titulo-barra">
            <span className="painel-titulo">A Inteligência do Sistema</span>
          </div>
          <div className="painel-corpo">
            <h2 className="kpi-card-valor" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>O SISTEMA NÃO APENAS MOSTRA O QUE ACONTECEU. ELE TENTA RESPONDER O QUE PODERIA TER ACONTECIDO.</h2>
            <p>O sistema analisa cenários semelhantes e informa probabilidades. Exemplo: "Se o pitstop tivesse sido realizado quatro voltas antes, haveria aproximadamente 72% de probabilidade de terminar entre P4 e P5". <strong>Isso transforma dados históricos em inteligência estratégica.</strong></p>
          </div>
        </div>

        <div className="painel-grid painel-grid-2">
          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">Metodologia</span>
            </div>
            <div className="painel-corpo">
              <div className="fluxo-grid">
                <div className="fluxo-step">1. Coleta de Dados Históricos</div>
                <div className="fluxo-step">2. Tratamento e Limpeza</div>
                <div className="fluxo-step">3. Criação de Variáveis</div>
                <div className="fluxo-step">4. Similaridade Estatística</div>
                <div className="fluxo-step">5. Análise</div>
                <div className="fluxo-step">6. Insights Probabilísticos</div>
              </div>
              <p style={{ marginTop: '20px' }}>Dados obtidos via OpenF1 API e processados em Python. Variáveis principais: Número de pitstops, volta da parada, tipo de pneu, degradação, tempo de volta, ritmo médio, posição na pista, ganho/perda e posição final.</p>
            </div>
          </div>

          <div className="painel">
            <div className="painel-titulo-barra">
              <span className="painel-titulo">Tecnologias</span>
            </div>
            <div className="painel-corpo">
              <div className="tech-stack-grid">
                <div className="tech-category">
                  <h4>Back-end</h4>
                  <div className="tech-badges">
                    <span className="badge">PYTHON</span>
                    <span className="badge">FLASK</span>
                    <span className="badge">PANDAS</span>
                    <span className="badge">SQLITE</span>
                  </div>
                </div>
                <div className="tech-category">
                  <h4>Front-end</h4>
                  <div className="tech-badges">
                    <span className="badge pneu-SOFT">REACT</span>
                    <span className="badge pneu-MEDIUM">TYPESCRIPT</span>
                    <span className="badge">TAILWINDCSS</span>
                  </div>
                </div>
                <div className="tech-category">
                  <h4>Dados e Estatística</h4>
                  <div className="tech-badges">
                    <span className="badge pneu-HARD">OPENF1 API</span>
                    <span className="badge">SCIKIT-LEARN</span>
                    <span className="badge">ESTATÍSTICA DESCRITIVA</span>
                    <span className="badge">CORRELAÇÃO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}