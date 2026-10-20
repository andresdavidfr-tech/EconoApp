import "dotenv/config";
import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ARGENTINA_ECONOMIC_VARIABLES, ECONOMIC_TOPICS } from "./src/data";
import { BRAZIL_ECONOMIC_VARIABLES, BRAZIL_ECONOMIC_TOPICS } from "./src/brazilData";
import { syncVariablesToCurrentDate, todayAR } from "./src/dailySync";
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
let lastExternalAttempt = 0;
let lastExternalSuccess: string | null = null;

const EXTERNAL_SYNC_MIN_INTERVAL_MS = 60 * 1000; // nunca más de 1 consulta externa por minuto
const FETCH_TIMEOUT_MS = 8000;

const fmtAr = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 2 });

// Mapeo casa (DolarApi) -> variable del monitor. "mayorista" se excluye a propósito:
// no equivale a la divisa minorista del BNA y mezclaba fuentes distintas.
const DOLAR_MAP: Record<string, { id: string; desc: string }> = {
  oficial: { id: "bna_dolar_billete", desc: "Cotización oficial de venta del dólar minorista en ventanilla publicada por BNA." },
  blue: { id: "dolar_blue", desc: "Cotización informal del dólar billete en el mercado libre de cambios." },
  bolsa: { id: "dolar_mep_byma", desc: "Tipo de cambio implícito en la liquidación de bonos soberanos (AL30/GD30) en BYMA." },
  contadoconliqui: { id: "dolar_ccl_byma", desc: "Cotización implícita para transferencias al exterior mediante bonos o CEDEARs registrada en BYMA." },
  tarjeta: { id: "dolar_tarjeta", desc: "Tipo de cambio para consumos en moneda extranjera con tarjeta en el exterior, incluyendo percepciones tributarias." },
  cripto: { id: "dolar_cripto", desc: "Cotización en tiempo real de paridad ARS/USDT en plataformas de activos virtuales." },
};

/**
 * Relevamiento de tipos de cambio de Argentina mediante API pública (DolarApi).
 * Con límite de frecuencia y timeout; actualiza también fecha e historial del día.
 */
async function syncExternalDollarRates(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastExternalAttempt < EXTERNAL_SYNC_MIN_INTERVAL_MS) return false;
  lastExternalAttempt = now;
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return false;
    const data = (await res.json()) as Array<{ casa: string; compra: number; venta: number }>;
    if (!Array.isArray(data)) return false;
    const today = todayAR();
    let updated = 0;
    for (const item of data) {
      const map = DOLAR_MAP[item.casa];
      if (!map || typeof item.venta !== "number" || !(item.venta > 0)) continue;
      const v = variablesStore.find(x => x.id === map.id);
      if (!v) continue;
      v.value = item.venta;
      v.lastUpdated = today;
      const last = v.history[v.history.length - 1];
      if (last && last.date === today) last.value = item.venta;
      else v.history = [...v.history, { date: today, value: item.venta }].slice(-1200);
      const compra = typeof item.compra === "number" ? `Compra: $${fmtAr(item.compra)} | ` : "";
      v.description = `${map.desc} ${compra}Venta: $${fmtAr(item.venta)}.`;
      updated++;
    }
    if (updated > 0) {
      lastExternalSuccess = new Date().toISOString();
      lastSyncTimestamp = lastExternalSuccess;
      console.log(`[Auto-Sync] ${updated} cotizaciones del dólar actualizadas con DolarApi`);
    }
    return updated > 0;
  } catch (err) {
    console.warn("[Auto-Sync] No se pudo obtener cotizaciones de DolarApi; se mantienen los últimos valores:", (err as Error).message);
    return false;
  }
}

function runDailyAutoSync(): { updatedCount: number; syncDate: string } {
  const result = syncVariablesToCurrentDate(variablesStore);
  variablesStore = result.updatedVariables;
  return { updatedCount: result.updatedCount, syncDate: result.syncDate };
}

// Sincronización inicial
syncExternalDollarRates(true).catch(() => {});

// Revisión automática periódica cada 5 minutos en segundo plano
const FIVE_MINUTES_MS = 5 * 60 * 1000;
setInterval(() => {
  syncExternalDollarRates(true).catch(() => {});
}, FIVE_MINUTES_MS);

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
    const fresh = lastExternalSuccess && Date.now() - Date.parse(lastExternalSuccess) < 15 * 60 * 1000;
    res.json({
      autoUpdate: true,
      intervalMinutes: 5,
      intervalMs: FIVE_MINUTES_MS,
      lastSyncDate: lastSyncTimestamp.split("T")[0],
      lastSyncTime: lastSyncTimestamp,
      lastExternalSuccess,
      status: fresh ? "up_to_date" : "degraded",
      totalVariables: variablesStore.length,
      frequency: "cada 5 minutos",
      sources: ["BNA", "BCRA", "INDEC", "MECON", "ARCA", "BCB", "IBGE", "B3"]
    });
  });

  // API 1c: Trigger manual sync (limitado por IP y con tope de frecuencia)
  app.post("/api/sync/trigger", async (req, res) => {
    if (rateLimited(`trigger:${req.ip}`, 6, 60 * 1000)) {
      return res.status(429).json({ error: "Demasiadas solicitudes. Probá de nuevo en un minuto." });
    }
    await syncExternalDollarRates();
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
    syncExternalDollarRates().catch(() => {}); // limitado a 1 por minuto
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
