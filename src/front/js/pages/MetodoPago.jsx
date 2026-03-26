import React, { useContext,useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import carga from "../../../assets/loading.gif"


export const MetodoPago = () => {
    const [loading, setLoading] = useState(false);

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
        if (loading) return; //Evita el doble click 
        setLoading(true); // <--- ACTIVAR BLOQUEO 
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

        } finally {
            setLoading(false); // <--- DESBLOQUEAR
        }


    };

    // -------------------------
    // Pagar al Recibir 
    // -------------------------
    const pagarAlEntregar = async () => {
        if (loading) return;
        setLoading(true); // <--- ACTIVAR BLOQUEO 
        try {

            const pedido = await actions.crearPedido({
                total: total,
                direccion: store.user.direccion
            });

            if (!pedido) {
                throw new Error("No se pudo crear el pedido");
            }

            const pago = await actions.pagarContraEntrega(pedido.pedido_id);

            if (!pago) {
                throw new Error("No se pudo crear el pago");
            }

            await actions.vaciarCarrito();

            swal(
                "Pedido creado",
                "Pagarás al recibir tu pedido. Recibirás el tracking por WhatsApp.",
                "success"
            );

            navigate("/HistorialPedidos");

        } catch (error) {

            console.log(error);
            swal("Error", "No se pudo procesar el pedido", "error");

        } finally {
            setLoading(false); // <--- DESBLOQUEAR
        }

    };

    return (

        <div className="container text-center mt-5">

            <h3 className="mb-4">Selecciona método de pago</h3>

            <button
                className="btn btn-primary me-3"
                onClick={pagarTransferencia}
                disabled={loading} // <--- SE BLOQUEA AQUÍ
            >
                {loading ? "Procesando..." : "Pagar por Transferencia"}
            </button>

            <button
                className="btn btn-success"
                onClick={pagarAlEntregar}
                disabled={loading} // <--- SE BLOQUEA AQUÍ
            >
                {loading ? "Enviando..." : "Pagar al recibir 💵"}
            </button>
            {/* SPINNER VISUAL */}
            {loading && (
                <div className='text-center mt-4'>
                    <img
                        src={carga}
                        alt="Cargando..."
                        style={{ width: "60px" }}
                    />
                    <p className="text-muted mt-2">Estamos procesando tu pedido, por favor no cierres esta ventana...</p>
                </div>
            )}


        </div>

    );

};