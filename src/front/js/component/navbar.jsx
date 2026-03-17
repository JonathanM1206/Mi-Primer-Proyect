import React, { useContext, useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import swal from 'sweetalert';
import { Context } from '../store/appContext.jsx';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; //install bootstrap styles 
import '@fortawesome/fontawesome-free/css/all.min.css';
const navbar = () => {
  const { actions, store } = useContext(Context);
  const cantidadTotalCarrito = store.carrito.reduce((total, item) => total + item.cantidad, 0);


  const role = store.user?.role || store.admin?.role || null;
  const navigate = useNavigate();

  // controla si el menú está abierto o cerrado
  const [menuOpen, setMenuOpen] = useState(false);

  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");



  const buscarProductos = () => {
    if (busquedaProducto.trim() === "") return;
    navigate(`/buscar-productos?query=${busquedaProducto}`);
  };

  const buscarClientes = () => {
    if (busquedaCliente.trim() === "") return;
    navigate(`/buscar-clientes?query=${busquedaCliente}`);
  };



  useEffect(() => {
    actions.getCategorias(); //carga categorias al iniciar app 
    actions.verCarrito(); // carga carrito al iniciar la app evita que al dar resfresh se eliminene RECORDAR
  }, []);


  return (
    <>
      <style>
        {`
/* Fondo principal del navbar */
.neo-navbar {
    background: #247456; /* tu color */
    padding: 15px 20px;
    border-radius: 20px; 
       max-width: 1200px;
    margin: auto;

    /* EFECTO NEOMORPHISM */
       box-shadow: 
        6px 6px 12px #1b5a42,   /* sombra oscura */
        -6px -6px 12px #2f9a70; /* luz (más clara que el fondo) */
}

/* Links */
.neo-link { 
 text-decoration: none;
    color: white !important;
    padding: 10px 20px;
    border-radius: 20px;
    transition: 0.3s; 
     min-width: 140px;
    text-align: center;

    background: #247456;

    box-shadow: 
        4px 4px 8px #1b5a42,
        -4px -4px 8px #2f9a70;
}

/* Hover (cuando pasas el mouse) */
.neo-link:hover {
    box-shadow: inset 4px 4px 8px #1b5a42,
                inset -4px -4px 8px #2f9a70;
}
/* Inputs */
.neo-input {
    background: #fdfdfd;
    color: #090c0b;

    border: none;
    padding: 10px 15px;
    border-radius: 20px;

    box-shadow: 
        inset 4px 4px 8px #bdc5c2,
        inset -4px -4px 8px #fffdfd;
}

.neo-input::placeholder {
    color: rgba(0, 0, 0, 0.6);
}

/* Botón carrito */
.neo-btn {
    border-radius: 50%;
    padding: 10px;
    border: none;

    background: #e0e5ec;

    box-shadow: 
        5px 5px 10px #b8bec9,
        -5px -5px 10px #ffffff;
}

.neo-btn:active {
    box-shadow: inset 5px 5px 10px #b8bec9,
                inset -5px -5px 10px #ffffff;
} 

.neo-navbar {
    transition: all 0.3s ease;
}

ul {
    transition: all 0.3s ease;
}
`}
      </style>
      <nav className="neo-navbar container-fluid">
        <div className="row align-items-center w-100">

          {/* 🔰 LOGO */}
          <div className="col-6 col-md-2 d-flex justify-content-between align-items-center">

            <Link to="/" className="neo-link">Home</Link>

            {/* SOLO EN MÓVIL */}
            <button
              className="neo-link d-md-none"
              onClick={() => setMenuOpen(!menuOpen)} // abre/cierra menú
            >
              ☰
            </button>

          </div>

          {/* 🔍 BUSCADORES */}
          <div className="col-12 col-md-4 mt-2 mt-md-0">
           <div className="d-flex flex-column flex-md-row gap-2">

              {/* Productos */}
              <input
                className="neo-input w-100"
                placeholder="Buscar productos..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarProductos()}
              />

              {/* Clientes (solo admin) */}
              {role === "admin" && (
                <input
                  className="neo-input w-100"
                  placeholder="Buscar clientes..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && buscarClientes()}
                />
              )}

            </div>
          </div>

          {/* LINKS */}
          <div className={`col-12 col-md-6 mt-4 mt-md-0 ${menuOpen ? "d-block" : "d-none"} d-md-block`}>
<ul className="d-flex flex-column flex-lg-row gap-4 justify-content-center align-items-center list-unstyled w-100">
                {/* NO LOGIN */}
              {!role && (
                <>
                  <li>
                    <Link to="/registroUsuario" className="neo-link" >
                      <strong>Registro</strong>
                    </Link>
                  </li>
                  <li>
                    <Link to="/loginUsuario" className="neo-link" >
                      <strong>Login</strong>
                    </Link>
                  </li>
                  <li>
                    <Link to="/listarProductos" className="neo-link" >
                      <strong>Productos</strong>
                    </Link>
                  </li>
                  {/*Categoria Dropdown */}
                  <li className="nav-item dropdown">
                    <a className="neo-link dropdown-toggle" href="#" id="categoriasDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Categorías
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="categoriasDropdown">
                      {store.categorias.length > 0 ? (
                        store.categorias.map(cat => (
                          <li key={cat.categoria_id}>
                            <a className="dropdown-item" href={`/ProductosPorCategoria/${cat.categoria_id}`}>{cat.nombre}</a>
                          </li>
                        ))
                      ) : (
                        <li><span className="dropdown-item text-muted">Sin categorías</span></li>
                      )}
                    </ul>
                  </li>



                  {/* 🛒 CARRITO */}
                  <li>
                    <div className="btn-group" >
                      <button className="neo-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {/* icono de carrito */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
                          <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607  
                      1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 
                       0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                        </svg>
                        {cantidadTotalCarrito > 0 && (
                          <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ms-1"

                          >
                            {cantidadTotalCarrito}
                          </span>
                        )}
                      </button>
                      <div className="dropdown-menu">
                        {store.carrito.length === 0 ? (
                          <span className="dropdown-item">Carrito vacío</span>
                        ) : (
                          store.carrito.map((item, index) => (
                            <div
                              key={item.carrito_id}
                              className="dropdown-item d-flex justify-content-between align-items-center"
                            >

                              <span>
                                {item.producto.name} (x{item.cantidad}) - Lps. {item.producto.precio}
                              </span>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={(e) => {
                                  e.stopPropagation(); // evita que el dropdown se cierre
                                  actions.eliminarProductoCarrito(item.carrito_id);
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>

                            </div>
                          ))
                        )}
                        <div className="dropdown-divider"></div>
                        <Link to="/carrito" className="dropdown-item">
                          <strong>Ver Carrito</strong>
                        </Link>
                      </div>
                    </div>
                  </li>
                </>

              )

              }

              {/* USER */}

              {role === "user" && (
                < >

                  <li>
                    <Link to='/editUsuario' className="neo-link" >
                      <strong>Mi Perfil</strong>
                    </Link>
                  </li>

                  <li >
                    <Link to='/HistorialPedidos' className="neo-link" >
                      <strong>Historial de Pedidos</strong>
                    </Link>
                  </li>
                  <li >
                    <Link to="/listarProductos" className="neo-link" >
                      <strong>Productos</strong>
                    </Link>
                  </li>
                  {/* Botón Categoria */}
                  <li className="nav-item dropdown">
                    <a className="neo-link dropdown-toggle" href="#" id="categoriasDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Categorías
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="categoriasDropdown">
                      {store.categorias.length > 0 ? (
                        store.categorias.map(cat => (
                          <li key={cat.categoria_id}>
                            <a className="dropdown-item" href={`/ProductosPorCategoria/${cat.categoria_id}`}>{cat.nombre}</a>
                          </li>
                        ))
                      ) : (
                        <li><span className="dropdown-item text-muted">Sin categorías</span></li>
                      )}
                    </ul>
                  </li>
                  <li>
                    <div className="btn-group" >
                      <button className="neo-btn dropdown-toggle dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {/* icono de carrito */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
                          <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607  
                      1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 
                       0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                        </svg>
                        {cantidadTotalCarrito > 0 && (
                          <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ms-1"

                          >
                            {cantidadTotalCarrito}
                          </span>
                        )}
                      </button>
                      <div className="dropdown-menu">
                        {store.carrito.length === 0 ? (
                          <span className="dropdown-item">Carrito vacío</span>
                        ) : (
                          store.carrito.map((item, index) => (
                            <span className="dropdown-item" key={index}>
                              {item.producto.name} - Lps. {item.producto.precio}
                            </span>
                          ))
                        )}
                        <div className="dropdown-divider"></div>
                        <Link to="/carrito" className="dropdown-item" >
                          <strong>Ver Carrito</strong>
                        </Link>
                      </div>
                    </div>
                  </li>

                </>

              )

              }
              {role === "admin" && (
                <>


                  <li >
                    <Link to='/editAdmin' className="neo-link" >
                      <strong>Perfil Admin</strong>
                    </Link>
                  </li>
                  <li >
                    <Link to='/crearProducto' className="neo-link" >
                      <strong>Crear Producto</strong>
                    </Link>
                  </li>
                  <li >
                    <Link to="/listarProductos" className="neo-link" >
                      <strong>Productos</strong>
                    </Link>
                  </li>
                  {/* Botón Categoria */}

                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="categoriasDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Categorías
                    </a>

                    <ul className="dropdown-menu" aria-labelledby="categoriasDropdown">
                      {store.categorias.length > 0 ? (
                        store.categorias.map(cat => (
                          <li key={cat.categoria_id} className="d-flex justify-content-between align-items-center px-2">
                            <Link className="dropdown-item flex-grow-1" to={`/ProductosPorCategoria/${cat.categoria_id}`}>
                              {cat.nombre}
                            </Link>

                            {/* Botón editar con SweetAlert */}
                            <button
                              className="btn btn-sm btn-warning ms-1"
                              onClick={() => {
                                swal({
                                  text: "Editar nombre de la categoría:",
                                  content: "input",
                                  buttons: {
                                    cancel: "Cancelar",
                                    confirm: "Guardar"
                                  },
                                  value: cat.nombre
                                })
                                  .then(nuevoNombre => {
                                    if (nuevoNombre === null) {
                                      // Usuario canceló
                                      swal("Cancelado", "No se realizó ningún cambio", "info");
                                      return;
                                    }
                                    if (!nuevoNombre.trim()) {
                                      // Input vacío
                                      swal("Error", "Debes escribir un nombre válido", "warning");
                                      return;
                                    }
                                    // Llamamos a la acción para editar
                                    actions.editarCategoria(cat.categoria_id, nuevoNombre);
                                    swal("Actualizado", "Categoría editada correctamente", "success");
                                  });
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>

                            {/* Botón eliminar con SweetAlert */}
                            <button
                              className="btn btn-sm btn-danger ms-1"
                              onClick={() => {
                                swal({
                                  title: "¿Estás seguro?",
                                  text: "No podrás deshacer esta acción",
                                  icon: "warning",
                                  buttons: true,
                                  dangerMode: true,
                                }).then(confirmar => {
                                  if (confirmar) {
                                    actions.eliminarCategoria(cat.categoria_id);
                                    swal("Eliminado", "Categoría eliminada correctamente", "success");
                                  }
                                });
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li><span className="dropdown-item text-muted">Sin categorías</span></li>
                      )}
                    </ul>
                  </li>

                  <li>
                    <Link to="/listarUsuarios" className="neo-link" >
                      <strong>Usuarios</strong>
                    </Link>
                  </li>

                </>

              )

              }


            </ul>
          </div>

        </div>




      </nav>
    </>
  )
}

export default navbar