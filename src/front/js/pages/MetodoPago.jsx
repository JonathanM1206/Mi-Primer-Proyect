import React, { useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";

export const MetodoPago = () => {

    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    const baseUrl = "https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/";

    // calcular total del carrito
    const total = store.carrito.reduce((acc, item) => {
        return acc + item.producto.precio * item.cantidad;
    }, 0);

    // -------------------------
    // TRANSFERENCIA
    // -------------------------
    const pagarTransferencia = async () => {

        try {

            const pedido = await actions.crearPedido({
                total: total,
                direccion: store.user.direccion
            });

            if (!pedido) {
                throw new Error("No se pudo crear el pedido");
            }

            const pago = await actions.pagarTransferencia(pedido.pedido_id);

            if (!pago) {
                throw new Error("No se pudo crear el pago");
            }

            // 🔹 LIMPIAR CARRITO
            await actions.vaciarCarrito();

            swal("Pedido creado", "Pago por transferencia generado", "success");

            navigate("/HistorialPedidos");

        } catch (error) {

            console.log(error);
            swal("Error", "No se pudo procesar el pago", "error");

        }

    };

    // -------------------------
    // TARJETA
    // -------------------------
    const pagarTarjeta = async () => {

        try {

            const pedido = await actions.crearPedido({
                total: total,
                direccion: store.user.direccion
            });

            if (!pedido) {
                throw new Error("No se pudo crear el pedido");
            }

            const response = await fetch(`${baseUrl}api/pago/pixelpay`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    pedido_id: pedido.pedido_id
                })

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            // 🔹 LIMPIAR CARRITO
            await actions.vaciarCarrito();

            window.location.href = data.pago_url;

        } catch (error) {

            console.log(error);
            swal("Error", "No se pudo iniciar el pago", "error");

        }

    };

    return (

        <div className="container text-center mt-5">

            <h3 className="mb-4">Selecciona método de pago</h3>

            <button
                className="btn btn-primary me-3"
                onClick={pagarTransferencia}
            >
                Pagar por Transferencia
            </button>

            <button
                className="btn btn-success"
                onClick={pagarTarjeta}
            >
                Pagar con Tarjeta
            </button>

        </div>

    );

};