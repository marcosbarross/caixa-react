import React from 'react';
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h1>Bem-vindo à Raiz do Saber</h1>
            </div>
        </div>
    );
};

export default Home;
