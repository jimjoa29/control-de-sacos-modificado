import React, { useState } from 'react';
import { supabase } from '../api/supabase'; // Asegúrate que la ruta a tu archivo supabase sea correcta
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const [nuevaClave, setNuevaClave] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarCambioClave = async (e) => {
        e.preventDefault();

        if (nuevaClave.length < 6) {
            return Swal.fire('Aviso', 'La contraseña debe tener al menos 6 caracteres', 'warning');
        }

        setCargando(true);

        // Esta es la función mágica de Supabase que actualiza al usuario actual
        const { error } = await supabase.auth.updateUser({
            password: nuevaClave
        });

        if (error) {
            Swal.fire('Error', 'No se pudo actualizar: ' + error.message, 'error');
            setCargando(false);
        } else {
            await Swal.fire({
                title: '¡Éxito!',
                text: 'Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con tu nueva clave.',
                icon: 'success',
                confirmButtonColor: '#3182ce'
            });
            // Redirigir al inicio (Login)
            window.location.href = '/';
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f7fafc'
        }}>
            <div style={{
                padding: '40px',
                maxWidth: '400px',
                width: '100%',
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #d1d5db',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ textAlign: 'center', color: '#2d3748', marginBottom: '10px' }}>🔐 Nueva Contraseña</h2>
                <p style={{ textAlign: 'center', color: '#718096', marginBottom: '30px', fontSize: '14px' }}>
                    Ingresa tu nueva clave de acceso para el sistema.
                </p>

                <form onSubmit={manejarCambioClave}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#4a5568', fontWeight: 'bold' }}>
                            NUEVA CONTRASEÑA
                        </label>
                        <input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #cbd5e0',
                                boxSizing: 'border-box',
                                background: '#f8fafc'
                            }}
                            value={nuevaClave}
                            onChange={(e) => setNuevaClave(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: cargando ? '#a0aec0' : '#3182ce',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            cursor: cargando ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            transition: 'background 0.3s'
                        }}
                    >
                        {cargando ? 'ACTUALIZANDO...' : 'GUARDAR NUEVA CLAVE'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;