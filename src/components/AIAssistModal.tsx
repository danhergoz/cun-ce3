import React, { useState } from 'react';
import { Sparkles, Loader2, X, Check, Wand2 } from 'lucide-react';
import { generateSectionWithAI, enhanceTextWithAI } from '../services/aiService';

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string;
  sectionTitle: string;
  companyName: string;
  currentContent?: string;
  onApply: (generatedText: string) => void;
}

export const AIAssistModal: React.FC<AIAssistModalProps> = ({
  isOpen,
  onClose,
  sectionKey,
  sectionTitle,
  companyName,
  currentContent = '',
  onApply,
}) => {
  const [mode, setMode] = useState<'generate' | 'enhance'>('generate');
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAction = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'generate') {
        const text = await generateSectionWithAI({
          sectionKey,
          sectionTitle,
          userPrompt,
          currentContent,
          companyName,
        });
        setResultText(text);
      } else {
        const text = await enhanceTextWithAI({
          text: currentContent || userPrompt,
          goal: 'Mejorar redacción técnica, ortografía y estilo académico bajo Normas APA.',
        });
        setResultText(text);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar con IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (resultText) {
      onApply(resultText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Asistente IA CUN</h3>
              <p className="text-xs text-slate-300">Generador y Corrector para {sectionTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setMode('generate')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'generate'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generar Borrador Nuevo
            </button>
            <button
              type="button"
              onClick={() => setMode('enhance')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                mode === 'enhance'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mejorar Redacción (APA)
            </button>
          </div>

          {/* Input details */}
          {mode === 'generate' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Instrucciones específicas para {companyName || 'tu empresa'} (Opcional):
              </label>
              <textarea
                rows={3}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Ejemplo: Empresa de panadería artesanal en Bogotá que utiliza harina de quinua y envases de papel reciclado..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Texto actual que será optimizado:
              </label>
              <textarea
                rows={3}
                value={currentContent}
                disabled
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
              />
            </div>
          )}

          {/* Trigger Button */}
          <button
            type="button"
            onClick={handleAction}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando respuesta académica con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{mode === 'generate' ? 'Generar Contenido' : 'Mejorar Redacción y Estilo APA'}</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Generated Result */}
          {resultText && (
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Resultado generado por el Asistente IA CUN:</span>
              </label>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">
                {resultText}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          {resultText && (
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Insertar en el Formulario</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
