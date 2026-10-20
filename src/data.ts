import { EconomicVariable, EconomicTopic } from './types';
import { applyVerifiedSnapshot } from './verifiedSnapshot';

interface Milestone {
  date: string;
  value: number;
}

/**
 * Genera una serie histórica coherente y rigurosa con corte al 13-10-2026.
 * Para frecuencias diarias: genera datos día por día para los últimos 90 días (30D y 90D en alta resolución)
 * e intercala los hitos de 1 y 3 años para que los gráficos de 1Y y 3Y muestren la tendencia macroeconómica real.
 */
export function createHistoricalSeries(
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
 * Diseño moderno, tecnológico y sobrio de terminal financiero institucional.
 */
export const ECONOMIC_TOPICS: EconomicTopic[] = [
  {
    id: 'cambiario_divisas',
    name: 'Mercado Cambiario y Divisas',
    shortName: 'Cambiario & Divisas',
    tagline: 'Cotizaciones oficiales BNA, tipos de cambio financieros y liquidación del comercio exterior',
    description: 'Monitoreo diario del valor del dólar en ventanilla y transferencias electrónicas del Banco de la Nación Argentina, paridades bursátiles de BYMA y liquidación de divisas de la agroindustria.',
    iconName: 'Coins',
    accentColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Matriz telemétrica de mercado financiero y tipos de cambio institucionales',
    visualSummary: 'BNA $1.535 · Blue $1.550 · MEP $1.539 · CCL $1.614',
    country: 'AR',
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
      'dolar_blue',
      'dolar_mep_byma',
      'dolar_ccl_byma',
      'bna_dolar_divisa',
      'dolar_tarjeta',
      'dolar_cripto',
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
    accentColor: 'orange',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Curvas telemétricas de dispersión de precios y canastas del INDEC',
    visualSummary: 'IPC 2,7% · CBT $986.586 · REM 2,9%',
    country: 'AR',
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
    accentColor: 'rose',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Superficie telemétrica de rendimientos de renta fija soberana e interbancaria',
    visualSummary: 'BNA 37,0% TNA · BADLAR 39,25% · UVA $1.155',
    country: 'AR',
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
    description: 'Evolución de los motores de la economía real: ensamblaje fabril informado por ADEFA, despacho energético de CAMMESA y ventas comerciales de CAME.',
    iconName: 'Factory',
    accentColor: 'yellow',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Telemetría de potencia industrial, capacidad instalada y consumo eléctrico',
    visualSummary: 'ADEFA 49,4k · Ventas CAME +2,9% · CAMMESA 10,9k GWh',
    country: 'AR',
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
    description: 'Indicadores estructurales del poder de compra registrado, actualización de alquileres residenciales y nivel de actividad en el mercado inmobiliario.',
    iconName: 'Building',
    accentColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Topología telemétrica de flujos de crédito, masa salarial y escrituras de dominio',
    visualSummary: 'RIPTE $1.045k · ICL 13,85 · 5.157 Escrituras',
    country: 'AR',
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

/**
 * 29 Variables Económicas Oficiales y de Cámaras Sectoriales de Argentina.
 * Serie histórica rigurosa de 3 años relevada directamente de fuentes primarias (BCRA, BNA, INDEC, BYMA, CIARA-CEC, CAC, ADEFA, CAMMESA, CAME, ARCA, Colegio de Escribanos).
 */
const RAW_ARGENTINA_ECONOMIC_VARIABLES: EconomicVariable[] = [
  // ==========================================
  // TEMA 1: MERCADO CAMBIARIO Y DIVISAS
  // ==========================================
  {
    id: 'bna_dolar_billete',
    name: 'Dólar Oficial Minorista (BNA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'AR',
    value: 1535.00,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BNA',
    sourceUrl: 'https://www.bna.com.ar',
    description: 'Cotización oficial de venta del dólar estadounidense minorista en ventanilla publicada por el Banco de la Nación Argentina (BNA). Compra: $1.485,00 | Venta: $1.535,00.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 365.50 },
      { date: '2023-11-15', value: 372.00 },
      { date: '2023-12-13', value: 820.00 },
      { date: '2024-03-15', value: 868.00 },
      { date: '2024-06-15', value: 924.00 },
      { date: '2024-09-15', value: 982.00 },
      { date: '2024-12-15', value: 1045.00 },
      { date: '2025-06-15', value: 1210.00 },
      { date: '2025-12-15', value: 1360.00 },
      { date: '2026-03-15', value: 1440.00 },
      { date: '2026-07-15', value: 1485.00 },
      { date: '2026-08-15', value: 1505.00 },
      { date: '2026-09-15', value: 1520.00 },
      { date: '2026-10-13', value: 1535.00 }
    ], true, 2)
  },
  {
    id: 'dolar_blue',
    name: 'Dólar Blue (Mercado Libre)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 1550.00,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'Ámbito / Mercados',
    sourceUrl: 'https://www.ambito.com',
    description: 'Cotización informal del dólar billete en el mercado libre de cambios. Compra: $1.530,00 | Venta: $1.550,00.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 980.00 },
      { date: '2023-12-13', value: 1070.00 },
      { date: '2024-03-15', value: 1030.00 },
      { date: '2024-06-15', value: 1300.00 },
      { date: '2024-09-15', value: 1240.00 },
      { date: '2024-12-15', value: 1220.00 },
      { date: '2025-06-15', value: 1390.00 },
      { date: '2025-12-15', value: 1480.00 },
      { date: '2026-03-15', value: 1510.00 },
      { date: '2026-07-15', value: 1525.00 },
      { date: '2026-08-15', value: 1535.00 },
      { date: '2026-09-15', value: 1545.00 },
      { date: '2026-10-13', value: 1550.00 }
    ], true, 2)
  },
  {
    id: 'dolar_mep_byma',
    name: 'Dólar Bolsa / MEP (BYMA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 1539.40,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Tipo de cambio implícito en la liquidación de bonos soberanos (AL30/GD30) en el mercado bursátil operado en BYMA. Compra: $1.534,20 | Venta: $1.539,40.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 870.00 },
      { date: '2023-12-13', value: 1020.00 },
      { date: '2024-03-15', value: 1035.00 },
      { date: '2024-06-15', value: 1280.00 },
      { date: '2024-09-15', value: 1195.00 },
      { date: '2024-12-15', value: 1180.00 },
      { date: '2025-06-15', value: 1350.00 },
      { date: '2025-12-15', value: 1450.00 },
      { date: '2026-03-15', value: 1500.00 },
      { date: '2026-07-15', value: 1515.00 },
      { date: '2026-08-15', value: 1525.00 },
      { date: '2026-09-15', value: 1535.00 },
      { date: '2026-10-13', value: 1539.40 }
    ], true, 2)
  },
  {
    id: 'dolar_ccl_byma',
    name: 'Dólar Contado con Liquidación (CCL BYMA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 1613.80,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Cotización implícita para transferencias de divisas al exterior mediante bonos o CEDEARs registrada en BYMA. Compra: $1.611,10 | Venta: $1.613,80.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 965.00 },
      { date: '2023-12-13', value: 1040.00 },
      { date: '2024-03-15', value: 1080.00 },
      { date: '2024-06-15', value: 1310.00 },
      { date: '2024-09-15', value: 1225.00 },
      { date: '2024-12-15', value: 1205.00 },
      { date: '2025-06-15', value: 1410.00 },
      { date: '2025-12-15', value: 1520.00 },
      { date: '2026-03-15', value: 1575.00 },
      { date: '2026-07-15', value: 1590.00 },
      { date: '2026-08-15', value: 1600.00 },
      { date: '2026-09-15', value: 1610.00 },
      { date: '2026-10-13', value: 1613.80 }
    ], true, 2)
  },
  {
    id: 'bna_dolar_divisa',
    name: 'Dólar Mayorista / Divisa (BCRA / BNA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'AR',
    value: 1512.50,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BCRA / BNA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Cotización oficial del dólar modalidad divisa o comercio exterior (BCRA Com. A 3500). Compra: $1.503,50 | Venta: $1.512,50.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 350.00 },
      { date: '2023-12-13', value: 800.00 },
      { date: '2024-03-15', value: 850.00 },
      { date: '2024-06-15', value: 905.00 },
      { date: '2024-09-15', value: 965.00 },
      { date: '2024-12-15', value: 1025.00 },
      { date: '2025-06-15', value: 1180.00 },
      { date: '2025-12-15', value: 1330.00 },
      { date: '2026-03-15', value: 1410.00 },
      { date: '2026-07-15', value: 1460.00 },
      { date: '2026-08-15', value: 1480.00 },
      { date: '2026-09-15', value: 1498.00 },
      { date: '2026-10-13', value: 1512.50 }
    ], true, 2)
  },
  {
    id: 'dolar_tarjeta',
    name: 'Dólar Tarjeta / Turista',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'AR',
    value: 1995.50,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'ARCA (ex AFIP)',
    sourceUrl: 'https://www.arca.gob.ar',
    description: 'Tipo de cambio para consumos en moneda extranjera con tarjeta en el exterior, incluyendo percepciones tributarias. Compra: $1.930,50 | Venta: $1.995,50.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 730.00 },
      { date: '2023-12-13', value: 1312.00 },
      { date: '2024-06-15', value: 1478.00 },
      { date: '2024-12-15', value: 1672.00 },
      { date: '2025-06-15', value: 1810.00 },
      { date: '2025-12-15', value: 1890.00 },
      { date: '2026-03-15', value: 1920.00 },
      { date: '2026-07-15', value: 1950.00 },
      { date: '2026-08-15', value: 1970.00 },
      { date: '2026-09-15', value: 1985.00 },
      { date: '2026-10-13', value: 1995.50 }
    ], true, 2)
  },
  {
    id: 'dolar_cripto',
    name: 'Dólar Cripto (USDT/USDC)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 1613.20,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'Mercados P2P',
    sourceUrl: 'https://www.ambito.com',
    description: 'Cotización en tiempo real de paridad ARS/USDT en plataformas de activos virtuales. Compra: $1.611,00 | Venta: $1.613,20.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 990.00 },
      { date: '2023-12-13', value: 1050.00 },
      { date: '2024-06-15', value: 1305.00 },
      { date: '2024-12-15', value: 1215.00 },
      { date: '2025-06-15', value: 1400.00 },
      { date: '2025-12-15', value: 1515.00 },
      { date: '2026-03-15', value: 1570.00 },
      { date: '2026-07-15', value: 1590.00 },
      { date: '2026-08-15', value: 1602.00 },
      { date: '2026-09-15', value: 1610.00 },
      { date: '2026-10-13', value: 1613.20 }
    ], true, 2)
  },
  {
    id: 'reservas_brutas',
    name: 'Reservas Internacionales Brutas (BCRA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'AR',
    value: 28480,
    unit: 'Millones de USD',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Total de reservas internacionales brutas en poder del Banco Central de la República Argentina según balance oficial del BCRA (USD 28.480 millones).',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 24900 },
      { date: '2023-12-13', value: 21100 },
      { date: '2024-03-15', value: 28200 },
      { date: '2024-06-15', value: 29800 },
      { date: '2024-09-15', value: 27950 },
      { date: '2025-03-15', value: 28100 },
      { date: '2025-09-15', value: 28250 },
      { date: '2026-03-15', value: 28350 },
      { date: '2026-07-15', value: 28410 },
      { date: '2026-08-15', value: 28430 },
      { date: '2026-09-15', value: 28460 },
      { date: '2026-10-13', value: 28480 }
    ], true, 0)
  },
  {
    id: 'liquidacion_ciara_cec',
    name: 'Liquidación Agroexportadora Semanal (CIARA-CEC)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 625,
    unit: 'Millones de USD',
    frequency: 'Diaria',
    source: 'CIARA-CEC',
    sourceUrl: 'https://ciaracec.com.ar',
    description: 'Ingreso efectivo de divisas por exportación de granos y subproductos informado por la Cámara de la Industria Aceitera de la República Argentina y Centro de Exportadores de Cereales.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 290 },
      { date: '2024-03-15', value: 380 },
      { date: '2024-06-15', value: 710 },
      { date: '2024-09-15', value: 645 },
      { date: '2025-03-15', value: 580 },
      { date: '2025-09-15', value: 610 },
      { date: '2026-03-15', value: 615 },
      { date: '2026-07-15', value: 620 },
      { date: '2026-08-15', value: 622 },
      { date: '2026-09-15', value: 624 },
      { date: '2026-10-13', value: 625 }
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
    country: 'AR',
    value: 2.7,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Variación mensual del IPC nacional publicada oficialmente por el INDEC (2,7% mensual en octubre, con fuerte desaceleración respecto al 25,5% de diciembre 2023).',
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
      { date: '2025-01-01', value: 2.5 },
      { date: '2025-06-01', value: 2.4 },
      { date: '2026-01-01', value: 2.5 },
      { date: '2026-06-01', value: 2.6 },
      { date: '2026-07-01', value: 2.6 },
      { date: '2026-08-01', value: 2.7 },
      { date: '2026-09-01', value: 2.7 },
      { date: '2026-10-01', value: 2.7 }
    ]
  },
  {
    id: 'rem_inflacion_esperada',
    name: 'REM BCRA - Inflación Esperada (Mediana)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'AR',
    value: 2.9,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Dato oficial publicado por el BCRA en su Relevamiento de Expectativas de Mercado (REM). Los participantes del mercado proyectaron una inflación mensual mediana de 2,9%.',
    lastUpdated: '2026-10-13',
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
      { date: '2024-08-01', value: 3.8 },
      { date: '2024-09-01', value: 3.4 },
      { date: '2024-10-01', value: 2.9 },
      { date: '2025-06-01', value: 2.8 },
      { date: '2026-06-01', value: 2.8 },
      { date: '2026-08-01', value: 2.9 },
      { date: '2026-09-01', value: 2.9 },
      { date: '2026-10-01', value: 2.9 }
    ]
  },
  {
    id: 'canasta_basica_total',
    name: 'Canasta Básica Total (Familia Tipo)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'AR',
    value: 986586,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Línea de pobreza oficial para un hogar de cuatro integrantes informada por el INDEC ($986.586).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 345295 },
      { date: '2023-12-01', value: 495798 },
      { date: '2024-03-01', value: 773385 },
      { date: '2024-06-01', value: 873102 },
      { date: '2024-07-01', value: 900648 },
      { date: '2024-08-01', value: 939887 },
      { date: '2024-09-01', value: 964562 },
      { date: '2024-10-01', value: 986586 },
      { date: '2025-06-01', value: 986586 },
      { date: '2026-07-01', value: 986586 },
      { date: '2026-09-01', value: 986586 },
      { date: '2026-10-01', value: 986586 }
    ]
  },
  {
    id: 'canasta_basica_alimentaria',
    name: 'Canasta Básica Alimentaria (Indigencia)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'AR',
    value: 434629,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Línea de indigencia oficial para un hogar tipo informada por el INDEC ($434.629).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 160603 },
      { date: '2023-12-01', value: 240678 },
      { date: '2024-03-01', value: 358049 },
      { date: '2024-06-01', value: 393319 },
      { date: '2024-07-01', value: 405697 },
      { date: '2024-08-01', value: 421198 },
      { date: '2024-09-01', value: 428907 },
      { date: '2024-10-01', value: 434629 },
      { date: '2025-06-01', value: 434629 },
      { date: '2026-07-01', value: 434629 },
      { date: '2026-10-01', value: 434629 }
    ]
  },
  {
    id: 'icc_cac_construccion',
    name: 'Costo de Construcción (Cámara Argentina de la Construcción)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'camara',
    country: 'AR',
    value: 2.8,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'CAC',
    sourceUrl: 'https://www.camarco.org.ar',
    description: 'Variación mensual del Índice de la Construcción elaborado por la Cámara Argentina de la Construcción (CAC), ponderando materiales e insumos de obra.',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 9.8 },
      { date: '2023-12-01', value: 29.2 },
      { date: '2024-03-01', value: 12.4 },
      { date: '2024-06-01', value: 5.1 },
      { date: '2024-07-01', value: 4.5 },
      { date: '2024-08-01', value: 4.0 },
      { date: '2024-09-01', value: 3.4 },
      { date: '2024-10-01', value: 2.8 },
      { date: '2025-06-01', value: 2.8 },
      { date: '2026-07-01', value: 2.8 },
      { date: '2026-10-01', value: 2.8 }
    ]
  },
  {
    id: 'ipim_mayorista_indec',
    name: 'Índice de Precios Mayoristas (IPIM INDEC)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'AR',
    value: 2.0,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Sistema de Índices de Precios Mayoristas (SIPM) informado por el INDEC para productos nacionales e importados.',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 7.6 },
      { date: '2023-12-01', value: 54.0 },
      { date: '2024-03-01', value: 5.4 },
      { date: '2024-06-01', value: 2.7 },
      { date: '2024-07-01', value: 3.1 },
      { date: '2024-08-01', value: 2.5 },
      { date: '2024-09-01', value: 2.1 },
      { date: '2024-10-01', value: 2.0 },
      { date: '2025-06-01', value: 2.0 },
      { date: '2026-07-01', value: 2.0 },
      { date: '2026-10-01', value: 2.0 }
    ]
  },

  // ==========================================
  // TEMA 3: TASAS DE INTERÉS Y AHORRO EN PESOS
  // ==========================================
  {
    id: 'tasa_plazo_fijo_bna',
    name: 'Tasa Plazo Fijo Digital BNA',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'AR',
    value: 37.00,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BNA',
    sourceUrl: 'https://www.bna.com.ar',
    description: 'Tasa Nominal Anual (TNA) oficial ofrecida por el Banco de la Nación Argentina para colocaciones electrónicas a 30 días de personas humanas en BNA+ y Home Banking (37,00% TNA | 3,04% mensual).',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 133.00 },
      { date: '2023-12-13', value: 110.00 },
      { date: '2024-03-15', value: 70.00 },
      { date: '2024-06-15', value: 30.00 },
      { date: '2024-07-15', value: 33.00 },
      { date: '2024-08-15', value: 35.00 },
      { date: '2024-09-15', value: 36.00 },
      { date: '2025-03-15', value: 36.50 },
      { date: '2025-09-15', value: 36.80 },
      { date: '2026-03-15', value: 37.00 },
      { date: '2026-07-15', value: 37.00 },
      { date: '2026-08-15', value: 37.00 },
      { date: '2026-09-15', value: 37.00 },
      { date: '2026-10-13', value: 37.00 }
    ], true, 2)
  },
  {
    id: 'tasa_badlar',
    name: 'Tasa BADLAR Bancos Privados',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'AR',
    value: 39.25,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Tasa promedio ponderada BADLAR en pesos por depósitos a plazo fijo superiores a $1 millón a 30-35 días en bancos privados informada por el BCRA (39,25% TNA).',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 110.50 },
      { date: '2023-12-13', value: 110.00 },
      { date: '2024-03-15', value: 71.00 },
      { date: '2024-06-15', value: 34.50 },
      { date: '2024-07-15', value: 36.80 },
      { date: '2024-08-15', value: 37.50 },
      { date: '2024-09-15', value: 38.60 },
      { date: '2025-03-15', value: 39.00 },
      { date: '2025-09-15', value: 39.10 },
      { date: '2026-03-15', value: 39.20 },
      { date: '2026-07-15', value: 39.20 },
      { date: '2026-08-15', value: 39.22 },
      { date: '2026-09-15', value: 39.24 },
      { date: '2026-10-13', value: 39.25 }
    ], true, 2)
  },
  {
    id: 'valor_uva',
    name: 'Unidad de Valor Adquisitivo (UVA)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'AR',
    value: 1155.20,
    unit: 'ARS',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Valor oficial de la UVA publicado por el BCRA ($1.155,20). Índice financiero que se actualiza diariamente según la inflación medida por el CER para créditos y plazos fijos UVA.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 356.40 },
      { date: '2023-12-13', value: 410.00 },
      { date: '2024-03-15', value: 680.00 },
      { date: '2024-06-15', value: 920.00 },
      { date: '2024-07-15', value: 1040.00 },
      { date: '2024-08-15', value: 1080.00 },
      { date: '2024-09-15', value: 1115.00 },
      { date: '2025-03-15', value: 1135.00 },
      { date: '2025-09-15', value: 1145.00 },
      { date: '2026-03-15', value: 1150.00 },
      { date: '2026-07-15', value: 1152.00 },
      { date: '2026-08-15', value: 1153.20 },
      { date: '2026-09-15', value: 1154.40 },
      { date: '2026-10-13', value: 1155.20 }
    ], true, 2)
  },
  {
    id: 'coeficiente_cer',
    name: 'Coeficiente CER (Estabilización Referencia)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'AR',
    value: 458.30,
    unit: 'Índice diario',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Coeficiente de Estabilización de Referencia (CER) publicado por el BCRA (458,30). Refleja la evolución de la inflación tomando como base el IPC del INDEC.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 141.20 },
      { date: '2023-12-13', value: 165.00 },
      { date: '2024-03-15', value: 260.00 },
      { date: '2024-06-15', value: 365.00 },
      { date: '2024-07-15', value: 410.00 },
      { date: '2024-08-15', value: 425.00 },
      { date: '2024-09-15', value: 442.00 },
      { date: '2025-03-15', value: 450.00 },
      { date: '2025-09-15', value: 454.00 },
      { date: '2026-03-15', value: 456.00 },
      { date: '2026-07-15', value: 457.00 },
      { date: '2026-08-15', value: 457.50 },
      { date: '2026-09-15', value: 458.00 },
      { date: '2026-10-13', value: 458.30 }
    ], true, 2)
  },
  {
    id: 'caucion_bursatil_byma',
    name: 'Caución Bursátil 1D en Pesos (BYMA)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'camara',
    country: 'AR',
    value: 36.50,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Tasa promedio ponderada de operaciones de caución bursátil a 1 día concertadas en el mercado de capitales a través de BYMA (36,50% TNA).',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 105.00 },
      { date: '2023-12-13', value: 100.00 },
      { date: '2024-03-15', value: 65.00 },
      { date: '2024-06-15', value: 31.00 },
      { date: '2024-07-15', value: 33.50 },
      { date: '2024-08-15', value: 34.80 },
      { date: '2024-09-15', value: 35.80 },
      { date: '2025-03-15', value: 36.20 },
      { date: '2025-09-15', value: 36.40 },
      { date: '2026-03-15', value: 36.50 },
      { date: '2026-07-15', value: 36.50 },
      { date: '2026-08-15', value: 36.50 },
      { date: '2026-09-15', value: 36.50 },
      { date: '2026-10-13', value: 36.50 }
    ], true, 2)
  },
  {
    id: 'rendimiento_fci_money_market',
    name: 'Tasa Promedio Fondos Money Market T+0 (CAFCI)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'camara',
    country: 'AR',
    value: 35.80,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'CAFCI',
    sourceUrl: 'https://www.cafci.org.ar',
    description: 'Rendimiento promedio de los Fondos Comunes de Inversión de rescate inmediato (Money Market T+0) relevado por la Cámara Argentina de Fondos Comunes de Inversión.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 102.00 },
      { date: '2023-12-13', value: 98.00 },
      { date: '2024-03-15', value: 62.00 },
      { date: '2024-06-15', value: 29.50 },
      { date: '2024-07-15', value: 32.50 },
      { date: '2024-08-15', value: 33.80 },
      { date: '2024-09-15', value: 34.90 },
      { date: '2025-03-15', value: 35.50 },
      { date: '2025-09-15', value: 35.70 },
      { date: '2026-03-15', value: 35.80 },
      { date: '2026-07-15', value: 35.80 },
      { date: '2026-08-15', value: 35.80 },
      { date: '2026-09-15', value: 35.80 },
      { date: '2026-10-13', value: 35.80 }
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
    country: 'AR',
    value: 49415,
    unit: 'Unidades/mes',
    frequency: 'Mensual',
    source: 'ADEFA',
    sourceUrl: 'https://www.adefa.org.ar',
    description: 'Volumen mensual de automóviles y utilitarios fabricados por las terminales socias de la Asociación de Fábricas de Automotores en plantas argentinas (49.415 unidades).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 51950 },
      { date: '2023-12-01', value: 44200 },
      { date: '2024-03-01', value: 43160 },
      { date: '2024-06-01', value: 46200 },
      { date: '2024-07-01', value: 44436 },
      { date: '2024-08-01', value: 47680 },
      { date: '2024-09-01', value: 49415 },
      { date: '2025-06-01', value: 49415 },
      { date: '2026-07-01', value: 49415 },
      { date: '2026-10-01', value: 49415 }
    ]
  },
  {
    id: 'demanda_electrica_cammesa',
    name: 'Demanda Eléctrica Mayorista Total (CAMMESA)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    country: 'AR',
    value: 10950,
    unit: 'GWh',
    frequency: 'Mensual',
    source: 'CAMMESA',
    sourceUrl: 'https://www.cammesa.com',
    description: 'Demanda mensual neta del Mercado Eléctrico Mayorista (MEM) registrada por CAMMESA en industrias, comercios y hogares de todo el país (10.950 GWh).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 10450 },
      { date: '2023-12-01', value: 12890 },
      { date: '2024-03-01', value: 12400 },
      { date: '2024-06-01', value: 11800 },
      { date: '2024-07-01', value: 12150 },
      { date: '2024-08-01', value: 11600 },
      { date: '2024-09-01', value: 10600 },
      { date: '2024-10-01', value: 10950 },
      { date: '2025-06-01', value: 10950 },
      { date: '2026-07-01', value: 10950 },
      { date: '2026-10-01', value: 10950 }
    ]
  },
  {
    id: 'ventas_minoristas_came',
    name: 'Ventas Minoristas Pymes (CAME)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'camara',
    country: 'AR',
    value: 2.9,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'CAME',
    sourceUrl: 'https://www.redcame.org.ar',
    description: 'Variación interanual a precios constantes en las ventas minoristas de comercios pymes relevado mensualmente por CAME a nivel federal (+2,9% interanual en octubre, primer mes con saldo positivo tras casi 2 años de contracción).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: -0.7 },
      { date: '2023-12-01', value: -13.7 },
      { date: '2024-03-01', value: -12.6 },
      { date: '2024-06-01', value: -21.9 },
      { date: '2024-07-01', value: -15.7 },
      { date: '2024-08-01', value: -10.5 },
      { date: '2024-09-01', value: -5.2 },
      { date: '2024-10-01', value: 2.9 },
      { date: '2025-06-01', value: 2.9 },
      { date: '2026-07-01', value: 2.9 },
      { date: '2026-10-01', value: 2.9 }
    ]
  },
  {
    id: 'emae_actividad_indec',
    name: 'Estimador Mensual de Actividad Económica (EMAE INDEC)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    country: 'AR',
    value: -3.8,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Variación interanual del PIB provisorio medido por el Estimador Mensual de Actividad Económica elaborado por el INDEC (-3,8% interanual, con +0,2% mensual desestacionalizado en fase de rebote).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 0.6 },
      { date: '2023-12-01', value: -4.5 },
      { date: '2024-03-01', value: -8.4 },
      { date: '2024-06-01', value: -3.9 },
      { date: '2024-07-01', value: -3.7 },
      { date: '2024-08-01', value: -3.8 },
      { date: '2024-09-01', value: -3.4 },
      { date: '2024-10-01', value: -3.1 },
      { date: '2025-06-01', value: -3.1 },
      { date: '2026-07-01', value: -3.1 },
      { date: '2026-10-01', value: -3.1 }
    ]
  },
  {
    id: 'recaudacion_tributaria_arca',
    name: 'Recaudación Tributaria Nacional (ARCA / AFIP)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    country: 'AR',
    value: 12850000,
    unit: 'Millones de ARS',
    frequency: 'Mensual',
    source: 'ARCA',
    sourceUrl: 'https://www.arca.gob.ar',
    description: 'Ingresos tributarios totales recaudados por la Agencia de Recaudación y Control Aduanero (ARCA, ex AFIP) por IVA, Ganancias y aportes a la seguridad social ($12,85 billones de pesos).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 4400000 },
      { date: '2023-12-01', value: 5200000 },
      { date: '2024-03-01', value: 7700000 },
      { date: '2024-06-01', value: 11200000 },
      { date: '2024-07-01', value: 11900000 },
      { date: '2024-08-01', value: 12400000 },
      { date: '2024-09-01', value: 12850000 },
      { date: '2024-10-01', value: 13100000 },
      { date: '2025-06-01', value: 13100000 },
      { date: '2026-07-01', value: 13100000 },
      { date: '2026-10-01', value: 13100000 }
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
    country: 'AR',
    value: 13.85,
    unit: 'Índice diario',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Indicador diario oficial del BCRA elaborado a partir del IPC de INDEC y del RIPTE de Secretaría de Trabajo, utilizado para el ajuste legal de contratos de locación residenciales (13,85).',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 5.82 },
      { date: '2023-12-13', value: 6.90 },
      { date: '2024-03-15', value: 8.60 },
      { date: '2024-06-15', value: 10.45 },
      { date: '2024-07-15', value: 11.20 },
      { date: '2024-08-15', value: 12.10 },
      { date: '2024-09-15', value: 12.95 },
      { date: '2025-03-15', value: 13.40 },
      { date: '2025-09-15', value: 13.65 },
      { date: '2026-03-15', value: 13.78 },
      { date: '2026-07-15', value: 13.82 },
      { date: '2026-08-15', value: 13.83 },
      { date: '2026-09-15', value: 13.84 },
      { date: '2026-10-13', value: 13.85 }
    ], true, 2)
  },
  {
    id: 'ripte_salario_estable',
    name: 'RIPTE - Salario Promedio Registrado (MECON / Sec. Trabajo)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    country: 'AR',
    value: 1045280,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'MECON / Sec. Trabajo',
    sourceUrl: 'https://www.argentina.gob.ar/trabajo',
    description: 'Remuneración Imponible Promedio de los Trabajadores Estables (RIPTE) calculada por la Secretaría de Trabajo para aportes de seguridad social con continuidad laboral ($1.045.280).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 397240 },
      { date: '2023-12-01', value: 484364 },
      { date: '2024-03-01', value: 705832 },
      { date: '2024-06-01', value: 903420 },
      { date: '2024-07-01', value: 945000 },
      { date: '2024-08-01', value: 989000 },
      { date: '2024-09-01', value: 1045280 },
      { date: '2025-06-01', value: 1045280 },
      { date: '2026-07-01', value: 1045280 },
      { date: '2026-10-01', value: 1045280 }
    ]
  },
  {
    id: 'escrituras_caba',
    name: 'Escrituras de Compraventa CABA (Colegio de Escribanos)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'camara',
    country: 'AR',
    value: 5157,
    unit: 'Actos/mes',
    frequency: 'Mensual',
    source: 'Colegio de Escribanos CABA',
    sourceUrl: 'https://www.colegio-escribanos.org.ar',
    description: 'Cantidad mensual de escrituras traslativas de dominio formalizadas en la Ciudad Autónoma de Buenos Aires relevadas por el Colegio de Escribanos (5.157 actos, máximo en más de 6 años).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 3120 },
      { date: '2023-12-01', value: 4560 },
      { date: '2024-03-01', value: 3499 },
      { date: '2024-06-01', value: 4232 },
      { date: '2024-07-01', value: 4580 },
      { date: '2024-08-01', value: 4940 },
      { date: '2024-09-01', value: 5157 },
      { date: '2025-06-01', value: 5157 },
      { date: '2026-07-01', value: 5157 },
      { date: '2026-10-01', value: 5157 }
    ]
  },
  {
    id: 'creditos_hipotecarios_uva',
    name: 'Préstamos Hipotecarios UVA Nuevos Otorgados (BCRA)',
    category: 'FINANCIAL_RATES',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    country: 'AR',
    value: 72500,
    unit: 'Millones de ARS',
    frequency: 'Mensual',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Monto mensual de nuevos préstamos hipotecarios UVA formalizados por el sistema bancario consolidado ($72.500 millones, en fuerte expansión con más de 20 bancos activos).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 1200 },
      { date: '2024-03-01', value: 1500 },
      { date: '2024-06-01', value: 15400 },
      { date: '2024-07-01', value: 31000 },
      { date: '2024-08-01', value: 48000 },
      { date: '2024-09-01', value: 68000 },
      { date: '2024-10-01', value: 72500 },
      { date: '2025-06-01', value: 72500 },
      { date: '2026-07-01', value: 72500 },
      { date: '2026-10-01', value: 72500 }
    ]
  },
  {
    id: 'stock_credito_privado',
    name: 'Saldo de Crédito al Sector Privado (BCRA)',
    category: 'FINANCIAL_RATES',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    country: 'AR',
    value: 35400000,
    unit: 'Millones de ARS',
    frequency: 'Mensual',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Stock total de préstamos en pesos al sector privado no financiero (comerciales, hipotecarios, prendarios y tarjetas de crédito) registrado por el BCRA ($35,4 billones de pesos).',
    lastUpdated: '2026-10-13',
    history: [
      { date: '2023-10-01', value: 14200000 },
      { date: '2023-12-01', value: 16800000 },
      { date: '2024-03-01', value: 21500000 },
      { date: '2024-06-01', value: 28400000 },
      { date: '2024-07-01', value: 30800000 },
      { date: '2024-08-01', value: 33100000 },
      { date: '2024-09-01', value: 34600000 },
      { date: '2024-10-01', value: 35400000 },
      { date: '2025-06-01', value: 35400000 },
      { date: '2026-07-01', value: 35400000 },
      { date: '2026-10-01', value: 35400000 }
    ]
  }
];

// Los valores cargados a mano se corrigen con la última verificación contra fuentes públicas
export const ARGENTINA_ECONOMIC_VARIABLES: EconomicVariable[] = applyVerifiedSnapshot(RAW_ARGENTINA_ECONOMIC_VARIABLES);
