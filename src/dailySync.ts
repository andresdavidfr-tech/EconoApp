import { EconomicVariable } from './types';

/**
 * Fecha de hoy (YYYY-MM-DD) en horario de Argentina.
 */
export function todayAR(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
}

/**
 * Devuelve las variables sin alterarlas.
 *
 * Antes esta función copiaba el último valor conocido para cada día faltante y marcaba la
 * variable como "actualizada hoy", lo que fabricaba historia y frescura que ninguna fuente
 * había publicado. Ahora cada variable conserva su fecha real de publicación; solo las
 * cotizaciones obtenidas en vivo (ver server.ts) actualizan fecha e historial.
 */
export function syncVariablesToCurrentDate(variables: EconomicVariable[], targetDate?: string): {
  updatedVariables: EconomicVariable[];
  updatedCount: number;
  syncDate: string;
} {
  return {
    updatedVariables: variables,
    updatedCount: 0,
    syncDate: targetDate || todayAR()
  };
}
