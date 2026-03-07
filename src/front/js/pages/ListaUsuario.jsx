import React, { useState, useEffect, useContext } from 'react'
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert'; 
import { useNavigate } from 'react-router-dom';

const ListaUsuario = () => {
    const { store, actions } = useContext(Context);
    const [usuarios, setUsuarios] = useState([]); 
    const navigate =useNavigate()

    const traeUsuarios = async () => {
        try {
            await actions.getUsuario();
            setUsuarios(store.user || []); // Actualizamos el estado con los usuarios obtenidos 

        } catch (error) {
            console.error("Error al obtener los usuarios:", error);
            swal("Error", "No se pudieron obtener los usuarios", "error");
        }
    } 
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
      // Aquí podrías refrescar la lista si no se actualiza sola
      await traeUsuarios();
    } catch (error) {
      swal("Error", error.message || "No se pudo eliminar el usuario", "error");
    }
  }
};
    useEffect(() => {
      traeUsuarios(); // Llamamos a la función para obtener los usuarios al cargar el componente
    }, [store.user]); // Dependencia para que se actualice cuando store.user cambie 


if (usuarios.length === 0) {
    return <div className="text-center mt-4"><h4>No hay usuarios disponibles.</h4></div>;
}
    
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
                                <h5 className='card-title'>Nombre: {item.name}</h5>
                                <p className='card-text'><strong>Correo: </strong>{item.email}</p> 
                                <p className='card-text'><strong>Telefono: </strong>{item.telefono}</p> 
                                <p className='card-text'><strong>Direccion: </strong>{item.direccion}</p>
                                <div className='d-flex justify-content-between'>
                                    <button className='btn btn-danger' onClick={() => eliminarUsuarioA(item.user_id)}>Eliminar</button>
                                     <button
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/historial-cliente/${item.user_id}`)}
                                    >
                                        Ver Historial
                                    </button>
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