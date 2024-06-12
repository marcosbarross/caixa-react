import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/pedidos/')
            .then(response => setPedidos(response.data))
            .catch(error => console.error('Error loading orders:', error));

        axios.get('http://127.0.0.1:8000/produtos/')
            .then(response => setProdutos(response.data))
            .catch(error => console.error('Error loading products:', error));
    }, []);

    const handlePrint = (pedidoId) => {
        const pedido = pedidos.find(p => p.id === pedidoId);
        if (pedido) {
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
                if (produto) {
                    const quantidade = item.quantidade;
                    const precoUnitario = produto.preco;
                    const subtotal = quantidade * precoUnitario;

                    doc.text(produto.nome, startX, startY);
                    doc.text(quantidade.toString(), startX + 1.7 * columnWidth, startY);
                    doc.text(precoUnitario.toFixed(2), startX + 2.2 * columnWidth, startY);
                    doc.text(subtotal.toFixed(2), startX + 3 * columnWidth, startY);
                    startY += lineHeight / 2;

                    totalPrice += subtotal;
                }
            });

            startY += lineHeight;
            doc.line(startX, startY, pageWidth - startX, startY);
            startY += lineHeight;
            doc.setFontSize(12);
            doc.text(`Total: R$ ${totalPrice.toFixed(2)}`, pageWidth - startX, startY, { align: 'right' });

            doc.save(`pedido_${pedido.id}.pdf`);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <h2>Pedidos</h2>
                <table className="table">
                    <thead>
                    <tr>
                        <th>ID do Pedido</th>
                        <th>Ações</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pedidos.map(pedido => (
                        <tr key={pedido.id}>
                            <td>{pedido.id}</td>
                            <td>
                                <button className="btn btn-primary" onClick={() => handlePrint(pedido.id)}>
                                    Imprimir Comprovante
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Pedidos;
