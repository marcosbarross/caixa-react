import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import CustomNavbar from '../components/CustomNavbar';

function Home() {
  return (
    <>
      <CustomNavbar />
      <Container className="mt-4">
        <h1>Caixa</h1>
      </Container>
    </>
  );
}

export default Home;
