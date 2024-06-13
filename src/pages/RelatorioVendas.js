import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';
import CustomNavbar from '../components/CustomNavbar';
import getApiUrl from '../util/api';

function RelatorioVendas() {
  const [relatorio, setRelatorio] = useState({ itens: [], total_vendido: 0 });

  useEffect(() => {
    axios.get(`${getApiUrl()}/relatorio/`)
      .then(response => setRelatorio(response.data))
      .catch(error => console.error('Error loading report:', error));
  }, []);

  return (
    <>
      <CustomNavbar />
      <Container className="mt-4">
        <h2>Relatório de Vendas</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nome do produto</th>
              <th>Quantidade vendida</th>
              <th>Estoque restante</th>
              <th>Valor vendido</th>
            </tr>
          </thead>
          <tbody>
            {relatorio.itens.map((item, index) => (
              <tr key={index}>
                <td>{item.nome}</td>
                <td>{item.quantidade_vendida}</td>
                <td>{item.estoque_restante}</td>
                <td>{item.valor_vendido.toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="3"><strong>Total Vendido</strong></td>
              <td><strong>{relatorio.total_vendido.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </>
  );
}

export default RelatorioVendas;
