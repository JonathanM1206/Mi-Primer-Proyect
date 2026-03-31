import React, { useContext, useState } from "react";
import { Context } from "../store/appContext"; 
import swal from "sweetalert";

const ReporteVentas = () => {
    const { store, actions } = useContext(Context);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [loading, setLoading] = useState(false);

    const buscarReporte = async () => {
        if (!fechaInicio || !fechaFin) {
            swal("Debes seleccionar ambas fechas");
            return;
        }
        setLoading(true);
        await actions.reporteCompleto(fechaInicio, fechaFin);
        setLoading(false);
    };

    // --- LÓGICA PARA EL DROPDOWN ---
    // Agrupamos los productos del detalle para saber cuántos se vendieron de cada uno
    const productosAgrupados = store.reporteDetalle?.reduce((acc, item) => {
        const existente = acc.find(p => p.producto === item.producto);
        if (existente) {
            existente.cantidad += item.cantidad;
        } else {
            acc.push({ producto: item.producto, cantidad: item.cantidad });
        }
        return acc;
    }, []) || [];

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center" style={{ fontWeight: '800' }}>📊 Reporte de Ventas</h2>

            {/* FILTROS */}
            <div className="row mb-4 g-3 bg-light p-3 rounded shadow-sm">
                <div className="col-md-4">
                    <label className="fw-bold">Fecha Inicio</label>
                    <input type="date" className="form-control" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                </div>
                <div className="col-md-4">
                    <label className="fw-bold">Fecha Fin</label>
                    <input type="date" className="form-control" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                    <button className="btn btn-primary w-100 fw-bold" onClick={buscarReporte}>🔍 Generar Reporte</button>
                </div>
            </div>

            {loading && <div className="text-center my-5"><div className="spinner-border text-primary"></div><p>Cargando datos...</p></div>}

            {/* RESUMEN */}
            {!loading && store.reporteResumen && (
                <div className="row mb-4 g-3">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm p-3 bg-white text-center h-100">
                            <h5 className="text-muted">Total Vendido</h5>
                            <h3 className="text-success fw-bold">L {store.reporteResumen.total_vendido}</h3>
                        </div>
                    </div>

                    {/* DROPDOWN DE PRODUCTOS VENDIDOS */}
                    <div className="col-md-4">
                        <div className="dropdown w-100 h-100">
                            <button 
                                className="card border-0 shadow-sm p-3 bg-white text-center w-100 h-100 dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style={{ border: 'none', appearance: 'none' }}
                            >
                                <h5 className="text-muted">Productos Vendidos</h5>
                                <h3 className="text-primary fw-bold">{store.reporteResumen.total_productos}</h3>
                                <small className="text-primary">(Click para ver detalle)</small>
                            </button>
                            
                            <ul className="dropdown-menu shadow w-100 p-2" style={{ maxHeight: '300px', overflowY: 'auto', borderRadius: '12px' }}>
                                <li className="dropdown-header border-bottom mb-2 d-flex justify-content-between">
                                    <span className="fw-bold">Producto</span>
                                    <span className="fw-bold">Vendidos</span>
                                </li>
                                {productosAgrupados.length > 0 ? (
                                    productosAgrupados.map((item, idx) => (
                                        <li key={idx} className="dropdown-item d-flex justify-content-between align-items-center py-2">
                                            <span style={{ fontSize: '0.9rem' }}>{item.producto}</span>
                                            <span className="badge bg-info text-dark rounded-pill">{item.cantidad}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="dropdown-item text-center text-muted">No hay datos</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm p-3 bg-white text-center h-100">
                            <h5 className="text-muted">Ingresos Generados</h5>
                            <h3 className="text-info fw-bold">L {store.reporteResumen.total_generado}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA DETALLADA */}
            {!loading && store.reporteDetalle && store.reporteDetalle.length > 0 && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden mt-4">
                    <div className="bg-dark p-3 text-white">
                        <h5 className="mb-0">Historial Detallado de Transacciones</h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Usuario</th>
                                    <th>Producto</th>
                                    <th>Precio Unitario</th>
                                    <th className="text-center">Cantidad</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {store.reporteDetalle.map((item, index) => (
                                    <tr key={index}>
                                        <td className="fw-bold">{item.usuario}</td>
                                        <td>{item.producto}</td>
                                        <td>L {item.precio_unitario}</td>
                                        <td className="text-center"><span className="badge bg-light text-dark border">{item.cantidad}</span></td>
                                        <td className="fw-bold text-success">L {item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && store.reporteDetalle && store.reporteDetalle.length === 0 && (
                <div className="alert alert-warning text-center rounded-pill">
                    No hay datos en ese rango de fechas
                </div>
            )}
        </div>
    );
};

export default ReporteVentas;