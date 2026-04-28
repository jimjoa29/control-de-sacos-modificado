import React, { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { supabase } from '../api/supabase';
import Swal from 'sweetalert2';

// IMPORTAMOS LOS COMPONENTES QUE CREAMOS EN LA CARPETA COMPONENTS
import MenuPrincipal from '../components/MenuPrincipal';
import GestionOperadores from '../components/GestionOperadores';
import FormularioSaco from '../components/FormularioSaco';
import TablaInventario from '../components/TablaInventario';

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

    // Lógica para verificar quién entró (Admin o Operador)
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

    // Función para borrar productos (Solo Admin)
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

    // Función para sumar o restar stock
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

    // Función para registrar nuevos operadores
    const manejarRegistroOperador = async (e) => {
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
    };

    // Función para eliminar acceso de operadores
    const manejarBorradoOperador = (o) => {
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
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '30px' }}>📦 Sistema Bodega</h2>

            {/* --- VISTA: MENÚ PRINCIPAL --- */}
            {vista === 'menu' && rol === 'admin' && (
                <MenuPrincipal setVista={setVista} />
            )}

            {/* --- VISTA: GESTIÓN OPERADORES --- */}
            {vista === 'op' && rol === 'admin' && (
                <GestionOperadores 
                    setVista={setVista} 
                    nuevoOp={nuevoOp} 
                    setNuevoOp={setNuevoOp} 
                    alRegistrar={manejarRegistroOperador} 
                    operadores={operadores} 
                    alEliminar={manejarBorradoOperador} 
                />
            )}

            {/* --- VISTA: INVENTARIO DE SACOS --- */}
            {vista === 'sacos' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        {rol === 'admin' ? (
                            <button onClick={() => setVista('menu')} style={{ color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                ← Volver al Menú
                            </button>
                        ) : <span></span>}
                        <button onClick={() => supabase.auth.signOut()} style={{ background: '#e53e3e', color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                            CERRAR SESIÓN
                        </button>
                    </div>

                    {rol === 'admin' && (
                        <FormularioSaco 
                            nuevoSaco={nuevoSaco} 
                            setNuevoSaco={setNuevoSaco} 
                            alEnviar={async (e) => {
                                e.preventDefault();
                                await crearProducto(nuevoSaco);
                                setNuevoSaco({ codigo_id: '', descripcion: '', stock_total: 0 });
                                fetchInventory();
                                Swal.fire('¡Éxito!', 'Producto añadido', 'success');
                            }} 
                        />
                    )}

                    <TablaInventario 
                        items={items} 
                        rol={rol} 
                        alAjustar={ajustarInventario} 
                        alBorrar={manejarBorradoSaco} 
                    />
                </div>
            )}
        </div>
    );
};

export default Inventario;