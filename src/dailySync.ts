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
    const currentValue = variable.value;

    if (variable.frequency === 'Diaria') {
      const historyCopy: HistoricalDataPoint[] = Array.isArray(variable.history)
        ? [...variable.history]
        : [];

      if (historyCopy.length > 0) {
        const lastIdx = historyCopy.length - 1;
        const lastPoint = historyCopy[lastIdx];

        if (missingDays <= 0 || lastPoint.date === todayStr) {
          // Si ya está en la fecha de hoy, sincronizar el valor numérico exacto
          historyCopy[lastIdx] = { date: todayStr, value: currentValue };
        } else {
          updatedCount++;
          // Anexar días faltantes hasta hoy garantizando continuidad
          const startVal = lastPoint.value;
          for (let i = 1; i <= missingDays; i++) {
            const stepDate = addDays(lastUpdated, i);
            const fraction = i / missingDays;
            const stepVal = Number((startVal + fraction * (currentValue - startVal)).toFixed(2));
            historyCopy.push({
              date: stepDate,
              value: i === missingDays ? currentValue : stepVal
            });
          }
        }
      } else {
        historyCopy.push({ date: todayStr, value: currentValue });
      }

      const trimmedHistory = historyCopy.slice(-1200);

      // Calcular cambio diario estrictamente contra la rueda / publicación anterior
      let change = variable.change;
      let changePercent = variable.changePercent;
      let prevValue: number | undefined = variable.prevPublishedValue;

      if (trimmedHistory.length >= 2) {
        // El dato anterior es el penúltimo punto de la serie
        prevValue = trimmedHistory[trimmedHistory.length - 2].value;
        change = Number((currentValue - prevValue).toFixed(2));
        changePercent = prevValue !== 0 ? Number(((change / prevValue) * 100).toFixed(2)) : 0;
      }

      const compLabel = variable.source.toUpperCase().includes('BCRA')
        ? 'vs. rueda anterior BCRA'
        : 'vs. rueda anterior (24h)';

      return {
        ...variable,
        value: currentValue,
        change: change !== undefined ? change : 0,
        changePercent: changePercent !== undefined ? changePercent : 0,
        comparisonLabel: compLabel,
        prevPublishedValue: prevValue,
        lastUpdated: todayStr,
        history: trimmedHistory
      };
    } else {
      // Periodic variables (Mensual / Trimestral)
      const historyCopy = Array.isArray(variable.history) ? [...variable.history] : [];
      if (historyCopy.length > 0) {
        historyCopy[historyCopy.length - 1] = {
          ...historyCopy[historyCopy.length - 1],
          value: currentValue
        };
      }

      // Calcular variación mensual mes a mes (t vs t-1) o trimestral
      let change = variable.change;
      let changePercent = variable.changePercent;
      let prevValue: number | undefined = variable.prevPublishedValue;

      if (historyCopy.length >= 2) {
        prevValue = historyCopy[historyCopy.length - 2].value;
        change = Number((currentValue - prevValue).toFixed(2));
        changePercent = prevValue !== 0 ? Number(((change / prevValue) * 100).toFixed(2)) : 0;
      }

      const compLabel = variable.frequency === 'Mensual'
        ? 'vs. mes anterior (m/m)'
        : 'vs. período anterior (t/t)';

      if (variable.lastUpdated !== todayStr) {
        updatedCount++;
      }
      return {
        ...variable,
        value: currentValue,
        change: change !== undefined ? change : 0,
        changePercent: changePercent !== undefined ? changePercent : 0,
        comparisonLabel: compLabel,
        prevPublishedValue: prevValue,
        lastUpdated: todayStr,
        history: historyCopy
      };
    }
  });

  return {
    updatedVariables,
    updatedCount,
    syncDate: todayStr
  };
}
