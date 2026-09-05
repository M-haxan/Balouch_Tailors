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
import AdminDashboard from './pages/AdminDashboard';
import AdminCatalogue from './pages/AdminCatalogue';
import AdminPricing from './pages/AdminPricing';
import AdminSettings from './pages/AdminSettings';
import AdminCustomers from './pages/AdminCustomers';
import AdminMeasurements from './pages/AdminMeasurements';
import CreateOrder from './pages/AdminOrder';
import Allorders from './pages/Allorders';
import InvoicePrint from './pages/InvoicePrinnt';
import AdminWorkers from './pages/AdminWorkers';
import WorkerDashboard from './pages/WorkerDashboard';
import PublicOrderTrack from './pages/PublicOrderTrack';
import PublicSuitTrack from './pages/PublicSuitTrack';
import AdminExpenses from './pages/AdminExpenses';

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
  // Yeh variable check karta hai ke URL /admin ya /worker ya /track se shuru ho raha hai ya nahi
  const hideHeaderAndFooter = location.pathname.startsWith('/admin') || location.pathname.startsWith('/worker') || location.pathname.startsWith('/track');

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
          
          {/* Public Tracking Routes */}
          <Route path="/track/:orderNumber" element={<PublicOrderTrack />} />
          <Route path="/track/suit/:suitId" element={<PublicSuitTrack />} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Worker Protected Routes */}
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/catalogue" element={<AdminCatalogue />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/measurements" element={<AdminMeasurements />} />
            <Route path="/admin/workers" element={<AdminWorkers />} />
            <Route path="/admin/expenses" element={<AdminExpenses />} />
            <Route path="/admin/orders/create" element={<CreateOrder />} />
            <Route path="/admin/allorders" element={<Allorders />} />
            <Route path="/admin/print/:id" element={<InvoicePrint />} />
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