import React, { useState, useEffect } from 'react';

// Agregamos 'rol' a las propiedades (props) que recibe el componente
const MenuPrincipal = ({ setVista, rol }) => {
    // Detectamos el ancho de pantalla inicial
    const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);

    // Escuchamos si el usuario voltea el teléfono o cambia el tamaño de la ventana
    useEffect(() => {
        const handleResize = () => setEsMovil(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ESTILOS DINÁMICOS
    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '15px',
        padding: '10px',
        maxWidth: esMovil ? '100%' : '700px',
        margin: '0 auto'
    };

    const cardStyle = {
        width: '100%',
        padding: esMovil ? '15px 20px' : '35px 25px', 
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: esMovil ? 'row' : 'column', 
        alignItems: 'center',
        justifyContent: esMovil ? 'flex-start' : 'center',
        gap: '15px',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: esMovil ? '16px' : '22px',
    };

    const iconoStyle = {
        fontSize: esMovil ? '28px' : '45px'
    };

    return (
        <div style={containerStyle}>
            
            {/* BOTÓN INVENTARIO: Visible para todos */}
            <button 
                onClick={() => setVista('sacos')}
                style={{ ...cardStyle, background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)' }}
            >
                <span style={iconoStyle}>📦</span>
                INVENTARIO DE SACOS
            </button>

            {/* BOTÓN OPERADORES: SOLO visible para el Admin Total */}
            {rol === 'admin' && (
                <button 
                    onClick={() => setVista('op')}
                    style={{ ...cardStyle, background: 'linear-gradient(135deg, #805ad5 0%, #553c9a 100%)' }}
                >
                    <span style={iconoStyle}>👥</span>
                    GESTIÓN DE OPERADORES
                </button>
            )}

            {/* BOTÓN REPORTES: Visible para Admin y Admin Limitado */}
            {(rol === 'admin' || rol === 'admin_limitado') && (
                <button 
                    onClick={() => setVista('reportes')}
                    style={{ ...cardStyle, background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)' }}
                >
                    <span style={iconoStyle}>📊</span>
                    REPORTE DE MOVIMIENTOS
                </button>
            )}

        </div>
    );
};

export default MenuPrincipal;