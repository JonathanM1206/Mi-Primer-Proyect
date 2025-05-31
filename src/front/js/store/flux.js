import registroUsuario from "../pages/registroUsuario";

const getState = ({ getStore, getActions, setStore }) => {

    return {
        store: {
            user: [], 
            users: [], 
            admin:[],
            admin: [],
            token: localStorage.getItem("token") || null,
            role: localStorage.getItem("role") || null,
            producto: [],
            carrito: []




        },
        actions: {
            //Registrar un usuario
            registroUsuario: async (name, email, password) => {
                const baseUrl = process.env.React_APP_BASE_URL;
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/user`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Autorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ name, email, password })
                    }) 
                    if(!response.ok) { 
                        try {
                            const errorData = await response.json(); 
                            console.log("Error al registrar el usuario:", errorData); 
                            errorMessage = errorData.error|| errorData.message || "Error al registrar el usuario";
                        } catch (error) {
                           errorMessage = 'Error al procesar la respuesta del servidor';
							console.log('Datos del paciente:', data); 
                        }
                        throw new Error("Error al registrar el usuario");
                    } 
                    const data = await response.json();
                    let store = getStore(); 
                    setStore({ ...store, user: { name, email, password }, users: [...getStore().users, { name, email, password }], token: data.access_token, message: 'Usuario registrado exitosamente' });
                    localStorage.setItem("token", data.access_token); 
                    console.log("Usuario",data);

                } catch (error) {
                    console.error("Error al registrar el usuario:", error);
                    let store = getStore();
                    setStore({ ...store, message: error.message || "Error al registrar el usuario" });
                }
                    }, 
            //Login de usuario 
            loginUsuario: async(email,password)=>{ 
                const baseUrl=process.env.React_APP_BASE_URL; 
                try {
                    const response=await fetch(`${baseUrl}api/login/user`,{ 
                        method:'POST', 
                        headers:{ 
                            'Content-Type':'application/json'
                        }, 
                        body:JSON.stringify({email,password})
                    }) 
                    if(!response.ok){ 
                        const errorData = await response.json(); 
                        throw new Error(errorData.error ||'Error al iniciar sesión');
                    } 
                    const data = await response.json(); 
                    let store = getStore(); 
                    setStore({ 
                        ...store, 
                        user:{email,role:data.role},
                        token:data.access_token, 
                        message: 'Usuario logueado exitosamente'
                    })  
                    // Guardar datos en localStorage
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("role", data.role); 
                    localStorage.setItem("email", data.email); 
                    localStorage.setItem("id", data.id); 
                    localStorage.setItem("user", JSON.stringify(email,data.role));
                    console.log("Usuario logueado:", data);
                } catch (error) { 
                    console.error("Error al iniciar sesión:", error);
                    let store = getStore();
                    setStore({ ...store, message: error.message || "Error al iniciar sesión" });
                    
                }
            }, 
            //Registrar un administrador 
            registroAdmin:async(email,password)=>{ 
                const baseUrl = process.env.React_APP_BASE_URL;
                try {
                    
                } catch (error) {
                    
                }
            }
        }
    }
}



export default getState;