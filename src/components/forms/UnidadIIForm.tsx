import React from 'react';
import { DollarSign, Plus, Trash2, Calculator, TrendingUp, Wallet, PieChart } from 'lucide-react';
import { ProjectData, ItemFinanciero, ItemCostoVariable, ItemGastoPersonal } from '../../types/project';
import { 
  formatCurrencyCOP, 
  calculateInversionTotal, 
  calculateFinanciacionTotal, 
  calculateGastosFijosMensuales, 
  calculateDepreciacionTotal 
} from '../../utils/helpers';

interface UnidadIIFormProps {
  data: ProjectData['unidadII'];
  onChange: (updated: ProjectData['unidadII']) => void;
}

export const UnidadIIForm: React.FC<UnidadIIFormProps> = ({ data, onChange }) => {
  const totalInversion = calculateInversionTotal(data);
  const totalFinanciacion = calculateFinanciacionTotal(data.financiacion);
  const totalGastosMensuales = calculateGastosFijosMensuales(data.gastosFijos);
  const totalDepreciacion = calculateDepreciacionTotal(data.inversionInicial.propiedadPlantaEquipo);

  // General add item helper
  const handleAddItem = (category: 'efectivoDisponible' | 'inventarios' | 'propiedadPlantaEquipo' | 'intangibles') => {
    const newItem: ItemFinanciero = {
      id: Date.now().toString(),
      concepto: '',
      monto: 0,
      ...(category === 'propiedadPlantaEquipo' ? { vidaUtilAnos: 10, depreciacionAnual: 0 } : {}),
    };
    onChange({
      ...data,
      inversionInicial: {
        ...data.inversionInicial,
        [category]: [...data.inversionInicial[category], newItem],
      },
    });
  };

  const handleUpdateItem = (
    category: 'efectivoDisponible' | 'inventarios' | 'propiedadPlantaEquipo' | 'intangibles',
    id: string,
    field: keyof ItemFinanciero,
    value: any
  ) => {
    const updated = data.inversionInicial[category].map((item) => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (category === 'propiedadPlantaEquipo' && (field === 'monto' || field === 'vidaUtilAnos')) {
          const m = field === 'monto' ? value : item.monto;
          const v = field === 'vidaUtilAnos' ? value : item.vidaUtilAnos;
          if (v && v > 0) {
            newItem.depreciacionAnual = Math.round(m / v);
          }
        }
        return newItem;
      }
      return item;
    });
    onChange({
      ...data,
      inversionInicial: {
        ...data.inversionInicial,
        [category]: updated,
      },
    });
  };

  const handleRemoveItem = (
    category: 'efectivoDisponible' | 'inventarios' | 'propiedadPlantaEquipo' | 'intangibles',
    id: string
  ) => {
    onChange({
      ...data,
      inversionInicial: {
        ...data.inversionInicial,
        [category]: data.inversionInicial[category].filter((i) => i.id !== id),
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-blue-900 text-white rounded-xl shadow-sm border border-blue-800">
          <div className="text-xs text-blue-200 font-medium">Inversión Inicial Total (Dec. 2650)</div>
          <div className="text-xl font-black mt-1 text-white">{formatCurrencyCOP(totalInversion)}</div>
        </div>

        <div className="p-4 bg-emerald-900 text-white rounded-xl shadow-sm border border-emerald-800">
          <div className="text-xs text-emerald-200 font-medium">Financiación Total (Socios + Externos)</div>
          <div className="text-xl font-black mt-1 text-white">{formatCurrencyCOP(totalFinanciacion)}</div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm border border-slate-800">
          <div className="text-xs text-slate-300 font-medium">Gastos Fijos Mensuales</div>
          <div className="text-xl font-black mt-1 text-blue-300">{formatCurrencyCOP(totalGastosMensuales)}</div>
        </div>
      </div>

      {/* 4.1 Inversión Inicial */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">4.1. Inversión Inicial (Decreto 2650 de 1993)</h3>
        </div>

        {/* 4.1.1 Efectivo */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800">4.1.1. Efectivo / Disponible</h4>
            <button
              type="button"
              onClick={() => handleAddItem('efectivoDisponible')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>
          {data.inversionInicial.efectivoDisponible.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={item.concepto}
                onChange={(e) => handleUpdateItem('efectivoDisponible', item.id, 'concepto', e.target.value)}
                placeholder="Concepto de disponible..."
                className="flex-1 p-2 border border-slate-300 rounded"
              />
              <input
                type="number"
                value={item.monto}
                onChange={(e) => handleUpdateItem('efectivoDisponible', item.id, 'monto', parseFloat(e.target.value) || 0)}
                className="w-36 p-2 border border-slate-300 rounded font-semibold text-right"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem('efectivoDisponible', item.id)}
                className="text-slate-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 4.1.2 Inventarios */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800">4.1.2. Inventarios Iniciales</h4>
            <button
              type="button"
              onClick={() => handleAddItem('inventarios')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>
          {data.inversionInicial.inventarios.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={item.concepto}
                onChange={(e) => handleUpdateItem('inventarios', item.id, 'concepto', e.target.value)}
                placeholder="Materia prima / producto..."
                className="flex-1 p-2 border border-slate-300 rounded"
              />
              <input
                type="number"
                value={item.monto}
                onChange={(e) => handleUpdateItem('inventarios', item.id, 'monto', parseFloat(e.target.value) || 0)}
                className="w-36 p-2 border border-slate-300 rounded font-semibold text-right"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem('inventarios', item.id)}
                className="text-slate-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 4.1.3 Propiedad, Planta y Equipo + Depreciación */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-800">4.1.3. Propiedad, Planta y Equipo & 4.1.3.1 Depreciación (Art. 137 E.T.)</h4>
              <p className="text-[10px] text-slate-500">Depreciación anual acumulada estimada: {formatCurrencyCOP(totalDepreciacion)}/año</p>
            </div>
            <button
              type="button"
              onClick={() => handleAddItem('propiedadPlantaEquipo')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar PPYE
            </button>
          </div>
          {data.inversionInicial.propiedadPlantaEquipo.map((item) => (
            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs p-2 bg-slate-50 rounded border border-slate-200">
              <input
                type="text"
                value={item.concepto}
                onChange={(e) => handleUpdateItem('propiedadPlantaEquipo', item.id, 'concepto', e.target.value)}
                placeholder="Maquinaria / Equipo..."
                className="sm:col-span-2 p-1.5 border border-slate-300 rounded bg-white"
              />
              <input
                type="number"
                value={item.monto}
                onChange={(e) => handleUpdateItem('propiedadPlantaEquipo', item.id, 'monto', parseFloat(e.target.value) || 0)}
                placeholder="Monto $"
                className="p-1.5 border border-slate-300 rounded bg-white font-semibold text-right"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={item.vidaUtilAnos || 10}
                  onChange={(e) => handleUpdateItem('propiedadPlantaEquipo', item.id, 'vidaUtilAnos', parseInt(e.target.value) || 10)}
                  placeholder="Años"
                  className="w-16 p-1.5 border border-slate-300 rounded bg-white text-center"
                />
                <span className="text-[10px] text-slate-500">años ({formatCurrencyCOP(item.depreciacionAnual || 0)}/a)</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('propiedadPlantaEquipo', item.id)}
                  className="text-slate-400 hover:text-red-600 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 4.1.4 Intangibles */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-800">4.1.4. Intangibles</h4>
            <button
              type="button"
              onClick={() => handleAddItem('intangibles')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>
          {data.inversionInicial.intangibles.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={item.concepto}
                onChange={(e) => handleUpdateItem('intangibles', item.id, 'concepto', e.target.value)}
                placeholder="Licencias, marcas, registros..."
                className="flex-1 p-2 border border-slate-300 rounded"
              />
              <input
                type="number"
                value={item.monto}
                onChange={(e) => handleUpdateItem('intangibles', item.id, 'monto', parseFloat(e.target.value) || 0)}
                className="w-36 p-2 border border-slate-300 rounded font-semibold text-right"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem('intangibles', item.id)}
                className="text-slate-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* 6.2 Punto de Equilibrio & 7 Fuentes de Ingresos */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">6.2. Punto de Equilibrio & 7. Fuentes de Ingresos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              6.2.1. Estacionalidad y Capacidad (Escenario 1)
            </label>
            <textarea
              rows={3}
              value={data.puntoEquilibrio.estacionalidadCapacidad}
              onChange={(e) => onChange({ ...data, puntoEquilibrio: { ...data.puntoEquilibrio, estacionalidadCapacidad: e.target.value } })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              6.2.2. Ventas Mínimas (Escenario 2)
            </label>
            <textarea
              rows={3}
              value={data.puntoEquilibrio.ventasMinimas}
              onChange={(e) => onChange({ ...data, puntoEquilibrio: { ...data.puntoEquilibrio, ventasMinimas: e.target.value } })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              7.1. Proyección de Ventas (Escenario 3)
            </label>
            <textarea
              rows={3}
              value={data.fuentesIngresos.proyeccionVentas}
              onChange={(e) => onChange({ ...data, fuentesIngresos: { ...data.fuentesIngresos, proyeccionVentas: e.target.value } })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              7.2. Fijación de Precios
            </label>
            <textarea
              rows={3}
              value={data.fuentesIngresos.fijacionPrecios}
              onChange={(e) => onChange({ ...data, fuentesIngresos: { ...data.fuentesIngresos, fijacionPrecios: e.target.value } })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
