import React, { useContext, useState, useEffect } from 'react'
import { Context } from '../store/appContext.jsx';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';

const EditUsuario = () => {
    const { actions, store } = useContext(Context);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        name: store.user?.name || '',
        email: store.user?.email || '',
        password: store.user?.password || '',

    });
    let admin = localStorage.getItem('role');
    let user = JSON.parse(localStorage.getItem('user'))?.role;
    let role = admin || user;

    //Eliminar usuario para que admin elimine tmabien 
    const eliminarMe =async () => {
        const userId = store.user?.id || localStorage.getItem("id");
        const confirmar = await swal({
            title: "¿Estás seguro?",
            text: "¡No podrás deshacer esta acción!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        });

        if (confirmar) {
            try {
                await actions.eliminarUsuario(userId);
                swal("Usuario eliminado", "Tu cuenta ha sido eliminada correctamente", "success"); 
                await actions.logout(); // Cerrar sesión después de eliminar la cuenta
                navigate("/"); // Redirigir a la página de inicio
            } catch (error) {
                console.error("Error al eliminar el usuario:", error);
                swal("Error", "No se pudo eliminar tu cuenta", "error");
            }
        }
    };






    const handleEdit = () => setIsEditing(!isEditing)

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    }

    const handleSave = async (e) => {
        try {
            if (userData.password.trim() === '') {
                delete userData.password; // Eliminar la contraseña si está vacía
            }
            await actions.editarUsuario(userData, store.user?.id || localStorage.getItem("id")); //aqui llamo el id 
            setIsEditing(false);
        } catch (error) { 
            swal("Error", "No se pudo editar el usuario", "error");
            console.error("Error al editar el usuario:", error);
        }
    }

    useEffect(() => {
        if (store.user) {
            setUserData({
                name: store.user.name || localStorage.getItem("name") || '', //Para mostrar los valores actuales cuando no estás editando, puedes dejarlos asi con local storage
                email: store.user.email || localStorage.getItem("email") || '',
                password: store.user.password || ''
            })
        }
    }, [store.user]);
    let name = store.user?.name || localStorage.getItem("name");
    let email = store.user?.email || localStorage.getItem("email");
    return (
        <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'center' }}>
            {/* //Informacion */}
            <div className='     Perfil   ' >
                <h1>Mi Perfil</h1>
                <p>
                    <strong>User:</strong>
                    {isEditing ? <input type='name' name='name' value={userData.name} onChange={handleChange} /> : name}
                </p>
                <p>
                    <strong>Email:</strong>
                    {isEditing ? <input type='email' name='email' value={userData.email} onChange={handleChange} /> : email}
                </p>
                {/* <p> 
                <strong>Password:</strong> 
                {isEditing ? <input type='password' name='password' value={userData.password} onChange={handleChange}/>: password}</p> */}
            </div>
            {/* Botones de Editar y Guardar */}
            <div className='Botones' style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}>
                {isEditing ? (
                    <>
                        <button className='btn btn-success' onClick={handleSave}>Guardar</button>
                        <button className='btn btn-secondary' onClick={handleEdit}>Cancelar</button>
                    </>

                ) : (
                    <button className='btn btn-primary' onClick={handleEdit}>Editar</button>
                )}
                {(role === 'user' || role === 'admin') && (
                    <>
                        <button className='btn btn-danger' onClick={eliminarMe}>Eliminar Cuenta</button>
                    </>
                )}

            </div>
        </div>
    )
}

export default EditUsuario