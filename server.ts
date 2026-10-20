import "dotenv/config";
import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ARGENTINA_ECONOMIC_VARIABLES, ECONOMIC_TOPICS } from "./src/data";
import { BRAZIL_ECONOMIC_VARIABLES, BRAZIL_ECONOMIC_TOPICS } from "./src/brazilData";
import { syncVariablesToCurrentDate, todayAR } from "./src/dailySync";
import { fetchBcra, fetchBna, fetchDolarApi, fetchIndec, LiveValue } from "./src/liveSources";
import { EconomicVariable } from "./src/types";
import { computeBankRates, computeBrazilBankRates } from "./src/fixedTermData";

const PORT = Number(process.env.PORT) || 3000;

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in environment variables. AI operations on server will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Memory store for economic variables to persist updates in memory during runtime sessions
let variablesStore: EconomicVariable[] = [...ARGENTINA_ECONOMIC_VARIABLES];
let lastSyncTimestamp = new Date().toISOString();

type SourceName = "bna" | "dolarapi" | "bcra" | "indec";
interface SourceState { lastAttempt: number; lastSuccess: string | null; lastError: string | null; updated: number; }

// Frecuencia mínima de consulta por fuente: cotizaciones 5 min, BCRA 30 min, INDEC 6 h
const SOURCE_TTL_MS: Record<SourceName, number> = {
  bna: 5 * 60 * 1000,
  dolarapi: 5 * 60 * 1000,
  bcra: 30 * 60 * 1000,
  indec: 6 * 60 * 60 * 1000,
};
const sourceState: Record<SourceName, SourceState> = {
  bna: { lastAttempt: 0, lastSuccess: null, lastError: null, updated: 0 },
  dolarapi: { lastAttempt: 0, lastSuccess: null, lastError: null, updated: 0 },
  bcra: { lastAttempt: 0, lastSuccess: null, lastError: null, updated: 0 },
  indec: { lastAttempt: 0, lastSuccess: null, lastError: null, updated: 0 },
};
const inFlight = new Set<SourceName>();

const fmtAr = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 2 });

function plausible(oldVal: number, newVal: number, tol: number | null | undefined): boolean {
  if (tol == null) return true; // el conector ya validó el rango
  if (!(oldVal > 0)) return true;
  return Math.abs(newVal / oldVal - 1) <= tol;
}

/** Aplica un valor obtenido de una fuente. Nunca retrocede en el tiempo ni acepta valores fuera de rango. */
function applyLive(r: LiveValue, source: SourceName): boolean {
  const v = variablesStore.find(x => x.id === r.id);
  if (!v) return false;
  if (!Number.isFinite(r.value) || !plausible(v.value, r.value, r.tol)) {
    console.warn(`[Sync:${source}] ${r.id}: valor ${r.value} descartado (fuera de rango respecto de ${v.value})`);
    return false;
  }
  const last = v.history[v.history.length - 1];
  if (r.history && r.history.length >= 3) {
    // La fuente entrega la serie real: reemplaza a la cargada a mano (que podía tener puntos proyectados)
    v.history = r.history.slice(-1200);
  } else {
    if (last && r.date < last.date.slice(0, 10)) return false; // dato más viejo que el que ya tenemos
    if (last && last.date.slice(0, 10) === r.date) last.value = r.value;
    else v.history = [...v.history, { date: r.date, value: r.value }].slice(-1200);
  }
  v.value = r.value;
  v.lastUpdated = r.date;
  v.live = true;
  v.fetchedAt = new Date().toISOString();
  if (r.extra?.compra != null) {
    v.description = v.description.replace(/\s*Compra: \$[^|]*\|\s*Venta: \$[\d.,]+\.?/, "").trim();
    v.description = `${v.description} Compra: $${fmtAr(r.extra.compra)} | Venta: $${fmtAr(r.value)}.`;
  }
  return true;
}

async function refreshSource(name: SourceName, force = false): Promise<void> {
  const st = sourceState[name];
  const now = Date.now();
  if (inFlight.has(name) || (!force && now - st.lastAttempt < SOURCE_TTL_MS[name])) return;
  inFlight.add(name);
  st.lastAttempt = now;
  try {
    const today = todayAR();
    let values: LiveValue[] = [];
    if (name === "bna") values = await fetchBna(today);
    else if (name === "bcra") values = await fetchBcra(today);
    else if (name === "indec") values = await fetchIndec();
    else {
      // Si el BNA respondió hace poco, su cotización oficial tiene prioridad sobre la de DolarApi
      const bnaFresh = sourceState.bna.lastSuccess && now - Date.parse(sourceState.bna.lastSuccess) < 15 * 60 * 1000;
      values = await fetchDolarApi(today, new Set(bnaFresh ? ["bna_dolar_billete"] : []));
    }
    const applied = values.filter(v => applyLive(v, name)).length;
    st.updated = applied;
    st.lastError = applied === 0 ? "Datos recibidos pero descartados por validación" : null;
    if (applied > 0) {
      st.lastSuccess = new Date().toISOString();
      lastSyncTimestamp = st.lastSuccess;
      console.log(`[Sync:${name}] ${applied} variables actualizadas`);
    }
  } catch (err) {
    st.lastError = (err as Error).message;
    console.warn(`[Sync:${name}] falló: ${st.lastError}. Se conservan los últimos valores.`);
  } finally {
    inFlight.delete(name);
  }
}

async function refreshAll(force = false): Promise<void> {
  // El BNA va primero para poder darle prioridad sobre DolarApi
  await refreshSource("bna", force);
  await Promise.allSettled([
    refreshSource("dolarapi", force),
    refreshSource("bcra", force),
    refreshSource("indec", force),
  ]);
}

function runDailyAutoSync(): { updatedCount: number; syncDate: string } {
  const result = syncVariablesToCurrentDate(variablesStore);
  variablesStore = result.updatedVariables;
  return { updatedCount: result.updatedCount, syncDate: result.syncDate };
}

// Sincronización inicial y revisión periódica cada 5 minutos (cada fuente respeta su propio intervalo)
const FIVE_MINUTES_MS = 5 * 60 * 1000;
refreshAll(true).catch(() => {});
setInterval(() => { refreshAll().catch(() => {}); }, FIVE_MINUTES_MS);

// --- Utilidades de seguridad ---
const rateBuckets = new Map<string, number[]>();
function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (rateBuckets.get(key) || []).filter(t => now - t < windowMs);
  if (hits.length >= max) {
    rateBuckets.set(key, hits);
    return true;
  }
  hits.push(now);
  rateBuckets.set(key, hits);
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, hits] of rateBuckets) {
    if (!hits.some(t => now - t < 10 * 60 * 1000)) rateBuckets.delete(k);
  }
}, 10 * 60 * 1000).unref();

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_MESSAGES = 6;

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "100kb" }));

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API 1b: Sync Status & Configuration
  app.get("/api/sync/status", (req, res) => {
    const liveCount = variablesStore.filter(v => v.live).length;
    const anyFresh = Object.values(sourceState).some(
      st => st.lastSuccess && Date.now() - Date.parse(st.lastSuccess) < 15 * 60 * 1000
    );
    res.json({
      autoUpdate: true,
      intervalMinutes: 5,
      intervalMs: FIVE_MINUTES_MS,
      lastSyncDate: lastSyncTimestamp.split("T")[0],
      lastSyncTime: lastSyncTimestamp,
      status: anyFresh ? "up_to_date" : "degraded",
      totalVariables: variablesStore.length,
      liveVariables: liveCount,
      staticVariables: variablesStore.length - liveCount,
      sources: sourceState,
      frequency: "cada 5 minutos"
    });
  });

  // API 1c: Trigger manual sync (limitado por IP y con tope de frecuencia)
  app.post("/api/sync/trigger", async (req, res) => {
    if (rateLimited(`trigger:${req.ip}`, 6, 60 * 1000)) {
      return res.status(429).json({ error: "Demasiadas solicitudes. Probá de nuevo en un minuto." });
    }
    await refreshAll(true);
    const result = runDailyAutoSync();
    res.json({
      success: true,
      message: "Revisión de datos ejecutada",
      syncDate: result.syncDate,
      lastSyncTime: lastSyncTimestamp,
      updatedCount: result.updatedCount,
      intervalMinutes: 5,
      variables: variablesStore
    });
  });

  // API 1d: List comparative electronic personal fixed-term deposit rates of main banks
  app.get("/api/plazos-fijos", (req, res) => {
    const today = new Date().toISOString().split("T")[0];
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
    refreshAll().catch(() => {}); // cada fuente respeta su intervalo mínimo
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
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || req.header("x-admin-token") !== adminToken) {
      return res.status(403).json({ error: "No autorizado." });
    }
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
    updatedVar.lastUpdated = lastUpdated || todayAR();
    
    // Add to history
    updatedVar.history = [
      ...updatedVar.history,
      { date: updatedVar.lastUpdated, value }
    ].slice(-15); // limit history count

    console.log(`Variable ${id} updated: ${oldVal} -> ${value}`);
    res.json(updatedVar);
  });

  // API 4: Gemini Economic Advisor with Search Grounding
  app.post("/api/gemini/advisor", async (req, res) => {
    const { message, previousMessages } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Mensaje vacío.", text: "El mensaje está vacío." });
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return res.status(413).json({ error: "Mensaje demasiado largo.", text: `El mensaje supera los ${MAX_MESSAGE_CHARS} caracteres.` });
    }
    if (rateLimited(`advisor:${req.ip}`, 10, 60 * 1000)) {
      return res.status(429).json({ error: "Límite de consultas.", text: "Hiciste demasiadas consultas seguidas. Esperá un minuto e intentá de nuevo." });
    }

    try {
      const ai = getGeminiClient();
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ 
          error: "API Key de Gemini no disponible en Settings > Secrets.",
          text: "Lo siento, la clave de API de Gemini no está configurada aún en esta instancia. Por favor, agregá una 'GEMINI_API_KEY' válida en la sección de Secretos." 
        });
      }

      // Construction of context prompt with current variable store in the platform
      const listSummary = variablesStore.map(v => 
        `- **${v.name}** [${v.id}]: ${v.value} ${v.unit} (Última actualización: ${v.lastUpdated}, Fuente: ${v.source})`
      ).join("\n");

      const systemPrompt = `Eres un Economista y Consultor Senior experto en Macroeconomía Argentina.
Tu tarea es analizar variables y brindar respuestas basadas EXCLUSIVAMENTE en datos públicos e institucionales fidedignos de la República Argentina (principalmente del Banco Central de la República Argentina - BCRA, Banco de la Nación Argentina - BNA, e INDEC).

Tienes a tu disposición las variables económicas oficiales vigentes en el monitor del usuario al ${todayAR()}:
${listSummary}

DIRECTIVAS CRÍTICAS Y OBLIGATORIAS:
1. PROHIBICIÓN ABSOLUTA DE INVENTAR VALORES: Tomas estrictamente los datos tal como figuran en las fuentes oficiales (BCRA, BNA, INDEC). Nunca estimes o inventes números no publicados.
2. EL DÓLAR MAYORISTA FUE REMOVIDO: No lo menciones como variable principal de cotización del usuario.
3. LA TASA DE POLÍTICA MONETARIA FUE REMOVIDA: No la utilices como tasa de referencia del monitor.
4. UTILIZA EL REM DEL BCRA: Incorpora siempre el Relevamiento de Expectativas de Mercado (REM) publicado por el BCRA (mediana de inflación esperada mensual y anual) cuando analices inflación o proyecciones.
5. COTIZACIONES BNA: Prioriza siempre el Dólar Minorista Billete y Dólar Minorista Divisa publicados por el Banco de la Nación Argentina (BNA).
6. COMPARATIVO DE PLAZOS FIJOS: Utiliza la Tabla Comparativa oficial del BCRA del Régimen de Transparencia de Plazos Fijos para Personas Humanas.
7. Foco Legal: Respeta los principios de la Ley 25.326 de Protección de Datos Personales.
8. Formato: Escribe en Markdown de forma sintetizada, profesional, estructurada y en español rioplatense institucional.`;

      // Structure conversation history for Gemini generateContent
      const contents: { role: string; parts: { text: string }[] }[] = [];
      
      if (Array.isArray(previousMessages)) {
        for (const msg of previousMessages.slice(-MAX_HISTORY_MESSAGES)) {
          // Acepta {sender,text} o {role,parts:[{text}]}
          const text: unknown = msg?.text ?? msg?.parts?.[0]?.text;
          if (typeof text !== "string" || !text.trim()) continue;
          const isUser = msg?.sender ? msg.sender === "user" : msg?.role === "user";
          // El historial debe empezar con un turno del usuario
          if (contents.length === 0 && !isUser) continue;
          contents.push({
            role: isUser ? "user" : "model",
            parts: [{ text: text.slice(0, MAX_MESSAGE_CHARS) }]
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      console.log(`Calling Gemini with message length ${message.length}, history size: ${contents.length - 1}`);

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          tools: [{ googleSearch: {} }],
        }
      });

      const responseText = response.text || "No se pudo recuperar una respuesta analítica de la IA.";
      
      // Extract links/sources from grounding metadata if any
      const sources: { title: string; uri: string }[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks)) {
        chunks.forEach((c: any) => {
          if (c.web?.uri) {
            sources.push({
              title: c.web.title || "Fuente oficial argentina",
              uri: c.web.uri
            });
          }
        });
      }

      res.json({
        text: responseText,
        reply: responseText,
        sources: sources
      });

    } catch (err: any) {
      console.error("Error in /api/gemini/advisor:", err);
      res.status(500).json({ 
        error: "Error interno procesando la consulta con la IA",
        text: `Hubo un error contactando al asesor económico inteligente. Código de error: ${err.message || 'Desconocido'}`
      });
    }
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
