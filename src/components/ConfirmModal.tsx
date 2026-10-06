import React from 'react';
import { Sparkles, Trash2, X } from 'lucide-react';

export interface ConfirmModalConfig {
  isOpen: boolean;
  type: 'sample' | 'clear';
  title: string;
  message: string;
  confirmText: string;
  confirmStyle: 'emerald' | 'rose';
  secondaryAction?: {
    label: string;
    onClick: () => void;
    style?: string;
  };
  onConfirm: () => void;
}

interface ConfirmModalProps {
  config: ConfirmModalConfig | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ config, onClose }) => {
  if (!config || !config.isOpen) return null;

  const isSample = config.type === 'sample';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className={`p-3 rounded-xl ${isSample ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {isSample ? <Sparkles className="w-6 h-6 text-emerald-600" /> : <Trash2 className="w-6 h-6 text-rose-600" />}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{config.title}</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            {config.message}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {config.secondaryAction ? (
              <button
                type="button"
                onClick={() => {
                  config.secondaryAction?.onClick();
                  onClose();
                }}
                className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
              >
                {config.secondaryAction.label}
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  config.onConfirm();
                  onClose();
                }}
                className={`px-4.5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                  isSample
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                }`}
              >
                {config.confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
