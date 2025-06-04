import React, { useEffect, useContext } from 'react';
import { Context } from '../store/appContext.jsx';

const ListarProductos = () => {
  const { store, actions } = useContext(Context);

  useEffect(() => {
    actions.getProductos(); // 👈 Llamás al action para obtener los productos
  }, []);

  return (
    <div className="container mt-4 ">
      <h2>Lista de Productos Disponibles</h2>

      <div className="row">
        {store.productos.length === 0 && <p>No hay productos para mostrar</p>}

        {store.productos.map((producto) => ( 

          <div key={producto.product_id} className="col-md-4 mb-4">
            <div className="card shadow">
              <img
                src={`https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/uploads/${producto.imagen}`}
                alt={producto.name}
                className="card-img-top"
                style={{
                  height: '200px',
                  width: '100%',
                  objectFit: 'cover',
                  borderTopLeftRadius: '0.5rem',
                  borderTopRightRadius: '0.5rem'
                }} />
              <div className="card-body">
                <h5 className="card-title"><strong>{producto.name}</strong></h5>
                <p className="card-text"><strong>Descripcion:</strong> {producto.descripcion}</p>
                <p className="card-text"><strong>Precio Lps.:</strong> {producto.precio}</p>
                <p className="card-text">Cantidad disponible: {producto.cantidad}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListarProductos;