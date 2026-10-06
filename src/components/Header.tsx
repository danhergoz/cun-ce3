import React, { useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Upload, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  FileCode2,
  RefreshCw,
  Award,
  BookmarkCheck
} from 'lucide-react';
import { ProjectData } from '../types/project';

interface HeaderProps {
  projectData: ProjectData;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onResetToSample?: () => void;
  onLoadSample?: () => void;
  onSaveAsSample?: () => void;
  onClear?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: (data: ProjectData) => void;
  onImportData?: (data: ProjectData) => void;
  onOpenPreview: () => void;
  currentStepIndex?: number;
  totalSteps?: number;
}

export const Header: React.FC<HeaderProps> = ({
  projectData,
  activeTab,
  setActiveTab,
  onResetToSample,
  onLoadSample,
  onSaveAsSample,
  onClear,
  onExportJSON,
  onImportJSON,
  onImportData,
  onOpenPreview,
  currentStepIndex = 0,
  totalSteps = 8,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSample = onLoadSample || onResetToSample || (() => {});
  const handleImport = onImportJSON || onImportData || (() => {});

  const handleDefaultExport = () => {
    if (onExportJSON) {
      onExportJSON();
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const fileName = `${projectData.portada.nombreTrabajo || 'Proyecto_CUN'}_v2.json`;
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calculate completion percentage based on core fields
  const calculateProgress = (): number => {
    let filled = 0;
    let total = 10;

    if (projectData.portada.nombreTrabajo) filled++;
    if (projectData.portada.integrantes.length > 0) filled++;
    if (projectData.compromisosAutor.declaracionAceptada) filled++;
    if (projectData.contenidoTrabajo.introduccion) filled++;
    if (projectData.ideaNegocio.descripcion) filled++;
    if (projectData.ideaNegocio.portafolio.length >= 4) filled++;
    if (projectData.unidadI.mision && projectData.unidadI.vision) filled++;
    if (projectData.unidadI.perfilesCargos.length > 0) filled++;
    if (projectData.unidadII.costosVariables.length > 0) filled++;
    if (projectData.unidadIII.estadoResultados.utilidadNeta !== undefined) filled++;

    return Math.round((filled / total) * 100);
  };

  const progress = calculateProgress();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.portada && parsed.unidadI) {
          handleImport(parsed);
          alert('¡Proyecto importado exitosamente!');
        } else {
          alert('El archivo JSON no tiene la estructura adecuada de un Proyecto CUN.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and App Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black text-xl">
              CUN
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Generador de Proyecto CUN
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Guía v2
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Creación de Empresas III • Modelos de Innovación (CEMP)
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="hidden lg:flex items-center space-x-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5 justify-end">
                <span>Avance del Documento</span>
                <span className="font-bold text-blue-400">{progress}%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Sección {currentStepIndex + 1} de {totalSteps}
              </span>
            </div>
            <div className="w-24 bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Sample Data Load Button */}
            <button
              onClick={handleSample}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3 py-2 rounded-lg transition-all"
              title="Cargar la información de ejemplo para este proyecto"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cargar Ejemplo</span>
            </button>

            {/* Save Current Form as Sample */}
            {onSaveAsSample && (
              <button
                onClick={onSaveAsSample}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3 py-2 rounded-lg transition-all"
                title="Reemplazar la información de 'Cargar Ejemplo' con la información actualmente contenida en el formulario"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Guardar como Ejemplo</span>
              </button>
            )}

            {/* Clear Form */}
            {onClear && (
              <button
                onClick={onClear}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-2 rounded-lg transition-all"
                title="Vaciar por completo la información del formulario"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Limpiar Formulario</span>
              </button>
            )}

            {/* JSON Export/Import */}
            <button
              onClick={handleDefaultExport}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-2 rounded-lg transition-all"
              title="Guardar archivo borrador .json"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Guardar JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-2 rounded-lg transition-all"
              title="Cargar borrador previo desde archivo .json"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Cargar JSON</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />

            {/* Main Preview & Download PDF Button */}
            <button
              onClick={onOpenPreview}
              className="inline-flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg shadow-md shadow-blue-600/30 transition-all transform active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Ver y Descargar PDF</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
