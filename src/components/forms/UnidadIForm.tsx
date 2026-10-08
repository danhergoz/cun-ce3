import React, { useState, useEffect } from 'react';
import { Compass, Briefcase, Scale, Plus, Trash2, Sparkles, Building2, Layers, Network, Edit3, Eye, RefreshCw, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import { ProjectData, CargoPerfil, OrganigramaNodo } from '../../types/project';
import { AIAssistModal } from '../AIAssistModal';
import { OrganigramaBuilderModal } from '../organigrama/OrganigramaBuilderModal';
import { OrganigramaPerfilesSyncModal } from '../organigrama/OrganigramaPerfilesSyncModal';
import { OrganigramaViewer } from '../organigrama/OrganigramaViewer';
import { DEFAULT_ORGANIGRAMA_NODOS } from '../organigrama/organigramaTemplates';
import { generateOrganigramaImage } from '../organigrama/organigramaCanvasGenerator';
import { compareCargos, buildOrganigramaFromPerfiles } from '../organigrama/organigramaSyncUtils';

interface UnidadIFormProps {
  data: ProjectData['unidadI'];
  companyName: string;
  onChange: (updated: ProjectData['unidadI']) => void;
}

export const UnidadIForm: React.FC<UnidadIFormProps> = ({ data, companyName, onChange }) => {
  const [aiModalTarget, setAiModalTarget] = useState<{ key: string; title: string } | null>(null);
  const [isOrganigramaModalOpen, setIsOrganigramaModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const currentNodos: OrganigramaNodo[] = (data.organigrama.nodos && data.organigrama.nodos.length > 0)
    ? data.organigrama.nodos
    : DEFAULT_ORGANIGRAMA_NODOS;

  const cargosComparison = compareCargos(currentNodos, data.perfilesCargos);

  // Sincronización rápida directa con los cargos registrados en 2.2
  const handleQuickSyncFromPerfiles = () => {
    if (!data.perfilesCargos || data.perfilesCargos.length === 0) {
      alert('No hay perfiles de cargos registrados en la sección 2.2 para sincronizar.');
      return;
    }

    const newNodos = buildOrganigramaFromPerfiles(data.perfilesCargos, currentNodos);
    const newImg = generateOrganigramaImage(
      newNodos,
      data.organigrama.tipoEstructura || 'Estructura Funcional por Procesos',
      companyName
    );

    onChange({
      ...data,
      organigrama: {
        ...data.organigrama,
        nodos: newNodos,
        imagenUrl: newImg,
      },
    });

    setSyncFeedback(`¡Organigrama sincronizado con éxito! Ahora coincide con los ${data.perfilesCargos.length} cargos de la sección 2.2.`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleApplySyncToOrganigrama = (newNodos: OrganigramaNodo[], newImageUrl: string) => {
    onChange({
      ...data,
      organigrama: {
        ...data.organigrama,
        nodos: newNodos,
        imagenUrl: newImageUrl,
      },
    });
    setSyncFeedback('¡Organigrama actualizado exitosamente con los cargos de la sección 2.2!');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleApplySyncToPerfiles = (newPerfiles: CargoPerfil[]) => {
    onChange({
      ...data,
      perfilesCargos: newPerfiles,
    });
    setSyncFeedback('¡Sección 2.2 Perfiles de Cargos actualizada exitosamente con los cargos del organigrama!');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  // Garantizar que siempre exista una imagen PNG nítida del organigrama en el proyecto para el PDF
  useEffect(() => {
    if (!data.organigrama.imagenUrl || !data.organigrama.imagenUrl.startsWith('data:image/')) {
      const generatedImg = generateOrganigramaImage(
        currentNodos,
        data.organigrama.tipoEstructura || 'Estructura Funcional por Procesos',
        companyName
      );
      if (generatedImg) {
        onChange({
          ...data,
          organigrama: {
            ...data.organigrama,
            nodos: currentNodos,
            imagenUrl: generatedImg,
          },
        });
      }
    }
  }, []);

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
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">2. Estructura Organizacional</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsOrganigramaModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all hover:shadow"
          >
            <Network className="w-3.5 h-3.5 text-blue-200" />
            <span>🎨 Abrir Aplicativo de Organigrama</span>
          </button>
        </div>

        {/* 2.1. Tipo de Estructura Organigrama y Justificación */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-200/70 rounded-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-blue-700" />
                <span>2.1. Tipo de Estructura Organigrama</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Diseñe la jerarquía de mando, áreas funcionales y órganos de asesoría (Staff) según la guía CUN.
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                {currentNodos.length} {currentNodos.length === 1 ? 'cargo' : 'cargos configurados'}
              </span>

              {/* Botón requerido: Opción para que la información de los cargos coincida con 2.2 Perfiles de Cargos */}
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all hover:shadow"
                title="Hacer que la información de los cargos coincida con la registrada en 2.2 Perfiles de Cargos"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coincidir Cargos con 2.2 Perfiles</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOrganigramaModalOpen(true)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar Organigrama</span>
              </button>
            </div>
          </div>

          {/* Barra de estado de coincidencia entre 2.1 Organigrama y 2.2 Perfiles */}
          <div className={`p-2.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${
            cargosComparison.isFullySynced
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/90 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-2">
              {cargosComparison.isFullySynced ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="text-[11px]">
                {cargosComparison.isFullySynced ? (
                  <span>
                    <strong>Cargos sincronizados:</strong> La información del Organigrama coincide exactamente con los <strong>{data.perfilesCargos.length} perfiles</strong> registrados en <em>2.2. Perfiles de Cargos</em>.
                  </span>
                ) : (
                  <span>
                    <strong>Verificación de cargos:</strong> Hay {currentNodos.length} cargos en el Organigrama y {data.perfilesCargos.length} registrados en <em>2.2. Perfiles de Cargos</em> ({cargosComparison.perfilesMatchingCount}/{data.perfilesCargos.length} coinciden).
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!cargosComparison.isFullySynced && data.perfilesCargos.length > 0 && (
                <button
                  type="button"
                  onClick={handleQuickSyncFromPerfiles}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors shadow-2xs"
                  title="Actualizar directamente el organigrama con los cargos de 2.2"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Hacer coincidir ahora con 2.2</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Opciones de sincronización</span>
              </button>
            </div>
          </div>

          {/* Feedback temporal tras sincronización */}
          {syncFeedback && (
            <div className="p-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{syncFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tipo de Estructura Organizacional
              </label>
              <input
                type="text"
                value={data.organigrama.tipoEstructura}
                onChange={(e) => onChange({ ...data, organigrama: { ...data.organigrama, tipoEstructura: e.target.value } })}
                placeholder="Ej: Estructura Funcional por Procesos"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none bg-white font-medium text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">
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
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg outline-none bg-white"
              />
            </div>
          </div>

          {/* Visor interactivo incrustado del Organigrama */}
          <div className="pt-2 border-t border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Vista Previa del Diagrama Organigrama:</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOrganigramaModalOpen(true)}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-1"
              >
                <span>Maximizar aplicativo</span>
                <Network className="w-3 h-3" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              <OrganigramaViewer
                nodos={currentNodos}
                tipoEstructura={data.organigrama.tipoEstructura}
                compact={true}
                interactive={true}
                onEditNode={() => setIsOrganigramaModalOpen(true)}
                onAddChild={() => setIsOrganigramaModalOpen(true)}
                onAddSibling={() => setIsOrganigramaModalOpen(true)}
              />
            </div>
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

      {/* Organigrama Builder Modal */}
      {isOrganigramaModalOpen && (
        <OrganigramaBuilderModal
          isOpen={isOrganigramaModalOpen}
          onClose={() => setIsOrganigramaModalOpen(false)}
          tipoEstructuraActual={data.organigrama.tipoEstructura}
          justificacionCulturaActual={data.organigrama.justificacionCultura}
          nodosActuales={currentNodos}
          perfilesCargos={data.perfilesCargos}
          companyName={companyName}
          onSave={(orgData) => {
            onChange({
              ...data,
              organigrama: {
                ...data.organigrama,
                tipoEstructura: orgData.tipoEstructura,
                justificacionCultura: orgData.justificacionCultura,
                nodos: orgData.nodos,
                imagenUrl: orgData.imagenUrl || data.organigrama.imagenUrl,
              },
            });
          }}
        />
      )}

      {/* Modal de Sincronización entre 2.1 Organigrama y 2.2 Perfiles de Cargos */}
      {isSyncModalOpen && (
        <OrganigramaPerfilesSyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          nodosActuales={currentNodos}
          perfilesCargos={data.perfilesCargos}
          tipoEstructura={data.organigrama.tipoEstructura}
          companyName={companyName}
          onApplySyncToOrganigrama={handleApplySyncToOrganigrama}
          onApplySyncToPerfiles={handleApplySyncToPerfiles}
        />
      )}

    </div>
  );
};
