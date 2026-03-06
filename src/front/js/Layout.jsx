import React,{useContext,useEffect} from 'react' 
import { Context } from './store/appContext.jsx';
import { BrowserRouter, Route, Routes } from "react-router-dom";  
import 'bootstrap/dist/css/bootstrap.min.css'; //intall bootstrap styles
import 'bootstrap/dist/js/bootstrap.bundle.min.js';  // <- esta línea activa dropdowns y más, e instala boostrap para dropdowns y más
import '@fortawesome/fontawesome-free/css/all.min.css'; 
//npm install bootstrap @fortawesome/fontawesome-free


import Home from "./pages/Home";
import Navbar from "./component/navbar.jsx";
import RegistroUsuario from "./pages/RegistroUsuario.jsx"; 
import LoginUsuario from "./pages/LoginUsuario.jsx";
import EditUsuario from './pages/EditUsuario.jsx';
import LoginAdmin from './pages/LoginAdmin.jsx';
import EditAdmin from './pages/EditAdmin.jsx';
import CrearProducto from './component/CrearProducto.jsx';
import ListarProductos from './pages/ListarProductos.jsx'; 
import Carrito from './pages/Carrito.jsx'; 
import DetalleProducto from './pages/DetalleProducto.jsx';  
import NotFound from './pages/NotFound.jsx'; 
import ListaUsuario from './pages/ListaUsuario.jsx'; // Asegúrate de tener esta página creada 
import ProductosPorCategoria from './pages/ProductosPorCategoria.jsx';
import Footer from './component/Footer.jsx'; 
import { HistorialPedidos } from './pages/HistorialPedidos.jsx'; 
import {PagoInvitado} from './pages/PagoInvitado.jsx' 
import { MetodoPago } from './pages/MetodoPago.jsx';
const Layout = () => { 
  const { store, actions } = useContext(Context); 

  useEffect(() => { 
    actions.syncTokenFromLocalStorage(); // 🔁 Esto restaura la sesión desde localStorage

  },[])
  return (
          <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home/>} />  
                {/* Rutas Generales para Usuario y Administrador */} 
                <Route path='/Carrito' element={<Carrito/>} /> 
                <Route path="/DetalleProducto/:id" element={<DetalleProducto/>} /> 
                <Route path="/ProductosPorCategoria/:categoriaId" element={<ProductosPorCategoria />} />

                {/* USUARIO */}
                <Route path="/registroUsuario" element={<RegistroUsuario/>}/> 
                <Route path="/loginUsuario" element={<LoginUsuario/>} /> 
                <Route path="/editUsuario" element={<EditUsuario/>} /> 
                <Route path="/listarProductos" element={<ListarProductos/>} /> 
                <Route path="/HistorialPedidos" element={<HistorialPedidos/>}/> 
                <Route path="/PagoInvitado" element={<PagoInvitado/>}/> 
                <Route path="/MetodoPago" element={<MetodoPago/>}/>
                 {/* Administrador */}
                 <Route path="/access-admin-1206" element={<LoginAdmin/>} />
                 <Route path="/editAdmin" element={<EditAdmin/>} />  
                 <Route path="/crearProducto" element={<CrearProducto/>} />
                 <Route path="/listarUsuarios" element={<ListaUsuario/>} />
            
                <Route path="*" element={<NotFound/>} />
            </Routes> 
            <Footer/>
        </BrowserRouter>
  )
}

export default Layout