import React, { useState } from 'react';
import { LineChart, PieChart, Plus, Trash2, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';
import { ProjectData } from '../../types/project';
import { formatCurrencyCOP } from '../../utils/helpers';
import { AIAssistModal } from '../AIAssistModal';

interface UnidadIIIFormProps {
  data: ProjectData['unidadIII'];
  companyName: string;
  onChange: (updated: ProjectData['unidadIII']) => void;
}

export const UnidadIIIForm: React.FC<UnidadIIIFormProps> = ({ data, companyName, onChange }) => {
  const [aiModalTarget, setAiModalTarget] = useState<{ key: string; title: string } | null>(null);

  // Conclusiones helper
  const handleAddConclusion = () => {
    onChange({
      ...data,
      conclusionesYRecomendaciones: {
        ...data.conclusionesYRecomendaciones,
        conclusiones: [...data.conclusionesYRecomendaciones.conclusiones, ''],
      },
    });
  };

  const handleUpdateConclusion = (idx: number, val: string) => {
    const updated = [...data.conclusionesYRecomendaciones.conclusiones];
    updated[idx] = val;
    onChange({
      ...data,
      conclusionesYRecomendaciones: {
        ...data.conclusionesYRecomendaciones,
        conclusiones: updated,
      },
    });
  };

  const handleRemoveConclusion = (idx: number) => {
    onChange({
      ...data,
      conclusionesYRecomendaciones: {
        ...data.conclusionesYRecomendaciones,
        conclusiones: data.conclusionesYRecomendaciones.conclusiones.filter((_, i) => i !== idx),
      },
    });
  };

  // Bibliografia helper
  const handleAddBiblio = () => {
    onChange({
      ...data,
      bibliografia: [...data.bibliografia, ''],
    });
  };

  const handleUpdateBiblio = (idx: number, val: string) => {
    const updated = [...data.bibliografia];
    updated[idx] = val;
    onChange({ ...data, bibliografia: updated });
  };

  const handleRemoveBiblio = (idx: number) => {
    onChange({
      ...data,
      bibliografia: data.bibliografia.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 8. Estado de Resultados */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <LineChart className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">8. Estado de Resultados del Proyecto</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600">Ingresos por Ventas ($)</label>
            <input
              type="number"
              value={data.estadoResultados.ingresosVentas}
              onChange={(e) => onChange({ ...data, estadoResultados: { ...data.estadoResultados, ingresosVentas: parseFloat(e.target.value) || 0 } })}
              className="w-full p-2 border border-slate-300 rounded font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600">Costos de Ventas ($)</label>
            <input
              type="number"
              value={data.estadoResultados.costosVentas}
              onChange={(e) => onChange({ ...data, estadoResultados: { ...data.estadoResultados, costosVentas: parseFloat(e.target.value) || 0 } })}
              className="w-full p-2 border border-slate-300 rounded text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600">Gastos Operacionales ($)</label>
            <input
              type="number"
              value={data.estadoResultados.gastosOperacionales}
              onChange={(e) => onChange({ ...data, estadoResultados: { ...data.estadoResultados, gastosOperacionales: parseFloat(e.target.value) || 0 } })}
              className="w-full p-2 border border-slate-300 rounded text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600">Utilidad Neta ($)</label>
            <input
              type="number"
              value={data.estadoResultados.utilidadNeta}
              onChange={(e) => onChange({ ...data, estadoResultados: { ...data.estadoResultados, utilidadNeta: parseFloat(e.target.value) || 0 } })}
              className="w-full p-2 border border-slate-300 rounded font-black text-blue-700 bg-blue-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            8.2. Análisis del Estado de Resultados
          </label>
          <textarea
            rows={3}
            value={data.estadoResultados.analisis}
            onChange={(e) => onChange({ ...data, estadoResultados: { ...data.estadoResultados, analisis: e.target.value } })}
            placeholder="Análisis de margen bruto, operativo y neto..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* 10. Flujo de Caja, VPN y TIR */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <PieChart className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">10. Flujo de Caja & Indicadores VPN / TIR</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600">VPN (Valor Presente Neto $)</label>
            <input
              type="number"
              value={data.flujoCaja.vpn}
              onChange={(e) => onChange({ ...data, flujoCaja: { ...data.flujoCaja, vpn: parseFloat(e.target.value) || 0 } })}
              className="w-full p-2 border border-emerald-300 rounded font-bold text-emerald-800 bg-emerald-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600">TIR (Tasa Interna Retorno %)</label>
            <input
              type="number"
              step="0.1"
              value={data.flujoCaja.tir}
              onChange={(e) => onChange({ ...data, flujoCaja: { ...data.flujoCaja, tir: parseFloat(e.target.value) || 0 } })}
              className="w-full p-2 border border-emerald-300 rounded font-bold text-emerald-800 bg-emerald-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600">Razón Liquidez Corriente (x)</label>
            <input
              type="number"
              step="0.01"
              value={data.indicadoresFinancieros.liquidezCorriente}
              onChange={(e) => onChange({ ...data, indicadoresFinancieros: { ...data.indicadoresFinancieros, liquidezCorriente: parseFloat(e.target.value) || 0 } })}
              className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600">Nivel Endeudamiento (%)</label>
            <input
              type="number"
              step="0.1"
              value={data.indicadoresFinancieros.nivelEndeudamiento}
              onChange={(e) => onChange({ ...data, indicadoresFinancieros: { ...data.indicadoresFinancieros, nivelEndeudamiento: parseFloat(e.target.value) || 0 } })}
              className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            11.2. Conclusión Financiera del Proyecto
          </label>
          <textarea
            rows={3}
            value={data.indicadoresFinancieros.conclusionFinanciera}
            onChange={(e) => onChange({ ...data, indicadoresFinancieros: { ...data.indicadoresFinancieros, conclusionFinanciera: e.target.value } })}
            placeholder="Síntesis de la viabilidad financiera basada en los indicadores..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* 12. Conclusiones y Recomendaciones */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">12. Conclusiones</h3>
          <button
            type="button"
            onClick={handleAddConclusion}
            className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Conclusión
          </button>
        </div>

        <div className="space-y-2">
          {data.conclusionesYRecomendaciones.conclusiones.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleUpdateConclusion(idx, e.target.value)}
                placeholder="Conclusión final..."
                className="flex-1 text-xs p-2 border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveConclusion(idx)}
                className="text-slate-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bibliografía (Normas APA) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Bibliografía (Normas APA 7ma Edición)</h3>
          </div>
          <button
            type="button"
            onClick={handleAddBiblio}
            className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Referencia
          </button>
        </div>

        <div className="space-y-2">
          {data.bibliografia.map((ref, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 w-5">[{idx + 1}]</span>
              <input
                type="text"
                value={ref}
                onChange={(e) => handleUpdateBiblio(idx, e.target.value)}
                placeholder="Apellido, A. A. (Año). Título de la fuente en cursiva. Editorial..."
                className="flex-1 text-xs p-2 border border-slate-300 rounded-lg font-serif"
              />
              <button
                type="button"
                onClick={() => handleRemoveBiblio(idx)}
                className="text-slate-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assist Modal */}
      {aiModalTarget && (
        <AIAssistModal
          isOpen={!!aiModalTarget}
          onClose={() => setAiModalTarget(null)}
          sectionKey={aiModalTarget.key}
          sectionTitle={aiModalTarget.title}
          companyName={companyName}
          currentContent={data.estadoResultados.analisis}
          onApply={(text) => onChange({ ...data, estadoResultados: { ...data.estadoResultados, analisis: text } })}
        />
      )}

    </div>
  );
};
