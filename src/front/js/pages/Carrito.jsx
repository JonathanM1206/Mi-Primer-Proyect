import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext.jsx";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";

const Carrito = () => {

  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  //Vaciar carrito Completo 
  const vaciandoCarrito = async () => {
    const confirmar = await swal({
      title: "¿Estás seguro?",
      text: "¡No podrás deshacer esta acción!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (confirmar) {
      try {
        await actions.vaciarCarrito();
        await actions.verCarrito();

        if (store.carrito?.length === 0) {
          swal("Carrito vacío", "El carrito se encuentra vacío ahora", "info");
        } else {
          swal("Carrito vaciado", "Todos los productos han sido eliminados", "success");
        }
      } catch (error) {
        console.error("Error al vaciar el carrito:", error);
        swal("Error", "No se pudo vaciar el carrito", "error");
      }
    }
  };


  // Reducir cantidad
  const reduzco = async (carrito_id, cantidadActual) => {
    if (!carrito_id || isNaN(carrito_id)) {
      console.error("ID de producto inválido", carrito_id);
      return;
    }
    if (cantidadActual <= 1) {
      swal("Use el botón de eliminar para quitar el producto del carrito");
      return;
    }

    try {
      await actions.reducirCantidadCarrito(carrito_id, cantidadActual);
      swal("Cantidad reducida", "La cantidad del producto ha sido reducida correctamente", "success");
    } catch (error) {
      console.error("Error al reducir la cantidad:", error);
      swal("Error", "No se pudo reducir la cantidad del producto", "error");
    }
  };


  // Aumentar cantidad
  const aumento = async (carrito_id, cantidadActual) => {
    try {
      await actions.aumentarCantidadCarrito(carrito_id, cantidadActual);
      swal("Cantidad aumentada", "La cantidad del producto ha sido incrementada correctamente", "success");
    } catch (error) {
      console.error("Error al aumentar la cantidad:", error);
      swal("Error", "No se pudo aumentar la cantidad del producto", "error");
    }
  };


  //Eliminar producto
  const eliminar = async (carrito_id) => {
    if (!carrito_id || isNaN(carrito_id)) {
      console.error("ID de producto inválido", carrito_id);
      return;
    }
    const confirmar = await swal({
      title: "¿Estás seguro de Remover el Producto Completo?",
      text: "¡No podrás deshacer esta acción!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });
    if (confirmar) {
      try {
        await actions.eliminarProductoCarrito(carrito_id)
        swal("Producto eliminado", "El producto ha sido eliminado correctamente", "success");
        await actions.verCarrito();
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        swal("Error", "No se pudo eliminar el producto", "error");
      }
    }
  };

  useEffect(() => {
    actions.verCarrito();
  }, []);

  const productosCarrito = Array.isArray(store.carrito)
    ? store.carrito.filter(item => item.producto) // 🔥 SOLO los que existen
    : [];
  return ( 
    <> 
    <style>
{`
/* CONTENEDOR TIPO CÁPSULA */
.cantidad-pill {
  display: flex;                 /* coloca elementos en fila */
  align-items: center;           /* centra verticalmente */
  background: #f5f5f5;           /* fondo gris suave */
  border-radius: 50px;           /* forma redondeada tipo cápsula */
  padding: 5px 10px;             /* espacio interno */
  border: 1.5px solid black;     /* 🔥 borde negro */
}

/* BOTONES + Y - */
.pill-btn {
  background: transparent;       /* sin fondo */
  border: none;                  /* sin borde */
  font-size: 20px;               /* tamaño del símbolo */
  font-weight: bold;
  padding: 5px 10px;             /* espacio clickeable */
  cursor: pointer;               /* mano al pasar */
  transition: 0.2s;              /* animación suave */
}

/* EFECTO HOVER */
.pill-btn:hover {
  background: rgba(0,0,0,0.1);   /* efecto gris al pasar */
  border-radius: 50%;            /* forma circular */
}

/* NÚMERO DEL CENTRO */
.pill-number {
  font-size: 18px;
  font-weight: bold;
  margin: 0 10px;                /* separación entre botones */
}

/* BOTÓN DESHABILITADO */
.pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
`}
</style>
    <div className="container mt-4">

      <h2>Tu Carrito</h2>

      {productosCarrito.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <div className="row">

          {productosCarrito.map((item, index) => (

            <div key={index} className="col-md-4 mb-4">

              <div className="card shadow">

                <img
                  src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/${item.producto?.imagen}`}
                  alt={item?.name}
                  className="w-100" // Hace que ocupe todo el ancho
                  style={{
                    height: "220px",       // Altura fija como en ListarProductos
                    objectFit: "contain",  // 🔥 CLAVE: muestra TODA la imagen (no la recorta)
                    background: "#fff",    // Fondo blanco para que no se vea feo si sobra espacio
                    padding: "15px",       // Espacio interno (como marco)
                    borderRadius: "15px"   // Bordes redondeados
                  }}
                />

                <div className="card-body">

                  <h5 className="card-title">{item.producto?.name}</h5>

                  <p className="card-text"><strong>Descripcion:</strong> {item.producto?.descripcion}</p>

                  <p><strong>Precio:</strong> Lps. {item.producto?.precio}</p>

              

                  <div className="d-flex align-items-center justify-content-between mt-3">

                    {/* CONTROL MODERNO */}
                    <div className="cantidad-pill">

                      {/* MENOS */}
                      <button
                        className="pill-btn"
                        onClick={() => reduzco(item.carrito_id, item.cantidad)}
                      >
                        −
                      </button>

                      {/* CANTIDAD */}
                      <span className="pill-number">
                        {item.cantidad}
                      </span>

                      {/* MÁS */}
                      <button
                        className="pill-btn"
                        onClick={() => aumento(item.carrito_id, item.cantidad)}
                      >
                        +
                      </button>

                    </div>

                    {/* BOTÓN ELIMINAR SEPARADO */}
                    <button
                      className="btn btn-danger"
                      onClick={() => eliminar(item.carrito_id)}
                    >
                      🗑️
                    </button>

                  </div>
                </div>

              </div>

            </div>

          ))}

        </div>
      )}


      <button className="btn btn-danger" onClick={() => vaciandoCarrito()}>
        Vaciar Carrito
      </button>


      {/* BOTON PAGAR */}
      <div className="mt-3">

        <button
          className="btn btn-success"
          onClick={() => {

            if (store.token) {

              // Si el usuario esta logueado
              navigate("/MetodoPago")

            } else {

              // Si es invitado
              navigate("/PagoInvitado")

            }

          }}
        >

          Pagar

        </button>

      </div>

    </div> 
    </>
  );
};

export default Carrito;