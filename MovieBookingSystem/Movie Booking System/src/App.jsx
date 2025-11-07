import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Pages/Landing.jsx";
import Layout from "./Components/Layout.jsx";
import Login from './Pages/Login.jsx';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
     <Router>
      <Routes>
           <Route path="/" element={<Login />} />
           <Route element={<Layout />}>
        <Route path="/Home" element={<Landing />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
