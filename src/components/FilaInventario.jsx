import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const FilaInventario = ({ i, rol, alAjustar, alBorrar, alEditar, colorMarca, bordeGris }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: i.codigo_id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? '#edf2f7' : 'white',
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
        filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.08))',
        position: 'relative'
    };

    return (
        <tr ref={setNodeRef} style={style}>
            {/* El "manillar" para arrastrar es la franja de color */}
            <td {...attributes} {...listeners} style={{ 
                padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '15px',
                borderTop: bordeGris, borderBottom: bordeGris, borderLeft: bordeGris,
                borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', cursor: 'grab'
            }}>
                <div style={{ width: '10px', height: '35px', backgroundColor: colorMarca, borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)' }}></div>
                <div>
                    <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{i.descripcion}</div>
                    <div style={{ fontSize: '11px', color: '#a0aec0' }}>{i.codigo_id}</div>
                </div>
            </td>

            <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '900', borderTop: bordeGris, borderBottom: bordeGris }}>
                {i.stock_total}
            </td>

            <td style={{ padding: '12px 15px', textAlign: 'center', borderTop: bordeGris, borderBottom: bordeGris, borderRight: bordeGris, borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => alAjustar(i, 'sumar')} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px' }}>+</button>
                    <button onClick={() => alAjustar(i, 'restar')} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px' }}>-</button>
                    {rol === 'admin' && <button onClick={() => alEditar(i)} style={{ background: '#ecc94b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px' }}>✏️</button>}
                    {rol === 'admin' && <button onClick={() => alBorrar(i)} style={{ background: '#1a202c', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px' }}>X</button>}
                </div>
            </td>
        </tr>
    );
};

export default FilaInventario;