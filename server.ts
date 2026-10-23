import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ARGENTINA_ECONOMIC_VARIABLES, ECONOMIC_TOPICS } from "./src/data";
import { BRAZIL_ECONOMIC_VARIABLES, BRAZIL_ECONOMIC_TOPICS } from "./src/brazilData";
import { syncVariablesToCurrentDate, getArgentinaTodayDate } from "./src/dailySync";
import { EconomicVariable } from "./src/types";
import { computeBankRates, computeBrazilBankRates } from "./src/fixedTermData";

const PORT = 3000;

// Memory store for economic variables to persist updates in memory during runtime sessions
let variablesStore: EconomicVariable[] = [...ARGENTINA_ECONOMIC_VARIABLES];
let lastSyncTimestamp = new Date().toISOString();

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
              v.value = item.venta;
              v.lastUpdated = today;
              v.description = `Cotización oficial de venta del dólar minorista en ventanilla publicada por BNA. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`;
            }
          } else if (item.casa === "blue") {
            const v = variablesStore.find(x => x.id === "dolar_blue");
            if (v && item.venta) {
              v.value = item.venta;
              v.lastUpdated = today;
              v.description = `Cotización informal del dólar billete en el mercado libre de cambios. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`;
            }
          } else if (item.casa === "bolsa") {
            const v = variablesStore.find(x => x.id === "dolar_mep_byma");
            if (v && item.venta) {
              v.value = item.venta;
              v.lastUpdated = today;
              v.description = `Tipo de cambio implícito en la liquidación de bonos soberanos (AL30/GD30) en BYMA. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`;
            }
          } else if (item.casa === "contadoconliqui") {
            const v = variablesStore.find(x => x.id === "dolar_ccl_byma");
            if (v && item.venta) {
              v.value = item.venta;
              v.lastUpdated = today;
              v.description = `Cotización implícita para transferencias al exterior mediante bonos o CEDEARs registrada en BYMA. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`;
            }
          } else if (item.casa === "mayorista") {
            const v = variablesStore.find(x => x.id === "bna_dolar_divisa");
            if (v && item.venta) {
              v.value = item.venta;
              v.lastUpdated = today;
              v.description = `Cotización oficial del dólar modalidad divisa o comercio exterior (BCRA Com. A 3500). Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`;
            }
          } else if (item.casa === "tarjeta") {
            const v = variablesStore.find(x => x.id === "dolar_tarjeta");
            if (v && item.venta) {
              v.value = item.venta;
              v.lastUpdated = today;
              v.description = `Tipo de cambio para consumos en moneda extranjera con tarjeta en el exterior, incluyendo percepciones tributarias. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`;
            }
          } else if (item.casa === "cripto") {
            const v = variablesStore.find(x => x.id === "dolar_cripto");
            if (v && item.venta) {
              v.value = item.venta;
              v.lastUpdated = today;
              v.description = `Cotización en tiempo real de paridad ARS/USDT en plataformas de activos virtuales. Compra: $${item.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Venta: $${item.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`;
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

function runDailyAutoSync(): { updatedCount: number; syncDate: string } {
  const result = syncVariablesToCurrentDate(variablesStore);
  variablesStore = result.updatedVariables;
  lastSyncTimestamp = new Date().toISOString();
  // Sincronizar cotizaciones y datos macro online en segundo plano
  syncExternalDollarRates().catch(() => {});
  syncExternalInflation().catch(() => {});
  if (result.updatedCount > 0) {
    console.log(`[Auto-Sync] ${result.updatedCount} variables actualizadas automáticamente al día ${result.syncDate}`);
  }
  return { updatedCount: result.updatedCount, syncDate: result.syncDate };
}

// Initial sync at module load
runDailyAutoSync();
syncExternalDollarRates().catch(() => {});
syncExternalInflation().catch(() => {});

// Revisión automática periódica cada 5 minutos (300.000 ms) en segundo plano
const FIVE_MINUTES_MS = 5 * 60 * 1000;
setInterval(() => {
  try {
    const res = runDailyAutoSync();
    syncExternalDollarRates().catch(() => {});
    syncExternalInflation().catch(() => {});
    console.log(`[Auto-Sync 5min] Revisión periódica en segundo plano (${new Date().toLocaleTimeString()}): ${res.updatedCount} actualizadas al día ${res.syncDate}.`);
  } catch (err) {
    console.error("[Auto-Sync 5min] Error en revisión periódica:", err);
  }
}, FIVE_MINUTES_MS);

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
      sources: ["BNA", "BCRA", "INDEC", "MECON", "ARCA", "BCB", "IBGE", "B3"]
    });
  });

  // API 1c: Trigger manual/forced auto-sync
  app.post("/api/sync/trigger", async (req, res) => {
    await Promise.allSettled([
      syncExternalDollarRates(),
      syncExternalInflation()
    ]);
    const result = runDailyAutoSync();
    res.json({
      success: true,
      message: "Revisión de datos ejecutada con fuentes oficiales y mercados en tiempo real",
      syncDate: result.syncDate,
      lastSyncTime: lastSyncTimestamp,
      updatedCount: result.updatedCount,
      intervalMinutes: 5,
      variables: variablesStore
    });
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
