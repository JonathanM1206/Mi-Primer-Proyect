import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import swal from 'sweetalert';
import { Context } from '../store/appContext.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Navbar = () => {

  const { actions, store } = useContext(Context);
  const navigate = useNavigate();

  const role = store.user?.role || store.admin?.role || null;

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");

  // calcular total carrito
  const cantidadTotalCarrito = store.carrito.reduce(
    (total, item) => total + item.cantidad, 0
  );

  // buscar productos
  const buscarProductos = () => {
    if (!busquedaProducto.trim()) return;
    navigate(`/buscar-productos?query=${busquedaProducto}`);
  };

  // buscar clientes
  const buscarClientes = () => {
    if (!busquedaCliente.trim()) return;
    navigate(`/buscar-clientes?query=${busquedaCliente}`);
  };

  // cargar datos
  useEffect(() => {
    actions.getCategorias();
    actions.verCarrito();
  }, []);

  return (
    <>
      <style>
        {`
        .custom-navbar {
          background: #247456;
          border-radius: 20px;
          margin: 3px;
          box-shadow:none;
        }

        .custom-link {
          color: white !important;
          border-radius: 20px;
          padding: 8px 15px !important;
          transition: 0.3s;
        }

        .custom-link:hover {
          background: rgba(255,255,255,0.2);
        }

        .search-input {
          border-radius: 20px;
          padding: 6px 10px;
          border: none;
          margin: 5px;
          outline: none;
        }

        .dropdown-menu {
          max-height: 300px;
          overflow-y: auto;
        }
        `}
      </style>

      <nav className="navbar navbar-expand-lg custom-navbar navbar-dark">
        <div className="container-fluid">

          {/* LOGO */}
          <Link className="navbar-brand" to="/">
            Home
          </Link>

          {/* BOTÓN RESPONSIVE */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContenido"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* CONTENIDO */}
          <div className="collapse navbar-collapse" id="navbarContenido">

            {/* LINKS */}
            <ul className="navbar-nav me-auto">

              {/* PRODUCTOS (SIEMPRE) */}
              <li className="nav-item">
                <Link to="/listarProductos" className="nav-link custom-link">
                  Productos
                </Link>
              </li>

              {/* CATEGORÍAS */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link custom-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  Categorías
                </a>

                <ul className="dropdown-menu">

                  {store.categorias.length > 0 ? (
                    store.categorias.map(cat => (
                      <li key={cat.categoria_id} className="d-flex justify-content-between align-items-center px-2">

                        <Link
                          className="dropdown-item"
                          to={`/ProductosPorCategoria/${cat.categoria_id}`}
                        >
                          {cat.nombre}
                        </Link>

                        {/* ADMIN CONTROLES */}
                        {role === "admin" && (
                          <div className="d-flex">

                            <button
                              className="btn btn-sm btn-warning me-1"
                              onClick={() => {
                                swal({
                                  text: "Editar categoría:",
                                  content: "input",
                                  buttons: ["Cancelar", "Guardar"],
                                  value: cat.nombre
                                }).then(nuevo => {
                                  if (!nuevo || !nuevo.trim()) return;
                                  actions.editarCategoria(cat.categoria_id, nuevo);
                                });
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                swal({
                                  title: "¿Eliminar?",
                                  icon: "warning",
                                  buttons: true,
                                  dangerMode: true,
                                }).then(ok => {
                                  if (ok) {
                                    actions.eliminarCategoria(cat.categoria_id);
                                  }
                                });
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>

                          </div>
                        )}

                      </li>
                    ))
                  ) : (
                    <li className="dropdown-item text-muted">
                      Sin categorías
                    </li>
                  )}

                </ul>
              </li>

              {/* NO LOGIN */}
              {!role && (
                <>
                  <li className="nav-item">
                    <Link to="/registroUsuario" className="nav-link custom-link">
                      Registro
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/loginUsuario" className="nav-link custom-link">
                      Login
                    </Link>
                  </li>
                </>
              )}

              {/* USER */}
              {role === "user" && (
                <>
                  <li className="nav-item">
                    <Link to="/editUsuario" className="nav-link custom-link">
                      Mi Perfil
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/HistorialPedidos" className="nav-link custom-link">
                      Pedidos
                    </Link>
                  </li>
                </>
              )}

              {/* ADMIN */}
              {role === "admin" && (
                <>
                  <li className="nav-item">
                    <Link to="/editAdmin" className="nav-link custom-link">
                      Perfil Admin
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/crearProducto" className="nav-link custom-link">
                      Crear Producto
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link to="/listarUsuarios" className="nav-link custom-link">
                      Usuarios
                    </Link>
                  </li>
                </>
              )}

            </ul>

            {/* BUSCADORES */}
            <div className="d-flex flex-column flex-lg-row align-items-center">

              <input
                type="text"
                className="search-input"
                placeholder="Buscar productos..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarProductos()}
              />

              {role === "admin" && (
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar clientes..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscarClientes()}
                />
              )}

            </div>

            {/* CARRITO */}
            <div className="ms-lg-3 mt-2 mt-lg-0">

              <div className="dropdown">
                <button
                  className="btn btn-light dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  🛒 {cantidadTotalCarrito}
                </button>

                <ul className="dropdown-menu dropdown-menu-end">

                  {store.carrito.length === 0 ? (
                    <li className="dropdown-item">Carrito vacío</li>
                  ) : (
                    store.carrito.map(item => (
                      <li key={item.carrito_id} className="dropdown-item d-flex justify-content-between">

                        <span>
                          {item.producto.name} x{item.cantidad}
                        </span>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => actions.eliminarProductoCarrito(item.carrito_id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>

                      </li>
                    ))
                  )}

                  <li>
                    <Link to="/carrito" className="dropdown-item text-center">
                      <strong>Ver carrito</strong>
                    </Link>
                  </li>

                </ul>
              </div>

            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;