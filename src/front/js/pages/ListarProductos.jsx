import React, { useEffect, useContext, useState } from 'react';
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert';
import { Link } from 'react-router-dom';

const ListarProductos = () => {
    const { store, actions } = useContext(Context);

    const [productToEdit, setProductToEdit] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [cantidades, setCantidades] = useState({});
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [timestamp, setTimestamp] = useState(Date.now()); // Para forzar refresco de imagen

    // --- MANEJO DE ESTADOS Y FORMULARIOS ---

    const handleCantidadChange = (e, productoId) => {
        const nuevaCantidad = parseInt(e.target.value) || 1;
        setCantidades({
            ...cantidades,
            [productoId]: nuevaCantidad
        });
    };

    const handleChange = (e) => {
        setProductToEdit({
            ...productToEdit,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNuevaImagen(file);
    };

    // --- ACCIONES DEL COMPONENTE ---

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

    const handleSubmit = async () => {
        try {
            // Se envía el objeto editado, el ID y la nueva imagen (si existe)
            await actions.editarProducto(productToEdit, editingId, nuevaImagen);
            
            setEditingId(null);
            setNuevaImagen(null);
            
            // Refrescamos la lista y el timestamp para ver la nueva imagen de inmediato
            await actions.getProductos();
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
            await actions.eliminarProducto(product_id);
            swal("Producto eliminado", "El producto ha sido eliminado correctamente", "success");
        }
    };

    useEffect(() => {
        actions.getProductos();
        actions.getCategorias();
    }, []);

    // --- LÓGICA DE ROLES ---
    let admin = localStorage.getItem('role');
    let userRole = JSON.parse(localStorage.getItem('user'))?.role;
    let role = admin || userRole;

    return (
        <> 
        <style> 
            {` 
                .white-image {
                    height: 220px;
                    object-fit: contain; 
                    background: #fff;
                    padding: 15px;
                    border-radius: 15px;
                }
                .card-product {
                    transition: transform 0.2s;
                }
                .card-product:hover {
                    transform: translateY(-5px);
                }
            `}
        </style>

        <div className="container mt-4">
            <h2 className="mb-4">Lista de Productos Disponibles</h2>

            <div className="row">
                {store.productos.length === 0 && (
                    <div className="col-12">
                        <p className="alert alert-info">No hay productos para mostrar</p>
                    </div>
                )}

                {store.productos.map((producto) => (
                    <div key={producto.product_id} className="col-md-4 mb-4">
                        <div className="card shadow card-product">
                            <img
                                src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev${producto.imagen}?t=${timestamp}`}
                                alt={producto.name}
                                className="w-100 white-image"
                            />

                            <div className="card-body">
                                {editingId === producto.product_id ? (
                                    /* --- MODO EDICIÓN --- */
                                    <>
                                        <label className="small fw-bold">Nombre:</label>
                                        <input type="text" name="name" value={productToEdit.name} onChange={handleChange} className="form-control mb-2" />
                                        
                                        <label className="small fw-bold">Descripción:</label>
                                        <input type="text" name="descripcion" value={productToEdit.descripcion} onChange={handleChange} className="form-control mb-2" />
                                        
                                        <label className="small fw-bold">Precio (Lps):</label>
                                        <input type="number" name="precio" value={productToEdit.precio} onChange={handleChange} className="form-control mb-2" />
                                        
                                        <label className="small fw-bold">Stock:</label>
                                        <input type="number" name="cantidad" value={productToEdit.cantidad} onChange={handleChange} className="form-control mb-2" />
                                        
                                        <label className="small fw-bold">Cambiar Imagen:</label>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="form-control mb-2" />

                                        <div className="d-flex mt-3">
                                            <button className="btn btn-success flex-grow-1 me-2" onClick={handleSubmit}>Guardar</button>
                                            <button className="btn btn-secondary flex-grow-1" onClick={() => setEditingId(null)}>Cancelar</button>
                                        </div>
                                    </>
                                ) : (
                                    /* --- MODO VISTA --- */
                                    <>
                                        <h5 className="card-title"><strong>Nombre:</strong> {producto.name}</h5>
                                        <p className="card-text "><strong>Descripcion:</strong> {producto.descripcion}</p>
                                        <p className="mb-1"><strong>Precio:</strong> Lps. {producto.precio}</p>
                                        <p className="mb-1">
                                            <strong>Disponibles:</strong>{" "}
                                            {producto.cantidad === 0 
                                                ? <span className="badge bg-danger">Sin Stock</span> 
                                                : <span className="badge bg-success">{producto.cantidad} unidades</span>
                                            }
                                        </p>
                                        <p className="mb-3">
                                            <strong>Categoría:</strong>{" "}
                                            <span className="text-secondary">
                                                {store.categorias.find(cat => cat.categoria_id === producto.categoria_id)?.nombre || "Sin categoría"}
                                            </span>
                                        </p>

                                        {/* Acciones para Usuarios */}
                                        <div className="d-flex align-items-center mb-3">
                                            <input
                                                type="number"
                                                min="1"
                                                max={producto.cantidad}
                                                value={cantidades[producto.product_id] || 1}
                                                onChange={(e) => handleCantidadChange(e, producto.product_id)}
                                                className="form-control me-2"
                                                style={{ width: "70px" }}
                                            />
                                            <button
                                                className="btn flex-grow-1"
                                                style={{ background: "#00bfff", color: "white" }}
                                                disabled={producto.cantidad === 0}
                                                onClick={() => agregoProducto(producto.product_id, cantidades[producto.product_id] || 1)}
                                            >
                                                <i className="fas fa-cart-plus me-1"></i> Agregar
                                            </button>
                                        </div>

                                        <Link className='btn btn-outline-dark w-100 mb-2' to={`/DetalleProducto/${producto.product_id}`}>
                                            Ver Detalles
                                        </Link>

                                        {/* Acciones para Admin */}
                                        {role === 'admin' && (
                                            <div className="border-top pt-3 mt-3">
                                                <button className="btn btn-primary w-100 mb-2" onClick={() => startEdit(producto)}>
                                                    <i className="fas fa-edit me-1"></i> Editar Producto
                                                </button>
                                                <button className="btn btn-danger w-100 mb-2" onClick={() => eliminar(producto.product_id)}>
                                                    <i className="fas fa-trash me-1"></i> Eliminar
                                                </button>
                                                
                                                <label className="small fw-bold">Cambiar Categoría:</label>
                                                <select
                                                    className="form-select"
                                                    value={producto.categoria_id || ""}
                                                    onChange={(e) => actions.asignarCategoriaProducto(producto.product_id, e.target.value)}
                                                >
                                                    <option value="">Seleccionar categoría...</option>
                                                    {store.categorias?.map(cat => (
                                                        <option key={cat.categoria_id} value={cat.categoria_id}>
                                                            {cat.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </>
    );
};

export default ListarProductos;