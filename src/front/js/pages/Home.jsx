import React from 'react';
import { useNavigate } from "react-router-dom";

const Home = () => { 
    const navigate = useNavigate(); 

    const irAProductos = () => {
        navigate('/listarProductos');
    }

    return (
        <div className='d-flex justify-content-center align-items-center' style={{ minHeight: "60vh", flexDirection: "column", padding: "1rem" }}>
            
            <h1 style={{ fontSize: '3rem' }}>Productos <span style={{ color: '#34d399' }}>Naturales</span> para tu Bienestar</h1>
            
            <h6 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Descubre nuestra selección premium de productos orgánicos y naturales para cuidar tu salud y bienestar de forma consciente.
            </h6> 
            
            <button className='btn' style={{ backgroundColor: '#34d399', fontSize: '1.2rem', padding: '0.5rem 1.5rem' }} onClick={irAProductos}>
                Explorar Productos
            </button>
        </div>
    );
};

export default Home;