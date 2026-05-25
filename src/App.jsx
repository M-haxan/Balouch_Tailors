import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AdminLayout from './Layouts/AdminLayout';
import AdminCatalogue from './pages/AdminCatalogue';
import AdminPricing from './pages/AdminPricing';
import AdminSettings from './pages/AdminSettings';
import AdminCustomers from './pages/AdminCustomers';
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
  const location = useLocation();
  // Yeh variable check karta hai ke URL /admin se shuru ho raha hai ya nahi
  const hideHeaderAndFooter = location.pathname.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      
      {/* 1. Header sirf tab dikhayega jab admin route NAHI hoga */}
      {!hideHeaderAndFooter && <Header />}
      
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Offers />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<VisitTailor />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<h1 className="text-2xl font-bold p-6">Welcome Admin!</h1>} />
            <Route path="/admin/catalogue" element={<AdminCatalogue />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
          </Route>
        </Routes>
      </main>
       
      {/* 2. MAIN FIX YAHAN HAI: Footer ko Routes ke bahar nikala aur Condition lagayi */}
      {!hideHeaderAndFooter && <Footer />}

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