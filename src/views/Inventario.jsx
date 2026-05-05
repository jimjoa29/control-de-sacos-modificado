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
        minWidth: window.innerWidth < 640 ? 'none' : '170px',
        padding: '10px 15px',
        borderRadius: '10px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
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

    const subirFotoGuia = async (file) => {
        try {
            const fileName = `guia_${Date.now()}.jpg`;
            const { data, error } = await supabase.storage
                .from('comprobantes')
                .upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('comprobantes').getPublicUrl(fileName);
            return publicUrl;
        } catch (error) {
            console.error("Error subiendo foto:", error);
            return null;
        }
    };

    const manejarAjuste = async (item, tipo) => {
        let fotoURL = null;

        // --- BLOQUE DE CÁMARA CONDICIONAL ---
        // Solo incluimos el HTML de la cámara si la acción es restar (Salida)
        const htmlCamara = tipo === 'restar' ? `
            <div style="margin-top: 10px;">
                <label for="foto-guia" style="display: block; padding: 10px; background: #e2e8f0; border-radius: 8px; cursor: pointer; font-weight: bold; color: ${THEME.colors.dark}; font-size: 13px;">
                    📸 TOMAR FOTO DE GUÍA
                </label>
                <input type="file" id="foto-guia" accept="image/*" capture="environment" style="display: none;" onchange="document.getElementById('preview-text').innerText = '✅ Foto capturada'">
                <p id="preview-text" style="font-size: 11px; margin-top: 5px; color: green;"></p>
            </div>
        ` : '';

        const { value: formValues } = await Swal.fire({
            title: tipo === 'sumar' ? 'Entrada de Stock' : 'Salida de Stock',
            html: `
                <div style="margin-bottom: 15px; font-size: 15px;">
                    Producto: <b style="color: ${AZUL_CORPORATIVO}; text-transform: uppercase;">${item.descripcion}</b>
                </div>
                <input id="swal-input-cant" class="swal2-input" type="number" placeholder="Cantidad" style="margin-bottom: 10px; font-size: 14px;">
                <input id="swal-input-desc" class="swal2-input" type="text" placeholder="Nota / Guía (Opcional)" style="margin-bottom: 10px; font-size: 14px;">
                ${htmlCamara}
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'CONFIRMAR',
            cancelButtonText: 'CANCELAR',
            confirmButtonColor: AZUL_CORPORATIVO,
            preConfirm: async () => {
                const cant = document.getElementById('swal-input-cant').value;
                const fotoInput = document.getElementById('foto-guia');
                const fotoFile = fotoInput ? fotoInput.files[0] : null;

                if (!cant || parseInt(cant) <= 0) {
                    Swal.showValidationMessage('Ingresa una cantidad válida');
                    return false;
                }

                // Subida de foto solo si existe el archivo (flujo de restar)
                if (fotoFile) {
                    Swal.showLoading();
                    fotoURL = await subirFotoGuia(fotoFile);
                }

                return { 
                    cantidad: parseInt(cant), 
                    urlComprobante: fotoURL
                };
            }
        });

        if (formValues) {
            const { cantidad, urlComprobante } = formValues;
            const nuevoTotal = tipo === 'sumar' 
                ? parseInt(item.stock_total) + cantidad 
                : parseInt(item.stock_total) - cantidad;

            if (nuevoTotal < 0) {
                return Swal.fire('Error', 'Stock insuficiente', 'error');
            }

            await actualizarStock(
                item.codigo_id, 
                nuevoTotal, 
                cantidad, 
                tipo === 'sumar' ? 'entrada' : 'salida', 
                item.descripcion, 
                urlComprobante
            );
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
            
            <div style={{ 
                marginBottom: '20px', background: '#f1f5f9', padding: '12px', borderRadius: '15px',
                display: 'flex', flexDirection: 'row',
                justifyContent: 'space-between', alignItems: 'center', gap: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{ fontWeight: 'bold', color: THEME.colors.text, fontSize: '12px' }}>
                    👤 {rol ? rol.toUpperCase().replace('_', ' ') : '...'}
                </div>
                
                <button 
                    onClick={() => supabase.auth.signOut()} 
                    style={{ background: THEME.colors.danger, color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    SALIR
                </button>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
                        {esAdminCualquiera ? (
                            <button onClick={() => setVista('menu')} style={obtenerEstiloBoton(false, '#edf2f7', true)}>
                                ⬅ MENÚ PRINCIPAL
                            </button>
                        ) : <div />}
                        
                        {esAdminCualquiera && (
                            <button onClick={() => setMostrarForm(!mostrarForm)} style={obtenerEstiloBoton(false, AZUL_CORPORATIVO)}>
                                {mostrarForm ? '✖' : '➕ SACO'}
                            </button>
                        )}
                    </div>

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