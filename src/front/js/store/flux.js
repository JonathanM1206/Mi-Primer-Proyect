import swal from "sweetalert";

const getState = ({ getStore, getActions, setStore }) => {
    const baseUrl = 'https://gloomy-troll-6949wqj5prw6f47vp-5000.app.github.dev/';

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
            productosBuscados: [], // resultados de productos
            clientesBuscados: [],  // resultados de clientes   




        },
        actions: {
            //Registrar un usuario
            registroUsuario: async (name, email, telefono, direccion, password) => {
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

                        }

                        throw new Error(errorMessage);

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
                    return true;
                } catch (error) {
                    console.error("Error al registrar el usuario:", error);
                    let store = getStore();
                    setStore({ ...store, message: error.message || "Error al registrar el usuario" });
                    throw error;   // traiga el error del backend 
                }
            },
            //Login de usuario 
            loginUsuario: async (email, password) => {
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
                carritoId = carritoId || getStore().carrito?.id || localStorage.getItem('id')
                if (!carritoId) {
                    console.error("No se proporciono un ID valido", carritoId)
                    return;
                }
                try {
                    const token = getStore().token;
                    const guestId = localStorage.getItem("guest_id");

                    const response = await fetch(`${baseUrl}api/delete_carrito/${carritoId}?guest_id=${guestId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                        }
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

                const nuevaCantidad = cantidadActual - 1; // calcula la nueva cantidad restando 1

                const token = getStore().token; // obtiene el token si el usuario está logueado
                const guestId = localStorage.getItem("guest_id"); // obtiene el guest_id si es invitado


                try {

                    const response = await fetch(`${baseUrl}api/carrito/${carrito_id}`, {
                        method: "PUT", // método HTTP para editar
                        headers: {
                            "Content-Type": "application/json", // indica que enviamos JSON
                            ...(token ? { Authorization: `Bearer ${token}` } : {}) // solo agrega token si existe
                        },
                        body: JSON.stringify({
                            cantidad: nuevaCantidad, // cantidad actualizada
                            guest_id: guestId // necesario para identificar al invitado
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json(); // obtiene error del backend
                        throw new Error(errorData.error || "Error al reducir cantidad");
                    }

                    const data = await response.json(); // obtiene respuesta exitosa

                    console.log(data.message || data.msg); // muestra mensaje del backend

                    await getActions().verCarrito(); // vuelve a cargar el carrito actualizado

                } catch (error) {

                    console.error("Error al reducir cantidad:", error.message); // muestra error en consola

                }
            },
            //Editar el Producto del Carrito Aumentando
            aumentarCantidadCarrito: async (carrito_id, cantidadActual) => {

                const nuevaCantidad = cantidadActual + 1; // suma 1 a la cantidad actual

                const token = getStore().token; // obtiene token si el usuario está logueado
                const guestId = localStorage.getItem("guest_id"); // obtiene guest_id si es invitado


                try {

                    const response = await fetch(`${baseUrl}api/carrito/${carrito_id}`, {
                        method: "PUT", // método PUT para actualizar recurso
                        headers: {
                            "Content-Type": "application/json", // enviamos JSON
                            ...(token ? { Authorization: `Bearer ${token}` } : {}) // solo agrega Authorization si hay token
                        },
                        body: JSON.stringify({
                            cantidad: nuevaCantidad, // nueva cantidad
                            guest_id: guestId // identificador del invitado
                        })
                    });

                    if (!response.ok) {

                        const errorData = await response.json(); // obtiene error del backend

                        throw new Error(errorData.error || "Error al aumentar cantidad");

                    }

                    const data = await response.json(); // obtiene respuesta del backend

                    console.log(data.message || data.msg); // imprime mensaje de éxito

                    await getActions().verCarrito(); // refresca el carrito

                } catch (error) {

                    console.error("Error al aumentar cantidad:", error.message); // muestra error

                    swal("Error", error.message, "error"); // alerta visual

                }

            },

            //Eliminar Carrito Completo 
            vaciarCarrito: async () => {
                const token = getStore().token;

                try {
                    const guestId = localStorage.getItem("guest_id");

                    const response = await fetch(`${baseUrl}api/carrito?guest_id=${guestId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
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

            // Asignar Producto Creado a Categoria: 
            asignarCategoriaProducto: async (product_id, categoria_id) => {

                const token = localStorage.getItem("token");


                try {

                    const response = await fetch(`${baseUrl}api/producto/${product_id}/categoria/${categoria_id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        }
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.msg || "Error asignando categoria");
                    }

                    await getActions().getProductos(); // refresca productos

                } catch (error) {

                    console.error(error);

                }

            },
            //Quitar de Producto Creado de una Categoria: 
            quitarCategoriaProducto: async (product_id) => {

                const token = localStorage.getItem("token");


                try {

                    const response = await fetch(`${baseUrl}api/producto/${product_id}/categoria`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.msg || "Error quitando categoria");
                    }

                    await getActions().getProductos();

                } catch (error) {

                    console.error(error);

                }

            },

            // 🔹 Crear Pedido (guest o usuario)
            crearPedido: async (datosPedido) => {

                try {

                    const store = getStore(); // obtenemos estado

                    let guestId = store.guest_id; // guest actual

                    if (!guestId) {

                        guestId = crypto.randomUUID(); // generamos uuid
                        localStorage.setItem("guest_id", guestId); // guardamos en localstorage

                        setStore({ guest_id: guestId }); // guardamos en store

                    }

                    const payload = {

                        ...datosPedido, // datos del pedido
                        user_id: store.user?.id || null, // usuario si existe
                        guest_id: guestId // guest id

                    };

                    const response = await fetch(`${baseUrl}api/pedido`, {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(payload)

                    });

                    const data = await response.json();

                    if (!response.ok) {

                        throw new Error(data.error || "Error al crear pedido");

                    }

                    setStore({

                        pedidoActual: data,
                        message: data.msg

                    });

                    return data;

                } catch (error) {

                    console.error("Error al crear pedido:", error);

                    setStore({ message: error.message });

                    return false;

                }

            },

            // 🔹 Ver historial de pedidos (user o guest)
            getHistorialPedidos: async () => {

                try {

                    const store = getStore();

                    let user = store.user;

                    // 🔹 si el store está vacío, leer localStorage
                    if (!user || !user.id) {
                        const localUser = JSON.parse(localStorage.getItem("user"));
                        if (localUser) {
                            user = localUser;
                        }
                    }

                    const guest_id = store.guest_id;

                    let url = `${baseUrl}api/pedidos?`;

                    if (user && user.id) {

                        url += `user_id=${user.id}`;

                    } else if (guest_id) {

                        url += `guest_id=${guest_id}`;

                    } else {

                        throw new Error("No se encontró usuario ni guest_id");

                    }

                    const response = await fetch(url, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" }
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Error al obtener pedidos");
                    }

                    setStore({
                        ...store,
                        historialPedidos: data,
                        message: ""
                    });

                } catch (error) {

                    console.error("Error al obtener historial:", error);

                    setStore({
                        historialPedidos: [],
                        message: error.message
                    });

                }

            },

            // Pedido por ID de User: 
            getPedidosPorUsuario: async (user_id) => {

                try {

                    const response = await fetch(`${baseUrl}api/pedidos/usuario/${user_id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    if (!response.ok) {
                        throw new Error("Error al obtener pedidos");
                    }

                    const data = await response.json();

                    setStore({ historialPedidos: data });

                } catch (error) {

                    console.error("Error:", error);

                }

            },
            // 🔹 Pagar al recibir
            pagarContraEntrega: async (pedido_id) => {

                try {

                    const response = await fetch(`${baseUrl}api/pago/contra_entrega`, {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            pedido_id: pedido_id
                        })

                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Error al crear pago");
                    }

                    console.log("Pago contra entrega creado:", data);

                    return data;

                } catch (error) {

                    console.error("Error pago contra entrega:", error);
                    return null;

                }

            },

            // 🔹 Pagar por transferencia
            pagarTransferencia: async (pedido_id) => {

                try {

                    const response = await fetch(`${baseUrl}api/pago/transferencia`, {

                        method: "POST", // tipo de petición

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            pedido_id: pedido_id
                        })

                    });

                    const data = await response.json();

                    if (!response.ok) {

                        throw new Error(data.error || "Error al crear pago");

                    }

                    console.log("Pago por transferencia creado:", data);

                    return data; // devolvemos el pago creado

                } catch (error) {

                    console.error("Error en pago transferencia:", error);

                    return null;

                }

            },


            //Pedidos Por Fechas: 
            getPedidosPorFecha: async (fecha) => {

                try {

                    const response = await fetch(`${baseUrl}api/admin/pedidos/fecha/${fecha}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error(data.error)
                    }

                    setStore({ pedidos: data })

                } catch (error) {

                    console.error("Error:", error)

                }

            },

            //Actualizar Estado:  De pendiente a Pagado
            // 🔹 Actualizar Estado de Pago
            actualizarEstadoPago: async (pago_id, estado) => {

                const store = getStore(); // obtenemos el estado actual

                try {

                    const response = await fetch(`${baseUrl}api/pago/${pago_id}`, {
                        method: "PUT", // método para actualizar
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ estado }) // enviamos el nuevo estado
                    });

                    const data = await response.json(); // convertimos respuesta a JSON

                    if (!response.ok) {
                        throw new Error(data.error || "Error actualizando pago");
                    }

                    // 🔹 ACTUALIZAR STORE LOCALMENTE
                    const pedidosActualizados = store.pedidos.map(pedido => {

                        return {

                            ...pedido, // copiamos el pedido

                            pagos: pedido.pagos.map(pago => {

                                // si encontramos el pago que actualizamos
                                if (pago.pago_id === pago_id) {

                                    return {
                                        ...pago,
                                        estado: estado // cambiamos estado
                                    };

                                }

                                return pago; // si no es el pago correcto lo dejamos igual

                            })

                        };

                    });

                    // guardamos el nuevo estado en el store
                    setStore({
                        pedidos: pedidosActualizados
                    });

                    swal("Actualizado", "Estado actualizado", "success");

                } catch (error) {

                    swal("Error", error.message, "error");

                }

            },
            // 🔹 Actualizar estado de envío  PREPARANDO O ENTREGADO
            actualizarEstadoEnvio: async (pedido_id, estado_envio) => {

                const store = getStore();

                try {

                    const response = await fetch(`${baseUrl}api/pedido/${pedido_id}/envio`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ estado_envio })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Error actualizando envío");
                    }

                    const pedidosActualizados = store.pedidos.map(pedido => {

                        if (pedido.pedido_id === pedido_id) {
                            return {
                                ...pedido,
                                estado_envio: estado_envio
                            };
                        }

                        return pedido;
                    });

                    setStore({ pedidos: pedidosActualizados });

                    swal("Actualizado", "Estado de envío actualizado", "success");

                } catch (error) {

                    swal("Error", error.message, "error");

                }

            },
            // 🔹 Cancelar pedido
            cancelarPedido: async (pedido_id) => {

                const store = getStore()

                try {

                    const response = await fetch(`${baseUrl}api/pedido/${pedido_id}/cancelar`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error(data.error || "Error cancelando pedido")
                    }

                    // actualizar store
                    const pedidosActualizados = store.pedidos.map(pedido => {

                        if (pedido.pedido_id === pedido_id) {
                            return {
                                ...pedido,
                                estado: "cancelado",
                                estado_envio: "cancelado"
                            }
                        }

                        return pedido
                    })

                    setStore({ pedidos: pedidosActualizados })

                    swal("Cancelado", "Pedido cancelado correctamente", "success")

                } catch (error) {

                    swal("Error", error.message, "error")

                }

            },

            //Buscadores para Productos y CLientes 
            buscarProductos: async (query) => {
                try {
                    const response = await fetch(`${baseUrl}/api/buscar/productos?query=${query}`, {
                        method: 'GET'

                    });


                    if (!response.ok) {
                        throw new Error("Error al buscar productos");
                    }

                    const data = await response.json();
                    const store = getStore();

                    setStore({
                        ...store,
                        productosBuscados: Array.isArray(data) ? data : []
                    });

                } catch (error) {
                    console.error(error);
                    setStore({ productosBuscados: [] });
                }
            },//Fin del buscarProductos 


            buscarClientes: async (query) => {
                const token = getStore().token;

                try {
                    const response = await fetch(`${baseUrl}/api/buscar/clientes?query=${query}`, {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error("Error al buscar clientes");
                    }

                    const data = await response.json();

                    const store = getStore();
                    setStore({
                        ...store,
                        clientesBuscados: data // array de clientes
                    });

                } catch (error) {
                    console.error(error);
                }
            },

            //Guardar Comentarios en cada pedido
            //Guardar Comentarios en cada pedido
            actualizarComentarioPedido: async (pedido_id, comentario) => {

                const store = getStore() // obtenemos el store actual

                try {

                    const response = await fetch(`${baseUrl}api/pedido/${pedido_id}/comentario`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ comentario })
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error(data.error)
                    }

                    // 🔹 ACTUALIZAR EL STORE
                    const pedidosActualizados = store.pedidos.map(pedido => {

                        if (pedido.pedido_id === pedido_id) {

                            return {
                                ...pedido,
                                comentario: comentario // cambiamos comentario
                            }

                        }

                        return pedido

                    })

                    setStore({
                        pedidos: pedidosActualizados
                    })

                    swal("Guardado", "Comentario actualizado", "success")

                } catch (error) {

                    swal("Error", error.message, "error")

                }

            },


        }
    }
}



export default getState;