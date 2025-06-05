import React,{useState,useContext} from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { Context } from '../store/appContext.jsx';

const RegistroUsuario = () => { 
const[name, setName] = useState('');
const[email, setEmail] = useState('');
const[password, setPassword] = useState(''); 
const { actions,store } = useContext(Context);  
const [error, setError] = useState('');

const navigate = useNavigate(); 

const handleSubmit = async (e) => { 
e.preventDefault(); 
await actions.registroUsuario(name, email, password); 

if(store.user){ 
  navigate("/loginUsuario");
}

} 



  return (
        <div className="d-flex justify-content-center  vh-100" style={{ background: "linear-gradient(135deg,rgb(3, 3, 94), #2196F3)" }}>
        <div className="card p-4 shadow mt-5" style={{ width: "30rem", height:"30rem", borderRadius: "15px", backgroundColor: "#ffffff", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}>
            <h1 className="text-center"> <strong>REGISTRATE</strong></h1><br />
            <h3 className="text-center">CREA TU CUENTA</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <input
                        type="text"
                        placeholder="Usuario"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="form-control border-success shadow"
                    />
                </div>
                <div className="mb-5">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-control border-success shadow"
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
                    />
                </div>
                <button type="submit" className="btn btn-lg w-100 mt-3 shadow" style={{ backgroundColor: "#2196F3", color: "white", border: "none" }}>REGISTRAR</button>
                {error && <p className="text-danger text-center mt-2">{error}</p>}
            </form>
        </div>
    </div>
  )
}

export default RegistroUsuario