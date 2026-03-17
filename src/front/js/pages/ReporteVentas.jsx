import React, { useContext, useState } from "react";
import { Context } from "../store/appContext"; 
import swal from "sweetalert";

const ReporteVentas = () => {

    const { store, actions } = useContext(Context);

    // Estado para fechas
    const [fechaInicio, setFechaInicio] = useState("");

    // Estado para fecha final
    const [fechaFin, setFechaFin] = useState("");

    // Estado para loading
    const [loading, setLoading] = useState(false);

    // Función para buscar reporte
    const buscarReporte = async () => {

        // Validar que ambas fechas estén llenas
        if (!fechaInicio || !fechaFin) {
            swal("Debes seleccionar ambas fechas");
            return;
        }

        // Activar loading
        setLoading(true);

        // Llamar acción del flux
        await actions.reporteCompleto(fechaInicio, fechaFin);

        // Desactivar loading
        setLoading(false);
    };

    return (
        <div className="container mt-4">

            <h2 className="mb-4">📊 Reporte de Ventas</h2>

            {/* FILTROS */}
            <div className="row mb-4">

                <div className="col-md-4">
                    <label>Fecha Inicio</label>
                    <input
                        type="date"
                        className="form-control"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                    />
                </div>

                <div className="col-md-4">
                    <label>Fecha Fin</label>
                    <input
                        type="date"
                        className="form-control"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                    />
                </div>

                <div className="col-md-4 d-flex align-items-end">
                    <button
                        className="btn btn-primary w-100"
                        onClick={buscarReporte}
                    >
                        Buscar
                    </button>
                </div>

            </div>

            {/* LOADING */}
            {loading && (
                <div className="text-center">
                    <p>Cargando reporte...</p>
                </div>
            )}

            {/* RESUMEN */}
            {!loading && store.reporteResumen && (
                <div className="row mb-4">

                    <div className="col-md-4">
                        <div className="card p-3 shadow">
                            <h5>Total Vendido</h5>
                            <h3>L {store.reporteResumen.total_vendido}</h3>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card p-3 shadow">
                            <h5>Productos Vendidos</h5>
                            <h3>{store.reporteResumen.total_productos}</h3>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card p-3 shadow">
                            <h5>Ingresos Generados</h5>
                            <h3>L {store.reporteResumen.total_generado}</h3>
                        </div>
                    </div>

                </div>
            )}

            {/* TABLA */}
            {!loading && store.reporteDetalle && store.reporteDetalle.length > 0 && (

                <div className="table-responsive">

                    <table className="table table-bordered table-striped">

                        <thead className="table-dark">
                            <tr>
                                <th>Usuario</th>
                                <th>Producto</th>
                                <th>Precio Unitario</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>

                        <tbody>

                            {store.reporteDetalle.map((item, index) => (

                                <tr key={index}>

                                    <td>{item.usuario}</td>

                                    <td>{item.producto}</td>

                                    <td>L {item.precio_unitario}</td>

                                    <td>{item.cantidad}</td>

                                    <td>L {item.total}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

            {/* SIN RESULTADOS */}
            {!loading && store.reporteDetalle && store.reporteDetalle.length === 0 && (
                <div className="alert alert-warning text-center">
                    No hay datos en ese rango de fechas
                </div>
            )}

        </div>
    );
};

export default ReporteVentas;