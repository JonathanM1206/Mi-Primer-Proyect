import React, { useContext, useEffect, useState } from "react"
import { Context } from "../store/appContext"

const AdminPedidos = () => {

    const { store, actions } = useContext(Context)

    const hoy = new Date().toISOString().split("T")[0]

    const [fecha, setFecha] = useState(hoy)

    const [pedidoAbierto, setPedidoAbierto] = useState(null)

    const [clienteAbierto, setClienteAbierto] = useState(null)

    const [tracking, setTracking] = useState("")

    useEffect(() => {

        actions.getPedidosPorFecha(fecha)

    }, [fecha])


    const toggleProductos = (id) => {

        setPedidoAbierto(pedidoAbierto === id ? null : id)

    }

    const toggleCliente = (id) => {

        setClienteAbierto(clienteAbierto === id ? null : id)

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
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Pago</th>
                            <th>Estado</th>
                            <th>Productos</th>
                            <th>Cliente Info</th>
                            <th>Tracking</th>
                            <th>Contacto</th>

                        </tr>

                    </thead>

                    <tbody>

                        {store.pedidos.map(pedido => {

                            const pago = pedido.pagos[0]

                            return (

                                <React.Fragment key={pedido.pedido_id}>

                                    <tr>

                                        <td>{pedido.pedido_id}</td>

                                        <td>{pedido.usuario.name}</td>

                                        <td>Lps {pedido.total}</td>

                                        <td>{pago?.metodo}</td>

                                        <td>

                                            {pago?.metodo === "pixelpay" ? (

                                                <span className="badge bg-success">Pagado</span>

                                            ) : (

                                                <div>

                                                    <span className="badge bg-warning">{pago?.estado}</span>

                                                    <button
                                                        className="btn btn-sm btn-success ms-2"
                                                        onClick={() => actions.actualizarEstadoPago(pago.pago_id, "pagado")}
                                                    >
                                                        Marcar Pagado
                                                    </button>

                                                </div>

                                            )}

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

                                    </tr>


                                    {pedidoAbierto === pedido.pedido_id && (

                                        <tr>

                                            <td colSpan="9">

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

                                            <td colSpan="9">

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