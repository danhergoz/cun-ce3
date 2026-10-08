import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { 
  X, Plus, Sparkles, Download, Check, RefreshCw, ZoomIn, ZoomOut, 
  RotateCcw, Layers, Crown, ShieldAlert, Users, Trash2, Edit3, 
  HelpCircle, ChevronDown, ListFilter, Network, CheckCircle2, ArrowRight
} from 'lucide-react';

import { OrganigramaNodo, CargoPerfil, TipoNodoOrganigrama } from '../../types/project';
import { OrganigramaViewer } from './OrganigramaViewer';
import { 
  ESTRUCTURAS_ORGANIGRAMA, 
  ORGANIGRAMA_PRESETS, 
  DEFAULT_ORGANIGRAMA_NODOS 
} from './organigramaTemplates';
import { generateOrganigramaImage } from './organigramaCanvasGenerator';
import { buildOrganigramaFromPerfiles } from './organigramaSyncUtils';

interface OrganigramaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoEstructuraActual: string;
  justificacionCulturaActual: string;
  nodosActuales?: OrganigramaNodo[];
  perfilesCargos?: CargoPerfil[];
  companyName?: string;
  onSave: (data: {
    tipoEstructura: string;
    justificacionCultura: string;
    nodos: OrganigramaNodo[];
    imagenUrl?: string;
  }) => void;
}

export const OrganigramaBuilderModal: React.FC<OrganigramaBuilderModalProps> = ({
  isOpen,
  onClose,
  tipoEstructuraActual,
  justificacionCulturaActual,
  nodosActuales,
  perfilesCargos = [],
  companyName = 'EcoPack Solutions S.A.S.',
  onSave,
}) => {
  if (!isOpen) return null;

  // Estados locales de edición
  const [tipoEstructura, setTipoEstructura] = useState<string>(
    tipoEstructuraActual || 'Estructura Funcional por Procesos'
  );
  const [justificacionCultura, setJustificacionCultura] = useState<string>(
    justificacionCulturaActual || 'Fomenta la agilidad operativa, la colaboración interdisciplinaria y la orientación hacia la innovación sostenible y la mejora continua.'
  );
  const [nodos, setNodos] = useState<OrganigramaNodo[]>(() => {
    if (nodosActuales && nodosActuales.length > 0) return nodosActuales;
    return DEFAULT_ORGANIGRAMA_NODOS;
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => {
    return (nodosActuales && nodosActuales.length > 0) ? nodosActuales[0].id : DEFAULT_ORGANIGRAMA_NODOS[0].id;
  });

  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');
  const [zoom, setZoom] = useState<number>(1);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Referencia para captura de imagen
  const canvasCaptureRef = useRef<HTMLDivElement>(null);

  // Nodo seleccionado actual para edición rápida
  const selectedNode = nodos.find((n) => n.id === selectedNodeId) || null;

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Manejo de nodos
  const handleUpdateNode = (id: string, fields: Partial<OrganigramaNodo>) => {
    setNodos((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...fields } : n))
    );
  };

  const handleAddChild = (parentId: string) => {
    const parent = nodos.find((n) => n.id === parentId);
    const newId = `nodo-${Date.now()}`;
    const newNode: OrganigramaNodo = {
      id: newId,
      cargo: 'Nuevo Cargo / Colaborador',
      nombre: '',
      area: parent?.area || 'Operaciones',
      parentId,
      tipo: parent?.tipo === 'directivo' ? 'departamento' : 'operativo',
      color: parent?.tipo === 'directivo' ? '#059669' : '#4f46e5',
    };
    setNodos((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
    showToast('Cargo subordinado agregado');
  };

  const handleAddSibling = (nodeId: string) => {
    const refNode = nodos.find((n) => n.id === nodeId);
    const newId = `nodo-${Date.now()}`;
    const newNode: OrganigramaNodo = {
      id: newId,
      cargo: 'Nuevo Cargo Paralelo',
      nombre: '',
      area: refNode?.area || 'Área General',
      parentId: refNode?.parentId || null,
      tipo: refNode?.tipo || 'departamento',
      color: refNode?.color || '#0284c7',
    };
    setNodos((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
    showToast('Cargo paralelo agregado al mismo nivel');
  };

  const handleAddStaff = (parentId: string) => {
    const newId = `staff-${Date.now()}`;
    const newNode: OrganigramaNodo = {
      id: newId,
      cargo: 'Asesoría / Staff Externo',
      nombre: 'Órgano Consultivo',
      area: 'Staff / Asesoría',
      parentId,
      tipo: 'staff',
      color: '#64748b',
    };
    setNodos((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
    showToast('Órgano de asesoría (Staff) agregado');
  };

  const handleAddRoot = () => {
    const newId = `root-${Date.now()}`;
    const newNode: OrganigramaNodo = {
      id: newId,
      cargo: 'Asamblea General / Junta Directiva',
      nombre: 'Órgano de Gobierno',
      area: 'Alta Dirección',
      parentId: null,
      tipo: 'directivo',
      color: '#003366',
    };
    setNodos((prev) => [newNode, ...prev]);
    setSelectedNodeId(newId);
    showToast('Nuevo puesto de máxima dirección agregado');
  };

  const handleDeleteNode = (id: string) => {
    if (nodos.length <= 1) {
      alert('El organigrama debe contener al menos un cargo.');
      return;
    }
    const targetNode = nodos.find((n) => n.id === id);
    // Reasignar los hijos al padre del nodo eliminado
    const parentOfDeleted = targetNode?.parentId || null;

    setNodos((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => (n.parentId === id ? { ...n, parentId: parentOfDeleted } : n))
    );

    if (selectedNodeId === id) {
      const remaining = nodos.filter((n) => n.id !== id);
      setSelectedNodeId(remaining[0]?.id || null);
    }
    showToast('Cargo eliminado');
  };

  // Cargar plantilla preestablecida
  const handleLoadPreset = (presetId: string) => {
    const preset = ORGANIGRAMA_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (window.confirm(`¿Desea cargar la plantilla "${preset.nombre}"? Se sustituirá el diseño actual del organigrama.`)) {
      setTipoEstructura(preset.tipoEstructura);
      setNodos(preset.nodos);
      setSelectedNodeId(preset.nodos[0]?.id || null);
      setShowPresetDropdown(false);
      showToast(`Plantilla "${preset.nombre}" cargada.`);
    }
  };

  // Sincronizar desde los perfiles de cargos ya ingresados en la sección 2.2
  const handleSyncWithPerfiles = () => {
    if (!perfilesCargos || perfilesCargos.length === 0) {
      alert('No hay perfiles de cargos diligenciados en la sección 2.2 de la Unidad I.');
      return;
    }

    if (window.confirm(`¿Desea estructurar el organigrama a partir de los ${perfilesCargos.length} cargos existentes en la sección 2.2?`)) {
      const newNodos = buildOrganigramaFromPerfiles(perfilesCargos, nodos);
      setNodos(newNodos);
      setSelectedNodeId(newNodos[0]?.id || null);
      showToast(`¡Cargos sincronizados con éxito desde Perfiles 2.2 (${perfilesCargos.length} cargos)!`);
    }
  };

  // Descargar imagen PNG directa
  const handleDownloadImage = () => {
    try {
      setIsGeneratingImage(true);
      const dataUrl = generateOrganigramaImage(nodos, tipoEstructura, companyName);
      if (!dataUrl) {
        throw new Error('No se pudo generar la imagen del organigrama');
      }
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Organigrama_${companyName.replace(/\s+/g, '_')}.png`;
      a.click();
      showToast('Imagen PNG descargada con éxito');
    } catch (e) {
      console.error('Error al generar imagen del organigrama', e);
      alert('No se pudo generar la imagen para descarga.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Guardar y consolidar en el proyecto y generar imagen para PDF
  const handleSaveAndClose = () => {
    setIsGeneratingImage(true);
    let capturedImageUrl: string | undefined = undefined;

    try {
      capturedImageUrl = generateOrganigramaImage(nodos, tipoEstructura, companyName);
    } catch (err) {
      console.warn('Error al generar imagen rasterizada del organigrama:', err);
    }

    onSave({
      tipoEstructura,
      justificacionCultura,
      nodos,
      imagenUrl: capturedImageUrl,
    });

    setIsGeneratingImage(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* =========================================================================
            HEADER DE LA APLICACIÓN
        ========================================================================= */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Aplicativo de Creación y Edición de Organigrama
                </h3>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-medium">
                  Guía CUN • 2.1
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Diseñe la arquitectura jerárquica y funcional para <strong className="text-white">{companyName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Presets Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-blue-300" />
                <span>Cargar Plantilla</span>
                <ChevronDown className="w-3 h-3 text-blue-200" />
              </button>

              {showPresetDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Modelos Organizacionales
                  </div>
                  {ORGANIGRAMA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleLoadPreset(preset.id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-900 border-b border-slate-100 last:border-b-0"
                    >
                      <p className="font-bold text-slate-900">{preset.nombre}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{preset.descripcion}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sincronizar desde Perfiles de Cargos */}
            {perfilesCargos && perfilesCargos.length > 0 && (
              <button
                type="button"
                onClick={handleSyncWithPerfiles}
                title="Estructurar con los cargos de la sección 2.2"
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Importar Cargos (2.2)</span>
              </button>
            )}

            {/* Descargar PNG */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20"
              title="Descargar diagrama en imagen PNG"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Descargar PNG</span>
            </button>

            {/* Cerrar modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación de estado */}
        {statusMessage && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* =========================================================================
            BARRA DE CONFIGURACIÓN DEL TIPO DE ESTRUCTURA Y HERRAMIENTAS
        ========================================================================= */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Selector de Tipo de Estructura */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <label className="font-bold text-slate-700 whitespace-nowrap">
              Tipo de Estructura:
            </label>
            <select
              value={tipoEstructura}
              onChange={(e) => setTipoEstructura(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none flex-1"
            >
              {ESTRUCTURAS_ORGANIGRAMA.map((est) => (
                <option key={est.id} value={est.nombre}>
                  {est.nombre}
                </option>
              ))}
              <option value="Estructura Funcional - Matricial por Procesos">
                Estructura Funcional - Matricial por Procesos
              </option>
              <option value="Estructura Circular">Estructura Circular</option>
              <option value="Estructura Personalizada">Estructura Personalizada</option>
            </select>
          </div>

          {/* Justificación y Cultura (Guía CUN) */}
          <div className="flex items-center gap-2 flex-1 min-w-[320px]">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="font-bold text-slate-700">Justificación y Cultura</span>
                <span className={justificacionCultura.length <= 200 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                  {justificacionCultura.length}/200
                </span>
              </div>
              <input
                type="text"
                maxLength={200}
                value={justificacionCultura}
                onChange={(e) => setJustificacionCultura(e.target.value)}
                placeholder="Breve justificación del organigrama y cultura..."
                className="w-full p-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Herramientas de visualización (Canvas vs Lista, Zoom) */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('canvas')}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'canvas' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Árbol</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Jerarquía</span>
              </button>
            </div>

            {viewMode === 'canvas' && (
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                  className="p-1 text-slate-600 hover:text-slate-900"
                  title="Alejar"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-semibold px-1 text-slate-600">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                  className="p-1 text-slate-600 hover:text-slate-900"
                  title="Acercar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="p-1 text-slate-600 hover:text-slate-900"
                  title="Restablecer tamaño"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            CUERPO PRINCIPAL: CANVAS VISUAL + PANEL DE EDICIÓN DEL CARGO
        ========================================================================= */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[460px]">
          
          {/* PANEL IZQUIERDO: CANVAS DEL ORGANIGRAMA */}
          <div className="flex-1 bg-slate-100 overflow-auto p-4 flex flex-col items-center justify-start relative">
            
            {/* Botón flotante para añadir puesto directivo en la cima */}
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddRoot}
                className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Añadir Cargo Directivo en la Cima</span>
              </button>
            </div>

            {/* Contenedor Capturable para el Diagrama */}
            <div
              ref={canvasCaptureRef}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.1s ease',
              }}
              className="w-full flex justify-center py-2 bg-white rounded-xl shadow-sm border border-slate-200"
            >
              {viewMode === 'canvas' ? (
                <OrganigramaViewer
                  nodos={nodos}
                  tipoEstructura={tipoEstructura}
                  selectedNodeId={selectedNodeId}
                  interactive={true}
                  onSelectNode={(n) => setSelectedNodeId(n.id)}
                  onAddChild={handleAddChild}
                  onAddSibling={handleAddSibling}
                  onDeleteNode={handleDeleteNode}
                  onEditNode={(n) => setSelectedNodeId(n.id)}
                />
              ) : (
                /* Vista de Lista Jerárquica */
                <div className="w-full p-6 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
                    <span>Estructura de Cargos y Reportes Directos</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Haga clic en un cargo para editar sus propiedades
                    </span>
                  </h4>

                  <div className="space-y-2">
                    {nodos.map((n) => {
                      const parent = nodos.find((p) => p.id === n.parentId);
                      return (
                        <div
                          key={n.id}
                          onClick={() => setSelectedNodeId(n.id)}
                          className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            selectedNodeId === n.id
                              ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: n.color || '#1d4ed8' }}
                            />
                            <div>
                              <p className="font-bold text-slate-900">{n.cargo}</p>
                              <p className="text-[11px] text-slate-500">
                                {n.area || 'Sin Área'} • Tipo: <span className="capitalize">{n.tipo}</span>
                                {n.nombre && ` • Responsable: ${n.nombre}`}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {parent ? `Reporta a: ${parent.cargo}` : 'Máxima Autoridad (Raíz)'}
                            </span>
                            {nodos.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNode(n.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PANEL DERECHO: EDITOR DE DETALLES DEL CARGO SELECCIONADO */}
          <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-4 flex flex-col justify-between overflow-y-auto">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Propiedades del Cargo Seleccionado</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {selectedNode.id}</span>
                </div>

                {/* Nombre del Cargo */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nombre del Cargo / Posición *
                  </label>
                  <input
                    type="text"
                    value={selectedNode.cargo}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { cargo: e.target.value })}
                    placeholder="Ej: Director Comercial, Operario..."
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-900"
                  />
                </div>

                {/* Persona Responsable o Nombre */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Titular o Responsable (Opcional)
                  </label>
                  <input
                    type="text"
                    value={selectedNode.nombre || ''}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { nombre: e.target.value })}
                    placeholder="Ej: Daniel Hernández, Vacante..."
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                  />
                </div>

                {/* Área / Departamento */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Área o Departamento *
                  </label>
                  <input
                    type="text"
                    value={selectedNode.area}
                    onChange={(e) => handleUpdateNode(selectedNode.id, { area: e.target.value })}
                    placeholder="Ej: Operaciones, Comercial, I+D..."
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                  />
                </div>

                {/* Nivel / Tipo de Nodo */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nivel y Tipo de Autoridad *
                  </label>
                  <select
                    value={selectedNode.tipo || 'operativo'}
                    onChange={(e) => {
                      const newTipo = e.target.value as TipoNodoOrganigrama;
                      let defaultColor = '#4f46e5';
                      if (newTipo === 'directivo') defaultColor = '#1d4ed8';
                      if (newTipo === 'staff') defaultColor = '#64748b';
                      if (newTipo === 'departamento') defaultColor = '#059669';
                      handleUpdateNode(selectedNode.id, { tipo: newTipo, color: defaultColor });
                    }}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  >
                    <option value="directivo">Directivo (Alta Dirección / Presidencia / Gerencia)</option>
                    <option value="staff">Staff / Asesoría (Consultoría, Revisoría, Jurídico)</option>
                    <option value="departamento">Departamento / Mando Medio (Directores de Área)</option>
                    <option value="operativo">Operativo (Ejecución, Técnicos, Asistentes)</option>
                  </select>
                </div>

                {/* Dependencia Jerárquica: A quién reporta */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Dependencia (Reporta a):
                  </label>
                  <select
                    value={selectedNode.parentId || ''}
                    onChange={(e) =>
                      handleUpdateNode(selectedNode.id, {
                        parentId: e.target.value ? e.target.value : null,
                      })
                    }
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  >
                    <option value="">-- Sin superior (Puesto Máximo / Raíz) --</option>
                    {nodos
                      .filter((n) => n.id !== selectedNode.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.cargo} ({n.area || 'General'})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Color Distintivo */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Color Distintivo del Cargo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedNode.color || '#1d4ed8'}
                      onChange={(e) => handleUpdateNode(selectedNode.id, { color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {['#003366', '#1d4ed8', '#059669', '#d97706', '#7c3aed', '#64748b', '#e11d48'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleUpdateNode(selectedNode.id, { color: col })}
                          className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones directas sobre el cargo */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700">
                    Añadir Nodos Vinculados:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleAddChild(selectedNode.id)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-semibold flex items-center justify-center gap-1 border border-blue-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Subordinado</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSibling(selectedNode.id)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center justify-center gap-1 border border-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Paralelo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStaff(selectedNode.id)}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-semibold flex items-center justify-center gap-1 border border-amber-200 col-span-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>+ Asesor / Staff Externo</span>
                    </button>
                  </div>

                  {nodos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="w-full mt-2 p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Cargo Seleccionado</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs">Seleccione un cargo en el árbol para editar sus propiedades.</p>
              </div>
            )}

            {/* BOTÓN INFERIOR DE GUARDAR */}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSaveAndClose}
                disabled={isGeneratingImage}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generando gráfico para PDF...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardar y Aplicar al Proyecto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
