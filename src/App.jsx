import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/home/home"
import PressionAtmospheriqueTemp from "./pages/pression"
import Gaz from "./pages/gaz"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/temperature-pression" element={<PressionAtmospheriqueTemp />} />
        <Route path="/emission-gaz" element={<Gaz />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
