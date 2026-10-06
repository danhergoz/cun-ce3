import React from 'react';
import { AlertTriangle, X, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SectionValidationResult } from '../utils/validation';

interface ValidationAlertBannerProps {
  validationResult: SectionValidationResult;
  onOverrideNav?: () => void;
  onClose: () => void;
}

export const ValidationAlertBanner: React.FC<ValidationAlertBannerProps> = ({
  validationResult,
  onOverrideNav,
  onClose,
}) => {
  if (validationResult.isValid) return null;

  return (
    <div className="mb-6 bg-red-50/90 border-2 border-red-300 rounded-2xl p-5 sm:p-6 shadow-md transition-all animate-fadeIn">
      <div className="flex items-start justify-between gap-3 border-b border-red-200/80 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5 shadow-2xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-200 text-red-900 px-2 py-0.5 rounded-md">
                Validación de Formulario
              </span>
              <span className="text-xs font-bold text-red-800">
                {validationResult.errors.length} {validationResult.errors.length === 1 ? 'campo pendiente' : 'campos pendientes'}
              </span>
            </div>
            <h3 className="text-base font-bold text-red-950 mt-1">
              Campos obligatorios incompletos en {validationResult.tabLabel}
            </h3>
            <p className="text-xs text-red-800 mt-1 leading-relaxed">
              Para garantizar que el documento final cumpla los estándares institucionales de la CUN, asegúrese de diligenciar la siguiente información antes de continuar.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="text-red-400 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100/70 transition-all"
          title="Cerrar advertencia"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Missing Fields List */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {validationResult.errors.map((err) => (
          <div
            key={err.fieldId}
            className="flex items-start gap-2.5 bg-white/80 border border-red-200 p-3 rounded-xl shadow-2xs text-xs"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">{err.label}</span>
              <span className="text-red-700 font-medium leading-tight">{err.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Controls */}
      <div className="mt-5 pt-3 border-t border-red-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-semibold text-red-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-red-600" />
          Proporción completada: {validationResult.percentage}% ({validationResult.completedCount} de {validationResult.totalRequiredCount} secciones clave)
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-white text-slate-800 font-bold text-xs rounded-xl border border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
          >
            Completar Datos
          </button>

          {onOverrideNav && (
            <button
              type="button"
              onClick={onOverrideNav}
              className="w-full sm:w-auto px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Avanzar de todos modos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
