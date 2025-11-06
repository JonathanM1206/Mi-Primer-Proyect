import React, { useState, useEffect, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Context } from '../store/appContext.jsx'
import swal from 'sweetalert'

const DetalleProducto = () => {
  const { store, actions } = useContext(Context);
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [editando, setEditando] = useState(false);
  const [productoEditado, setProductoEditado] = useState({});
  const [nuevaImagen, setNuevaImagen] = useState(null);

  // Detectar el rol
  let admin = localStorage.getItem('role');
  let user = JSON.parse(localStorage.getItem('user'))?.role;
  let role = admin || user;

  const fetchProducto = async () => {
    try {
      const data = await actions.getProductoPorId(id);
      if (!data) throw new Error("Producto no encontrado");
      setProducto(data);
    } catch (error) {
      console.error("Error al obtener el producto:", error);
    }
  };

  useEffect(() => {
    fetchProducto();
  }, [id]);

  // Agregar al carrito
  const handleCantidadChange = (e) => {
    const nuevaCantidad = parseInt(e.target.value) || 1;
    setCantidad(nuevaCantidad);
  };

  const agregarCarrito = async () => {
    try {
      await actions.agregarProductoCarrito(producto.product_id, cantidad);
      swal("Producto agregado", "Se ha agregado al carrito", "success");
    } catch (error) {
      swal("Error", "Debe iniciar sesión para agregar productos", "error");
    }
  };

  // Eliminar producto (solo admin)
  const eliminarProducto = async () => {
    const confirmar = await swal({
      title: "¿Estás seguro?",
      text: "¡No podrás deshacer esta acción!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (confirmar) {
      try {
        await actions.eliminarProducto(producto.product_id);
        swal("Producto eliminado", "El producto ha sido eliminado correctamente", "success");
      } catch (error) {
        swal("Error", "No se pudo eliminar el producto", "error");
      }
    }
  };

  // Editar producto
  const iniciarEdicion = () => {
    setProductoEditado({ ...producto });
    setEditando(true);
  };

  const handleChange = (e) => {
    setProductoEditado({
      ...productoEditado,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNuevaImagen(file);
  };

  const guardarCambios = async () => {
    try {
      await actions.editarProducto(productoEditado, producto.product_id, nuevaImagen);
      swal("Éxito", "El producto ha sido actualizado correctamente", "success");
      setEditando(false);
      setNuevaImagen(null);
      fetchProducto(); // recargar datos actualizados
    } catch (error) {
      console.error("Error al editar:", error);
      swal("Error", "No se pudo editar el producto", "error");
    }
  };

  if (!producto) {
    return <div className="text-center mt-5">Cargando producto...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="card mx-auto shadow" style={{ maxWidth: "600px" }}>
        <img
          src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev${producto.imagen}`}
          alt={producto.name}
          className="card-img-top"
          style={{ height: '300px', objectFit: 'cover' }}
        />
        <div className="card-body">
          <h3 className="card-title text-center mb-3">Detalle del Producto</h3>

          {/* Si está editando */}
          {editando ? (
            <>
              <input
                type="text"
                name="name"
                value={productoEditado.name}
                onChange={handleChange}
                className="form-control mb-2"
                placeholder="Nombre del producto"
              />

              <textarea
                name="descripcion"
                value={productoEditado.descripcion}
                onChange={handleChange}
                className="form-control mb-2"
                placeholder="Descripción"
              ></textarea>

              <input
                type="number"
                name="precio"
                value={productoEditado.precio}
                onChange={handleChange}
                className="form-control mb-2"
                placeholder="Precio"
              />

              <input
                type="number"
                name="cantidad"
                value={productoEditado.cantidad}
                onChange={handleChange}
                className="form-control mb-3"
                placeholder="Cantidad"
              />

              {/* Imagen nueva (opcional) */}
              <div className="mb-3">
                <label className="form-label">
                  <small>Cambiar imagen (opcional):</small>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control"
                />
                {nuevaImagen && (
                  <small className="text-success">
                    Imagen seleccionada: {nuevaImagen.name}
                  </small>
                )}
              </div>

              <button className="btn btn-success me-2" onClick={guardarCambios}>
                Guardar cambios
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <p><strong>Nombre:</strong> {producto.name}</p>
              <p><strong>Descripción:</strong> {producto.descripcion}</p>
              <p><strong>Precio:</strong> Lps. {producto.precio}</p>
              <p><strong>Stock:</strong> {producto.cantidad}</p>

              {/* Agregar al carrito */}
              <div className="d-flex align-items-center mb-3">
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={handleCantidadChange}
                  className="form-control me-2"
                  style={{ width: "100px" }}
                />
                <button
                  className="btn text-white"
                  style={{ background: "#00bfff" }}
                  onClick={agregarCarrito}
                >
                  Agregar al Carrito
                </button>
              </div>

              {/* Botones solo para admin */}
              {role === 'admin' && (
                <div className="d-flex flex-column gap-2 mt-3">
                  <button className="btn btn-primary" onClick={iniciarEdicion}>
                    Editar Producto
                  </button>
                  <button className="btn btn-danger" onClick={eliminarProducto}>
                    Eliminar Producto
                  </button>
                </div>
              )}
            </>
          )}

          {/* Botón volver */}
          <div className="mt-4 text-center">
            <Link to="/ListarProductos" className="btn btn-secondary">
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleProducto;
