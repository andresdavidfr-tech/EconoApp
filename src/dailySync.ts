import { EconomicVariable, HistoricalDataPoint } from './types';

/**
 * Gets the current date string (YYYY-MM-DD) in Argentina time (America/Argentina/Buenos_Aires)
 */
export function getArgentinaTodayDate(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Formats YYYY-MM-DD into DD-MM-YYYY
 */
export function formatToDayMonthYear(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

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
 * Ensures variables stay referenced to the official current date and maintain up-to-date timelines.
 */
export function syncVariablesToCurrentDate(variables: EconomicVariable[], targetDate?: string): {
  updatedVariables: EconomicVariable[];
  updatedCount: number;
  syncDate: string;
} {
  const todayStr = targetDate || getArgentinaTodayDate();
  let updatedCount = 0;

  const updatedVariables = variables.map((variable) => {
    const lastUpdated = variable.lastUpdated || todayStr;
    const missingDays = daysBetween(lastUpdated, todayStr);

    if (variable.frequency === 'Diaria') {
      if (missingDays <= 0) {
        return {
          ...variable,
          lastUpdated: todayStr
        };
      }

      updatedCount++;
      const newHistory: HistoricalDataPoint[] = [...variable.history];
      const currentValue = variable.value;

      // Anexar días hasta hoy
      for (let i = 1; i <= missingDays; i++) {
        const stepDate = addDays(lastUpdated, i);
        newHistory.push({
          date: stepDate,
          value: currentValue
        });
      }

      const trimmedHistory = newHistory.slice(-1200);

      return {
        ...variable,
        value: currentValue,
        lastUpdated: todayStr,
        history: trimmedHistory
      };
    } else {
      // Periodic variables (Mensual / Trimestral): sincronizar la fecha de vigencia a hoy
      if (variable.lastUpdated !== todayStr) {
        updatedCount++;
      }
      return {
        ...variable,
        lastUpdated: todayStr
      };
    }
  });

  return {
    updatedVariables,
    updatedCount,
    syncDate: todayStr
  };
}
