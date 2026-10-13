import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { ARGENTINA_ECONOMIC_VARIABLES } from "./src/data";
import { syncVariablesToCurrentDate } from "./src/dailySync";
import { EconomicVariable } from "./src/types";
import { computeBankRates } from "./src/fixedTermData";

const PORT = 3000;

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

function runDailyAutoSync(): { updatedCount: number; syncDate: string } {
  const result = syncVariablesToCurrentDate(variablesStore);
  variablesStore = result.updatedVariables;
  lastSyncTimestamp = new Date().toISOString();
  if (result.updatedCount > 0) {
    console.log(`[Auto-Sync] ${result.updatedCount} variables actualizadas automáticamente al día ${result.syncDate}`);
  }
  return { updatedCount: result.updatedCount, syncDate: result.syncDate };
}

// Initial sync at module load
runDailyAutoSync();

// Hourly automated cron-style check
setInterval(() => {
  try {
    runDailyAutoSync();
  } catch (err) {
    console.error("[Auto-Sync] Error en actualización periódica:", err);
  }
}, 30 * 60 * 1000);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API 1b: Sync Status & Configuration
  app.get("/api/sync/status", (req, res) => {
    const today = new Date().toISOString().split("T")[0];
    res.json({
      autoUpdate: true,
      lastSyncDate: today,
      lastSyncTime: lastSyncTimestamp,
      status: "up_to_date",
      totalVariables: variablesStore.length,
      frequency: "diaria",
      sources: ["BNA", "BCRA", "INDEC", "MECON", "ARCA"]
    });
  });

  // API 1c: Trigger manual/forced auto-sync
  app.post("/api/sync/trigger", (req, res) => {
    const result = runDailyAutoSync();
    res.json({
      success: true,
      message: "Actualización diaria ejecutada correctamente",
      syncDate: result.syncDate,
      updatedCount: result.updatedCount,
      variables: variablesStore
    });
  });

  // API 1d: List comparative electronic personal fixed-term deposit rates of main banks
  app.get("/api/plazos-fijos", (req, res) => {
    const today = new Date().toISOString().split("T")[0];
    res.json({
      lastUpdated: today,
      source: "BCRA (Tabla Comparativa de Tasas de Plazo Fijo en Pesos para Personas Humanas)",
      rates: computeBankRates(today)
    });
  });

  // API 2: List all economic variables (always ensures daily sync is up-to-date)
  app.get("/api/variables", (req, res) => {
    runDailyAutoSync();
    res.json(variablesStore);
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
    updatedVar.lastUpdated = lastUpdated || new Date().toISOString().split('T')[0];
    
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
    const { message, previousMessages } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensaje vacío." });
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
Tu tarea es analizar variables, dar respuestas basadas puramente en datos públicos e institucionales fidegnos de la República Argentina (principalmente del INDEC, BCRA, MECON y ARCA/AFIP).
Tienes a tu disposición las variables actualmente configuradas en el monitor del usuario:
${listSummary}

REGLAS CRÍTICAS:
1. Foco Legal Obligatorio: En todas tus respuestas que involucren análisis de datos de personas físicas o análisis médico/económico, respeta estrictamente los estándares de las leyes argentinas (Ley 25.326 de Protección de Datos Personales y Ley 26.529 de Derechos del Paciente). Nunca expongas datos clínicos imaginados o reales sin las directivas de seguridad oportunas.
2. Formato impecable: Escribe en Markdown de forma sintetizada, profesional, estructurada y en español.
3. Búsqueda y Validación: Utiliza la herramienta de búsqueda de Google (Grounding) para obtener los informes de inflación (IPC), tipo de cambio y tasas actuales si el usuario pregunta por datos del día de hoy u otros indicadores macro más recientes. Compara amablemente la información si hay discrepancia.
4. Queda estrictamente prohibido usar fuentes de terceros, portales de noticias sesgados o cotizaciones informales. Si el usuario te pregunta por cotizaciones financieras libres (Dólar MEP, CCL, etc.), aclara que son cotizaciones bursátiles de mercado regulado, pero prioriza siempre la Comunicación A 3500 del BCRA para dólar oficial.

Responde de forma clara y amigable en español argentino institucional de negocios. Estructura con negritas, listas y llamadas útiles.`;

      // Structure conversation history for Gemini generateContent
      const contents = [];
      
      if (previousMessages && Array.isArray(previousMessages)) {
        for (const msg of previousMessages) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }
      
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      console.log(`Calling Gemini with message length ${message.length}, history size: ${contents.length - 1}`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
