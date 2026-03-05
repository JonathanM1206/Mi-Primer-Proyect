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

  const productosCarrito = Array.isArray(store.carrito) ? store.carrito : [];

  return (
    <div className="container mt-4">

      <h2>Tu Carrito</h2>

      {store.carrito?.length === 0 ? (
        <p>No hay productos en el carrito.</p>
      ) : (
        <div className="row">

          {productosCarrito.map((item, index) => (

            <div key={index} className="col-md-4 mb-4">

              <div className="card shadow">

                <img
                  src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/${item.producto.imagen}`}
                  alt={item.name}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />

                <div className="card-body">

                  <h5 className="card-title">{item.producto.name}</h5>

                  <p className="card-text">{item.producto.descripcion}</p>

                  <p><strong>Precio:</strong> Lps. {item.producto.precio}</p>

                  <p><strong>Cantidad:</strong> {item.cantidad}</p>

                  <button className="btn btn-warning me-2" onClick={() => reduzco(item.carrito_id, item.cantidad)}>
                    <strong>-</strong>
                  </button>

                  <button className="btn btn-success me-2" onClick={() => aumento(item.carrito_id, item.cantidad)}>
                    <strong>+</strong>
                  </button>

                  <button className="btn btn-danger" onClick={() => eliminar(item.carrito_id)}>
                    <strong>🗑️</strong>
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )} 


      <button className="btn btn-danger" onClick={() => vaciandoCarrito()}>
        Vaciar Carrito
      </button>


      {/* BOTON PAGAR AGREGADO */}
      <div className="mt-3">

        <button
          className="btn btn-success"
          onClick={() => {

            if (store.token) {
              navigate("/HistorialPedidos")
            } else {
              navigate("/PagoInvitado")
            }

          }}
        >
          Pagar
        </button>

      </div>

    </div>
  );
};

export default Carrito;