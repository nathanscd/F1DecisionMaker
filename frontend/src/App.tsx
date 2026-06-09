import Home from "./pages/Home";
import AnaliseEstrategica from "./pages/AnaliseEstrategica";
import Corridas from "./pages/Corridas";
import Dashboard from "./pages/Dashboard";
import Equipes from "./pages/Equipes";
import Pilotos from "./pages/Pilotos";
import Replay from "./pages/ReplayCorrida";
import Simulation from "./pages/Simulation";
import VersaoGeral from "./pages/VersaoGeral";
import Sobre from "./pages/Sobre"
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { F1Provider } from "./context/F1Context";

function App() {
  return (
    <F1Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dados" element={<Dashboard />} />
          <Route path="/analise-estrategica" element={<AnaliseEstrategica />} />
          <Route path="/corridas" element={<Corridas />} />
          <Route path="/equipes" element={<Equipes />} />
          <Route path="/pilotos" element={<Pilotos />} />
          <Route path="/simulacao" element={<Simulation />} />
          <Route path="/replay-corrida" element={<Replay />} />
          <Route path="/versao-geral" element={<VersaoGeral />} />
          <Route path="/sobre" element={<Sobre />} />
        </Routes>
      </BrowserRouter>
    </F1Provider>
  )
}

export default App;