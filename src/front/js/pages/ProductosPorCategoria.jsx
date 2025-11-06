import React, { useEffect, useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert';

const ProductosPorCategoria = () => {
    const { store, actions } = useContext(Context);
    const { categoriaId } = useParams();
    const [cantidades, setCantidades] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [timestamp, setTimestamp] = useState(Date.now());

    useEffect(() => {
        if (categoriaId) {
            actions.getProductosPorCategoria(categoriaId); 
              actions.getCategoriaPorId(categoriaId); 
        }
    }, [categoriaId]);

    const productos = store.productosPorCategoria || [];

    const handleCantidadChange = (e, productoId) => {
        const nuevaCantidad = parseInt(e.target.value) || 1;
        setCantidades({ ...cantidades, [productoId]: nuevaCantidad });
    };

    const agregoProducto = async (productoId, cantidad = 1) => {
        try {
            await actions.agregarProductoCarrito(productoId, cantidad);
            swal("Producto agregado", "Se ha agregado al carrito", "success");
        } catch (error) {
            swal("Error", error.message || "No se pudo agregar", "error");
        }
    };

    const startEdit = (producto) => {
        setEditingId(producto.product_id);
        setProductToEdit({ ...producto });
        setNuevaImagen(null);
    };

    const handleChange = (e) => {
        setProductToEdit({
            ...productToEdit,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        setNuevaImagen(e.target.files[0]);
    };

    const handleSubmit = async () => {
        try {
            await actions.editarProducto(productToEdit, editingId, nuevaImagen);
            setEditingId(null);
            setNuevaImagen(null);
            actions.getProductosPorCategoria(categoriaId);
            setTimestamp(Date.now());
            swal("Producto editado", "El producto ha sido editado correctamente", "success");
        } catch (error) {
            swal("Error", "No se pudo editar el producto", "error");
        }
    };

    const eliminar = async (product_id) => {
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
                actions.getProductosPorCategoria(categoriaId);
                swal("Producto eliminado", "El producto ha sido eliminado correctamente", "success");
            } catch (error) {
                swal("Error", "No se pudo eliminar el producto", "error");
            }
        }
    };

    const role = store.user?.role || store.admin?.role;

    return (
        <div className="container mt-4">
            <h2>Productos  {store.cat?.nombre || "..."}</h2>

            {store.message && <div className="alert alert-warning mt-3">{store.message}</div>}

            {productos.length === 0 ? (
                <p className="mt-3">No hay productos en esta categoría.</p>
            ) : (
                <div className="row mt-3">
                    {productos.map(producto => (
                        <div key={producto.product_id} className="col-md-4 mb-4">
                            <div className="card shadow">
                                <img
                                    src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev${producto.imagen}?t=${timestamp}`}
                                    alt={producto.name}
                                    className="card-img-top"
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    {editingId === producto.product_id ? (
                                        <>
                                            <input type="text" name="name" value={productToEdit.name} onChange={handleChange} className="form-control mb-2" />
                                            <input type="text" name="descripcion" value={productToEdit.descripcion} onChange={handleChange} className="form-control mb-2" />
                                            <input type="number" name="precio" value={productToEdit.precio} onChange={handleChange} className="form-control mb-2" />
                                            <input type="number" name="cantidad" value={productToEdit.cantidad} onChange={handleChange} className="form-control mb-2" />
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="form-control mb-2" />
                                            <button className="btn btn-success me-2" onClick={handleSubmit}>Guardar</button>
                                            <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                                        </>
                                    ) : (
                                        <>
                                            <p><strong>Nombre:</strong> {producto.name}</p>
                                            <p><strong>Descripción:</strong> {producto.descripcion}</p>
                                            <p><strong>Precio:</strong> {producto.precio}</p>
                                            <p><strong>Disponibles:</strong> {producto.cantidad}</p>

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
                                                    style={{ background: "#00bfff", color: "white" }}
                                                    onClick={() => agregoProducto(producto.product_id, cantidades[producto.product_id] || 1)}
                                                >
                                                    Agregar Carrito
                                                </button>
                                            </div>

                                            <div className="row">
                                                <div className="col-6 mb-2">
                                                    <Link to={`/DetalleProducto/${producto.product_id}`} className="btn btn-success w-100">Ver Producto</Link>
                                                </div>
                                                {role === 'admin' && (
                                                    <>
                                                        <div className="col-6 mb-2">
                                                            <button className="btn btn-danger w-100" onClick={() => eliminar(producto.product_id)}>Eliminar</button>
                                                        </div>
                                                        <div className="col-6 mb-2">
                                                            <button className="btn btn-primary w-100" onClick={() => startEdit(producto)}>Editar</button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductosPorCategoria;
