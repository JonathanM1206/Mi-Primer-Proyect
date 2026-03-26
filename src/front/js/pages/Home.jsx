import React, { useEffect, useContext } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Context } from '../store/appContext.jsx';

const Home = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        actions.getProductos();
        actions.getCategorias();
    }, []);

    // Limitamos a los primeros 10 productos para la sección de "Novedades"
    const productosDestacados = store.productos.slice(0, 10);

    return (
        <div className="home-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <style>
                {`
                    .category-scroll {
                        display: flex;
                        overflow-x: auto;
                        gap: 15px;
                        padding: 10px 5px;
                        scrollbar-width: none; /* Firefox */
                    }
                    .category-scroll::-webkit-scrollbar {
                        display: none; /* Chrome/Safari */
                    }
                    .category-pill {
                        white-space: nowrap;
                        padding: 8px 20px;
                        border-radius: 50px;
                        border: 1px solid #ddd;
                        background: white;
                        color: #333;
                        text-decoration: none;
                        transition: all 0.3s;
                    }
                    .category-pill:hover {
                        background: #34d399;
                        color: white;
                        border-color: #34d399;
                    }
                    .product-card-home {
                        border: none;
                        border-radius: 20px;
                        overflow: hidden;
                        transition: transform 0.3s;
                        background: white;
                    }
                    .product-card-home:hover {
                        transform: translateY(-5px);
                    }
                    .img-container {
                        height: 180px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 15px;
                        background: #fff;
                    }
                    .carousel-item img {
                        height: 350px;
                        object-fit: cover;
                        border-radius: 25px;
                    }
                `}
            </style>

            {/* --- 1. ENCABEZADO Y TITULO --- */}
            <div className="container pt-4 text-center">
                <h1 style={{ fontWeight: '800', color: '#1a1a1a' }}>
                    Fuente de Salud <span style={{ color: '#34d399' }}>Bethel</span>
                </h1>
                <p className="text-muted">Tu bienestar, nuestra prioridad.</p>
            </div>

            {/* --- 2. CAROUSEL (BANNERS) --- */}
            <div className="container mt-3">
                <div id="homeCarousel" className="carousel slide shadow-sm" data-bs-ride="carousel" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                    <div className="carousel-inner">
                        <div className="carousel-item active">
                            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80" className="d-block w-100" alt="Banner 1" />
                            <div className="carousel-caption d-none d-md-block" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                <h3>Productos 100% Naturales</h3>
                                <p>Cuida tu cuerpo con lo mejor de la naturaleza.</p>
                            </div>
                        </div>
                        <div className="carousel-item">
                            <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80" className="d-block w-100" alt="Banner 2" />
                            <div className="carousel-caption d-none d-md-block" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '15px' }}>
                                <h3>Vitalidad Diaria</h3>
                                <p>Suplementos pensados para tu ritmo de vida.</p>
                            </div>
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon"></span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
                        <span className="carousel-control-next-icon"></span>
                    </button>
                </div>
            </div>

            {/* --- 3. CATEGORÍAS (SCROLL HORIZONTAL) --- */}
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold">Categorías</h5>
                    <Link to="/listarProductos" className="text-success text-decoration-none small">Ver todas</Link>
                </div>
                <div className="category-scroll">
                    {store.categorias.map(cat => (
                        <Link key={cat.categoria_id} to={`/ProductosPorCategoria/${cat.categoria_id}`} className="category-pill shadow-sm">
                            {cat.nombre}
                        </Link>
                    ))}
                </div>
            </div>

            {/* --- 4. LISTA DE PRODUCTOS (NOVEDADES) --- */}
            <div className="container mt-5 pb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold">Novedades para ti</h5>
                    <button className="btn btn-sm btn-outline-success border-0" onClick={() => navigate('/listarProductos')}>Ver más</button>
                </div>

                <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
                    {productosDestacados.map((producto) => (
                        <div key={producto.product_id} className="col">
                            <div className="card h-100 product-card-home shadow-sm">
                                <div className="img-container">
                                    <img 
                                        src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev${producto.imagen}`} 
                                        alt={producto.name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                                <div className="card-body p-2 text-center">
                                    <h6 className="card-title text-truncate mb-1" style={{ fontSize: '0.9rem' }}>{producto.name}</h6>
                                    <p className="text-success fw-bold mb-2">Lps. {producto.precio}</p>
                                    <button 
                                        className="btn btn-sm w-100 btn-dark rounded-pill"
                                        onClick={() => navigate(`/DetalleProducto/${producto.product_id}`)}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        Ver más
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;