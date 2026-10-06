import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, AlignLeft, Lightbulb, Compass, Calculator, LineChart, Palette, Eye, ArrowRight, ArrowLeft, CheckCircle, Save, CheckCircle2, AlertCircle, Sparkles, Trash2, RotateCcw, BookmarkCheck
} from 'lucide-react';

import { ProjectData } from './types/project';
import { sampleProject, emptyProjectData } from './data/sampleProject';
import { validateSection, validateAllSections } from './utils/validation';

import { Header } from './components/Header';
import { PortadaForm } from './components/forms/PortadaForm';
import { CompromisosForm } from './components/forms/CompromisosForm';
import { ContenidoForm } from './components/forms/ContenidoForm';
import { IdeaNegocioForm } from './components/forms/IdeaNegocioForm';
import { UnidadIForm } from './components/forms/UnidadIForm';
import { UnidadIIForm } from './components/forms/UnidadIIForm';
import { UnidadIIIForm } from './components/forms/UnidadIIIForm';
import { DesignSettingsForm } from './components/forms/DesignSettingsForm';
import { PDFPreviewer } from './components/PDFPreviewer';
import { ValidationAlertBanner } from './components/ValidationAlertBanner';
import { ConfirmModal, ConfirmModalConfig } from './components/ConfirmModal';

export default function App() {
  // Main Project State initialized with sample data so user immediately sees a populated working guide
  const [projectData, setProjectData] = useState<ProjectData>(() => {
    const saved = localStorage.getItem('cun_project_data_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved project data', e);
      }
    }
    return sampleProject;
  });

  const [activeTab, setActiveTab] = useState<string>('portada');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [saveNotification, setSaveNotification] = useState<boolean>(false);
  const [showValidationAlert, setShowValidationAlert] = useState<boolean>(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);

  // Auto-save active form data to localStorage
  useEffect(() => {
    localStorage.setItem('cun_project_data_v2', JSON.stringify(projectData));
    setSaveNotification(true);
    const timer = setTimeout(() => setSaveNotification(false), 2000);
    return () => clearTimeout(timer);
  }, [projectData]);

  // Sync initial custom sample with current form data if not yet set
  useEffect(() => {
    if (!localStorage.getItem('cun_custom_sample_v2')) {
      localStorage.setItem('cun_custom_sample_v2', JSON.stringify(projectData));
    }
  }, []);

  // Helper to get active sample data (customized or default)
  const getActiveSample = (): ProjectData => {
    try {
      const customSaved = localStorage.getItem('cun_custom_sample_v2');
      if (customSaved) {
        const parsed = JSON.parse(customSaved);
        if (parsed && parsed.portada) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse custom sample data', e);
    }
    return sampleProject;
  };

  // Reemplazar la información de "Cargar Ejemplo" con la información actualmente contenida en el formulario
  const handleSaveCurrentAsSample = async () => {
    try {
      localStorage.setItem('cun_custom_sample_v2', JSON.stringify(projectData));
      
      // Intentar también guardar en el servidor
      try {
        await fetch('/api/save-sample', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
      } catch (err) {
        console.warn('Servidor no disponible, guardado en almacenamiento local del navegador:', err);
      }

      setActionToast('¡La información actual del formulario ha reemplazado al ejemplo con éxito!');
      setTimeout(() => setActionToast(null), 4000);
    } catch (e) {
      console.error('Error al guardar el formulario como ejemplo:', e);
      alert('Error al guardar el formulario como ejemplo.');
    }
  };

  const handleLoadSample = () => {
    const activeSample = getActiveSample();
    const projectName = activeSample.portada.nombreTrabajo || 'Proyecto CUN';

    setConfirmModal({
      isOpen: true,
      type: 'sample',
      title: 'Cargar Información de Ejemplo',
      message: `¿Desea cargar la información de ejemplo (${projectName})? Se actualizarán los campos del formulario con la información establecida como ejemplo.`,
      confirmText: 'Cargar Datos de Ejemplo',
      confirmStyle: 'emerald',
      secondaryAction: {
        label: 'Reemplazar Ejemplo con Formulario Actual',
        onClick: () => {
          handleSaveCurrentAsSample();
        },
      },
      onConfirm: () => {
        setProjectData(activeSample);
        setShowValidationAlert(false);
        setActionToast('¡Información de ejemplo cargada con éxito!');
        setTimeout(() => setActionToast(null), 3500);
      },
    });
  };

  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      type: 'clear',
      title: 'Limpiar Formulario Completo',
      message: '¿Está seguro de vaciar por completo la información del formulario? Todos los campos de las 8 secciones quedarán completamente vacíos.',
      confirmText: 'Sí, Limpiar Formulario',
      confirmStyle: 'rose',
      onConfirm: () => {
        setProjectData(emptyProjectData);
        setShowValidationAlert(false);
        setActionToast('Se ha limpiado la totalidad del formulario.');
        setTimeout(() => setActionToast(null), 3500);
      },
    });
  };

  const tabs = [
    { id: 'portada', label: '1. Portada', icon: FileText },
    { id: 'compromisos', label: '2. Compromisos', icon: ShieldCheck },
    { id: 'contenido', label: '3. Contenido', icon: AlignLeft },
    { id: 'idea', label: '4. Idea Negocio', icon: Lightbulb },
    { id: 'unidad1', label: '5. Unidad I', icon: Compass },
    { id: 'unidad2', label: '6. Unidad II', icon: Calculator },
    { id: 'unidad3', label: '7. Unidad III', icon: LineChart },
    { id: 'diseno', label: '8. Plantilla PDF', icon: Palette },
  ];

  const currentTabIdx = tabs.findIndex((t) => t.id === activeTab);

  // Section validation states
  const allValidations = validateAllSections(projectData);
  const currentValidation = validateSection(activeTab, projectData);

  const handleSelectTab = (targetTabId: string) => {
    const targetIdx = tabs.findIndex((t) => t.id === targetTabId);
    // If trying to advance forward, check current section
    if (targetIdx > currentTabIdx) {
      const val = validateSection(activeTab, projectData);
      if (!val.isValid) {
        setShowValidationAlert(true);
        return;
      }
    }
    setShowValidationAlert(false);
    setActiveTab(targetTabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextTab = () => {
    const val = validateSection(activeTab, projectData);
    if (!val.isValid) {
      setShowValidationAlert(true);
      return;
    }

    if (currentTabIdx < tabs.length - 1) {
      setShowValidationAlert(false);
      setActiveTab(tabs[currentTabIdx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleForceNextTab = () => {
    if (currentTabIdx < tabs.length - 1) {
      setShowValidationAlert(false);
      setActiveTab(tabs[currentTabIdx + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevTab = () => {
    setShowValidationAlert(false);
    if (currentTabIdx > 0) {
      setActiveTab(tabs[currentTabIdx - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col antialiased">
      
      {/* Navigation Header */}
      <Header
        projectData={projectData}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onResetToSample={handleLoadSample}
        onLoadSample={handleLoadSample}
        onSaveAsSample={handleSaveCurrentAsSample}
        onClear={handleClearAll}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onImportData={(data) => setProjectData(data)}
        currentStepIndex={currentTabIdx}
        totalSteps={tabs.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tabVal = allValidations[tab.id];
            const isValid = tabVal?.isValid;

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isValid ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`} />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400' : 'bg-amber-500'}`}
                    title={`${tabVal?.errors.length || 0} campos pendientes`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Visual Progress Bar Section at the Top of Form Container */}
          <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200/80 p-4 sm:px-8 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-900 text-white font-black text-xs shadow-xs">
                  {currentTabIdx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Avance por Pestaña
                    </span>
                    <span className="text-[11px] font-semibold text-blue-800 bg-blue-100/90 px-2.5 py-0.5 rounded-full border border-blue-200/70">
                      Paso {currentTabIdx + 1} de {tabs.length}
                    </span>
                    {currentValidation.isValid ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Sección Completa
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        {currentValidation.errors.length} pendientes
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Sección activa: <span className="font-bold text-slate-800">{tabs[currentTabIdx].label}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                  title="Cargar información completa de ejemplo para probar el sistema"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Cargar Ejemplo</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveCurrentAsSample}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                  title="Reemplazar la información de 'Cargar Ejemplo' con la información actualmente contenida en el formulario"
                >
                  <BookmarkCheck className="w-3 h-3 text-cyan-600" />
                  <span>Guardar como Ejemplo</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                  title="Vaciar por completo la información de todos los formularios"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Limpiar Todo</span>
                </button>

                <span className="text-xs font-bold text-slate-500 ml-1">Progreso:</span>
                <span className="text-xs font-black text-blue-950 bg-amber-400/30 text-amber-950 border border-amber-300 px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  {Math.round(((currentTabIdx + 1) / tabs.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Visual Progress Track */}
            <div className="relative w-full bg-slate-200/90 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-900 via-blue-700 to-amber-500 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${Math.round(((currentTabIdx + 1) / tabs.length) * 100)}%` }}
              />
            </div>

            {/* Interactive Step Quick Links */}
            <div className="hidden lg:flex justify-between items-center mt-2.5 px-0.5">
              {tabs.map((tab, idx) => {
                const isPassed = idx < currentTabIdx;
                const isCurrent = idx === currentTabIdx;
                const tabVal = allValidations[tab.id];

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectTab(tab.id)}
                    className={`text-[10px] font-bold transition-all flex items-center gap-1 px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'text-blue-900 bg-blue-100/80 border border-blue-200/80'
                        : isPassed
                        ? 'text-emerald-700 hover:text-emerald-900'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>{idx + 1}.</span>
                    <span className="truncate max-w-[85px]">{tab.label.replace(/^\d+\.\s*/, '')}</span>
                    {tabVal?.isValid ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 sm:p-8">

          {/* Validation Warning Alert Banner if active section is incomplete and user tried to advance */}
          {showValidationAlert && !currentValidation.isValid && (
            <ValidationAlertBanner
              validationResult={currentValidation}
              onClose={() => setShowValidationAlert(false)}
              onOverrideNav={handleForceNextTab}
            />
          )}
          
          {/* Section Header Banner */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Guía de Entrega Final v2 CUN
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {activeTab === 'portada' && 'Datos de Portada Institucional CUN'}
                {activeTab === 'compromisos' && 'Compromisos de Autor y Autenticidad Académica'}
                {activeTab === 'contenido' && 'Introducción, Objetivos, Claves de Éxito y Resumen'}
                {activeTab === 'idea' && '0. Descripción de la Idea de Negocio y Portafolio'}
                {activeTab === 'unidad1' && 'Unidad Estratégica I: Direccionamiento Estratégico y Marco Legal'}
                {activeTab === 'unidad2' && 'Unidad Estratégica II: Modelo Financiero e Inversión Inicial'}
                {activeTab === 'unidad3' && 'Unidad Estratégica III: Estados Financieros, VPN, TIR y Conclusiones'}
                {activeTab === 'diseno' && 'Personalización de Plantilla y Formato PDF'}
              </h2>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {saveNotification && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 transition-all">
                  <Save className="w-3.5 h-3.5" /> Auto-guardado
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg transition-all shadow-sm"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Vista Previa PDF</span>
              </button>
            </div>
          </div>

          {/* Render Active Form Component */}
          {activeTab === 'portada' && (
            <PortadaForm
              data={projectData.portada}
              onChange={(updated) => setProjectData({ ...projectData, portada: updated })}
            />
          )}

          {activeTab === 'compromisos' && (
            <CompromisosForm
              data={projectData.compromisosAutor}
              onChange={(updated) => setProjectData({ ...projectData, compromisosAutor: updated })}
            />
          )}

          {activeTab === 'contenido' && (
            <ContenidoForm
              data={projectData.contenidoTrabajo}
              companyName={projectData.portada.nombreTrabajo}
              onChange={(updated) => setProjectData({ ...projectData, contenidoTrabajo: updated })}
            />
          )}

          {activeTab === 'idea' && (
            <IdeaNegocioForm
              data={projectData.ideaNegocio}
              companyName={projectData.portada.nombreTrabajo}
              onChange={(updated) => setProjectData({ ...projectData, ideaNegocio: updated })}
            />
          )}

          {activeTab === 'unidad1' && (
            <UnidadIForm
              data={projectData.unidadI}
              companyName={projectData.portada.nombreTrabajo}
              onChange={(updated) => setProjectData({ ...projectData, unidadI: updated })}
            />
          )}

          {activeTab === 'unidad2' && (
            <UnidadIIForm
              data={projectData.unidadII}
              onChange={(updated) => setProjectData({ ...projectData, unidadII: updated })}
            />
          )}

          {activeTab === 'unidad3' && (
            <UnidadIIIForm
              data={projectData.unidadIII}
              companyName={projectData.portada.nombreTrabajo}
              onChange={(updated) => setProjectData({ ...projectData, unidadIII: updated })}
            />
          )}

          {activeTab === 'diseno' && (
            <DesignSettingsForm
              data={projectData.designConfig}
              onChange={(updated) => setProjectData({ ...projectData, designConfig: updated })}
            />
          )}

          {/* Form Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
            <button
              type="button"
              onClick={handlePrevTab}
              disabled={currentTabIdx === 0}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Paso {currentTabIdx + 1} de {tabs.length}
            </span>

            {currentTabIdx < tabs.length - 1 ? (
              <button
                type="button"
                onClick={handleNextTab}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <span>Siguiente Sección</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Ver y Descargar PDF Final</span>
              </button>
            )}
          </div>

          </div>

        </div>

      </main>

      {/* PDF Modal Previewer */}
      <PDFPreviewer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        projectData={projectData}
        onChangeDesign={(updated) => setProjectData({ ...projectData, designConfig: updated })}
      />

      {/* Toast Notification for Load Sample / Clear Actions */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        config={confirmModal}
        onClose={() => setConfirmModal(null)}
      />

    </div>
  );
}
