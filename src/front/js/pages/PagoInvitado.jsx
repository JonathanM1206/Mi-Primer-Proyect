import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import carga from "../../../assets/loading.gif"
export const PagoInvitado = () => {
    const [loading, setLoading] = useState(false);
    const { actions } = useContext(Context); // obtenemos actions
    const navigate = useNavigate(); // hook para navegar

    const baseUrl = "https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/";

    const [formData, setFormData] = useState({
        name: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: ""
    });

    // actualizar inputs
    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    // -------------------------
    // REGISTRAR + LOGIN
    // -------------------------
    const registrarYLogin = async () => {

        try {

            const registrado = await actions.registroUsuario(
                formData.name,
                formData.correo,
                formData.telefono,
                formData.direccion,
                formData.password
            );

            if (!registrado) {
                throw new Error("No se pudo registrar el usuario");
            }

            await actions.loginUsuario(formData.correo, formData.password);

            return true;

        } catch (error) {

            swal("Error", error.message, "error");

            return false;

        }

    };

    // -------------------------
    // PAGO TRANSFERENCIA (CON CONFIRMACIÓN)
    // -------------------------
    const pagarTransferencia = async () => {
        if (loading) return; //Evita el doble click
        // 1. Mostrar mensaje explicativo antes de proceder
        const confirmar = await swal({
            title: "¿Confirmar pago por transferencia?",
            text: "Enviaremos su pedido al momento que recibamos la transferencia. Recibirá un correo con las Cuentas de Banco y deberá enviarnos una captura al WhatsApp para procesar su orden.",
            icon: "info",
            buttons: {
                cancel: "Cancelar",
                confirm: {
                    text: "Entendido, pagar",
                    value: true,
                    visible: true,
                    className: "btn-primary",
                    closeModal: true
                }
            },
        });

        // Si el usuario cancela, no hace nada
        if (!confirmar) return;
        setLoading(true) //Activa el Bloqueo del boton

        // 2. Proceder con el registro y login
        const ok = await registrarYLogin();
        if (!ok) {
            setLoading(false); // 🔥 APAGAS antes de salir 
            return;
        }

        // 3. Crear el pedido
        const pedido = await actions.crearPedido({
            total: 50, // Recuerda que aquí puedes pasar store.total si lo tienes
            direccion: formData.direccion
        });

        if (!pedido) {
            swal("Error", "No se pudo crear el pedido", "error");
            setLoading(false); // 🔥 IMPORTANTE
            return;
        }

        // 4. Registrar el método de pago en el backend
        try {
            const response = await fetch(`${baseUrl}api/pago/transferencia`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pedido_id: pedido.pedido_id
                })
            });

            if (!response.ok) {
                swal("Error", "No se pudo registrar el pago", "error");
                setLoading(false); // 🔥 FALTA ESTO
                return;
            }

            await actions.vaciarCarrito(); // limpiar carrito frontend

            // Mensaje final de éxito
            swal("¡Pedido en Espera!", "Revisa tu correo para los datos bancarios y recuerda enviar el comprobante por WhatsApp.", "success");

            navigate("/HistorialPedidos");

        } catch (error) {

            swal("Error", "Ocurrió un problema en la comunicación con el servidor", "error");
        } finally {
            setLoading(false); // <--- DESBLOQUEAR AL FINALIZAR
        }
    };
    //-------------------------
    // PAGO Al recibir
    // -------------------------
    const pagarContraEntrega = async () => {
        if (loading) return;

        setLoading(true); // <--- ACTIVAR BLOQUEO 
        try {
            const ok = await registrarYLogin();

            if (!ok) {
                setLoading(false); // 🔥 
                return;
            }

            const pedido = await actions.crearPedido({
                total: 50,
                direccion: formData.direccion
            });

            if (!pedido) {

                swal("Error", "No se pudo crear el pedido", "error");
                setLoading(false); // 🔥 FALTA ESTO
                return;

            }

            const response = await fetch(`${baseUrl}api/pago/contra_entrega`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    pedido_id: pedido.pedido_id
                })

            });

            if (!response.ok) {

                swal("Error", "No se pudo crear el pago", "error");
                setLoading(false); // 🔥 FALTA ESTO
                return;

            }

            await actions.vaciarCarrito();

            swal(
                "Pedido creado",
                "Pagarás cuando recibas el pedido. Recibirás tracking por WhatsApp.",
                "success"
            );

            navigate("/HistorialPedidos");
        } catch (error) {
            swal("Error", "Problema de conexión", "error");
        } finally {
            setLoading(false); // <--- DESBLOQUEAR
        }


    };

    return (

        <div className="container mt-5 my-5">

            <h3 className="text-center mb-4">Finaliza tu compra</h3>

            <form className="col-md-6 mx-auto">

                <input
                    type="text"
                    name="name"
                    placeholder="Nombre y Apellido"
                    className="form-control mb-3"
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="correo"
                    placeholder="Correo"
                    className="form-control mb-3"
                    onChange={handleChange}
                    required
                />

                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">+504</span>
                    <input
                        type="text"
                        name="telefono"
                        placeholder="Número de teléfono"
                        className="form-control"
                        onChange={handleChange}
                        value={formData.telefono}
                        required
                    />
                </div>

                <input
                    type="text"
                    name="direccion"
                        placeholder="Direccion Ej: Calle 10 #123, Colonia Centro, Tegucigalpa"
                    className="form-control mb-3"
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    className="form-control mb-4"
                    onChange={handleChange}
                    required
                />

                <div className="text-center">

                    <button
                        type="button"
                        className="btn btn-primary me-3"
                        onClick={pagarTransferencia}
                        disabled={loading} // <--- SE BLOQUEA AQUÍ
                    >
                        {loading ? "Procesando..." : "Pagar por Transferencia"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={pagarContraEntrega}
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

            </form>

        </div>

    );
};