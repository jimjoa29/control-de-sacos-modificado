import React from 'react';
import { supabase } from '../api/supabase';

const MenuPrincipal = ({ setVista }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px', maxWidth: '500px', margin: '0 auto' }}>
            <button onClick={() => setVista('op')} style={{ padding: '25px', borderRadius: '15px', background: '#2d3748', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '18px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>👤 GESTIONAR OPERADORES</button>
            <button onClick={() => setVista('sacos')} style={{ padding: '25px', borderRadius: '15px', background: '#3182ce', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '18px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>📊 INVENTARIO DE SACOS</button>
            <button onClick={() => supabase.auth.signOut()} style={{ background: '#e53e3e', color: 'white', padding: '15px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '20px', boxShadow: '0 4px 6px rgba(229, 62, 62, 0.2)' }}>CERRAR SESIÓN SEGURA</button>
        </div>
    );
};

export default MenuPrincipal;