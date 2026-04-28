import { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export const useInventory = () => {
  const [items, setItems] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    const { data } = await supabase.from('sacos').select('*').order('descripcion');
    if (data) setItems(data);
  };

  const fetchOperadores = async () => {
    const { data } = await supabase.from('perfiles').select('*').eq('rol', 'operador');
    if (data) setOperadores(data);
  };

  useEffect(() => {
    const cargarTodo = async () => {
      setLoading(true);
      await Promise.all([fetchInventory(), fetchOperadores()]);
      setLoading(false);
    };
    cargarTodo();
  }, []);

  const crearProducto = async (nuevo) => {
    const { error } = await supabase.from('sacos').insert([nuevo]);
    if (!error) await fetchInventory();
    return { error };
  };

  const actualizarStock = async (id, cant) => {
    const { error } = await supabase.from('sacos').update({ stock_total: cant }).eq('codigo_id', id);
    if (!error) await fetchInventory();
    return { error };
  };

  const eliminarSaco = async (id) => {
    const { error } = await supabase.from('sacos').delete().eq('codigo_id', id);
    if (!error) await fetchInventory();
    return { error };
  };

  const eliminarOperador = async (id) => {
    const { error } = await supabase.from('perfiles').delete().eq('id', id);
    if (!error) await fetchOperadores();
    return { error };
  };

  return { 
    items, operadores, loading, 
    crearProducto, actualizarStock, eliminarSaco, 
    eliminarOperador, fetchOperadores, fetchInventory 
  };
};