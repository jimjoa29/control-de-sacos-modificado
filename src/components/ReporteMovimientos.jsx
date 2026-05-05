import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../api/supabase';
import Swal from 'sweetalert2';
import { THEME } from '../constants/theme';

// IMPORTACIONES PARA EL PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReporteMovimientos = ({ setVista, fetchMovimientos }) => {
    const [historial, setHistorial] = useState([]);
    const [historialFiltrado, setHistorialFiltrado] = useState([]);

    // --- FECHA INICIAL SINCRONIZADA CON SANTIAGO ---
    const obtenerFechaChile = () => {
        const ahora = new Date();
        const offsetChile = 4 * 60 * 60 * 1000; 
        const fechaLocal = new Date(ahora.getTime() - offsetChile);
        return fechaLocal.toISOString().split('T')[0]; 
    };

    const [fechaFiltro, setFechaFiltro] = useState(obtenerFechaChile());
    const [cargando, setCargando] = useState(true);
    const inicializado = useRef(false);

    const AZUL_CORPORATIVO = '#2563eb';

    // ESTADOS PARA HOVER (Estilo visual)
    const [hoverVolver, setHoverVolver] = useState(false);

    const limpiarEmail = (email) => {
        if (!email) return "SIS";
        const nombreBase = email.split('@')[0].toUpperCase();
        return nombreBase.substring(0, 3);
    };

    useEffect(() => {
        if (inicializado.current) return;

        const cargarDatosIniciales = async () => {
            try {
                const data = await fetchMovimientos();
                setHistorial(data);

                const hoyChile = obtenerFechaChile();
                const filtrados = data.filter(mov =>
                    mov.fecha.split('T')[0] === hoyChile
                );
                setHistorialFiltrado(filtrados);
                inicializado.current = true;
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatosIniciales();
    }, [fetchMovimientos]);

    const ejecutarConsulta = () => {
        const filtrados = historial.filter(mov => {
            return mov.fecha.split('T')[0] === fechaFiltro;
        });
        setHistorialFiltrado(filtrados);
    };

    const verComprobante = (url) => {
        if (!url) return;
        Swal.fire({
            title: 'Respaldo de Despacho',
            imageUrl: url,
            imageAlt: 'Foto de la guía',
            confirmButtonText: 'CERRAR',
            confirmButtonColor: AZUL_CORPORATIVO,
            width: window.innerWidth < 640 ? '95%' : '600px',
            imageWidth: '100%',
        });
    };

    const obtenerColorSaco = (descripcion) => {
        const desc = descripcion?.toLowerCase() || "";
        if (desc.includes('rojo')) return '#feb2b2';
        if (desc.includes('amarillo')) return '#faf089';
        if (desc.includes('azul')) return '#90cdf4';
        if (desc.includes('verde')) return '#9ae6b4';
        return THEME.colors.white;
    };

    return (
        <div style={{ padding: '5px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            
            {/* BOTÓN MENÚ PRINCIPAL CORREGIDO */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                <button
                    onClick={() => setVista('menu')}
                    onMouseEnter={() => setHoverVolver(true)}
                    onMouseLeave={() => setHoverVolver(false)}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        background: '#f1f5f9',
                        color: AZUL_CORPORATIVO, // Azul corporativo como pediste
                        boxShadow: hoverVolver ? '0 8px 15px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
                        transform: hoverVolver ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                >
                    ⬅ MENÚ PRINCIPAL
                </button>
            </div>

            <div style={{
                background: '#f8fafc', padding: '15px', borderRadius: '15px', marginBottom: '20px',
                border: `1px solid ${THEME.colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
            }}>
                <label style={{ fontWeight: 'bold', color: THEME.colors.text }}>Fecha de Informe:</label>
                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="date"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                        style={{ padding: '10px', borderRadius: '10px', border: `2px solid ${THEME.colors.border}`, fontSize: '14px', width: '160px' }}
                    />
                    <button onClick={ejecutarConsulta} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', background: AZUL_CORPORATIVO, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                        CONSULTAR
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', tableLayout: 'fixed' }}>
                    <thead style={{ background: THEME.colors.dark, color: 'white' }}>
                        <tr>
                            <th style={{ padding: '12px', textAlign: 'left', width: '40%', fontSize: '11px' }}>Producto</th>
                            <th style={{ padding: '12px', textAlign: 'center', width: '15%', fontSize: '11px' }}>Mov.</th>
                            <th style={{ padding: '12px', textAlign: 'center', width: '20%', fontSize: '11px' }}>Stock</th>
                            <th style={{ padding: '12px', textAlign: 'right', width: '25%', fontSize: '11px' }}>Op.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historialFiltrado.map((mov) => (
                            <tr key={mov.id} style={{ height: '1px', background: 'white' }}>
                                <td style={{ padding: '10px', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', borderLeft: '1px solid #eee', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '30px', backgroundColor: obtenerColorSaco(mov.descripcion), borderRadius: '2px' }}></div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: '900', fontSize: '12px', lineHeight: '1.1' }}>{mov.descripcion.toUpperCase()}</div>
                                            <div style={{ fontSize: '9px', color: '#666' }}>{new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', fontSize: '14px', fontWeight: 'bold', color: mov.tipo === 'entrada' ? 'green' : 'red' }}>
                                    {mov.tipo === 'entrada' ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                                </td>
                                <td style={{ textAlign: 'center', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
                                    {mov.stock_resultante}
                                </td>
                                <td style={{ paddingRight: '10px', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', borderRight: '1px solid #eee', borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}>
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{limpiarEmail(mov.operador_email)}</span>
                                        
                                        {mov.comprobante_url ? (
                                            <button 
                                                type="button"
                                                onClick={() => verComprobante(mov.comprobante_url)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '5px', display: 'flex', alignItems: 'center' }}
                                            >
                                                📸
                                            </button>
                                        ) : (
                                            <span style={{ opacity: 0.1, fontSize: '20px', padding: '5px' }}>📸</span>
                                        )}
                                    </div>
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