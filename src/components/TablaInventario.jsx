import React, { useState, useEffect } from 'react';
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
                    padding: esMovil ? '8px 6px' : '12px 15px',
                    display: 'flex', alignItems: 'center', gap: esMovil ? '6px' : '15px',
                    borderTop: bordeEstilo, borderBottom: bordeEstilo, borderLeft: bordeEstilo,
                    borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', background: THEME.colors.white,
                    cursor: esCualquierAdmin ? 'grab' : 'default',
                    width: '100%'
                }}>
                    <div style={{
                        width: '6px', height: '40px', backgroundColor: colorMarca,
                        borderRadius: '3px', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0
                    }}></div>
                    <div style={{ overflow: 'hidden', width: '100%' }}>
                        <div style={{
                            fontWeight: '900',
                            color: THEME.colors.dark,
                            fontSize: esMovil ? '13px' : '16px',
                            lineHeight: '1.1',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            textAlign: 'left'
                        }}>
                            {i.descripcion}
                        </div>
                        <div style={{ fontSize: '9px', color: THEME.colors.muted, marginTop: '1px' }}>{i.codigo_id}</div>
                    </div>
                </td>

                <td style={{
                    padding: '8px 2px',
                    textAlign: 'center',
                    fontWeight: '950',
                    fontSize: esMovil ? '16px' : '20px',
                    color: '#28a745',
                    borderTop: bordeEstilo, borderBottom: bordeEstilo, background: THEME.colors.white
                }}>
                    {i.stock_total}
                </td>

                <td style={{
                    padding: '8px 4px',
                    textAlign: 'center', borderTop: bordeEstilo, borderBottom: bordeEstilo,
                    borderRight: bordeEstilo, borderTopRightRadius: '12px', borderBottomRightRadius: '12px', background: THEME.colors.white
                }}>
                    <div style={{
                        display: 'flex',
                        gap: esMovil ? '4px' : '8px',
                        justifyContent: 'center',
                        flexWrap: 'nowrap'
                    }}>
                        {esCualquierAdmin && (
                            <button onClick={() => alAjustar(i, 'sumar')} style={{ background: THEME.colors.primary, color: THEME.colors.white, border: 'none', padding: esMovil ? '5px 8px' : '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: esMovil ? '12px' : '14px' }}>+</button>
                        )}
                        <button onClick={() => alAjustar(i, 'restar')} style={{ background: THEME.colors.danger, color: THEME.colors.white, border: 'none', padding: esMovil ? '5px 8px' : '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: esMovil ? '12px' : '14px' }}>-</button>
                        {esCualquierAdmin && (
                            <button onClick={() => alEditar(i)} style={{ background: '#ecc94b', color: THEME.colors.white, border: 'none', padding: esMovil ? '5px 7px' : '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: esMovil ? '11px' : '13px' }}>✏️</button>
                        )}
                        {esAdminTotal && (
                            <button onClick={() => alBorrar(i)} style={{ background: THEME.colors.dark, color: THEME.colors.white, border: 'none', padding: esMovil ? '5px 8px' : '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: esMovil ? '12px' : '14px' }}>X</button>
                        )}
                    </div>
                </td>
            </tr>
        </React.Fragment>
    );
};

const TablaInventario = ({ items, rol, alAjustar, alBorrar, alEditar, setEstadoItems }) => {
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
    const esMovil = window.innerWidth < 640;

    const [mostrarSubir, setMostrarSubir] = useState(false);

    // Lógica de Scroll mejorada para móviles (usando requestAnimationFrame para eficiencia)
    useEffect(() => {
        const controlarScroll = () => {
            const posicion = window.pageYOffset || document.documentElement.scrollTop;
            if (posicion > 200) {
                setMostrarSubir(true);
            } else {
                setMostrarSubir(false);
            }
        };

        window.addEventListener('scroll', controlarScroll, { passive: true });
        return () => window.removeEventListener('scroll', controlarScroll);
    }, []);

    const irArriba = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const rolLimpio = rol ? rol.toLowerCase().trim() : '';
        if ((rolLimpio === 'admin' || rolLimpio === 'admin_limitado') && active && over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.codigo_id === active.id);
            const newIndex = items.findIndex((item) => item.codigo_id === over.id);
            if (setEstadoItems) setEstadoItems(arrayMove(items, oldIndex, newIndex));
        }
    };

    const obtenerColorSaco = (descripcion) => {
        const desc = descripcion.toLowerCase();
        if (desc.includes('rojo')) return '#feb2b2';
        if (desc.includes('amarillo')) return '#faf089';
        if (desc.includes('azul')) return '#90cdf4';
        if (desc.includes('verde')) return '#9ae6b4';
        if (desc.includes('blanco')) return THEME.colors.white;
        if (desc.includes('transparente')) return '#f0f4f8';
        return 'transparent';
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            padding: esMovil ? '0 5px' : '0 20px',
            position: 'relative'
        }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0 6px',
                    marginTop: '10px',
                    tableLayout: 'fixed'
                }}>
                    <thead style={{ background: THEME.colors.dark, color: THEME.colors.white }}>
                        <tr>
                            <th style={{ padding: '12px 8px', textAlign: 'left', borderRadius: '15px 0 0 15px', fontSize: esMovil ? '12px' : '14px', width: esMovil ? '48%' : '50%' }}>Producto</th>
                            <th style={{ padding: '12px 2px', textAlign: 'center', fontSize: esMovil ? '12px' : '14px', width: esMovil ? '12%' : '15%' }}>Stock</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center', borderRadius: '0 15px 15px 0', fontSize: esMovil ? '12px' : '14px', width: esMovil ? '40%' : '35%' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <SortableContext items={items.map(i => i.codigo_id)} strategy={verticalListSortingStrategy}>
                            {items.map((i, index) => (
                                <FilaEditable
                                    key={i.codigo_id} i={i} index={index} items={items} rol={rol}
                                    alAjustar={alAjustar} alBorrar={alBorrar} alEditar={alEditar}
                                    obtenerColorSaco={obtenerColorSaco}
                                />
                            ))}
                        </SortableContext>
                    </tbody>
                </table>
            </DndContext>

            {/* BOTÓN FLOTANTE MEJORADO PARA MÓVIL */}
            {mostrarSubir && (
                <button
                    onClick={irArriba}
                    style={{
                        position: 'fixed',
                        bottom: '25px',
                        right: esMovil ? '20px' : 'calc(50% - 380px)',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: THEME.colors.primary,
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
                        cursor: 'pointer',
                        zIndex: 9999, // Asegura que esté por encima de todo
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    ⬆
                </button>
            )}
        </div>
    );
};

export default TablaInventario;