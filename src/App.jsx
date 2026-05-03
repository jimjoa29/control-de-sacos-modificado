import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './api/supabase';
import Inventario from './views/Inventario';
import Login from './views/Login';
import ResetPassword from './views/ResetPassword';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función asíncrona para manejar la sesión de forma segura
    const getInitialSession = async () => {
      try {
        // Validación: evitamos desestructurar directamente para prevenir el error de 'payload'
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error de autenticación segura:", error.message);
        } else if (data && data.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.error("Fallo crítico al conectar con el sistema:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de estado (Login/Logout) de forma robusta
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Limpieza de la suscripción al desmontar el componente
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Pantalla de carga profesional
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
        <h2>Cargando sistema de logística...</h2>
        <p>Verificando conexión segura con la base de datos.</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* RUTA DE RECUPERACIÓN */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* RUTA PRINCIPAL */}
        <Route 
          path="/" 
          element={session ? <Navigate to="/inventario" /> : <Login />} 
        />

        {/* RUTA INVENTARIO: Acceso protegido para evitar intrusos */}
        <Route 
          path="/inventario" 
          element={session ? <Inventario /> : <Navigate to="/" />} 
        />

        {/* Redirección por defecto si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;