import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import Swal from 'sweetalert2'; 

export const useInventory = () => {
    const [items, setItems] = useState([]);
    const [operadores, setOperadores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
        fetchOperadores();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inventario')
                .select('*')
                .order('descripcion', { ascending: true });
            
            if (error) throw error;

            const dataOrdenada = [...data].sort((a, b) => {
                const obtenerPrioridad = (desc) => {
                    const d = desc.toLowerCase();
                    if (d.includes('rojo')) return 1;
                    if (d.includes('blanco')) return 2;
                    if (d.includes('transparente')) return 3;
                    if (d.includes('amarillo')) return 4;
                    return 5;
                };
                return obtenerPrioridad(a.descripcion) - obtenerPrioridad(b.descripcion);
            });
            setItems(dataOrdenada);
        } catch (err) {
            console.error("Error cargando inventario:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchOperadores = async () => {
        const { data, error } = await supabase
            .from('perfiles')
            .select('*')
            .order('email', { ascending: true });
        if (!error) setOperadores(data);
    };

    const fetchMovimientos = async () => {
        const { data, error } = await supabase
            .from('movimientos')
            .select('*')
            .order('fecha', { ascending: false });
        if (error) throw error;
        return data;
    };

    const crearOperador = async (nombre, emailReal, password, rol) => {
        const rolNormalizado = rol.toLowerCase().trim();
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailReal,
            password: password,
        });

        if (authError) throw authError;

        if (authData?.user) {
            const { error: perfilError } = await supabase
                .from('perfiles')
                .insert([{ 
                    id: authData.user.id, 
                    email: emailReal, 
                    rol: rolNormalizado,
                    nombre: nombre 
                }]);

            if (perfilError) throw new Error(`Error en Base de Datos: ${perfilError.message}`);
        }
        await fetchOperadores();
    };

    const crearProducto = async (nuevoSaco) => {
        const { error } = await supabase.from('inventario').insert([nuevoSaco]);
        if (error) throw error;
        fetchInventory();
    };

    const actualizarStock = async (codigo_id, nuevoStock, cantidadMovida, tipoMovimiento, descripcionSaco, urlComprobante = null) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data: perfil } = await supabase
                .from('perfiles')
                .select('nombre')
                .eq('id', user.id)
                .single();

            const { error: stockError } = await supabase
                .from('inventario')
                .update({ stock_total: nuevoStock })
                .eq('codigo_id', codigo_id);
            
            if (stockError) throw stockError;

            // AJUSTE DE HORA LOCAL CHILE PARA AUDITORÍA
            // Obtenemos la fecha exacta en Chile para evitar el desfase de medianoche
            const ahoraChile = new Date().toLocaleString("en-US", {timeZone: "America/Santiago"});
            const fechaAudit = new Date(ahoraChile).toISOString();

            const { error: movError } = await supabase
                .from('movimientos')
                .insert([{
                    codigo_id: codigo_id,
                    descripcion: descripcionSaco,
                    tipo: tipoMovimiento,
                    cantidad: cantidadMovida,
                    operador_email: perfil?.nombre || user?.email || 'Sistema',
                    stock_resultante: nuevoStock,
                    comprobante_url: urlComprobante,
                    fecha: fechaAudit // <--- FECHA SINCRONIZADA CON SANTIAGO
                }]);

            if (movError) throw movError;

            await fetchInventory();
            return true;

        } catch (error) {
            console.error("Falla de conexión:", error.message);
            Swal.fire({
                title: '¡ERROR DE RED!',
                text: 'No hay señal. El stock NO se guardó. Intenta de nuevo.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
            return false;
        }
    };

    const eliminarSaco = async (codigo_id) => {
        const { error } = await supabase.from('inventario').delete().eq('codigo_id', codigo_id);
        if (error) throw error;
        fetchInventory();
    };

    const eliminarOperador = async (id) => {
        const { error } = await supabase.from('perfiles').delete().eq('id', id);
        if (error) throw error;
        fetchOperadores();
    };

    const editarProducto = async (codigo_id_original, nuevaDescripcion, nuevoCodigoId) => {
        const { error } = await supabase
            .from('inventario')
            .update({ descripcion: nuevaDescripcion, codigo_id: nuevoCodigoId })
            .eq('codigo_id', codigo_id_original);

        if (error) throw error;
        fetchInventory();
    };

    return {
        items, operadores, loading,
        crearProducto, crearOperador, actualizarStock,
        eliminarSaco, eliminarOperador, fetchOperadores,
        fetchInventory, editarProducto, fetchMovimientos
    };
};