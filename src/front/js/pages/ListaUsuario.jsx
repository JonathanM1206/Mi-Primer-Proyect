import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert';

const ListaUsuario = () => {
    const { store, actions } = useContext(Context);
    const [usuarios, setUsuarios] = useState([]);

    const traeUsuarios = async () => {
        try {
            await actions.getUsuario();
            setUsuarios(store.user || []); // Actualizamos el estado con los usuarios obtenidos 

        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
            swal("Error", "No se pudieron obtener los usuarios", "error");
        }
    }

    useEffect(() => {
      traeUsuarios(); // Llamamos a la función para obtener los usuarios al cargar el componente
    }, [store.user]); // Dependencia para que se actualice cuando store.user cambie
    return (
        <div className='container mt-4'>
    <h2 className='mb-4'>Lista de Usuarios</h2>
    <div className='row'>
        {
            Array.isArray(store.user) && store.user.map((item) => {
                return (
                    <div key={item.user_id} className='col-md-4 mb-4'>
                        <div className='card shadow'>
                            <div className='card-body'>
                                <h5 className='card-title'>{item.name}</h5>
                                <p className='card-text'>{item.email}</p>
                                <div className='d-flex justify-content-between'>
                                    <button className='btn btn-danger'>Eliminar</button>
                                    <button className='btn btn-primary'>Ver Historial</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
    </div>
</div>
    )
}

export default ListaUsuario