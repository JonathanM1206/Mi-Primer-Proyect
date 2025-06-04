import React,{useState,useContext,useEffect} from 'react'  
import { useNavigate } from 'react-router-dom'
import { Context } from '../store/appContext.jsx' 
import { Link } from 'react-router-dom'

const LoginAdmin = () => { 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { actions, store } = useContext(Context)
  const [error, setError] = useState('') 
  const navigate = useNavigate() 
  const [loading, setLoading] = useState(false) 

  const handleSubmit = async (e) => { 
    e.preventDefault() 
    setLoading(true) 
    setError('') 
    
    const success = await actions.loginAdmin(email, password) 
    setLoading(false) 
    
    if(!success){ 
      setError('Error al iniciar sesión. Verifica tus credenciales.')
    }
    }
    useEffect(() => {
    if (store.admin && store.admin.role) {
        if (store.admin.role === 'admin') {
            navigate("/");
        } else {
            navigate("access-admin-1206");
        }
    }
}, [store.admin, navigate]);
  return (
    <div> 
        <div>  
            <h1>HOLA ADMINISTRADOR</h1>
            <form onSubmit={handleSubmit}> 
              
                        <div className="mb-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control border-success shadow"
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-control border-success shadow"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-lg w-100 shadow mt-3 mb-3 d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "#2196F3", color: "white", border: "none" }}
                            disabled={loading}>
                            {loading ? (
                                <div className="spinner-border spinner-border-sm text-light" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </button>
                        {error && <p className="text-danger text-center mt-2">{error}</p>}
                       
    
            </form>
          </div></div>
  )
}

export default LoginAdmin