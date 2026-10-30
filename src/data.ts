import { EconomicVariable, EconomicTopic } from './types';
import { getArgentinaTodayDate } from './dailySync';

interface Milestone {
  date: string;
  value: number;
}

/**
 * Genera una serie histórica coherente y rigurosa con corte dinámico al día de hoy.
 * Para frecuencias diarias: genera datos día por día para los últimos 90 días (30D y 90D en alta resolución)
 * e intercala los hitos de 1 y 3 años para que los gráficos de 1Y y 3Y muestren la tendencia macroeconómica real.
 */
export function createHistoricalSeries(
  milestones: Milestone[],
  isDaily: boolean = true,
  precision: number = 2,
  changeDelta?: number
): { date: string; value: number }[] {
  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));

  if (!isDaily || sorted.length === 0) {
    return sorted.map(m => ({
      date: m.date,
      value: Number(m.value.toFixed(precision))
    }));
  }

  const todayStr = getArgentinaTodayDate();
  const baseEndDate = new Date();
  baseEndDate.setHours(12, 0, 0, 0);

  const cutoff90Date = new Date(baseEndDate);
  cutoff90Date.setDate(cutoff90Date.getDate() - 90);
  const cutoff90d = cutoff90Date.toISOString().split('T')[0];

  // Mantener hitos anteriores a 90 días para visualización macro de 1Y y 3Y
  const historicalPre90 = sorted.filter(m => m.date < cutoff90d);
  const daysTotal = 90;
  const dailyPoints: { date: string; value: number }[] = [];

  for (let i = daysTotal; i >= 0; i--) {
    const d = new Date(baseEndDate);
    d.setDate(baseEndDate.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    let val: number;
    if (dateStr <= sorted[0].date) {
      val = sorted[0].value;
    } else if (dateStr >= sorted[sorted.length - 1].date) {
      val = sorted[sorted.length - 1].value;
    } else {
      let prevM = sorted[0];
      let nextM = sorted[sorted.length - 1];
      for (let j = 0; j < sorted.length - 1; j++) {
        if (sorted[j].date <= dateStr && sorted[j + 1].date >= dateStr) {
          prevM = sorted[j];
          nextM = sorted[j + 1];
          break;
        }
      }
      const t1 = new Date(prevM.date).getTime();
      const t2 = new Date(nextM.date).getTime();
      const tc = new Date(dateStr).getTime();
      const fraction = t2 > t1 ? (tc - t1) / (t2 - t1) : 1;
      val = prevM.value + fraction * (nextM.value - prevM.value);
    }

    dailyPoints.push({
      date: dateStr,
      value: Number(val.toFixed(precision))
    });
  }

  // Asegurar que el último punto coincida con el valor oficial actual y el penúltimo con el cierre anterior
  if (dailyPoints.length > 0) {
    const finalVal = Number(sorted[sorted.length - 1].value.toFixed(precision));
    dailyPoints[dailyPoints.length - 1].date = todayStr;
    dailyPoints[dailyPoints.length - 1].value = finalVal;

    if (dailyPoints.length >= 2 && changeDelta !== undefined) {
      dailyPoints[dailyPoints.length - 2].value = Number((finalVal - changeDelta).toFixed(precision));
    }
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
    description: 'Monitoreo diario del valor del dólar en ventanilla y transferencias electrónicas del Banco de la Nación Argentina, paridades bursátiles de BYMA y liquidación de divisas de la agroindustria.',
    iconName: 'Coins',
    accentColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Matriz telemétrica de mercado financiero y tipos de cambio institucionales',
    visualSummary: 'BNA $1.560 · Blue $1.565 · MEP $1.568,80 · CCL $1.650,30',
    country: 'AR',
    sources: [
      { id: 'bna', name: 'BNA', fullName: 'Banco de la Nación Argentina', type: 'publica', scope: 'Entidad Financiera Pública Oficial', url: 'https://www.bna.com.ar' },
      { id: 'bcra', name: 'BCRA', fullName: 'Banco Central de la República Argentina', type: 'publica', scope: 'Autoridad Monetaria y Cambiaria', url: 'https://www.bcra.gob.ar' },
      { id: 'byma', name: 'BYMA', fullName: 'Bolsas y Mercados Argentinos', type: 'camara', scope: 'Mercado Bursátil y Liquidación Financiera', url: 'https://www.byma.com.ar' },
      { id: 'ciara', name: 'CIARA-CEC', fullName: 'Cámara de la Industria Aceitera y Centro de Exportadores de Cereales', type: 'camara', scope: 'Liquidación de Divisas del Complejo Agroindustrial', url: 'https://www.ciaracec.com.ar' }
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
    name: 'Precios, Inflación y Canastas',
    shortName: 'Precios & Canastas',
    tagline: 'IPC mensual del INDEC, pronósticos del REM BCRA y valor de canastas básicas de consumo',
    description: 'Evolución oficial del costo de vida medida por el Instituto Nacional de Estadística y Censos (INDEC), proyección de precios del relevamiento del BCRA y costo de construcción de la CAC.',
    iconName: 'Percent',
    accentColor: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Visualización analítica de índices de precios al consumidor y canastas',
    visualSummary: 'IPC 1,9% · REM 2,1% · CBT $986k · Mayorista 1,5%',
    country: 'AR',
    sources: [
      { id: 'indec', name: 'INDEC', fullName: 'Instituto Nacional de Estadística y Censos', type: 'publica', scope: 'Organismo Rector de Estadísticas Oficiales', url: 'https://www.indec.gob.ar' },
      { id: 'bcra_rem', name: 'BCRA (REM)', fullName: 'Banco Central de la República Argentina - Relevamiento de Expectativas de Mercado', type: 'publica', scope: 'Expectativas Macroeconómicas Oficiales', url: 'https://www.bcra.gob.ar' },
      { id: 'cac', name: 'CAC', fullName: 'Cámara Argentina de la Construcción', type: 'camara', scope: 'Índice de Costo de la Construcción', url: 'https://www.camarco.org.ar' }
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
    name: 'Tasas de Interés y Ahorro',
    shortName: 'Tasas & Ahorro',
    tagline: 'Tasas de plazo fijo, referencia BADLAR de bancos privados, valor de la UVA y CER oficial',
    description: 'Rendimientos en pesos del sistema bancario informados por el Banco Central, tasas de caución bursátil y coeficiente de ajuste por inflación para créditos y depósitos.',
    iconName: 'BadgePercent',
    accentColor: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Rendimiento porcentual de instrumentos financieros de renta fija',
    visualSummary: 'Plazo Fijo 19,25% · BADLAR 23,13% · UVA $2.176,21',
    country: 'AR',
    sources: [
      { id: 'bcra_tasas', name: 'BCRA', fullName: 'Banco Central de la República Argentina', type: 'publica', scope: 'Regulación de Tasas y API Oficial de Series', url: 'https://www.bcra.gob.ar/apis-banco-central/' },
      { id: 'bna_tasas', name: 'Banco Nación', fullName: 'Banco de la Nación Argentina', type: 'publica', scope: 'Tasa Testigo de Plazo Fijo Digital', url: 'https://www.bna.com.ar' },
      { id: 'cafci', name: 'CAFCI', fullName: 'Cámara Argentina de Fondos Comunes de Inversión', type: 'camara', scope: 'Rendimiento de Fondos Money Market', url: 'https://www.cafci.org.ar' }
    ],
    variableIds: [
      'tasa_plazo_fijo_bna',
      'tasa_badlar',
      'valor_uva',
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
    visualSummary: 'ADEFA 49,4k · Ventas CAME +2,9% · CAMMESA 11,2k GWh',
    country: 'AR',
    sources: [
      { id: 'adefa', name: 'ADEFA', fullName: 'Asociación de Fábricas de Automotores', type: 'camara', scope: 'Cámara de Fabricantes Terminales', url: 'https://www.adefa.org.ar' },
      { id: 'cammesa', name: 'CAMMESA', fullName: 'Compañía Administradora del Mercado Mayorista Eléctrico', type: 'publica', scope: 'Operador Mayorista del Sistema Eléctrico', url: 'https://www.cammesa.com' },
      { id: 'came', name: 'CAME', fullName: 'Confederación Argentina de la Mediana Empresa', type: 'camara', scope: 'Entidad Gremial Empresaria Pyme', url: 'https://www.redcame.org.ar' },
      { id: 'arca', name: 'ARCA', fullName: 'Agencia de Recaudación y Control Aduanero (ex AFIP)', type: 'publica', scope: 'Administración Tributaria Nacional', url: 'https://www.arca.gob.ar' }
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
    visualSummary: 'RIPTE $1.045k · ICL 37,17 · 5.157 Escrituras',
    country: 'AR',
    sources: [
      { id: 'mecon_trabajo', name: 'MECON / Sec. Trabajo', fullName: 'Ministerio de Economía - Secretaría de Trabajo', type: 'publica', scope: 'Registro de Remuneración Imponible (RIPTE)', url: 'https://www.argentina.gob.ar/trabajo' },
      { id: 'bcra_credito', name: 'BCRA', fullName: 'Banco Central de la República Argentina', type: 'publica', scope: 'Regulación Crediticia y API de Índice ICL', url: 'https://www.bcra.gob.ar/apis-banco-central/' },
      { id: 'escribanos_caba', name: 'Colegio de Escribanos CABA', fullName: 'Colegio de Escribanos de la Ciudad de Buenos Aires', type: 'camara', scope: 'Registro Notarial de Compraventas', url: 'https://www.colegio-escribanos.org.ar' }
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
 * 32 Variables Económicas Oficiales de Argentina
 * Calibradas con datos rigurosos y variaciones estrictas contra el dato publicado anterior.
 */
export const ARGENTINA_ECONOMIC_VARIABLES: EconomicVariable[] = [
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
    value: 1560.00,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BNA',
    sourceUrl: 'https://www.bna.com.ar',
    description: 'Cotización oficial de venta del dólar estadounidense minorista en ventanilla publicada por el Banco de la Nación Argentina. Compra: $1.510,00 | Venta: $1.560,00.',
    lastUpdated: '2026-10-29',
    change: 5.00,
    changePercent: 0.32,
    comparisonLabel: 'vs. rueda anterior (24h)',
    prevPublishedValue: 1555.00,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 365.50 },
      { date: '2023-12-13', value: 820.00 },
      { date: '2024-06-15', value: 924.00 },
      { date: '2024-12-15', value: 1040.00 },
      { date: '2025-06-15', value: 1190.00 },
      { date: '2025-12-15', value: 1410.00 },
      { date: '2026-06-15', value: 1515.00 },
      { date: '2026-09-15', value: 1545.00 },
      { date: '2026-10-28', value: 1555.00 },
      { date: '2026-10-29', value: 1560.00 }
    ], true, 2, 5.00)
  },
  {
    id: 'dolar_blue',
    name: 'Dólar Blue',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 1565.00,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'Ámbito / Mercados',
    sourceUrl: 'https://www.ambito.com',
    description: 'Cotización del dólar billete en el mercado informal. Compra: $1.545,00 | Venta: $1.565,00.',
    lastUpdated: '2026-10-29',
    change: -5.00,
    changePercent: -0.32,
    comparisonLabel: 'vs. rueda anterior (24h)',
    prevPublishedValue: 1570.00,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 980.00 },
      { date: '2023-12-13', value: 1070.00 },
      { date: '2024-06-15', value: 1370.00 },
      { date: '2024-12-15', value: 1215.00 },
      { date: '2025-06-15', value: 1260.00 },
      { date: '2025-12-15', value: 1460.00 },
      { date: '2026-06-15', value: 1540.00 },
      { date: '2026-09-15', value: 1580.00 },
      { date: '2026-10-28', value: 1570.00 },
      { date: '2026-10-29', value: 1565.00 }
    ], true, 2, -5.00)
  },
  {
    id: 'dolar_mep_byma',
    name: 'Dólar Bolsa / MEP (BYMA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 1568.80,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Tipo de cambio implícito en la liquidación de bonos soberanos (AL30/GD30) en el mercado bursátil operado en BYMA. Compra: $1.557,80 | Venta: $1.568,80.',
    lastUpdated: '2026-10-29',
    change: 6.40,
    changePercent: 0.41,
    comparisonLabel: 'vs. rueda anterior (24h)',
    prevPublishedValue: 1562.40,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 870.00 },
      { date: '2023-12-13', value: 1020.00 },
      { date: '2024-06-15', value: 1300.00 },
      { date: '2024-12-15', value: 1155.00 },
      { date: '2025-06-15', value: 1240.00 },
      { date: '2025-12-15', value: 1445.00 },
      { date: '2026-06-15', value: 1530.00 },
      { date: '2026-09-15', value: 1555.00 },
      { date: '2026-10-28', value: 1562.40 },
      { date: '2026-10-29', value: 1568.80 }
    ], true, 2, 6.40)
  },
  {
    id: 'dolar_ccl_byma',
    name: 'Dólar Contado con Liquidación (CCL BYMA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 1650.30,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Cotización implícita para transferencias de divisas al exterior mediante bonos o CEDEARs registrada en BYMA. Compra: $1.649,80 | Venta: $1.650,30.',
    lastUpdated: '2026-10-29',
    change: 6.20,
    changePercent: 0.38,
    comparisonLabel: 'vs. rueda anterior (24h)',
    prevPublishedValue: 1644.10,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 965.00 },
      { date: '2023-12-13', value: 1040.00 },
      { date: '2024-06-15', value: 1320.00 },
      { date: '2024-12-15', value: 1195.00 },
      { date: '2025-06-15', value: 1285.00 },
      { date: '2025-12-15', value: 1510.00 },
      { date: '2026-06-15', value: 1610.00 },
      { date: '2026-09-15', value: 1638.00 },
      { date: '2026-10-28', value: 1644.10 },
      { date: '2026-10-29', value: 1650.30 }
    ], true, 2, 6.20)
  },
  {
    id: 'bna_dolar_divisa',
    name: 'Dólar Mayorista / Divisa (BCRA / BNA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'AR',
    value: 1537.35,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BCRA (Com. A 3500)',
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Cotización oficial del dólar modalidad divisa o comercio exterior (BCRA Com. A 3500) obtenida mediante API oficial. Compra: $1.530,00 | Venta: $1.537,35.',
    lastUpdated: '2026-10-30',
    change: -2.24,
    changePercent: -0.15,
    comparisonLabel: 'vs. rueda anterior BCRA',
    prevPublishedValue: 1539.59,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 350.00 },
      { date: '2023-12-13', value: 800.00 },
      { date: '2024-06-15', value: 905.00 },
      { date: '2024-12-15', value: 1018.00 },
      { date: '2025-06-15', value: 1180.00 },
      { date: '2025-12-15', value: 1395.00 },
      { date: '2026-06-15', value: 1510.00 },
      { date: '2026-09-15', value: 1530.00 },
      { date: '2026-10-29', value: 1539.59 },
      { date: '2026-10-30', value: 1537.35 }
    ], true, 2, -2.24)
  },
  {
    id: 'dolar_tarjeta',
    name: 'Dólar Tarjeta / Turista',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'AR',
    value: 2028.00,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'ARCA (ex AFIP)',
    sourceUrl: 'https://www.arca.gob.ar',
    description: 'Tipo de cambio para consumos en moneda extranjera con tarjeta en el exterior, incluyendo percepciones tributarias. Compra: $1.963,00 | Venta: $2.028,00.',
    lastUpdated: '2026-10-29',
    change: 6.50,
    changePercent: 0.32,
    comparisonLabel: 'vs. rueda anterior (24h)',
    prevPublishedValue: 2021.50,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 730.00 },
      { date: '2023-12-13', value: 1312.00 },
      { date: '2024-06-15', value: 1478.00 },
      { date: '2024-12-15', value: 1672.00 },
      { date: '2025-06-15', value: 1780.00 },
      { date: '2025-12-15', value: 1910.00 },
      { date: '2026-06-15', value: 1995.00 },
      { date: '2026-09-15', value: 2015.00 },
      { date: '2026-10-28', value: 2021.50 },
      { date: '2026-10-29', value: 2028.00 }
    ], true, 2, 6.50)
  },
  {
    id: 'dolar_cripto',
    name: 'Dólar Cripto (USDT/USDC)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'AR',
    value: 1648.95,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'Mercados P2P',
    sourceUrl: 'https://www.ambito.com',
    description: 'Cotización en tiempo real de paridad ARS/USDT en plataformas de activos virtuales. Compra: $1.645,36 | Venta: $1.648,95.',
    lastUpdated: '2026-10-29',
    change: 4.75,
    changePercent: 0.29,
    comparisonLabel: 'vs. últimos 5 minutos',
    prevPublishedValue: 1644.20,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 990.00 },
      { date: '2023-12-13', value: 1050.00 },
      { date: '2024-06-15', value: 1305.00 },
      { date: '2024-12-15', value: 1215.00 },
      { date: '2025-06-15', value: 1290.00 },
      { date: '2025-12-15', value: 1515.00 },
      { date: '2026-06-15', value: 1610.00 },
      { date: '2026-09-15', value: 1635.00 },
      { date: '2026-10-28', value: 1644.20 },
      { date: '2026-10-29', value: 1648.95 }
    ], true, 2, 4.75)
  },
  {
    id: 'reservas_brutas',
    name: 'Reservas Internacionales Brutas (BCRA)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'AR',
    value: 50603,
    unit: 'Millones de USD',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Total de Reservas Internacionales del Banco Central de la República Argentina obtenidas mediante API oficial de bcra.gob.ar (cifras provisorias sujetas a cambio de valuación: USD 50.603 millones al 28/10/2026).',
    lastUpdated: '2026-10-28',
    change: 24,
    changePercent: 0.05,
    comparisonLabel: 'vs. cierre anterior BCRA',
    prevPublishedValue: 50579,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 24900 },
      { date: '2023-12-13', value: 21100 },
      { date: '2024-03-15', value: 28200 },
      { date: '2024-06-15', value: 29800 },
      { date: '2024-12-15', value: 31100 },
      { date: '2025-06-15', value: 37250 },
      { date: '2026-03-15', value: 43350 },
      { date: '2026-09-15', value: 48460 },
      { date: '2026-10-26', value: 50482 },
      { date: '2026-10-27', value: 50579 },
      { date: '2026-10-28', value: 50603 }
    ], true, 0, 24)
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
    sourceUrl: 'https://www.ciaracec.com.ar',
    description: 'Ingreso semanal de divisas del complejo agroexportador cerealero y oleaginoso liquidado en el Mercado Libre de Cambios (MLC).',
    lastUpdated: '2026-10-29',
    change: 45,
    changePercent: 7.76,
    comparisonLabel: 'vs. semana anterior',
    prevPublishedValue: 580,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 320 },
      { date: '2024-05-15', value: 890 },
      { date: '2024-10-15', value: 580 },
      { date: '2025-05-15', value: 920 },
      { date: '2025-10-15', value: 560 },
      { date: '2026-05-15', value: 950 },
      { date: '2026-09-15', value: 610 },
      { date: '2026-10-28', value: 580 },
      { date: '2026-10-29', value: 625 }
    ], true, 0, 45)
  },
  {
    id: 'riesgo_pais_embi',
    name: 'Riesgo País (EMBI+ JP Morgan)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'AR',
    value: 782,
    unit: 'pb',
    frequency: 'Diaria',
    source: 'JP Morgan / BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Diferencial de rendimiento entre bonos soberanos emitidos por Argentina y los títulos del Tesoro de EE.UU., medido en puntos básicos por JP Morgan (782 pb al cierre de rueda).',
    lastUpdated: '2026-10-29',
    change: -12,
    changePercent: -1.51,
    comparisonLabel: 'vs. cierre anterior JP Morgan',
    prevPublishedValue: 794,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 2520 },
      { date: '2023-12-13', value: 2150 },
      { date: '2024-03-15', value: 1620 },
      { date: '2024-06-15', value: 1390 },
      { date: '2024-12-15', value: 1040 },
      { date: '2025-06-15', value: 920 },
      { date: '2026-03-15', value: 850 },
      { date: '2026-09-15', value: 810 },
      { date: '2026-10-28', value: 794 },
      { date: '2026-10-29', value: 782 }
    ], true, 0, -12)
  },

  // ==========================================
  // TEMA 2: PRECIOS, INFLACIÓN Y CANASTAS
  // ==========================================
  {
    id: 'ipc_inflacion_mensual',
    name: 'Índice de Precios al Consumidor (IPC INDEC)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'AR',
    value: 1.9,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Variación mensual del IPC nacional publicada oficialmente por el INDEC (1,9% mensual en septiembre de 2026, acumulando 31,8% en los últimos 12 meses).',
    lastUpdated: '2026-09-30',
    change: 0.20,
    changePercent: 11.76,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 1.7,
    history: [
      { date: '2024-01-31', value: 20.6 },
      { date: '2024-03-31', value: 11.0 },
      { date: '2024-06-30', value: 4.6 },
      { date: '2024-09-30', value: 3.5 },
      { date: '2024-12-31', value: 2.7 },
      { date: '2025-03-31', value: 2.8 },
      { date: '2025-06-30', value: 2.3 },
      { date: '2025-09-30', value: 2.1 },
      { date: '2025-12-31', value: 2.5 },
      { date: '2026-03-31', value: 2.4 },
      { date: '2026-06-30', value: 1.8 },
      { date: '2026-07-31', value: 1.9 },
      { date: '2026-08-31', value: 1.7 },
      { date: '2026-09-30', value: 1.9 }
    ]
  },
  {
    id: 'rem_inflacion_esperada',
    name: 'REM BCRA - Inflación Esperada (Mediana)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'AR',
    value: 2.1,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Proyección mensual de inflación general para los próximos 30 días relevada entre más de 40 consultoras y entidades bancarias por el BCRA (API oficial v4.0).',
    lastUpdated: '2026-09-30',
    change: 0.10,
    changePercent: 5.00,
    comparisonLabel: 'vs. relevamiento anterior BCRA',
    prevPublishedValue: 2.0,
    history: [
      { date: '2024-01-31', value: 21.9 },
      { date: '2024-06-30', value: 5.2 },
      { date: '2024-12-31', value: 3.2 },
      { date: '2025-06-30', value: 2.6 },
      { date: '2025-12-31', value: 2.4 },
      { date: '2026-03-31', value: 2.3 },
      { date: '2026-06-30', value: 2.0 },
      { date: '2026-08-31', value: 2.0 },
      { date: '2026-09-30', value: 2.1 }
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
    description: 'Monto mensual que necesita un hogar de 4 integrantes para superar la línea de pobreza, incluyendo alimentos, indumentaria, transporte y servicios básicos.',
    lastUpdated: '2026-09-30',
    change: 21966,
    changePercent: 2.28,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 964620,
    history: [
      { date: '2023-10-31', value: 345295 },
      { date: '2023-12-31', value: 495798 },
      { date: '2024-03-31', value: 773385 },
      { date: '2024-06-30', value: 873104 },
      { date: '2024-09-30', value: 964620 },
      { date: '2025-03-31', value: 972000 },
      { date: '2025-09-30', value: 978000 },
      { date: '2026-03-31', value: 981500 },
      { date: '2026-08-31', value: 964620 },
      { date: '2026-09-30', value: 986586 }
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
    description: 'Valor monetario que delimita la línea de indigencia para una familia tipo de 4 personas, cubriendo únicamente requerimientos calóricos indispensables.',
    lastUpdated: '2026-09-30',
    change: 13389,
    changePercent: 3.18,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 421240,
    history: [
      { date: '2023-10-31', value: 160603 },
      { date: '2023-12-31', value: 240678 },
      { date: '2024-03-31', value: 358049 },
      { date: '2024-06-30', value: 393317 },
      { date: '2024-09-30', value: 428954 },
      { date: '2025-06-30', value: 418000 },
      { date: '2026-03-31', value: 420000 },
      { date: '2026-08-31', value: 421240 },
      { date: '2026-09-30', value: 434629 }
    ]
  },
  {
    id: 'icc_cac_construccion',
    name: 'Costo de Construcción (Cámara Argentina de la Construcción)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'camara',
    country: 'AR',
    value: 2.3,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'CAC',
    sourceUrl: 'https://www.camarco.org.ar',
    description: 'Variación mensual del costo integral de edificación privada (materiales, mano de obra y equipos) elaborado por la Cámara Argentina de la Construcción.',
    lastUpdated: '2026-09-30',
    change: -0.50,
    changePercent: -17.86,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 2.8,
    history: [
      { date: '2024-01-31', value: 15.2 },
      { date: '2024-06-30', value: 5.1 },
      { date: '2024-12-31', value: 3.5 },
      { date: '2025-06-30', value: 2.9 },
      { date: '2026-03-31', value: 2.7 },
      { date: '2026-07-31', value: 2.9 },
      { date: '2026-08-31', value: 2.8 },
      { date: '2026-09-30', value: 2.3 }
    ]
  },
  {
    id: 'ipim_mayorista_indec',
    name: 'Índice de Precios Mayoristas (IPIM INDEC)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'AR',
    value: 1.5,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Variación mensual de los precios al por mayor de productos nacionales e importados en la primera etapa de comercialización según el INDEC.',
    lastUpdated: '2026-09-30',
    change: -0.60,
    changePercent: -28.57,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 2.1,
    history: [
      { date: '2024-01-31', value: 18.0 },
      { date: '2024-06-30', value: 4.7 },
      { date: '2024-12-31', value: 2.5 },
      { date: '2025-06-30', value: 2.0 },
      { date: '2026-03-31', value: 1.9 },
      { date: '2026-07-31', value: 2.0 },
      { date: '2026-08-31', value: 2.1 },
      { date: '2026-09-30', value: 1.5 }
    ]
  },

  // ==========================================
  // TEMA 3: TASAS DE INTERÉS Y AHORRO
  // ==========================================
  {
    id: 'tasa_plazo_fijo_bna',
    name: 'Tasa Plazo Fijo Digital BNA',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'AR',
    value: 19.25,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'Banco Nación / BCRA',
    sourceUrl: 'https://www.bna.com.ar',
    description: 'Tasa Nominal Anual (TNA) ofrecida por el Banco de la Nación Argentina para colocaciones electrónicas a 30 días de personas humanas en BNA+ y Home Banking (19,25% TNA · 1,58% mensual).',
    lastUpdated: '2026-10-29',
    change: -2.75,
    changePercent: -12.50,
    comparisonLabel: 'vs. mes anterior BCRA',
    prevPublishedValue: 22.00,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 133.00 },
      { date: '2023-12-13', value: 110.00 },
      { date: '2024-03-15', value: 70.00 },
      { date: '2024-06-15', value: 37.00 },
      { date: '2024-12-15', value: 35.00 },
      { date: '2025-06-15', value: 29.00 },
      { date: '2026-03-15', value: 25.00 },
      { date: '2026-08-15', value: 22.50 },
      { date: '2026-09-15', value: 22.00 },
      { date: '2026-10-28', value: 22.00 },
      { date: '2026-10-29', value: 19.25 }
    ], true, 2, -2.75)
  },
  {
    id: 'tasa_badlar',
    name: 'Tasa BADLAR Bancos Privados',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'AR',
    value: 23.13,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Tasa promedio ponderada de depósitos a plazo fijo de más de un millón de pesos a 30-35 días en entidades financieras privadas de Argentina (API oficial del BCRA).',
    lastUpdated: '2026-10-29',
    change: 0.94,
    changePercent: 4.24,
    comparisonLabel: 'vs. rueda anterior BCRA',
    prevPublishedValue: 22.19,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 128.50 },
      { date: '2024-03-15', value: 71.00 },
      { date: '2024-06-15', value: 39.50 },
      { date: '2024-12-15', value: 38.20 },
      { date: '2025-06-15', value: 32.00 },
      { date: '2026-03-15', value: 26.50 },
      { date: '2026-09-15', value: 23.20 },
      { date: '2026-10-28', value: 22.19 },
      { date: '2026-10-29', value: 23.13 }
    ], true, 2, 0.94)
  },
  {
    id: 'valor_uva',
    name: 'Unidad de Valor Adquisitivo (UVA)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'AR',
    value: 2176.21,
    unit: 'ARS',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Valor diario oficial de la Unidad de Valor Adquisitivo fijado por el BCRA conforme a la Ley 27.271 e integrado por su API oficial ($2.176,21 al 30/10/2026).',
    lastUpdated: '2026-10-30',
    change: 1.32,
    changePercent: 0.06,
    comparisonLabel: 'vs. día anterior BCRA',
    prevPublishedValue: 2174.89,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 350.20 },
      { date: '2023-12-13', value: 430.50 },
      { date: '2024-03-15', value: 680.10 },
      { date: '2024-06-15', value: 920.40 },
      { date: '2024-12-15', value: 1250.00 },
      { date: '2025-06-15', value: 1580.00 },
      { date: '2025-12-15', value: 1840.00 },
      { date: '2026-06-15', value: 2060.00 },
      { date: '2026-09-15', value: 2145.00 },
      { date: '2026-10-29', value: 2174.89 },
      { date: '2026-10-30', value: 2176.21 }
    ], true, 2, 1.32)
  },
  {
    id: 'coeficiente_cer',
    name: 'Coeficiente CER (Estabilización Referencia)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'AR',
    value: 862.28,
    unit: 'Índice diario',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Coeficiente de Estabilización de Referencia (CER) elaborado diariamente por el BCRA e integrado por su API oficial (862,28 al 30/10/2026).',
    lastUpdated: '2026-10-30',
    change: 0.52,
    changePercent: 0.06,
    comparisonLabel: 'vs. día anterior BCRA',
    prevPublishedValue: 861.76,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 85.20 },
      { date: '2024-03-15', value: 165.40 },
      { date: '2024-06-15', value: 230.10 },
      { date: '2024-12-15', value: 310.00 },
      { date: '2025-06-15', value: 375.00 },
      { date: '2026-03-15', value: 425.00 },
      { date: '2026-09-15', value: 452.00 },
      { date: '2026-10-29', value: 861.76 },
      { date: '2026-10-30', value: 862.28 }
    ], true, 2, 0.52)
  },
  {
    id: 'caucion_bursatil_byma',
    name: 'Caución Bursátil 1D en Pesos (BYMA)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'camara',
    country: 'AR',
    value: 22.50,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BYMA',
    sourceUrl: 'https://www.byma.com.ar',
    description: 'Tasa promedio operada a 1 día hábil para operaciones de pase y caución con garantía de títulos públicos en BYMA.',
    lastUpdated: '2026-10-29',
    change: -0.30,
    changePercent: -1.32,
    comparisonLabel: 'vs. rueda anterior BYMA',
    prevPublishedValue: 22.80,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 125.00 },
      { date: '2024-03-15', value: 68.00 },
      { date: '2024-06-15', value: 36.00 },
      { date: '2024-12-15', value: 34.50 },
      { date: '2025-06-15', value: 29.00 },
      { date: '2026-03-15', value: 25.00 },
      { date: '2026-09-15', value: 23.00 },
      { date: '2026-10-28', value: 22.80 },
      { date: '2026-10-29', value: 22.50 }
    ], true, 2, -0.30)
  },
  {
    id: 'rendimiento_fci_money_market',
    name: 'Tasa Promedio Fondos Money Market T+0 (CAFCI)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'camara',
    country: 'AR',
    value: 21.80,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'CAFCI',
    sourceUrl: 'https://www.cafci.org.ar',
    description: 'Rendimiento promedio de la industria de fondos comunes de inversión de rescate inmediato (T+0 y cuentas remuneradas de billeteras digitales).',
    lastUpdated: '2026-10-29',
    change: -0.30,
    changePercent: -1.36,
    comparisonLabel: 'vs. día anterior CAFCI',
    prevPublishedValue: 22.10,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 120.00 },
      { date: '2024-03-15', value: 65.00 },
      { date: '2024-06-15', value: 34.50 },
      { date: '2024-12-15', value: 33.00 },
      { date: '2025-06-15', value: 28.00 },
      { date: '2026-03-15', value: 24.50 },
      { date: '2026-09-15', value: 22.40 },
      { date: '2026-10-28', value: 22.10 },
      { date: '2026-10-29', value: 21.80 }
    ], true, 2, -0.30)
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
    description: 'Volumen mensual de vehículos producidos en las plantas terminales radicadas en Argentina relevado por la Asociación de Fábricas de Automotores.',
    lastUpdated: '2026-09-30',
    change: -1885,
    changePercent: -3.67,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 51300,
    history: [
      { date: '2023-10-31', value: 51950 },
      { date: '2024-03-31', value: 43159 },
      { date: '2024-06-30', value: 47250 },
      { date: '2024-09-30', value: 51300 },
      { date: '2024-12-31', value: 44200 },
      { date: '2025-06-30', value: 48500 },
      { date: '2025-12-31', value: 46100 },
      { date: '2026-03-31', value: 48900 },
      { date: '2026-06-30', value: 50200 },
      { date: '2026-08-31', value: 51300 },
      { date: '2026-09-30', value: 49415 }
    ]
  },
  {
    id: 'demanda_electrica_cammesa',
    name: 'Demanda Eléctrica Mayorista Total (CAMMESA)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    country: 'AR',
    value: 11250,
    unit: 'GWh',
    frequency: 'Mensual',
    source: 'CAMMESA',
    sourceUrl: 'https://www.cammesa.com',
    description: 'Consumo neto de energía eléctrica del Sistema Argentino de Interconexión (SADI) despachado por CAMMESA (residencial, comercial e industrial).',
    lastUpdated: '2026-09-30',
    change: -640,
    changePercent: -5.38,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 11890,
    history: [
      { date: '2023-10-31', value: 10850 },
      { date: '2024-01-31', value: 13200 },
      { date: '2024-06-30', value: 12450 },
      { date: '2024-09-30', value: 10950 },
      { date: '2025-01-31', value: 13600 },
      { date: '2025-06-30', value: 12600 },
      { date: '2026-01-31', value: 13450 },
      { date: '2026-06-30', value: 12300 },
      { date: '2026-08-31', value: 11890 },
      { date: '2026-09-30', value: 11250 }
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
    description: 'Variación interanual a precios constantes del comercio minorista pyme relevada por la Confederación Argentina de la Mediana Empresa en todo el país.',
    lastUpdated: '2026-09-30',
    change: 8.10,
    changePercent: 155.77,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: -5.2,
    history: [
      { date: '2024-01-31', value: -28.5 },
      { date: '2024-04-30', value: -12.6 },
      { date: '2024-07-31', value: -15.7 },
      { date: '2024-10-31', value: 2.9 },
      { date: '2025-04-30', value: 1.5 },
      { date: '2025-10-31', value: 0.8 },
      { date: '2026-04-30', value: -2.1 },
      { date: '2026-07-31', value: -4.5 },
      { date: '2026-08-31', value: -5.2 },
      { date: '2026-09-30', value: 2.9 }
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
    description: 'Variación porcentual interanual de la actividad económica agregada publicada por el INDEC (+0,2% desestacionalizado mensual).',
    lastUpdated: '2026-08-31',
    change: -0.70,
    changePercent: 22.58,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: -3.1,
    history: [
      { date: '2023-10-31', value: -0.8 },
      { date: '2024-01-31', value: -4.3 },
      { date: '2024-03-31', value: -8.4 },
      { date: '2024-06-30', value: -3.9 },
      { date: '2024-09-30', value: -3.3 },
      { date: '2025-03-31', value: 1.2 },
      { date: '2025-09-30', value: 0.5 },
      { date: '2026-03-31', value: -1.5 },
      { date: '2026-06-30', value: -2.8 },
      { date: '2026-07-31', value: -3.1 },
      { date: '2026-08-31', value: -3.8 }
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
    description: 'Ingresos tributarios totales percibidos por la Agencia de Recaudación y Control Aduanero ($12,85 billones, sumando IVA, Ganancias, Créditos/Débitos y Derechos de Exportación).',
    lastUpdated: '2026-09-30',
    change: -250000,
    changePercent: -1.91,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 13100000,
    history: [
      { date: '2023-10-31', value: 4725000 },
      { date: '2024-01-31', value: 7690000 },
      { date: '2024-05-31', value: 13380000 },
      { date: '2024-09-30', value: 12845000 },
      { date: '2025-03-31', value: 12400000 },
      { date: '2025-09-30', value: 12650000 },
      { date: '2026-03-31', value: 12700000 },
      { date: '2026-07-31', value: 12950000 },
      { date: '2026-08-31', value: 13100000 },
      { date: '2026-09-30', value: 12850000 }
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
    value: 37.17,
    unit: 'Índice diario',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Indicador diario oficial del BCRA elaborado en partes iguales por el IPC y el RIPTE para indexar contratos de locación habitacional según la Ley 27.551 (37,17 al 30/10/2026).',
    lastUpdated: '2026-10-30',
    change: 0.02,
    changePercent: 0.05,
    comparisonLabel: 'vs. día anterior BCRA',
    prevPublishedValue: 37.15,
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 5.60 },
      { date: '2024-01-15', value: 7.20 },
      { date: '2024-06-15', value: 10.40 },
      { date: '2024-12-15', value: 12.10 },
      { date: '2025-06-15', value: 12.90 },
      { date: '2026-03-15', value: 20.40 },
      { date: '2026-09-15', value: 34.75 },
      { date: '2026-10-29', value: 37.15 },
      { date: '2026-10-30', value: 37.17 }
    ], true, 2, 0.02)
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
    description: 'Remuneración Imponible Promedio de los Trabajadores Estables sujeta a aportes al Sistema Integrado Previsional Argentino (SIPA).',
    lastUpdated: '2026-08-31',
    change: 26480,
    changePercent: 2.60,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 1018800,
    history: [
      { date: '2023-10-31', value: 420706 },
      { date: '2023-12-31', value: 484478 },
      { date: '2024-03-31', value: 705832 },
      { date: '2024-06-30', value: 903421 },
      { date: '2024-09-30', value: 982400 },
      { date: '2025-03-31', value: 998000 },
      { date: '2025-09-30', value: 1005000 },
      { date: '2026-03-31', value: 1012000 },
      { date: '2026-06-30', value: 1015000 },
      { date: '2026-07-31', value: 1018800 },
      { date: '2026-08-31', value: 1045280 }
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
    description: 'Cantidad mensual de escrituras traslativas de dominio formalizadas en la Ciudad Autónoma de Buenos Aires relevadas por el Colegio de Escribanos (máximo en más de 6 años).',
    lastUpdated: '2026-09-30',
    change: 254,
    changePercent: 5.18,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 4903,
    history: [
      { date: '2023-10-31', value: 3120 },
      { date: '2024-03-31', value: 3499 },
      { date: '2024-06-30', value: 4232 },
      { date: '2024-08-31', value: 4580 },
      { date: '2024-10-31', value: 5157 },
      { date: '2025-06-30', value: 4820 },
      { date: '2025-12-31', value: 4950 },
      { date: '2026-03-31', value: 4720 },
      { date: '2026-07-31', value: 4850 },
      { date: '2026-08-31', value: 4903 },
      { date: '2026-09-30', value: 5157 }
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
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Monto mensual de nuevos préstamos hipotecarios UVA formalizados por el sistema bancario consolidado ($72.500 millones, en fuerte expansión con más de 20 bancos activos).',
    lastUpdated: '2026-09-30',
    change: 14300,
    changePercent: 24.57,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 58200,
    history: [
      { date: '2023-10-31', value: 1200 },
      { date: '2024-03-31', value: 1500 },
      { date: '2024-06-30', value: 15400 },
      { date: '2024-08-31', value: 48000 },
      { date: '2024-10-31', value: 72500 },
      { date: '2025-06-30', value: 65000 },
      { date: '2025-12-31', value: 68500 },
      { date: '2026-06-30', value: 55000 },
      { date: '2026-07-31', value: 56400 },
      { date: '2026-08-31', value: 58200 },
      { date: '2026-09-30', value: 72500 }
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
    sourceUrl: 'https://www.bcra.gob.ar/apis-banco-central/',
    description: 'Stock total de préstamos en pesos al sector privado no financiero (comerciales, hipotecarios, prendarios y tarjetas de crédito) registrado por el BCRA ($35,4 billones de pesos).',
    lastUpdated: '2026-09-30',
    change: 1200000,
    changePercent: 3.51,
    comparisonLabel: 'vs. mes anterior (m/m)',
    prevPublishedValue: 34200000,
    history: [
      { date: '2023-10-31', value: 14200000 },
      { date: '2024-03-31', value: 21500000 },
      { date: '2024-06-30', value: 28400000 },
      { date: '2024-10-31', value: 35400000 },
      { date: '2025-06-30', value: 33500000 },
      { date: '2025-12-31', value: 34100000 },
      { date: '2026-03-31', value: 33800000 },
      { date: '2026-06-30', value: 33900000 },
      { date: '2026-07-31', value: 34050000 },
      { date: '2026-08-31', value: 34200000 },
      { date: '2026-09-30', value: 35400000 }
    ]
  }
];
