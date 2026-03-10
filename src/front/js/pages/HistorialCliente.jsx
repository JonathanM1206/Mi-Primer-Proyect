import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useParams } from "react-router-dom";
//ESTE ES LO QUE LE APARECE AL ADMIN AL BUSCAR EL HISTORIAL DEL CLIENTE 
const HistorialCliente = () => {

    const { store, actions } = useContext(Context);

    const { id } = useParams();

    useEffect(() => {

        actions.getPedidosPorUsuario(id);

    }, []);


    return (

        <div className="container mt-5">

            <h2 className="mb-4 text-center">

                Historial del Cliente

            </h2>

            {store.historialPedidos.length === 0 ? (

                <p className="text-center">Este cliente no tiene pedidos</p>

            ) : (
                store.historialPedidos.map(pedido => {

                    const totalProductos = pedido.items.reduce((acc, item) => {

                        return acc + (item.precio_unitario * item.cantidad)

                    }, 0)

                    return (

                        <div key={pedido.pedido_id} className="card mb-4 shadow">

                            <div className="card-body">

                                <h5>Cliente: {pedido.usuario.name}</h5>

                                <p>Direccion: {pedido.usuario?.direccion}</p>

                                <p>Pedido #{pedido.pedido_id}</p>

                                <p>
                                    Fecha: {new Date(pedido.fecha).toLocaleDateString()}
                                    {" "}
                                    Hora: {new Date(pedido.fecha).toLocaleTimeString()}
                                </p>
                               
                                <p>

                                    Estado Envío:

                                    <span className={`badge ms-2 ${pedido.estado_envio === "preparando"
                                        ? "bg-primary"
                                        : pedido.estado_envio === "enviado"
                                            ? "bg-success"
                                            : pedido.estado_envio === "entregado"
                                                ? "bg-success"
                                                : "bg-secondary"
                                        }`}>

                                        {pedido.estado_envio}

                                    </span>

                                </p>

                                <hr />

                                <h6>Productos</h6>

                                {pedido.items.map((item, i) => {

                                    const subtotal = item.precio_unitario * item.cantidad

                                    return (

                                        <div key={i}>

                                            <strong>{item.nombre}</strong>

                                            <br />

                                            Cantidad: {item.cantidad}

                                            <br />

                                            Precio: Lps {item.precio_unitario}

                                            <br />

                                            Subtotal: Lps {subtotal}

                                            <hr />

                                        </div>

                                    )

                                })}

                                <h6>Total productos: Lps {totalProductos}</h6>

                                {pedido.pagos?.length > 0 && (

                                    <div>

                                        <h6>Pago</h6>

                                        {pedido.pagos.map((pago, i) => (

                                            <div key={i}>

                                                Metodo: {pago.metodo}

                                                <br />

                                                Estado:  
                                                <span className={`badge ${pago?.estado ==="pagado" 
                                                    ?"bg-success" 
                                                    :pago.estado === "cancelado" 
                                                    ?"bg-danger" 
                                                    :"bg-warning" 
                                                }`}> 
                                                    {pago?.estado}
                                                </span>
                                            

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        </div>

                    )

                })
            )}

        </div>

    )

}

export default HistorialCliente