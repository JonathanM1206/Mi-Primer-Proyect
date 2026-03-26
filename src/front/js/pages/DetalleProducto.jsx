import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert';

const DetalleProducto = () => {
    const { store, actions } = useContext(Context);
    const { id } = useParams();
    const navigate = useNavigate();

    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [editando, setEditando] = useState(false);
    const [productoEditado, setProductoEditado] = useState({});
    const [nuevasImagenes, setNuevasImagenes] = useState(null); // Para subir múltiples
    const [imagenActiva, setImagenActiva] = useState(null);

    // Determinar rol de forma segura
    const role = store.user?.role || store.admin?.role || null;
    const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev';

    const eliminarImagen = async (image_id) => {

        const confirmar = await swal({
            title: "¿Eliminar imagen?",
            icon: "warning",
            buttons: true
        })

        if (!confirmar) return

        try {

            await actions.eliminarImagenProducto(image_id)

            swal("Eliminada", "Imagen eliminada", "success")

            fetchProducto() // 🔥 recargar

        } catch (error) {
            swal("Error", "No se pudo eliminar", "error")
        }
    }

    const fetchProducto = async () => {
        try {
            const data = await actions.getProductoPorId(id);
            if (!data) throw new Error("Producto no encontrado");
            setProducto(data);
            if (data.imagenes && data.imagenes.length > 0) {
                setImagenActiva(data.imagenes[0].url);
            }
        } catch (error) {
            console.error("Error al obtener el producto:", error);
        }
    };

    useEffect(() => {
        fetchProducto();
    }, [id]);

    // Manejo de Carrito
    const agregarCarrito = async () => {
        try {
            await actions.agregarProductoCarrito(producto.product_id, cantidad);
            swal("¡Añadido!", `${producto.name} se agregó al carrito.`, "success");
        } catch (error) {
            swal("Error", "Debes iniciar sesión para comprar", "error");
        }
    };

    // Edición de Producto
    const iniciarEdicion = () => {
        setProductoEditado({ ...producto });
        setEditando(true);
    };

    const handleFileChange = (e) => {
        setNuevasImagenes(e.target.files); // Captura el FileList
    };

    const guardarCambios = async () => {
        try {
            // 1. Actualizar datos básicos
            await actions.editarProducto(productoEditado, producto.product_id);

            // 2. Si hay nuevas imágenes, subirlas usando la acción que proporcionaste
            if (nuevasImagenes && nuevasImagenes.length > 0) {
                await actions.agregarImagenesProducto(producto.product_id, nuevasImagenes);
            }

            swal("Actualizado", "El producto ha sido modificado con éxito", "success");
            setEditando(false);
            setNuevasImagenes(null);
            fetchProducto();
        } catch (error) {
            swal("Error", "No se pudieron guardar los cambios", "error");
        }
    };

    const eliminarProducto = async () => {
        const confirmar = await swal({
            title: "¿Eliminar producto?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        });

        if (confirmar) {
            const success = await actions.eliminarProducto(producto.product_id);
            if (success) {
                swal("Eliminado", "Producto borrado", "success");
                navigate("/ListarProductos");
            }
        }
    };

    if (!producto) return <div className="text-center mt-5">Cargando...</div>;

    return (
        <>
            <style>
                {`
                .zoom-container {
                    overflow: hidden;
                    border-radius: 15px;
                    background: #f8f9fa;
                    cursor: crosshair;
                    position: relative;
                    height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .zoom-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    transition: transform 0.4s ease-in-out;
                }

                .zoom-container:hover .zoom-image {
                    transform: scale(1.8); /* Ajusta el nivel de zoom aquí */
                }

                .mini-img {
                    width: 70px;
                    height: 70px;
                    object-fit: cover;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: 0.3s;
                }

                .mini-img.active {
                    border-color: #00bfff;
                }

                .mini-img:hover {
                    opacity: 0.8;
                    transform: translateY(-3px);
                }
                `}
            </style>

            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-10 bg-white p-4 shadow-sm rounded">
                        <div className="row">
                            {/* SECCIÓN IMÁGENES */}
                            <div className="col-md-6">
                                <div className="zoom-container shadow-sm border">
                                    <img
                                        src={`${baseUrl}${imagenActiva}`}
                                        alt={producto.name}
                                        className="zoom-image"
                                    />
                                </div>

                                <div className="d-flex mt-3 gap-2 flex-wrap">
                                    {producto.imagenes?.map((img, index) => (
                                        <div key={index} style={{ position: "relative", display: "inline-block" }}>

                                            <img
                                                src={`${baseUrl}${img.url}`}
                                                className={`mini-img ${imagenActiva === img.url ? 'active' : ''}`}
                                                onClick={() => setImagenActiva(img.url)}
                                                alt="miniatura"
                                            />

                                            {role === "admin" && (
                                                <button
                                                    onClick={() => eliminarImagen(img.image_id)}
                                                    style={{
                                                        position: "absolute",   // 🔥 clave
                                                        top: "0px",             // 🔥 ajusta aquí si quieres
                                                        right: "0px",
                                                        background: "red",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "50%",
                                                        width: "18px",
                                                        height: "18px",
                                                        fontSize: "10px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    x
                                                </button>
                                            )}

                                        </div>

                                    ))}
                                </div>
                            </div>

                            {/* SECCIÓN DETALLES */}
                            <div className="col-md-6">
                                {editando ? (
                                    <div className="p-3 border rounded">
                                        <h4 className="mb-3">Editar Detalles</h4>
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            value={productoEditado.name}
                                            onChange={(e) => setProductoEditado({ ...productoEditado, name: e.target.value })}
                                            placeholder="Nombre"
                                        />
                                        <textarea
                                            className="form-control mb-2"
                                            rows="3"
                                            value={productoEditado.descripcion}
                                            onChange={(e) => setProductoEditado({ ...productoEditado, descripcion: e.target.value })}
                                            placeholder="Descripción"
                                        />
                                        <div className="row mb-2">
                                            <div className="col">
                                                <input type="number" className="form-control" value={productoEditado.precio} onChange={(e) => setProductoEditado({ ...productoEditado, precio: e.target.value })} placeholder="Precio" />
                                            </div>
                                            <div className="col">
                                                <input type="number" className="form-control" value={productoEditado.cantidad} onChange={(e) => setProductoEditado({ ...productoEditado, cantidad: e.target.value })} placeholder="Stock" />
                                            </div>
                                        </div>

                                        <label className="form-label mt-2 small">Añadir más imágenes:</label>
                                        <input type="file" multiple className="form-control mb-3" onChange={handleFileChange} />

                                        <div className="d-flex gap-2">
                                            <button className="btn btn-success w-100" onClick={guardarCambios}>Guardar</button>
                                            <button className="btn btn-light w-100" onClick={() => setEditando(false)}>Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="ps-md-4">
                                        <h2 className="display-6 fw-bold">{producto.name}</h2>
                                        <h3 className="text-primary my-3">Lps. {parseFloat(producto.precio).toLocaleString()}</h3>
                                        <p className="text-muted">{producto.descripcion}</p>
                                        <p><strong>Disponibles:</strong> {producto.cantidad} unidades</p>

                                        <div className="d-flex align-items-center gap-3 mt-4">
                                            <input
                                                type="number"
                                                className="form-control text-center"
                                                style={{ width: "80px" }}
                                                value={cantidad}
                                                min="1"
                                                max={producto.cantidad}
                                                onChange={(e) => setCantidad(parseInt(e.target.value))}
                                            />
                                            <button className="btn btn-info text-white px-4 py-2" onClick={agregarCarrito}>
                                                <i className="fas fa-cart-plus me-2"></i>Añadir al Carrito
                                            </button>
                                        </div>

                                        {role === 'admin' && (
                                            <div className="mt-5 pt-4 border-top">
                                                <h6>Panel de Administrador</h6>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-outline-dark btn-sm" onClick={iniciarEdicion}>Editar Producto</button>
                                                    <button className="btn btn-outline-danger btn-sm" onClick={eliminarProducto}>Eliminar</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-5">
                            <Link to="/ListarProductos" className="text-decoration-none text-secondary">
                                <i className="fas fa-arrow-left me-2"></i>Volver a la tienda
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetalleProducto;