import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

export const PagoInvitado = () => {
    const { actions, store } = useContext(Context);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: "",
        total: 0
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1️⃣ Registrar invitado
        const registrado = await actions.registrarInvitado(formData);
        if (!registrado) return alert("Error al registrar el usuario");

        // 2️⃣ Crear pedido
        const pedidoCreado = await actions.crearPedido({
            total: formData.total || 50, // ejemplo total temporal
            direccion: formData.direccion,
        });
        if (!pedidoCreado) return alert("Error al crear el pedido");

        // 3️⃣ Simular pago PixelPay
        const pagoOk = await actions.pagarPedidoPrueba(store.pedidoActual.id);
        if (pagoOk) {
            alert("✅ Pago simulado correctamente");
            navigate("/historial");
        }
    };

    return (
        <div className="container mt-5">
            <h3 className="text-center mb-4">Finaliza tu compra</h3>
            <form className="col-md-6 mx-auto" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Nombre completo</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Correo electrónico</label>
                    <input
                        type="email"
                        name="correo"
                        className="form-control"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        className="form-control"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Dirección</label>
                    <input
                        type="text"
                        name="direccion"
                        className="form-control"
                        value={formData.direccion}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-success w-100">
                    Realizar Pago de Prueba (PixelPay)
                </button>
            </form>
        </div>
    );
};
