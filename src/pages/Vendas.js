import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';

const Vendas = () => {
    const [itemCount, setItemCount] = useState(1);
    const [itens, setItens] = useState([{ produto_id: '', quantidade: '' }]);
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/produtos/')
            .then(response => setProdutos(response.data))
            .catch(error => console.error('Error loading products:', error));
    }, []);

    const handleAddItem = () => {
        setItens([...itens, { produto_id: '', quantidade: '' }]);
        setItemCount(itemCount + 1);
    };

    const handleItemChange = (index, field, value) => {
        const newItens = [...itens];
        newItens[index][field] = value;
        setItens(newItens);
    };

    const handleVendaSubmit = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/pedidos/', itens)
            .then(response => {
                alert(`Venda realizada com sucesso! Pedido ID: ${response.data.id}`);
                gerarCupomFiscal(response.data);
            })
            .catch(error => alert(`Erro ao realizar venda: ${error.response.data.detail}`));
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

        startY += lineHeight;
        doc.line(startX, startY, pageWidth - startX, startY);
        startY += lineHeight;
        doc.setFontSize(12);
        doc.text(`Total: R$ ${totalPrice.toFixed(2)}`, pageWidth - startX, startY, { align: 'right' });

        doc.save('cupom_fiscal.pdf');
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h2>Venda de produtos</h2>
                <form onSubmit={handleVendaSubmit}>
                    {itens.map((item, index) => (
                        <div key={index} className="form-group">
                            <label htmlFor={`produto_id_${index}`}>Produto</label>
                            <select className="form-control" id={`produto_id_${index}`} value={item.produto_id} onChange={(e) => handleItemChange(index, 'produto_id', e.target.value)}>
                                <option value="">Selecione um produto</option>
                                {produtos.map(produto => (
                                    <option key={produto.id} value={produto.id}>{produto.nome}</option>
                                ))}
                            </select>
                            <label htmlFor={`quantidade_${index}`} className="mt-2">Quantidade</label>
                            <input type="number" className="form-control" id={`quantidade_${index}`} value={item.quantidade} onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)} />
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary mt-3" onClick={handleAddItem}>Adicionar Item</button>
                    <button type="submit" className="btn btn-primary mt-3 ml-2">Realizar Venda</button>
                </form>
            </div>
        </div>
    );
};

export default Vendas;
