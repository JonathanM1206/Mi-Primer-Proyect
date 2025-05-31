import React from 'react'  
import { Link } from "react-router-dom";


const navbar = () => {
  return (
       <nav style={{ backgroundColor: "#333", padding: "1rem" }}>
            <Link to="/" style={{ color: "white", marginRight: "0", textDecoration: "none" }}>
                        Home
            </Link>
        </nav>
  )
}

export default navbar