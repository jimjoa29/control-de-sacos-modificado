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
    const [mostrarIrArriba, setMostrarIrArriba] = useState(false); // Estado para detectar scroll

    const [hoverSalir, setHoverSalir] = useState(false);
    const [hoverVolver, setHoverVolver] = useState(false);
    const [hoverIngresar, setHoverIngresar] = useState(false);
    const [hoverArriba, setHoverArriba] = useState(false);

    // Detectar scroll para mostrar/ocultar el botón de subir
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

    const irArriba = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const obtenerEstiloBoton = (isHovered, colorBase, esSecundario = false) => ({
        width: window.innerWidth < 640 ? '100%' : 'auto',
        minWidth: window.innerWidth < 640 ? 'none' : '170px',
        padding: '12px 20px',
        borderRadius: '10px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '13px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        background: isHovered ? (esSecundario ? '#e2e8f0' : colorBase) : (esSecundario ? '#edf2f7' : colorBase),
        color: esSecundario ? THEME.colors.primary : 'white',
        boxShadow: isHovered 
            ? '0 6px 12px rgba(0,0,0,0.15)' 
            : '0 4px 6px rgba(0,0,0,0.1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        filter: !esSecundario && isHovered ? 'brightness(1.1)' : 'none',
        marginBottom: window.innerWidth < 640 ? '10px' : '0'
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

    const manejarBorrarSaco = async (item) => {
        if (rol?.toLowerCase().trim() !== 'admin') {
            return Swal.fire('Acceso Denegado', 'No tienes permisos para eliminar sacos.', 'error');
        }
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
            showCancelButton: true
        });
        if (desc) await editarProducto(item.codigo_id, desc, item.codigo_id);
    };

    const manejarAjuste = async (item, tipo) => {
        const { value: cant } = await Swal.fire({
            title: tipo === 'sumar' ? 'Entrada de Stock' : 'Salida de Stock',
            input: 'number',
            showCancelButton: true
        });
        if (cant && parseInt(cant) > 0) {
            const total = tipo === 'sumar' ? parseInt(item.stock_total) + parseInt(cant) : parseInt(item.stock_total) - parseInt(cant);
            if (total < 0) return Swal.fire('Error', 'Stock insuficiente', 'error');
            await actualizarStock(item.codigo_id, total, parseInt(cant), tipo === 'sumar' ? 'entrada' : 'salida', item.descripcion);
        }
    };

    if (loading && !rol) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando sistema...</div>;

    const rolNormalizado = rol?.toLowerCase().trim();
    const esAdminCualquiera = rolNormalizado === 'admin' || rolNormalizado === 'admin_limitado';

    return (
        <div style={{ padding: '15px', maxWidth: '100%', width: '1000px', margin: '0 auto', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            
            {/* CABECERA: Con botón dinámico de "Subir" al lado de cerrar sesión */}
            <div style={{ 
                marginBottom: '30px', background: '#f1f5f9', padding: '15px', borderRadius: '15px',
                display: 'flex', flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                justifyContent: 'space-between', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{ fontWeight: 'bold', color: THEME.colors.text, fontSize: '14px' }}>
                    👤 ROL: {rol ? rol.toUpperCase().replace('_', ' ') : 'CARGANDO...'}
                </div>
                
                <div style={{ display: 'flex', gap: '10px', width: window.innerWidth < 640 ? '100%' : 'auto', flexDirection: window.innerWidth < 640 ? 'column' : 'row' }}>
                    {/* Botón Volver Arriba (Solo aparece si hay scroll) */}
                    {mostrarIrArriba && (
                        <button 
                            onClick={irArriba}
                            onMouseEnter={() => setHoverArriba(true)}
                            onMouseLeave={() => setHoverArriba(false)}
                            style={obtenerEstiloBoton(hoverArriba, THEME.colors.primary, true)}
                        >
                            ⬆ SUBIR
                        </button>
                    )}
                    
                    <button 
                        onClick={() => supabase.auth.signOut()} 
                        onMouseEnter={() => setHoverSalir(true)}
                        onMouseLeave={() => setHoverSalir(false)}
                        style={obtenerEstiloBoton(hoverSalir, THEME.colors.danger)}
                    >
                        CERRAR SESIÓN
                    </button>
                </div>
            </div>

            <h2 style={{ textAlign: 'center', color: THEME.colors.dark, marginBottom: '30px', fontSize: '24px' }}>📦 Sistema Bodega</h2>

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
                            Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
                        } catch (err) {
                            Swal.fire('Error', err.message, 'error');
                        }
                    }}
                />
            )}

            {vista === 'sacos' && (
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: window.innerWidth < 640 ? 'column-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                        {esAdminCualquiera ? (
                            <button onClick={() => setVista('menu')} onMouseEnter={() => setHoverVolver(true)} onMouseLeave={() => setHoverVolver(false)} style={obtenerEstiloBoton(hoverVolver, '#edf2f7', true)}>
                                ⬅ MENÚ PRINCIPAL
                            </button>
                        ) : <div style={{ width: '1px' }} />}
                        
                        {esAdminCualquiera && (
                            <button onClick={() => setMostrarForm(!mostrarForm)} onMouseEnter={() => setHoverIngresar(true)} onMouseLeave={() => setHoverIngresar(false)} style={obtenerEstiloBoton(hoverIngresar, THEME.colors.primary)}>
                                {mostrarForm ? '✖ CANCELAR' : '➕ INGRESAR SACO'}
                            </button>
                        )}
                    </div>

                    {mostrarForm && esAdminCualquiera && (
                        <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: `1px solid ${THEME.colors.border}`, width: '100%', boxSizing: 'border-box' }}>
                            <FormularioSaco 
                                nuevoSaco={nuevoSaco} setNuevoSaco={setNuevoSaco} 
                                alEnviar={async (e) => {
                                    e.preventDefault();
                                    await crearProducto(nuevoSaco);
                                    setMostrarForm(false);
                                    Swal.fire('¡Éxito!', 'Producto añadido', 'success');
                                }}
                            />
                        </div>
                    )}

                    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <TablaInventario items={listaLocal} rol={rol} alAjustar={manejarAjuste} alBorrar={manejarBorrarSaco} alEditar={manejarEditarSaco} setEstadoItems={setListaLocal} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventario;