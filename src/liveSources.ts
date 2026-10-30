/**
 * Conectores de fuentes oficiales (solo servidor).
 * Cada función devuelve valores ya validados; si una fuente cambia su formato o devuelve
 * algo fuera de rango, el valor se descarta (nunca se pisa un dato con uno dudoso).
 */

export interface LiveValue {
  id: string;        // id de la variable del monitor
  value: number;
  date: string;      // fecha real del dato (YYYY-MM-DD)
  tol?: number | null; // tolerancia relativa vs. valor actual (null = sin control)
  extra?: { compra?: number };
  history?: { date: string; value: number }[]; // serie real que reemplaza a la cargada a mano
  srcId?: number;    // id de la variable en la fuente (uso interno)
}

const UA = 'Mozilla/5.0 (compatible; EconoApp/1.0; +https://github.com/andresdavidfr-tech/EconoApp)';

export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

async function getText(url: string, timeoutMs = 10000): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Accept: '*/*', 'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${new URL(url).host}`);
  return res.text();
}

async function getJson(url: string, timeoutMs = 10000): Promise<any> {
  return JSON.parse(await getText(url, timeoutMs));
}

const isIsoDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s);
const daysBetween = (a: string, b: string) =>
  Math.abs(Date.parse(b.slice(0, 10)) - Date.parse(a.slice(0, 10))) / 86400000;

/* ----------------------------- BCRA ----------------------------- */

interface BcraRule { id: string; preferredId?: number; all: string[]; none?: string[]; tol: number | null }

// Catálogo e identificación de variables del BCRA según https://www.bcra.gob.ar/apis-banco-central/
export const BCRA_RULES: BcraRule[] = [
  { id: 'reservas_brutas', preferredId: 1, all: ['reservas internacionales'], tol: null },
  { id: 'bna_dolar_divisa', preferredId: 5, all: ['tipo de cambio mayorista', 'referencia'], tol: null },
  { id: 'tasa_badlar', preferredId: 7, all: ['badlar', 'privados'], none: ['dolares'], tol: null },
  { id: 'valor_uva', preferredId: 31, all: ['unidad de valor adquisitivo'], none: ['vivienda'], tol: null },
  { id: 'coeficiente_cer', preferredId: 30, all: ['coeficiente de estabilizacion de referencia'], tol: null },
  { id: 'indice_icl', preferredId: 40, all: ['contratos de locacion'], tol: null },
];

export function matchBcra(results: any[]): LiveValue[] {
  const out: LiveValue[] = [];
  for (const rule of BCRA_RULES) {
    let hit = rule.preferredId ? results.find(r => Number(r?.idVariable) === rule.preferredId) : undefined;
    if (!hit) {
      hit = results.find(r => {
        const d = normalize(String(r?.descripcion ?? ''));
        return rule.all.every(k => d.includes(k)) && !(rule.none ?? []).some(k => d.includes(k));
      });
    }
    if (!hit) continue;
    const value = Number(hit.ultValorInformado);
    const date = hit.ultFechaInformada;
    if (!Number.isFinite(value) || !isIsoDate(date)) continue;
    out.push({ id: rule.id, value, date: date.slice(0, 10), tol: rule.tol, srcId: Number(hit.idVariable) });
  }
  return out;
}

/** Serie histórica real de una variable (tolera las respuestas de v3.0 y v4.0). */
export function parseBcraDetail(json: any): { date: string; value: number }[] {
  const results: any[] = Array.isArray(json?.results) ? json.results : [];
  const flat = results.flatMap(r => (Array.isArray(r?.detalle) ? r.detalle : [r]));
  const byDate = new Map<string, number>();
  for (const d of flat) {
    const value = Number(d?.valor);
    if (isIsoDate(d?.fecha) && Number.isFinite(value)) byDate.set(String(d.fecha).slice(0, 10), value);
  }
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
}

async function fetchBcraHistory(version: string, id: number, today: string) {
  const from = new Date(Date.parse(today) - 400 * 86400000).toISOString().slice(0, 10);
  const json = await getJson(
    `https://api.bcra.gob.ar/estadisticas/${version}/monetarias/${id}?desde=${from}&hasta=${today}&limit=1000`
  );
  return parseBcraDetail(json);
}

export async function fetchBcra(today: string): Promise<LiveValue[]> {
  let lastErr: unknown;
  for (const v of ['v3.0', 'v4.0']) {
    try {
      const json = await getJson(`https://api.bcra.gob.ar/estadisticas/${v}/monetarias`);
      const results = Array.isArray(json?.results) ? json.results : [];
      const found = matchBcra(results);
      if (found.length === 0) {
        lastErr = new Error(`BCRA ${v}: sin variables reconocibles`);
        continue;
      }
      // Historia real (best-effort): si falla, se conserva solo el último valor
      await Promise.all(found.map(async f => {
        if (!f.srcId) return;
        try {
          const hist = await fetchBcraHistory(v, f.srcId, today);
          const last = hist[hist.length - 1];
          if (hist.length >= 20 && last && last.date === f.date && Math.abs(last.value / f.value - 1) < 1e-6) {
            f.history = hist;
          }
        } catch { /* sin historia: se aplica solo el último valor */ }
      }));
      return found;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('BCRA no disponible');
}

/* ----------------------------- INDEC ----------------------------- */
// API de Series de Tiempo (datos.gob.ar). Se piden valores crudos y se calcula la variación
// localmente, para no depender de cómo expresa la API los porcentajes.

async function fetchSeries(id: string, last: number): Promise<{ date: string; value: number }[]> {
  const j = await getJson(`https://apis.datos.gob.ar/series/api/series/?ids=${id}&last=${last}&format=json`);
  const rows = j?.data;
  if (!Array.isArray(rows)) throw new Error(`INDEC ${id}: respuesta inesperada`);
  return rows
    .map((r: any[]) => ({ date: String(r[0]), value: Number(r[1]) }))
    .filter(r => isIsoDate(r.date) && Number.isFinite(r.value));
}

export function ipcMensual(rows: { date: string; value: number }[]): LiveValue | null {
  const hist: { date: string; value: number }[] = [];
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1], b = rows[i];
    const gap = daysBetween(a.date, b.date);
    if (a.value < 1000 || b.value < 1000 || gap < 26 || gap > 35) continue; // no es el índice IPC mensual
    const pct = (b.value / a.value - 1) * 100;
    if (pct < -2 || pct > 25) continue;
    hist.push({ date: b.date.slice(0, 10), value: Number(pct.toFixed(1)) });
  }
  const last = hist[hist.length - 1];
  if (!last || last.date !== rows[rows.length - 1].date.slice(0, 10)) return null;
  return { id: 'ipc_inflacion_mensual', value: last.value, date: last.date, tol: null, history: hist.length >= 3 ? hist : undefined };
}

export function emaeInteranual(rows: { date: string; value: number }[]): LiveValue | null {
  const hist: { date: string; value: number }[] = [];
  for (let i = 12; i < rows.length; i++) {
    const a = rows[i - 12], b = rows[i];
    const gap = daysBetween(a.date, b.date);
    if (a.value < 50 || a.value > 1000 || gap < 330 || gap > 400) continue;
    const pct = (b.value / a.value - 1) * 100;
    if (pct < -30 || pct > 30) continue;
    hist.push({ date: b.date.slice(0, 10), value: Number(pct.toFixed(1)) });
  }
  const last = hist[hist.length - 1];
  if (!last || last.date !== rows[rows.length - 1].date.slice(0, 10)) return null;
  return { id: 'emae_actividad_indec', value: last.value, date: last.date, tol: null, history: hist.length >= 3 ? hist : undefined };
}

export async function fetchIndec(): Promise<LiveValue[]> {
  const settled = await Promise.allSettled([
    fetchSeries('148.3_INIVELNAL_DICI_M_26', 25).then(ipcMensual),
    fetchSeries('143.3_NO_PR_2004_A_21', 37).then(emaeInteranual),
  ]);
  const out = settled.flatMap(s => (s.status === 'fulfilled' && s.value ? [s.value] : []));
  if (out.length === 0) {
    const err = settled.find(s => s.status === 'rejected') as PromiseRejectedResult | undefined;
    throw err?.reason instanceof Error ? err.reason : new Error('INDEC: sin datos válidos');
  }
  return out;
}

/* ---------------------- RIPTE (Series de Tiempo) ---------------------- */
// El id de la serie se descubre con el buscador de la API (no se fija a mano) y se recuerda en memoria.

const seriesIdCache = new Map<string, string>();

async function discoverSeries(query: string, accept: (text: string) => boolean): Promise<string> {
  const cached = seriesIdCache.get(query);
  if (cached) return cached;
  const j = await getJson(`https://apis.datos.gob.ar/series/api/search/?q=${encodeURIComponent(query)}&limit=30`);
  const items: any[] = Array.isArray(j?.data) ? j.data : [];
  for (const it of items) {
    const f = it?.field;
    if (!f?.id) continue;
    const freq = String(f.frequency ?? '');
    if (freq && !freq.includes('P1M')) continue; // solo series mensuales
    const text = normalize(`${f.title ?? ''} ${f.description ?? ''}`);
    if (accept(text)) {
      seriesIdCache.set(query, String(f.id));
      return String(f.id);
    }
  }
  throw new Error(`Series de Tiempo: no se encontró una serie para "${query}"`);
}

export function ripteFromRows(rows: { date: string; value: number }[]): LiveValue | null {
  const valid = rows.filter(r => r.value > 100_000 && r.value < 100_000_000); // nivel en pesos, no índice
  const last = valid[valid.length - 1];
  if (!last || valid.length < 2) return null;
  return {
    id: 'ripte_salario_estable', value: Number(last.value.toFixed(2)), date: last.date.slice(0, 10), tol: null,
    history: valid.length >= 3 ? valid.map(r => ({ date: r.date.slice(0, 10), value: Number(r.value.toFixed(2)) })) : undefined
  };
}

export async function fetchRipte(): Promise<LiveValue[]> {
  const id = await discoverSeries('ripte', t =>
    (t.includes('ripte') || t.includes('remuneracion imponible promedio')) &&
    !/(indice|base|decreciente|variacion|var\.)/.test(t)
  );
  const v = ripteFromRows(await fetchSeries(id, 25));
  if (!v) throw new Error('RIPTE: la serie encontrada no tiene el formato esperado');
  return [v];
}

/* ------------------------------ BNA ------------------------------ */

const toNum = (s: string) => Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s);

export function parseBnaUsd(html: string): { compra: number; venta: number } | null {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
  const m = /d[oó]lar\s+u\.?\s?s\.?\s?a\.?\s+\$?\s*([\d.]+(?:,\d+)?)\s+\$?\s*([\d.]+(?:,\d+)?)/i.exec(text);
  if (!m) return null;
  const compra = toNum(m[1]), venta = toNum(m[2]);
  if (!Number.isFinite(compra) || !Number.isFinite(venta) || compra <= 0 || venta < compra) return null;
  return { compra, venta };
}

export async function fetchBna(today: string): Promise<LiveValue[]> {
  const targets: [string, string][] = [
    ['https://www.bna.com.ar/Cotizador/Monedasv2', 'bna_dolar_billete'],
    ['https://www.bna.com.ar/Cotizador/Divisasv2', 'bna_dolar_divisa'],
  ];
  const settled = await Promise.allSettled(
    targets.map(async ([url, id]) => {
      const q = parseBnaUsd(await getText(url));
      if (!q) throw new Error(`BNA ${id}: formato no reconocido`);
      return { id, value: q.venta, date: today, tol: 0.15, extra: { compra: q.compra } } as LiveValue;
    })
  );
  const out = settled.flatMap(s => (s.status === 'fulfilled' ? [s.value] : []));
  if (out.length === 0) {
    const err = settled.find(s => s.status === 'rejected') as PromiseRejectedResult | undefined;
    throw err?.reason instanceof Error ? err.reason : new Error('BNA no disponible');
  }
  return out;
}

/* --------------------- Cotizaciones financieras --------------------- */
// Blue, MEP, CCL, tarjeta y cripto no tienen fuente oficial: se toman de DolarApi (tercero).

const DOLARAPI_MAP: Record<string, string> = {
  oficial: 'bna_dolar_billete',
  blue: 'dolar_blue',
  bolsa: 'dolar_mep_byma',
  contadoconliqui: 'dolar_ccl_byma',
  tarjeta: 'dolar_tarjeta',
  cripto: 'dolar_cripto',
};

export async function fetchDolarApi(today: string, skipIds: Set<string>): Promise<LiveValue[]> {
  const data = await getJson('https://dolarapi.com/v1/dolares', 8000);
  if (!Array.isArray(data)) throw new Error('DolarApi: respuesta inesperada');
  const out: LiveValue[] = [];
  for (const item of data) {
    const id = DOLARAPI_MAP[item?.casa];
    if (!id || skipIds.has(id)) continue;
    const value = Number(item.venta);
    if (!(value > 0)) continue;
    out.push({
      id, value, date: today, tol: 0.15,
      extra: Number.isFinite(Number(item.compra)) ? { compra: Number(item.compra) } : undefined
    });
  }
  if (out.length === 0) throw new Error('DolarApi: sin cotizaciones válidas');
  return out;
}
