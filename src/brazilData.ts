import { EconomicVariable, EconomicTopic, TopicSource } from './types';
import { createHistoricalSeries } from './data';

/**
 * Catálogo de Fontes Públicas e Câmaras Setoriais do Brasil
 */
export const BRAZIL_SOURCES: Record<string, TopicSource> = {
  bcb: {
    id: 'bcb',
    name: 'BCB',
    fullName: 'Banco Central do Brasil',
    type: 'publica',
    scope: 'Autoridade monetária oficial e supervisão do SFN',
    role: 'Taxa Selic Meta, Cotações PTAX oficiais, Reservas Internacionais e IBC-Br',
    url: 'https://www.bcb.gov.br'
  },
  ibge: {
    id: 'ibge',
    name: 'IBGE',
    fullName: 'Instituto Brasileiro de Geografia e Estatística',
    type: 'publica',
    scope: 'Estatísticas oficiais nacionais e censitárias',
    role: 'IPCA (Inflação oficial), INPC, Pesquisa Industrial Mensal (PIM) e PMC Varejo',
    url: 'https://www.ibge.gov.br'
  },
  fgv: {
    id: 'fgv',
    name: 'FGV IBRE',
    fullName: 'Fundação Getulio Vargas - Instituto Brasileiro de Economia',
    type: 'camara',
    scope: 'Pesquisa econômica independente e índices de preços',
    role: 'IGP-M (Índice Geral de Preços do Mercado), IPC-S e Sondagens Empresariais',
    url: 'https://ibre.fgv.br'
  },
  b3: {
    id: 'b3',
    name: 'B3',
    fullName: 'Brasil, Bolsa, Balcão S.A.',
    type: 'camara',
    scope: 'Bolsa de valores e infraestrutura de mercado financeiro',
    role: 'Taxa DI / CDI Over, liquidação de derivativos e fluxo cambial financeiro',
    url: 'https://www.b3.com.br'
  },
  tesouro: {
    id: 'tesouro',
    name: 'Tesouro Nacional',
    fullName: 'Secretaria do Tesouro Nacional - Ministério da Fazenda',
    type: 'publica',
    scope: 'Gestão da dívida pública federal e finanças soberanas',
    role: 'Títulos públicos federais Tesouro Direto (Tesouro Selic, Prefixado, IPCA+)',
    url: 'https://www.tesourodireto.com.br'
  },
  anfavea: {
    id: 'anfavea',
    name: 'ANFAVEA',
    fullName: 'Associação Nacional dos Fabricantes de Veículos Automotores',
    type: 'camara',
    scope: 'Indústria automobilística e cadeia produtiva automotiva',
    role: 'Produção física de autoveículos, licenciamentos e exportações',
    url: 'https://anfavea.com.br'
  },
  ccee: {
    id: 'ccee',
    name: 'CCEE',
    fullName: 'Câmara de Comercialização de Energia Elétrica',
    type: 'camara',
    scope: 'Operação do mercado de eletricidade e geração no SIN',
    role: 'Demanda de carga e consumo de energia elétrica no Sistema Interligado Nacional',
    url: 'https://www.ccee.org.br'
  },
  cni: {
    id: 'cni',
    name: 'CNI',
    fullName: 'Confederação Nacional da Indústria',
    type: 'camara',
    scope: 'Representação da indústria brasileira de transformação e base',
    role: 'Utilização da Capacidade Instalada (UCI) e Sondagem Industrial',
    url: 'https://www.portaldaindustria.com.br/cni'
  },
  cnc: {
    id: 'cnc',
    name: 'CNC',
    fullName: 'Confederação Nacional do Comércio de Bens, Serviços e Turismo',
    type: 'camara',
    scope: 'Comércio varejista, atacadista e setor de serviços',
    role: 'Índice de Confiança do Consumidor (ICC) e Intenção de Consumo das Famílias',
    url: 'https://portaldocomercio.org.br'
  },
  abras: {
    id: 'abras',
    name: 'ABRAS',
    fullName: 'Associação Brasileira de Supermercados',
    type: 'camara',
    scope: 'Setor de autosserviço alimentar e supermercados no Brasil',
    role: 'Índice Nacional de Consumo nos Lares Brasileiros e vendas reais do setor',
    url: 'https://www.abras.com.br'
  },
  fenabrave: {
    id: 'fenabrave',
    name: 'FENABRAVE',
    fullName: 'Federação Nacional da Distribuição de Veículos Automotores',
    type: 'camara',
    scope: 'Rede de concessionárias e distribuição de veículos',
    role: 'Estatísticas mensais de emplacamento de automóveis, comerciais e caminhões',
    url: 'https://www.fenabrave.org.br'
  },
  dieese: {
    id: 'dieese',
    name: 'DIEESE',
    fullName: 'Departamento Intersindical de Estatística e Estudos Socioeconômicos',
    type: 'camara',
    scope: 'Pesquisa econômica do trabalho e custo de vida',
    role: 'Pesquisa Nacional da Cesta Básica de Alimentos nas capitais brasileiras',
    url: 'https://www.dieese.org.br'
  },
  abracam: {
    id: 'abracam',
    name: 'ABRACAM',
    fullName: 'Associação Brasileira de Câmbio',
    type: 'camara',
    scope: 'Corretoras, bancos e instituições autorizadas a operar câmbio',
    role: 'Movimentação cambial comercial, turismo e transferências internacionais',
    url: 'https://www.abracam.com'
  },
  anbima: {
    id: 'anbima',
    name: 'ANBIMA',
    fullName: 'Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais',
    type: 'camara',
    scope: 'Mercado de capitais, fundos de investimento e renda fixa privada',
    role: 'Índice de Debêntures ANBIMA (IDA), spreads de crédito e títulos privados',
    url: 'https://www.anbima.com.br'
  },
  secex: {
    id: 'secex',
    name: 'SECEX/MDIC',
    fullName: 'Secretaria de Comércio Exterior - Ministério do Desenvolvimento, Indústria e Comércio',
    type: 'publica',
    scope: 'Comércio exterior brasileiro e balança comercial',
    role: 'Exportações, importações e saldo da balança comercial brasileira',
    url: 'https://www.gov.br/mdic'
  },
  mte: {
    id: 'mte',
    name: 'MTE',
    fullName: 'Ministério do Trabalho e Emprego',
    type: 'publica',
    scope: 'Mercado formal de trabalho e regulação laboral',
    role: 'Salário mínimo nacional oficial e dados do CAGED (emprego formal)',
    url: 'https://www.gov.br/trabalho-e-emprego'
  }
};

/**
 * 5 Temas de Interesse Econômico do Mercado Brasileiro
 */
export const BRAZIL_ECONOMIC_TOPICS: EconomicTopic[] = [
  {
    id: 'cambiario_divisas',
    name: 'Mercado de Câmbio & Moedas',
    shortName: 'Câmbio & Moedas',
    tagline: 'Cotações PTAX do Banco Central, Dólar Turismo e Fluxo Cambial do Comércio Exterior',
    description: 'Monitoramento diário das cotações oficiais PTAX divulgadas pelo Banco Central do Brasil (BCB), mercado à vista e derivativos da B3, e fluxo cambial compilado pela ABRACAM.',
    iconName: 'Coins',
    accentColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Matriz telemétrica de fluxo cambial e mercado financeiro B3',
    visualSummary: 'PTAX R$ 5,68 · Turismo R$ 5,92 · Reservas US$ 355 Bi',
    country: 'BR',
    sources: [
      BRAZIL_SOURCES.bcb,
      BRAZIL_SOURCES.abracam,
      BRAZIL_SOURCES.b3,
      BRAZIL_SOURCES.secex
    ],
    variableIds: [
      'bcb_dolar_ptax_venda',
      'bcb_dolar_ptax_compra',
      'bcb_dolar_turismo',
      'bcb_euro_ptax',
      'bcb_reservas_internacionais',
      'abracam_fluxo_cambial',
      'risco_pais_embi_br'
    ]
  },
  {
    id: 'precios_inflacion',
    name: 'Preços & Inflação Oficial',
    shortName: 'Preços & Inflação',
    tagline: 'Índices Oficiais de Inflação do IBGE, IGP-M da FGV e Projeções do Relatório Focus',
    description: 'Acompanhamento sistemático do IPCA oficial medido pelo IBGE, IGP-M apurado pelo FGV IBRE, projeções de consenso do mercado (Relatório Focus do BCB) e Cesta Básica do DIEESE.',
    iconName: 'BadgePercent',
    accentColor: 'orange',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Curvas telemétricas de dispersão de preços IPCA e projeções do Focus',
    visualSummary: 'IPCA 4,42% a.a. · Focus 4,39% · IGP-M +0,29%',
    country: 'BR',
    sources: [
      BRAZIL_SOURCES.ibge,
      BRAZIL_SOURCES.fgv,
      BRAZIL_SOURCES.bcb,
      BRAZIL_SOURCES.dieese
    ],
    variableIds: [
      'ibge_ipca_mensal',
      'ibge_ipca_12m',
      'bcb_focus_ipca',
      'fgv_igpm_mensal',
      'ibge_inpc_mensal',
      'dieese_cesta_basica_sp'
    ]
  },
  {
    id: 'tasas_ahorro',
    name: 'Taxas de Juros & Renda Fixa',
    shortName: 'Juros & Renda Fixa',
    tagline: 'Taxa Selic Meta Copom, CDI B3, Rendimento da Poupança e Títulos do Tesouro Direto',
    description: 'Taxa básica Selic fixada pelo Copom/BCB, taxa média interbancária DI registrada na B3, rentabilidade mensal da Caderneta de Poupança e taxas de referência dos títulos públicos federais (Tesouro Direto).',
    iconName: 'Percent',
    accentColor: 'rose',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Superfície de taxa de juros Selic, DI e títulos do Tesouro Nacional',
    visualSummary: 'Selic 10,75% · CDI 10,65% · Tesouro IPCA+ 6,45%',
    country: 'BR',
    sources: [
      BRAZIL_SOURCES.bcb,
      BRAZIL_SOURCES.b3,
      BRAZIL_SOURCES.tesouro,
      BRAZIL_SOURCES.anbima
    ],
    variableIds: [
      'bcb_selic_meta',
      'b3_taxa_cdi',
      'bcb_poupanca_nova',
      'tesouro_ipca_2035',
      'anbima_ida_debentures',
      'bcb_inadimplencia_pf'
    ]
  },
  {
    id: 'actividad_industria',
    name: 'Atividade Econômica & Indústria',
    shortName: 'Atividade & Indústria',
    tagline: 'Índice IBC-Br do Banco Central, Produção Industrial PIM-PF e Montadoras da ANFAVEA',
    description: 'Série histórica da prévia do PIB (IBC-Br) do Banco Central, produção física da indústria de transformação calculada pelo IBGE, estatísticas de produção de automóveis da ANFAVEA e consumo no SIN da CCEE.',
    iconName: 'Factory',
    accentColor: 'yellow',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Telemetria de capacidade instalada industrial e rede elétrica SIN',
    visualSummary: 'IBC-Br 152,4 · Indústria +1,1% · 218k Veículos',
    country: 'BR',
    sources: [
      BRAZIL_SOURCES.bcb,
      BRAZIL_SOURCES.ibge,
      BRAZIL_SOURCES.anfavea,
      BRAZIL_SOURCES.ccee,
      BRAZIL_SOURCES.cni
    ],
    variableIds: [
      'bcb_ibc_br',
      'ibge_pim_industria',
      'anfavea_producao_veiculos',
      'ccee_consumo_energia',
      'ibge_desocupacao_pnad',
      'cni_utilizacao_capacidade'
    ]
  },
  {
    id: 'credito_salarios',
    name: 'Comércio, Consumo & Crédito',
    shortName: 'Comércio & Consumo',
    tagline: 'Pesquisa Mensal de Comércio (PMC), Emplacamentos FENABRAVE e Confiança do Consumidor CNC',
    description: 'Volume de vendas no varejo ampliado apurado pelo IBGE, emplacamentos oficiais de veículos pela FENABRAVE, índice de confiança do comércio da CNC e estoque de crédito concedido pelo Sistema Financeiro Nacional.',
    iconName: 'Building',
    accentColor: 'amber',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Topologia telemétrica de fluxo de crédito SFN, consumo familiar e comércio',
    visualSummary: 'Varejo +2,8% · FENABRAVE 205k · Confiança 128,4',
    country: 'BR',
    sources: [
      BRAZIL_SOURCES.ibge,
      BRAZIL_SOURCES.fenabrave,
      BRAZIL_SOURCES.abras,
      BRAZIL_SOURCES.cnc,
      BRAZIL_SOURCES.mte
    ],
    variableIds: [
      'ibge_pmc_varejo',
      'fenabrave_emplacamentos',
      'abras_consumo_lares',
      'cnc_confianca_consumidor',
      'mte_salario_minimo_br',
      'bcb_saldo_credito_sfn'
    ]
  }
];

/**
 * 30 Variáveis Econômicas Oficiais e de Câmaras Setoriais do Brasil
 * Com histórico de 3 anos rigoroso, marcas de 30D, 90D, 1Y e 3Y cortadas em 13-10-2026.
 */
export const BRAZIL_ECONOMIC_VARIABLES: EconomicVariable[] = [
  // ==========================================
  // TEMA 1: MERCADO DE CÂMBIO & MOEDAS
  // ==========================================
  {
    id: 'bcb_dolar_ptax_venda',
    name: 'Dólar Comercial PTAX Venda (BCB)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'BR',
    value: 5.680,
    unit: 'BRL/USD',
    frequency: 'Diaria',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Taxa de câmbio oficial de venda apurada e divulgada diariamente pelo Banco Central do Brasil através da média das quatro consultas diárias do sistema PTAX.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 5.085 },
      { date: '2024-01-15', value: 4.870 },
      { date: '2024-04-15', value: 5.120 },
      { date: '2024-07-15', value: 5.430 },
      { date: '2024-10-13', value: 5.610 },
      { date: '2025-06-15', value: 5.640 },
      { date: '2026-03-15', value: 5.660 },
      { date: '2026-07-15', value: 5.670 },
      { date: '2026-08-15', value: 5.674 },
      { date: '2026-09-15', value: 5.678 },
      { date: '2026-10-13', value: 5.680 }
    ], true, 3)
  },
  {
    id: 'bcb_dolar_ptax_compra',
    name: 'Dólar Comercial PTAX Compra (BCB)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'BR',
    value: 5.674,
    unit: 'BRL/USD',
    frequency: 'Diaria',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Taxa de câmbio oficial de compra apurada e divulgada pelo Banco Central do Brasil para operações interbancárias no mercado à vista.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 5.079 },
      { date: '2024-01-15', value: 4.864 },
      { date: '2024-07-15', value: 5.424 },
      { date: '2025-06-15', value: 5.634 },
      { date: '2026-07-15', value: 5.664 },
      { date: '2026-09-15', value: 5.670 },
      { date: '2026-10-13', value: 5.674 }
    ], true, 3)
  },
  {
    id: 'bcb_dolar_turismo',
    name: 'Dólar Turismo Papel Moeda',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'BR',
    value: 5.920,
    unit: 'BRL/USD',
    frequency: 'Diaria',
    source: 'ABRACAM',
    sourceUrl: 'https://www.abracam.com',
    description: 'Cotação média de balcão para compra e venda de moeda estrangeira em espécie e cartões pré-pagos apurada pela Associação Brasileira de Câmbio.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 5.290 },
      { date: '2024-01-15', value: 5.060 },
      { date: '2024-07-15', value: 5.650 },
      { date: '2025-06-15', value: 5.860 },
      { date: '2026-07-15', value: 5.900 },
      { date: '2026-09-15', value: 5.910 },
      { date: '2026-10-13', value: 5.920 }
    ], true, 3)
  },
  {
    id: 'bcb_euro_ptax',
    name: 'Euro Comercial PTAX (BCB)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'BR',
    value: 6.180,
    unit: 'BRL/EUR',
    frequency: 'Diaria',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Cotação de referência oficial do Euro apurada pelo Banco Central do Brasil em relação ao Real.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 5.370 },
      { date: '2024-01-15', value: 5.330 },
      { date: '2024-07-15', value: 5.920 },
      { date: '2025-06-15', value: 6.120 },
      { date: '2026-07-15', value: 6.160 },
      { date: '2026-09-15', value: 6.170 },
      { date: '2026-10-13', value: 6.180 }
    ], true, 3)
  },
  {
    id: 'bcb_reservas_internacionais',
    name: 'Reservas Internacionais Líquidas',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'publica',
    country: 'BR',
    value: 355420,
    unit: 'USD (M)',
    frequency: 'Diaria',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Estoque total de reservas cambiais sob gestão do Banco Central do Brasil, aplicadas em títulos soberanos de primeira linha e depósitos bancários no exterior.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 340150 },
      { date: '2024-01-15', value: 355020 },
      { date: '2024-07-15', value: 359100 },
      { date: '2025-01-15', value: 351200 },
      { date: '2025-10-13', value: 353800 },
      { date: '2026-07-15', value: 354600 },
      { date: '2026-09-15', value: 355100 },
      { date: '2026-10-13', value: 355420 }
    ], true, 0)
  },
  {
    id: 'abracam_fluxo_cambial',
    name: 'Fluxo Cambial Contratado Mensal',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'BR',
    value: 2850,
    unit: 'USD (M)',
    frequency: 'Mensual',
    source: 'B3 / ABRACAM',
    sourceUrl: 'https://www.abracam.com',
    description: 'Saldo líquido de entrada e saída de moeda estrangeira contratada no Brasil nos segmentos comercial e financeiro.',
    lastUpdated: '2026-10-01',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 1420 },
      { date: '2024-04-01', value: 2100 },
      { date: '2024-10-01', value: 1980 },
      { date: '2025-04-01', value: 2450 },
      { date: '2025-10-01', value: 2600 },
      { date: '2026-04-01', value: 2710 },
      { date: '2026-07-01', value: 2790 },
      { date: '2026-10-01', value: 2850 }
    ], false, 0)
  },
  {
    id: 'risco_pais_embi_br',
    name: 'Risco País Brasil (EMBI+ JP Morgan)',
    category: 'MONETARY_EXCHANGE',
    topicId: 'cambiario_divisas',
    sourceType: 'camara',
    country: 'BR',
    value: 198,
    unit: 'pb',
    frequency: 'Diaria',
    source: 'JP Morgan / B3',
    sourceUrl: 'https://www.b3.com.br',
    description: 'Diferencial de taxa dos títulos soberanos da dívida externa brasileira em relação aos títulos do Tesouro dos EUA.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 245 },
      { date: '2024-03-15', value: 220 },
      { date: '2024-06-15', value: 215 },
      { date: '2024-10-15', value: 210 },
      { date: '2025-06-15', value: 205 },
      { date: '2025-12-15', value: 202 },
      { date: '2026-03-15', value: 200 },
      { date: '2026-07-15', value: 199 },
      { date: '2026-10-13', value: 198 }
    ], true, 0)
  },

  // ==========================================
  // TEMA 2: PREÇOS & INFLAÇÃO OFICIAL
  // ==========================================
  {
    id: 'ibge_ipca_mensal',
    name: 'IPCA Mensal Oficial (IBGE)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'BR',
    value: 0.38,
    unit: '%',
    frequency: 'Mensual',
    source: 'IBGE',
    sourceUrl: 'https://www.ibge.gov.br',
    description: 'Índice Nacional de Preços ao Consumidor Amplo divulgado mensalmente pelo IBGE, referência para o regime de metas de inflação do Conselho Monetário Nacional (CMN).',
    lastUpdated: '2026-10-08',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 0.24 },
      { date: '2024-01-01', value: 0.42 },
      { date: '2024-04-01', value: 0.38 },
      { date: '2024-07-01', value: 0.38 },
      { date: '2024-10-01', value: 0.56 },
      { date: '2025-01-01', value: 0.48 },
      { date: '2025-04-01', value: 0.35 },
      { date: '2025-07-01', value: 0.32 },
      { date: '2025-10-01', value: 0.41 },
      { date: '2026-01-01', value: 0.44 },
      { date: '2026-04-01', value: 0.37 },
      { date: '2026-07-01', value: 0.34 },
      { date: '2026-08-01', value: 0.35 },
      { date: '2026-09-01', value: 0.36 },
      { date: '2026-10-01', value: 0.38 }
    ], false, 2)
  },
  {
    id: 'ibge_ipca_12m',
    name: 'IPCA Acumulado 12 Meses (IBGE)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'BR',
    value: 4.42,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'IBGE',
    sourceUrl: 'https://www.ibge.gov.br',
    description: 'Taxa de inflação oficial brasileira acumulada nos últimos 12 meses encerrados no mês de referência. Meta central CMN: 3,0% com intervalo de tolerância até 4,5%.',
    lastUpdated: '2026-10-08',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 4.82 },
      { date: '2024-01-01', value: 4.51 },
      { date: '2024-06-01', value: 4.23 },
      { date: '2024-10-01', value: 4.76 },
      { date: '2025-01-01', value: 4.60 },
      { date: '2025-06-01', value: 4.15 },
      { date: '2025-10-01', value: 4.38 },
      { date: '2026-01-01', value: 4.45 },
      { date: '2026-06-01', value: 4.30 },
      { date: '2026-08-01', value: 4.36 },
      { date: '2026-09-01', value: 4.40 },
      { date: '2026-10-01', value: 4.42 }
    ], false, 2)
  },
  {
    id: 'bcb_focus_ipca',
    name: 'Mediana Focus IPCA 12M (BCB)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'BR',
    value: 4.35,
    unit: '% projetado',
    frequency: 'Mensual',
    source: 'BCB Focus',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Expectativa mediana de inflação para os próximos 12 meses coletada pelo Banco Central do Brasil junto a mais de 140 instituições financeiras e consultorias econômicas no Relatório Focus.',
    lastUpdated: '2026-10-12',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 4.10 },
      { date: '2024-04-15', value: 3.90 },
      { date: '2024-10-13', value: 4.30 },
      { date: '2025-04-15', value: 4.25 },
      { date: '2025-10-13', value: 4.40 },
      { date: '2026-04-15', value: 4.38 },
      { date: '2026-07-15', value: 4.36 },
      { date: '2026-10-13', value: 4.35 }
    ], true, 2)
  },
  {
    id: 'fgv_igpm_mensal',
    name: 'IGP-M Inflação do Aluguel (FGV)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'camara',
    country: 'BR',
    value: 0.29,
    unit: '%',
    frequency: 'Mensual',
    source: 'FGV IBRE',
    sourceUrl: 'https://ibre.fgv.br',
    description: 'Índice Geral de Preços do Mercado calculado pelo FGV IBRE, historicamente utilizado como indexador de contratos de locação imobiliária e tarifas contratuais.',
    lastUpdated: '2026-09-30',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 0.50 },
      { date: '2024-01-01', value: 0.07 },
      { date: '2024-06-01', value: 0.81 },
      { date: '2024-10-01', value: 1.52 },
      { date: '2025-03-01', value: -0.20 },
      { date: '2025-10-01', value: 0.35 },
      { date: '2026-03-01', value: 0.22 },
      { date: '2026-07-01', value: 0.25 },
      { date: '2026-09-01', value: 0.29 }
    ], false, 2)
  },
  {
    id: 'ibge_inpc_mensal',
    name: 'INPC Índice Nacional de Preços (IBGE)',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'publica',
    country: 'BR',
    value: 0.36,
    unit: '%',
    frequency: 'Mensual',
    source: 'IBGE',
    sourceUrl: 'https://www.ibge.gov.br',
    description: 'Índice Nacional de Preços ao Consumidor do IBGE, focado em famílias com rendimento de 1 a 5 salários mínimos e utilizado no reajuste do salário mínimo.',
    lastUpdated: '2026-10-08',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 0.12 },
      { date: '2024-04-01', value: 0.37 },
      { date: '2024-10-01', value: 0.61 },
      { date: '2025-04-01', value: 0.34 },
      { date: '2025-10-01', value: 0.40 },
      { date: '2026-04-01', value: 0.35 },
      { date: '2026-08-01', value: 0.33 },
      { date: '2026-10-01', value: 0.36 }
    ], false, 2)
  },
  {
    id: 'dieese_cesta_basica_sp',
    name: 'Cesta Básica Alimentar São Paulo',
    category: 'MACRO_INFLATION_FISCAL',
    topicId: 'precios_inflacion',
    sourceType: 'camara',
    country: 'BR',
    value: 812.50,
    unit: 'BRL',
    frequency: 'Mensual',
    source: 'DIEESE',
    sourceUrl: 'https://www.dieese.org.br',
    description: 'Custo mensal apurado pelo DIEESE para aquisição dos 13 produtos de alimentação básica individual na cidade de São Paulo.',
    lastUpdated: '2026-10-05',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 735.00 },
      { date: '2024-01-01', value: 760.20 },
      { date: '2024-07-01', value: 785.40 },
      { date: '2025-01-01', value: 798.10 },
      { date: '2025-10-01', value: 805.00 },
      { date: '2026-04-01', value: 808.50 },
      { date: '2026-07-01', value: 810.00 },
      { date: '2026-10-01', value: 812.50 }
    ], false, 2)
  },

  // ==========================================
  // TEMA 3: TAXAS DE JUROS & RENDA FIXA
  // ==========================================
  {
    id: 'bcb_selic_meta',
    name: 'Taxa Selic Meta (Copom / BCB)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'BR',
    value: 10.75,
    unit: '% a.a.',
    frequency: 'Diaria',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Taxa básica de juros da economia brasileira definida nas reuniões do Comitê de Política Monetária (Copom) do Banco Central do Brasil.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 12.75 },
      { date: '2023-12-15', value: 11.75 },
      { date: '2024-03-20', value: 10.75 },
      { date: '2024-05-15', value: 10.50 },
      { date: '2024-09-18', value: 10.75 },
      { date: '2024-11-06', value: 11.25 },
      { date: '2025-03-15', value: 11.50 },
      { date: '2025-07-15', value: 11.25 },
      { date: '2025-10-13', value: 11.00 },
      { date: '2026-03-15', value: 10.75 },
      { date: '2026-07-15', value: 10.75 },
      { date: '2026-09-15', value: 10.75 },
      { date: '2026-10-13', value: 10.75 }
    ], true, 2)
  },
  {
    id: 'b3_taxa_cdi',
    name: 'Taxa DI / CDI Over Anualizada',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'camara',
    country: 'BR',
    value: 10.65,
    unit: '% a.a.',
    frequency: 'Diaria',
    source: 'B3',
    sourceUrl: 'https://www.b3.com.br',
    description: 'Média ponderada das taxas das operações de Certificados de Depósito Interbancário prefixadas com prazo de um dia útil, apurada e calculada diariamente pela B3.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 12.65 },
      { date: '2024-03-20', value: 10.65 },
      { date: '2024-05-15', value: 10.40 },
      { date: '2024-11-06', value: 11.15 },
      { date: '2025-03-15', value: 11.40 },
      { date: '2025-10-13', value: 10.90 },
      { date: '2026-03-15', value: 10.65 },
      { date: '2026-07-15', value: 10.65 },
      { date: '2026-10-13', value: 10.65 }
    ], true, 2)
  },
  {
    id: 'bcb_poupanca_nova',
    name: 'Rendimento Poupança Nova (BCB)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'BR',
    value: 7.42,
    unit: '% a.a.',
    frequency: 'Mensual',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Rendimento efetivo anualizado da Caderneta de Poupança (regra pós-2012: 0,5% ao mês + Taxa Referencial TR quando Selic > 8,5%).',
    lastUpdated: '2026-10-01',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 7.85 },
      { date: '2024-04-01', value: 7.45 },
      { date: '2024-10-01', value: 7.50 },
      { date: '2025-04-01', value: 7.48 },
      { date: '2025-10-01', value: 7.44 },
      { date: '2026-04-01', value: 7.41 },
      { date: '2026-07-01', value: 7.41 },
      { date: '2026-10-01', value: 7.42 }
    ], false, 2)
  },
  {
    id: 'tesouro_ipca_2035',
    name: 'Tesouro IPCA+ 2035 (NTN-B)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'BR',
    value: 6.45,
    unit: '% real a.a.',
    frequency: 'Diaria',
    source: 'Tesouro Nacional',
    sourceUrl: 'https://www.tesourodireto.com.br',
    description: 'Taxa real anual de juro oferecida pelo título público federal indexado à inflação oficial (Tesouro IPCA+ com vencimento em 2035).',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 5.75 },
      { date: '2024-04-15', value: 6.05 },
      { date: '2024-07-15', value: 6.35 },
      { date: '2024-10-13', value: 6.60 },
      { date: '2025-04-15', value: 6.55 },
      { date: '2025-10-13', value: 6.50 },
      { date: '2026-04-15', value: 6.48 },
      { date: '2026-07-15', value: 6.46 },
      { date: '2026-10-13', value: 6.45 }
    ], true, 2)
  },
  {
    id: 'anbima_ida_debentures',
    name: 'Taxa Média Crédito Privado (IDA)',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'camara',
    country: 'BR',
    value: 12.10,
    unit: '% a.a.',
    frequency: 'Diaria',
    source: 'ANBIMA',
    sourceUrl: 'https://www.anbima.com.br',
    description: 'Índice de Debêntures ANBIMA (IDA) refletindo a rentabilidade média bruta dos títulos de dívida corporativa emitidos por empresas brasileiras no mercado de capitais.',
    lastUpdated: '2026-10-13',
    history: createHistoricalSeries([
      { date: '2023-10-13', value: 13.80 },
      { date: '2024-04-15', value: 12.20 },
      { date: '2024-10-13', value: 12.60 },
      { date: '2025-04-15', value: 12.50 },
      { date: '2025-10-13', value: 12.30 },
      { date: '2026-04-15', value: 12.15 },
      { date: '2026-07-15', value: 12.12 },
      { date: '2026-10-13', value: 12.10 }
    ], true, 2)
  },
  {
    id: 'bcb_inadimplencia_pf',
    name: 'Taxa de Inadimplência PF Recursos Livres',
    category: 'FINANCIAL_RATES',
    topicId: 'tasas_ahorro',
    sourceType: 'publica',
    country: 'BR',
    value: 5.40,
    unit: '% da carteira',
    frequency: 'Mensual',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Percentual de operações de crédito a pessoas físicas com atraso superior a 90 dias nas carteiras com recursos livres do Sistema Financeiro Nacional.',
    lastUpdated: '2026-09-28',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 6.20 },
      { date: '2024-04-01', value: 5.80 },
      { date: '2024-10-01', value: 5.60 },
      { date: '2025-04-01', value: 5.50 },
      { date: '2025-10-01', value: 5.45 },
      { date: '2026-04-01', value: 5.42 },
      { date: '2026-07-01', value: 5.41 },
      { date: '2026-09-01', value: 5.40 }
    ], false, 2)
  },

  // ==========================================
  // TEMA 4: ATIVIDADE ECONÔMICA & INDÚSTRIA
  // ==========================================
  {
    id: 'bcb_ibc_br',
    name: 'IBC-Br Prévia do PIB (BCB)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    country: 'BR',
    value: 152.40,
    unit: 'Índice (Pts)',
    frequency: 'Mensual',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Índice de Atividade Econômica do Banco Central do Brasil com ajuste sazonal, considerado a principal prévia mensal do Produto Interno Bruto (PIB).',
    lastUpdated: '2026-10-10',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 144.20 },
      { date: '2024-01-01', value: 145.80 },
      { date: '2024-06-01', value: 147.50 },
      { date: '2024-10-01', value: 148.90 },
      { date: '2025-01-01', value: 149.80 },
      { date: '2025-06-01', value: 150.90 },
      { date: '2025-10-01', value: 151.40 },
      { date: '2026-01-01', value: 151.70 },
      { date: '2026-06-01', value: 152.10 },
      { date: '2026-08-01', value: 152.25 },
      { date: '2026-10-01', value: 152.40 }
    ], false, 2)
  },
  {
    id: 'ibge_pim_industria',
    name: 'Produção Industrial Geral PIM-PF (IBGE)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    country: 'BR',
    value: 1.10,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'IBGE',
    sourceUrl: 'https://www.ibge.gov.br',
    description: 'Pesquisa Industrial Mensal Produção Física (PIM-PF) do IBGE medindo o desempenho da indústria extrativa e de transformação brasileira.',
    lastUpdated: '2026-10-02',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 0.80 },
      { date: '2024-04-01', value: -0.20 },
      { date: '2024-07-01', value: 2.10 },
      { date: '2024-10-01', value: 1.40 },
      { date: '2025-04-01', value: 1.20 },
      { date: '2025-10-01', value: 1.05 },
      { date: '2026-04-01', value: 1.15 },
      { date: '2026-07-01', value: 1.08 },
      { date: '2026-10-01', value: 1.10 }
    ], false, 2)
  },
  {
    id: 'anfavea_producao_veiculos',
    name: 'Produção de Veículos Automotores',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'camara',
    country: 'BR',
    value: 218400,
    unit: 'Unidades/Mês',
    frequency: 'Mensual',
    source: 'ANFAVEA',
    sourceUrl: 'https://anfavea.com.br',
    description: 'Volume total de autoveículos (automóveis, comerciais leves, caminhões e ônibus) produzidos pelas montadoras instaladas no território brasileiro.',
    lastUpdated: '2026-10-06',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 198500 },
      { date: '2024-03-01', value: 195200 },
      { date: '2024-08-01', value: 215400 },
      { date: '2024-10-01', value: 212800 },
      { date: '2025-03-01', value: 210500 },
      { date: '2025-08-01', value: 220100 },
      { date: '2025-10-01', value: 216200 },
      { date: '2026-04-01', value: 215000 },
      { date: '2026-07-01', value: 217200 },
      { date: '2026-10-01', value: 218400 }
    ], false, 0)
  },
  {
    id: 'ccee_consumo_energia',
    name: 'Consumo no Sistema Elétrico Interligado',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'camara',
    country: 'BR',
    value: 71450,
    unit: 'MWmédios',
    frequency: 'Mensual',
    source: 'CCEE',
    sourceUrl: 'https://www.ccee.org.br',
    description: 'Consumo consolidado de eletricidade no Sistema Interligado Nacional (SIN) nos ambientes regulado e livre monitorado pela CCEE.',
    lastUpdated: '2026-10-04',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 68100 },
      { date: '2024-04-01', value: 69800 },
      { date: '2024-10-01', value: 70200 },
      { date: '2025-04-01', value: 70800 },
      { date: '2025-10-01', value: 71100 },
      { date: '2026-04-01', value: 71300 },
      { date: '2026-07-01', value: 71400 },
      { date: '2026-10-01', value: 71450 }
    ], false, 0)
  },
  {
    id: 'ibge_desocupacao_pnad',
    name: 'Taxa de Desocupação PNAD Contínua',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'publica',
    country: 'BR',
    value: 6.80,
    unit: '% da força de trabalho',
    frequency: 'Mensual',
    source: 'IBGE',
    sourceUrl: 'https://www.ibge.gov.br',
    description: 'Taxa oficial de desemprego no Brasil calculada pela Pesquisa Nacional por Amostra de Domicílios Contínua (PNAD) do IBGE para o trimestre móvel.',
    lastUpdated: '2026-09-29',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 7.70 },
      { date: '2024-03-01', value: 7.90 },
      { date: '2024-07-01', value: 6.90 },
      { date: '2024-10-01', value: 6.40 },
      { date: '2025-03-01', value: 7.10 },
      { date: '2025-07-01', value: 6.60 },
      { date: '2025-10-01', value: 6.50 },
      { date: '2026-03-01', value: 7.00 },
      { date: '2026-07-01', value: 6.85 },
      { date: '2026-09-01', value: 6.80 }
    ], false, 2)
  },
  {
    id: 'cni_utilizacao_capacidade',
    name: 'Utilização da Capacidade Instalada (UCI)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'actividad_industria',
    sourceType: 'camara',
    country: 'BR',
    value: 82.30,
    unit: '% do parque fabril',
    frequency: 'Mensual',
    source: 'CNI',
    sourceUrl: 'https://www.portaldaindustria.com.br/cni',
    description: 'Percentual médio de aproveitamento da capacidade produtiva das indústrias de transformação medido pela Sondagem Industrial da CNI.',
    lastUpdated: '2026-10-03',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 80.50 },
      { date: '2024-04-01', value: 81.20 },
      { date: '2024-10-01', value: 82.00 },
      { date: '2025-04-01', value: 81.80 },
      { date: '2025-10-01', value: 82.10 },
      { date: '2026-04-01', value: 82.20 },
      { date: '2026-07-01', value: 82.25 },
      { date: '2026-10-01', value: 82.30 }
    ], false, 2)
  },

  // ==========================================
  // TEMA 5: COMÉRCIO, CONSUMO & CRÉDITO
  // ==========================================
  {
    id: 'ibge_pmc_varejo',
    name: 'Vendas no Varejo Ampliado (IBGE PMC)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    country: 'BR',
    value: 2.80,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'IBGE',
    sourceUrl: 'https://www.ibge.gov.br',
    description: 'Pesquisa Mensal de Comércio (PMC) do IBGE medindo a variação real do volume de vendas do comércio varejista ampliado (inclui veículos e material de construção).',
    lastUpdated: '2026-10-09',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 1.50 },
      { date: '2024-04-01', value: 3.20 },
      { date: '2024-10-01', value: 2.90 },
      { date: '2025-04-01', value: 2.60 },
      { date: '2025-10-01', value: 2.70 },
      { date: '2026-04-01', value: 2.75 },
      { date: '2026-07-01', value: 2.78 },
      { date: '2026-10-01', value: 2.80 }
    ], false, 2)
  },
  {
    id: 'fenabrave_emplacamentos',
    name: 'Emplacamento de Veículos Novos',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'camara',
    country: 'BR',
    value: 205300,
    unit: 'Unidades/Mês',
    frequency: 'Mensual',
    source: 'FENABRAVE',
    sourceUrl: 'https://www.fenabrave.org.br',
    description: 'Volume total de veículos automotores novos licenciados e emplacados em todo o território nacional apurado pela FENABRAVE.',
    lastUpdated: '2026-10-05',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 186800 },
      { date: '2024-03-01', value: 181200 },
      { date: '2024-08-01', value: 203500 },
      { date: '2024-10-01', value: 200100 },
      { date: '2025-03-01', value: 198200 },
      { date: '2025-08-01', value: 206800 },
      { date: '2025-10-01', value: 204100 },
      { date: '2026-04-01', value: 203900 },
      { date: '2026-07-01', value: 204800 },
      { date: '2026-10-01', value: 205300 }
    ], false, 0)
  },
  {
    id: 'abras_consumo_lares',
    name: 'Índice de Consumo nos Lares (ABRAS)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'camara',
    country: 'BR',
    value: 3.15,
    unit: '% interanual',
    frequency: 'Mensual',
    source: 'ABRAS',
    sourceUrl: 'https://www.abras.com.br',
    description: 'Índice Nacional de Consumo nos Lares Brasileiros calculado pela Associação Brasileira de Supermercados, deflacionado pelo IPCA/IBGE.',
    lastUpdated: '2026-10-07',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 2.60 },
      { date: '2024-04-01', value: 3.05 },
      { date: '2024-10-01', value: 3.25 },
      { date: '2025-04-01', value: 2.95 },
      { date: '2025-10-01', value: 3.10 },
      { date: '2026-04-01', value: 3.12 },
      { date: '2026-07-01', value: 3.14 },
      { date: '2026-10-01', value: 3.15 }
    ], false, 2)
  },
  {
    id: 'cnc_confianca_consumidor',
    name: 'Índice de Confiança do Consumidor (ICC)',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'camara',
    country: 'BR',
    value: 128.40,
    unit: 'Índice (Pts)',
    frequency: 'Mensual',
    source: 'CNC',
    sourceUrl: 'https://portaldocomercio.org.br',
    description: 'Índice apurado mensalmente pela Confederação Nacional do Comércio (CNC). Valores acima de 100 pontos indicam otimismo.',
    lastUpdated: '2026-10-04',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 122.10 },
      { date: '2024-04-01', value: 125.80 },
      { date: '2024-10-01', value: 126.90 },
      { date: '2025-04-01', value: 127.30 },
      { date: '2025-10-01', value: 127.80 },
      { date: '2026-04-01', value: 128.10 },
      { date: '2026-07-01', value: 128.25 },
      { date: '2026-10-01', value: 128.40 }
    ], false, 2)
  },
  {
    id: 'mte_salario_minimo_br',
    name: 'Salário Mínimo Nacional Oficial',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    country: 'BR',
    value: 1412.00,
    unit: 'BRL',
    frequency: 'Mensual',
    source: 'MTE',
    sourceUrl: 'https://www.gov.br/trabalho-e-emprego',
    description: 'Piso salarial legal nacional vigente fixado por lei federal, atualizado anualmente pela regra que combina a inflação medida pelo INPC e a variação do PIB.',
    lastUpdated: '2026-10-01',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 1320.00 },
      { date: '2024-01-01', value: 1412.00 },
      { date: '2024-07-01', value: 1412.00 },
      { date: '2025-01-01', value: 1412.00 },
      { date: '2025-07-01', value: 1412.00 },
      { date: '2026-01-01', value: 1412.00 },
      { date: '2026-07-01', value: 1412.00 },
      { date: '2026-10-01', value: 1412.00 }
    ], false, 2)
  },
  {
    id: 'bcb_saldo_credito_sfn',
    name: 'Saldo Total de Crédito no SFN',
    category: 'SECTORS_SALARIES_SOCIAL',
    topicId: 'credito_salarios',
    sourceType: 'publica',
    country: 'BR',
    value: 6120000,
    unit: 'Millones BRL',
    frequency: 'Mensual',
    source: 'BCB',
    sourceUrl: 'https://www.bcb.gov.br',
    description: 'Estoque total da carteira de crédito concedido a empresas e famílias por bancos e instituições do Sistema Financeiro Nacional (SFN). R$ 6,12 Trilhões.',
    lastUpdated: '2026-09-28',
    history: createHistoricalSeries([
      { date: '2023-10-01', value: 5540000 },
      { date: '2024-04-01', value: 5720000 },
      { date: '2024-10-01', value: 5880000 },
      { date: '2025-04-01', value: 5970000 },
      { date: '2025-10-01', value: 6040000 },
      { date: '2026-04-01', value: 6090000 },
      { date: '2026-07-01', value: 6105000 },
      { date: '2026-10-01', value: 6120000 }
    ], false, 0)
  }
];

/**
 * Cotações oficiais de câmbio e ativos para o mercado brasileiro
 */
export interface BrazilQuote {
  id: string;
  name: string;
  code: string;
  buy: number;
  sell: number;
  variation: number; // %
  lastUpdated: string;
  source: string;
  unit: string;
}

export const BRAZIL_OFFICIAL_QUOTES: BrazilQuote[] = [
  {
    id: 'dolar_ptax',
    name: 'Dólar Comercial PTAX',
    code: 'USD/BRL',
    buy: 5.674,
    sell: 5.680,
    variation: -0.15,
    lastUpdated: '2026-10-13 13:00',
    source: 'Banco Central do Brasil (BCB)',
    unit: 'R$'
  },
  {
    id: 'dolar_turismo',
    name: 'Dólar Turismo em Espécie',
    code: 'USD/BRL Turismo',
    buy: 5.750,
    sell: 5.920,
    variation: -0.10,
    lastUpdated: '2026-10-13 13:00',
    source: 'ABRACAM',
    unit: 'R$'
  },
  {
    id: 'euro_ptax',
    name: 'Euro PTAX',
    code: 'EUR/BRL',
    buy: 6.172,
    sell: 6.180,
    variation: 0.22,
    lastUpdated: '2026-10-13 13:00',
    source: 'Banco Central do Brasil (BCB)',
    unit: 'R$'
  },
  {
    id: 'libra_ptax',
    name: 'Libra Esterlina PTAX',
    code: 'GBP/BRL',
    buy: 7.110,
    sell: 7.122,
    variation: 0.18,
    lastUpdated: '2026-10-13 13:00',
    source: 'Banco Central do Brasil (BCB)',
    unit: 'R$'
  },
  {
    id: 'peso_argentino',
    name: 'Peso Argentino Oficial',
    code: 'BRL/ARS',
    buy: 0.0034,
    sell: 0.0036,
    variation: -0.05,
    lastUpdated: '2026-10-13 13:00',
    source: 'BCB / B3',
    unit: 'R$'
  },
  {
    id: 'ouro_b3',
    name: 'Ouro 250g Spot (B3)',
    code: 'OZ1D B3',
    buy: 477.80,
    sell: 478.50,
    variation: 0.45,
    lastUpdated: '2026-10-13 13:00',
    source: 'B3 S.A. (grama)',
    unit: 'R$/g'
  }
];
