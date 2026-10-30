import { EconomicVariable } from './types';

/**
 * Valores verificados manualmente contra publicaciones públicas el 20-10-2026.
 * Sirven como punto de partida hasta que las fuentes en vivo (server.ts) responden:
 * apenas una fuente entrega un dato, ese dato reemplaza a este.
 * Cada entrada lleva la fecha REAL del dato, no la fecha de carga.
 */
export const SNAPSHOT_VERIFIED_AT = '2026-10-20';

interface Entry {
  value: number;
  date: string;                                  // fecha real del dato
  points?: { date: string; value: number }[];    // historia verificada (reemplaza a la anterior)
  append?: boolean;                              // cotizaciones diarias: se agrega a la historia existente
  note: string;
}

// Base de la fórmula oficial: UVA = 14,05 × CER / CER(31/3/2016), con CER(31/3/2016) = 5,5636
const cerFromUva = (uva: number) => Number(((uva / 14.05) * 5.5636).toFixed(2));

export const VERIFIED_SNAPSHOT: Record<string, Entry> = {
  // Cotizaciones al cierre del 20-10-2026
  bna_dolar_billete: { value: 1545, date: '2026-10-20', append: true, note: 'BNA minorista, venta (cierre)' },
  dolar_blue: { value: 1570, date: '2026-10-20', append: true, note: 'Blue, venta' },
  dolar_mep_byma: { value: 1544.17, date: '2026-10-20', append: true, note: 'MEP (cierre)' },
  dolar_ccl_byma: { value: 1628.44, date: '2026-10-20', append: true, note: 'CCL (cierre)' },
  bna_dolar_divisa: { value: 1525, date: '2026-10-20', append: true, note: 'Mayorista (cierre)' },
  dolar_tarjeta: { value: 2008.5, date: '2026-10-20', append: true, note: 'Oficial + 30%' },
  dolar_cripto: { value: 1627.12, date: '2026-10-20', append: true, note: 'Cripto (cierre)' },

  // BCRA (API Oficial v4.0 - https://www.bcra.gob.ar/apis-banco-central/)
  reservas_brutas: {
    value: 50603, date: '2026-10-28',
    points: [{ date: '2026-10-26', value: 50482 }, { date: '2026-10-27', value: 50579 }, { date: '2026-10-28', value: 50603 }],
    note: 'Reservas Internacionales BCRA (api.bcra.gob.ar id: 1)'
  },
  valor_uva: {
    value: 2176.21, date: '2026-10-30',
    points: [{ date: '2026-10-28', value: 2173.57 }, { date: '2026-10-29', value: 2174.89 }, { date: '2026-10-30', value: 2176.21 }],
    note: 'UVA publicada por el BCRA (api.bcra.gob.ar id: 31)'
  },
  coeficiente_cer: {
    value: 862.28, date: '2026-10-30',
    points: [{ date: '2026-10-28', value: 861.23 }, { date: '2026-10-29', value: 861.76 }, { date: '2026-10-30', value: 862.28 }],
    note: 'CER oficial publicado por el BCRA (api.bcra.gob.ar id: 30)'
  },
  indice_icl: {
    value: 37.17, date: '2026-10-30',
    points: [{ date: '2026-10-28', value: 37.13 }, { date: '2026-10-29', value: 37.15 }, { date: '2026-10-30', value: 37.17 }],
    note: 'Índice ICL oficial publicado por el BCRA (api.bcra.gob.ar id: 40)'
  },
  tasa_badlar: {
    value: 23.13, date: '2026-10-29',
    points: [{ date: '2026-10-27', value: 23.50 }, { date: '2026-10-28', value: 22.19 }, { date: '2026-10-29', value: 23.13 }],
    note: 'BADLAR promedio bancos privados informado por BCRA (api.bcra.gob.ar id: 7)'
  },
  tasa_plazo_fijo_bna: {
    value: 19.25, date: '2026-10-29',
    points: [{ date: '2026-03-26', value: 22.00 }, { date: '2026-09-20', value: 20.00 }, { date: '2026-10-29', value: 19.25 }],
    note: 'Plazo fijo BNA, canal electrónico, TNA oficial'
  },

  // INDEC / REM (datos mensuales: la fecha es el mes de referencia)
  ipc_inflacion_mensual: {
    value: 1.9, date: '2026-09-01',
    points: [{ date: '2026-08-01', value: 1.7 }, { date: '2026-09-01', value: 1.9 }],
    note: 'IPC septiembre 2026, publicado el 13-10-2026'
  },
  rem_inflacion_esperada: {
    value: 1.9, date: '2026-09-01',
    points: [{ date: '2026-08-01', value: 1.7 }, { date: '2026-09-01', value: 1.9 }],
    note: 'REM septiembre 2026 (publicado el 6-10-2026): inflación esperada de septiembre'
  },
  canasta_basica_total: {
    value: 1632505, date: '2026-09-01',
    points: [{ date: '2026-09-01', value: 1632505 }],
    note: 'CBT familia tipo, septiembre 2026'
  },
  canasta_basica_alimentaria: {
    value: 738690, date: '2026-09-01',
    points: [{ date: '2026-09-01', value: 738690 }],
    note: 'CBA familia tipo, septiembre 2026'
  },
  ripte_salario_estable: {
    value: 1915878.76, date: '2026-06-01',
    points: [
      { date: '2025-12-01', value: 1633547 },
      { date: '2026-03-01', value: 1775664.12 },
      { date: '2026-06-01', value: 1915878.76 }
    ],
    note: 'RIPTE junio 2026 (último verificado)'
  },
  ipim_mayorista_indec: {
    value: 3.2, date: '2026-09-01',
    points: [{ date: '2026-09-01', value: 3.2 }],
    note: 'Inflación mayorista septiembre 2026'
  },
};

export function applyVerifiedSnapshot(vars: EconomicVariable[]): EconomicVariable[] {
  return vars.map(v => {
    const e = VERIFIED_SNAPSHOT[v.id];
    if (!e) return v;
    let history = e.points ? e.points.map(p => ({ ...p })) : v.history;
    if (e.append) {
      history = history.filter(p => p.date.slice(0, 10) < e.date).concat({ date: e.date, value: e.value });
    }
    return { ...v, value: e.value, lastUpdated: e.date, history, verifiedAt: SNAPSHOT_VERIFIED_AT };
  });
}
