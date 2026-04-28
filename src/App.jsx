import React, { useState, useEffect } from 'react';
import { supabase } from './api/supabase';
import Inventario from './views/Inventario';
import Login from './views/Login';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Revisar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuchar si el usuario entra o sale para cambiar la pantalla
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Si no hay nadie logueado, mostramos el Login
  if (!session) {
    return <Login onLogin={(user) => setSession(true)} />;
  }

  // Si hay sesión, mostramos todo el sistema de inventario
  return <Inventario />;
}

export default App;