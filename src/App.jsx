import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Hero from './components/Hero';
import Offers from './components/Offers';
import Catalogue from './components/Catalogue';
import Pricing from './components/Pricing';
import VisitTailor from './components/VisitTailor';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import WorkerLogin from './pages/WorkerLogin';
import AdminLayout from './Layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminCatalogue from './pages/AdminCatalogue';
import AdminPricing from './pages/AdminPricing';
import AdminServices from './pages/AdminServices';
import AdminSettings from './pages/AdminSettings';
import AdminProfile from './pages/AdminProfile';
import AdminCustomers from './pages/AdminCustomers';
import CustomerProfile from './pages/CustomerProfile';
import AdminMeasurements from './pages/AdminMeasurements';
import CreateOrder from './pages/AdminOrder';
import Allorders from './pages/Allorders';
import InvoicePrint from './pages/InvoicePrinnt';
import AdminWorkers from './pages/AdminWorkers';
import WorkerDashboard from './pages/WorkerDashboard';
import PublicOrderTrack from './pages/PublicOrderTrack';
import PublicSuitTrack from './pages/PublicSuitTrack';
import AdminExpenses from './pages/AdminExpenses';
import AdminFinancialReports from './pages/AdminFinancialReports';
import AdminPayments from './pages/AdminPayments';

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
  // Check if current route should hide public website header and footer
  const hideHeaderAndFooter = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/worker') || 
    location.pathname.startsWith('/track') ||
    location.pathname === '/login' ||
    location.pathname === '/admin-register' ||
    location.pathname.startsWith('/reset-password');

  return (
    <>
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

          {/* Admin Login & Authentication */}
          <Route path="/admin/login" element={<Login />} />
          {/* <Route path="/login" element={<Navigate to="/admin/login" replace />} /> */}
          
          {/* Admin Registration Route */}
          <Route path="/admin-register" element={<Register />} />

          {/* Password Reset Confirmation */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Worker Login */}
          <Route path="/worker/login" element={<WorkerLogin />} />
          {/* <Route path="/worker-login" element={<Navigate to="/worker/login" replace />} /> */}

          {/* Worker Protected Routes */}
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/orders/create" element={<CreateOrder />} />
          <Route path="/worker/orders/edit/:id" element={<CreateOrder />} />
          <Route path="/worker/print/:id" element={<InvoicePrint />} />
          <Route path="/print/:id" element={<InvoicePrint />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminLayout />}>
            {/* <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} /> */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/catalogue" element={<AdminCatalogue />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/offers" element={<AdminServices />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/customers/:id" element={<CustomerProfile />} />
            <Route path="/admin/measurements" element={<AdminMeasurements />} />
            <Route path="/admin/workers" element={<AdminWorkers />} />
            <Route path="/admin/expenses" element={<AdminExpenses />} />
            <Route path="/admin/financial-reports" element={<AdminFinancialReports />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/orders/create" element={<CreateOrder />} />
            <Route path="/admin/orders/edit/:id" element={<CreateOrder />} />
            <Route path="/admin/allorders" element={<Allorders />} />
            <Route path="/admin/print/:id" element={<InvoicePrint />} />
          </Route>
        </Routes>
      </main>
       
      {/* 2. Footer sirf tab dikhayega jab admin route NAHI hoga */}
      {!hideHeaderAndFooter && <Footer />}
    </>
  );
}

export default App;