import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <Link className="navbar-brand" to="/">Raiz do Saber</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <Link className="nav-link" to="/itens">Adicionar item</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/vendas">Vender</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/pedidos">Pedidos</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
