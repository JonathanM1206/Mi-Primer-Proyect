import React,{useState,useContext, useEffect}from 'react' 
import { useNavigate } from 'react-router-dom'
import { Context } from '../store/appContext.jsx' 
import swal from 'sweetalert'

const CrearProducto = () => {  
    const [name, setName] = useState('')
    const [precio, setPrecio] = useState('')
    const [descripcion, setDescripcion] = useState('') 
    const [imagen, setImagen] = useState('')  
    const [cantidad, setCantidad] = useState('')  
    const [categoria_id, setCategoriaId] = useState('') // Nuevo estado para la categoría
    const { actions,store } = useContext(Context) 
    const [error, setError] = useState('')

    const navigate = useNavigate()  
    
    const resetForm = () => {
    setName('');
    setPrecio('');
    setDescripcion('');
    setImagen('');
    setCantidad('');  
    setCategoriaId(''); // Limpiar el estado de la categoría
};

    const handleSubmit = async (e) => { 
        e.preventDefault() 
        await actions.crearProducto(name, descripcion, precio, imagen, cantidad, categoria_id) // Pasar la categoría al crear el producto

        if(store.producto){  
            swal("Producto creado", "El producto ha sido creado correctamente", "success"); 
            resetForm(); // Limpiar los campos después de crear

            navigate("/crearProducto") 
        }else{ 
            swal("Error al crear el producto", "Por favor, verifica los datos ingresados", "error");
            setError("Error al crear el producto. Por favor, verifica los datos ingresados.");
        }
    }

useEffect(() => { 
actions.getCategorias() // Cargar las categorías al montar el componente
},[]);//me falta agregar el post en el fluxz de categorias NOTA LEER AQUI agregar dropdown para ver categorias existentes y de igual forma input para nueva categoria 
  return (
    <div className='container'>  
    <h1> Agregar Producto</h1>
        <div className='Cuerpo'> 
            <form onSubmit={handleSubmit} className='formulario'> 
                <div className='mb-5'> 
                <input type='text' placeholder='Nombre' value={name} onChange={(e)=>setName(e.target.value)} required className='form-control border-success shadow'/>
                </div> 
                 <div className='mb-5'> 
                <input type='number' placeholder='Precio' value={precio} onChange={(e)=>setPrecio(e.target.value)} required className='form-control border-success shadow'/>
                </div> 
                 <div className='mb-5'> 
                <input type='text' placeholder='Descripcion' value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} required className='form-control border-success shadow'/>
                </div>  
                <div> 
                <input type='file' placeholder='Imagen'  onChange={(e)=>setImagen(e.target.files[0])} required className='form-control border-success shadow'/>
                </div> 
                <div className='mb-5'> 
                <input type='text' placeholder='Categori' value={categoria_id} onChange={(e)=>setCategoriaId(e.target.value)} required className='form-control border-success shadow'/>
                </div> 
                 <div className='mb-5'> 
                <input type='number' placeholder='Cantidad Disponible' value={cantidad} onChange={(e)=>setCantidad(e.target.value)} required className='form-control border-success shadow'/>
                </div> 
                <button type="submit" className="btn btn-lg w-100 mt-3 shadow" style={{ backgroundColor: "#2196F3", color: "white", border: "none" }}>Agregar</button>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </form> 

        </div>
    </div>
  )
}

export default CrearProducto