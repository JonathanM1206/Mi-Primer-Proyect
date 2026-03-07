import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";
//LO QUE LE APARECE AL USUUARIO ESTA ES LA INFORMACION
export const HistorialPedidos = () => {

    const { store, actions } = useContext(Context);

    useEffect(() => {

        actions.getHistorialPedidos();
        actions.getProductos(); // obtener productos para mostrar nombres

    }, []);

    // Obtener nombre del producto usando el ID
    const getNombreProducto = (id) => {

        const producto = store.productos.find(p => p.producto_id === id);

        return producto ? producto.name : "Producto";

    };

    return (

        <div className="container mt-5">

            {/* ESTILOS NEOMORPHISM */}
            <style>

                {`

                .pedido-card{

                    background:#e6e6e6;

                    border-radius:20px;

                    padding:25px;

                    box-shadow:
                    8px 8px 16px #c5c5c5,
                    -8px -8px 16px #ffffff;

                    transition:all .3s ease;

                }

                .pedido-card:hover{

                    box-shadow:
                    4px 4px 10px #c5c5c5,
                    -4px -4px 10px #ffffff;

                }

                .pedido-header{

                    display:flex;

                    justify-content:space-between;

                    align-items:center;

                    margin-bottom:15px;

                }

                .estado{

                    padding:4px 12px;

                    border-radius:12px;

                    font-size:12px;

                    font-weight:bold;

                    text-transform:capitalize;

                }

                .pendiente{

                    background:#fff3cd;

                    color:#856404;

                }

                .producto-item{

                    background:#f3f3f3;

                    padding:10px;

                    border-radius:10px;

                    margin-bottom:10px;

                }

                .producto-nombre{

                    font-weight:bold;

                }

                .total{

                    font-size:18px;

                    font-weight:bold;

                    margin-top:10px;

                }

                `}

            </style>

            <h3 className="text-center mb-5">Historial de Pedidos</h3>

            {store.historialPedidos.length === 0 ? (

                <p className="text-center">No tienes pedidos aún.</p>

            ) : (

                <div className="row">

                    {store.historialPedidos.map((pedido) => {

                        // calcular total de productos
                        const totalProductos = pedido.items.reduce((acc, item) => {

                            return acc + (item.precio_unitario * item.cantidad)

                        }, 0);

                        return (

                            <div key={pedido.pedido_id} className="col-md-4 mb-4">

                                <div className="pedido-card">

                                    {/* HEADER */}

                                    <div className="pedido-header">

                                        <h5>Pedido #{pedido.pedido_id}</h5>

                                        <span className={`estado Lps. {pedido.estado}`}>
                                            {pedido.estado}
                                        </span>

                                    </div>

                                    {/* FECHA SIN HORA */}

                                    <p>

                                        <strong>Fecha:</strong>{" "}

                                        {new Date(pedido.fecha).toLocaleDateString()}

                                    </p>

                                    {/* INFORMACION DEL CLIENTE */}

                                    <div className="mt-2 mb-3">

                                        <p>
                                            <strong>Nombre:</strong> {pedido.usuario?.name || "Invitado"}
                                        </p>

                                        <p>
                                            <strong>Telefono:</strong> {pedido.usuario?.telefono || "No disponible"}
                                        </p>

                                        <p>
                                            <strong>Direccion de envio:</strong> {pedido.usuario?.direccion || "No disponible"}
                                        </p>

                                    </div>

                                    {/* PRODUCTOS */}

                                    <h6 className="mt-3">Productos</h6>

                                    {pedido.items.length === 0 ? (

                                        <p>No hay productos registrados</p>

                                    ) : (

                                        pedido.items.map((item, index) => {

                                            const subtotal = item.precio_unitario * item.cantidad;

                                            return (

                                                <div key={index} className="producto-item">

                                                    <div className="producto-nombre">

                                                        {getNombreProducto(item.product_id)}

                                                    </div>

                                                    <div>

                                                        Cantidad: {item.cantidad}

                                                    </div>

                                                    <div>

                                                        Precio unitario: Lps. {item.precio_unitario}

                                                    </div>

                                                    <div>

                                                        Subtotal: Lps. {subtotal}

                                                    </div>

                                                </div>

                                            )

                                        })

                                    )}

                                    {/* TOTAL */}

                                    <div className="total">

                                        Total productos: Lps. {totalProductos}

                                    </div>

                                    {/* PAGO */}

                                    {pedido.pagos?.length > 0 && (

                                        <div className="mt-3">

                                            <h6>Pago</h6>

                                            {pedido.pagos.map((pago, i) => (

                                                <div key={i}>

                                                    Metodo de Pago: {pago.metodo}

                                                    <br />

                                                    Estado: {pago.estado}

                                                </div>

                                            ))}

                                        </div>

                                    )}

                                </div>

                            </div>

                        )

                    })}

                </div>

            )}

        </div>

    );

};