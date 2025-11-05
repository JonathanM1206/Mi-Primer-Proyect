import React, { useEffect, useContext, useState } from 'react';
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert';
import { Link } from 'react-router-dom';

const ListarProductos = () => {
    const { store, actions } = useContext(Context);
    const [productToEdit, setProductToEdit] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [cantidades, setCantidades] = useState({});
    const [nuevaImagen, setNuevaImagen] = useState(null); // Para el archivo de imagen 
    const [timestamp, setTimestamp] = useState(Date.now());


    const handleCantidadChange = (e, productoId) => {
        const nuevaCantidad = parseInt(e.target.value) || 1;
        setCantidades({
            ...cantidades,
            [productoId]: nuevaCantidad
        });
    };

    const agregoProducto = async (productoId, cantidad = 1) => {
        console.log("Id", productoId)
        try {
            await actions.agregarProductoCarrito(productoId, cantidad)
            swal("Producto agregado", "Se ha agregado al carrito", "success");
        } catch (error) {
            swal("Error debe Loguearse", error.message || "No se pudo agregar", "error");
        }
    }

    const handleChange = (e) => {
        setProductToEdit({
            ...productToEdit,
            [e.target.name]: e.target.value
        });
    };

    // Nuevo handler para archivos de imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNuevaImagen(file);
    };

    const handleSubmit = async () => {
        try {
            // Pasar tanto el producto como la nueva imagen
            await actions.editarProducto(productToEdit, editingId, nuevaImagen);
            setEditingId(null);
            setNuevaImagen(null); // Limpiar la imagen seleccionada 

            await actions.getProductos();
            setTimestamp(Date.now());

            swal("Producto editado", "El producto ha sido editado correctamente", "success");
        } catch (error) {
            console.error("Error al editar el producto:", error);
            swal("Error", "No se pudo editar el producto", "error");
        }
    };

    const startEdit = (producto) => {
        setEditingId(producto.product_id);
        setProductToEdit({ ...producto });
        setNuevaImagen(null); // Limpiar cualquier imagen previa
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

                {store.productos.map((producto, index) => (
                    <div key={producto.product_id} className="col-md-4 mb-4">
                        <div className="card shadow">
                            <img
                                src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev${producto.imagen}?t=${timestamp}`}
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
                                        <input
                                            type="text"
                                            name="name"
                                            value={productToEdit.name}
                                            onChange={handleChange}
                                            className="form-control mb-2"
                                            placeholder="Nombre del producto"
                                        />
                                        <input
                                            type="text"
                                            name="descripcion"
                                            value={productToEdit.descripcion}
                                            onChange={handleChange}
                                            className="form-control mb-2"
                                            placeholder="Descripción"
                                        />
                                        <input
                                            type="number"
                                            name="precio"
                                            value={productToEdit.precio}
                                            onChange={handleChange}
                                            className="form-control mb-2"
                                            placeholder="Precio"
                                        />
                                        <input
                                            type="number"
                                            name="cantidad"
                                            value={productToEdit.cantidad}
                                            onChange={handleChange}
                                            className="form-control mb-2"
                                            placeholder="Cantidad"
                                        />
                                        {/* Campo para nueva imagen */}
                                        <div className="mb-2">
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
                                                    Nueva imagen seleccionada: {nuevaImagen.name}
                                                </small>
                                            )}
                                        </div>

                                        <button className="btn btn-success me-2" onClick={handleSubmit}>
                                            Guardar
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => setEditingId(null)}>
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Nombre:</strong> {producto.name}</p>
                                        <p><strong>Descripción:</strong> {producto.descripcion}</p>
                                        <p><strong>Precio Lps.:</strong> {producto.precio}</p>
                                        <p><strong>Unidades Disponibles:</strong> {producto.cantidad}</p>

                                        {/* Input cantidad y botón agregar */}
                                        <div className="d-flex align-items-center mb-3">
                                            <input
                                                type="number"
                                                min="1"
                                                value={cantidades[producto.product_id] || 1}
                                                onChange={(e) => handleCantidadChange(e, producto.product_id)}
                                                className="form-control me-2"
                                                style={{ width: "80px" }}
                                            />

                                            <button
                                                className="btn"
                                                style={{ background: "#00bfff" }}
                                                onClick={() =>
                                                    agregoProducto(producto.product_id, cantidades[producto.product_id] || 1)
                                                }
                                            >
                                                Agregar Carrito
                                            </button>
                                        </div>

                                        <div className="container mt-2">
                                            <div className="row">
                                                {/* Botón Ver Producto */}
                                                <div className="col-6 mb-2">
                                                    <Link
                                                        className='btn w-100'
                                                        style={{ background: "#2e8b57", color: "white" }}
                                                        to={`/DetalleProducto/${producto.product_id}`}
                                                    >
                                                        Ver Producto
                                                    </Link>
                                                </div>

                                                {/* Botones solo para admin */}
                                                {role === 'admin' && (
                                                    <>
                                                        <div className="col-6 mb-2">
                                                            <button className="btn btn-danger w-100" onClick={() => eliminar(producto.product_id)}>
                                                                Eliminar Producto
                                                            </button>
                                                        </div>

                                                        <div className="col-6 mb-2">
                                                            {editingId !== producto.product_id && (
                                                                <button className="btn btn-primary w-100" onClick={() => startEdit(producto)}>
                                                                    Editar Producto
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
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