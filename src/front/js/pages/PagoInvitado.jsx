import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";

export const PagoInvitado = () => {

    const { actions, store } = useContext(Context);
    const navigate = useNavigate();

    const baseUrl = "https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/";

    const [usuarioCreado, setUsuarioCreado] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const registrado = await actions.registrarInvitado(formData);

        if (!registrado) {
            swal("Error", "No se pudo registrar el usuario", "error");
            return;
        }

        swal("Usuario creado", "Ahora selecciona método de pago", "success");

        setUsuarioCreado(true);
    };

    // -------------------------
    // TRANSFERENCIA
    // -------------------------
    const pagarTransferencia = async () => {

        const pedidoCreado = await actions.crearPedido({
            total: 50,
            direccion: formData.direccion
        });

        const pedido = store.pedidoActual;

        await fetch(`${baseUrl}api/pago/transferencia`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pedido_id: pedido.pedido_id
            })
        });

        navigate("/historial");
    };

    // -------------------------
    // TARJETA PIXELPAY
    // -------------------------
    const pagarTarjeta = async () => {

        const pedidoCreado = await actions.crearPedido({
            total: 50,
            direccion: formData.direccion
        });

        const pedido = store.pedidoActual;

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

        window.location.href = data.pago_url;
    };

    return (

        <div className="container mt-5 my-5" >

            <h3 className="text-center mb-4">Finaliza tu compra</h3>

            {!usuarioCreado ? (

                <form className="col-md-6 mx-auto" onSubmit={handleSubmit}>

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
                        className="form-control mb-3"
                        onChange={handleChange}
                        required
                    />

                    <button className="btn btn-success w-100">

                        Continuar

                    </button>

                </form>

            ) : (

                <div className="text-center">

                    <h4>Selecciona método de pago</h4>

                    <button
                        className="btn btn-primary me-3"
                        onClick={pagarTransferencia}
                    >
                        Transferencia
                    </button>

                    <button
                        className="btn btn-success"
                        onClick={pagarTarjeta}
                    >
                        Tarjeta
                    </button>

                </div>

            )}

        </div>
    );
};