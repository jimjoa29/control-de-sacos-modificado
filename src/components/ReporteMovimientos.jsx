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

    const hoy = new Date().toISOString().split('T')[0];
    const [fechaFiltro, setFechaFiltro] = useState(hoy);
    const [cargando, setCargando] = useState(true);

    const inicializado = useRef(false);

    const [hoverVolver, setHoverVolver] = useState(false);
    const [hoverConsultar, setHoverConsultar] = useState(false);
    const [hoverPDF, setHoverPDF] = useState(false);

    const AZUL_CORPORATIVO = '#2563eb';

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

                const filtrados = data.filter(mov =>
                    new Date(mov.fecha).toISOString().split('T')[0] === hoy
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
        if (fechaFiltro > hoy) {
            Swal.fire('Fecha Inválida', 'Escoge una fecha igual o anterior a hoy.', 'warning');
            return;
        }

        const filtrados = historial.filter(mov => {
            const fechaMov = new Date(mov.fecha).toISOString().split('T')[0];
            return fechaMov === fechaFiltro;
        });

        setHistorialFiltrado(filtrados);

        if (filtrados.length === 0) {
            Swal.fire('Sin registros', `No hay movimientos para el día ${fechaFiltro}`, 'info');
        }
    };

    const verComprobante = (url) => {
        if (!url) return;
        
        Swal.fire({
            title: 'Evidencia de Despacho',
            imageUrl: url,
            imageAlt: 'Foto de la guía de despacho',
            confirmButtonText: 'CERRAR',
            confirmButtonColor: AZUL_CORPORATIVO,
            width: '90%',
            imageWidth: '100%',
        });
    };

    const exportarPDFMovimientos = () => {
        try {
            const doc = new jsPDF();
            const fechaActual = new Date().toLocaleDateString();
            
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0); 
            doc.text("Historial de Despacho", 14, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generado por: JOAN ALEJANDRO NARVÁEZ GARCÍA | Sistema Bodega`, 14, 28);
            doc.text(`Fecha de consulta: ${fechaFiltro}`, 14, 34);

            const tableColumn = ["Hora", "Producto", "Tipo", "Cant.", "Stock Final", "Op."];
            const tableRows = historialFiltrado.map(mov => [
                new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                mov.descripcion.toUpperCase(),
                mov.tipo === 'entrada' ? 'ENTRADA' : 'SALIDA',
                mov.tipo === 'entrada' ? `+${mov.cantidad}` : `-${mov.cantidad}`,
                mov.stock_resultante || '--',
                limpiarEmail(mov.operador_email)
            ]);

            autoTable(doc, {
                startY: 40,
                head: [tableColumn],
                body: tableRows,
                theme: 'striped',
                headStyles: { 
                    fillColor: [37, 99, 235], 
                    textColor: [255, 255, 255], 
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                styles: { 
                    fontSize: 9, 
                    cellPadding: 3 
                },
                didParseCell: function (data) {
                    if (data.column.index === 3 && data.cell.section === 'body') {
                        const valor = data.cell.text[0];
                        if (valor.includes('+')) {
                            data.cell.styles.textColor = [0, 128, 0];
                        } else if (valor.includes('-')) {
                            data.cell.styles.textColor = [200, 0, 0];
                        }
                    }
                    if (data.column.index === 4 && data.cell.section === 'body') {
                        data.cell.styles.textColor = [0, 0, 0];
                        data.cell.styles.fontStyle = 'bold';
                    }
                },
                columnStyles: {
                    0: { cellWidth: 22 },
                    3: { halign: 'center' },
                    4: { halign: 'center' }
                },
                margin: { top: 40 }
            });

            doc.save(`Historial_Despacho_${fechaFiltro}.pdf`);
        } catch (error) {
            console.error("Error PDF:", error);
            Swal.fire('Error', 'No se pudo generar el reporte PDF', 'error');
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
        color: esSecundario ? AZUL_CORPORATIVO : 'white',
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
        <div style={{ padding: '5px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
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
                <h3 style={{ color: THEME.colors.dark, fontWeight: 'bold' }}>📊 Historial de Despacho</h3>
            </div>

            <div style={{
                background: '#f8fafc',
                padding: '15px',
                borderRadius: '15px',
                marginBottom: '20px',
                border: `1px solid ${THEME.colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
            }}>
                <label style={{ fontWeight: 'bold', color: THEME.colors.text }}>Fecha:</label>
                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <input
                        type="date"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                        style={{ padding: '10px', borderRadius: '10px', border: `2px solid ${THEME.colors.border}`, fontSize: '14px', width: '160px' }}
                    />
                    <button
                        onClick={ejecutarConsulta}
                        style={obtenerEstiloBoton(hoverConsultar, AZUL_CORPORATIVO)}
                    >
                        CONSULTAR
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', tableLayout: 'fixed' }}>
                    <thead style={{ background: THEME.colors.dark, color: THEME.colors.white }}>
                        <tr>
                            <th style={{ padding: '12px 8px', textAlign: 'left', borderRadius: '12px 0 0 12px', fontSize: '11px', width: '40%' }}>Producto / Hora</th>
                            <th style={{ padding: '12px 2px', textAlign: 'center', fontSize: '11px', width: '15%' }}>Mov.</th>
                            <th style={{ padding: '12px 2px', textAlign: 'center', fontSize: '11px', width: '20%' }}>Stock F.</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right', borderRadius: '0 12px 12px 0', fontSize: '11px', width: '25%' }}>Op.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!cargando && historialFiltrado.map((mov) => (
                            <tr key={mov.id} style={{ height: '1px', background: THEME.colors.white }}> {/* Fondo blanco a toda la fila */}
                                <td style={{ 
                                    padding: '10px 8px', 
                                    borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}`, borderLeft: `1px solid ${THEME.colors.border}`, 
                                    borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px',
                                    position: 'relative', zIndex: 2 // Asegura que la descripción esté siempre al frente
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '30px', backgroundColor: obtenerColorSaco(mov.descripcion), borderRadius: '2px', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}></div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: '900', color: THEME.colors.dark, fontSize: '12px', lineHeight: '1.1' }}>{mov.descripcion.toUpperCase()}</div>
                                            <div style={{ fontSize: '9px', color: THEME.colors.muted }}>{new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ 
                                    padding: '10px 2px', textAlign: 'center', 
                                    borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}`,
                                    background: 'transparent' // Eliminamos fondo blanco individual para que no tape
                                }}>
                                    <div style={{ fontWeight: '900', fontSize: '14px', color: mov.tipo === 'entrada' ? THEME.colors.success : THEME.colors.danger }}>
                                        {mov.tipo === 'entrada' ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                                    </div>
                                </td>
                                <td style={{ 
                                    padding: '10px 2px', textAlign: 'center', 
                                    borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}`,
                                    background: 'rgba(248, 250, 252, 0.8)' // Fondo traslúcido para que no tape el texto si se encima
                                }}>
                                    <div style={{ fontWeight: '950', fontSize: '14px', color: '#28a745' }}>{mov.stock_resultante || '--'}</div>
                                </td>
                                <td style={{ 
                                    padding: '0 8px', 
                                    textAlign: 'right', 
                                    borderTop: `1px solid ${THEME.colors.border}`, borderBottom: `1px solid ${THEME.colors.border}`, 
                                    borderRight: `1px solid ${THEME.colors.border}`, borderTopRightRadius: '10px', 
                                    borderBottomRightRadius: '10px',
                                    height: 'inherit'
                                }}>
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold', color: THEME.colors.text, fontSize: '11px' }}>
                                            {limpiarEmail(mov.operador_email)}
                                        </span>
                                        
                                        {mov.comprobante_url ? (
                                            <button 
                                                onClick={() => verComprobante(mov.comprobante_url)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0', color: '#000000' }}
                                                title="Ver Guía"
                                            >
                                                📸
                                            </button>
                                        ) : (
                                            <span style={{ opacity: 0.1, fontSize: '16px' }}>📸</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <button
                    onClick={exportarPDFMovimientos}
                    style={obtenerEstiloBoton(hoverPDF, '#2d3748')}
                >
                    📄 DESCARGAR PDF
                </button>
            </div>
        </div>
    );
};

export default ReporteMovimientos;