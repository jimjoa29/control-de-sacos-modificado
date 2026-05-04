import React from 'react';
import { DndContext, closestCenter, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { THEME } from '../constants/theme';

const FilaEditable = ({ i, index, items, rol, alAjustar, alBorrar, alEditar, obtenerColorSaco }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: i.codigo_id });

    const rolActual = rol ? rol.toLowerCase().trim() : '';
    const esAdminTotal = rolActual === 'admin';
    const esAdminLimitado = rolActual === 'admin_limitado';
    const esCualquierAdmin = esAdminTotal || esAdminLimitado;

    const colorMarca = obtenerColorSaco(i.descripcion);
    const colorAnterior = index > 0 ? obtenerColorSaco(items[index - 1].descripcion) : null;
    const hayCambioDeColor = colorAnterior && colorAnterior !== colorMarca;

    const esMovil = window.innerWidth < 640;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? '#f7fafc' : THEME.colors.white,
        zIndex: isDragging ? 999 : 1,
        opacity: isDragging ? 0.6 : 1,
        filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.08))',
        position: 'relative'
    };

    const bordeEstilo = `1px solid ${THEME.colors.border}`;

    return (
        <React.Fragment>
            {hayCambioDeColor && (
                <tr style={{ height: esMovil ? '10px' : '20px' }}><td colSpan="3"></td></tr>
            )}
            <tr ref={setNodeRef} style={style}>
                <td {...attributes} {...listeners} style={{
                    padding: esMovil ? '10px 4px' : '12px 15px',
                    display: 'flex', alignItems: 'center', gap: esMovil ? '6px' : '15px',
                    borderTop: bordeEstilo, borderBottom: bordeEstilo, borderLeft: bordeEstilo,
                    borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', background: THEME.colors.white,
                    cursor: esCualquierAdmin ? 'grab' : 'default'
                }}>
                    <div style={{
                        width: '8px', height: '40px', backgroundColor: colorMarca,
                        borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0
                    }}></div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{
                            fontWeight: '900', 
                            color: THEME.colors.dark,
                            fontSize: esMovil ? '15px' : '18px', // FUENTE EN 15 PARA MÓVIL
                            lineHeight: '1.1',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {i.descripcion}
                        </div>
                        <div style={{ fontSize: '10px', color: THEME.colors.muted, marginTop: '2px' }}>{i.codigo_id}</div>
                    </div>
                </td>

                <td style={{
                    padding: esMovil ? '8px 2px' : '12px 15px',
                    textAlign: 'center', fontWeight: '900',
                    fontSize: esMovil ? '14px' : THEME.fonts.lg,
                    color: THEME.colors.dark, borderTop: bordeEstilo, borderBottom: bordeEstilo, background: THEME.colors.white
                }}>
                    {i.stock_total}
                </td>

                <td style={{
                    padding: esMovil ? '8px 4px' : '12px 15px',
                    textAlign: 'center', borderTop: bordeEstilo, borderBottom: bordeEstilo,
                    borderRight: bordeEstilo, borderTopRightRadius: '12px', borderBottomRightRadius: '12px', background: THEME.colors.white
                }}>
                    <div style={{
                        display: 'flex',
                        gap: esMovil ? '4px' : '8px',
                        justifyContent: 'center',
                        flexWrap: esMovil ? 'wrap' : 'nowrap'
                    }}>
                        {esCualquierAdmin && (
                            <button
                                onClick={() => alAjustar(i, 'sumar')}
                                style={{ background: THEME.colors.primary, color: THEME.colors.white, border: 'none', padding: esMovil ? '5px 8px' : '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: esMovil ? '11px' : '13px' }}
                            >
                                +
                            </button>
                        )}

                        <button
                            onClick={() => alAjustar(i, 'restar')}
                            style={{ background: THEME.colors.danger, color: THEME.colors.white, border: 'none', padding: esMovil ? '5px 8px' : '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: esMovil ? '11px' : '13px' }}
                        >
                            -
                        </button>

                        {esCualquierAdmin && (
                            <button
                                onClick={() => alEditar(i)}
                                style={{ 
                                    background: '#ecc94b', 
                                    color: THEME.colors.white, 
                                    border: 'none', 
                                    padding: esMovil ? '4px 6px' : '6px 10px',
                                    borderRadius: '6px', 
                                    cursor: 'pointer', 
                                    fontSize: esMovil ? '10px' : '13px' 
                                }}
                            >
                                ✏️
                            </button>
                        )}

                        {esAdminTotal && (
                            <button
                                onClick={() => alBorrar(i)}
                                style={{ background: THEME.colors.dark, color: THEME.colors.white, border: 'none', padding: esMovil ? '5px 8px' : '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: esMovil ? '11px' : '13px' }}
                            >
                                X
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        </React.Fragment>
    );
};

// ... Resto del componente TablaInventario (sin cambios)