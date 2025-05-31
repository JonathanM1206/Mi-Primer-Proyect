import React from 'react'  
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./component/navbar.jsx";


const Layout = () => {
  return (
          <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home/>} /> 

                <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
            </Routes>
        </BrowserRouter>
  )
}

export default Layout