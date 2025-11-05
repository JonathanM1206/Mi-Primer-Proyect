import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Context } from '../store/appContext.jsx'

const DetalleProducto = () => {
  const { store, actions } = useContext(Context);
  const { id } = useParams(); // Obtenemos el ID del producto desde la URL 
  const [producto, setProducto] = useState(null);

  const fetchProducto = async () => {
    try {
      const data = await actions.getProductoPorId(id);
      if (!data) {
        throw new Error("Producto no encontrado");
      }
      setProducto(data);
    } catch (error) {
      console.error("Error al obtener el producto:", error);
    }
  };

  useEffect(() => {
    fetchProducto(); // Llamamos a la función para obtener el producto al cargar el componente
  }, [id])

  if (!producto) {
    return <div>Cargando producto...</div>; // Mostramos un mensaje de carga mientras obtenemos el producto
  }

  return (
    <div className='Container'>
      <div className='justify-content-center align-items-center d-flex flex-column' style={{width: '100%', marginLeft:'70px'}}>
      <h1>Detalle del Producto</h1>
      <div className='card mb-3'>
        <img
          src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev${producto.imagen}`}
          alt={producto.name}
          className="card-img-top"
          style={{ width: '100%', height: '300px' }}/> 
          <div className='card-body'>
          <h5 className='card-title'>Nombre: {producto.name}</h5>
          <p className='card-text'>Descripción: {producto.descripcion}</p>
          <p className='card-text'>Precio: ${producto.precio}</p>
          <p className='card-text'>Stock: {producto.cantidad}</p>
        </div>



      </div> 
      </div>
    </div>
  )
}

export default DetalleProducto