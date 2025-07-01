

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
            carrito: [],
            carritos: [],




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
            //Eliminar usuario 
            eliminarUsuario: async (userId) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                userId = userId || getStore().user?.id || localStorage.getItem("id");
                if (!userId) {
                    console.error("No se proporcionó un ID de usuario válido para eliminar.", userId);
                    return;
                }
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/delete_user/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Error al eliminar el usuario:", errorData);
                        throw new Error(errorData.error || 'Error al eliminar el usuario');
                    }
                    console.log("Usuario eliminado exitosamente:", userId);
                    const store = getStore();
                    console.log("Store antes de eliminar el usuario:", store);
                    if (Array.isArray(store.users)) {
                        setStore({
                            ...store,
                            users: store.users.filter(user => user.id !== userId),
                            message: 'Usuario eliminado exitosamente'
                        });
                    }
                    if (store.user && store.user.id === parseInt(userId)) {
                        localStorage.removeItem("token");
                        setStore({ user: null, token: null, message: 'Usuario eliminado exitosamente' });
                    }
                } catch (error) {
                    console.error("Error al eliminar el usuario:", error);
                }
            }
            ,

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
            //Ver un producto por su id 
            getProductoPorId: async (id) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const response = await fetch(`${baseUrl}api/producto/${id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }

                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Error al obtener el producto:", errorData);
                        throw new Error(errorData.error || 'Error al obtener el producto');
                    }
                    const data = await response.json();
                    console.log("Producto encontrado:", data);
                    return data; // Retorna el producto encontrado 


                } catch (error) {
                    console.error("Error al obtener el producto por ID:", error);
                    return null
                }
            },
            //Eliminar un producto por su id
            eliminarProducto: async (productoId) => {
                productoId = productoId || getStore().producto?.product_id || localStorage.getItem("productoId");

                if (!productoId) {
                    console.error("No se proporcionó un ID de producto válido para eliminar.", productoId);
                    return;
                }

                try {
                    const token = getStore().token;
                    const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';

                    const response = await fetch(`${baseUrl}api/delete_producto/${productoId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Error al eliminar el producto:", errorData);
                        throw new Error(errorData.error || 'Error al eliminar el producto');
                    }

                    console.log("Producto eliminado exitosamente:", productoId);

                    const store = getStore();
                    console.log("Store antes de eliminar el producto:", store);
                    if (Array.isArray(store.productos)) {
                        setStore({
                            ...store,
                            productos: store.productos.filter(producto => producto.product_id !== productoId),
                            message: 'Producto eliminado exitosamente'
                        });
                    }

                    if (store.producto && store.producto.product_id === productoId) {
                        setStore({
                            ...store,
                            producto: null,
                            message: 'Producto eliminado exitosamente'
                        });
                    }

                } catch (error) {
                    console.error("Error al eliminar el producto:", error);
                    const store = getStore();
                    setStore({ ...store, message: error.message || "Error al eliminar el producto" });
                }
            },
            //editar un producto por su id
            editarProducto: async (productoBody, productoId) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/edit_producto/${productoId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(productoBody)
                    })
                    console.log('Respuesta del servidor:', response);
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Error al editar el producto:", errorData);
                        throw new Error(errorData.error || 'Error al editar el producto');
                    }

                    console.log("Producto editado exitosamente");
                    const data = await response.json();
                    console.log("Datos del producto editado:", data);
                    localStorage.setItem('name', productoBody.name);
                    localStorage.setItem('descripcion', productoBody.descripcion);
                    localStorage.setItem('precio', productoBody.precio);
                    localStorage.setItem('cantidad', productoBody.cantidad);
                    localStorage.setItem('imagen', productoBody.imagen); // Asegúrate de que este campo sea correcto 
                    let store = getStore();
                    setStore({
                        ...store, producto: {
                            ...getStore().producto,
                            name: productoBody.name,
                            descripcion: productoBody.descripcion,
                            precio: productoBody.precio,
                            cantidad: productoBody.cantidad,
                            imagen: productoBody.imagen
                        },
                        message: 'Producto editado exitosamente'
                    })
                    console.log("Producto editado exitosamente:", data);

                    return true;
                } catch (error) {
                    console.error("Error al editar el producto:", error);
                }
            },
            //Agregar un producto al carrito 
            agregarProductoCarrito: async (productoId, cantidad = 1) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const token = getStore().token;

                    const response = await fetch(`${baseUrl}api/carrito`, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ product_id: productoId, cantidad })
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Error al agregar al Carrito:", errorData);
                        throw new Error(errorData.error || 'Error al agregar Producto');
                    }
                    const data = await response.json()
                    console.log("error en agregar", data)

                    console.log("error aqui ", data)
                    await getActions().verCarrito();

                    return data
                } catch (error) {
                    console.error("Error al agregar producto al carrito:", error);
                    throw error
                }
            },
            //Ver Carrito 
            verCarrito: async () => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/carrito`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    if (!response.ok) {
                        const errorData = await response.json()
                        console.log('Error al ver Carrito', errorData)
                        throw new Error(errorData.message || 'Error al ver Producto')
                    }
                    const data = await response.json()
                    let store = getStore()
                    setStore({ ...store, carrito: data || [] })
                } catch (error) {
                    console.log('Errro al obtener carrito', error)

                }
            },
            //Eliminar un producto del carrito por su id
            eliminarProductoCarrito: async (carritoId) => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                carritoId = carritoId || getStore().carrito?.id || localStorage.getItem('id')
                if (!carritoId) {
                    console.error("No se proporciono un ID valido", carritoId)
                    return;
                }
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/delete_carrito/${carritoId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                    });
                    if (!response.ok) {
                        const errorData = await response.json()
                        console.error("Error al Eliminar Producto del Carrito:", errorData);
                        throw new Error(errorData.error || 'error al Elinar el usuario')
                    }
                    console.log("Producto en Carrito no Encontrado:", carritoId)
                    const store = getStore()
                    console.log("Store antes de eliminar el prodcuto del carrito", store)
                    if (Array.isArray(store.carrito)) {
                        setStore({
                            ...store,
                            carrito: store.carrito.filter(carrito => carrito.id !== carritoId),
                            message: 'Producto del Carrito eliminado'
                        })
                    }
                    if (store.carrito && store.carrito.id === carritoId) {
                        setStore({
                            ...store,
                            carrito: null,
                            message: 'Producto eliminado exitosamente'
                        })
                    }

                } catch (error) {
                    console.error("Error al eliminar producto", error)
                    const store = getStore();
                    setStore({ ...store, message: error.message || "Error al eliminar el producto" });
                }
            },
            //Editar el Producto del Carrito 
            reducirCantidadCarrito: async (carrito_id, cantidadActual) => {
                const nuevaCantidad = cantidadActual - 1;
                const token = getStore().token;
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';

                try {
                    const response = await fetch(`${baseUrl}api/carrito/${carrito_id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ cantidad: nuevaCantidad })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Error al reducir cantidad");
                    }

                    const data = await response.json();
                    console.log(data.message || data.msg);
                    await getActions().verCarrito(); // refresca el carrito
                } catch (error) {
                    console.error("Error al reducir cantidad:", error.message);
                }
            },
            //Eliminar Carrito Completo 
            vaciarCarrito: async () => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                const token = getStore().token;

                try {
                    const response = await fetch(`${baseUrl}api/carrito`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Error al vaciar el carrito');
                    }

                    console.log("✅ Carrito vaciado exitosamente");
                    setStore({
                        ...getStore(),
                        carrito: [] // limpia visualmente
                    });

                } catch (error) {
                    console.error("❌ Error al vaciar el carrito:", error.message);
                }
            },
            getUsuario: async () => {
                const baseUrl = 'https://redesigned-halibut-6949wqj5p44xfrx46-5000.app.github.dev/';
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/user`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Error al obtener el usuario:", errorData);
                        throw new Error(errorData.error || 'Error al obtener el usuario');
                    }
                    const data = await response.json();
                    console.log("Usuario encontrado:", data); 
                    const store = getStore();
                    setStore({ ...store, user: data });
                } catch (error) {
                    console.error("Error al obtener el usuario:", error);
                    return null;
                }
            },
            //Log out de usuario o administrador 
            logout: () => {
                localStorage.removeItem("admin");
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("role");

                setStore({
                    admin: null,
                    user: null,
                    token: null
                });
            },
            syncTokenFromLocalStorage: () => { //Esto recupera el token y usuario al iniciar:
                const token = localStorage.getItem("token");
                const name = localStorage.getItem("name");
                const email = localStorage.getItem("email");
                const role = localStorage.getItem("role");
                const id = localStorage.getItem("id");

                if (token && role) {
                    setStore({
                        token: token,
                        user: {
                            name: name,
                            email: email,
                            role: role,
                            id: id
                        },
                        message: "Sesión restaurada desde localStorage"
                    });
                }
            }
        }
    }
}



export default getState;