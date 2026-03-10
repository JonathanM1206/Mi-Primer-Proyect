import React, { useContext, useEffect, useState } from "react"
import { Context } from "../store/appContext"
import swal from "sweetalert"

const AdminPedidos = () => {

    const { store, actions } = useContext(Context)

    const hoy = new Date().toISOString().split("T")[0]

    const [fecha, setFecha] = useState(hoy)

    const [pedidoAbierto, setPedidoAbierto] = useState(null)

    const [clienteAbierto, setClienteAbierto] = useState(null)

    const [tracking, setTracking] = useState("")

    // estados para comentarios
    const [comentarios, setComentarios] = useState({})
    const [editando, setEditando] = useState(null)

    useEffect(() => {

        actions.getPedidosPorFecha(fecha)

    }, [fecha])


    const toggleProductos = (id) => {

        setPedidoAbierto(pedidoAbierto === id ? null : id)

    }

    const toggleCliente = (id) => {

        setClienteAbierto(clienteAbierto === id ? null : id)

    }

    const guardarComentario = async (pedido_id) => {

        const comentario = comentarios[pedido_id] ?? ""

        await actions.actualizarComentarioPedido(pedido_id, comentario)

        setEditando(null)

        swal("Guardado", "Comentario guardado exitosamente", "success")

    }

    return (

        <div className="container mt-4">

            <h2 className="mb-4">Panel Administrador Pedidos</h2>

            <div className="mb-3">

                <label>Seleccionar Fecha</label>

                <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                />

            </div>

            <div className="table-responsive">

                <table className="table table-bordered">

                    <thead className="table-dark">

                        <tr>

                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Pago</th>
                            <th>Estado</th>
                            <th>Envío</th>
                            <th>Productos</th>
                            <th>Cliente Info</th>
                            <th>Tracking</th>
                            <th>Contacto</th>
                            <th>Comentarios</th>

                        </tr>

                    </thead>

                    <tbody>

                        {store.pedidos.map(pedido => {

                            const pago = pedido.pagos[0]

                            const totalCalculado = pedido.items.reduce((total, item) => {
                                return total + (item.cantidad * item.precio_unitario)
                            }, 0)

                            return (

                                <React.Fragment key={pedido.pedido_id}>

                                    <tr>

                                        <td>{pedido.pedido_id}</td>

                                        <td>
                                            {pedido.fecha ? (
                                                <>
                                                    {new Date(pedido.fecha).toLocaleDateString()}
                                                    <br />
                                                    <small className="text-muted">
                                                        {new Date(pedido.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </small>
                                                </>
                                            ) : "Sin fecha"}
                                        </td>

                                        <td>{pedido.usuario.name}</td>

                                        <td>Lps {totalCalculado}</td>

                                        <td>{pago?.metodo}</td>

                                        <td>

                                            {pago?.metodo === "pixelpay" ? (

                                                <span className="badge bg-success">Pagado</span>

                                            ) : (

                                                <div>

                                                    <span
                                                        className={`badge ${pago?.estado === "pagado"
                                                            ? "bg-success"
                                                            : pago.estado === "cancelado"
                                                                ? "bg-danger"
                                                                : "bg-warning"
                                                            }`}
                                                    >
                                                        {pago?.estado}
                                                    </span>

                                                    <select
                                                        className="form-select form-select-sm mt-1"
                                                        value={pago?.estado}
                                                        onChange={(e) => actions.actualizarEstadoPago(pago.pago_id, e.target.value)}
                                                    >

                                                        <option value="pendiente">Pendiente</option>
                                                        <option value="pagado">Pagado</option>
                                                        <option value="cancelado">Cancelado</option>

                                                    </select>

                                                </div>

                                            )}

                                        </td>

                                        <td>

                                            <div>

                                                <span
                                                    className={`badge ${pedido.estado_envio === "preparando"
                                                        ? "bg-primary"
                                                        : pedido.estado_envio === "enviado"
                                                            ? "bg-success"
                                                            : pedido.estado_envio === "entregado"
                                                                ? "bg-success"
                                                                : pedido.estado_envio === "cancelado"
                                                                    ? "bg-danger"
                                                                    : "bg-secondary"
                                                        }`}
                                                >

                                                    {pedido.estado_envio}

                                                </span>

                                                <select
                                                    className="form-select form-select-sm mt-1"
                                                    value={pedido.estado_envio}
                                                    onChange={(e) => actions.actualizarEstadoEnvio(pedido.pedido_id, e.target.value)}
                                                >

                                                    <option value="preparando">Preparando</option>
                                                    <option value="enviado">Enviado</option>
                                                    <option value="entregado">Entregado</option>

                                                </select>

                                            </div>

                                        </td>

                                        <td>

                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => toggleProductos(pedido.pedido_id)}
                                            >
                                                Ver
                                            </button>

                                        </td>

                                        <td>

                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => toggleCliente(pedido.pedido_id)}
                                            >
                                                Ver
                                            </button>

                                        </td>

                                        <td>

                                            <input
                                                className="form-control"
                                                placeholder="Tracking #"
                                                value={tracking}
                                                onChange={(e) => setTracking(e.target.value)}
                                            />

                                        </td>

                                        <td>

                                            <a
                                                href={`https://wa.me/${pedido.usuario.telefono}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >

                                                <i className="fab fa-whatsapp fa-lg text-success"></i>

                                            </a>

                                            <a
                                                href={`mailto:${pedido.usuario.email}`}
                                                className="ms-3"
                                            >

                                                <i className="fas fa-envelope fa-lg text-danger"></i>

                                            </a>

                                        </td>

                                        {/* COLUMNA COMENTARIOS */}

                                        <td>

                                            {editando === pedido.pedido_id ? (

                                                <>

                                                    <textarea
                                                        className="form-control"
                                                        rows="2"
                                                        value={comentarios[pedido.pedido_id] ?? pedido.comentario ?? ""}
                                                        onChange={(e) =>
                                                            setComentarios({
                                                                ...comentarios,
                                                                [pedido.pedido_id]: e.target.value
                                                            })
                                                        }
                                                    />

                                                    <button
                                                        className="btn btn-success btn-sm mt-1"
                                                        onClick={() => guardarComentario(pedido.pedido_id)}
                                                    >
                                                        Guardar
                                                    </button>

                                                </>

                                            ) : (

                                                <>

                                                    <div style={{ fontSize: "13px" }}>
                                                        {pedido.comentario || "Sin comentario"}
                                                    </div>

                                                    <button
                                                        className="btn btn-secondary btn-sm mt-1"
                                                        onClick={() => setEditando(pedido.pedido_id)}
                                                    >
                                                        Editar
                                                    </button>

                                                </>

                                            )}

                                        </td>

                                    </tr>

                                    {pedidoAbierto === pedido.pedido_id && (

                                        <tr>

                                            <td colSpan="12">

                                                <ul className="list-group">

                                                    {pedido.items.map((item, i) => {

                                                        const subtotal = item.cantidad * item.precio_unitario

                                                        return (

                                                            <li key={i} className="list-group-item">

                                                                {item.nombre} | Cant: {item.cantidad} | Lps {subtotal}

                                                            </li>

                                                        )

                                                    })}

                                                </ul>

                                            </td>

                                        </tr>

                                    )}

                                    {clienteAbierto === pedido.pedido_id && (

                                        <tr>

                                            <td colSpan="12">

                                                <div>

                                                    <strong>Cliente:</strong> {pedido.usuario.name}

                                                    <br />

                                                    <strong>Direccion:</strong> {pedido.usuario.direccion}

                                                    <br />

                                                    <strong>Telefono:</strong> {pedido.usuario.telefono}

                                                    <br />

                                                    <strong>Email:</strong> {pedido.usuario.email}

                                                </div>

                                            </td>

                                        </tr>

                                    )}

                                </React.Fragment>

                            )

                        })}

                    </tbody>

                </table>

            </div>

        </div>

    )

}

export default AdminPedidos