import React from 'react';

const FormularioSaco = ({ nuevoSaco, setNuevoSaco, alEnviar }) => {
    return (
        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f0f4f8' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '20px', borderLeft: '4px solid #38a169', paddingLeft: '15px' }}>Registro de Mercancía</h3>
            <form onSubmit={alEnviar}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <input 
                        placeholder="CÓDIGO ID" 
                        value={nuevoSaco.codigo_id} 
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }} 
                        onChange={e => setNuevoSaco({ ...nuevoSaco, codigo_id: e.target.value.toUpperCase() })} 
                        required 
                    />
                    <input 
                        type="number" 
                        placeholder="STOCK INICIAL" 
                        value={nuevoSaco.stock_total} 
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }} 
                        onChange={e => setNuevoSaco({ ...nuevoSaco, stock_total: e.target.value })} 
                        required 
                    />
                </div>
                <input 
                    placeholder="DESCRIPCIÓN" 
                    value={nuevoSaco.descripcion} 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box', marginBottom: '20px' }} 
                    onChange={e => setNuevoSaco({ ...nuevoSaco, descripcion: e.target.value })} 
                    required 
                />
                <button type="submit" style={{ width: '100%', padding: '14px', background: '#38a169', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    INGRESAR A INVENTARIO
                </button>
            </form>
        </div>
    );
};

export default FormularioSaco;