import swal from "sweetalert";

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
            categorias: [],
            productosPorCategoria: [], //guardaremos los productos filtrados 
            cat: [],
            pedidos: [],
            pedidoActual: null,
            guest_id: localStorage.getItem("guest_id") || null,
            historialPedidos: [],
            message: '', // Para mensajes de error o info




        },
        actions: {
            //Registrar un usuario
            registroUsuario: async (name, email, telefono, direccion, password) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/user`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ name, email, telefono, direccion, password })
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
                    setStore({ ...store, user: { name: data.name, email: data.email, telefono: data.telefono, direccion: data.direccion, role: data.role, id: data.id, password }, users: [...getStore().users, { name, email, password }], token: data.access_token, message: 'Usuario registrado exitosamente' });
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("role", data.role);
                    localStorage.setItem("email", data.email);
                    localStorage.setItem("id", data.id);
                    localStorage.setItem("name", data.name);
                    localStorage.setItem("telefono", data.telefono); // Asegúrate de que este campo sea correcto 
                    localStorage.setItem("direccion", data.direccion); // Asegúrate de que este campo sea correcto
                    localStorage.setItem("user", JSON.stringify({
                        name: data.name,
                        email: data.email,
                        telefono: data.telefono,
                        direccion: data.direccion,
                        role: data.role,
                        id: data.id
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
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
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
                        user: { name: data.name, email: data.email, telefono: data.telefono, direccion: data.direccion, role: data.role, id: data.id },//agregar el id y el role del usuario con emnail
                        token: data.access_token,
                        message: 'Usuario logueado exitosamente'
                    })
                    // Guardar datos en localStorage
                    localStorage.setItem("token", data.access_token);
                    localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email, role: data.role, id: data.id, telefono: data.telefono, direccion: data.direccion })); // Asegúrate de incluir todas las propiedades que necesitas, como 'name' que viene en 'data' del backend
                    localStorage.setItem("user_name", data.name);
                    localStorage.setItem("user_email", data.email);
                    localStorage.setItem("user_id", data.id);
                    localStorage.setItem("role", data.role);
                    localStorage.setItem("user_telefono", data.telefono); // Asegúrate de que este campo sea correcto 
                    localStorage.setItem("user_direccion", data.direccion); // Asegúrate de que este campo sea correcto

                    console.log("Usuario logueado:", data);
                } catch (error) {
                    console.error("Error al iniciar sesión:", error);
                    let store = getStore();
                    setStore({ ...store, message: error.message || "Error al iniciar sesión" });

                }
            },
            //Editando Usuario
            editarUsuario: async (userBody, userId) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
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
                    localStorage.setItem('user', JSON.stringify({
                        name: userBody.name,
                        email: userBody.email,
                        telefono: userBody.telefono, // Asegúrate de que este campo sea correcto 
                        direccion: userBody.direccion, // Asegúrate de que este campo sea correcto
                        role: getStore().user.role,
                        id: userId // 🔑 Este es el ID que debe estar aquí
                    }));
                    let store = getStore();
                    setStore({ ...store, user: { ...getStore().user, name: userBody.name, email: userBody.email, id: userId, telefono: userBody.telefono, direccion: userBody.direccion }, message: 'Usuario editado exitosamente' });
                    return true;

                } catch (error) {
                    console.error("Error al editar el usuario:", error);
                }
            },
            //Eliminar usuario 
            eliminarUsuario: async (userId) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
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
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
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
                    localStorage.setItem("admin_email", data.email);
                    localStorage.setItem("admin_name", data.name);
                    localStorage.setItem("admin_id", data.id);
                    localStorage.setItem("telefono", data.telefono); // Asegúrate de que este campo sea correcto
                    localStorage.setItem("admin", JSON.stringify({ name: data.name, email: data.email, role: data.role, id: data.id, telefono: data.telefono })); // Asegúrate de incluir todas las propiedades que necesitas, como 'name' que viene en 'data' del backend
                    console.log("Administrador logueado:", data);
                } catch (error) {
                    console.error("Error al iniciar sesión:", error);
                    let store = getStore();
                    setStore({ ...store, message: error.message || "Error al iniciar sesión" });

                }
            },
            //Editando Administrador 
            editarAdmin: async (adminBody, adminId) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const token = getStore().token;
                    const response = await fetch(`${baseUrl}api/edit_admin/${adminId}`, {
                        method: 'PUT',
                        body: JSON.stringify(adminBody),
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Error al editar el administrador');
                    }
                    console.log("Administrador editado exitosamente");

                    // 🔥 Guardar el admin actualizado en el localStorage (objeto completo)
                    localStorage.setItem('admin', JSON.stringify({
                        name: adminBody.name,
                        email: adminBody.email,
                        role: getStore().admin.role,
                        id: adminId // 🔑 Este es el ID que debe estar aquí
                    }));

                    let store = getStore();
                    setStore({
                        ...store,
                        admin: { ...getStore().admin, name: adminBody.name, email: adminBody.email, id: adminId },
                        message: 'Administrador editado exitosamente'
                    });
                    return true;

                } catch (error) {
                    console.error("Error al editar el administrador:", error);
                }
            },
            //Admin Elimina Usuario 
            eliminarUsuarioAdmin: async (userId) => {

                try {
                    const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                    const token = getStore().token;
                    console.log("Eliminando usuario con ID:", userId);
                    console.log("Token de autenticación:", token);
                    const response = await fetch(`${baseUrl}api/admin/delete_user/${userId}`, {
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
            //editar un producto por su id
            editarProducto: async (productoBody, productoId, nuevaImagen = null) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const token = getStore().token;

                    // Si hay nueva imagen, usar FormData; si no, usar JSON
                    let requestOptions;

                    if (nuevaImagen) {
                        // Usar FormData cuando hay nueva imagen
                        const formData = new FormData();
                        formData.append("name", productoBody.name);
                        formData.append("descripcion", productoBody.descripcion);
                        formData.append("precio", productoBody.precio.toString());
                        formData.append("cantidad", productoBody.cantidad.toString());
                        formData.append("imagen", nuevaImagen); // El archivo de imagen

                        requestOptions = {
                            method: 'PUT',
                            headers: {
                                Authorization: `Bearer ${token}`
                                // NO incluir Content-Type cuando usas FormData
                            },
                            body: formData
                        };
                    } else {
                        // Usar JSON cuando no hay nueva imagen
                        requestOptions = {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify(productoBody)
                        };
                    }

                    const response = await fetch(`${baseUrl}api/edit_producto/${productoId}`, requestOptions);

                    console.log('Respuesta del servidor:', response);

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Error al editar el producto:", errorData);
                        throw new Error(errorData.error || errorData.msg || 'Error al editar el producto');
                    }

                    const data = await response.json();
                    console.log("Producto editado exitosamente:", data);

                    // Actualizar localStorage
                    localStorage.setItem('producto_name', productoBody.name);
                    localStorage.setItem('producto_descripcion', productoBody.descripcion);
                    localStorage.setItem('producto_precio', productoBody.precio);
                    localStorage.setItem('producto_cantidad', productoBody.cantidad);

                    // Actualizar imagen en localStorage si hay datos del servidor
                    if (data.producto && data.producto.imagen) {
                        localStorage.setItem('producto_imagen', data.producto.imagen);
                    }

                    // Actualizar el store
                    let store = getStore();
                    setStore({
                        ...store,
                        producto: {
                            ...getStore().producto,
                            name: productoBody.name,
                            descripcion: productoBody.descripcion,
                            precio: productoBody.precio,
                            cantidad: productoBody.cantidad,
                            imagen: data.producto ? data.producto.imagen + "?t=" + new Date().getTime() : productoBody.imagen
                        },
                        message: 'Producto editado exitosamente'
                    });

                    return true;

                } catch (error) {
                    console.error("Error al editar el producto:", error);
                    throw error; // Re-lanzar el error para que lo maneje el componente
                }
            },
            //Ver todos los productos 
            getProductos: async () => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/'

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
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
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
                    const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';

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

            //Crear un producto 
            crearProducto: async (name, descripcion, precio, imagen, cantidad, categoria_id) => {
                console.log("Creando producto", name, descripcion, precio, imagen, cantidad)

                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/'

                try {
                    const formData = new FormData()
                    formData.append("name", name)
                    formData.append("descripcion", descripcion)
                    formData.append("categoria_id", categoria_id)
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
            //Agregar un producto al carrito 
            agregarProductoCarrito: async (productoId, cantidad = 1) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const token = getStore().token;
                    let guestId = localStorage.getItem("guest_id");

                    // Si no hay guest_id, creamos uno (por única vez)
                    if (!guestId) {
                        guestId = crypto.randomUUID(); // genera un id único
                        localStorage.setItem("guest_id", guestId);
                    }

                    const response = await fetch(`${baseUrl}api/carrito`, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}) // solo si hay token
                        },
                        body: JSON.stringify({ product_id: productoId, cantidad, guest_id: guestId })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Error al agregar Producto');
                    }

                    const data = await response.json();
                    await getActions().verCarrito();
                    return data;
                } catch (error) {
                    console.error("Error al agregar producto al carrito:", error);
                    throw error;
                }
            },

            //Ver Carrito 
            verCarrito: async () => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                const token = getStore().token;
                const guestId = localStorage.getItem("guest_id");
                const url = token
                    ? `${baseUrl}api/carrito`
                    : `${baseUrl}api/carrito?guest_id=${guestId}`;

                const response = await fetch(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                if (!response.ok) throw new Error("Error al ver carrito");
                const data = await response.json();
                setStore({ ...getStore(), carrito: data });
            },

            //Eliminar un producto del carrito por su id
            eliminarProductoCarrito: async (carritoId) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
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
            //Editar el Producto del Carrito Reduciendo 
            reducirCantidadCarrito: async (carrito_id, cantidadActual) => {
                const nuevaCantidad = cantidadActual - 1;
                const token = getStore().token;
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';

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
            //Editar el Producto del Carrito Aumentando
            aumentarCantidadCarrito: async (carrito_id, cantidadActual) => {
                const nuevaCantidad = cantidadActual + 1;
                const token = getStore().token;
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';

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
                        throw new Error(errorData.error || "Error al aumentar cantidad");
                    }

                    const data = await response.json();
                    console.log(data.message || data.msg);
                    await getActions().verCarrito(); // refresca el carrito
                } catch (error) {
                    console.error("Error al aumentar cantidad:", error.message);
                    swal("Error", error.message, "error");
                }
            },

            //Eliminar Carrito Completo 
            vaciarCarrito: async () => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
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
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
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
                localStorage.removeItem("carrito");
                setStore({
                    admin: null,
                    user: null,
                    token: null,
                    carrito: [],
                    message: "Sesión cerrada exitosamente"
                });
            },
            syncTokenFromLocalStorage: () => {
                const token = localStorage.getItem("token");
                const role = localStorage.getItem("role");

                // Recuperar usuario
                const user = JSON.parse(localStorage.getItem("user"));

                // Recuperar administrador
                const admin = JSON.parse(localStorage.getItem("admin"));

                if (token && role && user && role === "user") {
                    // Si es usuario normal
                    setStore({
                        token: token,
                        user: {
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            id: user.id // 👈 Asegúrate que este sea el id correcto que guardaste
                        },
                        message: "Sesión de usuario restaurada desde localStorage"
                    });
                } else if (token && role && admin && role === "admin") {
                    // Si es administrador
                    setStore({
                        token: token,
                        admin: {
                            name: admin.name,
                            email: admin.email,
                            role: admin.role,
                            id: admin.id // 👈 Asegúrate que este sea el id correcto que guardaste
                        },
                        message: "Sesión de administrador restaurada desde localStorage"
                    });
                }
            },
            //Ver Categorias en Navbar
            getCategorias: async () => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const store = getStore();
                    const response = await fetch(`${baseUrl}api/categoria`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.msg || 'Error al cargar categorías');
                    }
                    const data = await response.json();
                    // Guardamos la lista de categorías en el store para usar en componentes
                    setStore({
                        ...store,
                        categorias: data,
                        message: '', // Limpio mensaje de error si había
                    });
                } catch (error) {
                    console.error("Error al cargar categorías:", error);
                }
            },


            crearCategoria: async (nombre) => {
                const token = localStorage.getItem("token");
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const response = await fetch(`${baseUrl}api/categoria`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({ nombre })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        getActions().getCategorias(); // refresca las categorías
                        return data;
                    } else {
                        const error = await response.json();
                        console.error("Error al crear categoría:", error.msg || error);
                    }
                } catch (error) {
                    console.error("Error al crear categoría:", error);
                }
            },

            eliminarCategoria: async (categoria_id) => {
                const token = localStorage.getItem("token");
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const response = await fetch(`${baseUrl}api/categoria/${categoria_id}`, {
                        method: "DELETE",
                        headers: { "Authorization": "Bearer " + token }
                    });
                    if (response.ok) {
                        getActions().getCategorias(); // refresca la lista
                    } else {
                        const error = await response.json();
                        console.error("Error al eliminar categoría:", error.msg || error);
                    }
                } catch (error) {
                    console.error("Error al eliminar categoría:", error);
                }
            },
            //Ver Productos por su categoria  
            getProductosPorCategoria: async (categoria_id) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const store = getStore();
                    const response = await fetch(`${baseUrl}api/productos/categoria/${categoria_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.msg || 'Error al cargar productos por categoría');
                    }

                    const data = await response.json();

                    setStore({
                        ...store,
                        productosPorCategoria: data, // Guardamos los productos filtrados en el store
                        message: ''
                    });

                } catch (error) {
                    console.error("Error al cargar productos por categoría:", error);
                    setStore({
                        ...getStore(),
                        productosPorCategoria: [], // Limpia si hay error
                        message: error.message
                    });
                }
            },
            //Informacion de Categoria 
            getCategoriaPorId: async (categoria_id) => {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const store = getStore();
                    const response = await fetch(`${baseUrl}api/categoria/${categoria_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Error al cargar la categoría');
                    }

                    const data = await response.json();

                    setStore({
                        ...store,
                        cat: data  // Guardamos la categoría en store
                    });

                } catch (error) {
                    console.error(error);
                    setStore({
                        ...getStore(),
                        cat: null
                    });
                }
            },
            //Nombre de la Categoria  
            editarCategoria: async (categoria_id, nuevoNombre) => {
                const token = localStorage.getItem("token");
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                try {
                    const response = await fetch(`${baseUrl}api/categoria/${categoria_id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({ nombre: nuevoNombre })
                    });
                    if (response.ok) {
                        getActions().getCategorias(); // Refresca la lista
                    } else {
                        const error = await response.json();
                        console.error("Error al editar categoría:", error.msg || error);
                    }
                } catch (error) {
                    console.error("Error al editar categoría:", error);
                }
            },

            // 🔹 Crear Pedido (guest o usuario)
            crearPedido: async (datosPedido) => { 
                                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';

                try {
                    const store = getStore();

                    // Si no hay guest_id, generamos uno y lo guardamos
                    if (!store.guest_id) {
                        const nuevoGuestId = crypto.randomUUID();
                        localStorage.setItem("guest_id", nuevoGuestId);
                        setStore({ guest_id: nuevoGuestId });
                        datosPedido.guest_id = nuevoGuestId;
                    }

                    const response = await fetch(`${baseUrl}pedido`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(datosPedido),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Error al crear pedido");
                    }

                    // Guardamos el pedido creado en el store
                    setStore({
                        ...store,
                        pedidoActual: data,
                        message: data.msg,
                    });

                    return true;

                } catch (error) {
                    console.error("Error al crear pedido:", error);
                    setStore({ message: error.message });
                    return false;
                }
            },

            // 🔹 Simular Pago (PixelPay prueba)
            pagarPedidoPrueba: async (pedido_id, metodo = "pixelpay") => { 
                                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';

                try {
                    const response = await fetch(`${baseUrl}pago/prueba`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ pedido_id, metodo }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Error al procesar pago");
                    }

                    console.log("✅ Pago completado:", data);
                    setStore({
                        ...getStore(),
                        message: "Pago completado correctamente",
                    });

                    return true;

                } catch (error) {
                    console.error("Error en pago prueba:", error);
                    setStore({ message: error.message });
                    return false;
                }
            },
            // 🔹 Ver historial de pedidos (user o guest)
            getHistorialPedidos: async () => { 
                                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';

                try {
                    const store = getStore();
                    const user = store.user;
                    const guest_id = store.guest_id;

                    let url = `${baseUrl}pedidos?`;

                    if (user && user.user_id) {
                        url += `user_id=${user.user_id}`;
                    } else if (guest_id) {
                        url += `guest_id=${guest_id}`;
                    } else {
                        throw new Error("No se encontró usuario ni guest_id");
                    }

                    const response = await fetch(url, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Error al obtener pedidos");
                    }

                    setStore({
                        ...store,
                        historialPedidos: data,
                        message: "",
                    });

                } catch (error) {
                    console.error("Error al obtener historial:", error);
                    setStore({ historialPedidos: [], message: error.message });
                }
            },
            // 🔹 Registrar invitado rápido
            registrarInvitado: async (formData) => {
                try {
                const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';
                    const response = await fetch(`${baseUrl}api/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (!response.ok) throw new Error(data.msg || "Error al registrar usuario");

                    // Guardamos el token
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("role", "user");

                    setStore({
                        token: data.token,
                        user: data.user,
                        role: "user",
                    });

                    return true;

                } catch (error) {
                    console.error("Error al registrar invitado:", error);
                    setStore({ message: error.message });
                    return false;
                }
            },





        }
    }
}



export default getState;