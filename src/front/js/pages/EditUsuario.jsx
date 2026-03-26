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
        telefono: store.user?.telefono || '', // Asegúrate de que este campo sea correcto
        direccion: store.user?.direccion || '', // Asegúrate de que este campo sea
        password: store.user?.password || '',

    });
    let admin = localStorage.getItem('role');
    let user = JSON.parse(localStorage.getItem('user'))?.role;
    let role = admin || user;

    //Eliminar usuario para que admin elimine tmabien 
    const eliminarMe = async () => {
        const userId = store.user?.id || localStorage.getItem("id");
        const confirmar = await swal({
            title: "¿Estás seguro de Eliminar tu Cuenta?",
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


    const handleLogout = () => {
        actions.logout();
        navigate("/");

    }
    useEffect(() => {
        if (store.user) {
            setUserData({
                name: store.user.name || localStorage.getItem("user_name") || '', //Para mostrar los valores actuales cuando no estás editando, puedes dejarlos asi con local storage
                email: store.user.email || localStorage.getItem("user_email") || '',
                telefono: store.user.telefono || JSON.parse(localStorage.getItem("user"))?.telefono || '', // 🔧 Cambiado
                direccion: store.user.direccion || JSON.parse(localStorage.getItem("user"))?.direccion || '', // 🔧 Cambiado
                password: store.user.password || ''
            })
        }
    }, [store.user]);
    let name = store.user?.name || localStorage.getItem("user_name");
    let email = store.user?.email || localStorage.getItem("user_email");
    let telefono = store.user?.telefono || JSON.parse(localStorage.getItem("user"))?.telefono; // 🔧 Cambiado
    let direccion = store.user?.direccion || JSON.parse(localStorage.getItem("user"))?.direccion; // 🔧 Cambiado


    console.log("store.user:", store.user);
    const userStorage = JSON.parse(localStorage.getItem("user"));
    console.log("localStorage telefono:", userStorage?.telefono);
    console.log("localStorage direccion:", userStorage?.direccion);
    console.log("localStorage user:", localStorage.getItem("user"));

    return (
       <div className="container" style={{ paddingTop: '20px' }}>
        <div className="row justify-content-center g-4"> {/* g-4 da espacio entre las columnas */}
            
            {/* --- SECCIÓN INFORMACIÓN --- */}
            <div className="col-12 col-md-7 col-lg-6">
                <div className='Perfil p-4 shadow-sm h-100' style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee" }}>
                    <h2 className="mb-4 text-primary text-center text-md-start" style={{ fontWeight: "700" }}>Mi Perfil</h2>
                    
                    <div className="table-responsive"> {/* Evita que la tabla desborde en móviles muy pequeños */}
                        <table className="table table-borderless align-middle">
                            <tbody>
                                <tr>
                                    <td style={{ width: "100px" }}><strong>Usuario:</strong></td>
                                    <td>
                                        {isEditing ? (
                                            <input type='text' name='name' className="form-control form-control-sm" value={userData.name} onChange={handleChange} />
                                        ) : (
                                            <span className="text-muted">{name}</span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Email:</strong></td>
                                    <td>
                                        {isEditing ? (
                                            <input type='email' name='email' className="form-control form-control-sm" value={userData.email} onChange={handleChange} />
                                        ) : (
                                            <span className="text-muted">{email}</span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Teléfono:</strong></td>
                                    <td>
                                        {isEditing ? (
                                            <input type='number' name='telefono' className="form-control form-control-sm" value={userData.telefono} onChange={handleChange} />
                                        ) : (
                                            <span className="text-muted">{telefono}</span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Dirección:</strong></td>
                                    <td>
                                        {isEditing ? (
                                            <input type='text' name='direccion' className="form-control form-control-sm" value={userData.direccion} onChange={handleChange} />
                                        ) : (
                                            <span className="text-muted">{direccion}</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN BOTONES --- */}
            <div className="col-12 col-md-4 col-lg-3">
                <div className='Botones h-100'>
                    <table className="table table-hover border shadow-sm" style={{ borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff" }}>
                        <tbody>
                            {isEditing ? (
                                <>
                                    <tr>
                                        <td className="p-2">
                                            <button className='btn btn-success w-100' onClick={handleSave}>✅ Guardar Cambios</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-2">
                                            <button className='btn btn-secondary w-100' onClick={handleEdit}>❌ Cancelar</button>
                                        </td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td className="p-2">
                                        <button className='btn btn-primary w-100' onClick={handleEdit}>📝 Editar Perfil</button>
                                    </td>
                                </tr>
                            )}

                            {(role === 'user' || role === 'admin') && (
                                <>
                                    <tr>
                                        <td className="p-2">
                                            <button className='btn btn-outline-success w-100' onClick={() => navigate("/cambiarContrasena")}>🔑 Cambiar Contraseña</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-2">
                                            <button className='btn btn-warning w-100' onClick={handleLogout}>🚪 Cerrar Sesión</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="p-2">
                                            <button className='btn btn-danger w-100' onClick={eliminarMe}>🗑️ Eliminar Cuenta</button>
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
    )
}

export default EditUsuario