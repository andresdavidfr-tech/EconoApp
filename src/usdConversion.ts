/**
 * Motor de Conversión y Desinflación a Dólares Estadounidenses (USD)
 * al Tipo de Cambio Oficial del Banco de la Nación Argentina / BCRA.
 */

import { EconomicVariable, HistoricalDataPoint } from './types';

// Tipo de cambio oficial BNA para conversiones contemporáneas
export const DEFAULT_OFFICIAL_USD_RATE = 1539.00; // Dólar Mayorista / Divisa BNA

// Hitos históricos del Dólar Oficial Mayorista para desinflar series históricas
const HISTORICAL_OFFICIAL_DOLLAR: Array<{ date: string; rate: number }> = [
  { date: '2023-10-13', rate: 350.00 },
  { date: '2023-11-15', rate: 353.50 },
  { date: '2023-12-13', rate: 800.00 },
  { date: '2024-03-15', rate: 850.00 },
  { date: '2024-06-15', rate: 905.00 },
  { date: '2024-09-15', rate: 960.00 },
  { date: '2024-12-15', rate: 1018.00 },
  { date: '2025-03-15', rate: 1080.00 },
  { date: '2025-06-15', rate: 1180.00 },
  { date: '2025-09-15', rate: 1290.00 },
  { date: '2025-12-15', rate: 1395.00 },
  { date: '2026-03-15', rate: 1470.00 },
  { date: '2026-06-15', rate: 1510.00 },
  { date: '2026-09-15', rate: 1530.00 },
  { date: '2026-10-28', rate: 1537.00 },
  { date: '2026-10-29', rate: 1539.00 }
];

/**
 * Obtiene el tipo de cambio oficial para una fecha dada (interpola si es necesario)
 */
export function getOfficialDollarRateForDate(dateStr: string, currentRate: number = DEFAULT_OFFICIAL_USD_RATE): number {
  if (!dateStr) return currentRate;
  
  if (dateStr >= HISTORICAL_OFFICIAL_DOLLAR[HISTORICAL_OFFICIAL_DOLLAR.length - 1].date) {
    return currentRate;
  }
  if (dateStr <= HISTORICAL_OFFICIAL_DOLLAR[0].date) {
    return HISTORICAL_OFFICIAL_DOLLAR[0].rate;
  }

  for (let i = 0; i < HISTORICAL_OFFICIAL_DOLLAR.length - 1; i++) {
    const p1 = HISTORICAL_OFFICIAL_DOLLAR[i];
    const p2 = HISTORICAL_OFFICIAL_DOLLAR[i + 1];
    if (p1.date <= dateStr && p2.date >= dateStr) {
      const t1 = new Date(p1.date).getTime();
      const t2 = new Date(p2.date).getTime();
      const tc = new Date(dateStr).getTime();
      const fraction = t2 > t1 ? (tc - t1) / (t2 - t1) : 1;
      return Number((p1.rate + fraction * (p2.rate - p1.rate)).toFixed(2));
    }
  }

  return currentRate;
}

/**
 * Determina si una variable es convertible/desinflable a USD oficiales
 * (ej: salarios, canastas, recaudación, UVA, depósitos, créditos)
 */
export function isVariableEligibleForUsdConversion(v: EconomicVariable): boolean {
  if (!v) return false;
  const unitLower = v.unit.toLowerCase();
  
  // No convertir si ya está en USD, o si es porcentaje / tasa o puntos básicos
  if (unitLower.includes('usd') || unitLower.includes('dólar') || unitLower.includes('dolar') || unitLower.includes('pb') || unitLower.includes('%')) {
    return false;
  }
  
  // Convertir variables denominadas en pesos (ARS, $, Millones de ARS, Índice diario como UVA)
  if (unitLower === 'ars' || unitLower === '$' || unitLower.includes('pesos') || unitLower.includes('ars') || v.id === 'valor_uva' || v.id === 'coeficiente_cer') {
    return true;
  }

  return false;
}

export interface ConvertedVariableResult {
  displayValue: string;
  nominalValue: number;
  convertedValue: number;
  displayUnit: string;
  isConverted: boolean;
  rateUsed: number;
  changeDisplay?: string;
}

/**
 * Convierte un valor de variable al equivalente en USD oficial desinflado
 */
export function convertVariableToUsd(
  v: EconomicVariable,
  activeDollarRate: number = DEFAULT_OFFICIAL_USD_RATE
): ConvertedVariableResult {
  if (!isVariableEligibleForUsdConversion(v)) {
    return {
      displayValue: v.value.toLocaleString('es-AR'),
      nominalValue: v.value,
      convertedValue: v.value,
      displayUnit: v.unit,
      isConverted: false,
      rateUsed: activeDollarRate
    };
  }

  let convertedValue = v.value / activeDollarRate;
  let displayUnit = 'USD Oficial';

  // Si la variable original estaba en Millones de ARS (ej: Recaudación, Créditos)
  if (v.unit.toLowerCase().includes('millones')) {
    displayUnit = 'Millones de USD';
  }

  let formattedVal: string;
  if (convertedValue >= 1000) {
    formattedVal = convertedValue.toLocaleString('es-AR', { maximumFractionDigits: 1 });
  } else if (convertedValue >= 10) {
    formattedVal = convertedValue.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  } else {
    formattedVal = convertedValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  }

  return {
    displayValue: `US$ ${formattedVal}`,
    nominalValue: v.value,
    convertedValue: Number(convertedValue.toFixed(3)),
    displayUnit,
    isConverted: true,
    rateUsed: activeDollarRate
  };
}

/**
 * Desinfla una serie histórica completa dividiendo cada punto ARS por el TC Oficial de esa fecha
 */
export function deflateHistoricalSeriesToUsd(
  history: HistoricalDataPoint[],
  currentDollarRate: number = DEFAULT_OFFICIAL_USD_RATE,
  isMillionUnit: boolean = false
): Array<HistoricalDataPoint & { rawNominalArs: number; usdRate: number }> {
  if (!history || history.length === 0) return [];

  return history.map(point => {
    const rateOnDate = getOfficialDollarRateForDate(point.date, currentDollarRate);
    const usdVal = Number((point.value / rateOnDate).toFixed(point.value < 100 ? 3 : 2));
    return {
      date: point.date,
      value: usdVal,
      rawNominalArs: point.value,
      usdRate: rateOnDate
    };
  });
}
