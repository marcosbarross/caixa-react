import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container } from 'react-bootstrap';

function CustomNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Raiz do Saber</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/itens">
              <Nav.Link>Adicionar item</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/vendas">
              <Nav.Link>Vender</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/pedidos">
              <Nav.Link>Pedidos</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/relatorio">
              <Nav.Link>Relatorio</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
