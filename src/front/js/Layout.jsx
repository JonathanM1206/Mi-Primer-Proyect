import React from 'react'  
import { BrowserRouter, Route, Routes } from "react-router-dom";  



import Home from "./pages/Home";
import Navbar from "./component/navbar.jsx";
import RegistroUsuario from "./pages/RegistroUsuario.jsx"; 
import LoginUsuario from "./pages/LoginUsuario.jsx";
import EditUsuario from './pages/EditUsuario.jsx';
import LoginAdmin from './pages/LoginAdmin.jsx';
import EditAdmin from './pages/EditAdmin.jsx';
import CrearProducto from './component/CrearProducto.jsx';
import ListarProductos from './pages/ListarProductos.jsx';
const Layout = () => {
  return (
          <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home/>} /> 
                {/* USUARIO */}
                <Route path="/registroUsuario" element={<RegistroUsuario/>}/> 
                <Route path="/loginUsuario" element={<LoginUsuario/>} /> 
                <Route path="/editUsuario" element={<EditUsuario/>} /> 
                <Route path="/listarProductos" element={<ListarProductos/>} /> 
                 {/* Administrador */}
                 <Route path="/access-admin-1206" element={<LoginAdmin/>} />
                 <Route path="/editAdmin" element={<EditAdmin/>} />  
                 <Route path="/crearProducto" element={<CrearProducto/>} />
            
                <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
            </Routes>
        </BrowserRouter>
  )
}

export default Layout