import React from 'react';
import { Users, Plus, Trash2, Building2, MapPin, Calendar, BookOpen } from 'lucide-react';
import { ProjectData, Integrante } from '../../types/project';

interface PortadaFormProps {
  data: ProjectData['portada'];
  onChange: (updated: ProjectData['portada']) => void;
}

export const PortadaForm: React.FC<PortadaFormProps> = ({ data, onChange }) => {
  React.useEffect(() => {
    if (
      data.materia !== 'Creación de Empresas III - Modelos de Innovación' ||
      data.institucion !== 'Corporación Unificada Nacional de Educación Superior (CUN)'
    ) {
      onChange({
        ...data,
        materia: 'Creación de Empresas III - Modelos de Innovación',
        institucion: 'Corporación Unificada Nacional de Educación Superior (CUN)',
      });
    }
  }, [data.materia, data.institucion]);

  const handleAddIntegrante = () => {
    if (data.integrantes.length >= 4) {
      alert('La guía CUN permite un máximo de 4 integrantes por proyecto.');
      return;
    }
    const newIntegrante: Integrante = {
      id: Date.now().toString(),
      nombre: '',
      facultad: 'Escuela de Ciencias Administrativas',
      carrera: 'Administración de Empresas',
      grupo: 'G024',
    };
    onChange({
      ...data,
      integrantes: [...data.integrantes, newIntegrante],
    });
  };

  const handleUpdateIntegrante = (id: string, field: keyof Integrante, value: string) => {
    const updatedIntegrantes = data.integrantes.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, integrantes: updatedIntegrantes });
  };

  const handleRemoveIntegrante = (id: string) => {
    if (data.integrantes.length <= 1) {
      alert('La guía indica un mínimo de 1 integrante.');
      return;
    }
    onChange({
      ...data,
      integrantes: data.integrantes.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-blue-950">Estructura de la Portada CUN</h4>
          <p className="mt-1 leading-relaxed">
            Configure el título oficial del proyecto, los datos del curso, el docente asignado y la información de los integrantes (mínimo 1, máximo 4 integrantes por equipo).
          </p>
        </div>
      </div>

      {/* Basic Cover Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Información del Trabajo y Curso
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Trabajo / Título del Proyecto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.nombreTrabajo}
              onChange={(e) => onChange({ ...data, nombreTrabajo: e.target.value })}
              placeholder="Ej: Plan de Negocio y Modelo de Innovación: EcoPack Solutions S.A.S."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asignatura / Curso <span className="text-[10px] text-slate-400 font-normal">(Fijo)</span>
            </label>
            <input
              type="text"
              readOnly
              value="Creación de Empresas III - Modelos de Innovación"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-100 font-medium text-slate-700 cursor-not-allowed select-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Docente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.docente}
              onChange={(e) => onChange({ ...data, docente: e.target.value })}
              placeholder="Ej: Daniel Hernández Gómez"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institución Educativa <span className="text-[10px] text-slate-400 font-normal">(Fijo)</span>
            </label>
            <input
              type="text"
              readOnly
              value="Corporación Unificada Nacional de Educación Superior (CUN)"
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-100 font-medium text-slate-700 cursor-not-allowed select-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={data.ciudad}
                onChange={(e) => onChange({ ...data, ciudad: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Año de Presentación
              </label>
              <input
                type="text"
                value={data.ano}
                onChange={(e) => onChange({ ...data, ano: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Integrantes List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Integrantes del Grupo ({data.integrantes.length} / 4)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddIntegrante}
            disabled={data.integrantes.length >= 4}
            className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Estudiante</span>
          </button>
        </div>

        <div className="space-y-3">
          {data.integrantes.map((integrante, index) => (
            <div
              key={integrante.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Estudiante #{index + 1}
                </span>
                {data.integrantes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIntegrante(integrante.id)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="Eliminar integrante"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={integrante.nombre}
                    onChange={(e) => handleUpdateIntegrante(integrante.id, 'nombre', e.target.value)}
                    placeholder="Ej: Daniel Hernández"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Escuela
                  </label>
                  <input
                    type="text"
                    value={integrante.facultad}
                    onChange={(e) => handleUpdateIntegrante(integrante.id, 'facultad', e.target.value)}
                    placeholder="Ej: Escuela de Ciencias Administrativas"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Carrera / Programa
                  </label>
                  <input
                    type="text"
                    value={integrante.carrera}
                    onChange={(e) => handleUpdateIntegrante(integrante.id, 'carrera', e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Grupo de Curso
                  </label>
                  <input
                    type="text"
                    value={integrante.grupo}
                    onChange={(e) => handleUpdateIntegrante(integrante.id, 'grupo', e.target.value)}
                    placeholder="Ej: G024"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
