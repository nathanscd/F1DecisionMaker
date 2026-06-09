import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const itensMenu = [
    { nome: "Visão Geral", path: "/", icone: "📊" },
    { nome: "Dashboard", path: "/dados", icone: "🏎️" },
    { nome: "Corridas", path: "/corridas", icone: "🏁" },
    { nome: "Pilotos", path: "/pilotos", icone: "👨‍✈️" },
    { nome: "Equipes", path: "/equipes", icone: "🏢" },
    { nome: "Análise Estratégica", path: "/analise-estrategica", icone: "🧠" },
    { nome: "Replay de Corrida", path: "/replay-corrida", icone: "⏱️" },
    { nome: "Simulador de Estratégia", path: "/simulacao", icone: "🏁" },
    { nome: "Versão Geral", path: "/versao-geral", icone: "⚙️" },
    { nome: "Sobre o Projeto", path: "/sobre", icone: "ℹ️" },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <span className="logo-f1">F1</span>
        <span className="logo-text">STRATEGY</span>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {itensMenu.map((item) => (
            <li key={item.path} className="sidebar-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
                }
              >
                <span className="sidebar-icon">{item.icone}</span>
                <span className="sidebar-label">{item.nome}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}