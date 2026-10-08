import { OrganigramaNodo, CargoPerfil, TipoNodoOrganigrama } from '../../types/project';

export interface CargoComparisonResult {
  totalNodos: number;
  totalPerfiles: number;
  nodosMatchingCount: number;
  perfilesMatchingCount: number;
  isFullySynced: boolean;
  nodoItems: {
    id: string;
    cargo: string;
    hasMatchInPerfiles: boolean;
    matchingPerfilId?: string;
  }[];
  perfilItems: {
    id: string;
    nombreCargo: string;
    hasMatchInOrganigrama: boolean;
    matchingNodoId?: string;
  }[];
}

/**
 * Normaliza nombres de cargos para comparación (quita tildes, minúsculas, espacios)
 */
export function normalizeCargoName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Compara los cargos registrados en el organigrama (2.1) con los de perfiles de cargos (2.2)
 */
export function compareCargos(
  nodos: OrganigramaNodo[] = [],
  perfiles: CargoPerfil[] = []
): CargoComparisonResult {
  // Filtramos nodos de gobierno colectivo si se desea, o consideramos todos los nodos con cargo válido
  const validNodos = nodos.filter((n) => n.cargo && n.cargo.trim().length > 0);
  const validPerfiles = perfiles.filter((p) => p.nombreCargo && p.nombreCargo.trim().length > 0);

  const perfilNorms = validPerfiles.map((p) => ({
    ...p,
    norm: normalizeCargoName(p.nombreCargo),
  }));

  const nodoItems = validNodos.map((n) => {
    const nNorm = normalizeCargoName(n.cargo);
    const matchedPerfil = perfilNorms.find((p) => {
      if (!p.norm || !nNorm) return false;
      return (
        p.norm === nNorm ||
        p.norm.includes(nNorm) ||
        nNorm.includes(p.norm)
      );
    });

    return {
      id: n.id,
      cargo: n.cargo,
      hasMatchInPerfiles: !!matchedPerfil,
      matchingPerfilId: matchedPerfil?.id,
    };
  });

  const nodoNorms = validNodos.map((n) => ({
    ...n,
    norm: normalizeCargoName(n.cargo),
  }));

  const perfilItems = validPerfiles.map((p) => {
    const pNorm = normalizeCargoName(p.nombreCargo);
    const matchedNodo = nodoNorms.find((n) => {
      if (!pNorm || !n.norm) return false;
      return (
        pNorm === n.norm ||
        pNorm.includes(n.norm) ||
        n.norm.includes(pNorm)
      );
    });

    return {
      id: p.id,
      nombreCargo: p.nombreCargo,
      hasMatchInOrganigrama: !!matchedNodo,
      matchingNodoId: matchedNodo?.id,
    };
  });

  const nodosMatchingCount = nodoItems.filter((i) => i.hasMatchInPerfiles).length;
  const perfilesMatchingCount = perfilItems.filter((i) => i.hasMatchInOrganigrama).length;

  const isFullySynced =
    validPerfiles.length > 0 &&
    perfilesMatchingCount === validPerfiles.length &&
    (nodosMatchingCount >= validPerfiles.length);

  return {
    totalNodos: validNodos.length,
    totalPerfiles: validPerfiles.length,
    nodosMatchingCount,
    perfilesMatchingCount,
    isFullySynced,
    nodoItems,
    perfilItems,
  };
}

/**
 * Clasifica inteligentemente un cargo por su nombre según las normas de estructura organizacional CUN
 */
function classifyCargo(nombreCargo: string): {
  tipo: TipoNodoOrganigrama;
  color: string;
  areaSugerida: string;
} {
  const norm = normalizeCargoName(nombreCargo);

  // 1. Staff / Asesoría externa o interna sin mando de línea
  if (
    norm.includes('revisor') ||
    norm.includes('contador') ||
    norm.includes('asesor') ||
    norm.includes('juridico') ||
    norm.includes('legal') ||
    norm.includes('auditor') ||
    norm.includes('consultor') ||
    norm.includes('abogado')
  ) {
    return {
      tipo: 'staff',
      color: '#475569',
      areaSugerida: 'Staff / Órgano Asesor',
    };
  }

  // 2. Alta Dirección / Gerencia General
  if (
    norm.includes('gerente general') ||
    norm.includes('presidente') ||
    norm.includes('director general') ||
    norm.includes('representante legal') ||
    norm.includes('ceo') ||
    norm.includes('administrador general') ||
    norm.includes('gerente') && !norm.includes('area') && !norm.includes('departamento')
  ) {
    return {
      tipo: 'directivo',
      color: '#1d4ed8',
      areaSugerida: 'Dirección General',
    };
  }

  // 3. Departamentos / Jefaturas / Mandos Medios
  if (
    norm.includes('director') ||
    norm.includes('jefe') ||
    norm.includes('coordinador') ||
    norm.includes('lider') ||
    norm.includes('subgerente') ||
    norm.includes('ejecutivo de ventas') ||
    norm.includes('ejecutivo comercial') ||
    norm.includes('responsable')
  ) {
    let area = 'Área Departamental';
    if (norm.includes('comercial') || norm.includes('ventas') || norm.includes('mercadeo')) {
      area = 'Área Comercial y Mercadeo';
    } else if (norm.includes('operacion') || norm.includes('produccion') || norm.includes('planta') || norm.includes('calidad')) {
      area = 'Área de Operaciones y Calidad';
    } else if (norm.includes('financier') || norm.includes('contab') || norm.includes('administrativ')) {
      area = 'Área Administrativa y Financiera';
    } else if (norm.includes('talento') || norm.includes('humano') || norm.includes('recursos')) {
      area = 'Gestión Humana';
    }
    return {
      tipo: 'departamento',
      color: '#059669',
      areaSugerida: area,
    };
  }

  // 4. Operativos y asistenciales
  let area = 'Área Operativa';
  if (norm.includes('produccion') || norm.includes('operario') || norm.includes('maquina') || norm.includes('planta')) {
    area = 'Planta de Producción';
  } else if (norm.includes('venta') || norm.includes('comercial') || norm.includes('atencion')) {
    area = 'Canales Comerciales';
  } else if (norm.includes('auxiliar contable') || norm.includes('asistente administrativ')) {
    area = 'Soporte Administrativo';
  }

  return {
    tipo: 'operativo',
    color: '#0d9488',
    areaSugerida: area,
  };
}

/**
 * Genera la estructura completa de nodos del organigrama a partir de los perfiles registrados en la sección 2.2
 */
export function buildOrganigramaFromPerfiles(
  perfiles: CargoPerfil[],
  existingNodos: OrganigramaNodo[] = []
): OrganigramaNodo[] {
  if (!perfiles || perfiles.length === 0) {
    return existingNodos.length > 0 ? existingNodos : [];
  }

  const newNodos: OrganigramaNodo[] = [];

  // 1. Nodo Superior de Gobierno (Junta de Socios / Asamblea de Accionistas)
  // Requisito estándar en planes de negocio CUN (Persona Jurídica S.A.S. o Sociedad)
  const rootId = 'org-root-asamblea';
  newNodos.push({
    id: rootId,
    cargo: 'Junta de Socios / Asamblea General',
    nombre: 'Accionistas Fundadores',
    area: 'Alta Dirección',
    tipo: 'directivo',
    parentId: null,
    color: '#003366',
  });

  // 2. Identificar el cargo de Gerencia General / Máxima Línea de Mando
  let leaderPerfilIndex = perfiles.findIndex((p) => {
    const norm = normalizeCargoName(p.nombreCargo);
    return (
      norm.includes('gerente general') ||
      norm.includes('director general') ||
      norm.includes('presidente') ||
      norm.includes('gerente')
    );
  });
  if (leaderPerfilIndex === -1) leaderPerfilIndex = 0;

  const leaderPerfil = perfiles[leaderPerfilIndex];
  const leaderId = `org-lider-${leaderPerfil.id || 'gerente'}`;

  newNodos.push({
    id: leaderId,
    cargo: leaderPerfil.nombreCargo,
    nombre: leaderPerfil.salarioEstimado
      ? `Salario: $${leaderPerfil.salarioEstimado.toLocaleString('es-CO')}`
      : 'Dirección General',
    area: 'Dirección General y Estrategia',
    tipo: 'directivo',
    parentId: rootId,
    color: '#1d4ed8',
  });

  // 3. Procesar los demás cargos
  const remainingPerfiles = perfiles.filter((_, idx) => idx !== leaderPerfilIndex);

  // Separar en: staff, departamentos (jefes), y operativos
  const classified = remainingPerfiles.map((p) => ({
    perfil: p,
    meta: classifyCargo(p.nombreCargo),
  }));

  const staffList = classified.filter((c) => c.meta.tipo === 'staff');
  const deptList = classified.filter((c) => c.meta.tipo === 'departamento');
  const operList = classified.filter((c) => c.meta.tipo === 'operativo');

  // A. Agregar Staff (cuelgan del Líder con línea discontinua lateral)
  staffList.forEach((c) => {
    newNodos.push({
      id: `org-staff-${c.perfil.id}`,
      cargo: c.perfil.nombreCargo,
      nombre: c.perfil.salarioEstimado
        ? `Honorarios: $${c.perfil.salarioEstimado.toLocaleString('es-CO')}`
        : 'Asesoría Externa',
      area: c.meta.areaSugerida,
      tipo: 'staff',
      parentId: leaderId,
      color: c.meta.color,
    });
  });

  // B. Agregar Departamentos / Jefaturas (cuelgan del Líder)
  const deptNodeIds: { [areaKey: string]: string } = {};

  deptList.forEach((c) => {
    const deptId = `org-dept-${c.perfil.id}`;
    deptNodeIds[c.meta.areaSugerida] = deptId;

    newNodos.push({
      id: deptId,
      cargo: c.perfil.nombreCargo,
      nombre: c.perfil.salarioEstimado
        ? `Salario: $${c.perfil.salarioEstimado.toLocaleString('es-CO')}`
        : '',
      area: c.meta.areaSugerida,
      tipo: 'departamento',
      parentId: leaderId,
      color: c.meta.color,
    });
  });

  // C. Agregar Operativos
  // Si hay departamentos, colgarlos del departamento más afín; si no, del líder
  operList.forEach((c) => {
    let parentId = leaderId;

    // Buscar si existe un departamento afín
    const norm = normalizeCargoName(c.perfil.nombreCargo);
    if (norm.includes('ventas') || norm.includes('comercial')) {
      const match = deptList.find((d) => normalizeCargoName(d.perfil.nombreCargo).includes('comercial') || normalizeCargoName(d.perfil.nombreCargo).includes('ventas'));
      if (match) parentId = `org-dept-${match.perfil.id}`;
    } else if (norm.includes('produccion') || norm.includes('operario') || norm.includes('planta') || norm.includes('calidad')) {
      const match = deptList.find((d) => normalizeCargoName(d.perfil.nombreCargo).includes('operacion') || normalizeCargoName(d.perfil.nombreCargo).includes('produccion') || normalizeCargoName(d.perfil.nombreCargo).includes('calidad'));
      if (match) parentId = `org-dept-${match.perfil.id}`;
    } else if (norm.includes('contab') || norm.includes('financier') || norm.includes('administrativ')) {
      const match = deptList.find((d) => normalizeCargoName(d.perfil.nombreCargo).includes('administrativ') || normalizeCargoName(d.perfil.nombreCargo).includes('financier'));
      if (match) parentId = `org-dept-${match.perfil.id}`;
    } else {
      // Tomar el primer departamento si existe
      if (deptList.length > 0) {
        parentId = `org-dept-${deptList[0].perfil.id}`;
      }
    }

    newNodos.push({
      id: `org-oper-${c.perfil.id}`,
      cargo: c.perfil.nombreCargo,
      nombre: c.perfil.salarioEstimado
        ? `Salario: $${c.perfil.salarioEstimado.toLocaleString('es-CO')}`
        : '',
      area: c.meta.areaSugerida,
      tipo: 'operativo',
      parentId,
      color: c.meta.color,
    });
  });

  return newNodos;
}

/**
 * Genera la lista de perfiles de cargos (2.2) a partir de los nodos del organigrama (2.1)
 */
export function buildPerfilesFromOrganigrama(
  nodos: OrganigramaNodo[],
  existingPerfiles: CargoPerfil[] = []
): CargoPerfil[] {
  if (!nodos || nodos.length === 0) return existingPerfiles;

  // Filtrar el nodo de gobierno colectivo (Junta de Socios / Asamblea) si no es un cargo laboral directo
  const jobNodos = nodos.filter((n) => {
    const norm = normalizeCargoName(n.cargo);
    return !(norm.includes('junta de socios') || norm.includes('asamblea general') || norm.includes('asamblea de accionistas'));
  });

  // Si no quedaron nodos (ej: solo había junta), usar todos los nodos
  const targetNodos = jobNodos.length > 0 ? jobNodos : nodos;

  const result: CargoPerfil[] = [];

  targetNodos.forEach((nodo, idx) => {
    const norm = normalizeCargoName(nodo.cargo);
    // Buscar si ya existía un perfil para este cargo
    const existing = existingPerfiles.find((p) => {
      const pNorm = normalizeCargoName(p.nombreCargo);
      return pNorm === norm || pNorm.includes(norm) || norm.includes(pNorm);
    });

    if (existing) {
      result.push({
        ...existing,
        nombreCargo: nodo.cargo, // Asegurar el nombre exacto del organigrama
      });
      return;
    }

    // Si es nuevo, generar datos realistas coherentes con el cargo
    let salarioEstimado = 2000000;
    let formacion = 'Profesional universitario en áreas afines al cargo.';
    let experiencia = 'Mínimo 2 años de experiencia relacionada.';
    let funciones = `Planificar, coordinar y ejecutar las actividades correspondientes a ${nodo.area || 'su área funcional'}.`;
    let habilidades = 'Trabajo en equipo, liderazgo, comunicación asertiva y orientación a resultados.';

    if (nodo.tipo === 'directivo' || norm.includes('gerente')) {
      salarioEstimado = 4500000;
      formacion = 'Profesional en Administración de Empresas, Ingeniería o afines con posgrado en Gerencia.';
      experiencia = 'Mínimo 4 a 5 años en cargos directivos y liderazgo de equipos.';
      funciones = 'Liderar la planeación estratégica, toma de decisiones, representación legal y sostenibilidad financiera de la empresa.';
      habilidades = 'Liderazgo transformacional, visión estratégica, negociación de alto nivel y toma de decisiones.';
    } else if (nodo.tipo === 'staff' || norm.includes('revisor') || norm.includes('contador')) {
      salarioEstimado = 2800000;
      formacion = 'Contador Público o Abogado con tarjeta profesional vigente y especialización.';
      experiencia = 'Mínimo 3 años en asesoría tributaria, contable o legal corporativa.';
      funciones = 'Auditoría interna, revisión fiscal, dictamen de estados financieros y cumplimiento normativo vigente.';
      habilidades = 'Pensamiento crítico, ética profesional, precisión analítica y actualización normativa continua.';
    } else if (nodo.tipo === 'departamento' || norm.includes('director') || norm.includes('jefe') || norm.includes('coordinador')) {
      salarioEstimado = 3500000;
      formacion = 'Profesional universitario graduado en carreras afines al departamento.';
      experiencia = 'Mínimo 3 años de experiencia en gestión de equipos y supervisión de procesos.';
      funciones = `Dirigir las operaciones de ${nodo.area || 'su departamento'}, optimizar recursos y asegurar el cumplimiento de KPIs organizacionales.`;
      habilidades = 'Gestión por procesos, resolución de problemas, liderazgo de equipos y agilidad operativa.';
    } else {
      salarioEstimado = 1750000;
      formacion = 'Técnico o tecnólogo en áreas técnicas, operativas o administrativas.';
      experiencia = '1 a 2 años de experiencia en labores operativas.';
      funciones = `Ejecutar los procesos operativos diarios de ${nodo.area || 'su puesto'} cumpliendo con los estándares de calidad y seguridad.`;
      habilidades = 'Responsabilidad, destreza técnica, puntualidad y trabajo colaborativo.';
    }

    result.push({
      id: `cargo-sync-${Date.now()}-${idx}`,
      nombreCargo: nodo.cargo,
      funciones,
      formacion,
      experiencia,
      habilidades,
      salarioEstimado,
    });
  });

  return result;
}
