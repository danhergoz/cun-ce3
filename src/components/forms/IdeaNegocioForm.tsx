import React, { useState } from 'react';
import { Sparkles, ShoppingBag, Plus, Trash2, CheckCircle2, AlertCircle, Image as ImageIcon, Upload } from 'lucide-react';
import { ProjectData, PortafolioItem } from '../../types/project';
import { countWords, countLinesApprox } from '../../utils/helpers';
import { AIAssistModal } from '../AIAssistModal';

interface IdeaNegocioFormProps {
  data: ProjectData['ideaNegocio'];
  companyName: string;
  onChange: (updated: ProjectData['ideaNegocio']) => void;
}

export const IdeaNegocioForm: React.FC<IdeaNegocioFormProps> = ({ data, companyName, onChange }) => {
  const [aiModalTarget, setAiModalTarget] = useState<{ key: string; title: string } | null>(null);

  const descWords = countWords(data.descripcion);
  const justLines = countLinesApprox(data.justificacion);
  const clienteLines = countLinesApprox(data.perfilCliente);
  const mercadoLines = countLinesApprox(data.oportunidadMercado);

  // Portfolio items handlers
  const handleAddProduct = () => {
    const newItem: PortafolioItem = {
      id: Date.now().toString(),
      nombre: '',
      tipo: 'Producto',
      precio: 0,
      descripcionTecnica: '',
      especificaciones: '',
      imagenUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    };
    onChange({
      ...data,
      portafolio: [...data.portafolio, newItem],
    });
  };

  const handleUpdateProduct = (id: string, field: keyof PortafolioItem, value: any) => {
    const updated = data.portafolio.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, portafolio: updated });
  };

  const handleRemoveProduct = (id: string) => {
    if (data.portafolio.length <= 4) {
      alert('La guía exige un mínimo de 4 productos o servicios en el portafolio.');
      return;
    }
    onChange({
      ...data,
      portafolio: data.portafolio.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 0.1 Descripción Idea de Negocio */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">0.1. Descripción de la Idea de Negocio (Mínimo 200 palabras)</h3>
          <button
            type="button"
            onClick={() => setAiModalTarget({ key: 'descripcion', title: 'Descripción de la Idea de Negocio' })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar con IA</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Debe colocar la descripción detallada de su idea de negocio, incluyendo el nombre comercial de la empresa y la actividad económica principal.
        </p>

        <textarea
          rows={6}
          value={data.descripcion}
          onChange={(e) => onChange({ ...data, descripcion: e.target.value })}
          placeholder="Describa la empresa, actividad económica, origen y diferenciador principal..."
          className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 leading-relaxed"
        />

        <div className="flex justify-between items-center text-xs pt-1">
          {descWords >= 200 ? (
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cumple requisito ({descWords} palabras)
            </span>
          ) : (
            <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {descWords} / 200 palabras mínimas requeridas
            </span>
          )}
        </div>
      </div>

      {/* 0.2, 0.3, 0.4 Justificación, Perfil Cliente, Oportunidad Mercado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Justificación */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">0.2. Justificación</h4>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              justLines <= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {justLines} / 5 líneas máx
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Necesidad insatisfecha o factor de innovación identificado (máximo 5 líneas).
          </p>
          <textarea
            rows={4}
            value={data.justificacion}
            onChange={(e) => onChange({ ...data, justificacion: e.target.value })}
            placeholder="Escriba en máximo 5 líneas..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Perfil del Cliente */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">0.3. Perfil del Cliente</h4>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              clienteLines <= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {clienteLines} / 5 líneas máx
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Perfil y segmentación del cliente objetivo (máximo 5 líneas).
          </p>
          <textarea
            rows={4}
            value={data.perfilCliente}
            onChange={(e) => onChange({ ...data, perfilCliente: e.target.value })}
            placeholder="Escriba en máximo 5 líneas..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Oportunidad de Mercado */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">0.4. Oportunidad Mercado</h4>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              mercadoLines <= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {mercadoLines} / 5 líneas máx
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Tendencia del mercado y comportamiento del consumidor (máximo 5 líneas).
          </p>
          <textarea
            rows={4}
            value={data.oportunidadMercado}
            onChange={(e) => onChange({ ...data, oportunidadMercado: e.target.value })}
            placeholder="Escriba en máximo 5 líneas..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

      </div>

      {/* 0.5 Portafolio de Productos o Servicios */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              0.5. Portafolio de Productos y Servicios (Mínimo 4)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Producto/Servicio</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          La guía exige describir al menos 4 productos/servicios indicando precios, imágenes, descripción técnica y especificaciones completas.
        </p>

        <div className="space-y-4">
          {data.portafolio.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Item #{idx + 1}
                </span>
                {data.portafolio.length > 4 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Nombre del Producto / Servicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={(e) => handleUpdateProduct(item.id, 'nombre', e.target.value)}
                    placeholder="Ej: EcoBox Pro 9..."
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Tipo y Precio ($ COP)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={item.tipo}
                      onChange={(e) => handleUpdateProduct(item.id, 'tipo', e.target.value)}
                      className="text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none"
                    >
                      <option value="Producto">Producto</option>
                      <option value="Servicio">Servicio</option>
                    </select>
                    <input
                      type="number"
                      value={item.precio}
                      onChange={(e) => handleUpdateProduct(item.id, 'precio', parseFloat(e.target.value) || 0)}
                      className="text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Descripción Técnica
                  </label>
                  <textarea
                    rows={2}
                    value={item.descripcionTecnica}
                    onChange={(e) => handleUpdateProduct(item.id, 'descripcionTecnica', e.target.value)}
                    placeholder="Descripción técnica..."
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Especificaciones Físicas / Medidas
                  </label>
                  <textarea
                    rows={2}
                    value={item.especificaciones}
                    onChange={(e) => handleUpdateProduct(item.id, 'especificaciones', e.target.value)}
                    placeholder="Medidas, peso, resistencia..."
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    URL de Imagen o Foto
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.imagenUrl || ''}
                      onChange={(e) => handleUpdateProduct(item.id, 'imagenUrl', e.target.value)}
                      placeholder="https://... o seleccione un archivo local"
                      className="flex-1 text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-2.5 py-2 rounded-lg transition-colors shrink-0 shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Subir Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (loadEvent) => {
                              const result = loadEvent.target?.result as string;
                              if (result) {
                                handleUpdateProduct(item.id, 'imagenUrl', result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {item.imagenUrl && (
                    <div className="mt-2 flex items-center gap-2.5 p-2 bg-white border border-slate-200 rounded-lg max-w-md">
                      <img
                        src={item.imagenUrl}
                        alt="Previsualización"
                        className="w-12 h-12 object-cover rounded border border-slate-300 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.opacity = '0.3';
                        }}
                      />
                      <div className="text-[10px] text-slate-500 overflow-hidden truncate flex-1">
                        <span className="font-semibold text-slate-800 block">Foto del Producto / Servicio</span>
                        <span className="text-slate-400 truncate block font-mono text-[9px]">{item.imagenUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateProduct(item.id, 'imagenUrl', '')}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Quitar foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
          currentContent={data.descripcion}
          onApply={(text) => onChange({ ...data, descripcion: text })}
        />
      )}

    </div>
  );
};
