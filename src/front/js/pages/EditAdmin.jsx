import React, { useContext, useState, useEffect } from 'react';
import { Context } from '../store/appContext.jsx';
import { useNavigate } from 'react-router-dom';

const EditAdmin = () => {
    const { actions, store } = useContext(Context);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    const [adminData, setAdminData] = useState({
        name: store.admin?.name || '',
        email: store.admin?.email || '',
        password: store.admin?.password || '',
    });

    const handleEdit = () => setIsEditing(!isEditing);

    const handleChange = (e) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            if (adminData.password.trim() === '') {
                delete adminData.password; // Eliminar la contraseña si está vacía
            }
            await actions.editarAdmin(adminData, store.admin?.id || adminFromLocal?.id);
            setIsEditing(false);
        } catch (error) {
            console.error("Error al editar el Administrador:", error);
        }
    };

    useEffect(() => {
        if (store.admin) {
            setAdminData({
                name: store.admin.name || localStorage.getItem("admin_name") || '',
                email: store.admin.email || localStorage.getItem("admin_email") || '',
                password: store.admin.password || ''
            });
        }
    }, [store.admin]);

    // 🔥 Aquí ya optimizado con todo el admin desde localStorage
    let adminFromLocal = JSON.parse(localStorage.getItem('admin'));

    let name = store.admin?.name || adminFromLocal?.name || '';
    let email = store.admin?.email || adminFromLocal?.email || '';

    console.log("store.admin:", store.admin);
    console.log("localStorage admin:", adminFromLocal);
    console.log("id:", store.admin?.id || localStorage.getItem("id"));

    // Estilos inline para los botones con colores diferentes
    const buttonStyle = {
        padding: '10px 20px',
        margin: '10px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px'
    };

    const saveButton = {
        ...buttonStyle,
        backgroundColor: '#28a745', // Verde
        color: 'white'
    };

    const cancelButton = {
        ...buttonStyle,
        backgroundColor: '#dc3545', // Rojo
        color: 'white'
    };

    const editButton = {
        ...buttonStyle,
        backgroundColor: '#007bff', // Azul
        color: 'white'
    };

    const extraButton = {
        ...buttonStyle,
        backgroundColor: '#6f42c1', // Morado
        color: 'white'
    };

    return (
        <div style={{ maxWidth: '480px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#f9f9f9' }}>
            <div className='Perfil'>
                <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Mi Perfil</h1>
                <p>
                    <strong>User:</strong><br />
                    {isEditing ? (
                        <input
                            type='text'
                            name='name'
                            value={adminData.name}
                            onChange={handleChange}
                            style={{ padding: '8px', width: '90%', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', marginTop: '5px' }}
                        />
                    ) : name}
                </p>
                <p>
                    <strong>Email:</strong><br />
                    {isEditing ? (
                        <input
                            type='email'
                            name='email'
                            value={adminData.email}
                            onChange={handleChange}
                            style={{ padding: '8px', width: '90%', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', marginTop: '5px' }}
                        />
                    ) : email}
                </p>
            </div>
            <div className='Botones' style={{ textAlign: 'center', marginTop: '20px' }}>
                {isEditing ? (
                    <>
                        <button style={saveButton} onClick={handleSave}>Guardar</button>
                        <button style={cancelButton} onClick={handleEdit}>Cancelar</button>
                    </>
                ) : (
                    <button style={editButton} onClick={handleEdit}>Editar</button>
                )}
                {/* Aquí espacio para agregar más botones */}
                <div style={{ marginTop: '20px' }}>
                    <button style={extraButton} onClick={() => alert('Botón extra')}>Botón Extra</button>
                </div>
            </div>
        </div>
    )
}

export default EditAdmin;
