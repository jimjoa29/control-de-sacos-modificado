import React, { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { supabase } from '../api/supabase';
import Swal from 'sweetalert2';
import { THEME } from '../constants/theme'; 

import MenuPrincipal from '../components/MenuPrincipal';
import GestionOperadores from '../components/GestionOperadores';
import FormularioSaco from '../components/FormularioSaco';
import TablaInventario from '../components/TablaInventario';
import ReporteMovimientos from '../components/ReporteMovimientos';

const Inventario = () => {
    const {
        items: itemsOriginales,
        operadores, loading, crearProducto,
        actualizarStock, eliminarSaco, eliminarOperador, 
        editarProducto, crearOperador, fetchMovimientos 
    } = useInventory();

    const [listaLocal, setListaLocal] = useState([]);
    const [vista, setVista] = useState(''); 
    const [rol, setRol] = useState(''); 
    const [nuevoSaco, setNuevoSaco] = useState({ codigo_id: '', descripcion: '', stock_total: 0 });
    const [nuevoOp, setNuevoOp] = useState({ nombre: '', email: '', password: '', rol: 'operador' });
    const [mostrarForm, setMostrarForm] = useState(false);
    const [mostrarIrArriba, setMostrarIrArriba] = useState(false); 

    const AZUL_CORPORATIVO = '#2563eb';

    useEffect(() => {
        const controlarScroll = () => {
            if (window.scrollY > 300) {
                setMostrarIrArriba(true);
            } else {
                setMostrarIrArriba(false);
            }
        };
        window.addEventListener('scroll', controlarScroll);
        return () => window.removeEventListener('scroll', controlarScroll);
    }, []);

    const obtenerEstiloBoton = (isHovered, colorBase, esSecundario = false) => ({
        width: window.innerWidth < 640 ? '100%' : 'auto',
        minWidth: window.innerWidth < 640 ? 'none' : '120px',
        padding: '10px 15px',
        borderRadius: '10px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '11px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        transition: 'all 0.3s ease',
        background: esSecundario ? '#f1f5f9' : colorBase,
        color: esSecundario ? AZUL_CORPORATIVO : 'white',
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        marginBottom: window.innerWidth < 640 ? '8px' : '0'
    });

    useEffect(() => {
        setListaLocal(itemsOriginales);
    }, [itemsOriginales]);

    useEffect(() => {
        const checkRol = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
                if (data && !error) {
                    const miRol = data.rol.toLowerCase().trim();
                    setRol(miRol);
                    if (miRol === 'admin' || miRol === 'admin_limitado') {
                        setVista('menu');
                    } else {
                        setVista('sacos');
                    }
                } else {
                    setRol('operador');
                    setVista('sacos');
                }
            }
        };
        checkRol();
    }, []);

    const imprimirConteo = () => {
        const contenido = document.getElementById('tabla-conteo-imprimir').cloneNode(true);
        const inputs = contenido.querySelectorAll('input');
        inputs.forEach(input => {
            const valor = input.value || "0";
            const span = document.createElement('span');
            span.innerText = valor;
            input.parentNode.replaceChild(span, input);
        });

        const ventana = window.open('', '', 'height=600,width=800');
        ventana.document.write('<html><head><title>Informe de Auditoría - Bodega</title>');
        ventana.document.write('<style>table { width: 100%; border-collapse: collapse; font-family: sans-serif; } th, td { border: 1px solid #ddd; padding: 12px; text-align: center; } th { background-color: #f2f2f2; } h2 { text-align: center; font-family: sans-serif; }</style>');
        ventana.document.write('</head><body>');
        ventana.document.write('<h2>REPORTE DE CONTEO FÍSICO</h2>');
        ventana.document.write('<p style="text-align:center">Fecha: ' + new Date().toLocaleString() + '</p>');
        ventana.document.write(contenido.innerHTML);
        ventana.document.write('</body></html>');
        ventana.document.close();
        ventana.print();
    };

    const abrirModalConteo = () => {
        let tablaHtml = `
            <div id="tabla-conteo-imprimir" style="width: 100%; overflow-x: auto;">
                <table style="width: 100%; min-width: 300px; border-collapse: collapse; font-family: sans-serif;">
                    <thead>
                        <tr style="border-bottom: 2px solid #eee; font-size: 10px; color: #666;">
                            <th style="text-align: left; padding: 8px; width: 45%;">PRODUCTO</th>
                            <th style="text-align: center; padding: 8px; width: 15%;">SIST.</th>
                            <th style="text-align: center; padding: 8px; width: 25%;">FÍSICO</th>
                            <th style="text-align: center; padding: 8px; width: 15%;">DIF.</th>
                        </tr>
                    </thead>
                    <tbody style="font-size: 12px;">
        `;

        listaLocal.forEach((item, index) => {
            tablaHtml += `
                <tr style="border-bottom: 1px solid #f4f4f4;">
                    <td style="text-align: left; padding: 10px 8px; font-weight: 800; color: #333; line-height: 1.1;">
                        ${item.descripcion.toUpperCase()}
                    </td>
                    <td style="text-align: center; padding: 8px; font-weight: bold; color: #666;" id="sys-${index}">
                        ${item.stock_total}
                    </td>
                    <td style="text-align: center; padding: 8px;">
                        <input type="number" id="fis-${index}" 
                            placeholder="0"
                            style="width: 55px; padding: 6px 2px; border: 2px solid #e2e8f0; border-radius: 8px; text-align: center; font-weight: bold; font-size: 14px;"
                            oninput="
                                const fis = parseInt(this.value) || 0;
                                const sys = parseInt(document.getElementById('sys-${index}').innerText);
                                const diff = fis - sys;
                                const elDiff = document.getElementById('diff-${index}');
                                elDiff.innerText = diff > 0 ? '+' + diff : diff;
                                elDiff.style.color = diff === 0 ? '#10b981' : (diff < 0 ? '#ef4444' : '#3b82f6');
                            "
                        >
                    </td>
                    <td style="text-align: center; padding: 8px; font-weight: 900; font-size: 13px;" id="diff-${index}">0</td>
                </tr>
            `;
        });

        tablaHtml += `</tbody></table></div>`;

        Swal.fire({
            title: '📋 Auditoría de Stock',
            html: tablaHtml,
            width: window.innerWidth < 640 ? '98%' : '550px',
            showCancelButton: true,
            confirmButtonText: '🖨️ IMPRIMIR INFORME',
            cancelButtonText: 'CERRAR',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            reverseButtons: true,
            preConfirm: () => {
                imprimirConteo();
                return false;
            }
        });
    };

    const manejarAjuste = async (item, tipo) => {
        const { value: formValues } = await Swal.fire({
            title: tipo === 'sumar' ? 'Entrada de Stock' : 'Salida de Stock',
            html: `
                <div style="margin-bottom: 15px; font-size: 15px;">
                    Producto: <b style="color: ${AZUL_CORPORATIVO}; text-transform: uppercase;">${item.descripcion}</b>
                </div>
                <input id="swal-input-cant" class="swal2-input" type="number" placeholder="Cantidad" style="margin-bottom: 10px; font-size: 14px;">
                <input id="swal-input-desc" class="swal2-input" type="text" placeholder="Nota / Guía (Opcional)" style="margin-bottom: 10px; font-size: 14px;">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'CONFIRMAR',
            cancelButtonText: 'CANCELAR',
            confirmButtonColor: AZUL_CORPORATIVO,
            preConfirm: () => {
                const cant = document.getElementById('swal-input-cant').value;
                if (!cant || parseInt(cant) <= 0) {
                    Swal.showValidationMessage('Ingresa una cantidad válida');
                    return false;
                }
                return { cantidad: parseInt(cant) };
            }
        });

        if (formValues) {
            const { cantidad } = formValues;
            const nuevoTotal = tipo === 'sumar'
                ? parseInt(item.stock_total) + cantidad
                : parseInt(item.stock_total) - cantidad;

            if (nuevoTotal < 0) {
                return Swal.fire('Error', 'Stock insuficiente', 'error');
            }

            await actualizarStock(item.codigo_id, nuevoTotal, cantidad, tipo === 'sumar' ? 'entrada' : 'salida', item.descripcion, null);
        }
    };

    const manejarBorrarSaco = async (item) => {
        const rolNormalizado = rol?.toLowerCase().trim();
        if (rolNormalizado !== 'admin') return Swal.fire('Acceso Denegado', 'No tienes permisos.', 'error');
        const result = await Swal.fire({
            title: '¿ELIMINAR?',
            text: item.descripcion,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: THEME.colors.danger
        });
        if (result.isConfirmed) await eliminarSaco(item.codigo_id);
    };

    const manejarEditarSaco = async (item) => {
        const { value: desc } = await Swal.fire({
            title: 'Editar Descripción',
            input: 'text',
            inputValue: item.descripcion,
            showCancelButton: true,
            confirmButtonColor: AZUL_CORPORATIVO
        });
        if (desc) await editarProducto(item.codigo_id, desc, item.codigo_id);
    };

    if (loading && !rol) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando sistema...</div>;

    const rolNormalizado = rol?.toLowerCase().trim();
    const esAdminCualquiera = rolNormalizado === 'admin' || rolNormalizado === 'admin_limitado';

    return (
        <div style={{ padding: '10px', maxWidth: '100%', width: '1000px', margin: '0 auto', fontFamily: 'sans-serif', boxSizing: 'border-box', overflowX: 'hidden' }}>
            
            <div style={{ marginBottom: '20px', background: '#f1f5f9', padding: '12px', borderRadius: '15px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 'bold', color: THEME.colors.text, fontSize: '12px' }}>👤 {rol ? rol.toUpperCase().replace('_', ' ') : '...'}</div>
                <button onClick={() => supabase.auth.signOut()} style={{ background: THEME.colors.danger, color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>SALIR</button>
            </div>

            <h2 style={{ textAlign: 'center', color: THEME.colors.dark, marginBottom: '20px', fontSize: '20px' }}>📦 Sistema Bodega</h2>

            {vista === 'menu' && esAdminCualquiera && <MenuPrincipal setVista={setVista} rol={rol} />}
            {vista === 'reportes' && <ReporteMovimientos setVista={setVista} fetchMovimientos={fetchMovimientos} />}
            {vista === 'op' && rolNormalizado === 'admin' && (
                <GestionOperadores
                    setVista={setVista} nuevoOp={nuevoOp} setNuevoOp={setNuevoOp}
                    operadores={operadores} miRol={rol} alEliminar={eliminarOperador} 
                    alRegistrar={async (e) => {
                        e.preventDefault();
                        try {
                            await crearOperador(nuevoOp.nombre, nuevoOp.email, nuevoOp.password, nuevoOp.rol);
                            setNuevoOp({ nombre: '', email: '', password: '', rol: 'operador' });
                            Swal.fire({ title: 'Éxito', icon: 'success', confirmButtonColor: AZUL_CORPORATIVO });
                        } catch (err) {
                            Swal.fire('Error', err.message, 'error');
                        }
                    }}
                />
            )}

            {vista === 'sacos' && (
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: window.innerWidth < 640 ? 'column' : 'row', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', width: window.innerWidth < 640 ? '100%' : 'auto', justifyContent: 'center' }}>
                            {esAdminCualquiera && <button onClick={() => setVista('menu')} style={obtenerEstiloBoton(false, '#edf2f7', true)}>⬅ MENÚ</button>}
                            <button onClick={abrirModalConteo} style={obtenerEstiloBoton(false, '#10b981')}>📋 CONTEO</button>
                        </div>
                        {esAdminCualquiera && (
                            <div style={{ width: window.innerWidth < 640 ? '100%' : 'auto' }}>
                                <button onClick={() => setMostrarForm(!mostrarForm)} style={obtenerEstiloBoton(false, AZUL_CORPORATIVO)}>
                                    {mostrarForm ? '✖ CANCELAR' : '➕ NUEVO SACO'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* BLOQUE RESTAURADO: Formulario para agregar sacos */}
                    {mostrarForm && esAdminCualquiera && (
                        <div style={{ background: '#f7fafc', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: `1px solid ${THEME.colors.border}` }}>
                            <FormularioSaco 
                                nuevoSaco={nuevoSaco} setNuevoSaco={setNuevoSaco} 
                                alEnviar={async (e) => {
                                    e.preventDefault();
                                    await crearProducto(nuevoSaco);
                                    setMostrarForm(false);
                                    Swal.fire({ title: '¡Éxito!', icon: 'success', confirmButtonColor: AZUL_CORPORATIVO });
                                }}
                            />
                        </div>
                    )}

                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <TablaInventario items={listaLocal} rol={rol} alAjustar={manejarAjuste} alBorrar={manejarBorrarSaco} alEditar={manejarEditarSaco} setEstadoItems={setListaLocal} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventario;