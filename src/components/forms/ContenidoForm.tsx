import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertCircle, Plus, Trash2, Target, KeyRound, Keyboard, ShieldAlert, X, Video, ExternalLink } from 'lucide-react';
import { ProjectData } from '../../types/project';
import { countWords } from '../../utils/helpers';
import { AIAssistModal } from '../AIAssistModal';

interface ContenidoFormProps {
  data: ProjectData['contenidoTrabajo'];
  companyName: string;
  onChange: (updated: ProjectData['contenidoTrabajo']) => void;
}

export const ContenidoForm: React.FC<ContenidoFormProps> = ({ data, companyName, onChange }) => {
  const [aiModalTarget, setAiModalTarget] = useState<{ key: string; title: string } | null>(null);
  const [pasteBlockedWarning, setPasteBlockedWarning] = useState<boolean>(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const introWords = countWords(data.introduccion);
  const resumenWords = countWords(data.resumenEjecutivo);

  const triggerPasteWarning = () => {
    setPasteBlockedWarning(true);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    warningTimeoutRef.current = setTimeout(() => {
      setPasteBlockedWarning(false);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  const handleIntroduccionPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    triggerPasteWarning();
  };

  const handleIntroduccionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Intercept Ctrl + V / Cmd + V
    if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      triggerPasteWarning();
    }
    // Intercept Shift + Insert (classic paste shortcut)
    if (e.shiftKey && e.key === 'Insert') {
      e.preventDefault();
      triggerPasteWarning();
    }
  };

  const handleIntroduccionDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    triggerPasteWarning();
  };

  const handleIntroduccionBeforeInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent;
    if (
      nativeEvent?.inputType === 'insertFromPaste' ||
      nativeEvent?.inputType === 'insertFromDrop'
    ) {
      e.preventDefault();
      triggerPasteWarning();
    }
  };

  const handleIntroduccionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const oldLength = data.introduccion.length;
    // Safeguard against massive paste bypass (more than 15 chars injected in a single change event)
    if (newValue.length - oldLength > 15) {
      triggerPasteWarning();
      return;
    }
    onChange({ ...data, introduccion: newValue });
  };

  // Objectives helpers
  const handleAddObjetivo = () => {
    onChange({
      ...data,
      objetivosEspecificos: [...data.objetivosEspecificos, ''],
    });
  };

  const handleUpdateObjetivo = (index: number, val: string) => {
    const updated = [...data.objetivosEspecificos];
    updated[index] = val;
    onChange({ ...data, objetivosEspecificos: updated });
  };

  const handleRemoveObjetivo = (index: number) => {
    if (data.objetivosEspecificos.length <= 3) {
      alert('La guía exige un mínimo de 3 objetivos específicos.');
      return;
    }
    onChange({
      ...data,
      objetivosEspecificos: data.objetivosEspecificos.filter((_, i) => i !== index),
    });
  };

  // Claves Exito helpers
  const handleAddClave = () => {
    onChange({
      ...data,
      clavesExito: [...data.clavesExito, ''],
    });
  };

  const handleUpdateClave = (index: number, val: string) => {
    const updated = [...data.clavesExito];
    updated[index] = val;
    onChange({ ...data, clavesExito: updated });
  };

  const handleRemoveClave = (index: number) => {
    if (data.clavesExito.length <= 3) {
      alert('La guía exige un mínimo de 3 claves de éxito.');
      return;
    }
    onChange({
      ...data,
      clavesExito: data.clavesExito.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Introduccion */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Introducción (Mínimo 150 palabras)</h3>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            <Keyboard className="w-3.5 h-3.5 text-blue-700" />
            <span>Digitalización por teclado</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Plantee un resumen con los aspectos más destacados o relevantes del proyecto, entre los que pueden contar con la historia, logo, ubicación, motivaciones, etc.
        </p>

        {pasteBlockedWarning && (
          <div className="flex items-start justify-between gap-3 p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-950">Acción restringida:</span> En este campo no se permite el copiado ni pegado masivo (<kbd className="px-1.5 py-0.5 bg-white border border-rose-300 rounded text-[10px] font-mono font-bold text-rose-800">Ctrl + V</kbd> / menú contextual). El contenido debe redactarse directamente mediante digitalización con el teclado.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPasteBlockedWarning(false)}
              className="text-rose-400 hover:text-rose-700 p-1 rounded-md transition-colors"
              title="Cerrar advertencia"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <textarea
          rows={6}
          value={data.introduccion}
          onChange={handleIntroduccionChange}
          onKeyDown={handleIntroduccionKeyDown}
          onPaste={handleIntroduccionPaste}
          onDrop={handleIntroduccionDrop}
          onBeforeInput={handleIntroduccionBeforeInput}
          placeholder="Escriba la introducción de su proyecto mediante digitalización con el teclado..."
          className={`w-full text-xs p-3 border rounded-xl outline-none leading-relaxed text-slate-800 transition-all ${
            pasteBlockedWarning
              ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20'
              : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />

        <div className="flex flex-wrap justify-between items-center text-xs gap-2 pt-1">
          <div className="flex items-center gap-1.5 font-medium">
            {introWords >= 150 ? (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cumple requisito ({introWords} palabras)
              </span>
            ) : (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {introWords} / 150 palabras recomendadas
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Keyboard className="w-3 h-3 text-slate-400" />
            Entrada por teclado obligatoria
          </span>
        </div>
      </div>

      {/* Objetivo General y Específicos */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <Target className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Objetivo General y Específicos</h3>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Objetivo General <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setAiModalTarget({ key: 'objetivoGeneral', title: 'Objetivo General' })}
              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Sugerir con IA</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-1">
            Enfocado al proyecto en sí. Responde a: ¿Qué pretendo con esta idea de negocio que apoya las temáticas del curso?
          </p>
          <textarea
            rows={2}
            value={data.objetivoGeneral}
            onChange={(e) => onChange({ ...data, objetivoGeneral: e.target.value })}
            placeholder="Ej: Determinar la viabilidad estratégica, operativa y financiera para..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Objetivos Específicos */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-800">
              Objetivos Específicos (Mínimo 3)
            </label>
            <button
              type="button"
              onClick={handleAddObjetivo}
              className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Objetivo</span>
            </button>
          </div>

          <div className="space-y-2">
            {data.objetivosEspecificos.map((obj, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 w-6 text-center">{idx + 1}.</span>
                <input
                  type="text"
                  value={obj}
                  onChange={(e) => handleUpdateObjetivo(idx, e.target.value)}
                  placeholder={`Objetivo específico #${idx + 1}...`}
                  className="flex-1 text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
                {data.objetivosEspecificos.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveObjetivo(idx)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Claves de Éxito */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Claves de Éxito (Mínimo 3)</h3>
          </div>
          <button
            type="button"
            onClick={handleAddClave}
            className="inline-flex items-center gap-1 text-xs font-bold bg-amber-600 text-white px-2.5 py-1 rounded-lg hover:bg-amber-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Clave</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Factores únicos o situaciones determinantes que representan una ventaja clara para la consecución de los objetivos del negocio.
        </p>

        <div className="space-y-2">
          {data.clavesExito.map((clave, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 w-6 text-center">#{idx + 1}</span>
              <input
                type="text"
                value={clave}
                onChange={(e) => handleUpdateClave(idx, e.target.value)}
                placeholder={`Clave de éxito #${idx + 1}...`}
                className="flex-1 text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500"
              />
              {data.clavesExito.length > 3 && (
                <button
                  type="button"
                  onClick={() => handleRemoveClave(idx)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Resumen Ejecutivo (Mínimo 150 palabras)</h3>
          </div>
          <button
            type="button"
            onClick={() => setAiModalTarget({ key: 'resumenEjecutivo', title: 'Resumen Ejecutivo' })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generar con IA</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Proporcione una descripción concisa pero positiva de su compañía, incluidos los objetivos y los logros proyectados.
        </p>

        <textarea
          rows={6}
          value={data.resumenEjecutivo}
          onChange={(e) => onChange({ ...data, resumenEjecutivo: e.target.value })}
          placeholder="Escriba el resumen ejecutivo sintetizando los puntos más importantes del plan de negocio..."
          className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed text-slate-800"
        />

        <div className="flex justify-between items-center text-xs pt-1">
          <div className="flex items-center gap-1.5 font-medium">
            {resumenWords >= 150 ? (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cumple requisito ({resumenWords} palabras)
              </span>
            ) : (
              <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {resumenWords} / 150 palabras recomendadas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Video Pitch */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900">Video Pitch</h3>
          </div>
          {data.videoPitch && (
            <a
              href={data.videoPitch}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Video</span>
            </a>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Ingrese el enlace de sustentación del video pitch del proyecto (por ejemplo, enlace de YouTube o plataforma de video).
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Enlace URL del Video Pitch
          </label>
          <input
            type="url"
            value={data.videoPitch || ''}
            onChange={(e) => onChange({ ...data, videoPitch: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=Bieyi5sGznM"
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
          />
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
          currentContent={
            aiModalTarget.key === 'introduccion'
              ? data.introduccion
              : aiModalTarget.key === 'resumenEjecutivo'
              ? data.resumenEjecutivo
              : data.objetivoGeneral
          }
          onApply={(text) => {
            if (aiModalTarget.key === 'introduccion') onChange({ ...data, introduccion: text });
            else if (aiModalTarget.key === 'resumenEjecutivo') onChange({ ...data, resumenEjecutivo: text });
            else if (aiModalTarget.key === 'objetivoGeneral') onChange({ ...data, objetivoGeneral: text });
          }}
        />
      )}

    </div>
  );
};
