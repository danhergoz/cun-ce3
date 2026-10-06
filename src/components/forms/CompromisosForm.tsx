import React, { useState } from 'react';
import { FileSignature, ShieldCheck, PenTool, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { ProjectData, AutorCompromiso } from '../../types/project';
import { SignaturePadModal } from '../SignaturePadModal';

interface CompromisosFormProps {
  data: ProjectData['compromisosAutor'];
  onChange: (updated: ProjectData['compromisosAutor']) => void;
}

export const CompromisosForm: React.FC<CompromisosFormProps> = ({ data, onChange }) => {
  const [activeSignAutor, setActiveSignAutor] = useState<AutorCompromiso | null>(null);

  const handleAddAutor = () => {
    const newAutor: AutorCompromiso = {
      id: Date.now().toString(),
      nombreCompleto: '',
      programaAcademico: 'Administración de Empresas',
      identificacion: '',
      firmaImgUrl: '',
    };
    onChange({
      ...data,
      autores: [...data.autores, newAutor],
    });
  };

  const handleUpdateAutor = (id: string, field: keyof AutorCompromiso, value: any) => {
    const updated = data.autores.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, autores: updated });
  };

  const handleRemoveAutor = (id: string) => {
    if (data.autores.length <= 1) return;
    onChange({
      ...data,
      autores: data.autores.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Informative Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-amber-950">Sección Obligatoria: Compromisos de Autor</h4>
          <p className="mt-1 leading-relaxed">
            Según las pautas oficiales CUN (Página 5), todos los estudiantes deben certificar la autoría original del proyecto, preventor de plagio académico y adjuntar su firma manuscrita o digital.
          </p>
        </div>
      </div>

      {/* Authors List Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Tabla de Identificación de Autores ({data.autores.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddAutor}
            className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Autor</span>
          </button>
        </div>

        <div className="space-y-3">
          {data.autores.map((autor, idx) => (
            <div key={autor.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Autor #{idx + 1}</span>
                {data.autores.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAutor(autor.id)}
                    className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={autor.nombreCompleto}
                    onChange={(e) => handleUpdateAutor(autor.id, 'nombreCompleto', e.target.value)}
                    placeholder="Ej: Daniel Hernández Gómez"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Programa Académico
                  </label>
                  <input
                    type="text"
                    value={autor.programaAcademico}
                    onChange={(e) => handleUpdateAutor(autor.id, 'programaAcademico', e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    No. de Identificación (C.C.)
                  </label>
                  <input
                    type="text"
                    value={autor.identificacion}
                    onChange={(e) => handleUpdateAutor(autor.id, 'identificacion', e.target.value)}
                    placeholder="Ej: 1.018.452.890"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Signature status / trigger */}
              <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-700">Firma Manuscrita/Digital:</span>
                  {autor.firmaImgUrl ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Firma Registrada
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Pendiente de firma</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {autor.firmaImgUrl && (
                    <img
                      src={autor.firmaImgUrl}
                      alt="Firma Preview"
                      className="h-8 max-w-[120px] object-contain border border-slate-300 rounded bg-white px-1"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveSignAutor(autor)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg transition-all"
                  >
                    <PenTool className="w-3.5 h-3.5 text-blue-400" />
                    <span>{autor.firmaImgUrl ? 'Cambiar Firma' : 'Dibujar / Subir Firma'}</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Legal Text Declaration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Declaración Legal de Autoría (Texto Estándar CUN)
        </h3>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed italic">
          "Asiento (mos) y doy fe que el contenido del presente documento es un reflejo de mi trabajo personal y el de mis compañeros de proyecto (si aplica) y se pone de manifiesto que, ante cualquier notificación relacionada a la presunción de plagio académico, copia o falta a la fuente original, soy (somos) responsable directo legal, económico y administrativo sin afectar al director del trabajo, a la Universidad y a cuantas instituciones han colaborado en dicho trabajo, asumiendo las consecuencias derivadas de tales prácticas."
        </div>

        <label className="flex items-center space-x-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={data.declaracionAceptada}
            onChange={(e) => onChange({ ...data, declaracionAceptada: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span className="text-xs font-semibold text-slate-800">
            Acepto la declaración de compromisos de autor y responsabilidad académica.
          </span>
        </label>
      </div>

      {/* Signature Pad Modal */}
      {activeSignAutor && (
        <SignaturePadModal
          isOpen={!!activeSignAutor}
          onClose={() => setActiveSignAutor(null)}
          autorName={activeSignAutor.nombreCompleto || 'Autor'}
          onSaveSignature={(imgUrl) => {
            handleUpdateAutor(activeSignAutor.id, 'firmaImgUrl', imgUrl);
          }}
        />
      )}

    </div>
  );
};
