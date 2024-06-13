import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import CustomNavbar from '../components/CustomNavbar';

function Vendas() {
  const [itemCount, setItemCount] = useState(1);
  const [itens, setItens] = useState([{ produto_id: '', quantidade: '' }]);
  const [produtos, setProdutos] = useState([]);
  const [valorPago, setValorPago] = useState('');
  const [troco, setTroco] = useState(0);
  const [metodoSemTroco, setMetodoSemTroco] = useState(true);
  const [totalPedido, setTotalPedido] = useState(0);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/produtos/')
      .then(response => setProdutos(response.data))
      .catch(error => console.error('Error loading products:', error));
  }, []);

  useEffect(() => {
    calcularTotalPedido();
  }, [itens]);

  const handleAddItem = () => {
    setItens([...itens, { produto_id: '', quantidade: '' }]);
    setItemCount(itemCount + 1);
  };

  const handleItemChange = (index, field, value) => {
    const newItens = [...itens];
    newItens[index][field] = value;
    setItens(newItens);
  };

  const handleRemoveItem = (index) => {
    const newItens = itens.filter((_, i) => i !== index);
    setItens(newItens);
    setItemCount(itemCount - 1);
  };

  const handleVendaSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/pedidos/', itens)
      .then(response => {
        alert(`Venda realizada com sucesso! Pedido ID: ${response.data.id}`);
        calcularTroco(response.data);
        gerarCupomFiscal(response.data);
      })
      .catch(error => alert(`Erro ao realizar venda: ${error.response.data.detail}`));
  };

  const calcularTroco = (pedido) => {
    let total = 0;
    pedido.itens.forEach(item => {
      const produto = produtos.find(p => p.id === item.produto_id);
      total += produto.preco * item.quantidade;
    });
    const trocoCalculado = valorPago - total;
    setTroco(trocoCalculado > 0 ? trocoCalculado : 0);
  };

  const calcularTotalPedido = () => {
    let total = 0;
    itens.forEach(item => {
      const produto = produtos.find(p => p.id === parseInt(item.produto_id));
      if (produto) {
        total += produto.preco * item.quantidade;
      }
    });
    setTotalPedido(total);
  };

  const gerarCupomFiscal = (pedido) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 257]
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let startX = 10;
    let startY = 10;
    let lineHeight = 10;
    let columnWidth = 18;

    doc.setFontSize(20);
    doc.text('Cantina Junina', pageWidth / 2, startY, { align: 'center' });
    startY += lineHeight + 2;

    doc.setFontSize(12);
    doc.text(`Número do pedido: ${pedido.id}`, startX, startY);
    startY += lineHeight;

    doc.setFontSize(10);
    doc.text('Produto', startX, startY);
    doc.text('Qtd', startX + 1.7 * columnWidth, startY);
    doc.text('Preço', startX + 2.2 * columnWidth, startY);
    doc.text('Subtotal', startX + 3 * columnWidth, startY);
    startY += lineHeight;

    let totalPrice = 0;

    pedido.itens.forEach(item => {
      const produto = produtos.find(p => p.id === item.produto_id);
      const quantidade = item.quantidade;
      const precoUnitario = produto.preco;
      const subtotal = quantidade * precoUnitario;

      doc.text(produto.nome, startX, startY);
      doc.text(quantidade.toString(), startX + 1.7 * columnWidth, startY);
      doc.text(precoUnitario.toFixed(2), startX + 2.2 * columnWidth, startY);
      doc.text(subtotal.toFixed(2), startX + 3 * columnWidth, startY);
      startY += lineHeight / 2;

      totalPrice += subtotal;
    });

    startY += lineHeight / 2;
    doc.line(startX, startY, pageWidth - startX, startY);
    startY += lineHeight / 2;
    doc.text('Total:', startX, startY);
    doc.text(totalPrice.toFixed(2), startX + 3 * columnWidth, startY);

    if (!metodoSemTroco) {
      startY += lineHeight / 2;
      doc.text('Valor pago:', startX, startY);
      doc.text(parseFloat(valorPago).toFixed(2), startX + 3 * columnWidth, startY);

      startY += lineHeight / 2;
      doc.text('Troco:', startX, startY);
      doc.text(troco.toFixed(2), startX + 3 * columnWidth, startY);
    }

    const string = doc.output('bloburl');
    window.open(string, '_blank');
  };

  return (
    <>
      <CustomNavbar />
      <Container className="mt-4">
        <h2>Vender</h2>
        <Form onSubmit={handleVendaSubmit}>
          {itens.map((item, index) => (
            <div key={index} className="mb-3">
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Item {index + 1}</Form.Label>
                    <Form.Control
                      as="select"
                      value={item.produto_id}
                      onChange={e => handleItemChange(index, 'produto_id', e.target.value)}
                      required
                    >
                      <option value="">Selecione o produto</option>
                      {produtos.map(produto => (
                        <option key={produto.id} value={produto.id}>{produto.nome}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Quantidade</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Quantidade"
                      value={item.quantidade}
                      onChange={e => handleItemChange(index, 'quantidade', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button variant="danger" onClick={() => handleRemoveItem(index)}>Remover</Button>
                </Col>
              </Row>
            </div>
          ))}
        <Button variant="primary" onClick={handleAddItem}>Adicionar item</Button>
          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Valor Pago</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Valor Pago"
                  value={valorPago}
                  onChange={e => {
                    setValorPago(e.target.value);
                    if (!metodoSemTroco) {
                      calcularTroco({ itens });
                    }
                  }}
                  disabled={metodoSemTroco}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-center">
              <Form.Group controlId="metodoSemTroco">
                <Form.Check
                  type="checkbox"
                  label="Método sem troco"
                  checked={metodoSemTroco}
                  onChange={e => {
                    setMetodoSemTroco(e.target.checked);
                    if (e.target.checked) {
                      setTroco(0);
                    } else {
                      calcularTroco({ itens });
                    }
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={12}>
              <h4>Total: {totalPedido.toFixed(2)}</h4>
            </Col>
          </Row>
          <br />
          <Button type="submit">Finalizar venda</Button>
        </Form>
      </Container>
    </>
  );
}

export default Vendas;