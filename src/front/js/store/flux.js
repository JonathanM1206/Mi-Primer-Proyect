

const getState = ({ getStore, getActions, setStore }) => {

    return {
        store: {
            user: {},
            users: [],
            admin: {},
            admins: [],
            token: localStorage.getItem("token") || null,
            role: localStorage.getItem("role") || null,
            producto: {},
            productos: [],
            carrito: {}




        },
        actions: {
            //Registrar un usuario
            registroUsuario: async (name, email, password) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/user`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ name, email, password })
                    })
                    if (!response.ok) {
                        let errorMessage = 'Algo salió mal. Intenta de nuevo.';
                        try {

                            const errorData = await response.json();
                            console.log("Error al registrar el usuario:", errorData);
                            errorMessage = errorData.error || errorData.message || "Error al registrar el usuario";
                        } catch (error) {
                            errorMessage = 'Error al procesar la respuesta del servidor';
                            console.log('Datos del Usuario:', data);
                        }
                        throw new Error("Error al registrar el usuario");
                    }
                    const data = await response.json();
                    console.log("Datos de usuario Registrado:", data);

                    let store = getStore();
                    setStore({ ...store, user: { name: data.name, email: data.email, role: data.role, id: data.id, password }, users: [...getStore().users, { name, email, password }], token: data.access_token, message: 'Usuario registrado exitosamente' });
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("role", data.role);
                    localStorage.setItem("email", data.email);
                    localStorage.setItem("id", data.id);
                    localStorage.setItem("name", data.name);
                    localStorage.setItem("user", JSON.stringify({
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        user_id: data.id
                    }));
                    console.log("Usuario", data);

                } catch (error) {
                    console.error("Error al registrar el usuario:", error);
                    let store = getStore();
                    setStore({ ...store, message: error.message || "Error al registrar el usuario" });
                }
            },
            //Login de usuario 
            loginUsuario: async (email, password) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const response = await fetch(`${baseUrl}api/login/user`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    })
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Error al iniciar sesión');
                    }
                    const data = await response.json();
                    console.log("Datos de usuario logueado:", data);

                    let store = getStore();
                    setStore({
                        ...store,
                        user: { name: data.name, email: data.email, role: data.role },//agregar el id y el role del usuario con emnail
                        token: data.access_token,
                        message: 'Usuario logueado exitosamente'
                    })
                    // Guardar datos en localStorage
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email, role: data.role, user_id: data.user_id })); // Asegúrate de incluir todas las propiedades que necesitas, como 'name' que viene en 'data' del backend
                    localStorage.setItem("name", data.name);
                    localStorage.setItem("email", data.email);
                    localStorage.setItem("id", data.id);
                    localStorage.setItem("role", data.role);

                    console.log("Usuario logueado:", data);
                } catch (error) {
                    console.error("Error al iniciar sesión:", error);
                    let store = getStore();
                    setStore({ ...store, message: error.message || "Error al iniciar sesión" });

                }
            },
            //Editando Usuario
            editarUsuario: async (userBody, userId) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const token = getStore().token

                    const response = await fetch(`${baseUrl}api/edit_user/${userId}`, {
                        method: 'PUT',
                        body: JSON.stringify(userBody),
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                    })
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Error al editar el usuario');
                    }
                    console.log("Usuario editado exitosamente");
                    localStorage.setItem('name', userBody.name);
                    localStorage.setItem('email', userBody.email);
                    let store = getStore();
                    setStore({ ...store, user: { ...getStore().user, name: userBody.name, email: userBody.email }, message: 'Usuario editado exitosamente' });
                    return true;

                } catch (error) {
                    console.error("Error al editar el usuario:", error);
                }
            },

            //Login de administrador 
            loginAdmin: async (email, password) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const response = await fetch(`${baseUrl}api/login/admin`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    })
                    if (!response.ok) {
                        console.log('Primnero error');
                        const errorData = await response.json();
                        console.log('Segundo error', errorData);
                        throw new Error(errorData.error || 'Error al iniciar sesión');
                    }
                    const data = await response.json();
                    console.log("Datos de usuario logueado:", data);
                    let store = getStore();
                    setStore({
                        ...store,
                        admin: { name: data.name, email: data.email, role: data.role }, //aqui se manda el email, role, name e id del administrador
                        token: data.access_token,
                        message: 'Administrador logueado exitosamente'
                    })
                    // Guardar datos en localStorage
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("role", data.role);
                    localStorage.setItem("email", data.email);
                    localStorage.setItem("name", data.name);
                    localStorage.setItem("id", data.id);
                    localStorage.setItem("admin", JSON.stringify({ name: data.name, email: data.email, role: data.role, admin_id: data.admin_id })); // Asegúrate de incluir todas las propiedades que necesitas, como 'name' que viene en 'data' del backend
                    console.log("Administrador logueado:", data);
                } catch (error) {
                    console.error("Error al iniciar sesión:", error);
                    let store = getStore();
                    setStore({ ...store, message: error.message || "Error al iniciar sesión" });

                }
            },
            //Editando Administrador 
            editarAdmin: async (adminBody, adminId) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/edit_admin/${adminId}`, {
                        method: 'PUT',
                        body: JSON.stringify(adminBody),
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                    })
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Error al editar el administrador');
                    }
                    console.log("Administrador editado exitosamente");
                    localStorage.setItem('name', adminBody.name);
                    localStorage.setItem('email', adminBody.email);
                    localStorage.setItem('id', adminId); // Guardar el id del administrador editado
                    let store = getStore();
                    setStore({ ...store, admin: { ...getStore().admin, name: adminBody.name, email: adminBody.email }, message: 'Administrador editado exitosamente' });
                    return true;

                } catch (error) {
                    console.error("Error al editar el administrador:", error);
                }

            },
            //Crear un producto 
            crearProducto: async (name, descripcion, precio, imagen, cantidad) => {
                console.log("Creando producto", name, descripcion, precio, imagen, cantidad)

                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/'

                try {
                    const formData = new FormData()
                    formData.append("name", name)
                    formData.append("descripcion", descripcion)
                    formData.append("precio", parseFloat(precio)) // 🔧 importante
                    console.log("precio antes de agregar al FormData:", precio)
                    formData.append("imagen", imagen) // tipo File
                    formData.append("cantidad", parseInt(cantidad)) // 🔧 importante
                    console.log("FormData creado:", formData)

                    const token = getStore().token // Asegurate que aquí está el token correcto
                    if (!token) throw new Error("Token no disponible, logueate de nuevo")

                    const response = await fetch(`${baseUrl}api/producto`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData
                    })

                    console.log("Respuesta del servidor:", response)

                    if (!response.ok) {
                        const errorData = await response.json() 
                        console.error("Error al agregar producto:", errorData)
                        throw new Error(errorData.msg || 'Error al agregar producto')
                    }

                    const data = await response.json()
                    console.log("Producto creado exitosamente:", data)

                    let store = getStore()
                    setStore({
                        ...store,
                        productos: [...store.productos, data],
                        message: 'Producto creado exitosamente'
                    })

                    localStorage.setItem("producto", JSON.stringify(data)) // Opcional, si lo necesitás 
                    console.log("Producto guardado en localStorage:", data)

                } catch (error) {
                    console.error("Error al agregar producto", error)
                    setStore({ ...getStore(), message: error.message })
                }
            },
            //Ver todos los productos 
            getProductos: async () => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/'

                try {
                    const store = getStore();
                    const response = await fetch(`${baseUrl}api/producto`, {
                        method: 'GET',

                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.msg || 'Error al cargar productos');
                    }

                    const data = await response.json();

                    // Guardamos la lista de productos en el store para usar en componentes
                    setStore({
                        ...store,
                        productos: data,
                        message: '', // Limpio mensaje de error si había
                    });
                } catch (error) {
                    let store = getStore();
                    setStore({
                        ...store,
                        message: error.message,
                    });
                }
            },
            //Log out de usuario o administrador 
            logout: () => {
                localStorage.removeItem("userData");
                localStorage.removeItem("role");
                setStore({ admin: null, user: null })
            },
            loadSession: () => {
                const storeAdmin = localStorage.getItem("admin");
                const storeUser = localStorage.getItem("user");
                const storeToken = localStorage.getItem("token");
                let store = getStore();
                setStore({
                    ...store,
                    admin: storeAdmin ? JSON.parse(storeAdmin) : null,
                    user: storeUser ? JSON.parse(storeUser) : null,
                    token: storeToken || null,
                });
            }
        }
    }
}



export default getState;