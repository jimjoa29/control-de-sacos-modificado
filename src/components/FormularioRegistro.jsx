import React from 'react';

const FormularioRegistro = ({ onSubmit, nuevoSaco, setNuevoSaco }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Registro de Mercancía</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Código del Saco"
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={nuevoSaco.codigo_id}
          onChange={(e) => setNuevoSaco({ ...nuevoSaco, codigo_id: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={nuevoSaco.descripcion}
          onChange={(e) => setNuevoSaco({ ...nuevoSaco, descripcion: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Stock Inicial"
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={nuevoSaco.stock_total}
          onChange={(e) => setNuevoSaco({ ...nuevoSaco, stock_total: e.target.value })}
          required
        />
        <button
          type="submit"
          className="md:col-span-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors"
        >
          Guardar en Base de Datos
        </button>
      </form>
    </div>
  );
};

export default FormularioRegistro;