import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext.jsx';
import swal from 'sweetalert';

const CrearProducto = () => {
    const [name, setName] = useState('');
    const [precio, setPrecio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [imagen, setImagen] = useState(null);
    const [cantidad, setCantidad] = useState('');
    const [categoria_id, setCategoriaId] = useState('');
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const { actions, store } = useContext(Context);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        actions.getCategorias();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let categoriaFinalId = categoria_id;

        // Si no seleccionó ninguna categoría del dropdown, usamos la nueva categoría
        if (!categoria_id && nuevaCategoria.trim() !== '') {
            const categoriaExistente = store.categorias.find(
                cat => cat.nombre.toLowerCase() === nuevaCategoria.trim().toLowerCase()
            );

            if (categoriaExistente) {
                // Pregunta si quiere usar la existente o crear nueva
                const respuesta = await swal({
                    title: "Categoría ya existe",
                    text: `La categoría "${nuevaCategoria.trim()}" ya existe. ¿Deseas usarla o crear una nueva con el mismo nombre?`,
                    buttons: {
                        usar: { text: "Usar existente", value: "usar" },
                        crear: { text: "Crear nueva", value: "crear" },
                        cancelar: { text: "Cancelar", value: "cancelar" },
                    },
                    icon: "warning",
                });

                if (respuesta === "usar") {
                    categoriaFinalId = categoriaExistente.categoria_id;
                } else if (respuesta === "crear") {
                    const nuevaCat = await actions.crearCategoria(nuevaCategoria.trim());
                    if (nuevaCat?.categoria?.categoria_id) {
                        categoriaFinalId = nuevaCat.categoria.categoria_id;
                    }
                } else {
                    // Si canceló
                    return swal("Cancelado", "No se agregó el producto", "info");
                }
            } else {
                // No existe, la creamos normalmente
                const nuevaCat = await actions.crearCategoria(nuevaCategoria.trim());
                if (nuevaCat?.categoria?.categoria_id) {
                    categoriaFinalId = nuevaCat.categoria.categoria_id;
                }
            }
        }

        try {
            await actions.crearProducto(name, descripcion, precio, imagen, cantidad, categoriaFinalId);

            swal("Producto creado", "El producto ha sido creado correctamente", "success");

            // Limpiar formulario
            setName(''); setPrecio(''); setDescripcion('');
            setImagen(null); setCantidad(''); setCategoriaId(''); setNuevaCategoria('');
            navigate("/crearProducto");

        } catch (err) {
            swal("Error", "Por favor, verifica los datos ingresados", "error");
            setError("Error al crear el producto");
        }
    };

    return (
        <div className='container mt-4'>
            <h1>Agregar Producto</h1>
            <form onSubmit={handleSubmit} className='formulario'>
                <input
                    type='text'
                    placeholder='Nombre'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className='form-control border-success shadow mb-3'
                />
                <input
                    type='number'
                    placeholder='Precio'
                    value={precio}
                    onChange={e => setPrecio(e.target.value)}
                    required
                    className='form-control border-success shadow mb-3'
                />
                <input
                    type='text'
                    placeholder='Descripción'
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    required
                    className='form-control border-success shadow mb-3'
                />
                <input
                    type='file'
                    onChange={e => setImagen(e.target.files[0])}
                    required
                    className='form-control border-success shadow mb-3'
                />

                {/* Dropdown de categorías existentes */}
                <select
                    className="form-select border-success shadow mb-3"
                    value={categoria_id}
                    onChange={(e) => setCategoriaId(e.target.value)}
                >
                    <option value="">Selecciona una categoría</option>
                    {store.categorias.map(cat => (
                        <option key={cat.categoria_id} value={cat.categoria_id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>

                {/* Input para nueva categoría solo si no seleccionó dropdown */}
                <input
                    type='text'
                    placeholder='Escribe una nueva categoría si no existe'
                    value={nuevaCategoria}
                    onChange={e => setNuevaCategoria(e.target.value)}
                    className='form-control border-success shadow mb-3'
                    disabled={categoria_id !== ""}
                />

                <input
                    type='number'
                    placeholder='Cantidad Disponible'
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                    required
                    className='form-control border-success shadow mb-3'
                />

                <button type="submit" className="btn btn-primary w-100">Agregar Producto</button>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </form>
        </div>
    );
};

export default CrearProducto;
