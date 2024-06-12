import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Itens = () => {
    const [produtos, setProdutos] = useState([]);
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [estoque, setEstoque] = useState('');

    useEffect(() => {
        loadProdutos();
    }, []);

    const loadProdutos = () => {
        axios.get('http://127.0.0.1:8000/produtos/')
            .then(response => setProdutos(response.data))
            .catch(error => console.error('Error loading products:', error));
    };

    const handleAddProduto = (e) => {
        e.preventDefault();
        const newProduto = { nome, preco: parseFloat(preco), estoque: parseInt(estoque) };
        axios.post('http://127.0.0.1:8000/produtos/', newProduto)
            .then(() => {
                loadProdutos();
                setNome('');
                setPreco('');
                setEstoque('');
            })
            .catch(error => console.error('Error adding product:', error));
    };

    const handleDeleteProduto = (id) => {
        axios.delete(`http://127.0.0.1:8000/produtos/${id}`)
            .then(() => loadProdutos())
            .catch(error => console.error('Error deleting product:', error));
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h2>Adicionar produto</h2>
                <form onSubmit={handleAddProduto}>
                    <div className="form-group">
                        <label htmlFor="nome">Nome</label>
                        <input type="text" className="form-control" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="preco">Preço</label>
                        <input type="number" step="0.01" className="form-control" id="preco" value={preco} onChange={(e) => setPreco(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="estoque">Estoque</label>
                        <input type="number" className="form-control" id="estoque" value={estoque} onChange={(e) => setEstoque(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Adicionar produto</button>
                </form>

                <h2 className="mt-5">Produtos cadastrados</h2>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {produtos.map(produto => (
                        <tr key={produto.id}>
                            <td>{produto.nome}</td>
                            <td>{produto.preco}</td>
                            <td>{produto.estoque}</td>
                            <td>
                                <button className="btn btn-danger" onClick={() => handleDeleteProduto(produto.id)}>Excluir</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Itens;
