import React, { useState } from 'react';
import { 
  X, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, 
  Briefcase, Network, Layers, ShieldCheck, Sparkles, Check
} from 'lucide-react';
import { OrganigramaNodo, CargoPerfil } from '../../types/project';
import { 
  compareCargos, 
  buildOrganigramaFromPerfiles, 
  buildPerfilesFromOrganigrama 
} from './organigramaSyncUtils';
import { generateOrganigramaImage } from './organigramaCanvasGenerator';

interface OrganigramaPerfilesSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodosActuales: OrganigramaNodo[];
  perfilesCargos: CargoPerfil[];
  tipoEstructura: string;
  companyName: string;
  onApplySyncToOrganigrama: (newNodos: OrganigramaNodo[], newImageUrl: string) => void;
  onApplySyncToPerfiles: (newPerfiles: CargoPerfil[]) => void;
}

export const OrganigramaPerfilesSyncModal: React.FC<OrganigramaPerfilesSyncModalProps> = ({
  isOpen,
  onClose,
  nodosActuales,
  perfilesCargos,
  tipoEstructura,
  companyName,
  onApplySyncToOrganigrama,
  onApplySyncToPerfiles,
}) => {
  if (!isOpen) return null;

  const [notification, setNotification] = useState<string | null>(null);

  const comparison = compareCargos(nodosActuales, perfilesCargos);

  const handleSyncToOrganigrama = () => {
    if (!perfilesCargos || perfilesCargos.length === 0) {
      alert('No hay perfiles de cargos registrados en la sección 2.2 para sincronizar.');
      return;
    }

    const newNodos = buildOrganigramaFromPerfiles(perfilesCargos, nodosActuales);
    const newImg = generateOrganigramaImage(newNodos, tipoEstructura, companyName);
    onApplySyncToOrganigrama(newNodos, newImg);
    setNotification('¡Organigrama actualizado exitosamente con los cargos de 2.2!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSyncToPerfiles = () => {
    if (!nodosActuales || nodosActuales.length === 0) {
      alert('No hay cargos configurados en el organigrama para sincronizar.');
      return;
    }

    const newPerfiles = buildPerfilesFromOrganigrama(nodosActuales, perfilesCargos);
    onApplySyncToPerfiles(newPerfiles);
    setNotification('¡Sección 2.2 Perfiles de Cargos actualizada exitosamente!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Encabezado */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <RefreshCw className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Sincronización de Información de Cargos
                </h3>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-semibold">
                  2.1 Organigrama ⇄ 2.2 Perfiles
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Garantice que la información de los cargos coincida entre el organigrama y los perfiles de cargos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación de éxito */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-center gap-2 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Contenido principal */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* Tarjeta de Estado de Correspondencia */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            comparison.isFullySynced
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {comparison.isFullySynced ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {comparison.isFullySynced
                    ? '¡Cargos sincronizados con correspondencia total!'
                    : 'Hay diferencias entre el Organigrama y los Perfiles de Cargos'}
                </h4>
                <p className="text-[11px] mt-0.5 text-slate-600">
                  {comparison.isFullySynced
                    ? `Todos los ${comparison.totalPerfiles} perfiles registrados en la sección 2.2 coinciden con la estructura del organigrama.`
                    : `Hay ${comparison.totalNodos} cargos en el Organigrama y ${comparison.totalPerfiles} perfiles registrados en la sección 2.2. Utilice las opciones a continuación para unificarlos.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                2.1: {comparison.totalNodos} cargos
              </span>
              <span>↔</span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                2.2: {comparison.totalPerfiles} perfiles
              </span>
            </div>
          </div>

          {/* Opciones de Acción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Opción 1 (Requerida): Organigrama coincida con 2.2 Perfiles */}
            <div className="p-4 rounded-xl border-2 border-blue-500 bg-gradient-to-b from-blue-50/60 to-white flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Opción recomendada</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Desde 2.2 → Hacia 2.1</span>
                </div>

                <h4 className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span>Hacer que el Organigrama coincida con 2.2</span>
                </h4>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Actualiza automáticamente el organigrama para que refleje <strong>exactamente los {comparison.totalPerfiles} cargos</strong> registrados en la sección <strong>"2.2. Perfiles de Cargos"</strong>:
                </p>

                <ul className="text-[11px] text-slate-600 space-y-1 pl-3 list-disc marker:text-blue-500">
                  <li>Organiza jerarquía (Junta Directiva, Gerencia, Staff y Operativos).</li>
                  <li>Asigna salarios y áreas coherentes a cada casilla.</li>
                  <li>Regenera de inmediato la imagen nítida para la vista previa y el PDF final.</li>
                </ul>
              </div>

              <div className="pt-4 mt-3 border-t border-blue-100">
                <button
                  type="button"
                  onClick={handleSyncToOrganigrama}
                  disabled={comparison.totalPerfiles === 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Hacer que el Organigrama coincida con 2.2</span>
                </button>
              </div>
            </div>

            {/* Opción 2: Actualizar 2.2 Perfiles desde Organigrama */}
            <div className="p-4 rounded-xl border border-slate-300 bg-gradient-to-b from-slate-50/70 to-white flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                    Opción complementaria
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Desde 2.1 → Hacia 2.2</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Actualizar 2.2 Perfiles desde el Organigrama</span>
                </h4>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Crea y sincroniza las fichas de <strong>"2.2. Perfiles de Cargos"</strong> a partir de los <strong>{comparison.totalNodos} cargos</strong> diseñados en el organigrama actual:
                </p>

                <ul className="text-[11px] text-slate-600 space-y-1 pl-3 list-disc marker:text-indigo-500">
                  <li>Crea una ficha de perfil para cada cargo del organigrama.</li>
                  <li>Conserva las funciones, salarios y formación ya registradas.</li>
                  <li>Genera requisitos predeterminados para los cargos nuevos.</li>
                </ul>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSyncToPerfiles}
                  disabled={comparison.totalNodos === 0}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Actualizar 2.2 Perfiles con los Cargos del Organigrama</span>
                </button>
              </div>
            </div>

          </div>

          {/* Comparativa Detallada de Cargos */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <h5 className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Comparación Detallada de Cargos Registrados</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Columna 2.1 Organigrama */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cargos en Organigrama (2.1)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {comparison.nodoItems.length} cargos
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {comparison.nodoItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-1.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-medium text-slate-800 truncate mr-2">
                        {item.cargo}
                      </span>
                      {item.hasMatchInPerfiles ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>Coincide</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                          Solo en 2.1
                        </span>
                      )}
                    </div>
                  ))}
                  {comparison.nodoItems.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No hay cargos configurados.</p>
                  )}
                </div>
              </div>

              {/* Columna 2.2 Perfiles */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Perfiles de Cargos (2.2)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {comparison.perfilItems.length} perfiles
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {comparison.perfilItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-1.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-medium text-slate-800 truncate mr-2">
                        {item.nombreCargo}
                      </span>
                      {item.hasMatchInOrganigrama ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>Coincide</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                          Solo en 2.2
                        </span>
                      )}
                    </div>
                  ))}
                  {comparison.perfilItems.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No hay perfiles registrados en 2.2.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Los cambios se guardan y actualizan automáticamente tanto en el formulario como en el PDF descargable.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
