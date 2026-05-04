import React, { useState } from 'react';
import { THEME } from '../constants/theme';
import { supabase } from '../api/supabase'; 
import Swal from 'sweetalert2';

const GestionOperadores = ({
    setVista, nuevoOp, setNuevoOp, operadores,
    miRol, alEliminar, alRegistrar, fetchOperadores 
}) => {
    const [mostrarForm, setMostrarForm] = useState(false);
    const [hoverVolver, setHoverVolver] = useState(false);
    const [hoverIngresar, setHoverIngresar] = useState(false);

    // FUNCIÓN PARA ELIMINAR TOTALMENTE
    const manejarEliminar = async (op) => {
        const resultado = await Swal.fire({
            title: '¿ELIMINAR OPERADOR?',
            text: `Se eliminará permanentemente a: ${op.email} del sistema.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c53030',
            cancelButtonColor: '#2b6cb0',
            confirmButtonText: 'SÍ, ELIMINAR',
            cancelButtonText: 'CANCELAR'
        });

        if (resultado.isConfirmed) {
            try {
                // 1. ELIMINACIÓN EN LA TABLA DE LA BASE DE DATOS
                const { error } = await supabase
                    .from('perfiles') 
                    .delete()
                    .eq('id', op.id);

                if (error) throw error;

                // 2. ÉXITO
                await Swal.fire({
                    title: 'ELIMINADO',
                    text: 'El usuario ha sido borrado totalmente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // 3. ACTUALIZACIÓN INMEDIATA DE LA PANTALLA
                if (fetchOperadores) {
                    await fetchOperadores(); 
                } else if (alEliminar) {
                    alEliminar(op);
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
                Swal.fire('Error', 'No se pudo eliminar de la base de datos. Revisa los permisos RLS en la tabla perfiles.', 'error');
            }
        }
    };

    const obtenerSigla = (rol) => {
        const r = rol?.toLowerCase().trim();
        if (r === 'admin') return 'ADT';
        if (r === 'admin_limitado') return 'AL';
        return 'OP';
    };

    const obtenerEstiloBoton = (isHovered, colorBase, esSecundario = false) => ({
        minWidth: '170px',
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
        boxShadow: isHovered ? '0 6px 12px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
    });

    return (
        <div style={{ marginTop: '20px', maxWidth: '800px', margin: '20px auto', padding: '0 10px', paddingBottom: '50px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', gap: '10px' }}>
                <button
                    onClick={() => setVista('menu')}
                    onMouseEnter={() => setHoverVolver(true)}
                    onMouseLeave={() => setHoverVolver(false)}
                    style={{ ...obtenerEstiloBoton(hoverVolver, '#edf2f7', true), minWidth: '140px', fontSize: '11px' }}
                >
                    ⬅ MENÚ PRINCIPAL
                </button>

                <button
                    onClick={() => setMostrarForm(!mostrarForm)}
                    onMouseEnter={() => setHoverIngresar(true)}
                    onMouseLeave={() => setHoverIngresar(false)}
                    style={{ ...obtenerEstiloBoton(hoverIngresar, THEME.colors.primary), minWidth: '160px', fontSize: '11px' }}
                >
                    {mostrarForm ? '✖ CANCELAR' : '➕ REGISTRAR'}
                </button>
            </div>

            {mostrarForm && (
                <div style={{ background: '#f7fafc', padding: '25px', borderRadius: '15px', marginBottom: '30px', border: `1px solid ${THEME.colors.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ textAlign: 'center', color: THEME.colors.dark, marginTop: 0 }}>Registro de Nuevo Operador</h3>
                    <form onSubmit={alRegistrar} style={{ display: 'grid', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
                        <input
                            type="text" placeholder="Nombre Completo" required
                            value={nuevoOp.nombre}
                            onChange={(e) => setNuevoOp({ ...nuevoOp, nombre: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.colors.border}`, fontSize: '14px' }}
                        />
                        <input
                            type="email" placeholder="Correo Electrónico" required
                            value={nuevoOp.email}
                            onChange={(e) => setNuevoOp({ ...nuevoOp, email: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.colors.border}`, fontSize: '14px' }}
                        />
                        <input
                            type="password" placeholder="Contraseña" required
                            value={nuevoOp.password}
                            onChange={(e) => setNuevoOp({ ...nuevoOp, password: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.colors.border}`, fontSize: '14px' }}
                        />
                        <select
                            value={nuevoOp.rol}
                            onChange={(e) => setNuevoOp({ ...nuevoOp, rol: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.colors.border}`, background: 'white', fontSize: '14px' }}
                        >
                            <option value="operador">Operador (Solo Despacho)</option>
                            <option value="admin_limitado">Admin Limitado</option>
                            <option value="admin">Admin Total</option>
                        </select>
                        <button type="submit" style={{ ...obtenerEstiloBoton(false, THEME.colors.primary), width: '100%', marginTop: '10px' }}>
                            GUARDAR OPERADOR
                        </button>
                    </form>
                </div>
            )}

            <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ background: THEME.colors.dark, color: 'white', padding: '12px 15px', display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.2fr', fontWeight: 'bold', fontSize: '12px' }}>
                    <div>EMAIL</div>
                    <div style={{ textAlign: 'center' }}>ROL</div>
                    <div style={{ textAlign: 'center' }}>ACCIÓN</div>
                </div>

                {operadores?.length > 0 ? (
                    operadores.map((op) => (
                        <div key={op.id} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.2fr', padding: '15px 15px', alignItems: 'center', borderBottom: `1px solid ${THEME.colors.border}` }}>
                            <div style={{ fontSize: '11px', color: THEME.colors.dark, wordBreak: 'break-all', paddingRight: '5px' }}>{op.email}</div>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ 
                                    background: op.rol === 'admin' ? '#e9d8fd' : (op.rol === 'admin_limitado' ? '#bee3f8' : '#e2e8f0'), 
                                    color: op.rol === 'admin' ? '#6b46c1' : (op.rol === 'admin_limitado' ? '#2b6cb0' : '#4a5568'),
                                    padding: '2px 8px', 
                                    borderRadius: '4px', 
                                    fontSize: '10px',
                                    fontWeight: '900' 
                                }}>
                                    {obtenerSigla(op.rol)}
                                </span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => manejarEliminar(op)}
                                    style={{ background: '#fed7d7', color: '#c53030', border: 'none', padding: '10px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}
                                >
                                    ELIMINAR
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                        No hay operadores registrados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionOperadores;