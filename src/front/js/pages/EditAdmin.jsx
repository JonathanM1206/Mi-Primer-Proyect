import React, { useContext, useState, useEffect } from 'react'
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
    const handleEdit = () => setIsEditing(!isEditing)
    
    const handleChange = (e) => {
        setAdminData({ ...adminData, [e.target.name]: e.target.value });
    } 
       
    const handleSave = async (e) => {
        try {
            if (adminData.password.trim() === '') {
                delete adminData.password; // Eliminar la contraseña si está vacía
            }
     await actions.editarAdmin(adminData, store.admin?.id || localStorage.getItem("id")); //aqui llamo el id 
                 setIsEditing(false);
        } catch (error) {
            console.error("Error al editar el Administrador:", error);
        }
    } 
     useEffect(() => {
            if (store.admin) {
                setAdminData({
                    name: store.admin.name || localStorage.getItem("name") || '', //Para mostrar los valores actuales cuando no estás editando, puedes dejarlos asi con local storage
                    email: store.admin.email || localStorage.getItem("email") || '',
                    password: store.admin.password || ''
                })
            } 
            
        }, [store.admin]); 
        let name = store.admin?.name || localStorage.getItem("name");
        let email = store.admin?.email || localStorage.getItem("email"); 
        let password = store.admin?.password || localStorage.getItem("password"); 

            console.log("store.admin:", store.admin);
    console.log("localStorage name:", localStorage.getItem("name"));

return (
    <div>{/* //Informacion */}
           <div className='Perfil'> 
            <h1>Mi Perfil</h1> 
            <p> 
                <strong>User:</strong> 
                {isEditing ? <input type='name' name='name' value={adminData.name} onChange={handleChange}/>: name}
            </p> 
            <p> 
                <strong>Email:</strong> 
                {isEditing ? <input type='email' name='email' value={adminData.email} onChange={handleChange}/>: email}
            </p> 
            {/* <p> 
                <strong>Password:</strong> 
                {isEditing ? <input type='password' name='password' value={userData.password} onChange={handleChange}/>: password}</p> */}
           </div> 
           {/* Botones de Editar y Guardar */}
           <div className='Botones'> 
            {isEditing ? ( 
                <> 
                <button className='btn btn-success' onClick={handleSave}>Guardar</button>
                <button className='btn btn-secondary' onClick={handleEdit}>Cancelar</button>
                </>  

            ):( 
                <button className='btn btn-primary' onClick={handleEdit}>Editar</button>
            )}
            
            
           </div></div>
  )
}

export default EditAdmin