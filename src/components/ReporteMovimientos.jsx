import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';
import Swal from 'sweetalert2';
import { THEME } from '../constants/theme';

const ReporteMovimientos = ({ setVista, fetchMovimientos }) => {
    const [historial, setHistorial] = useState([]);
    const [historialFiltrado, setHistorialFiltrado] = useState([]);
    
    // Usamos una constante para el día de hoy para evitar cálculos innecesarios
    const hoy = new Date().toISOString().split('T')[0];
    const [fechaFiltro, setFechaFiltro] = useState(hoy);
    const [cargando, setCargando] = useState(true);

    const [hoverVolver, setHoverVolver] = useState(false);
    const [hoverConsultar, setHoverConsultar] = useState(false);

    const limpiarEmail = (email) => {
        if (!email) return "SISTEMA";
        return email.split('@')[0].toUpperCase();
    };

    // 1. CARGA INICIAL: Solo se ejecuta UNA VEZ al montar el componente
    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                const data = await fetchMovimientos();
                setHistorial(data);
                
                // Mostramos hoy por defecto solo al cargar la primera vez
                const filtrados = data.filter(mov =>
                    new Date(mov.fecha).toISOString().split('T')[0] === hoy
                );
                setHistorialFiltrado(filtrados);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatosIniciales();
        // Quitamos 'hoy' y otras dependencias que causan el reinicio infinito
    }, []); 

    // 2. FUNCIÓN DE CONSULTA: Ahora es robusta y no se reinicia sola
    const ejecutarConsulta = () => {
        if (fechaFiltro > hoy) {
            Swal.fire('Fecha Inválida', 'Escoge una fecha igual o anterior a hoy.', 'warning');
            return;
        }

        // Filtramos sobre la base de datos que ya tenemos cargada
        const filtrados = historial.filter(mov => {
            const fechaMov = new Date(mov.fecha).toISOString().split('T')[0];
            return fechaMov === fechaFiltro;
        });

        setHistorialFiltrado(filtrados);
        
        if (filtrados.length === 0) {
            Swal.fire('Sin registros', `No hay movimientos para el día ${fechaFiltro}`, 'info');
        }
    };

    const obtenerEstiloBoton = (isHovered, colorBase, esSecundario = false) => ({
        minWidth: '170px',
        padding: '12px 20px',
        borderRadius: '12px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        background: esSecundario ? '#f1f5f9' : colorBase,
        color: esSecundario ? '#2b6cb0' : 'white',
        boxShadow: isHovered ? '0 8px 15px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    });

    const obtenerColorSaco = (descripcion) => {
        const desc = descripcion?.toLowerCase() || "";
        if (desc.includes('rojo')) return '#feb2b2';
        if (desc.includes('amarillo')) return '#faf089';
        if (desc.includes('azul')) return '#90cdf4';
        if (desc.includes('verde')) return '#9ae6b4';
        if (desc.includes('blanco')) return THEME.colors.white;
        if (desc.includes('transparente')) return '#f0f4f8';
        return 'transparent';
    };

    return (
        <div style={{ padding: '10px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            {/* ... Resto del JSX igual al anterior ... */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '30px' }}>
                <button
                    onClick={() => setVista('menu')}
                    onMouseEnter={() => setHoverVolver(true)}
                    onMouseLeave={() => setHoverVolver(false)}
                    style={obtenerEstiloBoton(hoverVolver, '#f1f5f9', true)}
                >
                    ⬅ MENÚ PRINCIPAL
                </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: THEME.colors.dark, fontWeight: 'bold' }}>📊 Historial y Stock Resultante</h3>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '30px', border: `1px solid ${THEME.colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <label style={{ fontWeight: 'bold', color: THEME.colors.text }}>Seleccionar Fecha:</label>
                <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="date"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                        style={{ padding: '10px', borderRadius: '10px', border: `2px solid ${THEME.colors.border}`, fontSize: '14px', width: '180px' }}
                    />
                    <button
                        onClick={ejecutarConsulta}
                        onMouseEnter={() => setHoverConsultar(true)}
                        onMouseLeave={() => setHoverConsultar(false)}
                        style={obtenerEstiloBoton(hoverConsultar, THEME.colors.primary)}
                    >
                        CONSULTAR
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', tableLayout: 'fixed' }}>
                    <thead style={{ background: THEME.colors.dark, color: THEME.colors.white }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', borderRadius: '15px 0 0 15px', fontSize: '12px', width: '40%' }}>Producto / Hora</th>
                            <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', width: '15%' }}>Mov.</th>
                            <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', width: '20%' }}>Stock Final</th>
                            <th style={{ padding: '15px', textAlign: 'right', borderRadius: '0 15px 15px 0', fontSize: '12px', width: '25%' }}>Op.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!cargando && historialFiltrado.map((mov) => (
                            <tr key={mov.id}>
                                <td style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}`, borderLeft: `1px solid ${THEME.colors.border}`, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', background: THEME.colors.white }}>
                                    <div style={{ width: '8px', height: '35px', backgroundColor: obtenerColorSaco(mov.descripcion), borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}></div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: '900', color: THEME.colors.dark, fontSize: '13px', lineHeight: '1.2' }}>{mov.descripcion}</div>
                                        <div style={{ fontSize: '10px', color: THEME.colors.muted }}>{new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 5px', textAlign: 'center', borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}`, background: THEME.colors.white }}>
                                    <div style={{ fontWeight: '900', fontSize: '14px', color: mov.tipo === 'entrada' ? THEME.colors.success : THEME.colors.danger }}>
                                        {mov.tipo === 'entrada' ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                                    </div>
                                </td>
                                <td style={{ padding: '12px 5px', textAlign: 'center', borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}`, background: '#f8fafc' }}>
                                    <div style={{ fontWeight: '950', fontSize: '16px', color: '#28a745' }}>{mov.stock_resultante || '--'}</div>
                                </td>
                                <td style={{ padding: '12px 10px', textAlign: 'right', borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}`, borderRight: `1px solid ${THEME.colors.border}`, borderTopRightRadius: '12px', borderBottomRightRadius: '12px', background: THEME.colors.white, color: THEME.colors.text, fontSize: '11px', fontWeight: 'bold' }}>
                                    {limpiarEmail(mov.operador_email)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReporteMovimientos;