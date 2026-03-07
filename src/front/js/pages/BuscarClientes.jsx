import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import swal from "sweetalert";
import carga from "../../../assets/loading.gif";

const BuscarClientes = () => {

    const { store, actions } = useContext(Context);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get("query");

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const realizarBusqueda = async () => {

            if (query) {

                setLoading(true);

                await actions.buscarClientes(query);

                setLoading(false);

            }

        };

        realizarBusqueda();

    }, [query]);


    const eliminarUsuarioA = async (userId) => {

        const confirmar = await swal({
            title: "¿Estás seguro?",
            text: "¡No podrás deshacer esta acción!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        });

        if (confirmar) {

            try {

                await actions.eliminarUsuarioAdmin(userId);

                swal("Usuario eliminado", "El usuario fue eliminado correctamente", "success");

                actions.buscarClientes(query);

            } catch (error) {

                swal("Error", error.message || "No se pudo eliminar el usuario", "error");

            }

        }

    };


    return (

        <div className="container mt-4">

            <h3 className="mb-4">
                Resultados para: {query}
            </h3>


            {/* Cargando */}

            {loading && (

                <div className="text-center my-5">

                    <img src={carga} alt="Buscando..." width="120" />

                    <p>Buscando clientes...</p>

                </div>

            )}


            {/* Sin resultados */}

            {!loading && store.clientesBuscados.length === 0 && (

                <div className="alert alert-warning text-center">

                    No se encontraron clientes para "{query}"

                    <br /><br />

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </button>

                </div>

            )}


            <div className="row">

                {store.clientesBuscados.map((item) => (

                    <div key={item.user_id} className="col-md-4 mb-4">

                        <div className="card shadow">

                            <div className="card-body">

                                <h5 className="card-title">

                                    Nombre: {item.name}

                                </h5>

                                <p className="card-text">

                                    <strong>Correo:</strong> {item.email}

                                </p>

                                <p className="card-text">

                                    <strong>Telefono:</strong> {item.telefono}

                                </p>

                                <p className="card-text">

                                    <strong>Direccion:</strong> {item.direccion}

                                </p>


                                <div className="d-flex justify-content-between">

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => eliminarUsuarioA(item.user_id)}
                                    >
                                        Eliminar
                                    </button>


                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/historial-cliente/${cliente.user_id}`)}
                                    >
                                        Ver Historial
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

};

export default BuscarClientes;