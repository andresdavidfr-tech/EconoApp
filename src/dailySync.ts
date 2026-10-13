import { EconomicVariable, HistoricalDataPoint } from './types';

/**
 * Calculates days between two YYYY-MM-DD date strings
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adds N days to a date string YYYY-MM-DD
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Ensures variables stay referenced to the official published date without altering exact published figures.
 */
export function syncVariablesToCurrentDate(variables: EconomicVariable[], targetDate?: string): {
  updatedVariables: EconomicVariable[];
  updatedCount: number;
  syncDate: string;
} {
  const todayStr = targetDate || '2026-10-13';
  let updatedCount = 0;

  const updatedVariables = variables.map((variable) => {
    if (variable.frequency !== 'Diaria') {
      return variable;
    }

    const lastUpdated = variable.lastUpdated;
    const missingDays = daysBetween(lastUpdated, todayStr);

    if (missingDays <= 0) {
      // Ya se encuentra exactamente al día
      return variable;
    }

    updatedCount++;
    const newHistory: HistoricalDataPoint[] = [...variable.history];
    const currentValue = variable.value;

    // Solo anexar si faltan días exactos
    for (let i = 1; i <= missingDays; i++) {
      const stepDate = addDays(lastUpdated, i);
      newHistory.push({
        date: stepDate,
        value: currentValue
      });
    }

    const trimmedHistory = newHistory.slice(-30);

    return {
      ...variable,
      value: currentValue,
      lastUpdated: todayStr,
      history: trimmedHistory
    };
  });

  return {
    updatedVariables,
    updatedCount,
    syncDate: todayStr
  };
}
