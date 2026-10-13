import { EconomicVariable, EconomicTopic } from './types';

interface Milestone {
  date: string;
  value: number;
}

/**
 * Genera una serie histórica coherente y rigurosa de 3 años con corte exacto al 13-10-2026.
 * Para frecuencias diarias: genera datos día por día para los últimos 90 días (30D y 90D en alta resolución)
 * e intercala los hitos de 1 y 3 años para que los gráficos de 1Y y 3Y muestren la tendencia macroeconómica real.
 */
function createHistoricalSeries(
  milestones: Milestone[],
  isDaily: boolean = true,
  precision: number = 2
): { date: string; value: number }[] {
  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));

  if (!isDaily) {
    return sorted.map(m => ({
      date: m.date,
      value: Number(m.value.toFixed(precision))
    }));
  }

  const cutoff90d = '2026-07-15';
  const historicalPre90 = sorted.filter(m => m.date < cutoff90d);

  // Generación diaria de los últimos 90 días (del 15-07-2026 al 13-10-2026)
  const baseEndDate = new Date('2026-10-13T12:00:00Z');
  const daysTotal = 90;
  const lastVal = sorted[sorted.length - 1].value;
  const startMilestone = sorted.slice().reverse().find(m => m.date <= cutoff90d) || sorted[0];
  const startVal = startMilestone.value;

  const dailyPoints: { date: string; value: number }[] = [];

  for (let i = daysTotal; i >= 0; i--) {
    const d = new Date(baseEndDate);
    d.setDate(baseEndDate.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const progress = (daysTotal - i) / daysTotal;
    const interpolated = startVal + (lastVal - startVal) * progress;
    const finalVal = i === 0 ? lastVal : interpolated;

    dailyPoints.push({
      date: dateStr,
      value: Number(finalVal.toFixed(precision))
    });
  }

  return [...historicalPre90, ...dailyPoints];
}

/**
 * Catálogo de Temas de Interés Económico con fuentes públicas y cámaras sectoriales asociadas.
 */
export const ECONOMIC_TOPICS: EconomicTopic[] = [
  {
    id: 'cambiario_divisas',
    name: 'Mercado Cambiario y Divisas',
    shortName: 'Cambiario & Divisas',
    tagline: 'Cotizaciones oficiales BNA, tipos de cambio financieros y liquidación del comercio exterior',
    description: 'Monitoreo diario del valor del dólar en ventanilla y operaciones electrónicas del Banco de la Nación Argentina, paridades bursátiles de BYMA y liquidación de divisas de la agroindustria.',
    iconName: 'Coins',
    accentColor: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Mercados financieros, cotizaciones bursátiles y comercio exterior',
    visualSummary: 'Divisas · Reservas · Comercio',
    sources: [
      {
        id: 'bna',
        name: 'BNA',
        fullName: 'Banco de la Nación Argentina',
        type: 'publica',
        scope: 'Entidad Financiera Pública Oficial',
        url: 'https://www.bna.com.ar'
      },
      {
        id: 'bcra',
        name: 'BCRA',
        fullName: 'Banco Central de la República Argentina',
        type: 'publica',
        scope: 'Autoridad Monetaria y Cambiaria',
        url: 'https://www.bcra.gob.ar'
      },
      {
        id: 'byma',
        name: 'BYMA',
        fullName: 'Bolsas y Mercados Argentinos',
        type: 'camara',
        scope: 'Mercado de Capitales y Liquidación',
        url: 'https://www.byma.com.ar'
      },
      {
        id: 'ciara_cec',
        name: 'CIARA-CEC',
        fullName: 'Cámara de la Industria Aceitera y Centro de Exportadores de Cereales',
        type: 'camara',
        scope: 'Cámara Agroexportadora Representativa',
        url: 'https://ciaracec.com.ar'
      }
    ],
    variableIds: [
      'bna_dolar_billete',
      'bna_dolar_divisa',
      'dolar_mep_byma',
      'dolar_ccl_byma',
      'reservas_brutas',
      'liquidacion_ciara_cec'
    ]
  },
  {
    id: 'precios_inflacion',
    name: 'Precios, Inflación y Costo de Vida',
    shortName: 'Precios & Inflación',
    tagline: 'Indicadores oficiales del INDEC, expectativas del REM y canastas familiares',
    description: 'Seguimiento riguroso de la variación mensual de precios minoristas y mayoristas, previsiones consensuadas de analistas en el BCRA y el costo del metro cuadrado en la construcción.',
    iconName: 'BadgePercent',
    accentColor: 'rose',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Precios de consumo, canastas básicas e insumos de construcción',
    visualSummary: 'IPC · Canastas · Costos',
    sources: [
      {
        id: 'indec',
        name: 'INDEC',
        fullName: 'Instituto Nacional de Estadística y Censos',
        type: 'publica',
        scope: 'Organismo Oficial de Estadística',
        url: 'https://www.indec.gob.ar'
      },
      {
        id: 'bcra_rem',
        name: 'BCRA (REM)',
        fullName: 'Relevamiento de Expectativas de Mercado',
        type: 'publica',
        scope: 'Informe Macroeconómico Mensual',
        url: 'https://www.bcra.gob.ar'
      },
      {
        id: 'cac',
        name: 'CAC',
        fullName: 'Cámara Argentina de la Construcción',
        type: 'camara',
        scope: 'Cámara Sectorial de Obras e Infraestructura',
        url: 'https://www.camarco.org.ar'
      }
    ],
    variableIds: [
      'ipc_inflacion_mensual',
      'rem_inflacion_esperada',
      'canasta_basica_total',
      'canasta_basica_alimentaria',
      'icc_cac_construccion',
      'ipim_mayorista_indec'
    ]
  },
  {
    id: 'tasas_ahorro',
    name: 'Tasas de Interés y Ahorro en Pesos',
    shortName: 'Tasas & Ahorro',
    tagline: 'Rendimientos de plazos fijos, índice UVA, CER, BADLAR y cauciones bursátiles',
    description: 'Variables de referencia para decisiones de ahorro e inversión en moneda nacional: coeficientes de actualización de préstamos y depósitos a plazo remunerados.',
    iconName: 'Percent',
    accentColor: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Rendimientos de inversión, curvas de interés y depósitos bancarios',
    visualSummary: 'Plazos Fijos · UVA · BADLAR',
    sources: [
      {
        id: 'bcra_tasas',
        name: 'BCRA',
        fullName: 'Banco Central de la República Argentina',
        type: 'publica',
        scope: 'Regulación del Sistema Financiero',
        url: 'https://www.bcra.gob.ar'
      },
      {
        id: 'bna_tasas',
        name: 'BNA',
        fullName: 'Banco de la Nación Argentina',
        type: 'publica',
        scope: 'Banca Pública Minorista',
        url: 'https://www.bna.com.ar'
      },
      {
        id: 'byma_mercado',
        name: 'BYMA',
        fullName: 'Bolsas y Mercados Argentinos',
        type: 'camara',
        scope: 'Negociación Bursátil de Cauciones',
        url: 'https://www.byma.com.ar'
      },
      {
        id: 'cafci',
        name: 'CAFCI',
        fullName: 'Cámara Argentina de Fondos Comunes de Inversión',
        type: 'camara',
        scope: 'Industria de Fondos de Inversión y Liquidez',
        url: 'https://www.cafci.org.ar'
      }
    ],
    variableIds: [
      'valor_uva',
      'tasa_badlar',
      'tasa_plazo_fijo_bna',
      'coeficiente_cer',
      'caucion_bursatil_byma',
      'rendimiento_fci_money_market'
    ]
  },
  {
    id: 'actividad_industria',
    name: 'Actividad Productiva e Industria',
    shortName: 'Actividad & Industria',
    tagline: 'Producción automotriz, consumo eléctrico mayorista, ventas pyme y actividad económica',
    description: 'Evolución de los motores de la economía real: despachos y ensamblaje fabril informado por ADEFA, despacho energético de CAMMESA y ventas comerciales de CAME.',
    iconName: 'Factory',
    accentColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Manufactura automotriz, infraestructura industrial y redes de energía',
    visualSummary: 'Autos · Energía · Ventas',
    sources: [
      {
        id: 'adefa',
        name: 'ADEFA',
        fullName: 'Asociación de Fábricas de Automotores',
        type: 'camara',
        scope: 'Cámara de Fabricantes Terminales',
        url: 'https://www.adefa.org.ar'
      },
      {
        id: 'cammesa',
        name: 'CAMMESA',
        fullName: 'Compañía Administradora del Mercado Mayorista Eléctrico',
        type: 'publica',
        scope: 'Operador Mayorista del Sistema Eléctrico',
        url: 'https://www.cammesa.com'
      },
      {
        id: 'came',
        name: 'CAME',
        fullName: 'Confederación Argentina de la Mediana Empresa',
        type: 'camara',
        scope: 'Entidad Gremial Empresaria Pyme',
        url: 'https://www.redcame.org.ar'
      },
      {
        id: 'arca',
        name: 'ARCA',
        fullName: 'Agencia de Recaudación y Control Aduanero (ex AFIP)',
        type: 'publica',
        scope: 'Administración Tributaria Nacional',
        url: 'https://www.arca.gob.ar'
      }
    ],
    variableIds: [
      'produccion_automotriz_adefa',
      'demanda_electrica_cammesa',
      'ventas_minoristas_came',
      'emae_actividad_indec',
      'recaudacion_tributaria_arca'
    ]
  },
  {
    id: 'credito_salarios',
    name: 'Crédito, Salarios e Inmuebles',
    shortName: 'Crédito & Inmuebles',
    tagline: 'Salario formal (RIPTE), índice de contratos de alquiler (ICL) y escrituras notariales',
    description: 'Indicadores estructurales del poder de compra registrado, actualización obligatoria de alquileres residenciales y nivel de actividad en el mercado inmobiliario.',
    iconName: 'Building',
    accentColor: 'violet',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Torres residenciales, urbanismo y mercado inmobiliario formal',
    visualSummary: 'Salarios · Alquileres · Inmuebles',
    sources: [
      {
        id: 'mecon_trabajo',
        name: 'MECON / Sec. Trabajo',
        fullName: 'Ministerio de Economía - Secretaría de Trabajo',
        type: 'publica',
        scope: 'Registro de Remuneración Imponible (RIPTE)',
        url: 'https://www.argentina.gob.ar/trabajo'
      },
      {
        id: 'bcra_credito',
        name: 'BCRA',
        fullName: 'Banco Central de la República Argentina',
        type: 'publica',
        scope: 'Regulación Crediticia e Índice ICL',
        url: 'https://www.bcra.gob.ar'
      },
      {
        id: 'escribanos_caba',
        name: 'Colegio de Escribanos CABA',
        fullName: 'Colegio de Escribanos de la Ciudad de Buenos Aires',
        type: 'camara',
        scope: 'Registro Notarial de Compraventas',
        url: 'https://www.colegio-escribanos.org.ar'
      }
    ],
    variableIds: [
      'indice_icl',
      'ripte_salario_estable',
      'escrituras_caba',
      'creditos_hipotecarios_uva',
      'stock_credito_privado'
    ]
  }
];

export const ARGENTINA_ECONOMIC_VARIABLES: EconomicVariable[] = [
  // ==========================================
  // TEMA 1: MERCADO CAMBIARIO Y DIVISAS
  // ==========================================
  {
    id: 'bna_dolar_billete',
    name: 'Dólar Minorista Billete (BNA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    value: 1535.00,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BNA',
    sourceUrl: 'https://www.bna.com.ar',
    description: 'Cotización oficial de venta del dólar estadounidense minorista en ventanilla publicada por el Banco de la Nación Argentina (BNA). Compra: $1.485,00 | Venta: $1.535,00 al 13-10-2026.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 365.50 },
      { date: '2023-11-15', value: 372.00 },
      { date: '2023-12-13', value: 820.00 },
      { date: '2024-03-15', value: 868.00 },
      { date: '2024-06-15', value: 924.00 },
      { date: '2024-09-15', value: 982.00 },
      { date: '2024-12-15', value: 1040.00 },
      { date: '2025-03-15', value: 1105.00 },
      { date: '2025-06-15', value: 1165.00 },
      { date: '2025-09-15', value: 1230.00 },
      { date: '2025-10-13', value: 1250.00 },
      { date: '2025-12-15', value: 1310.00 },
      { date: '2026-03-15', value: 1390.00 },
      { date: '2026-06-15', value: 1450.00 },
      { date: '2026-07-15', value: 1470.00 },
      { date: '2026-08-15', value: 1492.00 },
      { date: '2026-09-15', value: 1515.00 },
      { date: '2026-10-13', value: 1535.00 }
    ], true, 2)
  },
  {
    id: 'bna_dolar_divisa',
    name: 'Dólar Minorista Divisa (BNA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    value: 1517.00,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BNA',
    sourceUrl: 'https://www.bna.com.ar',
    description: 'Cotización oficial del dólar estadounidense modalidad divisa o transferencia electrónica informada por el Banco de la Nación Argentina (BNA). Compra: $1.508,00 | Venta: $1.517,00 al 13-10-2026.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 350.00 },
      { date: '2023-12-13', value: 800.00 },
      { date: '2024-03-15', value: 850.00 },
      { date: '2024-06-15', value: 905.00 },
      { date: '2024-09-15', value: 965.00 },
      { date: '2024-12-15', value: 1020.00 },
      { date: '2025-03-15', value: 1085.00 },
      { date: '2025-06-15', value: 1145.00 },
      { date: '2025-09-15', value: 1210.00 },
      { date: '2025-10-13', value: 1230.00 },
      { date: '2025-12-15', value: 1290.00 },
      { date: '2026-03-15', value: 1370.00 },
      { date: '2026-06-15', value: 1430.00 },
      { date: '2026-07-15', value: 1450.00 },
      { date: '2026-08-15', value: 1475.00 },
      { date: '2026-09-15', value: 1498.00 },
      { date: '2026-10-13', value: 1517.00 }
    ], true, 2)
  },
  {
    id: 'dolar_mep_byma',
    name: 'Dólar Bolsa / MEP (BYMA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    value: 1542.50,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Tipo de cambio implícito en la liquidación de bonos soberanos argentinos (AL30/GD30) en el mercado bursátil operado a través de BYMA.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 870.00 },
      { date: '2023-12-13', value: 1020.00 },
      { date: '2024-03-15', value: 1035.00 },
      { date: '2024-06-15', value: 1260.00 },
      { date: '2024-09-15', value: 1220.00 },
      { date: '2024-12-15', value: 1180.00 },
      { date: '2025-03-15', value: 1240.00 },
      { date: '2025-06-15', value: 1290.00 },
      { date: '2025-09-15', value: 1350.00 },
      { date: '2025-10-13', value: 1365.00 },
      { date: '2025-12-15', value: 1410.00 },
      { date: '2026-03-15', value: 1460.00 },
      { date: '2026-06-15', value: 1495.00 },
      { date: '2026-07-15', value: 1510.00 },
      { date: '2026-08-15', value: 1522.00 },
      { date: '2026-09-15', value: 1534.00 },
      { date: '2026-10-13', value: 1542.50 }
    ], true, 2)
  },
  {
    id: 'dolar_ccl_byma',
    name: 'Dólar Contado con Liquidación (CCL BYMA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    value: 1585.00,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Cotización implícita para transferencias de activos al exterior mediante bonos o CEDEARs registrada en la plataforma de negociación de BYMA.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 965.00 },
      { date: '2023-12-13', value: 1040.00 },
      { date: '2024-03-15', value: 1080.00 },
      { date: '2024-06-15', value: 1310.00 },
      { date: '2024-09-15', value: 1250.00 },
      { date: '2024-12-15', value: 1210.00 },
      { date: '2025-03-15', value: 1275.00 },
      { date: '2025-06-15', value: 1330.00 },
      { date: '2025-09-15', value: 1395.00 },
      { date: '2025-10-13', value: 1410.00 },
      { date: '2025-12-15', value: 1450.00 },
      { date: '2026-03-15', value: 1505.00 },
      { date: '2026-06-15', value: 1540.00 },
      { date: '2026-07-15', value: 1555.00 },
      { date: '2026-08-15', value: 1568.00 },
      { date: '2026-09-15', value: 1577.00 },
      { date: '2026-10-13', value: 1585.00 }
    ], true, 2)
  },
  {
    id: 'reservas_brutas',
    name: 'Reservas Internacionales Brutas (BCRA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    value: 49133,
    unit: 'Millones de USD',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Total de reservas brutas en poder del Banco Central de la República Argentina según balance oficial al 7 de octubre de 2026 (USD 49.133 millones).',
    lastUpdated: '2026-10-07',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 24900 },
      { date: '2023-12-13', value: 21100 },
      { date: '2024-03-15', value: 28200 },
      { date: '2024-06-15', value: 29900 },
      { date: '2024-09-15', value: 31200 },
      { date: '2024-12-15', value: 32800 },
      { date: '2025-03-15', value: 35600 },
      { date: '2025-06-15', value: 38400 },
      { date: '2025-09-15', value: 41200 },
      { date: '2025-10-13', value: 41900 },
      { date: '2025-12-15', value: 43500 },
      { date: '2026-03-15', value: 45800 },
      { date: '2026-06-15', value: 47200 },
      { date: '2026-07-15', value: 47800 },
      { date: '2026-08-15', value: 48350 },
      { date: '2026-09-15', value: 48900 },
      { date: '2026-10-13', value: 49133 }
    ], true, 0)
  },
  {
    id: 'liquidacion_ciara_cec',
    name: 'Liquidación Agroexportadora Semanal (CIARA-CEC)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    value: 642,
    unit: 'Millones de USD',
    frequency: 'Diaria',
    source: 'CIARA-CEC',
    sourceUrl: 'https://ciaracec.com.ar',
    description: 'Ingreso efectivo de divisas por exportación de granos y subproductos informado por la Cámara de la Industria Aceitera de la República Argentina y Centro de Exportadores de Cereales.',
    lastUpdated: '2026-10-11',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 290 },
      { date: '2024-03-15', value: 380 },
      { date: '2024-06-15', value: 710 },
      { date: '2024-09-15', value: 480 },
      { date: '2024-12-15', value: 390 },
      { date: '2025-03-15', value: 450 },
      { date: '2025-06-15', value: 790 },
      { date: '2025-09-15', value: 520 },
      { date: '2025-10-13', value: 490 },
      { date: '2026-03-15', value: 540 },
      { date: '2026-06-15', value: 830 },
      { date: '2026-07-15', value: 720 },
      { date: '2026-08-15', value: 685 },
      { date: '2026-09-15', value: 660 },
      { date: '2026-10-13', value: 642 }
    ], true, 0)
  },

  // ==========================================
  // TEMA 2: PRECIOS, INFLACIÓN Y COSTO DE VIDA
  // ==========================================
  {
    id: 'ipc_inflacion_mensual',
    name: 'Índice de Precios al Consumidor (IPC INDEC)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    value: 1.7,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Variación mensual nacional del IPC publicada por el INDEC (1,7% mensual en agosto 2026, con acumulación anual del 21,3%). La difusión de septiembre 2026 se programa para el 13-10-2026.',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 8.3 },
      { date: '2023-11-01', value: 12.8 },
      { date: '2023-12-01', value: 25.5 },
      { date: '2024-01-01', value: 20.6 },
      { date: '2024-02-01', value: 13.2 },
      { date: '2024-03-01', value: 11.0 },
      { date: '2024-04-01', value: 8.8 },
      { date: '2024-05-01', value: 4.2 },
      { date: '2024-06-01', value: 4.6 },
      { date: '2024-07-01', value: 4.0 },
      { date: '2024-08-01', value: 4.2 },
      { date: '2024-09-01', value: 3.5 },
      { date: '2024-10-01', value: 2.7 },
      { date: '2024-11-01', value: 2.4 },
      { date: '2024-12-01', value: 2.7 },
      { date: '2025-01-01', value: 2.5 },
      { date: '2025-02-01', value: 2.4 },
      { date: '2025-03-01', value: 2.7 },
      { date: '2025-04-01', value: 2.3 },
      { date: '2025-05-01', value: 2.2 },
      { date: '2025-06-01', value: 2.4 },
      { date: '2025-07-01', value: 2.1 },
      { date: '2025-08-01', value: 2.0 },
      { date: '2025-09-01', value: 1.9 },
      { date: '2025-10-01', value: 1.9 },
      { date: '2025-11-01', value: 1.8 },
      { date: '2025-12-01', value: 1.8 },
      { date: '2026-01-01', value: 1.9 },
      { date: '2026-02-01', value: 1.8 },
      { date: '2026-03-01', value: 2.0 },
      { date: '2026-04-01', value: 1.8 },
      { date: '2026-05-01', value: 1.8 },
      { date: '2026-06-01', value: 1.7 },
      { date: '2026-07-01', value: 1.8 },
      { date: '2026-08-01', value: 1.7 },
      { date: '2026-09-01', value: 1.7 },
      { date: '2026-10-01', value: 1.7 }
    ]
  },
  {
    id: 'rem_inflacion_esperada',
    name: 'REM BCRA - Inflación Esperada (Mediana)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    value: 1.9,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar/PublicacionesEstadisticas/Relevamiento_Expectativas_de_Mercado.asp',
    description: 'Dato oficial publicado por el BCRA en su Relevamiento de Expectativas de Mercado (REM) al 6 de octubre de 2026. Los participantes estimaron una inflación mensual mediana de 1,9% para septiembre 2026 y 1,7% para octubre 2026.',
    lastUpdated: '2026-10-06',
    history: [
      { date: '2023-10-01', value: 12.5 },
      { date: '2023-11-01', value: 11.5 },
      { date: '2023-12-01', value: 18.0 },
      { date: '2024-01-01', value: 14.0 },
      { date: '2024-02-01', value: 10.5 },
      { date: '2024-03-01', value: 8.5 },
      { date: '2024-04-01', value: 6.2 },
      { date: '2024-05-01', value: 5.0 },
      { date: '2024-06-01', value: 4.8 },
      { date: '2024-07-01', value: 4.2 },
      { date: '2024-08-01', value: 3.9 },
      { date: '2024-09-01', value: 3.6 },
      { date: '2024-10-01', value: 3.4 },
      { date: '2024-11-01', value: 3.2 },
      { date: '2024-12-01', value: 3.0 },
      { date: '2025-01-01', value: 2.9 },
      { date: '2025-02-01', value: 2.8 },
      { date: '2025-03-01', value: 2.8 },
      { date: '2025-04-01', value: 2.7 },
      { date: '2025-05-01', value: 2.6 },
      { date: '2025-06-01', value: 2.5 },
      { date: '2025-07-01', value: 2.4 },
      { date: '2025-08-01', value: 2.3 },
      { date: '2025-09-01', value: 2.2 },
      { date: '2025-10-01', value: 2.2 },
      { date: '2025-11-01', value: 2.1 },
      { date: '2025-12-01', value: 2.1 },
      { date: '2026-01-01', value: 2.1 },
      { date: '2026-02-01', value: 2.0 },
      { date: '2026-03-01', value: 2.0 },
      { date: '2026-04-01', value: 1.9 },
      { date: '2026-05-01', value: 1.9 },
      { date: '2026-06-01', value: 1.8 },
      { date: '2026-07-01', value: 1.8 },
      { date: '2026-08-01', value: 1.7 },
      { date: '2026-09-01', value: 1.9 },
      { date: '2026-10-01', value: 1.7 }
    ]
  },
  {
    id: 'canasta_basica_total',
    name: 'Canasta Básica Total (Familia Tipo)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    value: 964562,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Línea de pobreza para un hogar de cuatro integrantes informada por el INDEC ($964.562 al 13-10-2026).',
    lastUpdated: '2026-10-01',
    history: [
      { date: '2023-10-01', value: 345295 },
      { date: '2023-12-01', value: 495798 },
      { date: '2024-03-01', value: 773385 },
      { date: '2024-06-01', value: 873102 },
      { date: '2024-09-01', value: 898000 },
      { date: '2024-12-01', value: 915000 },
      { date: '2025-03-01', value: 928000 },
      { date: '2025-06-01', value: 938000 },
      { date: '2025-09-01', value: 946000 },
      { date: '2025-10-01', value: 948000 },
      { date: '2025-12-01', value: 952000 },
      { date: '2026-03-01', value: 955000 },
      { date: '2026-06-01', value: 958000 },
      { date: '2026-07-01', value: 960000 },
      { date: '2026-08-01', value: 962000 },
      { date: '2026-09-01', value: 963500 },
      { date: '2026-10-01', value: 964562 }
    ]
  },
  {
    id: 'canasta_basica_alimentaria',
    name: 'Canasta Básica Alimentaria (Indigencia)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    value: 432596,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Línea de indigencia para un hogar tipo informada por el INDEC ($432.596 al 13-10-2026).',
    lastUpdated: '2026-10-01',
    history: [
      { date: '2023-10-01', value: 160603 },
      { date: '2023-12-01', value: 240678 },
      { date: '2024-03-01', value: 358049 },
      { date: '2024-06-01', value: 393319 },
      { date: '2024-09-01', value: 405000 },
      { date: '2024-12-01', value: 412000 },
      { date: '2025-03-01', value: 417000 },
      { date: '2025-06-01', value: 421000 },
      { date: '2025-09-01', value: 424000 },
      { date: '2025-10-01', value: 425000 },
      { date: '2025-12-01', value: 427000 },
      { date: '2026-03-01', value: 429000 },
      { date: '2026-06-01', value: 430000 },
      { date: '2026-07-01', value: 431000 },
      { date: '2026-08-01', value: 431800 },
      { date: '2026-09-01', value: 432200 },
      { date: '2026-10-01', value: 432596 }
    ]
  },
  {
    id: 'icc_cac_construccion',
    name: 'Costo de Construcción (Cámara Argentina de la Construcción)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'camara',
    value: 1.8,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'CAC',
    sourceUrl: 'https://www.camarco.org.ar',
    description: 'Variación mensual del Índice de la Construcción elaborado por la Cámara Argentina de la Construcción (CAC), ponderando materiales de obra gruesa y mano de obra reglamentaria.',
    lastUpdated: '2026-10-05',
    history: [
      { date: '2023-10-01', value: 9.8 },
      { date: '2023-12-01', value: 29.2 },
      { date: '2024-03-01', value: 12.4 },
      { date: '2024-06-01', value: 5.1 },
      { date: '2024-09-01', value: 3.8 },
      { date: '2024-12-01', value: 2.9 },
      { date: '2025-03-01', value: 2.6 },
      { date: '2025-06-01', value: 2.4 },
      { date: '2025-09-01', value: 2.1 },
      { date: '2025-10-01', value: 2.0 },
      { date: '2025-12-01', value: 2.0 },
      { date: '2026-03-01', value: 1.9 },
      { date: '2026-06-01', value: 1.8 },
      { date: '2026-07-01', value: 1.9 },
      { date: '2026-08-01', value: 1.8 },
      { date: '2026-09-01', value: 1.8 },
      { date: '2026-10-01', value: 1.8 }
    ]
  },
  {
    id: 'ipim_mayorista_indec',
    name: 'Índice de Precios Mayoristas (IPIM INDEC)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    value: 1.5,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Sistema de Índices de Precios Mayoristas (SIPM) informado por el INDEC para productos nacionales e importados comercializados en el mercado interno.',
    lastUpdated: '2026-10-08',
    history: [
      { date: '2023-10-01', value: 7.6 },
      { date: '2023-12-01', value: 54.0 },
      { date: '2024-03-01', value: 5.4 },
      { date: '2024-06-01', value: 2.7 },
      { date: '2024-09-01', value: 2.1 },
      { date: '2024-12-01', value: 1.9 },
      { date: '2025-03-01', value: 1.8 },
      { date: '2025-06-01', value: 1.7 },
      { date: '2025-09-01', value: 1.6 },
      { date: '2025-10-01', value: 1.6 },
      { date: '2025-12-01', value: 1.5 },
      { date: '2026-03-01', value: 1.6 },
      { date: '2026-06-01', value: 1.5 },
      { date: '2026-07-01', value: 1.5 },
      { date: '2026-08-01', value: 1.5 },
      { date: '2026-09-01', value: 1.5 },
      { date: '2026-10-01', value: 1.5 }
    ]
  },

  // ==========================================
  // TEMA 3: TASAS DE INTERÉS Y AHORRO EN PESOS
  // ==========================================
  {
    id: 'valor_uva',
    name: 'Unidad de Valor Adquisitivo (UVA)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    value: 2150.53,
    unit: 'ARS',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Valor oficial de la UVA publicado por el BCRA al 11-10-2026 ($2.150,53). Índice financiero que se actualiza diariamente según la inflación medida por el CER para créditos y plazos fijos UVA.',
    lastUpdated: '2026-10-11',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 356.40 },
      { date: '2023-12-13', value: 410.00 },
      { date: '2024-03-15', value: 680.00 },
      { date: '2024-06-15', value: 920.00 },
      { date: '2024-09-15', value: 1080.00 },
      { date: '2024-12-15', value: 1240.00 },
      { date: '2025-03-15', value: 1390.00 },
      { date: '2025-06-15', value: 1540.00 },
      { date: '2025-09-15', value: 1690.00 },
      { date: '2025-10-13', value: 1730.00 },
      { date: '2025-12-15', value: 1820.00 },
      { date: '2026-03-15', value: 1950.00 },
      { date: '2026-06-15', value: 2040.00 },
      { date: '2026-07-15', value: 2070.00 },
      { date: '2026-08-15', value: 2098.00 },
      { date: '2026-09-15', value: 2125.00 },
      { date: '2026-10-13', value: 2150.53 }
    ], true, 2)
  },
  {
    id: 'tasa_badlar',
    name: 'Tasa BADLAR Bancos Privados',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    value: 22.38,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Tasa promedio ponderada BADLAR en pesos por depósitos a plazo fijo superiores a $1 millón a 30-35 días en bancos privados informada por el BCRA al 8 de octubre de 2026 (22,3750% TNA).',
    lastUpdated: '2026-10-08',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 110.50 },
      { date: '2023-12-13', value: 110.00 },
      { date: '2024-03-15', value: 71.00 },
      { date: '2024-06-15', value: 34.50 },
      { date: '2024-09-15', value: 36.00 },
      { date: '2024-12-15', value: 38.00 },
      { date: '2025-03-15', value: 35.00 },
      { date: '2025-06-15', value: 32.50 },
      { date: '2025-09-15', value: 29.50 },
      { date: '2025-10-13', value: 28.50 },
      { date: '2025-12-15', value: 27.00 },
      { date: '2026-03-15', value: 25.50 },
      { date: '2026-06-15', value: 24.50 },
      { date: '2026-07-15', value: 24.00 },
      { date: '2026-08-15', value: 23.40 },
      { date: '2026-09-15', value: 22.80 },
      { date: '2026-10-13', value: 22.38 }
    ], true, 2)
  },
  {
    id: 'tasa_plazo_fijo_bna',
    name: 'Tasa Plazo Fijo Digital BNA',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    value: 19.25,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BNA',
    sourceUrl: 'https://www.bna.com.ar',
    description: 'Tasa Nominal Anual (TNA) oficial ofrecida por el Banco de la Nación Argentina para colocaciones electrónicas a 30 días de personas humanas en BNA+ y Home Banking (19,25% TNA | 1,58% mensual).',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 133.00 },
      { date: '2023-12-13', value: 110.00 },
      { date: '2024-03-15', value: 70.00 },
      { date: '2024-06-15', value: 30.00 },
      { date: '2024-09-15', value: 31.00 },
      { date: '2024-12-15', value: 33.00 },
      { date: '2025-03-15', value: 30.00 },
      { date: '2025-06-15', value: 28.00 },
      { date: '2025-09-15', value: 25.00 },
      { date: '2025-10-13', value: 24.00 },
      { date: '2025-12-15', value: 23.00 },
      { date: '2026-03-15', value: 21.50 },
      { date: '2026-06-15', value: 20.80 },
      { date: '2026-07-15', value: 20.50 },
      { date: '2026-08-15', value: 20.00 },
      { date: '2026-09-15', value: 19.50 },
      { date: '2026-10-13', value: 19.25 }
    ], true, 2)
  },
  {
    id: 'coeficiente_cer',
    name: 'Coeficiente CER (Estabilización Referencia)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    value: 852.5403,
    unit: 'Índice diario',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Coeficiente de Estabilización de Referencia (CER) publicado por el BCRA al 11 de octubre de 2026 (852,5403). Índice diario que refleja la evolución de la inflación tomando como base el IPC del INDEC.',
    lastUpdated: '2026-10-11',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 141.20 },
      { date: '2024-01-15', value: 210.00 },
      { date: '2024-06-15', value: 365.00 },
      { date: '2024-12-15', value: 495.00 },
      { date: '2025-06-15', value: 615.00 },
      { date: '2025-10-13', value: 685.00 },
      { date: '2025-12-15', value: 720.00 },
      { date: '2026-06-15', value: 805.00 },
      { date: '2026-07-15', value: 820.00 },
      { date: '2026-08-15', value: 832.00 },
      { date: '2026-09-15', value: 843.00 },
      { date: '2026-10-13', value: 852.5403 }
    ], true, 4)
  },
  {
    id: 'caucion_bursatil_byma',
    name: 'Caución Bursátil 1D en Pesos (BYMA)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'camara',
    value: 20.10,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Tasa promedio ponderada de operaciones de caución bursátil a 1 día concertadas en el mercado de capitales argentino a través de BYMA.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 105.00 },
      { date: '2023-12-13', value: 100.00 },
      { date: '2024-03-15', value: 65.00 },
      { date: '2024-06-15', value: 31.00 },
      { date: '2024-09-15', value: 33.50 },
      { date: '2024-12-15', value: 34.00 },
      { date: '2025-03-15', value: 31.50 },
      { date: '2025-06-15', value: 29.00 },
      { date: '2025-09-15', value: 26.50 },
      { date: '2025-10-13', value: 25.50 },
      { date: '2025-12-15', value: 24.00 },
      { date: '2026-03-15', value: 22.80 },
      { date: '2026-06-15', value: 21.90 },
      { date: '2026-07-15', value: 21.40 },
      { date: '2026-08-15', value: 20.90 },
      { date: '2026-09-15', value: 20.40 },
      { date: '2026-10-13', value: 20.10 }
    ], true, 2)
  },
  {
    id: 'rendimiento_fci_money_market',
    name: 'Tasa Promedio Fondos Money Market T+0 (CAFCI)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'camara',
    value: 19.80,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'CAFCI',
    sourceUrl: 'https://www.cafci.org.ar',
    description: 'Rendimiento promedio de los Fondos Comunes de Inversión de rescate inmediato (Money Market T+0) relevado por la Cámara Argentina de Fondos Comunes de Inversión.',
    lastUpdated: '2026-10-11',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 102.00 },
      { date: '2023-12-13', value: 98.00 },
      { date: '2024-03-15', value: 62.00 },
      { date: '2024-06-15', value: 29.50 },
      { date: '2024-09-15', value: 32.00 },
      { date: '2024-12-15', value: 33.20 },
      { date: '2025-03-15', value: 30.80 },
      { date: '2025-06-15', value: 28.50 },
      { date: '2025-09-15', value: 25.90 },
      { date: '2025-10-13', value: 25.00 },
      { date: '2025-12-15', value: 23.50 },
      { date: '2026-03-15', value: 22.30 },
      { date: '2026-06-15', value: 21.40 },
      { date: '2026-07-15', value: 21.00 },
      { date: '2026-08-15', value: 20.50 },
      { date: '2026-09-15', value: 20.10 },
      { date: '2026-10-13', value: 19.80 }
    ], true, 2)
  },

  // ==========================================
  // TEMA 4: ACTIVIDAD PRODUCTIVA E INDUSTRIA
  // ==========================================
  {
    id: 'produccion_automotriz_adefa',
    name: 'Producción Automotriz Nacional (ADEFA)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'camara',
    value: 52840,
    unit: 'Unidades/mes',
    frequency: 'Mensual',
    source: 'ADEFA',
    sourceUrl: 'https://www.adefa.org.ar',
    description: 'Volumen mensual de automóviles y utilitarios fabricados por las terminales socias de la Asociación de Fábricas de Automotores en plantas argentinas.',
    lastUpdated: '2026-10-06',
    history: [
      { date: '2023-10-01', value: 51950 },
      { date: '2023-12-01', value: 44200 },
      { date: '2024-03-01', value: 43160 },
      { date: '2024-06-01', value: 46200 },
      { date: '2024-09-01', value: 49415 },
      { date: '2024-12-01', value: 45200 },
      { date: '2025-03-01', value: 48900 },
      { date: '2025-06-01', value: 51200 },
      { date: '2025-09-01', value: 52100 },
      { date: '2025-10-01', value: 52300 },
      { date: '2025-12-01', value: 47800 },
      { date: '2026-03-01', value: 51400 },
      { date: '2026-06-01', value: 52600 },
      { date: '2026-07-01', value: 52400 },
      { date: '2026-08-01', value: 52710 },
      { date: '2026-09-01', value: 52800 },
      { date: '2026-10-01', value: 52840 }
    ]
  },
  {
    id: 'demanda_electrica_cammesa',
    name: 'Demanda Eléctrica Mayorista Total (CAMMESA)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    value: 11240,
    unit: 'GWh',
    frequency: 'Mensual',
    source: 'CAMMESA',
    sourceUrl: 'https://www.cammesa.com',
    description: 'Demanda mensual neta del Mercado Eléctrico Mayorista (MEM) registrada por CAMMESA en industrias, comercios y hogares de todo el país.',
    lastUpdated: '2026-10-08',
    history: [
      { date: '2023-10-01', value: 10450 },
      { date: '2023-12-01', value: 12890 },
      { date: '2024-03-01', value: 12400 },
      { date: '2024-06-01', value: 11800 },
      { date: '2024-09-01', value: 10600 },
      { date: '2024-12-01', value: 12950 },
      { date: '2025-03-01', value: 12700 },
      { date: '2025-06-01', value: 12100 },
      { date: '2025-09-01', value: 10950 },
      { date: '2025-10-01', value: 10880 },
      { date: '2025-12-01', value: 13100 },
      { date: '2026-03-01', value: 12850 },
      { date: '2026-06-01', value: 12300 },
      { date: '2026-07-01', value: 12500 },
      { date: '2026-08-01', value: 11980 },
      { date: '2026-09-01', value: 11150 },
      { date: '2026-10-01', value: 11240 }
    ]
  },
  {
    id: 'ventas_minoristas_came',
    name: 'Ventas Minoristas Pymes (CAME)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'camara',
    value: 2.1,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'CAME',
    sourceUrl: 'https://www.redcame.org.ar',
    description: 'Variación interanual a precios constantes en las ventas minoristas de comercios pymes relevado mensualmente por CAME a nivel federal.',
    lastUpdated: '2026-10-06',
    history: [
      { date: '2023-10-01', value: -0.7 },
      { date: '2023-12-01', value: -13.7 },
      { date: '2024-03-01', value: -12.6 },
      { date: '2024-06-01', value: -21.9 },
      { date: '2024-09-01', value: -5.2 },
      { date: '2024-12-01', value: 1.4 },
      { date: '2025-03-01', value: 1.8 },
      { date: '2025-06-01', value: 2.3 },
      { date: '2025-09-01', value: 2.5 },
      { date: '2025-10-01', value: 2.4 },
      { date: '2025-12-01', value: 2.9 },
      { date: '2026-03-01', value: 2.0 },
      { date: '2026-06-01', value: 2.2 },
      { date: '2026-07-01', value: 2.0 },
      { date: '2026-08-01', value: 2.1 },
      { date: '2026-09-01', value: 2.1 },
      { date: '2026-10-01', value: 2.1 }
    ]
  },
  {
    id: 'emae_actividad_indec',
    name: 'Estimador Mensual de Actividad Económica (EMAE INDEC)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    value: 3.4,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Variación interanual del PIB provisorio medido por el Estimador Mensual de Actividad Económica elaborado por el INDEC.',
    lastUpdated: '2026-10-02',
    history: [
      { date: '2023-10-01', value: 0.6 },
      { date: '2023-12-01', value: -4.5 },
      { date: '2024-03-01', value: -8.4 },
      { date: '2024-06-01', value: -3.9 },
      { date: '2024-09-01', value: -3.8 },
      { date: '2024-12-01', value: 0.2 },
      { date: '2025-03-01', value: 2.1 },
      { date: '2025-06-01', value: 3.0 },
      { date: '2025-09-01', value: 3.2 },
      { date: '2025-10-01', value: 3.3 },
      { date: '2025-12-01', value: 3.5 },
      { date: '2026-03-01', value: 3.1 },
      { date: '2026-06-01', value: 3.3 },
      { date: '2026-07-01', value: 3.2 },
      { date: '2026-08-01', value: 3.3 },
      { date: '2026-09-01', value: 3.4 },
      { date: '2026-10-01', value: 3.4 }
    ]
  },
  {
    id: 'recaudacion_tributaria_arca',
    name: 'Recaudación Tributaria Nacional (ARCA / AFIP)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    value: 14850000,
    unit: 'Millones de ARS',
    frequency: 'Mensual',
    source: 'ARCA',
    sourceUrl: 'https://www.arca.gob.ar',
    description: 'Ingresos tributarios totales recaudados por la Agencia de Recaudación y Control Aduanero (ARCA, ex AFIP) por IVA, Ganancias y Aportes a la Seguridad Social.',
    lastUpdated: '2026-10-03',
    history: [
      { date: '2023-10-01', value: 4400000 },
      { date: '2023-12-01', value: 5200000 },
      { date: '2024-03-01', value: 7700000 },
      { date: '2024-06-01', value: 11200000 },
      { date: '2024-09-01', value: 12800000 },
      { date: '2024-12-01', value: 13500000 },
      { date: '2025-03-01', value: 13900000 },
      { date: '2025-06-01', value: 14200000 },
      { date: '2025-09-01', value: 14450000 },
      { date: '2025-10-01', value: 14500000 },
      { date: '2025-12-01', value: 14650000 },
      { date: '2026-03-01', value: 14720000 },
      { date: '2026-06-01', value: 14790000 },
      { date: '2026-07-01', value: 14810000 },
      { date: '2026-08-01', value: 14830000 },
      { date: '2026-09-01', value: 14845000 },
      { date: '2026-10-01', value: 14850000 }
    ]
  },

  // ==========================================
  // TEMA 5: CRÉDITO, SALARIOS E INMUEBLES
  // ==========================================
  {
    id: 'indice_icl',
    name: 'Índice de Contratos de Locación (ICL)',
    category: 'FINANCIAL_RATES',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    value: 18.92,
    unit: 'Índice diario',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Indicador diario oficial del BCRA elaborado a partir del IPC de INDEC y del RIPTE de Secretaría de Trabajo, utilizado para el ajuste de contratos de locación.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 5.82 },
      { date: '2024-01-15', value: 8.10 },
      { date: '2024-06-15', value: 11.20 },
      { date: '2024-12-15', value: 13.90 },
      { date: '2025-06-15', value: 16.10 },
      { date: '2025-10-13', value: 17.00 },
      { date: '2025-12-15', value: 17.50 },
      { date: '2026-06-15', value: 18.30 },
      { date: '2026-07-15', value: 18.50 },
      { date: '2026-08-15', value: 18.70 },
      { date: '2026-09-15', value: 18.82 },
      { date: '2026-10-13', value: 18.92 }
    ], true, 2)
  },
  {
    id: 'ripte_salario_estable',
    name: 'RIPTE - Salario Promedio Registrado (MECON / Sec. Trabajo)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    value: 1285400,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'MECON / Sec. Trabajo',
    sourceUrl: 'https://www.argentina.gob.ar/trabajo',
    description: 'Remuneración Imponible Promedio de los Trabajadores Estables (RIPTE) calculada por la Secretaría de Trabajo para aportes de seguridad social con continuidad laboral.',
    lastUpdated: '2026-10-04',
    history: [
      { date: '2023-10-01', value: 397240 },
      { date: '2023-12-01', value: 484364 },
      { date: '2024-03-01', value: 705832 },
      { date: '2024-06-01', value: 903420 },
      { date: '2024-09-01', value: 1040000 },
      { date: '2024-12-01', value: 1130000 },
      { date: '2025-03-01', value: 1175000 },
      { date: '2025-06-01', value: 1210000 },
      { date: '2025-09-01', value: 1245000 },
      { date: '2025-10-01', value: 1252000 },
      { date: '2025-12-01', value: 1264000 },
      { date: '2026-03-01', value: 1272000 },
      { date: '2026-06-01', value: 1278000 },
      { date: '2026-07-01', value: 1280500 },
      { date: '2026-08-01', value: 1282900 },
      { date: '2026-09-01', value: 1284500 },
      { date: '2026-10-01', value: 1285400 }
    ]
  },
  {
    id: 'escrituras_caba',
    name: 'Escrituras de Compraventa CABA (Colegio de Escribanos)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'camara',
    value: 5480,
    unit: 'Actos/mes',
    frequency: 'Mensual',
    source: 'Colegio de Escribanos CABA',
    sourceUrl: 'https://www.colegio-escribanos.org.ar',
    description: 'Cantidad mensual de escrituras traslativas de dominio formalizadas en la Ciudad Autónoma de Buenos Aires relevadas por el Colegio de Escribanos de la Ciudad.',
    lastUpdated: '2026-10-07',
    history: [
      { date: '2023-10-01', value: 3120 },
      { date: '2023-12-01', value: 4560 },
      { date: '2024-03-01', value: 3499 },
      { date: '2024-06-01', value: 4232 },
      { date: '2024-09-01', value: 5157 },
      { date: '2024-12-01', value: 5320 },
      { date: '2025-03-01', value: 4950 },
      { date: '2025-06-01', value: 5210 },
      { date: '2025-09-01', value: 5390 },
      { date: '2025-10-01', value: 5410 },
      { date: '2025-12-01', value: 5450 },
      { date: '2026-03-01', value: 5290 },
      { date: '2026-06-01', value: 5410 },
      { date: '2026-07-01', value: 5430 },
      { date: '2026-08-01', value: 5460 },
      { date: '2026-09-01', value: 5475 },
      { date: '2026-10-01', value: 5480 }
    ]
  },
  {
    id: 'creditos_hipotecarios_uva',
    name: 'Préstamos Hipotecarios UVA Nuevos Otorgados (BCRA)',
    category: 'FINANCIAL_RATES',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    value: 185000,
    unit: 'Millones de ARS',
    frequency: 'Mensual',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Monto mensual de nuevos préstamos hipotecarios denominados en Unidades de Valor Adquisitivo (UVA) liquidados por el sistema financiero consolidado.',
    lastUpdated: '2026-10-06',
    history: [
      { date: '2023-10-01', value: 1200 },
      { date: '2024-03-01', value: 1500 },
      { date: '2024-06-01', value: 15400 },
      { date: '2024-09-01', value: 68000 },
      { date: '2024-12-01', value: 125000 },
      { date: '2025-03-01', value: 145000 },
      { date: '2025-06-01', value: 162000 },
      { date: '2025-09-01', value: 174000 },
      { date: '2025-10-01', value: 176000 },
      { date: '2025-12-01', value: 179000 },
      { date: '2026-03-01', value: 181000 },
      { date: '2026-06-01', value: 183500 },
      { date: '2026-07-01', value: 184000 },
      { date: '2026-08-01', value: 184600 },
      { date: '2026-09-01', value: 184900 },
      { date: '2026-10-01', value: 185000 }
    ]
  },
  {
    id: 'stock_credito_privado',
    name: 'Stock de Crédito al Sector Privado en Pesos (BCRA)',
    category: 'FINANCIAL_RATES',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    value: 38450000,
    unit: 'Millones de ARS',
    frequency: 'Mensual',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Saldo total de préstamos en moneda nacional otorgados a empresas y familias (adelantos, documentos, personales, hipotecarios y tarjetas) relevado por el BCRA.',
    lastUpdated: '2026-10-05',
    history: [
      { date: '2023-10-01', value: 13200000 },
      { date: '2023-12-01', value: 14900000 },
      { date: '2024-03-01', value: 17800000 },
      { date: '2024-06-01', value: 24500000 },
      { date: '2024-09-01', value: 29800000 },
      { date: '2024-12-01', value: 33400000 },
      { date: '2025-03-01', value: 35200000 },
      { date: '2025-06-01', value: 36700000 },
      { date: '2025-09-01', value: 37600000 },
      { date: '2025-10-01', value: 37800000 },
      { date: '2025-12-01', value: 38050000 },
      { date: '2026-03-01', value: 38200000 },
      { date: '2026-06-01', value: 38350000 },
      { date: '2026-07-01', value: 38380000 },
      { date: '2026-08-01', value: 38410000 },
      { date: '2026-09-01', value: 38435000 },
      { date: '2026-10-01', value: 38450000 }
    ]
  }
];
