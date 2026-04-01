import React, { useEffect, useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert';
import carga from "../../../assets/loading.gif"



const ProductosPorCategoria = () => {

    const { store, actions } = useContext(Context);
    const { categoriaId } = useParams();

    const [cantidades, setCantidades] = useState({});
    const [timestamp, setTimestamp] = useState(Date.now());

    const [loadingProducto, setLoadingProducto] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setLoading(true);
                await actions.getProductosPorCategoria(categoriaId);
                await actions.getCategoriaPorId(categoriaId);
                setError(null);
            } catch (error) {
                setError("Error al cargar los productos");
            } finally {
                setLoading(false);

            }
        }
        cargarProductos()

    }, [categoriaId]);

    //Sino carga los Productops muestra una ruedita de carga ; 
    if (loading) {
        return (
            <div className="text-center mt-5">
                <img src={carga} alt="Cargando..." style={{ width: "150px" }} />
                <p>Cargando productos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-5 text-danger">
                <h4>{error}</h4>
            </div>
        );
    }

    if (!loading && store.productos.length === 0) {
        return (
            <div className="text-center mt-5">
                <h4>No hay productos registrados</h4>
            </div>
        );
    }


    const productos = store.productosPorCategoria || [];

    const handleCantidadChange = (e, productoId) => {

        const nuevaCantidad = parseInt(e.target.value) || 1;

        setCantidades({
            ...cantidades,
            [productoId]: nuevaCantidad
        });

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

        const file = e.target.files[0];
        setNuevaImagen(file);

    };

    const handleSubmit = async () => {

        try {

            await actions.editarProducto(productToEdit, editingId, nuevaImagen);

            setEditingId(null);
            setNuevaImagen(null);

            await actions.getProductosPorCategoria(categoriaId);

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

            actions.getProductosPorCategoria(categoriaId);

            swal("Producto eliminado", "El producto ha sido eliminado correctamente", "success");

        }

    };

    const role = store.user?.role || store.admin?.role;

    return (

        <div className="container mt-4">

            <h2>Productos {store.cat?.nombre}</h2>

            {productos.length === 0 ? (

                <p>No hay productos en esta categoría.</p>

            ) : (

                <div className="row mt-3">

                    {productos.map(producto => (

                        <div key={producto.product_id} className="col-md-4 mb-4">

                            <div className="card shadow">

                                <img
                                    src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev${producto.imagen}?t=${timestamp}`}
                                    alt={producto.name}
                                    className="card-img-top"
                                    style={{
                                        height: "220px",       // Altura fija como en ListarProductos
                                        objectFit: "contain",  // 🔥 CLAVE: muestra TODA la imagen (no la recorta)
                                        background: "#fff",    // Fondo blanco para que no se vea feo si sobra espacio
                                        padding: "15px",       // Espacio interno (como marco)
                                        borderRadius: "15px"   // Bordes redondeados
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
                                            />

                                            <input
                                                type="text"
                                                name="descripcion"
                                                value={productToEdit.descripcion}
                                                onChange={handleChange}
                                                className="form-control mb-2"
                                            />

                                            <input
                                                type="number"
                                                name="precio"
                                                value={productToEdit.precio}
                                                onChange={handleChange}
                                                className="form-control mb-2"
                                            />

                                            <input
                                                type="number"
                                                name="cantidad"
                                                value={productToEdit.cantidad}
                                                onChange={handleChange}
                                                className="form-control mb-2"
                                            />

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="form-control mb-2"
                                            />

                                            <button
                                                className="btn btn-success me-2"
                                                onClick={handleSubmit}
                                            >
                                                Guardar
                                            </button>

                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => setEditingId(null)}
                                            >
                                                Cancelar
                                            </button>

                                        </>

                                    ) : (

                                        <>

                                            <p><strong>Nombre:</strong> {producto.name}</p>
                                            <p><strong>Descripción:</strong> {producto.descripcion}</p>
                                            <p><strong>Precio: </strong>Lps. {producto.precio}</p>
                                            <p>
                                                <strong>Disponibles:</strong>{" "}
                                                {
                                                    producto.cantidad === 0
                                                        ? <span style={{ color: "red", fontWeight: "bold" }}>Sin Stock</span>
                                                        : producto.cantidad
                                                }
                                            </p>

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
                                                    onClick={() =>
                                                        agregoProducto(producto.product_id, cantidades[producto.product_id] || 1)
                                                    }
                                                >
                                                    Agregar Carrito
                                                </button>

                                            </div>

                                            <Link
                                                to={`/DetalleProducto/${producto.product_id}`}
                                                className="btn btn-success w-100 mb-2"
                                            >
                                                Ver Producto
                                            </Link>

                                            {role === 'admin' && (

                                                <>

                                                    <button
                                                        className="btn btn-danger w-100 mb-2"
                                                        onClick={() => eliminar(producto.product_id)}
                                                    >
                                                        Eliminar
                                                    </button>

                                                    <button
                                                        className="btn btn-primary w-100 mb-2"
                                                        onClick={() => startEdit(producto)}
                                                    >
                                                        Editar Producto
                                                    </button>

                                                    <button
                                                        className="btn btn-warning w-100"
                                                        disabled={loadingProducto === producto.product_id}
                                                        onClick={async () => {

                                                            try {

                                                                setLoadingProducto(producto.product_id);

                                                                await actions.quitarCategoriaProducto(producto.product_id);

                                                                await actions.getProductosPorCategoria(categoriaId);

                                                                swal("Correcto", "Eliminado de categoría correctamente", "success");

                                                            } catch (error) {

                                                                swal("Error", "No se pudo eliminar la categoría", "error");

                                                            } finally {

                                                                setLoadingProducto(null);

                                                            }

                                                        }}
                                                    >

                                                        {loadingProducto === producto.product_id
                                                            ? "Quitando..."
                                                            : "Quitar Categoria"}

                                                    </button>

                                                </>

                                            )}

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