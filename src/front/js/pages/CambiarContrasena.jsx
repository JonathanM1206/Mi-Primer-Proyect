import React,{useState,useContext} from "react"
import { Context } from "../store/appContext"

const CambiarContrasena = () => {

const { actions } = useContext(Context)

const [currentPassword,setCurrentPassword] = useState("")
const [newPassword,setNewPassword] = useState("")

const handleSubmit = async (e) => {

e.preventDefault()

await actions.changePassword(currentPassword,newPassword)

}

return(

<div className="container mt-5">

<h2>Cambiar contraseña</h2>

<form onSubmit={handleSubmit}>

<input
type="password"
placeholder="Contraseña actual"
value={currentPassword}
onChange={(e)=>setCurrentPassword(e.target.value)}
className="form-control mb-2"
/>

<input
type="password"
placeholder="Nueva contraseña"
value={newPassword}
onChange={(e)=>setNewPassword(e.target.value)}
className="form-control mb-2"
/>

<button
className="btn btn-success"
type="submit"
>

Cambiar contraseña

</button>

</form>

</div>

)

}

export default CambiarContrasena