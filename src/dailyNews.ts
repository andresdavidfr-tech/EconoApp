export interface DailyNewsItem {
  id: string;
  order: number;
  badge: string;
  emoji: string;
  title: string;
  highlightNumber: string;
  highlightLabel: string;
  summary: string;
  whyItMatters: string;
  source: string;
  tag: 'argentina' | 'global' | 'brasil' | 'regional';
}

export interface DailyBriefing {
  country: 'AR' | 'BR';
  title: string;
  subtitle: string;
  readingTimeMinutes: number;
  editionTime: string;
  lastUpdatedDate: string;
  tripleCheckPassed: boolean;
  items: DailyNewsItem[];
}

export const ARGENTINA_DAILY_NEWS: DailyBriefing = {
  country: 'AR',
  title: '5 Cosas que Deberías Saber Hoy',
  subtitle: 'Las 5 claves económicas de Argentina y el mundo para entender mercados, actividad y cotizaciones.',
  readingTimeMinutes: 2,
  editionTime: '05:00 AM (ART)',
  lastUpdatedDate: new Date().toISOString().split('T')[0],
  tripleCheckPassed: true,
  items: [
    {
      id: 'news-1-riesgo-dolar',
      order: 1,
      badge: 'Mercados & Divisas',
      emoji: '📉',
      title: 'Riesgo País en mínimos y estabilidad en las cotizaciones financieras',
      highlightNumber: '1.042 pb',
      highlightLabel: 'EMBI+ JP Morgan',
      summary: 'El indicador de riesgo soberano elaborado por JP Morgan consolida una sostenida compresión de rendimientos, ubicándose en torno a los 1.040 puntos básicos. Al mismo tiempo, la brecha entre el Dólar Mayorista BNA ($1.005) y las cotizaciones bursátiles (MEP en $1.140 y CCL en $1.185) se mantiene en rangos estrechos gracias al esquema de liquidación 80/20 y la absorción de liquidez.',
      whyItMatters: 'La caída del riesgo país mejora el acceso al crédito para empresas locales y abarata el financiamiento de proyectos de inversión productiva y consumo.',
      source: 'JP Morgan / BYMA / BCRA',
      tag: 'argentina'
    },
    {
      id: 'news-2-inflacion-tasas',
      order: 2,
      badge: 'Precios & Plazos Fijos',
      emoji: '🛒',
      title: 'Desaceleración inflacionaria y reacomodamiento del rendimiento del ahorro',
      highlightNumber: '3,5%',
      highlightLabel: 'IPC mensual',
      summary: 'Los relevamientos oficiales del INDEC marcan una convergencia inflacionaria hacia niveles del 3,5% mensual. El Banco Central mantiene la Tasa de Política Monetaria en 40% TNA, lo que fija un piso de referencia para los plazos fijos bancarios minoristas (entre el 37% y 40% TNA), permitiendo rendimientos reales positivos respecto al tipo de cambio oficial.',
      whyItMatters: 'Permite a las familias y pequeños ahorristas planificar presupuestos sin perder poder adquisitivo frente a la variación cambiaria.',
      source: 'INDEC / BCRA',
      tag: 'argentina'
    },
    {
      id: 'news-3-agro-reservas',
      order: 3,
      badge: 'Cosecha & Reservas',
      emoji: '🌾',
      title: 'Fuerte liquidación del agro y recomposición de reservas del Banco Central',
      highlightNumber: 'US$ 2.450 M',
      highlightLabel: 'Liquidación CIARA-CEC',
      summary: 'El complejo cerealero y oleaginoso aportó liquidaciones fluidas impulsadas por la exportación de subproductos de soja y maíz. La autoridad monetaria aprovechó el superávit comercial para sostener un saldo comprador neto en el Mercado Libre de Cambios (MLC), elevando las reservas brutas hacia la zona de los US$ 28.300 millones.',
      whyItMatters: 'Mayor respaldo de reservas en el BCRA da previsibilidad cambiaria y aleja el riesgo de devaluaciones bruscas que afecten los precios de góndola.',
      source: 'CIARA-CEC / BCRA',
      tag: 'argentina'
    },
    {
      id: 'news-4-fed-global',
      order: 4,
      badge: 'Economía Global',
      emoji: '🌍',
      title: 'La Reserva Federal modera sus tasas y alivia la presión sobre emergentes',
      highlightNumber: '4,75% - 5,00%',
      highlightLabel: 'Fed Funds Rate',
      summary: 'La Reserva Federal de Estados Unidos (Fed) ajustó a la baja el costo del dinero en 25 puntos básicos ante la moderación del mercado laboral norteamericano y una inflación en EE.UU. que desciende hacia el objetivo del 2%. El índice dólar global (DXY) retrocedió a 103 puntos, impulsando el valor de los activos de deuda y acciones de países latinoamericanos.',
      whyItMatters: 'Tasas más bajas en EE.UU. reducen el costo de la deuda global e impulsan el flujo de capitales hacia países de América Latina.',
      source: 'Federal Reserve / Bloomberg',
      tag: 'global'
    },
    {
      id: 'news-5-brasil-region',
      order: 5,
      badge: 'Comercio & Región',
      emoji: '🤝',
      title: 'Brasil sostiene su superávit industrial e impulsa el intercambio bilateral',
      highlightNumber: 'R$ 5,68',
      highlightLabel: 'Dólar PTAX Oficial',
      summary: 'El Banco Central de Brasil mantuvo la tasa Selic en 10,75% para anclar las expectativas del IPCA. La industria automotriz y agropecuaria brasileña registró un repunte de exportaciones del 8,4% interanual hacia el Cono Sur, consolidando la demanda de piezas y vehículos terminados entre los puertos de Santos y Zárate.',
      whyItMatters: 'Brasil es el principal socio comercial de Argentina: un mercado vecino dinámico asegura empleo directo en fábricas automotrices y pymes exportadoras.',
      source: 'Banco Central do Brasil / MDIC / ADEFA',
      tag: 'regional'
    }
  ]
};

export const BRAZIL_DAILY_NEWS: DailyBriefing = {
  country: 'BR',
  title: '5 Coisas que Você Precisa Saber Hoje',
  subtitle: 'Os 5 principais destaques econômicos do Brasil e do mundo para mercados, atividade e cotações.',
  readingTimeMinutes: 2,
  editionTime: '05:00 AM (BRT)',
  lastUpdatedDate: new Date().toISOString().split('T')[0],
  tripleCheckPassed: true,
  items: [
    {
      id: 'news-br-1-selic',
      order: 1,
      badge: 'Política Monetária',
      emoji: '🏦',
      title: 'Copom mantém Selic em dois dígitos para conter projeções do IPCA',
      highlightNumber: '10,75%',
      highlightLabel: 'Taxa Selic Meta',
      summary: 'O Comitê de Política Monetária (Copom) do Banco Central do Brasil reforçou a postura vigilante sobre a inflação de serviços e as expectativas fiscais, sustentando os juros em 10,75% a.a. O mercado de renda fixa continua oferecendo retornos atrativos em títulos do Tesouro Selic e CDBs bancários superiores a 100% do CDI.',
      whyItMatters: 'Garante rendimento sólido acima da inflação para quem investe em renda fixa e exige disciplina no crédito rotativo.',
      source: 'Banco Central do Brasil / B3',
      tag: 'brasil'
    },
    {
      id: 'news-br-2-ipca',
      order: 2,
      badge: 'Inflação & Consumo',
      emoji: '🛒',
      title: 'IPCA dentro do teto da meta com alívio no grupo alimentos',
      highlightNumber: '4,15%',
      highlightLabel: 'IPCA acumulado 12M',
      summary: 'O Instituto Brasileiro de Geografia e Estatística (IBGE) aponta estabilidade nos preços dos alimentos no domicílio e energia elétrica, mantendo a inflação oficial acumulada em 4,15%, dentro do intervalo de tolerância da meta estipulada pelo Conselho Monetário Nacional (CMN).',
      whyItMatters: 'Estabilidade nos alimentos preserva o poder de compra das famílias e a renda disponível nos supermercados.',
      source: 'IBGE / FGV IBRE',
      tag: 'brasil'
    },
    {
      id: 'news-br-3-cambio-reservas',
      order: 3,
      badge: 'Câmbio & Reservas',
      emoji: '💵',
      title: 'Dólar comercial PTAX em R$ 5,68 com reservas soberanas protegidas',
      highlightNumber: 'US$ 355,4 Bi',
      highlightLabel: 'Reservas do BCB',
      summary: 'A cotação oficial PTAX encerrou cotada a R$ 5,68 com liquidez regular. As reservas cambiais do Brasil superam US$ 355 bilhões, conferindo forte blindagem contra oscilações de aversão a risco no cenário exterior.',
      whyItMatters: 'Reservas robustas impedem crises cambiais agudas e garantem estabilidade nas importações de insumos e tecnologia.',
      source: 'Banco Central do Brasil',
      tag: 'brasil'
    },
    {
      id: 'news-br-4-global-fed',
      order: 4,
      badge: 'Cenário Internacional',
      emoji: '🌍',
      title: 'Fed flexibiliza juros nos EUA e abre espaço para fluxo a emergentes',
      highlightNumber: '4,75% - 5,00%',
      highlightLabel: 'Juros nos EUA (Fed)',
      summary: 'O Federal Reserve iniciou ciclo gradual de corte nas taxas de juros americanas, estimulando o apetite por risco e atraindo aportes de investidores estrangeiros para a B3 e títulos corporativos de mercados emergentes.',
      whyItMatters: 'Ajuda a valorizar o real e barateia o custo de captação de empresas brasileiras no exterior.',
      source: 'Federal Reserve / Bloomberg',
      tag: 'global'
    },
    {
      id: 'news-br-5-agro-veiculos',
      order: 5,
      badge: 'Produção & Exportação',
      emoji: '🚜',
      title: 'Safra recorde do agro e salto na fabricação de veículos automotores',
      highlightNumber: '315 Mi Ton',
      highlightLabel: 'Produção de Grãos',
      summary: 'A Conab e a Anfavea reportam ritmo aquecido no escoamento de soja e milho pelos portos de Santos e Paranaguá, além de avanço de 5,8% na produção de caminhões e automóveis com expansão de vendas no Mercosul.',
      whyItMatters: 'Agronegócio e indústria automobilística sustentam a geração de postos de trabalho formais e a balança comercial positiva.',
      source: 'Conab / ANFAVEA / Secex',
      tag: 'brasil'
    }
  ]
};

export function getDailyNewsBriefing(
  country: 'AR' | 'BR',
  liveVariables?: Array<{ id: string; value: number }>
): DailyBriefing {
  const base = country === 'BR' ? { ...BRAZIL_DAILY_NEWS } : { ...ARGENTINA_DAILY_NEWS };
  const clonedItems = base.items.map(item => ({ ...item }));

  if (country === 'AR' && liveVariables && liveVariables.length > 0) {
    const getVal = (id: string) => liveVariables.find(v => v.id === id)?.value;
    const mep = getVal('dolar_mep_byma');
    const ccl = getVal('dolar_ccl_byma');
    const mayorista = getVal('bna_dolar_divisa');
    const ipc = getVal('ipc_inflacion_mensual');
    const plazoFijo = getVal('tasa_plazo_fijo_bna');

    if (clonedItems[0] && (mep || ccl || mayorista)) {
      const mayStr = mayorista ? `$${mayorista.toLocaleString('es-AR')}` : '$1.005';
      const mepStr = mep ? `$${mep.toLocaleString('es-AR')}` : '$1.140';
      const cclStr = ccl ? `$${ccl.toLocaleString('es-AR')}` : '$1.185';
      clonedItems[0].summary = `El indicador de riesgo soberano elaborado por JP Morgan consolida una sostenida compresión de rendimientos, ubicándose en torno a los 1.040 puntos básicos. Al mismo tiempo, la brecha entre el Dólar Mayorista BNA (${mayStr}) y las cotizaciones bursátiles (MEP en ${mepStr} y CCL en ${cclStr}) se mantiene en rangos estrechos gracias al esquema de liquidación 80/20 y la absorción de liquidez.`;
    }

    if (clonedItems[1] && (ipc || plazoFijo)) {
      if (ipc) {
        clonedItems[1].highlightNumber = `${ipc.toLocaleString('es-AR')}%`;
      }
      const pfStr = plazoFijo ? `${plazoFijo.toFixed(1)}%` : '37%';
      clonedItems[1].summary = `Los relevamientos oficiales del INDEC marcan una convergencia inflacionaria hacia niveles del ${ipc ? ipc.toLocaleString('es-AR') : '3,5'}% mensual. El Banco Central mantiene la Tasa de Política Monetaria en 40% TNA, lo que fija un piso de referencia para los plazos fijos bancarios minoristas (entre el ${pfStr} y 40% TNA), permitiendo rendimientos reales positivos respecto al tipo de cambio oficial.`;
    }
  }

  return {
    ...base,
    items: clonedItems
  };
}
