import React, { useEffect, useContext, useState } from 'react';
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert';

const ListarProductos = () => {
  const { store, actions } = useContext(Context);
  const [productToEdit, setProductToEdit] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setProductToEdit({
      ...productToEdit,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      await actions.editarProducto(productToEdit, editingId); 

      setEditingId(null); // Salimos del modo edición 
      await actions.getProductos(); // Actualizamos la lista de productos 
      swal("Producto editado", "El producto ha sido editado correctamente", "success");
    } catch (error) {
      console.error("Error al editar el producto:", error); 
      swal("Error", "No se pudo editar el producto", "error");
    }
  };

  const startEdit = (producto) => {
    setEditingId(producto.product_id);
    setProductToEdit({ ...producto });
  };

  const eliminar = async (product_id) => {
    if (!product_id || isNaN(product_id)) {
      console.error("ID de producto inválido", product_id);
      return;
    }

    const confirmar = await swal({
      title: "¿Estás seguro?",
      text: "¡No podrás deshacer esta acción!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (confirmar) {
      try {
        await actions.eliminarProducto(product_id);
        swal("Producto eliminado", "El producto ha sido eliminado correctamente", "success");
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        swal("Error", "No se pudo eliminar el producto", "error");
      }
    }
  }; 

  useEffect(() => {
    actions.getProductos();
  }, []);

  let admin = localStorage.getItem('role');
  let user = JSON.parse(localStorage.getItem('user'))?.role;
  let role = admin || user;

  return (
    <div className="container mt-4">
      <h2>Lista de Productos Disponibles</h2>
      <div className="row">
        {store.productos.length === 0 && <p>No hay productos para mostrar</p>}

        {store.productos.map((producto) => (
          <div key={producto.product_id} className="col-md-4 mb-4">
            <div className="card shadow">
              <img
                src={`https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/${producto.imagen}`}
                alt={producto.name}
                className="card-img-top"
                style={{
                  height: '200px',
                  width: '100%',
                  objectFit: 'cover',
                  borderTopLeftRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem'
                }}
              />
              <div className="card-body">
                {editingId === producto.product_id ? (
                  <>
                    <input type="text" name="name" value={productToEdit.name} onChange={handleChange} className="form-control mb-2" />
                    <input type="text" name="descripcion" value={productToEdit.descripcion} onChange={handleChange} className="form-control mb-2" />
                    <input type="number" name="precio" value={productToEdit.precio} onChange={handleChange} className="form-control mb-2" />
                    <input type="number" name="cantidad" value={productToEdit.cantidad} onChange={handleChange} className="form-control mb-2" />
                    <button className="btn btn-success me-2" onClick={handleSubmit}>Guardar</button>
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <p><strong>Nombre:</strong> {producto.name}</p>
                    <p><strong>Descripción:</strong> {producto.descripcion}</p>
                    <p><strong>Precio Lps.:</strong> {producto.precio}</p>
                    <p><strong>Cantidad disponible:</strong> {producto.cantidad}</p>
                  </>
                )}

                {role === 'admin' && (
                  <>
                    <button className="btn btn-danger me-2" onClick={() => eliminar(producto.product_id)}>
                      Eliminar Producto
                    </button>
                    {editingId !== producto.product_id && (
                      <button className="btn btn-primary" onClick={() => startEdit(producto)}>
                        Editar Producto
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListarProductos;
