import { ProjectData } from '../types/project';

export interface ValidationError {
  fieldId: string;
  label: string;
  message: string;
}

export interface SectionValidationResult {
  tabId: string;
  tabLabel: string;
  isValid: boolean;
  errors: ValidationError[];
  completedCount: number;
  totalRequiredCount: number;
  percentage: number;
}

export function validatePortada(data: ProjectData['portada']): SectionValidationResult {
  const errors: ValidationError[] = [];
  let completedCount = 0;
  const totalRequiredCount = 6;

  if (data.nombreTrabajo?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'nombreTrabajo', label: 'Nombre del Trabajo / Empresa', message: 'El título del proyecto es obligatorio.' });
  }

  if (data.materia?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'materia', label: 'Asignatura / Curso', message: 'El nombre de la materia es obligatorio.' });
  }

  if (data.docente?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'docente', label: 'Docente', message: 'El nombre del docente es obligatorio.' });
  }

  if (data.ciudad?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'ciudad', label: 'Ciudad', message: 'La ciudad de presentación es obligatoria.' });
  }

  if (data.ano?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'ano', label: 'Año', message: 'El año de presentación es obligatorio.' });
  }

  const validIntegrantes = data.integrantes?.filter((i) => i.nombre?.trim().length > 0) || [];
  if (validIntegrantes.length >= 1) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'integrantes', label: 'Integrantes del Equipo', message: 'Debe incluir al menos 1 integrante con nombre completo.' });
  }

  const percentage = Math.round((completedCount / totalRequiredCount) * 100);

  return {
    tabId: 'portada',
    tabLabel: '1. Portada',
    isValid: errors.length === 0,
    errors,
    completedCount,
    totalRequiredCount,
    percentage,
  };
}

export function validateCompromisos(data: ProjectData['compromisosAutor']): SectionValidationResult {
  const errors: ValidationError[] = [];
  let completedCount = 0;
  const totalRequiredCount = 2;

  if (data.declaracionAceptada) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'declaracionAceptada', label: 'Declaración Legal Anticorrupción', message: 'Debe aceptar la declaración legal y de autoría.' });
  }

  const validAutores = data.autores?.filter((a) => a.nombreCompleto?.trim() && a.identificacion?.trim()) || [];
  if (validAutores.length >= 1) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'autores', label: 'Lista de Autores', message: 'Debe incluir al menos 1 autor con nombre completo e identificación.' });
  }

  const percentage = Math.round((completedCount / totalRequiredCount) * 100);

  return {
    tabId: 'compromisos',
    tabLabel: '2. Compromisos',
    isValid: errors.length === 0,
    errors,
    completedCount,
    totalRequiredCount,
    percentage,
  };
}

export function validateContenido(data: ProjectData['contenidoTrabajo']): SectionValidationResult {
  const errors: ValidationError[] = [];
  let completedCount = 0;
  const totalRequiredCount = 5;

  if (data.introduccion?.trim() && data.introduccion.trim().length >= 30) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'introduccion', label: 'Introducción del Trabajo', message: 'La introducción debe estar redactada.' });
  }

  if (data.objetivoGeneral?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'objetivoGeneral', label: 'Objetivo General', message: 'El objetivo general es obligatorio.' });
  }

  const validObjs = data.objetivosEspecificos?.filter((o) => o.trim().length > 0) || [];
  if (validObjs.length >= 3) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'objetivosEspecificos', label: 'Objetivos Específicos', message: 'Debe ingresar al menos 3 objetivos específicos.' });
  }

  const validClaves = data.clavesExito?.filter((c) => c.trim().length > 0) || [];
  if (validClaves.length >= 3) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'clavesExito', label: 'Claves de Éxito', message: 'Debe definir al menos 3 factores clave de éxito.' });
  }

  if (data.resumenEjecutivo?.trim() && data.resumenEjecutivo.trim().length >= 30) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'resumenEjecutivo', label: 'Resumen Ejecutivo', message: 'El resumen ejecutivo es obligatorio.' });
  }

  const percentage = Math.round((completedCount / totalRequiredCount) * 100);

  return {
    tabId: 'contenido',
    tabLabel: '3. Contenido',
    isValid: errors.length === 0,
    errors,
    completedCount,
    totalRequiredCount,
    percentage,
  };
}

export function validateIdeaNegocio(data: ProjectData['ideaNegocio']): SectionValidationResult {
  const errors: ValidationError[] = [];
  let completedCount = 0;
  const totalRequiredCount = 5;

  if (data.descripcion?.trim() && data.descripcion.trim().length >= 30) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'descripcion', label: 'Descripción de la Idea de Negocio', message: 'La descripción de la idea de negocio es obligatoria.' });
  }

  if (data.justificacion?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'justificacion', label: 'Justificación del Negocio', message: 'La justificación es obligatoria.' });
  }

  if (data.perfilCliente?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'perfilCliente', label: 'Perfil del Cliente / Buyer Persona', message: 'El perfil del cliente es obligatorio.' });
  }

  if (data.oportunidadMercado?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'oportunidadMercado', label: 'Oportunidad de Mercado', message: 'La oportunidad de mercado es obligatoria.' });
  }

  const validPortafolio = data.portafolio?.filter((p) => p.nombre?.trim() && p.precio > 0) || [];
  if (validPortafolio.length >= 1) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'portafolio', label: 'Portafolio de Productos/Servicios', message: 'Debe agregar al menos 1 producto o servicio con nombre y precio válido.' });
  }

  const percentage = Math.round((completedCount / totalRequiredCount) * 100);

  return {
    tabId: 'idea',
    tabLabel: '4. Idea Negocio',
    isValid: errors.length === 0,
    errors,
    completedCount,
    totalRequiredCount,
    percentage,
  };
}

export function validateUnidadI(data: ProjectData['unidadI']): SectionValidationResult {
  const errors: ValidationError[] = [];
  let completedCount = 0;
  const totalRequiredCount = 6;

  if (data.mision?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'mision', label: 'Misión Institucional', message: 'La misión es obligatoria.' });
  }

  if (data.vision?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'vision', label: 'Visión Institucional', message: 'La visión a 10-20 años es obligatoria.' });
  }

  const validObjEstrategicos = data.objetivosEstrategicos?.filter((o) => o.trim().length > 0) || [];
  if (validObjEstrategicos.length >= 3) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'objetivosEstrategicos', label: 'Objetivos Estratégicos', message: 'Debe ingresar al menos 3 objetivos estratégicos.' });
  }

  if (data.ventajaCompetitiva?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'ventajaCompetitiva', label: 'Ventaja Competitiva', message: 'La ventaja competitiva es obligatoria.' });
  }

  if (data.figuraLegal?.razonSocial?.trim() && data.figuraLegal?.objetoSocial?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'figuraLegal', label: 'Figura Legal y Razón Social', message: 'La razón social y el objeto social son obligatorios.' });
  }

  if (data.normatividad?.tributaria?.trim() && data.normatividad?.laboral?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'normatividad', label: 'Marco Normativo (Tributario y Laboral)', message: 'La normatividad tributaria y laboral son obligatorias.' });
  }

  const percentage = Math.round((completedCount / totalRequiredCount) * 100);

  return {
    tabId: 'unidad1',
    tabLabel: '5. Unidad I',
    isValid: errors.length === 0,
    errors,
    completedCount,
    totalRequiredCount,
    percentage,
  };
}

export function validateUnidadII(data: ProjectData['unidadII']): SectionValidationResult {
  const errors: ValidationError[] = [];
  let completedCount = 0;
  const totalRequiredCount = 4;

  const totalInversion = [
    ...(data.inversionInicial?.efectivoDisponible || []),
    ...(data.inversionInicial?.inventarios || []),
    ...(data.inversionInicial?.propiedadPlantaEquipo || []),
    ...(data.inversionInicial?.intangibles || []),
  ].reduce((acc, curr) => acc + (curr.monto || 0), 0);

  if (totalInversion > 0) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'inversionInicial', label: 'Inversión Inicial', message: 'Debe registrar al menos un ítem de inversión inicial.' });
  }

  if (data.costosVariables && data.costosVariables.length > 0) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'costosVariables', label: 'Costos Variables', message: 'Debe registrar los costos variables por producto/servicio.' });
  }

  if (data.puntoEquilibrio?.estacionalidadCapacidad?.trim() || data.puntoEquilibrio?.ventasMinimas?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'puntoEquilibrio', label: 'Punto de Equilibrio y Escenarios', message: 'Debe ingresar la argumentación de estacionalidad o ventas mínimas.' });
  }

  if (data.fuentesIngresos?.proyeccionVentas?.trim()) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'fuentesIngresos', label: 'Fuentes de Ingresos y Proyección', message: 'La proyección de ventas e ingresos es obligatoria.' });
  }

  const percentage = Math.round((completedCount / totalRequiredCount) * 100);

  return {
    tabId: 'unidad2',
    tabLabel: '6. Unidad II',
    isValid: errors.length === 0,
    errors,
    completedCount,
    totalRequiredCount,
    percentage,
  };
}

export function validateUnidadIII(data: ProjectData['unidadIII']): SectionValidationResult {
  const errors: ValidationError[] = [];
  let completedCount = 0;
  const totalRequiredCount = 4;

  if (data.estadoResultados?.analisis?.trim() || data.estadoResultados?.ingresosVentas > 0) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'estadoResultados', label: 'Estado de Resultados y Análisis', message: 'El análisis del estado de resultados es obligatorio.' });
  }

  if (data.flujoCaja?.analisis?.trim() || data.flujoCaja?.vpn !== 0) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'flujoCaja', label: 'Flujo de Caja, VPN y TIR', message: 'El análisis de flujo de caja y rentabilidad (VPN / TIR) es obligatorio.' });
  }

  const validConclusiones = data.conclusionesYRecomendaciones?.conclusiones?.filter((c) => c.trim().length > 0) || [];
  if (validConclusiones.length >= 1) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'conclusiones', label: 'Conclusiones del Proyecto', message: 'Debe incluir al menos 1 conclusión del estudio de factibilidad.' });
  }

  const validBiblio = data.bibliografia?.filter((b) => b.trim().length > 0) || [];
  if (validBiblio.length >= 1) {
    completedCount++;
  } else {
    errors.push({ fieldId: 'bibliografia', label: 'Bibliografía (Normas APA 7ma ed.)', message: 'Debe incluir al menos 1 referencia bibliográfica.' });
  }

  const percentage = Math.round((completedCount / totalRequiredCount) * 100);

  return {
    tabId: 'unidad3',
    tabLabel: '7. Unidad III',
    isValid: errors.length === 0,
    errors,
    completedCount,
    totalRequiredCount,
    percentage,
  };
}

export function validateDiseno(data: ProjectData['designConfig']): SectionValidationResult {
  return {
    tabId: 'diseno',
    tabLabel: '8. Plantilla PDF',
    isValid: true,
    errors: [],
    completedCount: 1,
    totalRequiredCount: 1,
    percentage: 100,
  };
}

export function validateSection(tabId: string, projectData: ProjectData): SectionValidationResult {
  switch (tabId) {
    case 'portada':
      return validatePortada(projectData.portada);
    case 'compromisos':
      return validateCompromisos(projectData.compromisosAutor);
    case 'contenido':
      return validateContenido(projectData.contenidoTrabajo);
    case 'idea':
      return validateIdeaNegocio(projectData.ideaNegocio);
    case 'unidad1':
      return validateUnidadI(projectData.unidadI);
    case 'unidad2':
      return validateUnidadII(projectData.unidadII);
    case 'unidad3':
      return validateUnidadIII(projectData.unidadIII);
    case 'diseno':
      return validateDiseno(projectData.designConfig);
    default:
      return {
        tabId,
        tabLabel: tabId,
        isValid: true,
        errors: [],
        completedCount: 1,
        totalRequiredCount: 1,
        percentage: 100,
      };
  }
}

export function validateAllSections(projectData: ProjectData): Record<string, SectionValidationResult> {
  const tabs = ['portada', 'compromisos', 'contenido', 'idea', 'unidad1', 'unidad2', 'unidad3', 'diseno'];
  const results: Record<string, SectionValidationResult> = {};
  for (const tab of tabs) {
    results[tab] = validateSection(tab, projectData);
  }
  return results;
}
