import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import { Context } from '../store/appContext.jsx';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; //install bootstrap styles 
import '@fortawesome/fontawesome-free/css/all.min.css';
const navbar = () => {
  const { actions, store } = useContext(Context);
  const cantidadTotalCarrito = store.carrito.reduce((total, item) => total + item.cantidad, 0);


  const role = store.user?.role || store.admin?.role || null;
  const navigate = useNavigate();


  const handleLogout = () => {
    actions.logout();
    navigate("/");

  }



  return (
    <nav style={{
      backgroundColor: "#333",
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
          type="text"
          placeholder="Buscar productos..."
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "8px",
            borderRadius: "4px",
            border: "none",
            marginLeft: "150px",
          }}
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

          {role === "user" && (
            < >
              
                <li style={{ paddingLeft: "20px" }}>
                  <Link to='/editUsuario' style={{ color: "white", textDecoration: "none" }}  className="btn btn-lg">
                    <strong>Editar Usuario</strong>
                  </Link>
                </li>
                <li style={{ paddingLeft: "20px" }}>
                  <Link style={{ color: "white", textDecoration: "none" }} to="/listarProductos"  className="btn btn-lg">
                    <strong>Productos</strong>
                  </Link>
                </li>
            
            </>

          )

          }
          {role === "admin" && (
            <>
              <li style={{ paddingLeft: "20px" }}>
                <Link to='/editAdmin' style={{ color: "white", textDecoration: "none" }} className="btn btn-lg">
                  <strong>Editar Admin</strong>
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
              <li style={{ paddingLeft: "20px" }}> 
                <Link to="/listarUsuarios" style={{ color: "white", textDecoration: "none" }} className="btn btn-lg">
                  <strong>Usuarios</strong>
                </Link>
              </li>

            </>

          )

          }
          {(role === 'admin' || role === 'user') && (
            <>
              <li>
                <button onClick={handleLogout} style={{ backgroundColor: "transparent", color: "white", border: "none", paddingLeft: "20px" }} className="btn btn-lg">
                  <strong>Logout</strong></button>
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

        </ul>
      </div>






    </nav>
  )
}

export default navbar