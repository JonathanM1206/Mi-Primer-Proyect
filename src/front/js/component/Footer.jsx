import React from "react";

import instag from "../../../assets/insta.png";
import faceb from "../../../assets/face.png";
import tikto from "../../../assets/tik.png";
import g from "../../../assets/gmail.png";
import what from "../../../assets/wha.png";

const Footer = () => {
    return (
        <footer className="mt-12 text-white" style={{ backgroundColor: "#247456" }}>

            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* GRID PRINCIPAL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center lg:text-left">

                    {/* MARCA + REDES */}
                    <div className="flex flex-col items-center lg:items-start">
                        <h3 className="text-2xl font-bold">
                            Fuente de Salud Bethel
                        </h3>

                        <div className="border-t border-gray-300 w-24 my-4"></div>

                        <p className="text-sm text-gray-200 mb-6">
                            Bienestar y salud natural para toda la familia.
                        </p>

                        {/* Redes Sociales */}
                        <div className="flex justify-center lg:justify-start gap-5 mb-6">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
                                <img src={faceb} alt="Facebook" className="w-8 h-8 object-contain" style={{ width: '45px', height: '50px' }} />
                            </a>

                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
                                <img src={instag} alt="Instagram" className="w-8 h-8 object-contain" style={{ width: '50px', height: '60px' }} />
                            </a>

                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
                                <img src={tikto} alt="TikTok" className="w-8 h-8 object-contain" style={{ width: '50px', height: '60px' }} />
                            </a>
                            <hr style={{ borderTop: "1px solid white", opacity: "0.3" }} />
                        </div>

                        {/* CONTACTO */}
                        <h4 className="text-lg font-semibold">
                            Contactanos
                        </h4>

                        <div className="border-t border-gray-300 w-20 my-4"></div>

                        <div className="flex justify-center lg:justify-start items-center gap-6">
                            <a href="https://wa.me/50400000000" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
                                <img src={what} alt="WhatsApp" className="w-10 h-10 object-contain" style={{ width: '50px', height: '60px' }} />
                            </a>

                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ventas@bethel.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
                                <img src={g} alt="Gmail" className="w-10 h-10 object-contain" style={{ width: '70px', height: '60px' }} />
                            </a>
                        </div>
                        <hr style={{ borderTop: "1px solid white", opacity: "0.3" }} />
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="flex flex-col items-center lg:items-start">
                        <h4 className="text-lg font-semibold">
                            Información
                        </h4>

                        <div className="border-t border-gray-300 w-20 my-4"></div>

                        <ul className="space-y-2 text-sm text-gray-200">
                            <li className="hover:text-white cursor-pointer transition">
                                Política de privacidad
                            </li>
                            <li className="hover:text-white cursor-pointer transition">
                                Términos & Condiciones
                            </li>
                        </ul>
                        <hr style={{ borderTop: "1px solid white", opacity: "0.3" }} />
                    </div>

                    {/* ORDER & SHIPPING */}
                    <div className="flex flex-col items-center lg:items-start">
                        <h4 className="text-lg font-semibold">
                            Order & Shipping
                        </h4>

                        <div className="border-t border-gray-300 w-20 my-4"></div>

                        <ul className="space-y-2 text-sm text-gray-200">
                            <li className="hover:text-white cursor-pointer transition">
                                Rastreo
                            </li>
                            <li className="hover:text-white cursor-pointer transition">
                                Mi Cuenta
                            </li>
                            <li className="hover:text-white cursor-pointer transition">
                                Checkout
                            </li>
                            <li className="hover:text-white cursor-pointer transition">
                                Carrito
                            </li>
                        </ul>
                    </div>
                    <hr style={{ borderTop: "1px solid white", opacity: "0.3" }} />
                </div>

                {/* LÍNEA INFERIOR */}
                <div className="border-t border-gray-300 mt-12 pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-200 gap-3 text-center md:text-left">

                        <span>
                            © {new Date().getFullYear()} Fuente de Salud Bethel — Todos los derechos reservados
                        </span>

                        <span>
                            Pagos 100% seguros
                        </span>

                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;