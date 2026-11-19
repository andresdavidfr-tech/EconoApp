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
 * Determina si la unidad corresponde a una tasa o porcentaje
 */
export function isRateOrPercentageUnit(unit?: string): boolean {
  if (!unit) return false;
  const u = unit.toLowerCase();
  return u.includes('%') || u.includes('porcentual') || u.includes('tasa');
}

/**
 * Determina si la unidad corresponde a puntos básicos (pb)
 */
export function isBasisPointsUnit(unit?: string): boolean {
  if (!unit) return false;
  const u = unit.toLowerCase();
  return u.includes('pb') || u.includes('puntos básicos') || u.includes('puntos basicos');
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

      // El Riesgo País (EMBI+ J.P. Morgan) actualiza una sola vez al día con el cierre consolidado de la jornada:
      // nunca interpolar días faltantes ni sobreescribir su fecha real de cierre, para conservar la variación exacta vs. cierre previo.
      const isConsolidatedDailyClose = variable.id === 'riesgo_pais_embi';

      if (isConsolidatedDailyClose) {
        if (historyCopy.length === 0) {
          historyCopy.push({ date: lastUpdated, value: currentValue });
        }
        const trimmedHistory = historyCopy.slice(-1200);
        const prevValue = trimmedHistory.length >= 2
          ? trimmedHistory[trimmedHistory.length - 2].value
          : (variable.prevPublishedValue ?? currentValue);
        const change = Number((currentValue - prevValue).toFixed(2));
        return {
          ...variable,
          value: currentValue,
          change,
          changePercent: change,
          changeUnit: 'pb' as const,
          comparisonLabel: 'vs. cierre anterior JP Morgan',
          prevPublishedValue: prevValue,
          lastUpdated,
          history: trimmedHistory
        };
      }

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

      const isRate = isRateOrPercentageUnit(variable.unit);
      const isPb = isBasisPointsUnit(variable.unit);
      const changeUnit: 'p.p.' | 'pb' | '%' = isRate ? 'p.p.' : isPb ? 'pb' : '%';

      if (trimmedHistory.length >= 2) {
        const penult = trimmedHistory[trimmedHistory.length - 2].value;
        if (penult !== currentValue || variable.prevPublishedValue === undefined) {
          prevValue = penult;
          change = Number((currentValue - prevValue).toFixed(2));
        } else {
          prevValue = variable.prevPublishedValue;
          change = variable.change !== undefined ? variable.change : 0;
        }

        if (isRate) {
          // Para tasas o inflación, el cambio se expresa en puntos porcentuales (p.p.)
          changePercent = change;
        } else if (isPb) {
          // Para riesgo país, el cambio se expresa en puntos básicos (pb)
          changePercent = change;
        } else {
          changePercent = prevValue !== 0 ? Number(((change / prevValue) * 100).toFixed(2)) : 0;
        }
      }

      const compLabel = variable.source.toUpperCase().includes('BCRA')
        ? 'vs. rueda anterior BCRA'
        : 'vs. rueda anterior (24h)';

      return {
        ...variable,
        value: currentValue,
        change: change !== undefined ? change : 0,
        changePercent: changePercent !== undefined ? changePercent : 0,
        changeUnit,
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

      const isRate = isRateOrPercentageUnit(variable.unit);
      const isPb = isBasisPointsUnit(variable.unit);
      const changeUnit: 'p.p.' | 'pb' | '%' = isRate ? 'p.p.' : isPb ? 'pb' : '%';

      if (historyCopy.length >= 2) {
        prevValue = historyCopy[historyCopy.length - 2].value;
        change = Number((currentValue - prevValue).toFixed(2));
        if (isRate) {
          // Para inflación (IPC/IPIM/Construcción) y tasas, la variación m/m es la diferencia en p.p.
          changePercent = change;
        } else if (isPb) {
          changePercent = change;
        } else {
          changePercent = prevValue !== 0 ? Number(((change / prevValue) * 100).toFixed(2)) : 0;
        }
      }

      const compLabel = variable.frequency === 'Mensual'
        ? 'vs. mes anterior (m/m)'
        : variable.frequency === 'Semestral'
        ? 'vs. semestre anterior (s/s)'
        : 'vs. trimestre anterior (t/t)';

      if (variable.lastUpdated !== todayStr) {
        updatedCount++;
      }
      return {
        ...variable,
        value: currentValue,
        change: change !== undefined ? change : 0,
        changePercent: changePercent !== undefined ? changePercent : 0,
        changeUnit,
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
