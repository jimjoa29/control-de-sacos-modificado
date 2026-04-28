import React, { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { supabase } from '../api/supabase';
import Swal from 'sweetalert2';

const Inventario = () => {
    const {
        items, operadores, loading, crearProducto,
        actualizarStock, eliminarSaco, eliminarOperador, fetchOperadores, fetchInventory
    } = useInventory();

    const [vista, setVista] = useState('menu');
    const [rol, setRol] = useState('operador');
    const [userEmail, setUserEmail] = useState('');
    const [nuevoSaco, setNuevoSaco] = useState({ codigo_id: '', descripcion: '', stock_total: 0 });
    const [nuevoOp, setNuevoOp] = useState({ nombre: '', password: '' });

    useEffect(() => {
        const checkRol = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);
                const { data } = await supabase
                    .from('perfiles')
                    .select('rol')
                    .eq('id', user.id)
                    .single();

                if (data && data.rol === 'admin') {
                    setRol('admin');
                } else {
                    setRol('operador');
                    setVista('sacos');
                }
            }
        };
        checkRol();
    }, []);

    const manejarBorradoSaco = async (item) => {
        const { value: pass } = await Swal.fire({
            title: 'SEGURIDAD DE ADMINISTRADOR',
            text: `Joan, ingresa tu clave para eliminar: ${item.descripcion}`,
            input: 'password',
            inputPlaceholder: 'Tu contraseña',
            showCancelButton: true,
            confirmButtonColor: '#1a202c',
        });

        if (pass) {
            const { error } = await supabase.auth.signInWithPassword({ email: userEmail, password: pass });
            if (!error) {
                await eliminarSaco(item.codigo_id);
                Swal.fire('Eliminado', 'Producto borrado.', 'success');
            } else {
                Swal.fire('Error', 'Contraseña incorrecta.', 'error');
            }
        }
    };

    const ajustarInventario = async (item, tipo) => {
        const { value: cantidad } = await Swal.fire({
            title: tipo === 'sumar' ? `Sumar a ${item.descripcion}` : `Restar de ${item.descripcion}`,
            input: 'number',
            inputLabel: `¿Cuánta cantidad desea ${tipo === 'sumar' ? 'ingresar' : 'retirar'}?`,
            inputPlaceholder: '0',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            confirmButtonColor: tipo === 'sumar' ? '#3182ce' : '#e53e3e'
        });

        if (cantidad && parseInt(cantidad) > 0) {
            const actual = parseInt(item.stock_total);
            const cambio = parseInt(cantidad);
            const nuevoTotal = tipo === 'sumar' ? actual + cambio : actual - cambio;

            if (nuevoTotal < 0) {
                return Swal.fire('Error', 'No puedes dejar el stock en negativo, Joan.', 'error');
            }

            await actualizarStock(item.codigo_id, nuevoTotal);
            Swal.fire('Actualizado', `Nuevo stock total: ${nuevoTotal}`, 'success');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '30px' }}>📦 Sistema Bodega</h2>

            {/* --- MENÚ PRINCIPAL (ADMIN) --- */}
            {vista === 'menu' && rol === 'admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px', maxWidth: '500px', margin: '0 auto' }}>
                    <button onClick={() => setVista('op')} style={{ padding: '25px', borderRadius: '15px', background: '#2d3748', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '18px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>👤 GESTIONAR OPERADORES</button>
                    <button onClick={() => setVista('sacos')} style={{ padding: '25px', borderRadius: '15px', background: '#3182ce', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '18px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>📊 INVENTARIO DE SACOS</button>
                    <button onClick={() => supabase.auth.signOut()} style={{ background: '#e53e3e', color: 'white', padding: '15px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '20px', boxShadow: '0 4px 6px rgba(229, 62, 62, 0.2)' }}>CERRAR SESIÓN SEGURA</button>
                </div>
            )}

            {/* --- VISTA: GESTIÓN OPERADORES (MEJORADA) --- */}
            {vista === 'op' && rol === 'admin' && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <button onClick={() => setVista('menu')} style={{ color: '#3182ce', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ← Volver al Menú
                    </button>

                    <div style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f4f8' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '20px', borderLeft: '4px solid #2d3748', paddingLeft: '15px' }}>
                            Nuevo Acceso de Operador
                        </h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const mail = `${nuevoOp.nombre.toLowerCase().trim()}@bodega.com`;
                            const { data, error } = await supabase.auth.signUp({ email: mail, password: nuevoOp.password });
                            if (!error && data.user) {
                                await supabase.from('perfiles').insert([{ id: data.user.id, email: nuevoOp.nombre, rol: 'operador' }]);
                                fetchOperadores();
                                setNuevoOp({ nombre: '', password: '' });
                                Swal.fire('¡Éxito!', 'Operador creado correctamente', 'success');
                            } else {
                                Swal.fire('Error', error.message, 'error');
                            }
                        }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#718096', fontWeight: 'bold' }}>NOMBRE DEL OPERADOR</label>
                                <input
                                    placeholder="Ej: Ignacio"
                                    value={nuevoOp.nombre}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}
                                    onChange={e => setNuevoOp({ ...nuevoOp, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#718096', fontWeight: 'bold' }}>CONTRASEÑA TEMPORAL</label>
                                <input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={nuevoOp.password}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}
                                    onChange={e => setNuevoOp({ ...nuevoOp, password: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '14px', background: '#2d3748', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                                REGISTRAR OPERADOR
                            </button>
                        </form>
                    </div>

                    <h4 style={{ color: '#4a5568', marginBottom: '15px', paddingLeft: '5px' }}>Operadores Registrados</h4>
                    <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f0f4f8' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f7fafc', borderBottom: '2px solid #edf2f7' }}>
                                    <th style={{ padding: '15px', textAlign: 'left', color: '#718096', fontSize: '13px' }}>NOMBRE</th>
                                    <th style={{ padding: '15px', textAlign: 'center', color: '#718096', fontSize: '13px' }}>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {operadores.length > 0 ? operadores.map(o => (
                                    <tr key={o.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#2d3748' }}>{o.email}</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: '¿Eliminar acceso?',
                                                        text: `Se borrará a ${o.email} del sistema definitivamente.`,
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#e53e3e',
                                                        confirmButtonText: 'Sí, borrar'
                                                    }).then((res) => {
                                                        if (res.isConfirmed) {
                                                            eliminarOperador(o.id);
                                                            Swal.fire('Eliminado', '', 'success');
                                                        }
                                                    });
                                                }}
                                                style={{ background: '#fed7d7', color: '#c53030', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                            >
                                                ELIMINAR
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="2" style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>No hay operadores activos.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- INVENTARIO (VISTA COMPARTIDA) --- */}
            {vista === 'sacos' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        {rol === 'admin' ? <button onClick={() => setVista('menu')} style={{ color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>← Volver al Menú</button> : <span></span>}
                        <button onClick={() => supabase.auth.signOut()} style={{ background: '#e53e3e', color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px' }}>CERRAR SESIÓN</button>
                    </div>

                    {rol === 'admin' && (
                        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f4f8' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '20px', borderLeft: '4px solid #38a169', paddingLeft: '15px' }}>Registro de Mercancía</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                await crearProducto(nuevoSaco);
                                setNuevoSaco({ codigo_id: '', descripcion: '', stock_total: 0 });
                                fetchInventory();
                                Swal.fire('¡Éxito!', 'Producto añadido', 'success');
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <input placeholder="CÓDIGO ID" value={nuevoSaco.codigo_id} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }} onChange={e => setNuevoSaco({ ...nuevoSaco, codigo_id: e.target.value.toUpperCase() })} required />
                                    <input type="number" placeholder="STOCK INICIAL" value={nuevoSaco.stock_total} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }} onChange={e => setNuevoSaco({ ...nuevoSaco, stock_total: e.target.value })} required />
                                </div>
                                <input placeholder="DESCRIPCIÓN" value={nuevoSaco.descripcion} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box', marginBottom: '20px' }} onChange={e => setNuevoSaco({ ...nuevoSaco, descripcion: e.target.value })} required />
                                <button type="submit" style={{ width: '100%', padding: '14px', background: '#38a169', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>INGRESAR A INVENTARIO</button>
                            </form>
                        </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <thead style={{ background: '#2d3748', color: 'white' }}>
                            <tr><th style={{ padding: '15px', textAlign: 'left' }}>Producto</th><th style={{ padding: '15px', textAlign: 'center' }}>Stock</th><th style={{ padding: '15px', textAlign: 'center' }}>Acción</th></tr>
                        </thead>
                        <tbody>
                            {items.map(i => (
                                <tr key={i.codigo_id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{i.descripcion}</div>
                                        <div style={{ fontSize: '12px', color: '#a0aec0' }}>{i.codigo_id}</div>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center', fontWeight: '900', fontSize: '18px', color: '#2d3748' }}>{i.stock_total}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            {rol === 'admin' && (
                                                <button onClick={() => ajustarInventario(i, 'sumar')} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                                            )}
                                            <button onClick={() => ajustarInventario(i, 'restar')} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                                            {rol === 'admin' && (
                                                <button onClick={() => manejarBorradoSaco(i)} style={{ background: '#1a202c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>X</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Inventario;