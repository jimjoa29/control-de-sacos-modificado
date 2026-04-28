import React from 'react';

const TablaInventario = ({ items, rol, alAjustar, alBorrar }) => {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <thead style={{ background: '#2d3748', color: 'white' }}>
                <tr>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Producto</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Stock</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Acción</th>
                </tr>
            </thead>
            <tbody>
                {items.map(i => (
                    <tr key={i.codigo_id} style={{ borderBottom: '1px solid #edf2f7' }}>
                        <td style={{ padding: '15px' }}>
                            <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{i.descripcion}</div>
                            <div style={{ fontSize: '12px', color: '#a0aec0' }}>{i.codigo_id}</div>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', fontWeight: '900', fontSize: '18px', color: '#2d3748' }}>{i.stock_total}</td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                {rol === 'admin' && (
                                    <button onClick={() => alAjustar(i, 'sumar')} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                                )}
                                <button onClick={() => alAjustar(i, 'restar')} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                                {rol === 'admin' && (
                                    <button onClick={() => alBorrar(i)} style={{ background: '#1a202c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>X</button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TablaInventario;