import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Preloader from './components/Preloader';
import Header from './components/Header';
import Hero from './components/Hero';
import Offers from './components/Offers';
import Catalogue from './components/Catalogue';
import Pricing from './components/Pricing';
import VisitTailor from './components/VisitTailor';
import Footer from './components/Footer';

function Home() {
  return (
    <>
      <Hero />
      <Offers />
      <Catalogue />
      <Pricing />
      <VisitTailor />
    </>
  );
}

function App() {
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Offers />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<VisitTailor />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
