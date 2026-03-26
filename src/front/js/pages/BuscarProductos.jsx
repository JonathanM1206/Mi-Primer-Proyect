import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import carga from "../../../assets/loading.gif";

const BuscarProductos = () => {

    const { store, actions } = useContext(Context);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get("query");

    const [timestamp, setTimestamp] = useState(Date.now());

    const [productToEdit, setProductToEdit] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [cantidades, setCantidades] = useState({});
    const [nuevaImagen, setNuevaImagen] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const realizarBusqueda = async () => {

            if (query) {

                setLoading(true);

                await actions.buscarProductos(query);

                setLoading(false);

            }

        };

        realizarBusqueda();

    }, [query]);



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

            swal("Error debe Loguearse", error.message || "No se pudo agregar", "error");

        }

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

        await actions.editarProducto(productToEdit, editingId, nuevaImagen);

        setEditingId(null);

        setNuevaImagen(null);

        await actions.buscarProductos(query);

        setTimestamp(Date.now());

        swal("Producto editado", "El producto ha sido editado correctamente", "success");

    };



    const startEdit = (producto) => {

        setEditingId(producto.product_id);

        setProductToEdit({ ...producto });

        setNuevaImagen(null);

    };



    const eliminarProducto = async (product_id) => {

        const confirmar = await swal({
            title: "¿Estás seguro?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        });

        if (confirmar) {

            await actions.eliminarProducto(product_id);

            swal("Producto eliminado", "El producto ha sido eliminado correctamente", "success");

            actions.buscarProductos(query);

        }

    };



    let admin = localStorage.getItem("role");
    let user = JSON.parse(localStorage.getItem("user"))?.role;
    let role = admin || user;



    return (

        <div className="container mt-4">

            <h3 className="mb-4">Resultados para: {query}</h3>



            {loading && (

                <div className="text-center my-5">

                    <img src={carga} alt="Buscando..." width="120" />

                    <p>Buscando productos...</p>

                </div>

            )}



            {!loading && store.productosBuscados.length === 0 && (

                <div className="alert alert-warning text-center">

                    No se encontraron productos para "{query}"

                    <br /><br />

                    <button className="btn btn-primary" onClick={() => navigate(-1)}>

                        Volver

                    </button>

                </div>

            )}



            <div className="row">

                {store.productosBuscados.map((producto) => (

                    <div key={producto.product_id} className="col-md-4 mb-4">

                        <div className="card shadow">

                            <img
                                src={`https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev${producto.imagen}?t=${timestamp}`}
                                alt={producto.name}
                                className="w-100" // Hace que ocupe todo el ancho
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
                                                style={{ background: "#00bfff" }}
                                                onClick={() =>
                                                    agregoProducto(producto.product_id, cantidades[producto.product_id] || 1)
                                                }
                                            >
                                                Agregar Carrito
                                            </button>

                                        </div>



                                        <Link
                                            className="btn w-100 mb-2"
                                            style={{ background: "#2e8b57", color: "white" }}
                                            to={`/DetalleProducto/${producto.product_id}`}
                                        >
                                            Ver Producto
                                        </Link>



                                        {role === "admin" && (

                                            <>

                                                <button
                                                    className="btn btn-danger w-100 mb-2"
                                                    onClick={() => eliminarProducto(producto.product_id)}
                                                >
                                                    Eliminar Producto
                                                </button>



                                                <button
                                                    className="btn btn-primary w-100 mb-2"
                                                    onClick={() => startEdit(producto)}
                                                >
                                                    Editar Producto
                                                </button>



                                                <select
                                                    className="form-select"
                                                    value={producto.categoria_id || ""}
                                                    onChange={(e) =>
                                                        actions.asignarCategoriaProducto(
                                                            producto.product_id,
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="">Sin categoria</option>

                                                    {store.categorias?.map(cat => (

                                                        <option key={cat.categoria_id} value={cat.categoria_id}>

                                                            {cat.nombre}

                                                        </option>

                                                    ))}

                                                </select>

                                            </>

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

export default BuscarProductos;