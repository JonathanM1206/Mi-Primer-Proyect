import React,{useContext} from 'react';  
import { Link } from "react-router-dom";
import {Context} from '../store/appContext.jsx'; 
import { useNavigate } from "react-router-dom";

const navbar = () => { 
const{actions}= useContext(Context); 
const admin=localStorage.getItem("role");  
let user=localStorage.getItem("user")?.role; 
const role =admin || user;  
const navigate = useNavigate();


const handleLogout = () => { 
 actions.logout(); 
 navigate("/");

} 



  return (
       <nav style={{ backgroundColor: "#333", padding: "1rem" }}>
            <Link to="/" style={{ color: "white", marginRight: "0", textDecoration: "none" }}>
                        Home
            </Link>  
            <div className="" > 
              <ul className=""> 
                
                  {! role && ( 
                    <> 
                    <li> 
                      <Link to="/registroUsuario" style={{ color: "white", textDecoration: "none" }}>
                       <strong>Registro </strong> 
                      </Link> 
                    </li> 
                    <li> 
                    <Link to="/loginUsuario" style={{ color: "white", textDecoration: "none" }}>  
                    <strong>Login</strong>
                    </Link>
                    </li> 
                    <li> 
                      <Link to="/listarProductos" style={{ color: "white", textDecoration: "none" }}>
                        <strong>Productos</strong>
                      </Link>
                    </li>
                    </>

                  )

                  } 

                   { role ==="user" && ( 
                    <> 
                    <li> 
                      <Link to='/editUsuario' style={{ color: "white", textDecoration: "none" }}>
                        <strong>Editar Usuario</strong>
                      </Link>
                    </li> 
                     <li> 
                      <Link to="/listarProductos" style={{ color: "white", textDecoration: "none" }}>
                        <strong>Productos</strong>
                      </Link>
                    </li>
                    </>

                  ) 

                  } 
                       { role ==="admin" && ( 
                    <> 
                    <li> 
                     <Link to='/editAdmin' style={{ color: "white", textDecoration: "none" }}>
                        <strong>Editar Admin</strong>
                      </Link>
                    </li> 
                    <li> 
                    <Link to='/crearProducto' style={{ color: "white", textDecoration: "none" }}>
                        <strong>Crear Producto</strong>
                      </Link>
                    </li>  
                      <li> 
                      <Link to="/listarProductos" style={{ color: "white", textDecoration: "none" }}>
                        <strong>Productos</strong>
                      </Link>
                    </li>
                    </>

                  ) 

                  } 
                   {role  && ( 
                    <> 
                    <li> 
                      <button onClick={handleLogout} style={{ backgroundColor: "transparent", color: "white", border: "none"}}> 
                         <strong>Logout</strong></button>
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