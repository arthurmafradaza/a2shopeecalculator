import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ShopeeCalculator from './ShopeeCalculator';
import MineradorLanding from './MineradorLanding';
import Minerador from './Minerador';
import Criativos from './Criativos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculadora" element={<ShopeeCalculator />} />
        <Route path="/minerador" element={<MineradorLanding />} />
        <Route path="/minerador/shopee" element={<Minerador />} />
        <Route path="/minerador/criativos" element={<Criativos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
