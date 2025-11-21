import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";

export const HistorialPedidos = () => {
    const { store, actions } = useContext(Context);

    useEffect(() => {
        actions.getHistorialPedidos();
    }, []);

    return (
        <div className="container mt-5">
            <h3 className="text-center mb-4">Historial de Pedidos</h3>

            {store.historialPedidos.length === 0 ? (
                <p className="text-center">No tienes pedidos aún.</p>
            ) : (
                store.historialPedidos.map((pedido) => (
                    <div key={pedido.pedido_id} className="card mb-3 p-3 shadow-sm">
                        <h5>Pedido #{pedido.pedido_id}</h5>
                        <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
                        <p><strong>Total:</strong> ${pedido.total}</p>
                        <p><strong>Estado:</strong> {pedido.estado}</p>

                        <ul>
                            {pedido.items?.map((item, index) => (
                                <li key={index}>
                                    Producto ID: {item.product_id} — {item.cantidad} x ${item.precio_unitario}
                                </li>
                            ))}
                        </ul>

                        {pedido.pagos?.length > 0 && (
                            <div className="mt-2">
                                <h6>Pagos:</h6>
                                <ul>
                                    {pedido.pagos.map((pago, i) => (
                                        <li key={i}>
                                            Método: {pago.metodo} | Estado: {pago.estado} | Ref: {pago.referencia}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};
