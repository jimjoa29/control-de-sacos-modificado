import React, { useState } from 'react';
import { supabase } from '../api/supabase';
import Swal from 'sweetalert2';

const Login = () => {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');

  const manejarEntrada = async (e) => {
    e.preventDefault();
    
    let correoFinal = nombre.toLowerCase().trim().replace(/\s+/g, '');

    // JOAN: Si no tiene @, le ponemos el dominio. Si ya tiene, lo dejamos igual.
    if (!correoFinal.includes('@')) {
      correoFinal = `${correoFinal}@bodega.com`;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: correoFinal,
      password: password,
    });

    if (error) {
      Swal.fire('Error', 'Usuario o contraseña incorrectos, Joan.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' }}>
      <form onSubmit={manejarEntrada} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#1a365d', marginBottom: '30px' }}>Acceso al Sistema</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Usuario / Correo</label>
          <input 
            type="text" 
            placeholder="Nombre o correo completo" 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contraseña</label>
          <input 
            type="password" 
            placeholder="Tu clave secreta" 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '15px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          ENTRAR AL SISTEMA
        </button>
      </form>
    </div>
  );
};

export default Login;