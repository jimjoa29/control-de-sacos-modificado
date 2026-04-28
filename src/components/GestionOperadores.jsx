import React from 'react';
import Swal from 'sweetalert2';

const GestionOperadores = ({ setVista, nuevoOp, setNuevoOp, alRegistrar, operadores, alEliminar }) => {
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => setVista('menu')} style={{ color: '#3182ce', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                ← Volver al Menú
            </button>

            <div style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f4f8' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '20px', borderLeft: '4px solid #2d3748', paddingLeft: '15px' }}>
                    Nuevo Acceso de Operador
                </h3>
                <form onSubmit={alRegistrar}>
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
                                        onClick={() => alEliminar(o)}
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
    );
};

export default GestionOperadores;