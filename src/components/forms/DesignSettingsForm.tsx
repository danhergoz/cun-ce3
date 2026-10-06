import React from 'react';
import { Palette, LayoutTemplate, Type, Check, Sparkles } from 'lucide-react';
import { ProjectData } from '../../types/project';

interface DesignSettingsFormProps {
  data: ProjectData['designConfig'];
  onChange: (updated: ProjectData['designConfig']) => void;
}

export const DesignSettingsForm: React.FC<DesignSettingsFormProps> = ({ data, onChange }) => {
  const templates = [
    {
      id: 'cun-oficial',
      title: 'Institucional Académico',
      subtitle: 'Estilo Institucional Oficial CUN',
      description: 'Encabezado institucional, sangría en párrafos y tipografía académica con acento azul CUN.',
      color: '#003366',
      badge: 'Oficial CUN',
    },
    {
      id: 'ejecutivo-moderno',
      title: 'Ejecutivo Corporativo',
      subtitle: 'Estilo Ejecutivo para Negocios',
      description: 'Acento corporativo en azul marino profundo, tablas estilizadas y cabecera ejecutiva.',
      color: '#1e293b',
      badge: 'Corporativo',
    },
    {
      id: 'innovacion-startup',
      title: 'Innovación & Sostenibilidad',
      subtitle: 'Estilo Emprendimiento Verde',
      description: 'Toque verde esmeralda ecológico, tarjetas de indicadores y diseño orientado a sostenibilidad.',
      color: '#0f766e',
      badge: 'Sostenible',
    },
    {
      id: 'minimalista-elegante',
      title: 'Minimalista Editorial',
      subtitle: 'Estilo Editorial de Alto Contaste',
      description: 'Líneas limpias y elegantes, jerarquía tipográfica depurada y formato editorial sobrio.',
      color: '#0f172a',
      badge: 'Editorial',
    },
    {
      id: 'cun-opcion-6',
      title: 'Formato Modular',
      subtitle: 'Estilo Modular con Franja Institucional',
      description: 'Franja lateral distintiva, cabeceras modulares y bloques estructurados por secciones.',
      color: '#115e59',
      badge: 'Modular',
    },
    {
      id: 'cun-opcion-7',
      title: 'Dossier Ejecutivo',
      subtitle: 'Estilo Dossier de Alta Dirección',
      description: 'Cabeceras estilo informe de negocios, tablas estructuradas y paneles de presentación ejecutiva.',
      color: '#1e3a8a',
      badge: 'Dossier Pro',
    },
  ];

  const colorPresets = [
    { name: 'Azul CUN Oficial', hex: '#003366' },
    { name: 'Azul Marino Profundo', hex: '#1e293b' },
    { name: 'Verde Esmeralda', hex: '#0f766e' },
    { name: 'Verde Modular 6', hex: '#115e59' },
    { name: 'Azul Dossier 7', hex: '#1e3a8a' },
    { name: 'Vino Tinto Institucional', hex: '#881337' },
    { name: 'Gris Carbón Elegante', hex: '#334155' },
  ];

  return (
    <div className="space-y-6">
      {/* Normas APA Format Compliance Summary Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-900 text-white text-[10px] font-black uppercase tracking-wider">
              Normas APA 7ª Edición
            </span>
            <h4 className="text-xs font-extrabold text-slate-900">
              Pautas Oficiales Aplicadas en Todas las Plantillas (normas-apa.org/formato/)
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong>Papel:</strong> Tamaño Carta (21.59 × 27.94 cm / 8.5&quot; × 11&quot;) •{' '}
            <strong>Márgenes:</strong> 2.54 cm (1 pulgada) en los 4 bordes •{' '}
            <strong>Sangría:</strong> 1.27 cm primera línea y sangría francesa en bibliografía •{' '}
            <strong>Descarga PDF:</strong> 100% Vectorial (&lt; 5 MB).
          </p>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <LayoutTemplate className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Selección de Plantilla de Diseño</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Formato Carta (21.59 × 27.94 cm) • PDF Vectorial
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {templates.map((tpl) => {
            const isSelected = data.templateId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => onChange({ ...data, templateId: tpl.id as any, primaryColor: tpl.color })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2.5 mb-1">
                    <div
                      className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: tpl.color }}
                    />
                    <h4 className="text-sm font-extrabold text-slate-900">{tpl.title}</h4>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: tpl.color }}
                    >
                      {tpl.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 mb-1.5">
                    {tpl.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Tamaño Carta • Márgenes 2.54 cm</span>
                  <span className="text-blue-700 font-bold">Vectorial APA</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Customization */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Palette className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Color Primario Acentuado</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {colorPresets.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => onChange({ ...data, primaryColor: c.hex })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                data.primaryColor === c.hex
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white"
                style={{ backgroundColor: c.hex }}
              />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Typography & Toggles */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Type className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Tipografía e Opciones de Documento</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estilo de Fuente
            </label>
            <select
              value={data.fontFamily}
              onChange={(e) => onChange({ ...data, fontFamily: e.target.value as any })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none bg-white font-medium"
            >
              <option value="sans">Sans-Serif Moderno (Inter / Arial - Recomendado)</option>
              <option value="serif">Serif Académico (Times New Roman / Georgia)</option>
              <option value="mono">Monospace Técnico (Courier Code)</option>
            </select>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.incluirFirmasDigitales}
                onChange={(e) => onChange({ ...data, incluirFirmasDigitales: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Incluir firmas digitales de los autores en la página de compromisos
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.mostrarNumeroPagina}
                onChange={(e) => onChange({ ...data, mostrarNumeroPagina: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Mostrar numeración de página y pie de página institucional CUN
              </span>
            </label>
          </div>
        </div>
      </div>

    </div>
  );
};
