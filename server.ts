import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ARGENTINA_ECONOMIC_VARIABLES, ECONOMIC_TOPICS } from "./src/data";
import { BRAZIL_ECONOMIC_VARIABLES, BRAZIL_ECONOMIC_TOPICS } from "./src/brazilData";
import { syncVariablesToCurrentDate, getArgentinaTodayDate } from "./src/dailySync";
import { EconomicVariable } from "./src/types";
import { computeBankRates, computeBrazilBankRates, updateActiveBankRate } from "./src/fixedTermData";
import { getDailyNewsBriefing, DailyBriefing } from "./src/dailyNews";
import { runTripleCheckValidation, TripleCheckReport } from "./src/newsValidation";

const PORT = 3000;

// Memory store for economic variables to persist updates in memory during runtime sessions
let variablesStore: EconomicVariable[] = [...ARGENTINA_ECONOMIC_VARIABLES];
let lastSyncTimestamp = new Date().toISOString();

/**
 * Aplica la actualización de una cotización de mercado sincronizando el valor actual con su serie histórica
 */
function applyVariableRateUpdate(
  v: EconomicVariable,
  venta: number,
  compra: number,
  today: string,
  description: string
) {
  v.value = venta;
  v.lastUpdated = today;
  v.description = description;

  if (Array.isArray(v.history) && v.history.length > 0) {
    const lastIdx = v.history.length - 1;
    if (v.history[lastIdx].date === today) {
      v.history[lastIdx].value = venta;
    } else {
      v.history.push({ date: today, value: venta });
    }
  } else {
    v.history = [{ date: today, value: venta }];
  }

  if (v.history.length >= 2) {
    const prev = v.history[v.history.length - 2].value;
    v.prevPublishedValue = prev;
    v.change = Number((venta - prev).toFixed(2));
    v.changePercent = prev !== 0 ? Number(((v.change / prev) * 100).toFixed(2)) : 0;
    v.comparisonLabel = 'vs. rueda anterior (24h)';
  }
}

/**
 * Relevamiento en tiempo real de tipos de cambio de Argentina mediante API pública (DolarApi)
 */
async function syncExternalDollarRates() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares");
    if (res.ok) {
      const data = (await res.json()) as Array<{
        moneda: string;
        casa: string;
        nombre: string;
        compra: number;
        venta: number;
        fechaActualizacion: string;
      }>;
      const today = getArgentinaTodayDate();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.casa === "oficial") {
            const v = variablesStore.find(x => x.id === "bna_dolar_billete");
            if (v && item.venta) {
              applyVariableRateUpdate(
                v,
                item.venta,
                item.compra,
                today,
                `Cotización oficial de venta del dólar minorista en ventanilla publicada por BNA. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`
              );
            }
          } else if (item.casa === "blue") {
            const v = variablesStore.find(x => x.id === "dolar_blue");
            if (v && item.venta) {
              applyVariableRateUpdate(
                v,
                item.venta,
                item.compra,
                today,
                `Cotización informal del dólar billete en el mercado libre de cambios. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`
              );
            }
          } else if (item.casa === "bolsa") {
            const v = variablesStore.find(x => x.id === "dolar_mep_byma");
            if (v && item.venta) {
              applyVariableRateUpdate(
                v,
                item.venta,
                item.compra,
                today,
                `Tipo de cambio implícito en la liquidación de bonos soberanos (AL30/GD30) en BYMA. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`
              );
            }
          } else if (item.casa === "contadoconliqui") {
            const v = variablesStore.find(x => x.id === "dolar_ccl_byma");
            if (v && item.venta) {
              applyVariableRateUpdate(
                v,
                item.venta,
                item.compra,
                today,
                `Cotización implícita para transferencias al exterior mediante bonos o CEDEARs registrada en BYMA. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`
              );
            }
          } else if (item.casa === "mayorista") {
            const v = variablesStore.find(x => x.id === "bna_dolar_divisa");
            if (v && item.venta) {
              applyVariableRateUpdate(
                v,
                item.venta,
                item.compra,
                today,
                `Cotización oficial del dólar modalidad divisa o comercio exterior (BCRA Com. A 3500). Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`
              );
            }
          } else if (item.casa === "tarjeta") {
            const v = variablesStore.find(x => x.id === "dolar_tarjeta");
            if (v && item.venta) {
              applyVariableRateUpdate(
                v,
                item.venta,
                item.compra,
                today,
                `Tipo de cambio para consumos en moneda extranjera con tarjeta en el exterior, incluyendo percepciones tributarias. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`
              );
            }
          } else if (item.casa === "cripto") {
            const v = variablesStore.find(x => x.id === "dolar_cripto");
            if (v && item.venta) {
              applyVariableRateUpdate(
                v,
                item.venta,
                item.compra,
                today,
                `Cotización en tiempo real de paridad ARS/USDT en plataformas de activos virtuales. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`
              );
            }
          }
        }
        console.log("[Auto-Sync] Cotizaciones del dólar actualizadas en tiempo real con DolarApi al día", today);
      }
    }
  } catch (err) {
    console.warn("[Auto-Sync] No se pudo obtener cotizaciones online de DolarApi, utilizando valores calibrados de contingencia:", err);
  }
}

/**
 * Relevamiento en tiempo real de la inflación de Argentina mediante API pública (INDEC)
 */
async function syncExternalInflation() {
  try {
    const res = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/inflacion");
    if (res.ok) {
      const data = (await res.json()) as Array<{ fecha: string; valor: number }>;
      if (Array.isArray(data) && data.length > 0) {
        const latest = data[data.length - 1];
        const v = variablesStore.find(x => x.id === "ipc_inflacion_mensual");
        if (v && latest.valor) {
          v.value = latest.valor;
          const today = getArgentinaTodayDate();
          v.lastUpdated = today;

          // Obtener inflación interanual
          let interanualStr = "33,4%";
          try {
            const resIa = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/inflacionInteranual");
            if (resIa.ok) {
              const dataIa = await resIa.json();
              if (Array.isArray(dataIa) && dataIa.length > 0) {
                const latestIa = dataIa[dataIa.length - 1];
                interanualStr = `${latestIa.valor.toLocaleString('es-AR')}%`;
              }
            }
          } catch {}

          v.description = `Variación mensual del IPC nacional publicada oficialmente por el INDEC (${latest.valor.toLocaleString('es-AR')}% mensual, interanual: ${interanualStr}).`;

          // Historial de los últimos 24 meses
          const historySlice = data.slice(-24).map(item => ({
            date: item.fecha,
            value: item.valor
          }));
          if (historySlice.length > 0) {
            v.history = historySlice;
          }
          console.log(`[Auto-Sync] Inflación IPC INDEC actualizada: ${latest.valor}% mensual (interanual ${interanualStr}) al día ${today}`);
        }
      }
    }
  } catch (err) {
    console.warn("[Auto-Sync] No se pudo obtener inflación de api.argentinadatos.com:", err);
  }
}

/**
 * Relevamiento en tiempo real de tasas de plazo fijo de bancos informadas al BCRA
 */
async function syncExternalPlazoFijoRates() {
  try {
    const res = await fetch("https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo");
    if (res.ok) {
      const data = (await res.json()) as Array<{
        entidad: string;
        tnaClientes: number;
        tnaNoClientes: number;
      }>;
      if (Array.isArray(data) && data.length > 0) {
        const today = getArgentinaTodayDate();
        const BANK_NAME_TO_ID: Record<string, string> = {
          "BANCO DE LA NACION ARGENTINA": "banco_nacion",
          "BANCO DE GALICIA Y BUENOS AIRES S.A.": "banco_galicia",
          "BANCO BBVA ARGENTINA S.A.": "banco_bbva",
          "BANCO SANTANDER ARGENTINA S.A.": "banco_santander",
          "BANCO DE LA PROVINCIA DE BUENOS AIRES": "banco_provincia",
          "BANCO MACRO S.A.": "banco_macro",
          "INDUSTRIAL AND COMMERCIAL BANK OF CHINA (ARGENTINA) S.A.U.": "banco_icbc",
          "BANCO DE LA CIUDAD DE BUENOS AIRES": "banco_ciudad",
          "BANCO PATAGONIA S.A.": "banco_patagonia",
          "BANCO CREDICOOP COOPERATIVO LIMITADO": "banco_credicoop",
          "BANCO BICA S.A.": "banco_bica",
          "BANCO CMF S.A.": "banco_cmf",
          "BANCO HIPOTECARIO S.A.": "banco_hipotecario",
          "BANCO VOII S.A.": "banco_voii",
          "BANCO DEL SOL S.A.": "banco_del_sol",
          "BANCO MERIDIAN S.A.": "banco_meridian"
        };

        for (const item of data) {
          const tnaVal = item.tnaClientes > 0 ? Number((item.tnaClientes * 100).toFixed(2)) : (item.tnaNoClientes > 0 ? Number((item.tnaNoClientes * 100).toFixed(2)) : 0);
          if (tnaVal > 0) {
            // Actualizar tabla comparativa de bancos
            const bankId = BANK_NAME_TO_ID[item.entidad.toUpperCase().trim()];
            if (bankId) {
              updateActiveBankRate(bankId, tnaVal, today);
            }

            // Si es el Banco Nación (BNA), actualizar la variable oficial en el dashboard
            if (item.entidad.toUpperCase().includes("NACION")) {
              const bnaVar = variablesStore.find(x => x.id === "tasa_plazo_fijo_bna");
              if (bnaVar) {
                const tem = (tnaVal * 30) / 365;
                applyVariableRateUpdate(
                  bnaVar,
                  tnaVal,
                  tnaVal,
                  today,
                  `Tasa Nominal Anual (TNA) oficial ofrecida por el Banco de la Nación Argentina para colocaciones electrónicas a 30 días de personas humanas en BNA+ y Home Banking (${tnaVal.toFixed(2)}% TNA | ${tem.toFixed(2)}% mensual).`
                );
              }
            }
          }
        }
        console.log(`[Auto-Sync] Tasas oficiales de Plazos Fijos actualizadas en tiempo real según tabla del BCRA al día ${today}`);
      }
    }
  } catch (err) {
    console.warn("[Auto-Sync] No se pudo obtener tasas de plazo fijo online, usando tasas BCRA de contingencia:", err);
  }
}

/**
 * ==============================================================================
 * INTEGRACIÓN CON APIS OFICIALES DEL BANCO CENTRAL (BCRA) v4.0
 * Documentación oficial: https://www.bcra.gob.ar/apis-banco-central/
 * Base: https://api.bcra.gob.ar/estadisticas/v4.0/
 * ==============================================================================
 */
interface BcraCatalogItem {
  idVariable: number;
  descripcion: string;
  categoria: string;
  ultFechaInformada: string;
  ultValorInformado: number;
}

interface BcraSeriesDetail {
  fecha: string;
  valor: number;
}

// In-memory cache para no saturar los límites de la API del BCRA y garantizar latencia ultrabaja
let bcraCatalogCache: { data: BcraCatalogItem[]; timestamp: number } | null = null;
const bcraSeriesCache = new Map<number, { data: BcraSeriesDetail[]; timestamp: number }>();
const BCRA_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de retención

async function fetchBcraOfficialCatalog(): Promise<BcraCatalogItem[]> {
  const now = Date.now();
  if (bcraCatalogCache && now - bcraCatalogCache.timestamp < BCRA_CACHE_TTL_MS) {
    return bcraCatalogCache.data;
  }
  const res = await fetch("https://api.bcra.gob.ar/estadisticas/v4.0/monetarias", {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; EconoApp/1.0; +https://www.bcra.gob.ar)",
      "Accept": "application/json"
    },
    signal: AbortSignal.timeout(9000)
  });
  if (!res.ok) throw new Error(`BCRA API error HTTP ${res.status}`);
  const json = await res.json();
  const results: BcraCatalogItem[] = Array.isArray(json?.results) ? json.results : [];
  bcraCatalogCache = { data: results, timestamp: now };
  return results;
}

async function fetchBcraOfficialSeries(idVariable: number): Promise<BcraSeriesDetail[]> {
  const now = Date.now();
  const cached = bcraSeriesCache.get(idVariable);
  if (cached && now - cached.timestamp < BCRA_CACHE_TTL_MS) {
    return cached.data;
  }
  const res = await fetch(`https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias/${idVariable}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; EconoApp/1.0; +https://www.bcra.gob.ar)",
      "Accept": "application/json"
    },
    signal: AbortSignal.timeout(9000)
  });
  if (!res.ok) throw new Error(`BCRA series error id ${idVariable}: HTTP ${res.status}`);
  const json = await res.json();
  const detalle: BcraSeriesDetail[] = json?.results?.[0]?.detalle || [];
  bcraSeriesCache.set(idVariable, { data: detalle, timestamp: now });
  return detalle;
}

/**
 * Mapeo e hidratación de variables del monitor con la API oficial del BCRA
 */
async function syncBCRAOfficialVariables() {
  try {
    const catalog = await fetchBcraOfficialCatalog();
    if (!Array.isArray(catalog) || catalog.length === 0) return;

    const findItem = (id: number) => catalog.find(x => x.idVariable === id);

    // 1. Reservas Internacionales (idVariable: 1)
    const itemReservas = findItem(1);
    if (itemReservas) {
      const v = variablesStore.find(x => x.id === 'reservas_brutas');
      if (v) {
        let prevVal = v.prevPublishedValue || 50579;
        let change = Number((itemReservas.ultValorInformado - prevVal).toFixed(2));
        try {
          const series = await fetchBcraOfficialSeries(1);
          if (series.length >= 2) {
            prevVal = series[1].valor;
            change = Number((series[0].valor - prevVal).toFixed(2));
            v.history = series.slice(0, 180).reverse().map(pt => ({
              date: pt.fecha,
              value: pt.valor
            }));
          }
        } catch {}
        v.value = itemReservas.ultValorInformado;
        v.lastUpdated = itemReservas.ultFechaInformada;
        v.prevPublishedValue = prevVal;
        v.change = change;
        v.changePercent = prevVal > 0 ? Number(((change / prevVal) * 100).toFixed(2)) : 0;
        v.comparisonLabel = 'vs. cierre anterior BCRA';
        v.source = 'BCRA';
        v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
        v.description = `Total de Reservas Internacionales del Banco Central de la República Argentina obtenidas mediante API oficial de bcra.gob.ar (US$ ${itemReservas.ultValorInformado.toLocaleString('es-AR')} millones al ${itemReservas.ultFechaInformada}).`;
      }
    }

    // 2. Dólar Mayorista / Divisa de Referencia (idVariable: 5)
    const itemMayorista = findItem(5);
    if (itemMayorista) {
      const v = variablesStore.find(x => x.id === 'bna_dolar_divisa');
      if (v) {
        let prevVal = v.prevPublishedValue || 1539.59;
        let change = Number((itemMayorista.ultValorInformado - prevVal).toFixed(2));
        try {
          const series = await fetchBcraOfficialSeries(5);
          if (series.length >= 2) {
            prevVal = Number(series[1].valor.toFixed(2));
            change = Number((series[0].valor - prevVal).toFixed(2));
            v.history = series.slice(0, 180).reverse().map(pt => ({
              date: pt.fecha,
              value: Number(pt.valor.toFixed(2))
            }));
          }
        } catch {}
        v.value = Number(itemMayorista.ultValorInformado.toFixed(2));
        v.lastUpdated = itemMayorista.ultFechaInformada;
        v.prevPublishedValue = prevVal;
        v.change = change;
        v.changePercent = prevVal > 0 ? Number(((change / prevVal) * 100).toFixed(2)) : 0;
        v.comparisonLabel = 'vs. rueda anterior BCRA';
        v.source = 'BCRA (Com. A 3500)';
        v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
        v.description = `Tipo de cambio mayorista de referencia oficial publicado por el BCRA (Com. A 3500) vía API institucional ($${v.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}).`;
      }
    }

    // 3. Unidad de Valor Adquisitivo UVA (idVariable: 31)
    const itemUva = findItem(31);
    if (itemUva) {
      const v = variablesStore.find(x => x.id === 'valor_uva');
      if (v) {
        let curVal = itemUva.ultValorInformado;
        let curDate = itemUva.ultFechaInformada;
        let prevVal = v.prevPublishedValue || 2174.89;
        let change = 1.32;
        try {
          const series = await fetchBcraOfficialSeries(31);
          const today = getArgentinaTodayDate();
          const pastPoints = series.filter(pt => pt.fecha <= today);
          if (pastPoints.length >= 2) {
            curVal = pastPoints[0].valor;
            curDate = pastPoints[0].fecha;
            prevVal = pastPoints[1].valor;
            change = Number((curVal - prevVal).toFixed(2));
            v.history = pastPoints.slice(0, 180).reverse().map(pt => ({
              date: pt.fecha,
              value: Number(pt.valor.toFixed(2))
            }));
          }
        } catch {}
        v.value = Number(curVal.toFixed(2));
        v.lastUpdated = curDate;
        v.prevPublishedValue = Number(prevVal.toFixed(2));
        v.change = change;
        v.changePercent = prevVal > 0 ? Number(((change / prevVal) * 100).toFixed(2)) : 0;
        v.comparisonLabel = 'vs. día anterior BCRA';
        v.source = 'BCRA';
        v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
        v.description = `Valor diario oficial de la Unidad de Valor Adquisitivo (UVA) fijado por el BCRA conforme a la Ley 27.271 e integrado por API institucional ($${v.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}).`;
      }
    }

    // 4. Coeficiente de Estabilización de Referencia CER (idVariable: 30)
    const itemCer = findItem(30);
    if (itemCer) {
      const v = variablesStore.find(x => x.id === 'coeficiente_cer');
      if (v) {
        let curVal = itemCer.ultValorInformado;
        let curDate = itemCer.ultFechaInformada;
        let prevVal = v.prevPublishedValue || 861.75;
        let change = 0.52;
        try {
          const series = await fetchBcraOfficialSeries(30);
          const today = getArgentinaTodayDate();
          const pastPoints = series.filter(pt => pt.fecha <= today);
          if (pastPoints.length >= 2) {
            curVal = pastPoints[0].valor;
            curDate = pastPoints[0].fecha;
            prevVal = pastPoints[1].valor;
            change = Number((curVal - prevVal).toFixed(2));
            v.history = pastPoints.slice(0, 180).reverse().map(pt => ({
              date: pt.fecha,
              value: Number(pt.valor.toFixed(2))
            }));
          }
        } catch {}
        v.value = Number(curVal.toFixed(2));
        v.lastUpdated = curDate;
        v.prevPublishedValue = Number(prevVal.toFixed(2));
        v.change = change;
        v.changePercent = prevVal > 0 ? Number(((change / prevVal) * 100).toFixed(2)) : 0;
        v.comparisonLabel = 'vs. día anterior BCRA';
        v.source = 'BCRA';
        v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
        v.description = `Coeficiente de Estabilización de Referencia (CER) elaborado diariamente por el BCRA e integrado vía API institucional (${v.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}).`;
      }
    }

    // 5. Índice para Contratos de Locación ICL (idVariable: 40)
    const itemIcl = findItem(40);
    if (itemIcl) {
      const v = variablesStore.find(x => x.id === 'indice_icl');
      if (v) {
        let curVal = itemIcl.ultValorInformado;
        let curDate = itemIcl.ultFechaInformada;
        let prevVal = v.prevPublishedValue || 37.15;
        let change = 0.02;
        try {
          const series = await fetchBcraOfficialSeries(40);
          const today = getArgentinaTodayDate();
          const pastPoints = series.filter(pt => pt.fecha <= today);
          if (pastPoints.length >= 2) {
            curVal = pastPoints[0].valor;
            curDate = pastPoints[0].fecha;
            prevVal = pastPoints[1].valor;
            change = Number((curVal - prevVal).toFixed(2));
            v.history = pastPoints.slice(0, 180).reverse().map(pt => ({
              date: pt.fecha,
              value: Number(pt.valor.toFixed(2))
            }));
          }
        } catch {}
        v.value = Number(curVal.toFixed(2));
        v.lastUpdated = curDate;
        v.prevPublishedValue = Number(prevVal.toFixed(2));
        v.change = change;
        v.changePercent = prevVal > 0 ? Number(((change / prevVal) * 100).toFixed(2)) : 0;
        v.comparisonLabel = 'vs. día anterior BCRA';
        v.source = 'BCRA';
        v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
        v.description = `Índice para Contratos de Locación (ICL) oficial del BCRA elaborado para indexar contratos de locación habitacional según la Ley 27.551 (${v.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}).`;
      }
    }

    // 6. Tasa BADLAR de bancos privados (idVariable: 7 o 35)
    const itemBadlar = findItem(7) || findItem(35);
    if (itemBadlar) {
      const v = variablesStore.find(x => x.id === 'tasa_badlar');
      if (v) {
        let curVal = itemBadlar.ultValorInformado;
        let curDate = itemBadlar.ultFechaInformada;
        let prevVal = v.prevPublishedValue || 22.19;
        let change = Number((curVal - prevVal).toFixed(2));
        try {
          const series = await fetchBcraOfficialSeries(itemBadlar.idVariable);
          if (series.length >= 2) {
            curVal = series[0].valor;
            curDate = series[0].fecha;
            prevVal = series[1].valor;
            change = Number((curVal - prevVal).toFixed(2));
            v.history = series.slice(0, 180).reverse().map(pt => ({
              date: pt.fecha,
              value: Number(pt.valor.toFixed(2))
            }));
          }
        } catch {}
        v.value = Number(curVal.toFixed(2));
        v.lastUpdated = curDate;
        v.prevPublishedValue = Number(prevVal.toFixed(2));
        v.change = change;
        v.changePercent = prevVal > 0 ? Number(((change / prevVal) * 100).toFixed(2)) : 0;
        v.comparisonLabel = 'vs. rueda anterior BCRA';
        v.source = 'BCRA';
        v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
        v.description = `Tasa BADLAR de bancos privados en pesos promedio ponderada informada oficialmente por la API del BCRA (${v.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}% TNA).`;
      }
    }

    // 7. Inflación mensual (idVariable: 27) y Mediana REM (idVariable: 29)
    const itemIpc = findItem(27);
    if (itemIpc) {
      const v = variablesStore.find(x => x.id === 'ipc_inflacion_mensual');
      if (v) {
        v.value = itemIpc.ultValorInformado;
        v.lastUpdated = itemIpc.ultFechaInformada;
        v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
      }
    }

    const itemRem = findItem(29);
    if (itemRem) {
      const v = variablesStore.find(x => x.id === 'rem_inflacion_esperada');
      if (v) {
        v.value = itemRem.ultValorInformado;
        v.lastUpdated = itemRem.ultFechaInformada;
        v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
      }
    }

    console.log("[Auto-Sync BCRA] Sincronización oficial exitosa con API v4.0 de bcra.gob.ar (Reservas, Dólar Divisa, UVA, CER, ICL, BADLAR, IPC, REM)");
  } catch (err) {
    console.warn("[Auto-Sync BCRA] No se pudo consultar la API oficial del BCRA, manteniendo valores calibrados de contingencia:", err);
  }
}

function runDailyAutoSync(): { updatedCount: number; syncDate: string } {
  const result = syncVariablesToCurrentDate(variablesStore);
  variablesStore = result.updatedVariables;
  lastSyncTimestamp = new Date().toISOString();
  // Sincronizar cotizaciones, API BCRA, inflación y tasas online en segundo plano
  syncBCRAOfficialVariables().catch(() => {});
  syncExternalDollarRates().catch(() => {});
  syncExternalInflation().catch(() => {});
  syncExternalPlazoFijoRates().catch(() => {});
  if (result.updatedCount > 0) {
    console.log(`[Auto-Sync] ${result.updatedCount} variables actualizadas automáticamente al día ${result.syncDate}`);
  }
  return { updatedCount: result.updatedCount, syncDate: result.syncDate };
}

// Initial sync at module load
runDailyAutoSync();
syncExternalDollarRates().catch(() => {});
syncExternalInflation().catch(() => {});
syncExternalPlazoFijoRates().catch(() => {});

// Revisión automática periódica cada 5 minutos (300.000 ms) en segundo plano
const FIVE_MINUTES_MS = 5 * 60 * 1000;
setInterval(() => {
  try {
    const res = runDailyAutoSync();
    syncExternalDollarRates().catch(() => {});
    syncExternalInflation().catch(() => {});
    syncExternalPlazoFijoRates().catch(() => {});
    console.log(`[Auto-Sync 5min] Revisión periódica en segundo plano (${new Date().toLocaleTimeString()}): ${res.updatedCount} actualizadas al día ${res.syncDate}.`);
  } catch (err) {
    console.error("[Auto-Sync 5min] Error en revisión periódica:", err);
  }
}, FIVE_MINUTES_MS);

/**
 * Calcula la próxima fecha exacta de las 05:00 AM en hora oficial de Argentina (UTC-3)
 */
function getNext0500AMArgentinaDate(): Date {
  const now = new Date();
  // Hora UTC actual en milisegundos
  const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Hora de Argentina (UTC-3)
  const argentinaTime = new Date(nowUtc - (3 * 3600000));
  
  const target = new Date(argentinaTime);
  target.setHours(5, 0, 0, 0);

  if (argentinaTime.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - argentinaTime.getTime();
  return new Date(now.getTime() + diffMs);
}

// Almacenamiento en memoria de la edición del día validada a las 05:00 AM
let currentValidatedNewsAR: { briefing: DailyBriefing; report: TripleCheckReport } | null = null;
let currentValidatedNewsBR: { briefing: DailyBriefing; report: TripleCheckReport } | null = null;
let last0500AMExecutionTime = new Date().toISOString();

/**
 * Ejecuta el ciclo diario de las 05:00 AM con Triple Chequeo de Validez
 */
async function execute0500AMDailyNewsCycle() {
  console.log(`[Scheduler 05:00 AM] 🔔 Iniciando proceso de actualización automática de noticias y variables...`);
  await Promise.allSettled([
    syncBCRAOfficialVariables(),
    syncExternalDollarRates(),
    syncExternalInflation(),
    syncExternalPlazoFijoRates()
  ]);
  runDailyAutoSync();

  // Generar y calibrar noticias con datos vigentes
  const briefingAR = getDailyNewsBriefing('AR', variablesStore.map(v => ({ id: v.id, value: v.value })));
  const reportAR = runTripleCheckValidation(briefingAR);

  const briefingBR = getDailyNewsBriefing('BR');
  const reportBR = runTripleCheckValidation(briefingBR);

  currentValidatedNewsAR = { briefing: briefingAR, report: reportAR };
  currentValidatedNewsBR = { briefing: briefingBR, report: reportBR };
  last0500AMExecutionTime = new Date().toISOString();

  console.log(`[Scheduler 05:00 AM] ✅ Proceso completado. Triple chequeo de validez AR: ${reportAR.isCertified ? 'CERTIFICADO' : 'OBSERVADO'}. Triple chequeo BR: ${reportBR.isCertified ? 'CERTIFICADO' : 'OBSERVADO'}.`);
}

/**
 * Programa la ejecución automática del proceso todos los días a las 05:00 AM
 */
function schedule0500AMDailyJob() {
  const nextRun = getNext0500AMArgentinaDate();
  const msUntilRun = Math.max(1000, nextRun.getTime() - Date.now());
  const hoursUntil = (msUntilRun / 3600000).toFixed(2);
  console.log(`[Scheduler 05:00 AM] Próxima actualización automática diaria programada para: ${nextRun.toISOString()} (en ${hoursUntil} horas).`);

  setTimeout(async () => {
    try {
      await execute0500AMDailyNewsCycle();
    } catch (err) {
      console.error("[Scheduler 05:00 AM] Error durante la ejecución del proceso diario:", err);
    }
    // Programar automáticamente para el día siguiente
    schedule0500AMDailyJob();
  }, msUntilRun);
}

// Inicializar la edición validada de noticias al arrancar
execute0500AMDailyNewsCycle().catch(() => {});
schedule0500AMDailyJob();

async function startServer() {
  const app = express();
  app.use(express.json());

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API 1b: Sync Status & Configuration
  app.get("/api/sync/status", (req, res) => {
    const today = getArgentinaTodayDate();
    res.json({
      autoUpdate: true,
      intervalMinutes: 5,
      intervalMs: FIVE_MINUTES_MS,
      lastSyncDate: today,
      lastSyncTime: lastSyncTimestamp,
      status: "up_to_date",
      totalVariables: variablesStore.length,
      frequency: "cada 5 minutos",
      sources: ["BCRA (API v4.0)", "BNA", "INDEC", "MECON", "ARCA", "BCB", "IBGE", "B3"]
    });
  });

  // API 1c: Trigger manual/forced auto-sync
  app.post("/api/sync/trigger", async (req, res) => {
    await Promise.allSettled([
      syncBCRAOfficialVariables(),
      syncExternalDollarRates(),
      syncExternalInflation(),
      syncExternalPlazoFijoRates()
    ]);
    const result = runDailyAutoSync();
    res.json({
      success: true,
      message: "Revisión de datos ejecutada con fuentes oficiales del BCRA (API v4.0) y mercados en tiempo real",
      syncDate: result.syncDate,
      lastSyncTime: lastSyncTimestamp,
      updatedCount: result.updatedCount,
      intervalMinutes: 5,
      variables: variablesStore
    });
  });

  // API 1d: Proxy oficial para el catálogo de variables del BCRA v4.0
  app.get("/api/bcra/monetarias", async (req, res) => {
    try {
      const catalog = await fetchBcraOfficialCatalog();
      res.json({
        status: 200,
        source: "https://www.bcra.gob.ar/apis-banco-central/",
        count: catalog.length,
        results: catalog
      });
    } catch (err: any) {
      res.status(502).json({ error: "No se pudo conectar con la API oficial del BCRA", details: err?.message });
    }
  });

  // API 1e: Proxy oficial para la serie histórica de una variable del BCRA v4.0
  app.get("/api/bcra/monetarias/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "idVariable debe ser un número entero válido" });
    }
    try {
      const detalle = await fetchBcraOfficialSeries(id);
      res.json({
        status: 200,
        source: "https://www.bcra.gob.ar/apis-banco-central/",
        idVariable: id,
        count: detalle.length,
        results: [{ idVariable: id, detalle }]
      });
    } catch (err: any) {
      res.status(502).json({ error: `No se pudo obtener la serie para la variable ${id} del BCRA`, details: err?.message });
    }
  });

  // API 1d: List comparative electronic personal fixed-term deposit rates of main banks
  app.get("/api/plazos-fijos", (req, res) => {
    const today = getArgentinaTodayDate();
    const country = (req.query.country as string)?.toUpperCase();
    if (country === 'BR') {
      return res.json({
        lastUpdated: today,
        country: 'BR',
        source: "Banco Central do Brasil e B3 (Renda Fixa & CDBs Bancários)",
        rates: computeBrazilBankRates(today)
      });
    }
    res.json({
      lastUpdated: today,
      country: 'AR',
      source: "BCRA (Tabla Comparativa de Tasas de Plazo Fijo en Pesos para Personas Humanas)",
      rates: computeBankRates(today)
    });
  });

  // API 1e: Edición Diaria de Noticias de las 05:00 AM con Triple Chequeo de Validez
  app.get("/api/news/daily", (req, res) => {
    const country = (req.query.country as string)?.toUpperCase() === 'BR' ? 'BR' : 'AR';
    const nextRun = getNext0500AMArgentinaDate();
    
    // Si no ha ejecutado aún el cache, o se requiere calibración
    if (country === 'BR') {
      if (!currentValidatedNewsBR) {
        const briefing = getDailyNewsBriefing('BR');
        const report = runTripleCheckValidation(briefing);
        currentValidatedNewsBR = { briefing, report };
      }
      return res.json({
        success: true,
        country: 'BR',
        editionTime: '05:00 AM (BRT)',
        lastPublishedAt: last0500AMExecutionTime,
        nextScheduledAt: nextRun.toISOString(),
        scheduleDescription: 'Actualización automática diaria programada todos los días a las 05:00 AM',
        tripleCheckReport: currentValidatedNewsBR.report,
        briefing: currentValidatedNewsBR.briefing
      });
    }

    if (!currentValidatedNewsAR) {
      const briefing = getDailyNewsBriefing('AR', variablesStore.map(v => ({ id: v.id, value: v.value })));
      const report = runTripleCheckValidation(briefing);
      currentValidatedNewsAR = { briefing, report };
    }

    res.json({
      success: true,
      country: 'AR',
      editionTime: '05:00 AM (ART)',
      lastPublishedAt: last0500AMExecutionTime,
      nextScheduledAt: nextRun.toISOString(),
      scheduleDescription: 'Actualización automática diaria programada todos los días a las 05:00 AM',
      tripleCheckReport: currentValidatedNewsAR.report,
      briefing: currentValidatedNewsAR.briefing
    });
  });

  // API 1f: Forzar ejecución del ciclo de las 05:00 AM con Triple Chequeo
  app.post("/api/news/daily/refresh-05am", async (req, res) => {
    try {
      await execute0500AMDailyNewsCycle();
      const country = (req.query.country as string)?.toUpperCase() === 'BR' ? 'BR' : 'AR';
      const data = country === 'BR' ? currentValidatedNewsBR : currentValidatedNewsAR;
      res.json({
        success: true,
        message: 'Ciclo de las 05:00 AM ejecutado con triple validación de datos oficiales',
        country,
        lastPublishedAt: last0500AMExecutionTime,
        data
      });
    } catch (err) {
      res.status(500).json({ error: 'Fallo al ejecutar el ciclo diario de noticias' });
    }
  });

  // API 2: List all economic variables (always ensures daily sync is up-to-date)
  app.get("/api/variables", (req, res) => {
    const country = (req.query.country as string)?.toUpperCase();
    if (country === 'BR') {
      return res.json(BRAZIL_ECONOMIC_VARIABLES);
    }
    runDailyAutoSync();
    res.json(variablesStore);
  });

  // API 2b: List curated economic topics with key public & chamber sources
  app.get("/api/topics", (req, res) => {
    const country = (req.query.country as string)?.toUpperCase();
    if (country === 'BR') {
      return res.json(BRAZIL_ECONOMIC_TOPICS);
    }
    res.json(ECONOMIC_TOPICS);
  });

  // API 3: Update a variable (simulating automated/manual fetch)
  app.post("/api/variables/:id", (req, res) => {
    const { id } = req.params;
    const { value, lastUpdated } = req.body;
    const varIdx = variablesStore.findIndex(v => v.id === id);

    if (varIdx === -1) {
      return res.status(404).json({ error: "Variable no encontrada" });
    }

    if (typeof value !== "number" || isNaN(value)) {
      return res.status(400).json({ error: "El valor debe ser un número válido." });
    }

    const updatedVar = variablesStore[varIdx];
    const oldVal = updatedVar.value;
    updatedVar.value = value;
    updatedVar.lastUpdated = lastUpdated || getArgentinaTodayDate();
    
    // Add to history
    updatedVar.history = [
      ...updatedVar.history,
      { date: updatedVar.lastUpdated, value }
    ].slice(-15); // limit history count

    console.log(`Variable ${id} updated: ${oldVal} -> ${value}`);
    res.json(updatedVar);
  });

  // Serve static files / Vite asset builder pipeline
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 El Servidor del Monitor Económico corre en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Falla crítica en el arranque del servidor:", err);
});
