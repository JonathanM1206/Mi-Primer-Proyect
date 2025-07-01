import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  // Estilos embebidos
  const containerStyle = {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  const gifStyle = {
    maxWidth: "600px",
    width: "100%",
    marginBottom: "1rem",
    animation: "bounce 2s infinite",
  };

  const bounceKeyframes = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `;

  return (
    <div style={containerStyle}>
      {/* Inyectamos keyframes en el DOM */}
      <style>{bounceKeyframes}</style>

      <img
        src="https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif" // Puedes cambiar este GIF si quieres otro estilo
        alt="Error 404 divertido"
        style={gifStyle}
      />

      <h1 className="display-4">404</h1>
      <p className="lead">Oops... Página no encontrada</p>
      <p>La página que estás buscando no existe o fue movida.</p>

      <Link to="/" className="btn btn-primary mt-3">
        <i className="fas fa-home"></i> Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;