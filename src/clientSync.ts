import { EconomicVariable } from './types';
import { ARGENTINA_ECONOMIC_VARIABLES } from './data';
import { BRAZIL_ECONOMIC_VARIABLES } from './brazilData';
import { computeBankRates, computeBrazilBankRates } from './fixedTermData';
import { syncVariablesToCurrentDate, getArgentinaTodayDate } from './dailySync';

interface DolarItem {
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion?: string;
}

interface AmbitoRiesgo {
  valor?: number;
  fecha?: string;
}

/**
 * Universal Data Fetcher:
 * Works seamlessly in both full-stack Node environments and static Vercel deployments.
 * If backend /api/ endpoints fail (e.g. static Vercel hosting), seamlessly falls back
 * to direct client-side fetching from public official APIs + live date synchronization.
 */
export async function fetchUniversalVariables(country: 'AR' | 'BR'): Promise<EconomicVariable[]> {
  const baseVars = country === 'BR' ? BRAZIL_ECONOMIC_VARIABLES : ARGENTINA_ECONOMIC_VARIABLES;

  // 1. Try local Express backend API
  try {
    const res = await fetch(`/api/variables?country=${country}`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return syncVariablesToCurrentDate(data).updatedVariables;
      }
    }
  } catch {
    // Backend API unavailable (e.g. running on Vercel static build)
  }

  // 2. Direct client-side live fetch for Argentina
  if (country === 'AR') {
    try {
      const cloned = JSON.parse(JSON.stringify(baseVars)) as EconomicVariable[];
      const todayStr = getArgentinaTodayDate();

      const [dolarRes, riesgoRes] = await Promise.allSettled([
        fetch('https://dolarapi.com/v1/dolares', { signal: AbortSignal.timeout(5000) }),
        fetch('https://dolarapi.com/v1/ambito/riesgo-pais', { signal: AbortSignal.timeout(5000) })
      ]);

      if (dolarRes.status === 'fulfilled' && dolarRes.value.ok) {
        const dolares: DolarItem[] = await dolarRes.value.json();

        const updateVar = (id: string, venta: number, compra?: number) => {
          const v = cloned.find(item => item.id === id);
          if (v && venta > 0) {
            const prev = v.value;
            v.value = venta;
            v.lastUpdated = todayStr;
            v.prevPublishedValue = prev;
            v.change = Number((venta - prev).toFixed(2));
            v.changePercent = prev > 0 ? Number((((venta - prev) / prev) * 100).toFixed(2)) : 0;
            if (Array.isArray(v.history) && v.history.length > 0) {
              const lastPt = v.history[v.history.length - 1];
              if (lastPt.date === todayStr) {
                lastPt.value = venta;
              } else {
                v.history.push({ date: todayStr, value: venta });
              }
            }
          }
        };

        const oficial = dolares.find(d => d.casa === 'oficial');
        const blue = dolares.find(d => d.casa === 'blue');
        const mep = dolares.find(d => d.casa === 'bolsa' || d.casa === 'mep');
        const ccl = dolares.find(d => d.casa === 'contadoconliqui' || d.casa === 'ccl');
        const mayorista = dolares.find(d => d.casa === 'mayorista');
        const tarjeta = dolares.find(d => d.casa === 'tarjeta');
        const cripto = dolares.find(d => d.casa === 'cripto');

        if (oficial) updateVar('bna_dolar_billete', oficial.venta, oficial.compra);
        if (blue) updateVar('dolar_blue', blue.venta, blue.compra);
        if (mep) updateVar('dolar_mep_byma', mep.venta, mep.compra);
        if (ccl) updateVar('dolar_ccl_byma', ccl.venta, ccl.compra);
        if (mayorista) updateVar('bna_dolar_divisa', mayorista.venta, mayorista.compra);
        if (tarjeta) updateVar('dolar_tarjeta', tarjeta.venta, tarjeta.compra);
        if (cripto) updateVar('dolar_cripto', cripto.venta, cripto.compra);
      }

      if (riesgoRes.status === 'fulfilled' && riesgoRes.value.ok) {
        const riesgo: AmbitoRiesgo = await riesgoRes.value.json();
        if (riesgo && typeof riesgo.valor === 'number' && riesgo.valor > 0) {
          const v = cloned.find(item => item.id === 'riesgo_pais_embi');
          if (v) {
            const prev = v.value;
            v.value = Math.round(riesgo.valor);
            v.lastUpdated = todayStr;
            v.prevPublishedValue = prev;
            v.change = Math.round(v.value - prev);
            v.changePercent = prev > 0 ? Number((((v.value - prev) / prev) * 100).toFixed(2)) : 0;
            if (Array.isArray(v.history) && v.history.length > 0) {
              const lastPt = v.history[v.history.length - 1];
              if (lastPt.date === todayStr) {
                lastPt.value = v.value;
              } else {
                v.history.push({ date: todayStr, value: v.value });
              }
            }
          }
        }
      }

      // Sincronización cliente con APIs oficiales del BCRA (vía proxy o directo)
      try {
        let bcraData: any = null;
        try {
          const bRes = await fetch('/api/bcra/monetarias', { signal: AbortSignal.timeout(3500) });
          if (bRes.ok) {
            bcraData = await bRes.json();
          }
        } catch {
          try {
            const bDirect = await fetch('https://api.bcra.gob.ar/estadisticas/v4.0/monetarias', { signal: AbortSignal.timeout(3500) });
            if (bDirect.ok) {
              bcraData = await bDirect.json();
            }
          } catch {}
        }

        const results: Array<{ idVariable: number; ultFechaInformada: string; ultValorInformado: number }> =
          Array.isArray(bcraData?.results) ? bcraData.results : [];

        if (results.length > 0) {
          const applyBcraItem = (idVar: number, variableId: string) => {
            const hit = results.find(r => r.idVariable === idVar);
            if (hit && typeof hit.ultValorInformado === 'number' && hit.ultValorInformado > 0) {
              const v = cloned.find(x => x.id === variableId);
              if (v) {
                const prev = v.prevPublishedValue || v.value;
                v.value = hit.ultValorInformado;
                v.lastUpdated = hit.ultFechaInformada || todayStr;
                v.change = Number((v.value - prev).toFixed(2));
                v.changePercent = prev > 0 ? Number(((v.change / prev) * 100).toFixed(2)) : 0;
                v.source = 'BCRA';
                v.sourceUrl = 'https://www.bcra.gob.ar/apis-banco-central/';
                v.comparisonLabel = 'vs. rueda anterior BCRA';
              }
            }
          };

          applyBcraItem(1, 'reservas_brutas');
          applyBcraItem(5, 'bna_dolar_divisa');
          applyBcraItem(31, 'valor_uva');
          applyBcraItem(30, 'coeficiente_cer');
          applyBcraItem(40, 'indice_icl');
          applyBcraItem(7, 'tasa_badlar');
          applyBcraItem(27, 'ipc_inflacion_mensual');
          applyBcraItem(29, 'rem_inflacion_esperada');
        }
      } catch {
        // Contingencia silenciosa: conserva valores calibrados
      }

      return syncVariablesToCurrentDate(cloned).updatedVariables;
    } catch {
      // Fallback to locally synced variables
      return syncVariablesToCurrentDate(baseVars).updatedVariables;
    }
  }

  // Brazil fallback
  return syncVariablesToCurrentDate(baseVars).updatedVariables;
}

export async function fetchUniversalBankRates(country: 'AR' | 'BR') {
  try {
    const res = await fetch(`/api/plazos-fijos?country=${country}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.rates) return data.rates;
    }
  } catch {
    // ignore
  }

  return country === 'BR' ? computeBrazilBankRates() : computeBankRates();
}
