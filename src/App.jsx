import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './api/supabase';
import Inventario from './views/Inventario';
import Login from './views/Login';
import ResetPassword from './views/ResetPassword'; // Importamos la nueva página

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revisar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar si el usuario entra o sale
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;

  return (
    <Router>
      <Routes>
        {/* RUTA DE RECUPERACIÓN: Siempre accesible si tienes el link del correo */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* RUTA PRINCIPAL: Si hay sesión va a Inventario, si no a Login */}
        <Route 
          path="/" 
          element={session ? <Navigate to="/inventario" /> : <Login />} 
        />

        {/* RUTA INVENTARIO: Protegida (si no hay sesión, te manda al login) */}
        <Route 
          path="/inventario" 
          element={session ? <Inventario /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;