import React, { useState } from 'react';
import { THEME } from '../constants/theme';

const GestionOperadores = ({
    setVista, nuevoOp, setNuevoOp, operadores,
    miRol, alEliminar, alRegistrar
}) => {
    const [mostrarForm, setMostrarForm] = useState(false);

    // ESTADOS PARA EL EFECTO HOVER
    const [hoverVolver, setHoverVolver] = useState(false);
    const [hoverIngresar, setHoverIngresar] = useState(false);

    // ESTILO ESTÁNDAR
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
        boxShadow: isHovered
            ? '0 6px 12px rgba(0,0,0,0.15)'
            : '0 4px 6px rgba(0,0,0,0.1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        filter: !esSecundario && isHovered ? 'brightness(1.1)' : 'none'
    });

    return (
        <div style={{ marginTop: '20px' }}>

            {/* CONTENEDOR DE BOTONES ALINEADOS */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '35px'
            }}>
                <button
                    onClick={() => setVista('menu')}
                    onMouseEnter={() => setHoverVolver(true)}
                    onMouseLeave={() => setHoverVolver(false)}
                    style={obtenerEstiloBoton(hoverVolver, '#edf2f7', true)}
                >
                    ⬅ MENÚ PRINCIPAL
                </button>

                <button
                    onClick={() => setMostrarForm(!mostrarForm)}
                    onMouseEnter={() => setHoverIngresar(true)}
                    onMouseLeave={() => setHoverIngresar(false)}
                    style={obtenerEstiloBoton(hoverIngresar, THEME.colors.primary)}
                >
                    {mostrarForm ? '✖ CANCELAR' : '➕ INGRESAR OPERADOR'}
                </button>
            </div>

            {mostrarForm && (
                <div style={{
                    background: '#f7fafc',
                    padding: '25px',
                    borderRadius: '15px',
                    marginBottom: '30px',
                    border: `1px solid ${THEME.colors.border}`,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ marginTop: 0, color: THEME.colors.dark, fontSize: '18px', textAlign: 'center' }}>
                        Registrar Nuevo Operador
                    </h3>
                    <form onSubmit={alRegistrar} style={{ display: 'grid', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
                        <input
                            type="text" placeholder="Nombre Completo" required
                            value={nuevoOp.nombre}
                            onChange={(e) => setNuevoOp({ ...nuevoOp, nombre: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.colors.border}` }}
                        />
                        <input
                            type="email" placeholder="Correo Electrónico" required
                            value={nuevoOp.email}
                            onChange={(e) => setNuevoOp({ ...nuevoOp, email: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.colors.border}` }}
                        />
                        <input
                            type="password" placeholder="Contraseña" required
                            value={nuevoOp.password}
                            onChange={(e) => setNuevoOp({ ...nuevoOp, password: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.colors.border}` }}
                        />
                        <select
                            value={nuevoOp.rol}
                            onChange={(e) => setNuevoOp({ ...nuevoOp, rol: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.colors.border}`, background: 'white' }}
                        >
                            <option value="operador">Operador (Solo Despacho)</option>
                            <option value="admin_limitado">Administrador Limitado (Sin Gestión)</option>
                            <option value="admin">Administrador Total</option>
                        </select>
                        <button type="submit" style={{ ...obtenerEstiloBoton(false, THEME.colors.primary), width: '100%', marginTop: '10px' }}>
                            GUARDAR OPERADOR
                        </button>
                    </form>
                </div>
            )}

            {/* TABLA DE OPERADORES REGISTRADOS */}
            <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{
                    background: THEME.colors.dark,
                    color: 'white',
                    padding: '15px',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    <div>NOMBRE / EMAIL</div>
                    <div style={{ textAlign: 'center' }}>ROL</div>
                    <div style={{ textAlign: 'center' }}>ACCIÓN</div>
                </div>

                {/* MAPEADO DINÁMICO DE OPERADORES DESDE LA BASE DE DATOS */}
                {operadores && operadores.length > 0 ? (
                    operadores.map((op) => (
                        <div key={op.id} style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr',
                            padding: '15px',
                            alignItems: 'center',
                            borderBottom: `1px solid ${THEME.colors.border}`
                        }}>
                            <div style={{ fontSize: '14px', color: THEME.colors.dark }}>
                                {op.email}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{
                                    background: op.rol === 'admin' ? '#e9d8fd' : (op.rol === 'admin_limitado' ? '#bee3f8' : '#e2e8f0'),
                                    color: op.rol === 'admin' ? '#6b46c1' : (op.rol === 'admin_limitado' ? '#2b6cb0' : '#4a5568'),
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}>
                                    {op.rol?.toUpperCase().replace('_', ' ')}
                                </span>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => alEliminar(op)}
                                    style={{
                                        background: '#fed7d7',
                                        color: '#c53030',
                                        border: 'none',
                                        padding: '6px 15px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ELIMINAR
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                        No se encontraron operadores registrados.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionOperadores;