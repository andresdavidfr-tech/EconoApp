// Simula las APIs oficiales para probar el servidor sin red. Uso:
//   node --import ./scripts/mock-fetch.mjs dist/server.cjs
const real = globalThis.fetch;
const json = (o) => new Response(JSON.stringify(o), { status: 200, headers: { 'content-type': 'application/json' } });
const html = (t) => new Response(t, { status: 200, headers: { 'content-type': 'text/html' } });
globalThis.fetch = async (input, init) => {
  const url = String(input?.url ?? input);
  const det = url.match(/monetarias\/(\d+)\?/);
  if (det) {
    const base = { 1: 29100, 7: 38.9, 31: 1161.4, 30: 460.2, 40: 13.9 }[det[1]] ?? 1;
    const end = det[1] === '1' || det[1] === '7' || det[1] === '40' ? '2026-10-19' : '2026-10-20';
    return json({ results: Array.from({ length: 60 }, (_, i) => ({ idVariable: Number(det[1]), fecha: new Date(Date.parse(end) - (59 - i) * 86400000).toISOString().slice(0, 10), valor: Number((base * (1 - (59 - i) * 0.0005)).toFixed(4)) })) });
  }
  if (url.includes('api.bcra.gob.ar/estadisticas/v3.0/monetarias')) return json({ results: [
    { idVariable: 1, descripcion: 'Reservas Internacionales del BCRA (en millones de dólares)', ultValorInformado: 29100, ultFechaInformada: '2026-10-19' },
    { idVariable: 7, descripcion: 'BADLAR en pesos de bancos privados (en % n.a.)', ultValorInformado: 38.9, ultFechaInformada: '2026-10-19' },
    { idVariable: 31, descripcion: 'Unidad de Valor Adquisitivo (UVA)', ultValorInformado: 1161.4, ultFechaInformada: '2026-10-20' },
    { idVariable: 32, descripcion: 'Unidad de Vivienda (UVI)', ultValorInformado: 999999, ultFechaInformada: '2026-10-20' },
    { idVariable: 30, descripcion: 'Coeficiente de Estabilización de Referencia (CER)', ultValorInformado: 460.2, ultFechaInformada: '2026-10-20' },
    { idVariable: 40, descripcion: 'Índice para Contratos de Locación (ICL)', ultValorInformado: 13.9, ultFechaInformada: '2026-10-19' },
  ]});
  if (url.includes('apis.datos.gob.ar') && url.includes('148.3_INIVELNAL_DICI_M_26'))
    return json({ data: Array.from({ length: 25 }, (_, i) => { const d = new Date(Date.UTC(2024, 8 + i, 1)); return [d.toISOString().slice(0, 10), Number((8000 * Math.pow(1.024, i)).toFixed(2))]; }) });
  if (url.includes('apis.datos.gob.ar') && url.includes('143.3_NO_PR_2004_A_21'))
    return json({ data: Array.from({ length: 37 }, (_, i) => { const d = new Date(Date.UTC(2023, 8 + i, 1)); return [d.toISOString().slice(0, 10), Number((150 + i * 0.6).toFixed(2))]; }) });
  if (url.includes('bna.com.ar/Cotizador/Monedasv2'))
    return html('<table><tr><td class="tit">Dolar U.S.A</td><td>1.520,00</td><td>1.570,00</td></tr></table>');
  if (url.includes('bna.com.ar/Cotizador/Divisasv2'))
    return html('<table><tr><td class="tit">Dolar U.S.A</td><td>1500,50</td><td>1520,50</td></tr></table>');
  if (url.includes('dolarapi.com')) return json([
    { casa: 'oficial', compra: 1500, venta: 1550 }, { casa: 'blue', compra: 1530, venta: 1565 },
    { casa: 'bolsa', compra: 1535, venta: 1545 }, { casa: 'contadoconliqui', compra: 1600, venta: 1620 },
    { casa: 'tarjeta', compra: 1900, venta: 2015 }, { casa: 'cripto', compra: 1600, venta: 1630 },
    { casa: 'mayorista', compra: 1480, venta: 1490 } ]);
  return real(input, init);
};
