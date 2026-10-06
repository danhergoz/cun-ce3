import { ProjectData } from '../types/project';
import customSampleJson from './customSample.json';

export const sampleProjectData: ProjectData = {
  designConfig: {
    templateId: 'cun-oficial',
    primaryColor: '#003366', // Azul CUN tradicional
    fontFamily: 'sans',
    logoUrl: '',
    incluirFirmasDigitales: true,
    mostrarNumeroPagina: true,
  },

  portada: {
    nombreTrabajo: 'Plan de Negocio y Modelo de Innovación: EcoPack Solutions S.A.S.',
    materia: 'Creación de Empresas III - Modelos de Innovación',
    docente: 'Daniel Hernández Gómez',
    integrantes: [
      {
        id: '1',
        nombre: 'Daniel Hernández Gómez',
        facultad: 'Escuela de Ciencias Administrativas',
        carrera: 'Administración de Empresas',
        grupo: 'G024',
      },
      {
        id: '2',
        nombre: 'Valeria Martínez López',
        facultad: 'Escuela de Ciencias Administrativas',
        carrera: 'Administración de Empresas',
        grupo: 'G024',
      },
      {
        id: '3',
        nombre: 'Santiago Ramírez Castro',
        facultad: 'Escuela de Ingeniería',
        carrera: 'Ingeniería Industrial',
        grupo: 'G024',
      },
    ],
    institucion: 'Corporación Unificada Nacional de Educación Superior (CUN)',
    ciudad: 'Bogotá D.C., Colombia',
    ano: '2026',
  },

  compromisosAutor: {
    autores: [
      {
        id: '1',
        nombreCompleto: 'Daniel Hernández Gómez',
        programaAcademico: 'Administración de Empresas',
        identificacion: '1.018.452.890',
        firmaImgUrl: '',
      },
      {
        id: '2',
        nombreCompleto: 'Valeria Martínez López',
        programaAcademico: 'Administración de Empresas',
        identificacion: '1.020.893.112',
        firmaImgUrl: '',
      },
      {
        id: '3',
        nombreCompleto: 'Santiago Ramírez Castro',
        programaAcademico: 'Ingeniería Industrial',
        identificacion: '1.015.341.009',
        firmaImgUrl: '',
      },
    ],
    declaracionAceptada: true,
  },

  contenidoTrabajo: {
    introduccion: `El presente proyecto de curso expone la estructuración integral de EcoPack Solutions S.A.S., una iniciativa empresarial colombiana dedicada al diseño, fabricación y comercialización de empaques y recipientes compostables elaborados a partir de almidón de yuca y bagazo de caña de azúcar. Esta iniciativa surge como respuesta directa a la urgente problemática ambiental generada por la contaminación de plásticos de un solo uso y el cumplimiento estricto de la Ley 2232 de 2022 en Colombia, la cual prohíbe progresivamente dichos plásticos en el territorio nacional.

Ubicada estratéjicamente en la zona industrial de Puente Aranda en Bogotá D.C., EcoPack Solutions S.A.S. combina la valorización de subproductos agroindustriales locales con tecnología de termocompresión de vanguardia. De esta manera, ofrece a restaurantes, cadenas de comida rápida y supermercados una alternativa 100% biodegradable que se degrada naturalmente en menos de 90 días sin dejar residuos tóxicos ni microplásticos. A lo largo del documento se detallan el direccionamiento estratégico, el estudio legal y organizacional, la estructura de costos y la evaluación de viabilidad financiera que sustentan este modelo de negocio rentable, escalable e implementable.`,

    objetivoGeneral: 'Determinar la viabilidad estratégica, operativa, legal y financiera para la creación y puesta en marcha de EcoPack Solutions S.A.S., una empresa fabricante de empaques bioplásticos biodegradables en Bogotá D.C. que contribuya a la transición hacia modelos de economía circular.',

    objetivosEspecificos: [
      'Elaborar el direccionamiento estratégico, estructura organizacional y marco legal requerido para la constitución de la empresa bajo la normativa colombiana vigente.',
      'Estructurar el modelo financiero proyectado que abarque la inversión inicial, costos fijos y variables, fuentes de financiación y fijación de precios competitivos.',
      'Evaluar la rentabilidad del proyecto mediante los estados financieros proyectados e indicadores financieros clave como el Valor Presente Neto (VPN) y la Tasa Interna de Retorno (TIR).',
    ],

    clavesExito: [
      'Aprovechamiento de materia prima agroindustrial local (almidón de yuca no comestible y bagazo de caña) asegurando costos estables e impacto social en el campo colombiano.',
      'Cumplimiento de certificaciones de compostabilidad bajo la norma ISO 17088 y Ley 2232 de 2022, otorgando una clara ventaja competitiva frente a empaques convencionales.',
      'Proceso de termocompresión automatizado con baja huella de carbono que permite escalas de producción eficientes y costos unitarios competitivos en el sector B2B.',
    ],

    resumenEjecutivo: `EcoPack Solutions S.A.S. es una empresa en etapa de arranque orientada a transformar la industria del empaque en Colombia mediante la producción de contenedores ecofriendly. Nuestra oferta abarca portacomidas, vasos para bebidas frías/calientes, bandeja para alimentos frescos y cubiertos compostables fabricados con materias primas de origen vegetal renovable.

Con una inversión inicial proyectada de $185.000.000 COP, financiada en un 60% por aportes directos de socios y un 40% a través de banca de fomento (Fondo Emprender / Bancóldex), la compañía proyecta alcanzar el punto de equilibrio en el mes 8 de operación vendiendo 14.200 unidades mensuales. Los análisis financieros demuestran una elevada viabilidad económica con un Valor Presente Neto (VPN) positivo de $84.500.000 COP a una tasa de descuento del 14% anual, y una Tasa Interna de Retorno (TIR) del 28.5%, superando ampliamente el costo de capital. La compañía planea capturar el 3.5% del mercado de domicilios y restaurantes sostenibles en Bogotá durante el primer trienio.`,
    videoPitch: 'https://www.youtube.com/watch?v=Bieyi5sGznM',
  },

  ideaNegocio: {
    descripcion: `EcoPack Solutions S.A.S. es un emprendimiento enfocado en la transformación de biopolímeros naturales en empaques rígidos y flexibles totalmente compostables. La actividad económica principal corresponde al código CIIU 2220 (Fabricación de artículos de plástico, enfocada exclusivamente en bioplásticos de origen agroindustrial). 

La empresa formula mezclas térmicas a base de almidón de yuca agria industrial procesada regionalmente en los departamentos de Cauca y Tolima, combinada con fibras de bagazo de caña de azúcar del Valle del Cauca. Mediante un tratamiento térmico con bioaditivos inocuos y moldeo por compresión, se generan empaques altamente resistentes a grasas, agua y temperaturas entre -18°C y 120°C. El nombre refleja nuestro compromiso con la ecología (Eco), la funcionalidad logística (Pack) y el enfoque en brindar soluciones corporativas sostenibles (Solutions) a la industria alimentaria.`,

    justificacion: 'La reciente entrada en vigor de la Ley 2232 de 2022 en Colombia genera una demanda masiva insatisfecha de empaques no plásticos para el sector gastronómico. EcoPack ofrece innovación en economía circular valorizando residuos agrícolas sin comprometer la resistencia del empaque.',

    perfilCliente: 'Empresas B2B compuestas por restaurantes de gama media y alta, servicios de catering, hoteles y cadenas de retail alimentario en Bogotá y Cundinamarca que promueven políticas de sostenibilidad y requieren empaques biodegradables funcionales.',

    oportunidadMercado: 'El mercado global de empaques sostenibles crece a una TASA (CAGR) del 12.8%. En Colombia, más del 70% de los establecimientos de comida rápida buscan activamente sustitutos al ICOPOR y polipropileno debido a sanciones regulatorias y exigencias de consumidores jóvenes.',

    portafolio: [
      {
        id: 'p1',
        nombre: 'EcoBox Pro 9" (Contenedor con División)',
        tipo: 'Producto',
        precio: 850,
        descripcionTecnica: 'Portacomidas térmico rígido de 3 compartimentos fabricado en almidón de yuca y bagazo de caña.',
        especificaciones: 'Dimensiones: 23x23x7 cm. Resistencia térmica: -18°C a 120°C. Apto para microondas. Resistencia a grasas de 6 horas.',
        imagenUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'p2',
        nombre: 'BioCup 12oz (Vaso Térmico para Bebidas)',
        tipo: 'Producto',
        precio: 420,
        descripcionTecnica: 'Vaso compostable para bebidas frías y calientes con recubrimiento interno de ácido poliláctico (PLA).',
        especificaciones: 'Capacidad: 350 ml / 12 oz. Biodegradación en compostaje doméstico: 60 días. Compatible con tapas compostables.',
        imagenUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'p3',
        nombre: 'EcoTray Bio 20 (Bandeja para Frescos)',
        tipo: 'Producto',
        precio: 520,
        descripcionTecnica: 'Bandeja rígida absorbente para empaque de cárnicos, frutas y verduras en supermercados.',
        especificaciones: 'Medidas: 20x15x2.5 cm. Alta barrera contra humedad inicial. Reemplaza las bandejas tradicionales de Icopor.',
        imagenUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=60',
      },
      {
        id: 'p4',
        nombre: 'Servicio de Personalización y Bio-Branding',
        tipo: 'Servicio',
        precio: 150,
        descripcionTecnica: 'Impresión ecológica con tintas biodegradables a base de agua y soya para marcas de restaurantes.',
        especificaciones: 'Tintas vegetales certificación ISO 14001. Área máxima de impresión 10x10 cm. Pedido mínimo 1.000 unidades.',
        imagenUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500&auto=format&fit=crop&q=60',
      },
    ],
  },

  unidadI: {
    mision: 'Luchamos por transformar la industria del empaque en Colombia ofreciendo soluciones compostables de alto rendimiento técnico a partir de subproductos agrícolas, ayudando a las empresas del sector alimentario a eliminar los plásticos de un solo uso y aportando un valor ecológico diferencial a la sociedad.',

    vision: 'Para el año 2035, EcoPack Solutions S.A.S. será la empresa líder en Centro y Suramérica en la fabricación de empaques biodegradables agroindustriales, reconocida por su innovación en biopolímeros, con 3 plantas de producción automatizadas y un impacto neutro en carbono.',

    objetivosEstrategicos: [
      'Alcanzar una capacidad de producción mensual de 250.000 empaques durante el primer año de operaciones.',
      'Establecer alianzas estratégicas con al menos 15 cadenas de restaurantes y 3 distribuidoras mayoristas en el primer semestre.',
      'Certificar la planta de producción bajo las normas ISO 9001 de calidad e ISO 14001 de gestión ambiental en el año 2.',
    ],

    valores: [
      'Sostenibilidad ambiental radical',
      'Innovación y desarrollo tecnológico constante',
      'Calidad e inocuidad garantizada',
      'Compromiso con la comunidad agrícola local',
      'Transparencia y ética empresarial',
    ],

    ventajaCompetitiva: 'Formulación propia patentable de biopolímero compostable con almidón de yuca nativa que reduce en un 30% el tiempo de biodegradación y otorga un 25% más de resistencia mecánica frente a competidores importados de maíz.',

    cadenaValor: {
      logisticaEntrada: 'Alianzas directas con cooperativas agrícolas en Cauca y Tolima para acopio de almidón no alimentario y bagazo de caña a costo preferencial.',
      operaciones: 'Proceso automatizado de molienda, mezcla bio-polimérica, termocompresión en prensas hidráulicas y control de calidad térmico.',
      logisticaSalida: 'Distribución consolidada en vehículos eléctricos para entregas urbanas en Bogotá y alianzas de carga con bajo impacto ambiental.',
      marketingVentas: 'Estrategia Inbound B2B, venta consultiva, muestras gratuitas y participación en ferias como Alimentec y Muestra Sostenible CUN.',
      servicioPostventa: 'Programa "Recicla y Compensa" donde recolectamos empaques usados de clientes grandes para su compostaje industrial controlado.',
      infraestructura: 'Planta industrial de 450 m2 en Bogotá con certificación Invima para materiales en contacto con alimentos y paneles solares instalados.',
      recursosHumanos: 'Programa "Talento Verde CUN" enfocado en vinculación laboral de recién egresados y capacitación permanente en producción limpia.',
      desarrolloTecnologico: 'Laboratorio propio de pruebas de degradabilidad, tensión física y desarrollo de nuevas resinas compostables.',
      compras: 'Compras éticas con criterios ESG y auditoría constante a proveedores de insumos primarios.',
      analisis: 'La integración vertical desde la adquisición de insumos agrícolas hasta el compostaje post-consumo permite controlar la estructura de costos y ofrecer precios altamente competitivos en el mercado corporativo.',
      imagenUrl: '',
    },

    organigrama: {
      tipoEstructura: 'Estructura Funcional - Matricial por Procesos',
      justificacionCultura: 'Fomenta la agilidad operativa, la colaboración interdisciplinaria y la orientación hacia la innovación sostenible y la mejora continua.',
      imagenUrl: '',
    },

    perfilesCargos: [
      {
        id: 'c1',
        nombreCargo: 'Gerente General y Comercial',
        funciones: 'Liderar la planeación estratégica, representación legal, gestión de alianzas B2B y supervisión del cumplimiento de metas financieras.',
        formacion: 'Profesional en Administración de Empresas o Ingeniería Comercial con posgrado en Gerencia.',
        experiencia: 'Mínimo 4 años en cargos directivos en empresas del sector empaques o consumo masivo.',
        habilidades: 'Liderazgo estratégico, negociación B2B, visión financiera y comunicación asertiva.',
        salarioEstimado: 4500000,
      },
      {
        id: 'c2',
        nombreCargo: 'Director de Operaciones y Calidad',
        funciones: 'Supervisar el proceso de termocompresión, mantenimiento de maquinaria, inventarios y control de inocuidad alimentaria.',
        formacion: 'Ingeniero Industrial, Químico o de Alimentos.',
        experiencia: 'Mínimo 3 años en plantas industriales de transformación de plásticos o alimentos.',
        habilidades: 'Gestión de procesos, Lean Manufacturing, normatividad Invima y resolución de problemas.',
        salarioEstimado: 3800000,
      },
      {
        id: 'c3',
        nombreCargo: 'Técnico Operario de Producción (x2)',
        funciones: 'Operar prensas hidráulicas de termocompresión, dosificación de mezclas, empaque y sellado final.',
        formacion: 'Técnico o Tecnólogo en Procesos Industriales o Maquinaria.',
        experiencia: '1 a 2 años en operación de planta industrial.',
        habilidades: 'Trabajo en equipo, atención al detalle, responsabilidad y agilidad manual.',
        salarioEstimado: 1750000,
      },
      {
        id: 'c4',
        nombreCargo: 'Ejecutivo de Ventas y Cuentas Clave',
        funciones: 'Prospectar clientes B2B, realizar cotizaciones, seguimiento a pedidos y atención a canales de restauración.',
        formacion: 'Profesional o estudiante de últimos semestres de Administración o Mercadeo.',
        experiencia: '2 años en ventas institucionales B2B.',
        habilidades: 'Orientación al logro, empatía, manejo de CRM y persistencia comercial.',
        salarioEstimado: 2200000,
      },
    ],

    figuraLegal: {
      formaJuridica: 'Persona Jurídica',
      justificacionForma: 'Se selecciona persona jurídica para limitar la responsabilidad de los socios al monto de sus aportes, proteger el patrimonio personal y brindar mayor solidez financiera institucional.',
      tipoSociedad: 'S.A.S.',
      justificacionSociedad: 'La Sociedad por Acciones Simplificada (S.A.S.) permite flexibilidad en estatutos, un número variable de accionistas y menores costos de constitución según la Ley 1258 de 2008.',
      razonSocial: 'EcoPack Solutions S.A.S.',
      justificacionNombre: 'Razón social clara que comunica los atributos de sostenibilidad (Eco), funcionalidad (Pack) y oferta de soluciones (Solutions) comercialmente atractiva.',
      objetoSocial: 'Fabricación, comercialización, distribución, importación y exportación de empaques, contenedores y artículos biodegradables y compostables a base de almidón y fibras agrícolas.',
      codigosCIIU: 'CIIU 2220 (Fabricación de artículos de plástico) y CIIU 4669 (Comercio al por mayor de otros productos N.C.P.).',
      capitalSocial: {
        autorizado: 200000000,
        suscrito: 111000000,
        pagado: 111000000,
        argumentacion: 'El capital suscrito y pagado representa el 55.5% del capital autorizado, garantizando la solvencia patrimonial inicial para la compra de maquinaria pesada sin sobreapalancamiento.',
      },
    },

    normatividad: {
      tributaria: 'Régimen Ordinario del Impuesto sobre la Renta con tarifa del 35%, retención en la fuente, e IVA del 19% (exento en algunas líneas compostables exportables según Estatuto Tributario). Inscripción en el RUT ante la DIAN.',
      laboral: 'Contratación bajo Código Sustantivo del Trabajo (CST), afiliación al sistema de seguridad social integral (EPS, AFP, ARL en Riesgo 3) y pago de prestaciones sociales (cesantías, prima, vacaciones y aportes parafiscales Sena/ICBF/Cajas).',
      funcionamiento: 'Matrícula Mercantil en la Cámara de Comercio de Bogotá, Certificado de Uso del Suelo, Concepto Sanitario favorable de Secretaría de Salud / Invima, y Plan de Gestión Integral de Residuos (PGIR).',
    },
  },

  unidadII: {
    inversionInicial: {
      efectivoDisponible: [
        { id: 'f1', concepto: 'Caja inicial y fondo de maniobra (3 meses de operación)', monto: 25000000 },
        { id: 'f2', concepto: 'Depósitos y garantías de arrendamiento de bodega', monto: 8000000 },
      ],
      inventarios: [
        { id: 'i1', concepto: 'Materia prima inicial (Almidón de yuca, bagazo, bioaditivos)', monto: 18000000 },
        { id: 'i2', concepto: 'Material de empaque secundario y cajas de cartón', monto: 4000000 },
      ],
      propiedadPlantaEquipo: [
        { id: 'p1', concepto: 'Prensa hidráulica de termocompresión automática 4 cavidades', monto: 65000000, vidaUtilAnos: 10, depreciacionAnual: 6500000 },
        { id: 'p2', concepto: 'Mezcladora industrial de biopolímeros 200Kg', monto: 22000000, vidaUtilAnos: 10, depreciacionAnual: 2200000 },
        { id: 'p3', concepto: 'Molino triturador de bordes y reprocesamiento', monto: 12000000, vidaUtilAnos: 10, depreciacionAnual: 1200000 },
        { id: 'p4', concepto: 'Mobiliario de oficina y equipos de cómputo', monto: 11000000, vidaUtilAnos: 5, depreciacionAnual: 2200000 },
      ],
      intangibles: [
        { id: 't1', concepto: 'Licencias de software, diseño web e identidad de marca', monto: 8000000 },
        { id: 't2', concepto: 'Registros de marca Superintendencia (SIC) y trámites legales', monto: 4500000 },
        { id: 't3', concepto: 'Pruebas de laboratorio y certificado ISO 17088 compostabilidad', monto: 7500000 },
      ],
    },

    financiacion: {
      aportesSocios: [
        { id: 's1', concepto: 'Aporte Socio 1 (Daniel Hernández - Capital Semilla)', monto: 45000000 },
        { id: 's2', concepto: 'Aporte Socio 2 (Valeria Martínez - Capital Semilla)', monto: 36000000 },
        { id: 's3', concepto: 'Aporte Socio 3 (Santiago Ramírez - Maquinaria y Capital)', monto: 30000000 },
      ],
      aportesExternos: [
        { id: 'e1', concepto: 'Crédito bancario de fomento (Bancóldex / Finagro - 5 años plazo)', monto: 74000000, tasaInteresAnual: 14.5 },
      ],
    },

    costosVariables: [
      { id: 'cv1', producto: 'EcoBox Pro 9" (Por 1.000 unidades)', costoUnidad: 380, porcentajeDelCostoTotal: 45 },
      { id: 'cv2', producto: 'BioCup 12oz (Por 1.000 unidades)', costoUnidad: 180, porcentajeDelCostoTotal: 25 },
      { id: 'cv3', producto: 'EcoTray Bio 20 (Por 1.000 unidades)', costoUnidad: 220, porcentajeDelCostoTotal: 20 },
      { id: 'cv4', producto: 'Servicio de Personalización / Insumos de impresión', costoUnidad: 45, porcentajeDelCostoTotal: 10 },
    ],

    gastosFijos: {
      gastosPersonal: [
        { id: 'gp1', cargo: 'Gerente General y Comercial', salarioMensual: 4500000, prestacionesSociales: 2340000 },
        { id: 'gp2', cargo: 'Director de Operaciones', salarioMensual: 3800000, prestacionesSociales: 1976000 },
        { id: 'gp3', cargo: 'Operarios de Producción (2 personas)', salarioMensual: 3500000, prestacionesSociales: 1820000 },
        { id: 'gp4', cargo: 'Ejecutivo de Ventas', salarioMensual: 2200000, prestacionesSociales: 1144000 },
      ],
      otrosGastosFijos: [
        { id: 'og1', concepto: 'Arriendo Bodega Industrial Puente Aranda (450m2)', monto: 5500000 },
        { id: 'og2', concepto: 'Servicios Públicos (Agua, Luz industrial trifásica, Gas, Internet)', monto: 3200000 },
        { id: 'og3', concepto: 'Seguros contra todo riesgo e incendios', monto: 850000 },
        { id: 'og4', concepto: 'Honorarios Contabilidad y Revisoría Externa', monto: 1500000 },
        { id: 'og5', concepto: 'Mantenimiento preventivo de maquinaria', monto: 1200000 },
        { id: 'og6', concepto: 'Marketing digital y publicidad B2B', monto: 2000000 },
      ],
    },

    puntoEquilibrio: {
      estacionalidadCapacidad: 'La planta opera a un turno diario de 8 horas con capacidad para producir 180.000 unidades mensuales. La estacionalidad muestra picos de demanda en los meses de mayo, agosto, noviembre y diciembre coincidiendo con festividades y ferias del sector gastronómico.',
      ventasMinimas: 'Para cubrir el 100% de los costos variables y gastos fijos mensuales ($33.530.000 COP), la empresa requiere comercializar un volumen mínimo de 64.500 unidades combinadas del portafolio al precio promedio ponderado de $520/unidad.',
      unidadesEquilibrioMensual: 64500,
      montoEquilibrioMensual: 33540000,
    },

    fuentesIngresos: {
      proyeccionVentas: 'Para el Escenario 3 (Metas de Utilidad deseada), se proyecta vender 120.000 unidades mensuales en el Año 1, alcanzando un nivel de facturación estimado de $62.400.000 COP mensuales y $748.800.000 COP anuales.',
      fijacionPrecios: 'Los precios se determinan mediante el método de Costo Más Margen de Utilidad (Cost-Plus Pricing) fijando un margen bruto objetivo del 48% sobre el costo variable directo de fabricación.',
    },
  },

  unidadIII: {
    estadoResultados: {
      ingresosVentas: 748800000,
      costosVentas: 389376000,
      utilidadBruta: 359424000,
      gastosOperacionales: 254800000,
      utilidadOperativa: 104624000,
      impuestos: 36618400, // 35% Impuesto de Renta
      utilidadNeta: 68005600,
      analisis: 'El Estado de Resultados proyectado para el primer año demuestra una sólida estructura operativa con un Margen Bruto del 48% y un Margen Neto del 9.08%, demostrando la capacidad de la empresa de absorber costos fijos e impuestos generando utilidad neta distribuible.',
    },

    balanceGeneral: {
      activosCorrientes: 52000000,
      activosNoCorrientes: 110000000,
      totalActivos: 162000000,
      pasivosCorrientes: 24000000,
      pasivosNoCorrientes: 52000000,
      totalPasivos: 76000000,
      patrimonio: 86000000,
      analisis: 'El Balance General proyectado presenta una estructura financiera equilibrada donde la Ecuación Patrimonial (Activo = Pasivo + Patrimonio) se cumple al 100%. Los activos fijos respaldan las obligaciones bancarias a largo plazo.',
    },

    flujoCaja: {
      flujoOperativo: 92400000,
      flujoInversion: -110000000,
      flujoFinanciero: 54000000,
      flujoNetoTotal: 36400000,
      vpn: 84500000, // COP
      tir: 28.5, // %
      analisis: 'El Flujo de Caja libre descontado evidencia un VPN altamente positivo de $84.500.000 COP y una TIR del 28.5% anual (muy superior a la tasa de oportunidad TIO del 14%), confirmando la gran viabilidad financiera del proyecto.',
    },

    indicadoresFinancieros: {
      liquidezCorriente: 2.17, // Activo Corriente / Pasivo Corriente
      nivelEndeudamiento: 46.9, // Pasivo Total / Activo Total %
      rentabilidadNetos: 9.08, // %
      margenBruto: 48.0, // %
      conclusionFinanciera: 'Los indicadores financieros ratifican que EcoPack Solutions S.A.S. cuenta con suficiente solvencia de corto plazo (Razón Corriente de 2.17x), un nivel de endeudamiento controlado (46.9%) y una TIR del 28.5% que sustenta la aprobación del proyecto.',
    },

    conclusionesYRecomendaciones: {
      conclusiones: [
        'EcoPack Solutions S.A.S. cumple con los criterios de rentabilidad, escalabilidad, implementabilidad y legalidad requeridos en la Guía del curso Creación de Empresas III de la CUN.',
        'La Ley 2232 de 2022 en Colombia actúa como un catalizador regulatorio indispensable que garantiza una demanda insatisfecha constante de empaques compostables.',
        'Los indicadores financieros con un VPN de $84.5M COP y TIR de 28.5% demuestran la viabilidad económica y el atractivo para inversionistas de impacto ambiental.',
      ],
      recomendaciones: [
        'Iniciar formalmente los trámites de registro de marca ante la Superintendencia de Industria y Comercio (SIC) en el mes 1.',
        'Aprovechar las exenciones tributarias de la Ley de Economía Naranja y beneficios de deducción del 50% en impuesto de renta por inversiones en desarrollo tecnológico ecológico.',
        'Mantener un monitoreo trimestral de los precios internacionales de los biopolímeros sintéticos sustitutos para mantener la competitividad comercial.',
      ],
    },

    bibliografia: [
      'Congreso de la República de Colombia. (2022). Ley 2232 de 2022: Por la cual se establecen medidas orientadas a la reducción gradual de la producción y consumo de plásticos de un solo uso. Diario Oficial.',
      'Decreto 2650 de 1993. (1993). Plan Único de Cuentas para Comerciantes. Legis Editores.',
      'Osterwalder, A., & Pigneur, Y. (2010). Generación de modelos de negocio: Un manual para visionarios, revolucionarios y retadores. Deusto.',
      'Porter, M. E. (2008). Las cinco fuerzas competitivas que moldean la estrategia. Harvard Business Review, 86(1), 78-93.',
      'Santen, J. (2021). Bioplastics and Agro-Industrial Waste Valorization in Latin America. Journal of Sustainable Materials, 14(2), 112-128.',
    ],
  },
};

export const sampleProject: ProjectData = (customSampleJson as unknown as ProjectData) || sampleProjectData;

export const emptyProjectData: ProjectData = {
  designConfig: {
    templateId: 'cun-oficial',
    primaryColor: '#003366',
    fontFamily: 'sans',
    logoUrl: '',
    incluirFirmasDigitales: true,
    mostrarNumeroPagina: true,
  },
  portada: {
    nombreTrabajo: '',
    materia: 'Creación de Empresas III - Modelos de Innovación',
    docente: '',
    integrantes: [
      { id: '1', nombre: '', facultad: '', carrera: '', grupo: 'G024' }
    ],
    institucion: 'Corporación Unificada Nacional de Educación Superior (CUN)',
    ciudad: '',
    ano: new Date().getFullYear().toString(),
  },
  compromisosAutor: {
    autores: [
      { id: '1', nombreCompleto: '', programaAcademico: '', identificacion: '', firmaImgUrl: '' }
    ],
    declaracionAceptada: false,
  },
  contenidoTrabajo: {
    introduccion: '',
    objetivoGeneral: '',
    objetivosEspecificos: ['', '', ''],
    clavesExito: ['', '', ''],
    resumenEjecutivo: '',
    videoPitch: '',
  },
  ideaNegocio: {
    descripcion: '',
    justificacion: '',
    perfilCliente: '',
    oportunidadMercado: '',
    portafolio: [],
  },
  unidadI: {
    mision: '',
    vision: '',
    objetivosEstrategicos: ['', '', ''],
    valores: [],
    ventajaCompetitiva: '',
    cadenaValor: {
      logisticaEntrada: '',
      operaciones: '',
      logisticaSalida: '',
      marketingVentas: '',
      servicioPostventa: '',
      infraestructura: '',
      recursosHumanos: '',
      desarrolloTecnologico: '',
      compras: '',
      analisis: '',
    },
    organigrama: {
      tipoEstructura: '',
      justificacionCultura: '',
    },
    perfilesCargos: [],
    figuraLegal: {
      formaJuridica: 'Persona Jurídica',
      justificacionForma: '',
      tipoSociedad: 'S.A.S.',
      justificacionSociedad: '',
      razonSocial: '',
      justificacionNombre: '',
      objetoSocial: '',
      codigosCIIU: '',
      capitalSocial: {
        autorizado: 0,
        suscrito: 0,
        pagado: 0,
        argumentacion: '',
      },
    },
    normatividad: {
      tributaria: '',
      laboral: '',
      funcionamiento: '',
    },
  },
  unidadII: {
    inversionInicial: {
      efectivoDisponible: [],
      inventarios: [],
      propiedadPlantaEquipo: [],
      intangibles: [],
    },
    financiacion: {
      aportesSocios: [],
      aportesExternos: [],
    },
    costosVariables: [],
    gastosFijos: {
      gastosPersonal: [],
      otrosGastosFijos: [],
    },
    puntoEquilibrio: {
      estacionalidadCapacidad: '',
      ventasMinimas: '',
      unidadesEquilibrioMensual: 0,
      montoEquilibrioMensual: 0,
    },
    fuentesIngresos: {
      proyeccionVentas: '',
      fijacionPrecios: '',
    },
  },
  unidadIII: {
    estadoResultados: {
      ingresosVentas: 0,
      costosVentas: 0,
      utilidadBruta: 0,
      gastosOperacionales: 0,
      utilidadOperativa: 0,
      impuestos: 0,
      utilidadNeta: 0,
      analisis: '',
    },
    balanceGeneral: {
      activosCorrientes: 0,
      activosNoCorrientes: 0,
      totalActivos: 0,
      pasivosCorrientes: 0,
      pasivosNoCorrientes: 0,
      totalPasivos: 0,
      patrimonio: 0,
      analisis: '',
    },
    flujoCaja: {
      flujoOperativo: 0,
      flujoInversion: 0,
      flujoFinanciero: 0,
      flujoNetoTotal: 0,
      vpn: 0,
      tir: 0,
      analisis: '',
    },
    indicadoresFinancieros: {
      liquidezCorriente: 0,
      nivelEndeudamiento: 0,
      rentabilidadNetos: 0,
      margenBruto: 0,
      conclusionFinanciera: '',
    },
    conclusionesYRecomendaciones: {
      conclusiones: [],
      recomendaciones: [],
    },
    bibliografia: [],
  },
};

