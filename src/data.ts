import { EconomicVariable } from './types';

// Helper to generate a sequence of monthly values for historical graphs
const generateMonthlyHistory = (baseValue: number, fluctuation: number, count: number = 6): { date: string; value: number }[] => {
  const points = [];
  const startYear = 2025;
  const startMonth = 11; // Nov 2025

  for (let i = 0; i < count; i++) {
    let currentMonth = startMonth + i;
    let currentYear = startYear;
    if (currentMonth > 12) {
      currentMonth -= 12;
      currentYear += 1;
    }
    const noise = (Math.sin(i * 1.5) + Math.cos(i * 0.8)) * fluctuation;
    const value = parseFloat((baseValue + noise).toFixed(2));
    points.push({
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
      value
    });
  }
  return points;
};

// Daily fluctuations for short-term daily rates (for better visuals)
const generateDailyHistory = (baseValue: number, fluctuation: number, count: number = 10): { date: string; value: number }[] => {
  const points = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const noise = (Math.sin(i * 0.5) + Math.cos(i * 1.2)) * fluctuation;
    const value = parseFloat((baseValue + noise).toFixed(2));
    points.push({
      date: dateStr,
      value
    });
  }
  return points;
};

export const ARGENTINA_ECONOMIC_VARIABLES: EconomicVariable[] = [
  // 1. FINANCIAL RATES
  {
    id: 'tasa_politica_monetaria',
    name: 'Tasa de Política Monetaria',
    category: 'FINANCIAL_RATES',
    value: 36.00,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Tasa de interés de referencia fijada por el Banco Central (operada actualmente mediante pases u otros instrumentos de regulación monetaria) para marcar el incentivo al ahorro y la contención de pasivos.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(36.00, 1.0, 12)
  },
  {
    id: 'tasa_badlar',
    name: 'Tasa BADLAR Bancos Privados',
    category: 'FINANCIAL_RATES',
    value: 38.25,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Tasa de interés de referencia para depósitos de plazo fijo mayores a un millón de pesos a 30-35 días en entidades financieras privadas de Argentina. Es un indicador clave del mercado mayorista.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(38.25, 0.4, 12)
  },
  {
    id: 'tasa_tm20',
    name: 'Tasa TM20 Bancos Privados',
    category: 'FINANCIAL_RATES',
    value: 37.80,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Tasa de interés de depósitos a plazo fijo de monto superior a los 20 millones de pesos, pactada a un plazo de 30 a 35 días en entidades privadas. Refleja las tasas corporativas institucionales.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(37.80, 0.35, 12)
  },
  {
    id: 'tasa_plazo_fijo_minorista',
    name: 'Tasa Plazo Fijo Minorista',
    category: 'FINANCIAL_RATES',
    value: 33.15,
    unit: '% nominal anual',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Tasa de interés promedio ponderado de mercado pagada por bancos a colocaciones de personas humanas de hasta 1 millón de pesos en plazos fijos tradicionales a 30 días.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(33.15, 0.6, 12)
  },
  {
    id: 'valor_uva',
    name: 'Valor de Unidad de Valor Adquisitivo (UVA)',
    category: 'FINANCIAL_RATES',
    value: 1145.22,
    unit: 'ARS',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Unidad de medida equivalente al costo promedio de construcción e inflación promedio diaria (CER). Se utiliza fundamentalmente para indexar créditos hipotecarios y plazos fijos indexados.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(1145.22, 12.0, 12)
  },
  {
    id: 'coeficiente_cer',
    name: 'Coeficiente CER (Estabilización Referencia)',
    category: 'FINANCIAL_RATES',
    value: 13.88,
    unit: 'Índice diario',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Indicador diario regulado por el BCRA que refleja la evolución de la inflación basándose en el IPC de INDEC. Ampliamente utilizado para ajustar deudas y pasivos financieros.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(13.88, 0.15, 12)
  },
  {
    id: 'indice_icl',
    name: 'Índice de Contratos de Locación (ICL)',
    category: 'FINANCIAL_RATES',
    value: 16.45,
    unit: 'Índice diario',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Indicador de indexación diaria compuesto en un 50% por la variación mensual de la inflación (IPC) y un 50% por la remuneración promedio (RIPTE). Se aplica en remanentes contractuales de locación.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(16.45, 0.12, 12)
  },

  // 2. MONETARY & EXCHANGE
  {
    id: 'tipo_cambio_mayorista',
    name: 'Tipo de Cambio Mayorista (Cam. A 3500)',
    category: 'MONETARY_EXCHANGE',
    value: 994.50,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Tipo de cambio de referencia establecido por el Banco Central de la República Argentina según la Comunicación "A" 3500, que regula las operaciones mayoristas y liquidaciones de exportaciones.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(994.50, 4.2, 12)
  },
  {
    id: 'bna_dolar_billete',
    name: 'Dólar Minorista Billete (BNA)',
    category: 'MONETARY_EXCHANGE',
    value: 1024.50,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BNA',
    sourceUrl: 'https://www.bna.gob.ar',
    description: 'Precio de cotización del dólar estadounidense minorista en ventanilla en su modalidad billete publicado diariamente por el Banco de la Nación Argentina (BNA). Referencia obligatoria para operaciones minoristas directas y base tributaria para turismo de personas humanas.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(1024.50, 4.0, 12)
  },
  {
    id: 'bna_dolar_divisa',
    name: 'Dólar Minorista Divisa (BNA)',
    category: 'MONETARY_EXCHANGE',
    value: 1021.50,
    unit: 'ARS/USD',
    frequency: 'Diaria',
    source: 'BNA',
    sourceUrl: 'https://www.bna.gob.ar',
    description: 'Precio de cotización del dólar estadounidense minorista en su modalidad divisa o transferencia electrónica publicado por el Banco de la Nación Argentina (BNA). Utilizado de referencia en liquidaciones y operaciones cambiarias interbancarias.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(1021.50, 3.8, 15)
  },
  {
    id: 'reservas_brutas',
    name: 'Reservas Internacionales Brutas',
    category: 'MONETARY_EXCHANGE',
    value: 29850,
    unit: 'Millones de USD',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Total de oro, divisas extranjeras, DEG y colocaciones líquidas en poder de las arcas financieras soberanas del Banco Central para afrontar compromisos internacionales y sostener la balanza cambiaria.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(29850, 150, 12)
  },
  {
    id: 'base_monetaria',
    name: 'Base Monetaria',
    category: 'MONETARY_EXCHANGE',
    value: 22840220,
    unit: 'Millones de ARS',
    frequency: 'Diaria',
    source: 'BCRA',
    sourceUrl: 'https://www.bcra.gob.ar',
    description: 'Suma agregada total de billetes y monedas en circulación pública más la reserva o encaje legal depositada por las entidades financieras en cuentas corrientes del Banco Central.',
    lastUpdated: '2026-05-22',
    history: generateDailyHistory(22840220, 200000, 12)
  },

  // 3. MACROECONOMIS, INFLATION & FISCAL
  {
    id: 'ipc_inflacion_mensual',
    name: 'Índice de Precios al Consumidor (IPC)',
    category: 'MACRO_INFLATION_FISCAL',
    value: 3.1,
    unit: '% mensual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Porcentaje de aumento promedio ponderado mensual de los precios de una canasta de bienes y servicios representativa del consumo de los hogares en la República Argentina.',
    lastUpdated: '2026-05-15',
    history: generateMonthlyHistory(3.1, 0.4, 6)
  },
  {
    id: 'emae_actividad_economica',
    name: 'Actividad Económica (EMAE)',
    category: 'MACRO_INFLATION_FISCAL',
    value: -0.80,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Estimador Mensual de Actividad Económica. Proxy mensual del PBI que mide el volumen físico o constante de producción de todos los sectores productivos nacionales.',
    lastUpdated: '2026-05-20',
    history: generateMonthlyHistory(-0.80, 0.6, 6)
  },
  {
    id: 'resultado_fiscal_financiero',
    name: 'Resultado Financiero Mensual',
    category: 'MACRO_INFLATION_FISCAL',
    value: 185000,
    unit: 'Millones de ARS',
    frequency: 'Mensual',
    source: 'MECON',
    sourceUrl: 'https://www.argentina.gob.ar/economia',
    description: 'Resultado del balance presupuestario público (Superávit o Déficit) después del pago de intereses de deuda pública del Sector Público Nacional.',
    lastUpdated: '2026-05-21',
    history: generateMonthlyHistory(185000, 30000, 6)
  },
  {
    id: 'recaudacion_tributaria',
    name: 'Recaudación Tributaria Total',
    category: 'MACRO_INFLATION_FISCAL',
    value: 13850000,
    unit: 'Millones de ARS',
    frequency: 'Mensual',
    source: 'ARCA',
    sourceUrl: 'https://www.argentina.gob.ar/arca',
    description: 'Monto total mensual ingresado en las cuentas nacionales a raíz de la liquidación de impuestos, aportes previsionales, aranceles de importación/exportación gestionados por ARCA.',
    lastUpdated: '2026-05-03',
    history: generateMonthlyHistory(13850000, 500000, 6)
  },

  // 4. SECTORS, SALARIES & SOCIAL
  {
    id: 'salario_ripte',
    name: 'Remuneración Promedio (RIPTE)',
    category: 'SECTORS_SALARIES_SOCIAL',
    value: 945200,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'Sec. de Trabajo',
    sourceUrl: 'https://www.argentina.gob.ar/trabajo',
    description: 'Remuneración Imponible Promedio de los Trabajadores Estables de la seguridad social del sector formal privado y estatal con más de un año de aportes continuos.',
    lastUpdated: '2026-05-18',
    history: generateMonthlyHistory(945200, 25000, 6)
  },
  {
    id: 'canasta_basica_total',
    name: 'Canasta Básica Total (Familia Tipo)',
    category: 'SECTORS_SALARIES_SOCIAL',
    value: 825310,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Establece la línea de pobreza. Valor monetario de la canasta alimentaria más la cobertura de vestimenta, transporte, educación y salud indispensables de un hogar tipo de cuatro integrantes.',
    lastUpdated: '2026-05-16',
    history: generateMonthlyHistory(825310, 15000, 6)
  },
  {
    id: 'canasta_basica_alimentaria',
    name: 'Canasta Básica Alimentaria (Indigencia)',
    category: 'SECTORS_SALARIES_SOCIAL',
    value: 368400,
    unit: 'ARS',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Establece la línea de indigencia. Costo en dinero requerido exclusivamente para cubrir el requerimiento de kilocalorías de alimentación mensual mínima elemental.',
    lastUpdated: '2026-05-16',
    history: generateMonthlyHistory(368400, 6000, 6)
  },
  {
    id: 'produccion_industrial_ipi',
    name: 'Índice de Producción Industrial (IPI)',
    category: 'SECTORS_SALARIES_SOCIAL',
    value: -1.2,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'INDEC',
    sourceUrl: 'https://www.indec.gob.ar',
    description: 'Mide la evolución mensual de la producción manufacturera argentina, desagregando sectores químicos, siderúrgicos, automotrices y alimenticios.',
    lastUpdated: '2026-05-10',
    history: generateMonthlyHistory(-1.2, 0.8, 6)
  }
];
