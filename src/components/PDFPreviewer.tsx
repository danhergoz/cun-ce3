import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  X,
  ShieldCheck,
  Loader2,
  LayoutTemplate,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProjectData } from '../types/project';
import {
  formatCurrencyCOP,
  calculateInversionTotal,
  calculateFinanciacionTotal,
  calculateGastosFijosMensuales,
} from '../utils/helpers';
import { generateVectorPDF } from '../utils/vectorPdfGenerator';
import { OrganigramaViewer } from './organigrama/OrganigramaViewer';
import { DEFAULT_ORGANIGRAMA_NODOS } from './organigrama/organigramaTemplates';
import { generateOrganigramaImage } from './organigrama/organigramaCanvasGenerator';

interface PDFPreviewerProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: ProjectData;
  onChangeDesign?: (updated: ProjectData['designConfig']) => void;
}

const TEMPLATE_META: Record<
  ProjectData['designConfig']['templateId'],
  { label: string; subtitle: string; defaultColor: string }
> = {
  'cun-oficial': {
    label: 'Institucional Académico',
    subtitle: 'Estilo Institucional Oficial CUN',
    defaultColor: '#003366',
  },
  'ejecutivo-moderno': {
    label: 'Ejecutivo Corporativo',
    subtitle: 'Estilo Ejecutivo para Negocios',
    defaultColor: '#1e293b',
  },
  'innovacion-startup': {
    label: 'Innovación & Sostenibilidad',
    subtitle: 'Estilo Emprendimiento Sostenible',
    defaultColor: '#0f766e',
  },
  'minimalista-elegante': {
    label: 'Minimalista Editorial',
    subtitle: 'Estilo Editorial de Alto Contraste',
    defaultColor: '#0f172a',
  },
  'cun-opcion-6': {
    label: 'Formato Modular',
    subtitle: 'Estilo Modular con Franja Institucional',
    defaultColor: '#115e59',
  },
  'cun-opcion-7': {
    label: 'Dossier Ejecutivo',
    subtitle: 'Estilo Dossier de Alta Dirección',
    defaultColor: '#1e3a8a',
  },
};

const PAGE_SECTIONS = [
  { page: 1, code: 'SEC-01', title: 'Portada Institucional' },
  { page: 2, code: 'SEC-02', title: 'Compromisos de Autor y Firmas' },
  { page: 3, code: 'SEC-03', title: 'Índice / Tabla de Contenido' },
  { page: 4, code: 'SEC-04', title: 'Contenido del Trabajo (Introducción y Objetivos)' },
  { page: 5, code: 'SEC-04B', title: 'Contenido: Resumen Ejecutivo y Video Pitch' },
  { page: 6, code: 'SEC-05', title: '0. Idea de Negocio (Descripción y Mercado)' },
  { page: 7, code: 'SEC-05B', title: '0. Portafolio de Productos y Servicios (con Fotos)' },
  { page: 8, code: 'SEC-06', title: 'Unidad Estratégica I: Direccionamiento y Cadena de Valor' },
  { page: 9, code: 'SEC-07A', title: 'Unidad Estratégica I: Estructura Organizacional y Organigrama' },
  { page: 10, code: 'SEC-07B', title: 'Unidad Estratégica I: Perfiles de Cargos y Estudio Legal' },
  { page: 11, code: 'SEC-08', title: 'Unidad Estratégica II: Inversión Inicial y Financiación' },
  { page: 12, code: 'SEC-09', title: 'Unidad Estratégica II: Costos, Gastos y Punto de Equilibrio' },
  { page: 13, code: 'SEC-10', title: 'Unidad Estratégica III: Estados e Indicadores Financieros' },
  { page: 14, code: 'SEC-11', title: 'Conclusiones, Recomendaciones y Bibliografía' },
];

export const PDFPreviewer: React.FC<PDFPreviewerProps> = ({
  isOpen,
  onClose,
  projectData,
  onChangeDesign,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [progressPage, setProgressPage] = useState<number>(0);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const {
    portada,
    compromisosAutor,
    contenidoTrabajo,
    ideaNegocio,
    unidadI,
    unidadII,
    unidadIII,
    designConfig,
  } = projectData;

  const templateId = designConfig.templateId || 'cun-oficial';
  const currentMeta = TEMPLATE_META[templateId] || TEMPLATE_META['cun-oficial'];
  const primaryColor = designConfig.primaryColor || currentMeta.defaultColor;
  const totalPages = PAGE_SECTIONS.length;

  const organigramaNodos = unidadI.organigrama?.nodos && unidadI.organigrama.nodos.length > 0
    ? unidadI.organigrama.nodos
    : DEFAULT_ORGANIGRAMA_NODOS;

  const organigramaDisplayUrl =
    (unidadI.organigrama?.nodos && unidadI.organigrama.nodos.length > 0)
      ? generateOrganigramaImage(
          unidadI.organigrama.nodos,
          unidadI.organigrama?.tipoEstructura || 'Estructura Funcional por Procesos',
          portada.nombreTrabajo || 'EcoPack Solutions S.A.S.'
        )
      : (unidadI.organigrama?.imagenUrl || generateOrganigramaImage(
          DEFAULT_ORGANIGRAMA_NODOS,
          unidadI.organigrama?.tipoEstructura || 'Estructura Funcional por Procesos',
          portada.nombreTrabajo || 'EcoPack Solutions S.A.S.'
        ));

  const fontFamilyClass =
    designConfig.fontFamily === 'serif'
      ? 'font-serif'
      : designConfig.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Descarga de PDF 100% Vectorial en Tamaño Carta (Letter) bajo Normas APA (< 5 MB)
  const handleDownloadPDF = async () => {
    setDownloading(true);
    setErrorBanner(null);
    setProgressPage(1);

    try {
      await generateVectorPDF(projectData, (page) => {
        setProgressPage(page);
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error) {
      console.error('Error al generar el PDF vectorial:', error);
      setErrorBanner(
        'Hubo un inconveniente al generar el PDF. Puede utilizar el botón "Imprimir / Guardar PDF" de al lado.'
      );
    } finally {
      setDownloading(false);
      setProgressPage(0);
    }
  };

  // Acceso directo a la interfaz nativa de impresión del sistema con documento Tamaño Carta (Letter)
  const handleNativePrint = () => {
    if (!printRef.current) {
      window.focus();
      window.print();
      return;
    }

    setPrinting(true);
    setErrorBanner(null);

    try {
      const existingFrame = document.getElementById('cun-system-print-frame');
      if (existingFrame) {
        existingFrame.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'cun-system-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow?.document;
      if (!frameDoc || !iframe.contentWindow) {
        window.focus();
        window.print();
        setPrinting(false);
        return;
      }

      // Recolectar hojas de estilo activas del documento principal
      const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('\n');

      const docTitle = `${portada.nombreTrabajo || 'Proyecto_CUN'}_${currentMeta.label}_Carta_APA`;

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <title>${docTitle}</title>
            ${styleNodes}
            <style>
              @page {
                size: letter portrait;
                margin: 0;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #0f172a !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              .pdf-page-wrapper {
                margin: 0 !important;
                padding: 0 !important;
                max-width: none !important;
              }
              .pdf-page-sheet {
                width: 21.59cm !important;
                min-height: 27.94cm !important;
                padding: 2.54cm !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
                box-shadow: none !important;
                page-break-after: always !important;
                break-after: page !important;
                page-break-inside: avoid !important;
              }
              .pdf-page-sheet:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
          </body>
        </html>
      `);
      frameDoc.close();

      const triggerPrint = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.focus();
          window.print();
        } finally {
          setPrinting(false);
        }
      };

      // Esperar brevemente para que estilos e imágenes estén listos antes de abrir el diálogo del sistema
      setTimeout(triggerPrint, 350);
    } catch (err) {
      console.error('Fallback a window.print():', err);
      setPrinting(false);
      window.focus();
      window.print();
    }
  };

  const scrollToPage = (pageNum: number) => {
    const el = printRef.current?.querySelector(`[data-pdf-page="${pageNum}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper: Encabezado de página limpio (sin nombres ni características de plantillas)
  const renderSheetHeader = (pageNumber: number, sectionCode: string, sectionTitle: string) => {
    if (templateId === 'cun-opcion-6') {
      return (
        <div className="mb-4 flex items-stretch rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
          <div
            className="px-3 py-2 text-white flex flex-col justify-center items-center shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-[8px] uppercase tracking-widest opacity-80 font-bold">SECCIÓN</span>
            <span className="text-xs font-black leading-none mt-0.5">
              {String(pageNumber).padStart(2, '0')}
            </span>
          </div>
          <div className="flex-1 bg-slate-50 px-3.5 py-1.5 flex items-center justify-between border-r border-slate-200">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: primaryColor }}>
                {sectionTitle}
              </div>
              <div className="text-[9px] text-slate-500 font-medium truncate max-w-[360px]">
                {portada.nombreTrabajo || 'Proyecto de Creación de Empresas'}
              </div>
            </div>
            {designConfig.mostrarNumeroPagina && (
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">{pageNumber}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (templateId === 'cun-opcion-7') {
      return (
        <div
          className="mb-4 rounded-xl p-3 text-white flex items-center justify-between shadow-xs"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center font-black text-xs">
              {String(pageNumber).padStart(2, '0')}
            </div>
            <div>
              <div className="text-[8px] uppercase tracking-widest text-amber-300 font-bold">
                {sectionCode}
              </div>
              <div className="text-[11px] font-extrabold tracking-wide uppercase">{sectionTitle}</div>
            </div>
          </div>
          <div className="text-right text-[10px]">
            {designConfig.mostrarNumeroPagina && (
              <div className="font-black text-xs text-white">Pág. {pageNumber}</div>
            )}
            <div className="text-white/75 text-[9px] font-medium">de {totalPages}</div>
          </div>
        </div>
      );
    }

    // Plantillas CUN Opción 1, 2, 3 y 4: Encabezado institucional limpio
    return (
      <div
        className={`mb-4 flex justify-between items-center pb-2 ${
          templateId === 'ejecutivo-moderno'
            ? 'border-l-4 pl-3 bg-slate-50 py-1.5 pr-2 border-b border-slate-200'
            : templateId === 'minimalista-elegante'
            ? 'border-b border-slate-900'
            : 'border-b-2'
        }`}
        style={{
          borderColor: templateId === 'minimalista-elegante' ? '#0f172a' : primaryColor,
          borderLeftColor: templateId === 'ejecutivo-moderno' ? primaryColor : undefined,
        }}
      >
        <div className="text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
            {(portada.nombreTrabajo || 'PROYECTO DE CREACIÓN DE EMPRESAS').slice(0, 60)}
          </span>
          <span className="text-[9px] font-semibold" style={{ color: primaryColor }}>
            {sectionTitle}
          </span>
        </div>
        {designConfig.mostrarNumeroPagina && (
          <div className="text-right pl-4">
            <span className="text-xs font-black text-slate-900">{pageNumber}</span>
          </div>
        )}
      </div>
    );
  };

  // Helper: Nivel 1 de Título
  const renderSectionHeading = (title: string, subtitle?: string) => {
    if (templateId === 'cun-opcion-6') {
      return (
        <div
          className="px-3 py-1.5 rounded-lg border-l-4 flex items-center justify-between"
          style={{
            borderLeftColor: primaryColor,
            backgroundColor: `${primaryColor}12`,
          }}
        >
          <h2 className="text-xs font-black uppercase tracking-wide" style={{ color: primaryColor }}>
            {title}
          </h2>
          {subtitle && <span className="text-[10px] font-bold text-slate-600">{subtitle}</span>}
        </div>
      );
    }

    // Nivel 1: Centrado y en Negrita
    return (
      <div className="border-b pb-2 text-center" style={{ borderColor: `${primaryColor}50` }}>
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && (
          <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 block mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    );
  };

  // Helper: Pie de página institucional limpio
  const renderSheetFooter = (pageNumber: number, sectionTitle: string) => {
    return (
      <div className="mt-auto pt-2.5 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500">
        <span className="font-medium truncate max-w-[320px]">
          {portada.institucion || 'Corporación Unificada Nacional de Educación Superior (CUN)'}
        </span>
        {designConfig.mostrarNumeroPagina && (
          <span className="font-bold" style={{ color: primaryColor }}>
            Pág. {pageNumber} de {totalPages}
          </span>
        )}
      </div>
    );
  };

  // Wrapper de hoja con separador visual limpio
  const renderPageWrapper = (
    pageNumber: number,
    sectionCode: string,
    sectionTitle: string,
    children: React.ReactNode
  ) => {
    const isOpcion6 = templateId === 'cun-opcion-6';

    return (
      <div key={pageNumber} className="pdf-page-wrapper w-full max-w-[816px] mx-auto mb-10 last:mb-2">
        {/* Separador visual de corte de página en el visor */}
        <div className="no-print flex items-center justify-between bg-slate-800/95 border border-slate-700 text-slate-200 px-4 py-2 rounded-t-xl text-[11px] font-bold tracking-wide shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-black text-white"
              style={{ backgroundColor: primaryColor }}
            >
              PÁGINA {pageNumber} DE {totalPages}
            </span>
            <span className="text-amber-300 font-extrabold">{sectionCode}:</span>
            <span className="text-white truncate max-w-[360px]">{sectionTitle}</span>
          </div>
        </div>

        {/* Hoja Tamaño Carta exacta */}
        <div
          data-pdf-page={pageNumber}
          className={`pdf-page-sheet w-full bg-white text-slate-900 shadow-2xl ${fontFamilyClass} text-[11px] leading-[1.75] flex flex-col justify-between relative overflow-hidden border border-slate-300`}
          style={{
            width: '100%',
            maxWidth: '21.59cm',
            minHeight: '27.94cm',
            padding: '2.54cm',
            boxSizing: 'border-box',
          }}
        >
          {/* Franja vertical lateral izquierda para CUN Opción 6 */}
          {isOpcion6 && (
            <div
              className="absolute left-0 top-0 bottom-0 w-3"
              style={{ backgroundColor: primaryColor }}
            />
          )}

          <div className="flex-1 flex flex-col">
            {renderSheetHeader(pageNumber, sectionCode, sectionTitle)}
            <div className="flex-1 space-y-4">{children}</div>
          </div>

          {renderSheetFooter(pageNumber, sectionTitle)}
        </div>
      </div>
    );
  };

  // Calculations for Unidad II
  const totalInversion = calculateInversionTotal(unidadII);
  const totalFinanciacion = calculateFinanciacionTotal(unidadII.financiacion);
  const totalGastosFijos = calculateGastosFijosMensuales(unidadII.gastosFijos);

  return (
    <div className="pdf-modal-root fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md overflow-hidden">
      {/* Top Floating Control Bar */}
      <div className="no-print bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 text-white flex flex-col gap-2.5 shrink-0 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-inner border border-white/20"
              style={{ backgroundColor: primaryColor }}
            >
              CUN
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white">Vista Previa Formato Carta (Normas APA)</h2>
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {currentMeta.label}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Vectorial (&lt; 5 MB)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Papel Carta (21.59 × 27.94 cm) • Márgenes APA 2.54 cm • Sangría 1.27 cm • {totalPages} Secciones
              </p>
            </div>
          </div>

          {/* Template Quick Switcher (CUN Opción 1 - 7) */}
          {onChangeDesign && (
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1">
              <LayoutTemplate className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-300 hidden md:inline">Plantilla:</span>
              <select
                value={templateId}
                onChange={(e) => {
                  const newId = e.target.value as ProjectData['designConfig']['templateId'];
                  const meta = TEMPLATE_META[newId];
                  onChangeDesign({
                    ...designConfig,
                    templateId: newId,
                    primaryColor: meta ? meta.defaultColor : designConfig.primaryColor,
                  });
                }}
                className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded border border-slate-700 outline-none cursor-pointer"
              >
                {Object.entries(TEMPLATE_META).map(([id, meta]) => (
                  <option key={id} value={id}>
                    {meta.label} — {meta.subtitle}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleNativePrint}
              disabled={printing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              title="Abrir la interfaz de impresión del sistema (Tamaño Carta)"
            >
              {printing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Abriendo Impresión...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimir / Guardar PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-lg shadow-md transition-all disabled:opacity-50 cursor-pointer"
              title="Descargar archivo PDF en formato vectorial ligero (< 5 MB) y tamaño Carta"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    Vectorizando Pág. {progressPage}/{totalPages}...
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF Vectorial</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Section Page Jump Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none border-t border-slate-800/80 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-400" /> Ir a Sección (Carta):
          </span>
          {PAGE_SECTIONS.map((s) => (
            <button
              key={s.page}
              type="button"
              onClick={() => scrollToPage(s.page)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-semibold whitespace-nowrap border border-slate-700/80 transition-colors cursor-pointer"
              title={s.title}
            >
              Pág. {s.page}: {s.title.split(':')[0]}
            </button>
          ))}
        </div>

        {errorBanner && (
          <div className="bg-amber-500/20 border border-amber-400/50 text-amber-200 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between">
            <span>{errorBanner}</span>
            <button onClick={() => setErrorBanner(null)} className="text-amber-200 hover:text-white font-bold ml-4">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Printable Multi-Page Sheet Viewport (Letter Format) */}
      <div className="pdf-modal-viewport flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-900/90">
        <div ref={printRef} className="printable-document-container">
          {/* =====================================================================
              PÁGINA 1: PORTADA INSTITUCIONAL (PAUTAS NORMAS APA 7ª ED. - TAMAÑO CARTA)
          ===================================================================== */}
          {renderPageWrapper(
            1,
            'SEC-01',
            'Portada Institucional',
            <div className="flex-1 flex flex-col justify-between min-h-[780px] text-center">
              <div className="pt-4 space-y-2">
                <span
                  className="inline-block text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border"
                  style={{
                    color: primaryColor,
                    borderColor: `${primaryColor}40`,
                    backgroundColor: `${primaryColor}10`,
                  }}
                >
                  PROYECTO DE CREACIÓN DE EMPRESAS
                </span>
              </div>

              {/* Bloque Central en orden estricto de Portada de Estudiantes Normas APA 7ª edición */}
              <div className="my-auto space-y-5 px-4">
                {/* 1. Título del Trabajo en Negrita Centrado */}
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {portada.nombreTrabajo || 'Nombre del Proyecto Empresarial'}
                </h1>

                <div className="w-16 h-1 mx-auto rounded" style={{ backgroundColor: primaryColor }} />

                {/* 2. Autores (Integrantes) */}
                <div className="space-y-1 pt-2">
                  {portada.integrantes.map((int, i) => (
                    <div key={i} className="font-bold text-slate-900 text-xs">
                      {int.nombre || `Estudiante #${i + 1}`}
                    </div>
                  ))}
                </div>

                {/* 3. Afiliación: Facultad, Carrera e Institución (CUN) */}
                <div className="space-y-1 text-xs text-slate-700 pt-2">
                  <div>
                    {Array.from(new Set(portada.integrantes.map((i) => i.facultad).filter(Boolean))).join(' / ') ||
                      'Facultad de Ciencias Administrativas'}
                  </div>
                  <div>
                    {Array.from(new Set(portada.integrantes.map((i) => i.carrera).filter(Boolean))).join(' — ') ||
                      'Programa Académico'}
                  </div>
                  <div className="font-bold" style={{ color: primaryColor }}>
                    {portada.institucion || 'Corporación Unificada Nacional de Educación Superior (CUN)'}
                  </div>
                </div>

                {/* 4. Asignatura y Docente */}
                <div className="space-y-1 text-xs text-slate-800 pt-2">
                  <div className="font-bold">{portada.materia || 'Creación de Empresas III'}</div>
                  <div>Docente Director: {portada.docente || 'Nombre del Docente'}</div>
                </div>
              </div>

              {/* Tabla APA 1: Integrantes del Equipo */}
              <div className="text-left space-y-1.5">
                <div className="text-[11px]">
                  <span className="font-bold text-slate-900 block">Tabla 1</span>
                  <span className="italic text-slate-700">Integrantes del Equipo de Trabajo Académico</span>
                </div>
                <table className="w-full text-[10px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-slate-900 bg-slate-50">
                      <th className="py-1.5 px-2 text-left">Nombre Completo del Estudiante</th>
                      <th className="py-1.5 px-2 text-left">Programa Académico</th>
                      <th className="py-1.5 px-2 text-left">Escuela</th>
                      <th className="py-1.5 px-2 text-center">Grupo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portada.integrantes.map((int, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="py-1.5 px-2 font-semibold text-slate-900">
                          {int.nombre || `Estudiante #${i + 1}`}
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">{int.carrera || '---'}</td>
                        <td className="py-1.5 px-2 text-slate-700">{int.facultad || '---'}</td>
                        <td className="py-1.5 px-2 text-center font-semibold">{int.grupo || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 5. Ciudad y Fecha al pie de la Portada APA */}
              <div className="pt-4 text-center text-xs font-bold text-slate-800">
                {portada.ciudad || 'Bogotá D.C., Colombia'} — {portada.ano || new Date().getFullYear()}
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 2: COMPROMISOS DE AUTOR Y FIRMAS DIGITALES
          ===================================================================== */}
          {renderPageWrapper(
            2,
            'SEC-02',
            'Compromisos de Autor',
            <div className="space-y-4">
              {renderSectionHeading('Compromisos de Autor y Declaración de Autenticidad', 'Sección 2')}

              <p className="indent-[1.27cm] text-slate-800 text-left">
                Nosotros, identificados como aparece al pie de nuestras firmas, manifestamos la titularidad y autoría
                académica del presente proyecto empresarial desarrollado en el marco de la Corporación Unificada Nacional
                de Educación Superior (CUN):
              </p>

              {/* Tabla APA 2 */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 2</span>
                  <span className="italic text-slate-700">Identificación Oficial de los Autores del Proyecto</span>
                </div>
                <table className="w-full text-[10px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-2 px-2.5">Nombre Completo</th>
                      <th className="py-2 px-2.5">Programa Académico</th>
                      <th className="py-2 px-2.5">No. de Identificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compromisosAutor.autores.map((autor, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-2 px-2.5 font-bold text-slate-900">{autor.nombreCompleto || '---'}</td>
                        <td className="py-2 px-2.5 text-slate-700">{autor.programaAcademico || '---'}</td>
                        <td className="py-2 px-2.5 font-mono font-semibold text-slate-800">
                          {autor.identificacion || '---'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Declaración Legal con Sangría APA */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-xs text-slate-900">
                  Declaración de Responsabilidad y Propiedad Intelectual
                </h3>
                <div
                  className="p-3.5 bg-slate-50 border-l-4 border border-slate-300 rounded-r-lg text-slate-800 space-y-2"
                  style={{ borderLeftColor: primaryColor }}
                >
                  <p className="indent-[1.27cm] text-left">
                    Asiento (mos) y doy fe que el contenido del presente documento es un reflejo de mi trabajo personal
                    y el de mis compañeros de proyecto (si aplica) y se pone de manifiesto que, ante cualquier
                    notificación relacionada a la presunción de plagio académico, copia o falta a la fuente original,
                    soy (somos) responsable directo legal, económico y administrativo sin afectar al director del
                    trabajo, a la Universidad y a cuantas instituciones han colaborado en dicho trabajo, asumiendo las
                    consecuencias derivadas de tales prácticas.
                  </p>
                  <p className="font-bold text-emerald-800 flex items-center gap-1.5 text-[10px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Estado de declaratoria académica:{' '}
                      {compromisosAutor.declaracionAceptada
                        ? 'ACEPTADA Y FIRMADA CONFORMEMENTE'
                        : 'PENDIENTE DE ACEPTACIÓN'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Firmas Digitales */}
              {designConfig.incluirFirmasDigitales && (
                <div className="pt-2 space-y-2">
                  <h3 className="font-bold text-xs text-slate-900">Registro de Firmas de los Autores</h3>
                  <div className="grid grid-cols-2 gap-3.5">
                    {compromisosAutor.autores.map((autor, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-slate-300 rounded-lg bg-slate-50/70 text-center space-y-1.5"
                      >
                        <div className="h-14 flex items-center justify-center bg-white rounded border border-dashed border-slate-200 p-1.5">
                          {autor.firmaImgUrl ? (
                            <img
                              src={autor.firmaImgUrl}
                              alt={`Firma ${autor.nombreCompleto}`}
                              className="max-h-12 max-w-[160px] object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Firma Digital Autorizada — {autor.nombreCompleto || `Autor #${idx + 1}`}
                            </span>
                          )}
                        </div>
                        <div className="border-t border-slate-400 pt-1 text-[10px]">
                          <span className="font-bold block text-slate-900">
                            {autor.nombreCompleto || `Autor #${idx + 1}`}
                          </span>
                          <span className="text-slate-600 block">{autor.programaAcademico}</span>
                          <span className="text-slate-500 font-mono">C.C. / ID: {autor.identificacion || '---'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              PÁGINA 3: ÍNDICE O TABLA DE CONTENIDO
          ===================================================================== */}
          {renderPageWrapper(
            3,
            'SEC-03',
            'Índice o Tabla de Contenido',
            <div className="space-y-4">
              {renderSectionHeading('Tabla de Contenido General del Proyecto', 'Sección 3')}

              <p className="indent-[1.27cm] text-slate-700">
                El presente documento se encuentra estructurado en las siguientes secciones temáticas e independientes:
              </p>

              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 3</span>
                  <span className="italic text-slate-700">Relación Paginada de Secciones y Unidades Estratégicas</span>
                </div>
                <table className="w-full text-[10px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-2 px-2 w-24">Sección</th>
                      <th className="py-2 px-2">Contenido Detallado del Proyecto</th>
                      <th className="py-2 px-2 w-20 text-right">Página</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['SEC-01', 'Portada Institucional y Datos del Equipo de Trabajo', 'Pág. 1'],
                      ['SEC-02', 'Compromisos de Autor, Declaración Antiplagio y Firmas Digitales', 'Pág. 2'],
                      ['SEC-03', 'Tabla de Contenido General Estructurada por Secciones', 'Pág. 3'],
                      ['SEC-04', 'Contenido: Introducción, Objetivos Generales y Específicos, y Claves de Éxito', 'Pág. 4'],
                      ['SEC-04B', 'Contenido: Resumen Ejecutivo y Enlace de Sustentación Video Pitch', 'Pág. 5'],
                      ['SEC-05', '0. Idea de Negocio: Descripción, Justificación y Oportunidad de Mercado', 'Pág. 6'],
                      ['SEC-05B', '0. Portafolio de Productos y Servicios (con Registro Fotográfico)', 'Pág. 7'],
                      ['SEC-06', 'Unidad Estratégica I: Direccionamiento Estratégico y Cadena de Valor', 'Pág. 8'],
                      ['SEC-07A', 'Unidad Estratégica I: Estructura Organizacional y Organigrama de la Empresa', 'Pág. 9'],
                      ['SEC-07B', 'Unidad Estratégica I: Perfiles de Cargos Directivos, Constitución y Marco Legal', 'Pág. 10'],
                      ['SEC-08', 'Unidad Estratégica II: Modelo Financiero, Inversión Inicial y Financiación', 'Pág. 11'],
                      ['SEC-09', 'Unidad Estratégica II: Costos Variables, Gastos Fijos y Punto de Equilibrio', 'Pág. 12'],
                      ['SEC-10', 'Unidad Estratégica III: Estados Financieros Proyectados, VPN, TIR e Indicadores', 'Pág. 13'],
                      ['SEC-11', 'Conclusiones, Recomendaciones Estratégicas y Referencias Bibliográficas', 'Pág. 14'],
                    ].map(([code, title, page], idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-2 px-2 font-mono font-bold" style={{ color: primaryColor }}>
                          {code}
                        </td>
                        <td className="py-2 px-2 font-medium text-slate-900">{title}</td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900">{page}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 4: CONTENIDO DEL TRABAJO (PARTE A: INTRODUCCIÓN Y OBJETIVOS)
          ===================================================================== */}
          {renderPageWrapper(
            4,
            'SEC-04',
            'Contenido del Trabajo: Introducción y Objetivos',
            <div className="space-y-4">
              {renderSectionHeading('Contenido del Trabajo: Introducción y Objetivos', 'Sección 4')}

              <div className="space-y-1.5">
                <h3 className="font-bold text-xs text-slate-900">1. Introducción</h3>
                <p className="indent-[1.27cm] text-slate-800 text-left whitespace-pre-wrap leading-relaxed">
                  {contenidoTrabajo.introduccion || 'Sin información registrada.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-xs text-slate-900">2.1. Objetivo General</h3>
                <p className="indent-[1.27cm] text-slate-800 text-left leading-relaxed">
                  {contenidoTrabajo.objetivoGeneral || 'Sin objetivo general registrado.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-xs text-slate-900">2.2. Objetivos Específicos</h3>
                <ol className="list-decimal list-inside space-y-1 text-slate-800 pl-3">
                  {contenidoTrabajo.objetivosEspecificos.map((obj, i) => (
                    <li key={i}>{obj || `Objetivo específico #${i + 1}`}</li>
                  ))}
                </ol>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-xs text-slate-900">3. Claves de Éxito Competitivo</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-800 pl-3">
                  {contenidoTrabajo.clavesExito.map((c, i) => (
                    <li key={i}>{c || '---'}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 5: CONTENIDO DEL TRABAJO (PARTE B: RESUMEN EJECUTIVO Y VIDEO PITCH)
          ===================================================================== */}
          {renderPageWrapper(
            5,
            'SEC-04B',
            'Contenido: Resumen Ejecutivo y Video Pitch',
            <div className="space-y-5">
              {renderSectionHeading('Contenido del Trabajo: Resumen Ejecutivo y Video Pitch', 'Sección 4 (Cont.)')}

              <div className="space-y-2">
                <h3 className="font-bold text-xs text-slate-900">4. Resumen Ejecutivo (Síntesis del Modelo de Negocio)</h3>
                <p className="indent-[1.27cm] text-slate-800 text-left whitespace-pre-wrap leading-relaxed">
                  {contenidoTrabajo.resumenEjecutivo || 'Sin resumen ejecutivo registrado.'}
                </p>
              </div>

              {/* 5. Video Pitch */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h3 className="font-bold text-xs text-slate-900">5. Video Pitch de Sustentación</h3>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  A continuación se presenta el enlace oficial para acceder a la grabación y sustentación ejecutiva del video pitch del proyecto:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-slate-800 block">Enlace de Sustentación:</span>
                    <a
                      href={contenidoTrabajo.videoPitch || 'https://www.youtube.com/watch?v=Bieyi5sGznM'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-mono text-[10.5px] truncate max-w-[420px] block mt-0.5"
                    >
                      {contenidoTrabajo.videoPitch || 'https://www.youtube.com/watch?v=Bieyi5sGznM'}
                    </a>
                  </div>
                  <a
                    href={contenidoTrabajo.videoPitch || 'https://www.youtube.com/watch?v=Bieyi5sGznM'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-print shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Ver Video
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 6: 0. IDEA DE NEGOCIO (DESCRIPCIÓN, JUSTIFICACIÓN Y MERCADO)
          ===================================================================== */}
          {renderPageWrapper(
            6,
            'SEC-05',
            '0. Idea de Negocio (Descripción y Mercado)',
            <div className="space-y-4">
              {renderSectionHeading('0. Estructuración de la Idea de Negocio y Oportunidad', 'Sección 5')}

              <div className="space-y-1.5">
                <h3 className="font-bold text-xs text-slate-900">0.1. Descripción de la Idea de Negocio</h3>
                <p className="indent-[1.27cm] text-slate-800 text-left whitespace-pre-wrap leading-relaxed">
                  {ideaNegocio.descripcion || 'Sin descripción registrada.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] pt-1">
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">0.2. Justificación</span>
                  <p className="text-slate-700 leading-relaxed">{ideaNegocio.justificacion || '---'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">0.3. Perfil del Cliente</span>
                  <p className="text-slate-700 leading-relaxed">{ideaNegocio.perfilCliente || '---'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-bold text-slate-900 block mb-1">0.4. Oportunidad de Mercado</span>
                  <p className="text-slate-700 leading-relaxed">{ideaNegocio.oportunidadMercado || '---'}</p>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 7: 0. PORTAFOLIO DE PRODUCTOS Y SERVICIOS (CON FOTOS)
          ===================================================================== */}
          {renderPageWrapper(
            7,
            'SEC-05B',
            '0. Portafolio de Productos y Servicios (con Fotos)',
            <div className="space-y-4">
              {renderSectionHeading('0.5. Portafolio de Productos y Servicios', 'Sección 5 (Cont.)')}

              {/* Tabla APA 4: Portafolio con Fotos Nítidas */}
              <div className="space-y-1.5">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 4</span>
                  <span className="italic text-slate-700">Portafolio Integral de Productos y Servicios con Registro Fotográfico</span>
                </div>
                <table className="w-full text-[10px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-2 px-2 w-16 text-center">Foto</th>
                      <th className="py-2 px-2">Producto / Servicio</th>
                      <th className="py-2 px-2 w-20">Tipo</th>
                      <th className="py-2 px-2">Descripción Técnica y Especificaciones</th>
                      <th className="py-2 px-2 w-24 text-right">Precio ($ COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ideaNegocio.portafolio.map((p, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="py-1.5 px-1.5 text-center align-middle">
                          {p.imagenUrl ? (
                            <img
                              src={p.imagenUrl}
                              alt={p.nombre}
                              className="w-12 h-12 object-cover rounded-md border border-slate-300 mx-auto shadow-2xs"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md border border-slate-200 bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 mx-auto">
                              Sin Foto
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 font-bold text-slate-900 align-middle">{p.nombre}</td>
                        <td className="py-2 px-2 text-slate-600 align-middle">{p.tipo}</td>
                        <td className="py-2 px-2 text-slate-700 align-middle leading-relaxed">
                          {p.descripcionTecnica} <span className="text-slate-500">({p.especificaciones})</span>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-slate-900 align-middle">
                          {formatCurrencyCOP(p.precio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 8: UNIDAD ESTRATÉGICA I (PARTE A: DIRECCIONAMIENTO Y CADENA DE VALOR)
          ===================================================================== */}
          {renderPageWrapper(
            8,
            'SEC-06',
            'Unidad Estratégica I: Direccionamiento y Cadena de Valor',
            <div className="space-y-3.5">
              {renderSectionHeading(
                'Unidad Estratégica I: Direccionamiento Estratégico y Cadena de Valor',
                'Sección 6'
              )}

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded">
                  <span className="font-bold text-slate-900 block mb-0.5">1.1. Misión Corporativa</span>
                  <p className="text-slate-800">{unidadI.mision || '---'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded">
                  <span className="font-bold text-slate-900 block mb-0.5">1.2. Futuro Preferido (Visión)</span>
                  <p className="text-slate-800">{unidadI.vision || '---'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">1.3. Objetivos Estratégicos</h3>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                    {unidadI.objetivosEstrategicos.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <h3 className="font-bold text-slate-900">1.4. Valores Corporativos</h3>
                    <p className="text-slate-700">{unidadI.valores.join(' • ')}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">1.5. Ventaja Competitiva</h3>
                    <p className="text-slate-700">{unidadI.ventajaCompetitiva}</p>
                  </div>
                </div>
              </div>

              {/* Tabla APA 5: Cadena de Valor */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 5</span>
                  <span className="italic text-slate-700">1.6. Matriz de Cadena de Valor de Porter</span>
                </div>
                <table className="w-full text-[10px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-1.5 px-2 w-40">Actividad</th>
                      <th className="py-1.5 px-2">Descripción Operativa y de Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 font-bold">Logística de Entrada</td>
                      <td className="py-1 px-2">{unidadI.cadenaValor.logisticaEntrada}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 font-bold">Operaciones</td>
                      <td className="py-1 px-2">{unidadI.cadenaValor.operaciones}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 font-bold">Logística de Salida</td>
                      <td className="py-1 px-2">{unidadI.cadenaValor.logisticaSalida}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 font-bold">Marketing y Postventa</td>
                      <td className="py-1 px-2">
                        {unidadI.cadenaValor.marketingVentas} | {unidadI.cadenaValor.servicioPostventa}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 font-bold">Actividades de Apoyo</td>
                      <td className="py-1 px-2">
                        {unidadI.cadenaValor.infraestructura} | {unidadI.cadenaValor.desarrolloTecnologico}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[10px] text-slate-700 pt-1">
                  <span className="italic">Nota.</span> {unidadI.cadenaValor.analisis}
                </p>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 9: UNIDAD ESTRATÉGICA I (PARTE B: ESTRUCTURA ORGANIZACIONAL Y ORGANIGRAMA COMPLETO)
          ===================================================================== */}
          {renderPageWrapper(
            9,
            'SEC-07A',
            'Unidad Estratégica I: Estructura Organizacional y Organigrama',
            <div className="space-y-4">
              {renderSectionHeading(
                'Unidad Estratégica I: Estructura Organizacional y Organigrama',
                'Sección 7A'
              )}

              <div className="space-y-2">
                <h3 className="font-bold text-xs text-slate-900">
                  2.1. Estructura Organizacional ({unidadI.organigrama.tipoEstructura})
                </h3>
                <p className="indent-[1.27cm] text-slate-800 text-[10.5px] leading-relaxed">
                  {unidadI.organigrama.justificacionCultura || 'La estructura organizacional responde a la necesidad de articular las áreas funcionales de la empresa con los objetivos estratégicos y el direccionamiento ético y de calidad del proyecto.'}
                </p>
              </div>

              {/* Figura APA 1: Organigrama Estructural de la Compañía */}
              <div className="space-y-2 pt-1">
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">Figura 1</span>
                  <span className="italic text-slate-700 text-[10.5px]">
                    Organigrama Estructural de la Compañía ({unidadI.organigrama.tipoEstructura})
                  </span>
                </div>
                <div className="border border-slate-300 rounded-xl p-3 bg-white flex justify-center items-center shadow-xs">
                  <img
                    src={organigramaDisplayUrl}
                    alt="Organigrama Empresarial Completo"
                    className="w-full h-auto max-h-[14.5cm] object-contain rounded"
                  />
                </div>
                <p className="text-[9.5px] text-slate-600">
                  <span className="italic">Nota.</span> Representación gráfica de la arquitectura organizacional, jerarquías de mando directo y órganos de asesoría (Staff) de {portada.nombreTrabajo || 'la empresa'}.
                </p>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 10: UNIDAD ESTRATÉGICA I (PARTE C: PERFILES DE CARGOS Y MARCO LEGAL)
          ===================================================================== */}
          {renderPageWrapper(
            10,
            'SEC-07B',
            'Unidad Estratégica I: Perfiles de Cargos y Estudio Legal',
            <div className="space-y-4">
              {renderSectionHeading(
                'Unidad Estratégica I: Perfiles de Cargos Directivos y Marco Legal',
                'Sección 7B'
              )}

              {/* Tabla APA 6: Perfiles de Cargos */}
              <div className="space-y-1.5">
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">Tabla 6</span>
                  <span className="italic text-slate-700 text-[10px]">2.2. Perfiles de Cargos Directivos y Operativos</span>
                </div>
                <table className="w-full text-[9.5px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-1.5 px-2">Cargo</th>
                      <th className="py-1.5 px-2">Formación y Experiencia</th>
                      <th className="py-1.5 px-2">Funciones</th>
                      <th className="py-1.5 px-2 text-right">Salario ($ COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidadI.perfilesCargos.map((c, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="py-1.5 px-2 font-bold">{c.nombreCargo}</td>
                        <td className="py-1.5 px-2">
                          {c.formacion} ({c.experiencia})
                        </td>
                        <td className="py-1.5 px-2">{c.funciones}</td>
                        <td className="py-1.5 px-2 text-right font-bold">{formatCurrencyCOP(c.salarioEstimado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabla APA 7: Marco Legal */}
              <div className="space-y-1.5 pt-2">
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">Tabla 7</span>
                  <span className="italic text-slate-700 text-[10px]">3. Figura Legal, Capital Social y 4. Normatividad</span>
                </div>
                <table className="w-full text-[9.5px] border-collapse border-y-2 border-slate-900">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-2 font-bold w-40">Razón Social y CIIU</td>
                      <td className="py-1.5 px-2">
                        {unidadI.figuraLegal.razonSocial} ({unidadI.figuraLegal.tipoSociedad}) —{' '}
                        {unidadI.figuraLegal.codigosCIIU}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-2 font-bold">Objeto Social</td>
                      <td className="py-1.5 px-2">{unidadI.figuraLegal.objetoSocial}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-2 font-bold">Capital Social</td>
                      <td className="py-1.5 px-2">
                        Autorizado: {formatCurrencyCOP(unidadI.figuraLegal.capitalSocial.autorizado)} | Suscrito:{' '}
                        {formatCurrencyCOP(unidadI.figuraLegal.capitalSocial.suscrito)} | Pagado:{' '}
                        {formatCurrencyCOP(unidadI.figuraLegal.capitalSocial.pagado)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-2 font-bold">Normatividad Tributaria</td>
                      <td className="py-1.5 px-2">{unidadI.normatividad.tributaria}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1.5 px-2 font-bold">Laboral y Funcionamiento</td>
                      <td className="py-1.5 px-2">
                        {unidadI.normatividad.laboral} | {unidadI.normatividad.funcionamiento}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 11: UNIDAD ESTRATÉGICA II (PARTE A: INVERSIÓN INICIAL Y FINANCIACIÓN)
          ===================================================================== */}
          {renderPageWrapper(
            11,
            'SEC-08',
            'Unidad Estratégica II: Inversión Inicial y Financiación',
            <div className="space-y-3.5">
              {renderSectionHeading(
                'Unidad Estratégica II: Modelo Financiero — Inversión y Financiación',
                'Sección 8'
              )}

              {/* Tabla APA 8: Inversión Inicial */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 8</span>
                  <span className="italic text-slate-700">
                    5.1. Plan de Inversión Inicial (Efectivo, Inventarios, PPE e Intangibles)
                  </span>
                </div>
                <table className="w-full text-[9.5px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-1.5 px-2 w-40">Categoría</th>
                      <th className="py-1.5 px-2">Concepto / Activo</th>
                      <th className="py-1.5 px-2 text-right w-32">Monto ($ COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidadII.inversionInicial.efectivoDisponible.map((it, i) => (
                      <tr key={`ef-${i}`} className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold">Efectivo Disponible</td>
                        <td className="py-1 px-2">{it.concepto}</td>
                        <td className="py-1 px-2 text-right font-bold">{formatCurrencyCOP(it.monto)}</td>
                      </tr>
                    ))}
                    {unidadII.inversionInicial.inventarios.map((it, i) => (
                      <tr key={`inv-${i}`} className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold">Inventarios</td>
                        <td className="py-1 px-2">{it.concepto}</td>
                        <td className="py-1 px-2 text-right font-bold">{formatCurrencyCOP(it.monto)}</td>
                      </tr>
                    ))}
                    {unidadII.inversionInicial.propiedadPlantaEquipo.map((it, i) => (
                      <tr key={`ppe-${i}`} className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold">Propiedad, Planta y Equipo</td>
                        <td className="py-1 px-2">{it.concepto}</td>
                        <td className="py-1 px-2 text-right font-bold">{formatCurrencyCOP(it.monto)}</td>
                      </tr>
                    ))}
                    {unidadII.inversionInicial.intangibles.map((it, i) => (
                      <tr key={`int-${i}`} className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold">Activos Intangibles</td>
                        <td className="py-1 px-2">{it.concepto}</td>
                        <td className="py-1 px-2 text-right font-bold">{formatCurrencyCOP(it.monto)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="py-1.5 px-2 text-right uppercase">
                        Total Inversión Inicial Requerida
                      </td>
                      <td className="py-1.5 px-2 text-right">{formatCurrencyCOP(totalInversion)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabla APA 9: Fuentes de Financiación */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 9</span>
                  <span className="italic text-slate-700">5.2. Fuentes de Financiación (Capital Propio y Crédito)</span>
                </div>
                <table className="w-full text-[9.5px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-1.5 px-2 w-40">Fuente</th>
                      <th className="py-1.5 px-2">Detalle del Aporte o Crédito</th>
                      <th className="py-1.5 px-2 text-right w-32">Monto ($ COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidadII.financiacion.aportesSocios.map((it, i) => (
                      <tr key={`soc-${i}`} className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold">Capital Socios</td>
                        <td className="py-1 px-2">{it.concepto}</td>
                        <td className="py-1 px-2 text-right font-bold">{formatCurrencyCOP(it.monto)}</td>
                      </tr>
                    ))}
                    {unidadII.financiacion.aportesExternos.map((it, i) => (
                      <tr key={`ext-${i}`} className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold">Pasivo / Crédito</td>
                        <td className="py-1 px-2">{it.concepto}</td>
                        <td className="py-1 px-2 text-right font-bold">{formatCurrencyCOP(it.monto)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="py-1.5 px-2 text-right uppercase">
                        Total Financiación
                      </td>
                      <td className="py-1.5 px-2 text-right">{formatCurrencyCOP(totalFinanciacion)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 12: UNIDAD ESTRATÉGICA II (PARTE B: COSTOS, GASTOS Y PUNTO DE EQUILIBRIO)
          ===================================================================== */}
          {renderPageWrapper(
            12,
            'SEC-09',
            'Unidad Estratégica II: Costos, Gastos y Punto de Equilibrio',
            <div className="space-y-3.5">
              {renderSectionHeading(
                'Unidad Estratégica II: Costos, Gastos Fijos y Punto de Equilibrio',
                'Sección 9'
              )}

              {/* Tabla APA 10: Costos Variables */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 10</span>
                  <span className="italic text-slate-700">5.3. Estructura de Costos Variables Unitarios</span>
                </div>
                <table className="w-full text-[9.5px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-1 px-2">Producto / Servicio</th>
                      <th className="py-1 px-2 text-right">Costo Variable Unitario</th>
                      <th className="py-1 px-2 text-right">% Participación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidadII.costosVariables.map((cv, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold">{cv.producto}</td>
                        <td className="py-1 px-2 text-right font-bold">{formatCurrencyCOP(cv.costoUnidad)}</td>
                        <td className="py-1 px-2 text-right">{cv.porcentajeDelCostoTotal}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabla APA 11: Gastos Fijos */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 11</span>
                  <span className="italic text-slate-700">5.4. Gastos Fijos Mensuales de Nómina y Operación</span>
                </div>
                <table className="w-full text-[9.5px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-1 px-2">Rubro / Cargo</th>
                      <th className="py-1 px-2">Clasificación</th>
                      <th className="py-1 px-2 text-right">Total Mensual ($ COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unidadII.gastosFijos.gastosPersonal.map((gp, i) => (
                      <tr key={`gp-${i}`} className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold">{gp.cargo}</td>
                        <td className="py-1 px-2">Nómina + Prestaciones Sociales</td>
                        <td className="py-1 px-2 text-right font-bold">
                          {formatCurrencyCOP(gp.salarioMensual + gp.prestacionesSociales)}
                        </td>
                      </tr>
                    ))}
                    {unidadII.gastosFijos.otrosGastosFijos.map((og, i) => (
                      <tr key={`og-${i}`} className="border-b border-slate-200">
                        <td className="py-1 px-2">{og.concepto}</td>
                        <td className="py-1 px-2">Gasto Fijo Operativo</td>
                        <td className="py-1 px-2 text-right font-bold">{formatCurrencyCOP(og.monto)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="py-1 px-2 text-right uppercase">
                        Total Gastos Fijos Mensuales
                      </td>
                      <td className="py-1 px-2 text-right">{formatCurrencyCOP(totalGastosFijos)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 text-[10px]">
                <h3 className="font-bold text-slate-900">6. Punto de Equilibrio y 7. Proyección de Ingresos</h3>
                <p className="indent-[1.27cm]">
                  <strong>Punto de Equilibrio:</strong>{' '}
                  {unidadII.puntoEquilibrio.unidadesEquilibrioMensual.toLocaleString('es-CO')} unidades/mes (
                  {formatCurrencyCOP(unidadII.puntoEquilibrio.montoEquilibrioMensual)}).{' '}
                  {unidadII.puntoEquilibrio.ventasMinimas}
                </p>
                <p className="indent-[1.27cm]">
                  <strong>Proyección de Ventas y Precios:</strong> {unidadII.fuentesIngresos.proyeccionVentas}{' '}
                  {unidadII.fuentesIngresos.fijacionPrecios}
                </p>
              </div>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 13: UNIDAD ESTRATÉGICA III (ESTADOS FINANCIEROS E INDICADORES)
          ===================================================================== */}
          {renderPageWrapper(
            13,
            'SEC-10',
            'Unidad Estratégica III: Estados e Indicadores Financieros',
            <div className="space-y-3.5">
              {renderSectionHeading(
                'Unidad Estratégica III: Estados e Indicadores Financieros Proyectados',
                'Sección 10'
              )}

              {/* Tabla APA 12: Estado de Resultados y Balance General */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 12</span>
                  <span className="italic text-slate-700">
                    8. Estado de Resultados Proyectado y 9. Balance General (Año 1)
                  </span>
                </div>
                <table className="w-full text-[9.5px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-1.5 px-2">Estado de Resultados</th>
                      <th className="py-1.5 px-2 text-right">Valor ($ COP)</th>
                      <th className="py-1.5 px-2">Balance General</th>
                      <th className="py-1.5 px-2 text-right">Valor ($ COP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2">Ingresos por Ventas</td>
                      <td className="py-1 px-2 text-right font-bold">
                        {formatCurrencyCOP(unidadIII.estadoResultados.ingresosVentas)}
                      </td>
                      <td className="py-1 px-2">Activos Corrientes</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.balanceGeneral.activosCorrientes)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2">(-) Costo de Ventas</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.estadoResultados.costosVentas)}
                      </td>
                      <td className="py-1 px-2">Activos No Corrientes</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.balanceGeneral.activosNoCorrientes)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 font-bold bg-slate-50">
                      <td className="py-1 px-2">(=) Utilidad Bruta</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.estadoResultados.utilidadBruta)}
                      </td>
                      <td className="py-1 px-2">Total Activos</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.balanceGeneral.totalActivos)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2">(-) Gastos Operacionales</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.estadoResultados.gastosOperacionales)}
                      </td>
                      <td className="py-1 px-2">Total Pasivos</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.balanceGeneral.totalPasivos)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2">(=) Utilidad Operativa</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.estadoResultados.utilidadOperativa)}
                      </td>
                      <td className="py-1 px-2">Patrimonio Neto</td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.balanceGeneral.patrimonio)}
                      </td>
                    </tr>
                    <tr className="font-bold bg-emerald-50/70">
                      <td className="py-1.5 px-2">(=) Utilidad Neta Final</td>
                      <td className="py-1.5 px-2 text-right">
                        {formatCurrencyCOP(unidadIII.estadoResultados.utilidadNeta)}
                      </td>
                      <td className="py-1.5 px-2">Total Pasivo + Patrimonio</td>
                      <td className="py-1.5 px-2 text-right">
                        {formatCurrencyCOP(
                          unidadIII.balanceGeneral.totalPasivos + unidadIII.balanceGeneral.patrimonio
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabla APA 13: Flujo de Caja, VPN, TIR e Indicadores */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold text-slate-900 block">Tabla 13</span>
                  <span className="italic text-slate-700">10. Flujo de Caja, VPN, TIR y 11. Indicadores Financieros</span>
                </div>
                <table className="w-full text-[9.5px] border-collapse border-y-2 border-slate-900">
                  <thead>
                    <tr className="border-b border-slate-900 font-bold text-left bg-slate-50">
                      <th className="py-1 px-2">Indicador Financiero</th>
                      <th className="py-1 px-2 text-right">Valor</th>
                      <th className="py-1 px-2">Interpretación Académica</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 font-bold">Valor Presente Neto (VPN)</td>
                      <td className="py-1 px-2 text-right font-bold text-emerald-800">
                        {formatCurrencyCOP(unidadIII.flujoCaja.vpn)}
                      </td>
                      <td className="py-1 px-2">Generación de valor presente descontado</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 font-bold">Tasa Interna de Retorno (TIR)</td>
                      <td className="py-1 px-2 text-right font-bold text-emerald-800">{unidadIII.flujoCaja.tir}% E.A.</td>
                      <td className="py-1 px-2">Rentabilidad interna anualizada del proyecto</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-2 font-bold">Liquidez Corriente y Endeudamiento</td>
                      <td className="py-1 px-2 text-right font-bold">
                        {unidadIII.indicadoresFinancieros.liquidezCorriente}x /{' '}
                        {unidadIII.indicadoresFinancieros.nivelEndeudamiento}%
                      </td>
                      <td className="py-1 px-2">Solvencia de corto plazo y estructura de apalancamiento</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="indent-[1.27cm] text-slate-800 text-[10px]">
                <strong>Dictamen Financiero:</strong> {unidadIII.indicadoresFinancieros.conclusionFinanciera}
              </p>
            </div>
          )}

          {/* =====================================================================
              PÁGINA 14: CONCLUSIONES, RECOMENDACIONES Y BIBLIOGRAFÍA (NORMAS APA)
          ===================================================================== */}
          {renderPageWrapper(
            14,
            'SEC-11',
            'Conclusiones, Recomendaciones y Bibliografía APA',
            <div className="space-y-4">
              {renderSectionHeading(
                '12. Conclusiones, Recomendaciones y Referencias Bibliográficas (APA)',
                'Sección 11'
              )}

              <div className="space-y-1.5">
                <h3 className="font-bold text-xs text-slate-900">12.1. Conclusiones del Proyecto</h3>
                {unidadIII.conclusionesYRecomendaciones.conclusiones.map((c, i) => (
                  <p key={i} className="indent-[1.27cm] text-slate-800 text-left">
                    {i + 1}. {c}
                  </p>
                ))}
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-xs text-slate-900">12.2. Recomendaciones Estratégicas</h3>
                {unidadIII.conclusionesYRecomendaciones.recomendaciones.map((r, i) => (
                  <p key={i} className="indent-[1.27cm] text-slate-800 text-left">
                    {i + 1}. {r}
                  </p>
                ))}
              </div>

              {/* Bibliografía con Sangría Francesa de 1.27 cm (0.5 pulgadas) según Normas APA 7ª edición */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h3 className="font-bold text-xs text-slate-900 text-center">
                  Referencias (Normas APA 7ª Edición — Sangría Francesa 1.27 cm)
                </h3>
                <div className="space-y-2 text-slate-800">
                  {unidadIII.bibliografia.map((b, i) => (
                    <p key={i} className="pl-[1.27cm] -indent-[1.27cm] text-left leading-relaxed">
                      {b}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
