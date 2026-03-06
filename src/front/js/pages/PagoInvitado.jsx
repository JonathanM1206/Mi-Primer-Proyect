import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";

export const PagoInvitado = () => {

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

        const registrado = await actions.registroUsuario(
            formData.name,
            formData.correo,
            formData.telefono,
            formData.direccion,
            formData.password
        );

        if (!registrado) {

            swal("Error", "No se pudo registrar el usuario", "error");
            return false;

        }

        await actions.loginUsuario(formData.correo, formData.password);

        return true;
    };

    // -------------------------
    // PAGO TRANSFERENCIA
    // -------------------------
    const pagarTransferencia = async () => {

        const ok = await registrarYLogin();

        if (!ok) return;

        const pedido = await actions.crearPedido({
            total: 50,
            direccion: formData.direccion
        });

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

            swal("Error", "No se pudo crear el pago", "error");
            return;

        }

        // 🔹 LIMPIAR CARRITO
        await actions.vaciarCarrito();

        swal("Pedido creado", "Pago por transferencia generado", "success");

        navigate("/HistorialPedidos");

    };

    // -------------------------
    // PAGO TARJETA
    // -------------------------
    const pagarTarjeta = async () => {

        const ok = await registrarYLogin();

        if (!ok) return;

        const pedido = await actions.crearPedido({
            total: 50,
            direccion: formData.direccion
        });

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

            swal("Error", "No se pudo iniciar el pago", "error");
            return;

        }

        // 🔹 LIMPIAR CARRITO
        await actions.vaciarCarrito();

        window.location.href = data.pago_url;

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

                <input
                    type="text"
                    name="telefono"
                    placeholder="Telefono"
                    className="form-control mb-3"
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="direccion"
                    placeholder="Direccion"
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
                    >
                        Pagar por Transferencia
                    </button>

                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={pagarTarjeta}
                    >
                        Pagar con Tarjeta
                    </button>

                </div>

            </form>

        </div>

    );
};