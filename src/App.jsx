import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Offers from './components/Offers';
import Catalogue from './components/Catalogue';
import Pricing from './components/Pricing';
import VisitTailor from './components/VisitTailor';
import Footer from './components/Footer';
import Login from './pages/Login';

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
    
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Offers />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<VisitTailor />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </QueryClientProvider>
  );
}

export default App;
