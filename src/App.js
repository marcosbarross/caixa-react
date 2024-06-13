import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Itens from './pages/Itens';
import Vendas from './pages/Vendas';
import Pedidos from './pages/Pedidos';
import RelatorioVendas from './pages/RelatorioVendas';
const App = () => {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route path="/itens" element={<Itens />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/pedidos" element={<Pedidos />} />
                <Route path='/relatorio'element={<RelatorioVendas/>} />
            </Routes>
        </Router>
    );
};

export default App;
