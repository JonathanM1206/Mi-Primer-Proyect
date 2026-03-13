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
    <nav style={{
      backgroundColor: "#247456",
      padding: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: "white"
    }}>
      <Link to="/" style={{ color: "white", marginLeft: "30px", marginRight: "70px", textDecoration: "none" }}>
        <h2> Home</h2>
      </Link>
      <div style={{ flex: 1, padding: "0 30px" }}>

        <input
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "8px",
            borderRadius: "4px",
            border: "none",
            marginLeft: "50px",
          }}
          type="text"
          placeholder="Buscar productos..."
          value={busquedaProducto}
          onChange={(e) => setBusquedaProducto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscarProductos()}
          className="search-input"
        />

      </div>
      <div className="" >
        <ul className="" style={{ listStyle: "none", display: "flex", justifyContent: "space-between", marginLeft: "50px" }}>

          {!role && (
            <>
              <li style={{ paddingLeft: "20px" }}>
                <Link to="/registroUsuario" style={{ color: "white", textDecoration: "none" }}>
                  <h3>Registro </h3>
                </Link>
              </li>
              <li style={{ paddingLeft: "20px" }}>
                <Link to="/loginUsuario" style={{ color: "white", textDecoration: "none" }}>
                  <h3>Login</h3>
                </Link>
              </li>
              <li style={{ paddingLeft: "20px" }}>
                <Link to="/listarProductos" style={{ color: "white", textDecoration: "none" }}>
                  <h3>Productos</h3>
                </Link>
              </li>
              {/*Categoria Dropdown */}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="categoriasDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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
                <div className="btn-group" style={{ marginRight: "20px", paddingLeft: "20px" }}>
                  <button className="btn btn-success btn-lg dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {/* icono de carrito */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
                      <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607  
                      1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 
                       0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                    </svg>
                    {cantidadTotalCarrito > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {cantidadTotalCarrito}
                      </span>
                    )}
                  </button>
                  <div className="dropdown-menu">
                    {store.carrito.length === 0 ? (
                      <span className="dropdown-item">Carrito vacío</span>
                    ) : (
                      store.carrito.map((item,index) => (
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
                    <Link to="/carrito" className="dropdown-item" style={{ color: "black", textDecoration: "none" }}>
                      <strong>Ver Carrito</strong>
                    </Link>
                  </div>
                </div>
              </li>
            </>

          )

          }

          {role === "user" && (
            < >

              <li style={{ paddingLeft: "20px" }}>
                <Link to='/editUsuario' style={{ color: "white", textDecoration: "none" }} className="btn btn-lg">
                  <strong>Mi Perfil</strong>
                </Link>
              </li>

              <li style={{ paddingLeft: "20px" }}>
                <Link to='/HistorialPedidos' style={{ color: "white", textDecoration: "none" }} className="btn btn-lg">
                  <strong>Historial de Pedidos</strong>
                </Link>
              </li>
              <li style={{ paddingLeft: "20px" }}>
                <Link style={{ color: "white", textDecoration: "none" }} to="/listarProductos" className="btn btn-lg">
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
                <div className="btn-group" style={{ marginRight: "20px", paddingLeft: "20px" }}>
                  <button className="btn btn-success btn-lg dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {/* icono de carrito */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
                      <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607  
                      1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 
                       0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                    </svg>
                    {cantidadTotalCarrito > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.75rem" }}
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
                    <Link to="/carrito" className="dropdown-item" style={{ color: "black", textDecoration: "none" }}>
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
              <input
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "none",
                  marginLeft: "50px",
                }} type="text"
                placeholder="Buscar clientes..."
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarClientes()}
                className="search-input"
              />

              <li style={{ paddingLeft: "20px" }}>
                <Link to='/editAdmin' style={{ color: "white", textDecoration: "none" }} className="btn btn-lg">
                  <strong>Perfil de Admin</strong>
                </Link>
              </li>
              <li style={{ paddingLeft: "20px" }}>
                <Link to='/crearProducto' style={{ color: "white", textDecoration: "none" }} className="btn btn-lg">
                  <strong>Crear Producto</strong>
                </Link>
              </li>
              <li style={{ paddingLeft: "20px" }}>
                <Link to="/listarProductos" style={{ color: "white", textDecoration: "none" }} className="btn btn-lg">
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

              <li style={{ paddingLeft: "20px" }}>
                <Link to="/listarUsuarios" style={{ color: "white", textDecoration: "none" }} className="btn btn-lg">
                  <strong>Usuarios</strong>
                </Link>
              </li>

            </>

          )

          }


        </ul>
      </div>






    </nav>
  )
}

export default navbar