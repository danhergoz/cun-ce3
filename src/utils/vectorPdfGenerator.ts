import jsPDF from 'jspdf';
import { ProjectData } from '../types/project';
import {
  formatCurrencyCOP,
  calculateInversionTotal,
  calculateFinanciacionTotal,
  calculateGastosFijosMensuales,
} from './helpers';
import { generateOrganigramaImage } from '../components/organigrama/organigramaCanvasGenerator';
import { DEFAULT_ORGANIGRAMA_NODOS } from '../components/organigrama/organigramaTemplates';

// Formato Carta (Letter) oficial: 21.59 cm x 27.94 cm = 215.9 mm x 279.4 mm
const LETTER_WIDTH = 215.9;
const LETTER_HEIGHT = 279.4;
// Márgenes: 2.54 cm en cada borde = 25.4 mm
const APA_MARGIN = 25.4;
const CONTENT_WIDTH = LETTER_WIDTH - APA_MARGIN * 2; // 165.1 mm
// Sangría de primera línea: 1.27 cm = 12.7 mm
const APA_INDENT = 12.7;

const TOTAL_PAGES = 12;

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16) || 0,
      g: parseInt(clean[1] + clean[1], 16) || 51,
      b: parseInt(clean[2] + clean[2], 16) || 102,
    };
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 0, g: 51, b: 102 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function tintColor(rgb: RgbColor, factor: number): RgbColor {
  return {
    r: Math.round(rgb.r + (255 - rgb.r) * factor),
    g: Math.round(rgb.g + (255 - rgb.g) * factor),
    b: Math.round(rgb.b + (255 - rgb.b) * factor),
  };
}

async function compressImageForPdf(
  url?: string,
  maxWidth = 200,
  maxHeight = 160,
  asPng = false
): Promise<{ dataUrl: string; format: 'JPEG' | 'PNG'; width: number; height: number } | null> {
  if (!url || typeof url !== 'string' || !url.trim()) return null;

  const isDataUrl = url.startsWith('data:image/');
  const isPng = url.startsWith('data:image/png') || asPng;

  return new Promise((resolve) => {
    const img = new Image();
    if (!isDataUrl) {
      img.crossOrigin = 'anonymous';
    }
    const timeout = setTimeout(() => {
      if (isDataUrl) {
        resolve({ dataUrl: url, format: isPng ? 'PNG' : 'JPEG', width: maxWidth, height: maxHeight });
      } else {
        resolve(null);
      }
    }, 4000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth || maxWidth;
        let h = img.naturalHeight || maxHeight;
        const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
        w = Math.max(1, Math.round(w * ratio));
        h = Math.max(1, Math.round(h * ratio));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (isDataUrl) resolve({ dataUrl: url, format: isPng ? 'PNG' : 'JPEG', width: w, height: h });
          else resolve(null);
          return;
        }
        if (!isPng) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        const format: 'JPEG' | 'PNG' = isPng ? 'PNG' : 'JPEG';
        const dataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.85);
        resolve({ dataUrl, format, width: w, height: h });
      } catch {
        if (isDataUrl) {
          resolve({ dataUrl: url, format: isPng ? 'PNG' : 'JPEG', width: maxWidth, height: maxHeight });
        } else {
          resolve(null);
        }
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      if (isDataUrl) {
        resolve({ dataUrl: url, format: isPng ? 'PNG' : 'JPEG', width: maxWidth, height: maxHeight });
      } else {
        resolve(null);
      }
    };

    img.src = url;
  });
}

export async function generateVectorPDF(
  projectData: ProjectData,
  onProgress?: (page: number, total: number) => void
): Promise<void> {
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

  // Fallback si venía plantilla eliminada
  let templateId = designConfig.templateId || 'cun-oficial';
  if ((templateId as string) === 'cun-opcion-5') {
    templateId = 'cun-oficial';
  }

  const primaryRgb = hexToRgb(designConfig.primaryColor || '#003366');
  const lightTint = tintColor(primaryRgb, 0.92);

  // Fuente
  const pdfFont =
    designConfig.fontFamily === 'serif'
      ? 'times'
      : designConfig.fontFamily === 'mono'
      ? 'courier'
      : 'helvetica';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
    compress: true,
  });

  // Pre-cargar firmas digitales
  const signatureImages: Record<number, { dataUrl: string; format: 'JPEG' | 'PNG' } | null> = {};
  if (designConfig.incluirFirmasDigitales) {
    for (let i = 0; i < compromisosAutor.autores.length; i++) {
      const sigUrl = compromisosAutor.autores[i].firmaImgUrl;
      if (sigUrl) {
        signatureImages[i] = await compressImageForPdf(sigUrl, 260, 110, true);
      }
    }
  }

  // Pre-cargar imágenes del portafolio de productos/servicios
  const productImages: Record<number, { dataUrl: string; format: 'JPEG' | 'PNG' } | null> = {};
  for (let i = 0; i < ideaNegocio.portafolio.length; i++) {
    const pUrl = ideaNegocio.portafolio[i].imagenUrl;
    if (pUrl) {
      productImages[i] = await compressImageForPdf(pUrl, 160, 160, false);
    }
  }

  // Pre-cargar o generar imagen en alta resolución del organigrama
  let organigramaImage: { dataUrl: string; format: 'JPEG' | 'PNG'; width: number; height: number } | null = null;
  const orgNodos =
    unidadI.organigrama?.nodos && unidadI.organigrama.nodos.length > 0
      ? unidadI.organigrama.nodos
      : DEFAULT_ORGANIGRAMA_NODOS;

  const rawOrgUrl =
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

  if (rawOrgUrl) {
    organigramaImage = await compressImageForPdf(rawOrgUrl, 1800, 1200, true);
  }

  // Encabezado y pie de página limpios (SIN nombres de plantillas, ni "CUN Opción X", ni características de papel/márgenes)
  const drawPageChrome = (pageNumber: number, sectionCode: string, sectionTitle: string) => {
    onProgress?.(pageNumber, TOTAL_PAGES);

    const shortProject = (portada.nombreTrabajo || 'PROYECTO DE CREACIÓN DE EMPRESAS')
      .toUpperCase()
      .slice(0, 52);

    if (templateId === 'cun-opcion-6') {
      // Franja lateral
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(0, 0, 5, LETTER_HEIGHT, 'F');

      // Bloque modular superior
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.roundedRect(APA_MARGIN, 14, 22, 9, 1.2, 1.2, 'F');
      doc.setFont(pdfFont, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`SECC. ${String(pageNumber).padStart(2, '0')}`, APA_MARGIN + 11, 19.6, { align: 'center' });

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.25);
      doc.roundedRect(APA_MARGIN + 23.5, 14, CONTENT_WIDTH - 23.5, 9, 1.2, 1.2, 'FD');

      doc.setFont(pdfFont, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(sectionTitle.toUpperCase().slice(0, 58), APA_MARGIN + 26, 18);
      doc.setFont(pdfFont, 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text(shortProject, APA_MARGIN + 26, 21.5);

      if (designConfig.mostrarNumeroPagina) {
        doc.setFont(pdfFont, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`${pageNumber}`, APA_MARGIN + CONTENT_WIDTH - 3, 19.5, { align: 'right' });
      }
    } else if (templateId === 'cun-opcion-7') {
      // Cabecera Dossier
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.roundedRect(APA_MARGIN, 13.5, CONTENT_WIDTH, 10, 1.5, 1.5, 'F');

      doc.setFont(pdfFont, 'bold');
      doc.setFontSize(7);
      doc.setTextColor(253, 224, 71);
      doc.text(`PROYECTO DE CREACIÓN DE EMPRESAS • ${sectionCode}`, APA_MARGIN + 3.5, 17.5);

      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(sectionTitle.toUpperCase().slice(0, 60), APA_MARGIN + 3.5, 21.6);

      if (designConfig.mostrarNumeroPagina) {
        doc.setFontSize(9);
        doc.text(`Pág. ${pageNumber}`, APA_MARGIN + CONTENT_WIDTH - 3.5, 19.5, { align: 'right' });
      }
    } else {
      // Cabecera estándar limpia
      doc.setFont(pdfFont, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${shortProject} — ${sectionTitle}`, APA_MARGIN, 18);

      if (designConfig.mostrarNumeroPagina) {
        doc.setFont(pdfFont, 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${pageNumber}`, APA_MARGIN + CONTENT_WIDTH, 18, { align: 'right' });
      }

      doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.setLineWidth(templateId === 'minimalista-elegante' ? 0.25 : 0.45);
      doc.line(APA_MARGIN, 20.5, APA_MARGIN + CONTENT_WIDTH, 20.5);
    }

    // Pie de página limpio (solo institución y paginación)
    const footerY = LETTER_HEIGHT - 14;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(APA_MARGIN, footerY - 3.5, APA_MARGIN + CONTENT_WIDTH, footerY - 3.5);

    doc.setFont(pdfFont, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Corporación Unificada Nacional de Educación Superior (CUN)',
      APA_MARGIN,
      footerY
    );

    if (designConfig.mostrarNumeroPagina) {
      doc.setFont(pdfFont, 'bold');
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(`Página ${pageNumber} de ${TOTAL_PAGES}`, APA_MARGIN + CONTENT_WIDTH, footerY, {
        align: 'right',
      });
    }
  };

  // Helper de título de sección
  const drawSectionBanner = (y: number, title: string, subtitle?: string): number => {
    if (templateId === 'cun-opcion-6') {
      doc.setFillColor(lightTint.r, lightTint.g, lightTint.b);
      doc.rect(APA_MARGIN, y, CONTENT_WIDTH, 7.5, 'F');
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(APA_MARGIN, y, 2.5, 7.5, 'F');
      doc.setFont(pdfFont, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(title.toUpperCase(), APA_MARGIN + 5, y + 5.1);
      return y + 11.5;
    }

    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(title, LETTER_WIDTH / 2, y + 4, { align: 'center' });

    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.35);
    doc.line(APA_MARGIN, y + 6.2, APA_MARGIN + CONTENT_WIDTH, y + 6.2);
    return y + 11;
  };

  const drawHeadingLevel2 = (y: number, text: string): number => {
    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(text, APA_MARGIN, y + 3.5);
    return y + 6.5;
  };

  const drawApaParagraph = (
    y: number,
    text: string,
    options?: { indentFirstLine?: boolean; fontSize?: number; maxLines?: number }
  ): number => {
    const fontSize = options?.fontSize ?? 9.5;
    const indent = options?.indentFirstLine ?? true;
    const lineHeight = fontSize * 0.52;
    const safeText = (text || 'Sin información registrada.').replace(/\r\n/g, '\n');

    doc.setFont(pdfFont, 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(30, 41, 59);

    const paragraphs = safeText.split(/\n+/).filter((p) => p.trim().length > 0);
    let currentY = y;

    for (const para of paragraphs) {
      if (indent) {
        const firstLineWidth = CONTENT_WIDTH - APA_INDENT;
        const words = para.trim().split(/\s+/);
        let firstLine = '';
        let wordIdx = 0;

        while (wordIdx < words.length) {
          const testLine = firstLine ? `${firstLine} ${words[wordIdx]}` : words[wordIdx];
          if (doc.getTextWidth(testLine) <= firstLineWidth || !firstLine) {
            firstLine = testLine;
            wordIdx++;
          } else {
            break;
          }
        }

        if (currentY > LETTER_HEIGHT - APA_MARGIN - 6) break;
        doc.text(firstLine, APA_MARGIN + APA_INDENT, currentY + 3.5);
        currentY += lineHeight;

        const remainingText = words.slice(wordIdx).join(' ');
        if (remainingText) {
          const restLines: string[] = doc.splitTextToSize(remainingText, CONTENT_WIDTH);
          const capped = options?.maxLines ? restLines.slice(0, options.maxLines - 1) : restLines;
          for (const line of capped) {
            if (currentY > LETTER_HEIGHT - APA_MARGIN - 6) break;
            doc.text(line, APA_MARGIN, currentY + 3.5);
            currentY += lineHeight;
          }
        }
      } else {
        const lines: string[] = doc.splitTextToSize(para.trim(), CONTENT_WIDTH);
        const capped = options?.maxLines ? lines.slice(0, options.maxLines) : lines;
        for (const line of capped) {
          if (currentY > LETTER_HEIGHT - APA_MARGIN - 6) break;
          doc.text(line, APA_MARGIN, currentY + 3.5);
          currentY += lineHeight;
        }
      }
      currentY += 1.5;
    }

    return currentY;
  };

  const drawApaTableCaption = (y: number, tableNumber: string, tableTitle: string): number => {
    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(tableNumber, APA_MARGIN, y + 3.2);

    doc.setFont(pdfFont, 'italic');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(tableTitle, APA_MARGIN, y + 7.4);
    return y + 9.5;
  };

  const drawVectorTable = (
    startY: number,
    headers: { label: string; width: number; align?: 'left' | 'right' | 'center' }[],
    rows: string[][],
    fontSize = 8.2
  ): number => {
    let y = startY;
    const rowPadding = 2;
    const lineHeight = fontSize * 0.44;

    const isSolidHeader = templateId === 'cun-opcion-7' || templateId === 'ejecutivo-moderno';

    if (isSolidHeader) {
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(APA_MARGIN, y, CONTENT_WIDTH, 6.5, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFillColor(lightTint.r, lightTint.g, lightTint.b);
      doc.rect(APA_MARGIN, y, CONTENT_WIDTH, 6.5, 'F');
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.4);
      doc.line(APA_MARGIN, y, APA_MARGIN + CONTENT_WIDTH, y);
      doc.line(APA_MARGIN, y + 6.5, APA_MARGIN + CONTENT_WIDTH, y + 6.5);
      doc.setTextColor(15, 23, 42);
    }

    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(fontSize);

    let colX = APA_MARGIN;
    for (const h of headers) {
      const tx =
        h.align === 'right'
          ? colX + h.width - 2
          : h.align === 'center'
          ? colX + h.width / 2
          : colX + 2;
      doc.text(h.label, tx, y + 4.4, { align: h.align || 'left' });
      colX += h.width;
    }
    y += 6.5;

    doc.setFont(pdfFont, 'normal');
    doc.setFontSize(fontSize);

    rows.forEach((row, rIdx) => {
      const cellLines: string[][] = row.map((cellText, cIdx) => {
        const w = headers[cIdx]?.width ? headers[cIdx].width - 4 : 40;
        return doc.splitTextToSize(cellText || '---', w);
      });
      const maxLinesInRow = Math.max(1, ...cellLines.map((l) => l.length));
      const rowH = maxLinesInRow * lineHeight + rowPadding * 1.6;

      if (y + rowH > LETTER_HEIGHT - APA_MARGIN - 4) return;

      if (rIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(APA_MARGIN, y, CONTENT_WIDTH, rowH, 'F');
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(APA_MARGIN, y + rowH, APA_MARGIN + CONTENT_WIDTH, y + rowH);

      let cx = APA_MARGIN;
      cellLines.forEach((lines, cIdx) => {
        const h = headers[cIdx];
        const align = h?.align || 'left';
        const tx =
          align === 'right'
            ? cx + h.width - 2
            : align === 'center'
            ? cx + h.width / 2
            : cx + 2;

        doc.setFont(pdfFont, cIdx === 0 || align === 'right' ? 'bold' : 'normal');
        doc.setTextColor(cIdx === 0 ? 15 : 51, cIdx === 0 ? 23 : 65, cIdx === 0 ? 42 : 85);

        lines.forEach((ln, lIdx) => {
          doc.text(ln, tx, y + 3.6 + lIdx * lineHeight, { align });
        });
        cx += h.width;
      });

      y += rowH;
    });

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(APA_MARGIN, y, APA_MARGIN + CONTENT_WIDTH, y);

    return y + 4;
  };

  // =========================================================================
  // PÁGINA 1: PORTADA INSTITUCIONAL
  // =========================================================================
  drawPageChrome(1, 'SEC-01', 'Portada Institucional');
  {
    let y = APA_MARGIN + 10;

    doc.setFillColor(lightTint.r, lightTint.g, lightTint.b);
    doc.roundedRect(LETTER_WIDTH / 2 - 45, y, 90, 7.5, 2, 2, 'FD');
    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text('PROYECTO DE CREACIÓN DE EMPRESAS', LETTER_WIDTH / 2, y + 5, { align: 'center' });

    y += 22;

    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    const titleLines: string[] = doc.splitTextToSize(
      portada.nombreTrabajo || 'NOMBRE DEL PROYECTO DE CREACIÓN DE EMPRESAS',
      CONTENT_WIDTH - 12
    );
    titleLines.forEach((line) => {
      doc.text(line, LETTER_WIDTH / 2, y, { align: 'center' });
      y += 7;
    });

    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(LETTER_WIDTH / 2 - 18, y + 1, 36, 1.2, 'F');
    y += 14;

    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    portada.integrantes.forEach((int) => {
      doc.text(int.nombre || 'Estudiante', LETTER_WIDTH / 2, y, { align: 'center' });
      y += 5.2;
    });

    y += 6;

    const escuelas = Array.from(
      new Set(portada.integrantes.map((i) => i.facultad).filter(Boolean))
    ).join(' / ');
    const carreras = Array.from(
      new Set(portada.integrantes.map((i) => i.carrera).filter(Boolean))
    ).join(' — ');

    doc.setFont(pdfFont, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    if (escuelas) {
      doc.text(escuelas, LETTER_WIDTH / 2, y, { align: 'center' });
      y += 5.5;
    }
    if (carreras) {
      doc.text(carreras, LETTER_WIDTH / 2, y, { align: 'center' });
      y += 5.5;
    }

    doc.setFont(pdfFont, 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(
      'Corporación Unificada Nacional de Educación Superior (CUN)',
      LETTER_WIDTH / 2,
      y,
      { align: 'center' }
    );
    y += 8;

    doc.setFont(pdfFont, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Creación de Empresas III - Modelos de Innovación', LETTER_WIDTH / 2, y, {
      align: 'center',
    });
    y += 6;

    doc.setFont(pdfFont, 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Docente Director: ${portada.docente || 'Daniel Hernández Gómez'}`, LETTER_WIDTH / 2, y, {
      align: 'center',
    });
    y += 14;

    // Tabla 1: Integrantes (con columna "Escuela" en lugar de "Facultad")
    y = drawApaTableCaption(y, 'Tabla 1', 'Integrantes del Equipo de Trabajo Académico');
    y = drawVectorTable(
      y,
      [
        { label: 'Nombre Completo del Estudiante', width: 58 },
        { label: 'Programa Académico', width: 45 },
        { label: 'Escuela', width: 44 },
        { label: 'Grupo', width: 18.1, align: 'center' },
      ],
      portada.integrantes.map((int, idx) => [
        int.nombre || `Estudiante #${idx + 1}`,
        int.carrera || '---',
        int.facultad || '---',
        int.grupo || 'G024',
      ]),
      8
    );

    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `${portada.ciudad || 'Bogotá D.C., Colombia'} — ${portada.ano || new Date().getFullYear()}`,
      LETTER_WIDTH / 2,
      LETTER_HEIGHT - APA_MARGIN - 4,
      { align: 'center' }
    );
  }

  // =========================================================================
  // PÁGINA 2: COMPROMISOS DE AUTOR
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(2, 'SEC-02', 'Compromisos de Autor');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(y, 'Compromisos de Autor y Declaración de Autenticidad', 'Sección 2');

    y = drawApaParagraph(
      y,
      'Nosotros, los abajo firmantes, manifestamos la identificación oficial como autores intelectuales del presente trabajo de grado / proyecto de curso presentado ante la Corporación Unificada Nacional de Educación Superior (CUN):',
      { indentFirstLine: true }
    );
    y += 2;

    y = drawApaTableCaption(y, 'Tabla 2', 'Registro Oficial de Autores del Proyecto');
    y = drawVectorTable(
      y,
      [
        { label: 'Nombre Completo del Autor', width: 65 },
        { label: 'Programa Académico', width: 60 },
        { label: 'Documento de Identidad', width: 40.1 },
      ],
      compromisosAutor.autores.map((a) => [
        a.nombreCompleto || '---',
        a.programaAcademico || '---',
        a.identificacion || '---',
      ]),
      8.5
    );

    y += 2;
    y = drawHeadingLevel2(y, 'Declaración de Responsabilidad y Originalidad Académica');

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.35);
    doc.roundedRect(APA_MARGIN, y, CONTENT_WIDTH, 32, 1.5, 1.5, 'FD');

    const legalText =
      'Asiento (mos) y doy fe que el contenido del presente documento es un reflejo de mi trabajo personal y el de mis compañeros de proyecto (si aplica) y se pone de manifiesto que, ante cualquier notificación relacionada a la presunción de plagio académico, copia o falta a la fuente original, soy (somos) responsable directo legal, económico y administrativo sin afectar al director del trabajo, a la Universidad y a cuantas instituciones han colaborado en dicho trabajo, asumiendo las consecuencias derivadas de tales prácticas.';
    doc.setFont(pdfFont, 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(30, 41, 59);
    const legalLines: string[] = doc.splitTextToSize(legalText, CONTENT_WIDTH - 8);
    legalLines.forEach((ln, idx) => {
      doc.text(ln, APA_MARGIN + 4, y + 5.5 + idx * 4.2);
    });

    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 95, 70);
    doc.text(
      `Estado de Declaratoria: ${
        compromisosAutor.declaracionAceptada
          ? 'ACEPTADA Y RATIFICADA POR LOS AUTORES'
          : 'PENDIENTE DE CONFIRMACIÓN'
      }`,
      APA_MARGIN + 4,
      y + 28.5
    );
    y += 38;

    if (designConfig.incluirFirmasDigitales) {
      y = drawHeadingLevel2(y, 'Firmas Digitales Registradas de los Autores');
      y += 2;

      const boxW = (CONTENT_WIDTH - 6) / 2;
      const boxH = 34;

      compromisosAutor.autores.forEach((autor, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const bx = APA_MARGIN + col * (boxW + 6);
        const by = y + row * (boxH + 5);

        if (by + boxH > LETTER_HEIGHT - APA_MARGIN) return;

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(bx, by, boxW, boxH, 1.5, 1.5, 'FD');

        const sigImg = signatureImages[idx];
        if (sigImg) {
          try {
            doc.addImage(sigImg.dataUrl, sigImg.format, bx + boxW / 2 - 20, by + 2.5, 40, 15);
          } catch {
            // fallback
          }
        } else {
          doc.setFont(pdfFont, 'italic');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text('Firma Digital Autorizada', bx + boxW / 2, by + 11, { align: 'center' });
        }

        doc.setDrawColor(100, 116, 139);
        doc.setLineWidth(0.25);
        doc.line(bx + 8, by + 20, bx + boxW - 8, by + 20);

        doc.setFont(pdfFont, 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(autor.nombreCompleto || `Autor #${idx + 1}`, bx + boxW / 2, by + 24.5, {
          align: 'center',
        });

        doc.setFont(pdfFont, 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `${autor.programaAcademico || ''} • ID: ${autor.identificacion || '---'}`,
          bx + boxW / 2,
          by + 29,
          { align: 'center' }
        );
      });
    }
  }

  // =========================================================================
  // PÁGINA 3: ÍNDICE O TABLA DE CONTENIDO
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(3, 'SEC-03', 'Índice o Tabla de Contenido');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(y, 'Tabla de Contenido General del Proyecto', 'Sección 3');

    y = drawApaParagraph(
      y,
      'El presente documento se estructura bajo lineamientos de entrega de proyecto en páginas independientes separadas por cada sección temática:',
      { indentFirstLine: true }
    );
    y += 2;

    y = drawApaTableCaption(y, 'Tabla 3', 'Estructura Paginada de Secciones y Unidades Estratégicas');
    y = drawVectorTable(
      y,
      [
        { label: 'Código', width: 25 },
        { label: 'Sección y Contenido Académico', width: 118.1 },
        { label: 'Página', width: 22, align: 'right' },
      ],
      [
        ['SEC-01', 'Portada Institucional y Datos del Equipo de Trabajo', 'Pág. 1'],
        ['SEC-02', 'Compromisos de Autor, Declaración de Originalidad y Firmas Digitales', 'Pág. 2'],
        ['SEC-03', 'Índice General y Tabla de Contenido por Secciones', 'Pág. 3'],
        ['SEC-04', 'Contenido: Introducción, Objetivos, Claves de Éxito, Resumen y Video Pitch', 'Pág. 4'],
        ['SEC-05', '0. Idea de Negocio: Descripción, Justificación, Mercado y Portafolio con Imágenes', 'Pág. 5'],
        ['SEC-06', 'Unidad Estratégica I (Parte A): Misión, Visión, Objetivos, Valores y Cadena de Valor', 'Pág. 6'],
        ['SEC-07A', 'Unidad Estratégica I (Parte B): Estructura Organizacional y Organigrama de la Empresa', 'Pág. 7'],
        ['SEC-07B', 'Unidad Estratégica I (Parte C): Perfiles de Cargos, Constitución y Marco Legal', 'Pág. 8'],
        ['SEC-08', 'Unidad Estratégica II (Parte A): Modelo Financiero, Inversión Inicial y Financiación', 'Pág. 9'],
        ['SEC-09', 'Unidad Estratégica II (Parte B): Costos Variables, Gastos Fijos y Punto de Equilibrio', 'Pág. 10'],
        ['SEC-10', 'Unidad Estratégica III (Parte A): Estado de Resultados, Balance, Flujo de Caja, VPN y TIR', 'Pág. 11'],
        ['SEC-11', 'Unidad Estratégica III (Parte B): Conclusiones, Recomendaciones y Bibliografía', 'Pág. 12'],
      ],
      8.5
    );
  }

  // =========================================================================
  // PÁGINA 4: CONTENIDO DEL TRABAJO (INTRO, OBJETIVOS, CLAVES, RESUMEN, VIDEO PITCH)
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(4, 'SEC-04', 'Contenido del Trabajo');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(y, 'Contenido del Trabajo: Introducción, Objetivos y Resumen', 'Sección 4');

    y = drawHeadingLevel2(y, '1. Introducción');
    y = drawApaParagraph(y, contenidoTrabajo.introduccion, {
      indentFirstLine: true,
      fontSize: 8.6,
      maxLines: 10,
    });
    y += 1;

    y = drawHeadingLevel2(y, '2. Objetivos del Proyecto (General y Específicos)');
    y = drawApaParagraph(y, `Objetivo General: ${contenidoTrabajo.objetivoGeneral}`, {
      indentFirstLine: true,
      fontSize: 8.5,
      maxLines: 4,
    });

    contenidoTrabajo.objetivosEspecificos.forEach((obj, idx) => {
      y = drawApaParagraph(y, `• Objetivo Específico ${idx + 1}: ${obj}`, {
        indentFirstLine: false,
        fontSize: 8.3,
        maxLines: 2,
      });
    });
    y += 1;

    y = drawHeadingLevel2(y, '3. Claves de Éxito Competitivo');
    contenidoTrabajo.clavesExito.forEach((clave, idx) => {
      y = drawApaParagraph(y, `• Clave de Éxito #${idx + 1}: ${clave}`, {
        indentFirstLine: false,
        fontSize: 8.3,
        maxLines: 2,
      });
    });
    y += 1;

    y = drawHeadingLevel2(y, '4. Resumen Ejecutivo');
    y = drawApaParagraph(y, contenidoTrabajo.resumenEjecutivo, {
      indentFirstLine: true,
      fontSize: 8.5,
      maxLines: 9,
    });
    y += 2;

    // 5. Video Pitch (NUEVO CAMPO - REQUERIMIENTO 2)
    y = drawHeadingLevel2(y, '5. Video Pitch');
    const pitchUrl = contenidoTrabajo.videoPitch || 'https://www.youtube.com/watch?v=Bieyi5sGznM';
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(APA_MARGIN, y, CONTENT_WIDTH, 10, 1.2, 1.2, 'FD');

    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('Enlace de Sustentación del Video Pitch:', APA_MARGIN + 3.5, y + 6.2);

    doc.setFont(pdfFont, 'normal');
    doc.setTextColor(29, 78, 216);
    doc.text(pitchUrl, APA_MARGIN + 62, y + 6.2);
  }

  // =========================================================================
  // PÁGINA 5: 0. IDEA DE NEGOCIO Y PORTAFOLIO CON IMÁGENES VECTORIALES
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(5, 'SEC-05', '0. Idea de Negocio y Portafolio');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(y, '0. Idea de Negocio y Portafolio de Productos/Servicios', 'Sección 5');

    y = drawHeadingLevel2(y, '0.1. Descripción de la Idea de Negocio');
    y = drawApaParagraph(y, ideaNegocio.descripcion, {
      indentFirstLine: true,
      fontSize: 8.6,
      maxLines: 9,
    });

    y = drawHeadingLevel2(y, '0.2. Justificación, Perfil del Cliente y Oportunidad de Mercado');
    y = drawVectorTable(
      y,
      [
        { label: '0.2. Justificación', width: 55 },
        { label: '0.3. Perfil del Cliente', width: 55 },
        { label: '0.4. Oportunidad de Mercado', width: 55.1 },
      ],
      [
        [
          ideaNegocio.justificacion || '---',
          ideaNegocio.perfilCliente || '---',
          ideaNegocio.oportunidadMercado || '---',
        ],
      ],
      7.6
    );

    // Tabla 4: Portafolio con columna e imágenes vectoriales/renderizadas (REQUERIMIENTO 3)
    y = drawApaTableCaption(y, 'Tabla 4', '0.5. Portafolio de Productos y Servicios (con Imagen/Foto)');

    const tableHeaders = [
      { label: 'Foto', width: 22, align: 'center' as const },
      { label: 'Producto / Servicio', width: 40 },
      { label: 'Tipo', width: 18 },
      { label: 'Descripción Técnica y Especificaciones', width: 60.1 },
      { label: 'Precio ($ COP)', width: 25, align: 'right' as const },
    ];

    // Dibuja cabecera de tabla
    doc.setFillColor(lightTint.r, lightTint.g, lightTint.b);
    doc.rect(APA_MARGIN, y, CONTENT_WIDTH, 6.5, 'F');
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(APA_MARGIN, y, APA_MARGIN + CONTENT_WIDTH, y);
    doc.line(APA_MARGIN, y + 6.5, APA_MARGIN + CONTENT_WIDTH, y + 6.5);

    doc.setFont(pdfFont, 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    let hx = APA_MARGIN;
    tableHeaders.forEach((h) => {
      const tx =
        h.align === 'right'
          ? hx + h.width - 2
          : h.align === 'center'
          ? hx + h.width / 2
          : hx + 2;
      doc.text(h.label, tx, y + 4.4, { align: h.align || 'left' });
      hx += h.width;
    });
    y += 6.5;

    // Filas con imágenes embebidas
    ideaNegocio.portafolio.forEach((p, pIdx) => {
      const pLinesDesc = doc.splitTextToSize(
        `${p.descripcionTecnica} (${p.especificaciones})`,
        56
      );
      const textH = Math.max(pLinesDesc.length * 3.4 + 4, 15);
      const rowH = Math.max(textH, 15);

      if (y + rowH > LETTER_HEIGHT - APA_MARGIN - 4) return;

      if (pIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(APA_MARGIN, y, CONTENT_WIDTH, rowH, 'F');
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(APA_MARGIN, y + rowH, APA_MARGIN + CONTENT_WIDTH, y + rowH);

      // Columna 1: Imagen / Foto
      const pImg = productImages[pIdx];
      const imgX = APA_MARGIN + 2;
      const imgY = y + 1.5;
      const imgW = 18;
      const imgH = 12;

      if (pImg) {
        try {
          doc.addImage(pImg.dataUrl, pImg.format, imgX, imgY, imgW, imgH);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.2);
          doc.rect(imgX, imgY, imgW, imgH, 'S');
        } catch {
          doc.setFillColor(241, 245, 249);
          doc.rect(imgX, imgY, imgW, imgH, 'F');
          doc.setFont(pdfFont, 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(148, 163, 184);
          doc.text('Foto', imgX + imgW / 2, imgY + imgH / 2, { align: 'center' });
        }
      } else {
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(imgX, imgY, imgW, imgH, 'FD');
        doc.setFont(pdfFont, 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text('Sin Foto', imgX + imgW / 2, imgY + imgH / 2 + 1, { align: 'center' });
      }

      // Columna 2: Nombre
      doc.setFont(pdfFont, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const nameLines = doc.splitTextToSize(p.nombre, 36);
      nameLines.forEach((nl: string, nIdx: number) => {
        doc.text(nl, APA_MARGIN + 24, y + 4.5 + nIdx * 3.4);
      });

      // Columna 3: Tipo
      doc.setFont(pdfFont, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(p.tipo, APA_MARGIN + 64, y + 4.5);

      // Columna 4: Descripción y Especificaciones
      doc.setTextColor(51, 65, 85);
      pLinesDesc.forEach((dl: string, dIdx: number) => {
        doc.text(dl, APA_MARGIN + 82, y + 4.5 + dIdx * 3.2);
      });

      // Columna 5: Precio
      doc.setFont(pdfFont, 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formatCurrencyCOP(p.precio), APA_MARGIN + CONTENT_WIDTH - 2, y + 4.5, {
        align: 'right',
      });

      y += rowH;
    });

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(APA_MARGIN, y, APA_MARGIN + CONTENT_WIDTH, y);
  }

  // =========================================================================
  // PÁGINA 6: UNIDAD ESTRATÉGICA I (PARTE A: DIRECCIONAMIENTO Y CADENA DE VALOR)
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(6, 'SEC-06', 'Unidad Estratégica I: Direccionamiento y Cadena de Valor');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(
      y,
      'Unidad Estratégica I: Direccionamiento Estratégico y Cadena de Valor',
      'Sección 6'
    );

    y = drawHeadingLevel2(y, '1.1. Misión y 1.2. Visión Corporativa');
    y = drawVectorTable(
      y,
      [
        { label: '1.1. Misión Institucional', width: 82.5 },
        { label: '1.2. Futuro Preferido (Visión)', width: 82.6 },
      ],
      [[unidadI.mision || '---', unidadI.vision || '---']],
      8
    );

    y = drawHeadingLevel2(y, '1.3. Objetivos Estratégicos, 1.4. Valores y 1.5. Ventaja Competitiva');
    unidadI.objetivosEstrategicos.forEach((obj, idx) => {
      y = drawApaParagraph(y, `• Objetivo Estratégico ${idx + 1}: ${obj}`, {
        indentFirstLine: false,
        fontSize: 8.3,
        maxLines: 2,
      });
    });
    y = drawApaParagraph(y, `Valores Corporativos: ${unidadI.valores.join(' • ')}`, {
      indentFirstLine: false,
      fontSize: 8.3,
      maxLines: 2,
    });
    y = drawApaParagraph(y, `Ventaja Competitiva: ${unidadI.ventajaCompetitiva}`, {
      indentFirstLine: true,
      fontSize: 8.3,
      maxLines: 3,
    });

    y = drawApaTableCaption(y, 'Tabla 5', '1.6. Matriz de Cadena de Valor (Actividades Primarias y de Apoyo)');
    y = drawVectorTable(
      y,
      [
        { label: 'Eslabón de Cadena de Valor', width: 46 },
        { label: 'Descripción Operativa y Generación de Valor', width: 119.1 },
      ],
      [
        ['Logística de Entrada', unidadI.cadenaValor.logisticaEntrada],
        ['Operaciones', unidadI.cadenaValor.operaciones],
        ['Logística de Salida', unidadI.cadenaValor.logisticaSalida],
        ['Marketing y Ventas', unidadI.cadenaValor.marketingVentas],
        ['Servicio Postventa', unidadI.cadenaValor.servicioPostventa],
        ['Infraestructura y RRHH', `${unidadI.cadenaValor.infraestructura} | ${unidadI.cadenaValor.recursosHumanos}`],
        ['Tecnología y Compras', `${unidadI.cadenaValor.desarrolloTecnologico} | ${unidadI.cadenaValor.compras}`],
        ['Análisis de Cadena de Valor', unidadI.cadenaValor.analisis],
      ],
      7.6
    );
  }

  // =========================================================================
  // PÁGINA 7: UNIDAD ESTRATÉGICA I (PARTE B: ESTRUCTURA ORGANIZACIONAL Y ORGANIGRAMA COMPLETO)
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(7, 'SEC-07A', 'Unidad Estratégica I: Estructura Organizacional y Organigrama');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(
      y,
      'Unidad Estratégica I: Estructura Organizacional y Organigrama',
      'Sección 7A'
    );

    y = drawHeadingLevel2(y, `2.1. Estructura Organizacional (${unidadI.organigrama.tipoEstructura})`);
    y = drawApaParagraph(
      y,
      unidadI.organigrama.justificacionCultura ||
        'La estructura organizacional responde a la articulación funcional de los procesos con el direccionamiento estratégico de la empresa.',
      {
        indentFirstLine: true,
        fontSize: 8.5,
        maxLines: 3,
      }
    );
    y += 2;

    y = drawApaTableCaption(
      y,
      'Figura 1',
      `Organigrama Estructural de la Compañía (${unidadI.organigrama.tipoEstructura})`
    );

    if (organigramaImage) {
      const maxAllowedH = Math.min(130, LETTER_HEIGHT - APA_MARGIN - y - 10);
      const aspect =
        organigramaImage.width && organigramaImage.height
          ? organigramaImage.width / organigramaImage.height
          : CONTENT_WIDTH / 115;

      let renderW = CONTENT_WIDTH;
      let renderH = renderW / aspect;

      if (renderH > maxAllowedH) {
        renderH = maxAllowedH;
        renderW = renderH * aspect;
      }

      const renderX = APA_MARGIN + (CONTENT_WIDTH - renderW) / 2;

      try {
        doc.addImage(organigramaImage.dataUrl, organigramaImage.format, renderX, y, renderW, renderH);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.25);
        doc.rect(renderX, y, renderW, renderH, 'S');
        y += renderH + 3.5;
      } catch {
        // fallback
      }
    }

    doc.setFont(pdfFont, 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Nota. Representación gráfica de la arquitectura organizacional, jerarquías de mando y órganos de asesoría (Staff) de ${portada.nombreTrabajo || 'la empresa'}.`,
      APA_MARGIN,
      y + 2
    );
  }

  // =========================================================================
  // PÁGINA 8: UNIDAD ESTRATÉGICA I (PARTE C: PERFILES DE CARGOS Y ESTUDIO LEGAL)
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(8, 'SEC-07B', 'Unidad Estratégica I: Perfiles de Cargos y Estudio Legal');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(
      y,
      'Unidad Estratégica I: Perfiles de Cargos Directivos y Marco Legal',
      'Sección 7B'
    );

    y = drawApaTableCaption(y, 'Tabla 6', '2.2. Perfiles de Cargos y Asignación Salarial Mensual');
    y = drawVectorTable(
      y,
      [
        { label: 'Cargo', width: 38 },
        { label: 'Formación y Experiencia', width: 48 },
        { label: 'Funciones Principales', width: 53.1 },
        { label: 'Salario ($ COP)', width: 26, align: 'right' },
      ],
      unidadI.perfilesCargos.map((c) => [
        c.nombreCargo,
        `${c.formacion} (${c.experiencia})`,
        c.funciones,
        formatCurrencyCOP(c.salarioEstimado),
      ]),
      7.6
    );

    y += 2;
    y = drawApaTableCaption(y, 'Tabla 7', '3. Constitución Societaria, Capital Social y 4. Normatividad');
    y = drawVectorTable(
      y,
      [
        { label: 'Aspecto Legal / Normativo', width: 46 },
        { label: 'Detalle Jurídico y Regulatorio de la Empresa', width: 119.1 },
      ],
      [
        [
          'Razón Social y Sociedad',
          `${unidadI.figuraLegal.razonSocial} (${unidadI.figuraLegal.tipoSociedad} - ${unidadI.figuraLegal.formaJuridica}) | CIIU: ${unidadI.figuraLegal.codigosCIIU}`,
        ],
        ['Objeto Social', unidadI.figuraLegal.objetoSocial],
        [
          'Capital Social',
          `Autorizado: ${formatCurrencyCOP(unidadI.figuraLegal.capitalSocial.autorizado)} | Suscrito: ${formatCurrencyCOP(unidadI.figuraLegal.capitalSocial.suscrito)} | Pagado: ${formatCurrencyCOP(unidadI.figuraLegal.capitalSocial.pagado)}`,
        ],
        ['Normatividad Tributaria', unidadI.normatividad.tributaria],
        ['Normatividad Laboral', unidadI.normatividad.laboral],
        ['Permisos de Funcionamiento', unidadI.normatividad.funcionamiento],
      ],
      7.6
    );
  }

  // =========================================================================
  // PÁGINA 9: UNIDAD ESTRATÉGICA II (PARTE A: INVERSIÓN INICIAL Y FINANCIACIÓN)
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(9, 'SEC-08', 'Unidad Estratégica II: Inversión Inicial y Financiación');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(
      y,
      'Unidad Estratégica II: Modelo Financiero, Inversión y Financiación',
      'Sección 8'
    );

    const totalInversion = calculateInversionTotal(unidadII);
    const totalFinanciacion = calculateFinanciacionTotal(unidadII.financiacion);

    y = drawApaTableCaption(y, 'Tabla 8', '5.1. Plan Detallado de Inversión Inicial del Proyecto');
    const invRows: string[][] = [
      ...unidadII.inversionInicial.efectivoDisponible.map((i) => [
        'Efectivo Disponible',
        i.concepto,
        formatCurrencyCOP(i.monto),
      ]),
      ...unidadII.inversionInicial.inventarios.map((i) => [
        'Inventarios Iniciales',
        i.concepto,
        formatCurrencyCOP(i.monto),
      ]),
      ...unidadII.inversionInicial.propiedadPlantaEquipo.map((i) => [
        'Propiedad, Planta y Equipo',
        `${i.concepto}${i.vidaUtilAnos ? ` (Vida útil: ${i.vidaUtilAnos} años)` : ''}`,
        formatCurrencyCOP(i.monto),
      ]),
      ...unidadII.inversionInicial.intangibles.map((i) => [
        'Activos Intangibles',
        i.concepto,
        formatCurrencyCOP(i.monto),
      ]),
      ['TOTAL INVERSIÓN INICIAL', 'Suma total de activos requeridos', formatCurrencyCOP(totalInversion)],
    ];

    y = drawVectorTable(
      y,
      [
        { label: 'Categoría de Inversión', width: 46 },
        { label: 'Descripción del Rubro / Activo', width: 87.1 },
        { label: 'Monto ($ COP)', width: 32, align: 'right' },
      ],
      invRows,
      7.8
    );

    y = drawApaTableCaption(y, 'Tabla 9', '5.2. Fuentes de Financiación (Capital de Socios y Crédito Externo)');
    const finRows: string[][] = [
      ...unidadII.financiacion.aportesSocios.map((s) => [
        'Capital Propio (Socios)',
        s.concepto,
        formatCurrencyCOP(s.monto),
      ]),
      ...unidadII.financiacion.aportesExternos.map((e) => [
        'Pasivo / Crédito Externo',
        `${e.concepto}${e.tasaInteresAnual ? ` (Tasa: ${e.tasaInteresAnual}% E.A.)` : ''}`,
        formatCurrencyCOP(e.monto),
      ]),
      ['TOTAL FINANCIACIÓN', 'Total recursos de capital y deuda', formatCurrencyCOP(totalFinanciacion)],
    ];

    y = drawVectorTable(
      y,
      [
        { label: 'Fuente de Recursos', width: 46 },
        { label: 'Detalle del Aporte o Entidad Financiera', width: 87.1 },
        { label: 'Monto ($ COP)', width: 32, align: 'right' },
      ],
      finRows,
      7.8
    );
  }

  // =========================================================================
  // PÁGINA 10: UNIDAD ESTRATÉGICA II (PARTE B: COSTOS, GASTOS Y PUNTO DE EQUILIBRIO)
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(10, 'SEC-09', 'Unidad Estratégica II: Costos, Gastos y Punto de Equilibrio');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(
      y,
      'Unidad Estratégica II: Costos, Gastos Fijos y Punto de Equilibrio',
      'Sección 9'
    );

    const totalGastosFijos = calculateGastosFijosMensuales(unidadII.gastosFijos);

    y = drawApaTableCaption(y, 'Tabla 10', '5.3. Estructura de Costos Variables Unitarios');
    y = drawVectorTable(
      y,
      [
        { label: 'Producto o Servicio', width: 95.1 },
        { label: 'Costo Unitario ($ COP)', width: 40, align: 'right' },
        { label: '% Participación', width: 30, align: 'right' },
      ],
      unidadII.costosVariables.map((cv) => [
        cv.producto,
        formatCurrencyCOP(cv.costoUnidad),
        `${cv.porcentajeDelCostoTotal}%`,
      ]),
      8
    );

    y = drawApaTableCaption(y, 'Tabla 11', '5.4. Presupuesto Mensual de Gastos Fijos de Personal y Operación');
    const gastosRows: string[][] = [
      ...unidadII.gastosFijos.gastosPersonal.map((gp) => [
        gp.cargo,
        'Nómina + Prestaciones Sociales',
        formatCurrencyCOP(gp.salarioMensual + gp.prestacionesSociales),
      ]),
      ...unidadII.gastosFijos.otrosGastosFijos.map((og) => [
        og.concepto,
        'Gasto Fijo Operacional',
        formatCurrencyCOP(og.monto),
      ]),
      ['TOTAL GASTOS FIJOS MENSUALES', 'Sumatoria mensual operativa', formatCurrencyCOP(totalGastosFijos)],
    ];

    y = drawVectorTable(
      y,
      [
        { label: 'Rubro / Cargo', width: 80.1 },
        { label: 'Clasificación', width: 50 },
        { label: 'Monto Mensual ($ COP)', width: 35, align: 'right' },
      ],
      gastosRows,
      7.6
    );

    y = drawHeadingLevel2(y, '6. Punto de Equilibrio y 7. Proyección de Ingresos');
    y = drawApaParagraph(
      y,
      `Punto de Equilibrio Mensual: ${unidadII.puntoEquilibrio.unidadesEquilibrioMensual.toLocaleString(
        'es-CO'
      )} unidades equivalentes a ${formatCurrencyCOP(unidadII.puntoEquilibrio.montoEquilibrioMensual)} COP.`,
      { indentFirstLine: false, fontSize: 8.5 }
    );
    y = drawApaParagraph(y, `Escenario 1 y 2: ${unidadII.puntoEquilibrio.ventasMinimas}`, {
      indentFirstLine: true,
      fontSize: 8.3,
      maxLines: 3,
    });
    y = drawApaParagraph(
      y,
      `Escenario 3 (Ingresos y Precios): ${unidadII.fuentesIngresos.proyeccionVentas} ${unidadII.fuentesIngresos.fijacionPrecios}`,
      { indentFirstLine: true, fontSize: 8.3, maxLines: 4 }
    );
  }

  // =========================================================================
  // PÁGINA 11: UNIDAD ESTRATÉGICA III (ESTADOS FINANCIEROS, VPN, TIR E INDICADORES)
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(11, 'SEC-10', 'Unidad Estratégica III: Estados e Indicadores Financieros');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(
      y,
      'Unidad Estratégica III: Estados Financieros, VPN, TIR e Indicadores',
      'Sección 10'
    );

    y = drawApaTableCaption(y, 'Tabla 12', '8. Estado de Resultados Proyectado y 9. Balance General (Año 1)');
    y = drawVectorTable(
      y,
      [
        { label: 'Estado de Resultados (Año 1)', width: 52 },
        { label: 'Valor ($ COP)', width: 30.5, align: 'right' },
        { label: 'Balance General Proyectado', width: 52 },
        { label: 'Valor ($ COP)', width: 30.6, align: 'right' },
      ],
      [
        [
          'Ingresos por Ventas',
          formatCurrencyCOP(unidadIII.estadoResultados.ingresosVentas),
          'Activos Corrientes',
          formatCurrencyCOP(unidadIII.balanceGeneral.activosCorrientes),
        ],
        [
          '(-) Costo de Ventas',
          formatCurrencyCOP(unidadIII.estadoResultados.costosVentas),
          'Activos No Corrientes',
          formatCurrencyCOP(unidadIII.balanceGeneral.activosNoCorrientes),
        ],
        [
          '(=) Utilidad Bruta',
          formatCurrencyCOP(unidadIII.estadoResultados.utilidadBruta),
          'TOTAL ACTIVOS',
          formatCurrencyCOP(unidadIII.balanceGeneral.totalActivos),
        ],
        [
          '(-) Gastos Operacionales',
          formatCurrencyCOP(unidadIII.estadoResultados.gastosOperacionales),
          'Total Pasivos',
          formatCurrencyCOP(unidadIII.balanceGeneral.totalPasivos),
        ],
        [
          '(=) Utilidad Operativa',
          formatCurrencyCOP(unidadIII.estadoResultados.utilidadOperativa),
          'Patrimonio Neto',
          formatCurrencyCOP(unidadIII.balanceGeneral.patrimonio),
        ],
        [
          '(=) UTILIDAD NETA (Después Imp.)',
          formatCurrencyCOP(unidadIII.estadoResultados.utilidadNeta),
          'TOTAL PASIVO + PATRIMONIO',
          formatCurrencyCOP(unidadIII.balanceGeneral.totalPasivos + unidadIII.balanceGeneral.patrimonio),
        ],
      ],
      7.6
    );

    y = drawApaTableCaption(y, 'Tabla 13', '10. Flujo de Caja, VPN, TIR y 11. Indicadores Financieros');
    y = drawVectorTable(
      y,
      [
        { label: 'Indicador / Flujo Financiero', width: 55 },
        { label: 'Resultado Proyectado', width: 35, align: 'right' },
        { label: 'Interpretación y Criterio de Viabilidad', width: 75.1 },
      ],
      [
        [
          'Flujo de Caja Operativo / Neto',
          formatCurrencyCOP(unidadIII.flujoCaja.flujoNetoTotal),
          `Operativo: ${formatCurrencyCOP(unidadIII.flujoCaja.flujoOperativo)} | Inversión: ${formatCurrencyCOP(unidadIII.flujoCaja.flujoInversion)}`,
        ],
        [
          'Valor Presente Neto (VPN)',
          formatCurrencyCOP(unidadIII.flujoCaja.vpn),
          unidadIII.flujoCaja.vpn >= 0 ? 'VPN Positivo: Proyecto crea valor económico' : 'VPN en revisión',
        ],
        [
          'Tasa Interna de Retorno (TIR)',
          `${unidadIII.flujoCaja.tir}% E.A.`,
          'Rentabilidad porcentual esperada sobre la inversión',
        ],
        [
          'Liquidez Corriente',
          `${unidadIII.indicadoresFinancieros.liquidezCorriente}x`,
          'Capacidad de respaldo de obligaciones de corto plazo',
        ],
        [
          'Nivel de Endeudamiento / Margen Bruto',
          `${unidadIII.indicadoresFinancieros.nivelEndeudamiento}% / ${unidadIII.indicadoresFinancieros.margenBruto}%`,
          `Rentabilidad Neta: ${unidadIII.indicadoresFinancieros.rentabilidadNetos}% sobre ventas`,
        ],
      ],
      7.8
    );

    y = drawHeadingLevel2(y, 'Dictamen de Viabilidad Financiera');
    y = drawApaParagraph(
      y,
      `${unidadIII.estadoResultados.analisis} ${unidadIII.indicadoresFinancieros.conclusionFinanciera}`,
      { indentFirstLine: true, fontSize: 8.5, maxLines: 6 }
    );
  }

  // =========================================================================
  // PÁGINA 12: CONCLUSIONES, RECOMENDACIONES Y REFERENCIAS BIBLIOGRÁFICAS
  // =========================================================================
  doc.addPage('letter', 'portrait');
  drawPageChrome(12, 'SEC-11', 'Conclusiones, Recomendaciones y Bibliografía');
  {
    let y = APA_MARGIN + 4;
    y = drawSectionBanner(
      y,
      '12. Conclusiones, Recomendaciones y Referencias Bibliográficas',
      'Sección 11'
    );

    y = drawHeadingLevel2(y, '12.1. Conclusiones del Proyecto');
    unidadIII.conclusionesYRecomendaciones.conclusiones.forEach((c) => {
      y = drawApaParagraph(y, `• ${c}`, {
        indentFirstLine: false,
        fontSize: 8.8,
        maxLines: 4,
      });
    });
    y += 2;

    y = drawHeadingLevel2(y, '12.2. Recomendaciones Estratégicas');
    unidadIII.conclusionesYRecomendaciones.recomendaciones.forEach((r) => {
      y = drawApaParagraph(y, `• ${r}`, {
        indentFirstLine: false,
        fontSize: 8.8,
        maxLines: 4,
      });
    });
    y += 3;

    // 13. Referencias Bibliográficas con Sangría Francesa
    y = drawHeadingLevel2(y, '13. Referencias Bibliográficas');
    doc.setFont(pdfFont, 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(30, 41, 59);

    unidadIII.bibliografia.forEach((ref) => {
      if (!ref) return;
      const firstLineMax = CONTENT_WIDTH;
      const words = ref.trim().split(/\s+/);
      let firstLine = '';
      let wIdx = 0;

      while (wIdx < words.length) {
        const candidate = firstLine ? `${firstLine} ${words[wIdx]}` : words[wIdx];
        if (doc.getTextWidth(candidate) <= firstLineMax || !firstLine) {
          firstLine = candidate;
          wIdx++;
        } else {
          break;
        }
      }

      if (y > LETTER_HEIGHT - APA_MARGIN - 6) return;
      doc.text(firstLine, APA_MARGIN, y + 3.5);
      y += 4.5;

      const rest = words.slice(wIdx).join(' ');
      if (rest) {
        const hangingLines: string[] = doc.splitTextToSize(rest, CONTENT_WIDTH - APA_INDENT);
        hangingLines.forEach((hl) => {
          if (y > LETTER_HEIGHT - APA_MARGIN - 6) return;
          doc.text(hl, APA_MARGIN + APA_INDENT, y + 3.5);
          y += 4.5;
        });
      }
      y += 1.8;
    });
  }

  const safeTitle = (portada.nombreTrabajo || 'Proyecto_CUN').replace(/[^a-zA-Z0-9_\-]/g, '_');
  doc.save(`${safeTitle}_EntregaFinal.pdf`);
}
