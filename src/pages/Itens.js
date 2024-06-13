import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import CustomNavbar from '../components/CustomNavbar';
import getApiUrl from '../util/api';

function Itens() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = () => {
    axios.get(`${getApiUrl()}/produtos/`)
      .then(response => setProdutos(response.data))
      .catch(error => console.error('Error loading products:', error));
  };

  const handleAddProduto = (e) => {
    e.preventDefault();
    const newProduto = { nome, preco: parseFloat(preco), estoque: parseInt(estoque) };
    axios.post(`${getApiUrl()}/produtos/`, newProduto)
      .then(() => {
        loadProdutos();
        setNome('');
        setPreco('');
        setEstoque('');
      })
      .catch(error => console.error('Error adding product:', error));
  };

  const handleDeleteProduto = (id) => {
    axios.delete(`${getApiUrl()}/produtos/${id}`)
      .then(() => loadProdutos())
      .catch(error => console.error('Error deleting product:', error));
  };

  return (
    <>
      <CustomNavbar />
      <Container className="mt-4">
        <h2>Adicionar produto</h2>
        <Form onSubmit={handleAddProduto}>
          <Form.Group>
            <Form.Label>Nome</Form.Label>
            <Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Preço</Form.Label>
            <Form.Control type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required />
          </Form.Group>
          <Form.Group>
            <Form.Label>Estoque</Form.Label>
            <Form.Control type="number" value={estoque} onChange={(e) => setEstoque(e.target.value)} required />
          </Form.Group>
          <Button type="submit" className="mt-3">Adicionar produto</Button>
        </Form>
        <h2 className="mt-5">Produtos cadastrados</h2>
        <Table striped bordered hover>
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
                  <Button variant="danger" onClick={() => handleDeleteProduto(produto.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
}

export default Itens;
