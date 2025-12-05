import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./Pages/Landing.jsx";
import Layout from "./Components/Layout.jsx";
import Login from './Pages/Login.jsx';
import BookingMovie from './Pages/Booking/BookingMovie.jsx';
import Features from './Pages/Features.jsx';
import About from './Pages/About';
import Contact from './Pages/Contact.jsx';
import HelpCenter from './Pages/HelpCenter.jsx';
import FAQ from './Pages/FAQ.jsx';
import PrivacyPolicy from './Pages/PrivacyPolicy.jsx';
import Checkout from './Pages/Booking/Checkout.jsx';
import MyTickets from './Pages/Booking/MyTickets.jsx';
import  { ProtectedAdminRoute, ProtectedUserRoute }  from "./Components/ProtectedRoute.jsx";
// import ProtectedAdminRoute from "./Components/ProtectedAdminRoute.jsx";
import LayoutAdmin from './Components/LayoutAdmin.jsx';
import Dashboard from './Pages/Admin/Dashboard.jsx';
import MovieManagement from './Pages/Admin/MovieManagement.jsx';
import BookingManagement from './Pages/Admin/BookingManagement.jsx';
import UserProfile from './Pages/Booking/UserProfile.jsx';
import ScrollToTop from './Components/ScrolltoUp.jsx';
import AdminProfile from './Pages/Admin/AdminProfile.jsx';
import MoviesLayout from './Components/MoviesLayout.jsx';

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected Customer Routes */}
         <Route element={<ProtectedUserRoute />}>
          <Route element={<Layout />}>
            <Route path="/Home" element={<Landing />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Support Pages (protected too, since you listed them) */}
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Catch all - redirect to Home */}
            <Route path="*" element={<Navigate to="/Home" replace />} />
          </Route>

            <Route element={<MoviesLayout />}>   
            <Route path="/movies" element={<BookingMovie />} />
          <Route path="/movies-checkout" element={<Checkout />} />
           </Route>
        
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<LayoutAdmin />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/movie-management" element={<MovieManagement />} />
            <Route path="/admin/booking-management" element={<BookingManagement />} />
             
          </Route>
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* Catch all - redirect to Home */}
        <Route path="*" element={<Navigate to="/Home" replace />} />
      </Routes>
    </Router>
  )
}

export default App
