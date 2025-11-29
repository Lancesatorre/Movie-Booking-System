import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
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
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
     <Router>
      <Routes>
           <Route path="/" element={<Login />} />
           <Route element={<Layout />}>
        <Route path="/Home" element={<Landing />} />
        <Route path="/Movies" element={<BookingMovie />} />

         <Route path="/features" element={<Features />} />
         <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Support Pages */}
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
