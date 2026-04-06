import React, { useState, useContext } from "react"
import { Context } from "../store/appContext"
import { useNavigate } from "react-router-dom"

const RecuperarContrasena = () => {

const { actions } = useContext(Context)

const navigate = useNavigate()

// controla el paso del formulario
const [step,setStep] = useState(1)

const [email,setEmail] = useState("")
const [codigo,setCodigo] = useState("")
const [password,setPassword] = useState("")

// PASO 1 → enviar email
const enviarCorreo = async (e) => {

e.preventDefault()

const success = await actions.forgotPassword(email)

if(success){
setStep(2)
}

}

// PASO 2 → cambiar contraseña
const cambiarPassword = async (e) => {

e.preventDefault()

const success = await actions.resetPassword(email,codigo,password)

if(success){
navigate("/loginUsuario")
}

}

return(

<div className="container mt-5">

<h2>Recuperar contraseña</h2>

{/* PASO 1 */}

{step === 1 && (

<form onSubmit={enviarCorreo}>

<input
type="email"
placeholder="Ingresa tu correo"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="form-control"
/>

<button
className="btn btn-primary mt-3"
type="submit" 
style={{marginBottom:"200px"}}
>

Enviar código

</button>

</form>

)}

{/* PASO 2 */}

{step === 2 && (

<form onSubmit={cambiarPassword}>

<input
type="email"
placeholder="Correo"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="form-control mb-2"
/>

<input
type="text"
placeholder="Código de recuperación"
value={codigo}
onChange={(e)=>setCodigo(e.target.value)}
className="form-control mb-2"
/>

<input
type="password"
placeholder="Nueva contraseña"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="form-control mb-2"
/>

<button
className="btn btn-success"
type="submit"
>

Cambiar contraseña

</button>

</form>

)}

</div>

)

}

export default RecuperarContrasena