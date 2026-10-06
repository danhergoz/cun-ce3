import React, { useState } from 'react';
import { Compass, Briefcase, Scale, Plus, Trash2, Sparkles, Building2, Layers } from 'lucide-react';
import { ProjectData, CargoPerfil } from '../../types/project';
import { AIAssistModal } from '../AIAssistModal';

interface UnidadIFormProps {
  data: ProjectData['unidadI'];
  companyName: string;
  onChange: (updated: ProjectData['unidadI']) => void;
}

export const UnidadIForm: React.FC<UnidadIFormProps> = ({ data, companyName, onChange }) => {
  const [aiModalTarget, setAiModalTarget] = useState<{ key: string; title: string } | null>(null);

  // Cargo handlers
  const handleAddCargo = () => {
    const newCargo: CargoPerfil = {
      id: Date.now().toString(),
      nombreCargo: '',
      funciones: '',
      formacion: '',
      experiencia: '',
      habilidades: '',
      salarioEstimado: 2000000,
    };
    onChange({
      ...data,
      perfilesCargos: [...data.perfilesCargos, newCargo],
    });
  };

  const handleUpdateCargo = (id: string, field: keyof CargoPerfil, value: any) => {
    const updated = data.perfilesCargos.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, perfilesCargos: updated });
  };

  const handleRemoveCargo = (id: string) => {
    onChange({
      ...data,
      perfilesCargos: data.perfilesCargos.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Direccionamiento Estratégico */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Compass className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">1. Direccionamiento Estratégico</h3>
        </div>

        {/* 1.1 Misión */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-800">
              1.1. Misión
            </label>
            <button
              type="button"
              onClick={() => setAiModalTarget({ key: 'mision', title: 'Misión Empresarial' })}
              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Redactar Misión IA</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-1">
            Créela en 3 pasos: (1) Orígenes / propósito con verbo activo, (2) A quiénes se dirige, (3) En qué se diferencia.
          </p>
          <textarea
            rows={3}
            value={data.mision}
            onChange={(e) => onChange({ ...data, mision: e.target.value })}
            placeholder="Luchamos por/Buscamos..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* 1.2 Visión */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-800">
              1.2. Futuro Preferido (Visión)
            </label>
            <button
              type="button"
              onClick={() => setAiModalTarget({ key: 'vision', title: 'Visión Empresarial' })}
              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Redactar Visión IA</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-1">
            Reflexione a largo plazo (10, 15 o 20 años) y cómo impactará a la sociedad y al sector.
          </p>
          <textarea
            rows={3}
            value={data.vision}
            onChange={(e) => onChange({ ...data, vision: e.target.value })}
            placeholder="Para el año 2035, la empresa será..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* 1.5 Ventaja Competitiva */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            1.5. Ventaja Competitiva
          </label>
          <textarea
            rows={2}
            value={data.ventajaCompetitiva}
            onChange={(e) => onChange({ ...data, ventajaCompetitiva: e.target.value })}
            placeholder="Principal factor difícil de imitar por la competencia..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

      </div>

      {/* 1.6 Cadena de Valor */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">1.6. Cadena de Valor (Michael Porter)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 text-[11px] border-b border-slate-200 pb-1">Actividades Primarias</h4>
            <div>
              <label className="font-medium text-slate-700">Logística de Entrada:</label>
              <input
                type="text"
                value={data.cadenaValor.logisticaEntrada}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, logisticaEntrada: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Operaciones:</label>
              <input
                type="text"
                value={data.cadenaValor.operaciones}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, operaciones: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Logística de Salida:</label>
              <input
                type="text"
                value={data.cadenaValor.logisticaSalida}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, logisticaSalida: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Marketing y Ventas:</label>
              <input
                type="text"
                value={data.cadenaValor.marketingVentas}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, marketingVentas: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Servicio Postventa:</label>
              <input
                type="text"
                value={data.cadenaValor.servicioPostventa}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, servicioPostventa: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-800 text-[11px] border-b border-slate-200 pb-1">Actividades de Apoyo</h4>
            <div>
              <label className="font-medium text-slate-700">Infraestructura:</label>
              <input
                type="text"
                value={data.cadenaValor.infraestructura}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, infraestructura: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Recursos Humanos:</label>
              <input
                type="text"
                value={data.cadenaValor.recursosHumanos}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, recursosHumanos: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Desarrollo Tecnológico:</label>
              <input
                type="text"
                value={data.cadenaValor.desarrolloTecnologico}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, desarrolloTecnologico: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Compras:</label>
              <input
                type="text"
                value={data.cadenaValor.compras}
                onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, compras: e.target.value } })}
                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Análisis de la Cadena de Valor
          </label>
          <textarea
            rows={3}
            value={data.cadenaValor.analisis}
            onChange={(e) => onChange({ ...data, cadenaValor: { ...data.cadenaValor, analisis: e.target.value } })}
            placeholder="Explicación del análisis de valor generado en cada proceso..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* 2. Estructura Organizacional */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Briefcase className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">2. Estructura Organizacional</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              2.1. Tipo de Estructura Organigrama
            </label>
            <input
              type="text"
              value={data.organigrama.tipoEstructura}
              onChange={(e) => onChange({ ...data, organigrama: { ...data.organigrama, tipoEstructura: e.target.value } })}
              placeholder="Ej: Estructura Funcional por Procesos"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Justificación y Cultura (Máx 200 caracteres)
              </label>
              <span className={`text-[10px] font-bold ${
                data.organigrama.justificacionCultura.length <= 200 ? 'text-emerald-700' : 'text-red-600'
              }`}>
                {data.organigrama.justificacionCultura.length} / 200
              </span>
            </div>
            <input
              type="text"
              maxLength={200}
              value={data.organigrama.justificacionCultura}
              onChange={(e) => onChange({ ...data, organigrama: { ...data.organigrama, justificacionCultura: e.target.value } })}
              placeholder="Explicación breve de la cultura organizacional..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* 2.2 Perfiles de Cargos */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800">2.2. Perfiles de Cargos</h4>
            <button
              type="button"
              onClick={handleAddCargo}
              className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Cargo</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.perfilesCargos.map((cargo, idx) => (
              <div key={cargo.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Cargo #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCargo(cargo.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Nombre del Cargo</label>
                    <input
                      type="text"
                      value={cargo.nombreCargo}
                      onChange={(e) => handleUpdateCargo(cargo.id, 'nombreCargo', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Formación</label>
                    <input
                      type="text"
                      value={cargo.formacion}
                      onChange={(e) => handleUpdateCargo(cargo.id, 'formacion', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Salario Estimado ($ COP)</label>
                    <input
                      type="number"
                      value={cargo.salarioEstimado}
                      onChange={(e) => handleUpdateCargo(cargo.id, 'salarioEstimado', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-slate-300 rounded bg-white font-semibold text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Funciones Principal</label>
                    <input
                      type="text"
                      value={cargo.funciones}
                      onChange={(e) => handleUpdateCargo(cargo.id, 'funciones', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Experiencia</label>
                    <input
                      type="text"
                      value={cargo.experiencia}
                      onChange={(e) => handleUpdateCargo(cargo.id, 'experiencia', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Habilidades</label>
                    <input
                      type="text"
                      value={cargo.habilidades}
                      onChange={(e) => handleUpdateCargo(cargo.id, 'habilidades', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Estructura Legal y Normatividad */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Scale className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">3. Estructura Legal y Normatividad</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">3.1.1 Forma Jurídica</label>
            <input
              type="text"
              value={data.figuraLegal.formaJuridica}
              onChange={(e) => onChange({ ...data, figuraLegal: { ...data.figuraLegal, formaJuridica: e.target.value } })}
              placeholder="Persona Jurídica"
              className="w-full p-2 border border-slate-300 rounded mb-1"
            />
            <textarea
              rows={2}
              value={data.figuraLegal.justificacionForma}
              onChange={(e) => onChange({ ...data, figuraLegal: { ...data.figuraLegal, justificacionForma: e.target.value } })}
              placeholder="Justificación (máx 5 líneas)..."
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">3.1.2 Tipo de Sociedad</label>
            <input
              type="text"
              value={data.figuraLegal.tipoSociedad}
              onChange={(e) => onChange({ ...data, figuraLegal: { ...data.figuraLegal, tipoSociedad: e.target.value } })}
              placeholder="S.A.S."
              className="w-full p-2 border border-slate-300 rounded mb-1"
            />
            <textarea
              rows={2}
              value={data.figuraLegal.justificacionSociedad}
              onChange={(e) => onChange({ ...data, figuraLegal: { ...data.figuraLegal, justificacionSociedad: e.target.value } })}
              placeholder="Justificación (máx 5 líneas)..."
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">3.1.3 Razón Social y Justificación</label>
            <input
              type="text"
              value={data.figuraLegal.razonSocial}
              onChange={(e) => onChange({ ...data, figuraLegal: { ...data.figuraLegal, razonSocial: e.target.value } })}
              placeholder="Nombre comercial de la empresa"
              className="w-full p-2 border border-slate-300 rounded mb-1"
            />
            <textarea
              rows={2}
              value={data.figuraLegal.justificacionNombre}
              onChange={(e) => onChange({ ...data, figuraLegal: { ...data.figuraLegal, justificacionNombre: e.target.value } })}
              placeholder="Justificación del nombre..."
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">3.1.4 Objeto Social y Códigos CIIU</label>
            <input
              type="text"
              value={data.figuraLegal.codigosCIIU}
              onChange={(e) => onChange({ ...data, figuraLegal: { ...data.figuraLegal, codigosCIIU: e.target.value } })}
              placeholder="Ej: CIIU 2220"
              className="w-full p-2 border border-slate-300 rounded mb-1"
            />
            <textarea
              rows={2}
              value={data.figuraLegal.objetoSocial}
              onChange={(e) => onChange({ ...data, figuraLegal: { ...data.figuraLegal, objetoSocial: e.target.value } })}
              placeholder="Actividades a las que se dedicará..."
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>
        </div>

        {/* 3.2 Normatividad */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">3.2.1 Normatividad Tributaria</label>
            <textarea
              rows={3}
              value={data.normatividad.tributaria}
              onChange={(e) => onChange({ ...data, normatividad: { ...data.normatividad, tributaria: e.target.value } })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">3.2.2 Normatividad Laboral</label>
            <textarea
              rows={3}
              value={data.normatividad.laboral}
              onChange={(e) => onChange({ ...data, normatividad: { ...data.normatividad, laboral: e.target.value } })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">3.2.3 Funcionamiento</label>
            <textarea
              rows={3}
              value={data.normatividad.funcionamiento}
              onChange={(e) => onChange({ ...data, normatividad: { ...data.normatividad, funcionamiento: e.target.value } })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>
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
          currentContent={aiModalTarget.key === 'mision' ? data.mision : data.vision}
          onApply={(text) => {
            if (aiModalTarget.key === 'mision') onChange({ ...data, mision: text });
            else if (aiModalTarget.key === 'vision') onChange({ ...data, vision: text });
          }}
        />
      )}

    </div>
  );
};
