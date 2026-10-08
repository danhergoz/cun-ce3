export interface Integrante {
  id: string;
  nombre: string;
  facultad: string;
  carrera: string;
  grupo: string;
}

export interface AutorCompromiso {
  id: string;
  nombreCompleto: string;
  programaAcademico: string;
  identificacion: string;
  firmaImgUrl?: string;
}

export interface PortafolioItem {
  id: string;
  nombre: string;
  tipo: 'Producto' | 'Servicio';
  precio: number;
  descripcionTecnica: string;
  especificaciones: string;
  imagenUrl?: string;
}

export type TipoNodoOrganigrama = 'directivo' | 'staff' | 'departamento' | 'operativo';

export interface OrganigramaNodo {
  id: string;
  cargo: string;
  nombre?: string;
  area: string;
  parentId?: string | null;
  tipo?: TipoNodoOrganigrama;
  color?: string;
}

export interface CargoPerfil {
  id: string;
  nombreCargo: string;
  funciones: string;
  formacion: string;
  experiencia: string;
  habilidades: string;
  salarioEstimado: number;
}

export interface ItemFinanciero {
  id: string;
  concepto: string;
  monto: number;
  detalles?: string;
  vidaUtilAnos?: number;
  depreciacionAnual?: number;
  tasaInteresAnual?: number;
}

export interface ItemCostoVariable {
  id: string;
  producto: string;
  costoUnidad: number;
  porcentajeDelCostoTotal: number;
}

export interface ItemGastoPersonal {
  id: string;
  cargo: string;
  salarioMensual: number;
  prestacionesSociales: number;
}

export interface ProjectData {
  // Configuración general de plantilla y formato
  designConfig: {
    templateId:
      | 'cun-oficial'
      | 'ejecutivo-moderno'
      | 'innovacion-startup'
      | 'minimalista-elegante'
      | 'cun-opcion-6'
      | 'cun-opcion-7';
    primaryColor: string;
    fontFamily: 'sans' | 'serif' | 'mono';
    logoUrl?: string;
    incluirFirmasDigitales: boolean;
    mostrarNumeroPagina: boolean;
  };

  // Portada
  portada: {
    nombreTrabajo: string;
    materia: string;
    docente: string;
    integrantes: Integrante[];
    institucion: string;
    ciudad: string;
    ano: string;
  };

  // Compromisos de Autor
  compromisosAutor: {
    autores: AutorCompromiso[];
    declaracionAceptada: boolean;
  };

  // Contenido Inicial
  contenidoTrabajo: {
    introduccion: string; // Mínimo 150 palabras
    objetivoGeneral: string;
    objetivosEspecificos: string[]; // Mínimo 3
    clavesExito: string[]; // Mínimo 3
    resumenEjecutivo: string; // Mínimo 150 palabras
    videoPitch?: string; // Enlace al video pitch (ej: YouTube)
  };

  // Idea de Negocio
  ideaNegocio: {
    descripcion: string; // Mínimo 200 palabras
    justificacion: string; // Máximo 5 líneas
    perfilCliente: string; // Máximo 5 líneas
    oportunidadMercado: string; // Máximo 5 líneas
    portafolio: PortafolioItem[]; // Mínimo 4 productos/servicios
  };

  // Unidad Estratégica I
  unidadI: {
    mision: string;
    vision: string;
    objetivosEstrategicos: string[]; // Mínimo 3
    valores: string[]; // 3 a 10
    ventajaCompetitiva: string;
    cadenaValor: {
      logisticaEntrada: string;
      operaciones: string;
      logisticaSalida: string;
      marketingVentas: string;
      servicioPostventa: string;
      infraestructura: string;
      recursosHumanos: string;
      desarrolloTecnologico: string;
      compras: string;
      analisis: string;
      imagenUrl?: string;
    };
    organigrama: {
      tipoEstructura: string;
      justificacionCultura: string; // Máximo 200 caracteres
      imagenUrl?: string;
      nodos?: OrganigramaNodo[];
    };
    perfilesCargos: CargoPerfil[];
    figuraLegal: {
      formaJuridica: 'Persona Natural' | 'Persona Jurídica' | string;
      justificacionForma: string; // Máximo 5 líneas
      tipoSociedad: 'S.A.S.' | 'S.A.' | 'Ltda.' | 'E.U.' | string;
      justificacionSociedad: string; // Máximo 5 líneas
      razonSocial: string;
      justificacionNombre: string; // Máximo 5 líneas
      objetoSocial: string;
      codigosCIIU: string;
      capitalSocial: {
        autorizado: number;
        suscrito: number;
        pagado: number;
        argumentacion: string;
      };
    };
    normatividad: {
      tributaria: string;
      laboral: string;
      funcionamiento: string;
    };
  };

  // Unidad Estratégica II (Modelo Financiero)
  unidadII: {
    inversionInicial: {
      efectivoDisponible: ItemFinanciero[];
      inventarios: ItemFinanciero[];
      propiedadPlantaEquipo: ItemFinanciero[];
      intangibles: ItemFinanciero[];
    };
    financiacion: {
      aportesSocios: ItemFinanciero[];
      aportesExternos: ItemFinanciero[];
    };
    costosVariables: ItemCostoVariable[];
    gastosFijos: {
      gastosPersonal: ItemGastoPersonal[];
      otrosGastosFijos: ItemFinanciero[];
    };
    puntoEquilibrio: {
      estacionalidadCapacidad: string; // Escenario 1
      ventasMinimas: string; // Escenario 2
      unidadesEquilibrioMensual: number;
      montoEquilibrioMensual: number;
    };
    fuentesIngresos: {
      proyeccionVentas: string; // Escenario 3
      fijacionPrecios: string;
    };
  };

  // Unidad Estratégica III (Estados e Indicadores)
  unidadIII: {
    estadoResultados: {
      ingresosVentas: number;
      costosVentas: number;
      utilidadBruta: number;
      gastosOperacionales: number;
      utilidadOperativa: number;
      impuestos: number;
      utilidadNeta: number;
      analisis: string;
    };
    balanceGeneral: {
      activosCorrientes: number;
      activosNoCorrientes: number;
      totalActivos: number;
      pasivosCorrientes: number;
      pasivosNoCorrientes: number;
      totalPasivos: number;
      patrimonio: number;
      analisis: string;
    };
    flujoCaja: {
      flujoOperativo: number;
      flujoInversion: number;
      flujoFinanciero: number;
      flujoNetoTotal: number;
      vpn: number; // Valor Presente Neto
      tir: number; // Tasa Interna de Retorno (%)
      analisis: string;
    };
    indicadoresFinancieros: {
      liquidezCorriente: number;
      nivelEndeudamiento: number; // %
      rentabilidadNetos: number; // %
      margenBruto: number; // %
      conclusionFinanciera: string;
    };
    conclusionesYRecomendaciones: {
      conclusiones: string[];
      recomendaciones: string[];
    };
    bibliografia: string[]; // Referencias APA
  };
}
