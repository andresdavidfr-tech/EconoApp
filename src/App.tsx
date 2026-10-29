import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Landmark,
  TrendingUp,
  Layers,
  Coins,
  BadgePercent,
  Percent,
  Factory,
  Building,
  ExternalLink,
  Filter,
  CheckCircle2,
  X,
  SlidersHorizontal,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import {
  CountryCode,
  EconomicVariable,
  BankFixedTermRate,
  TopicId,
  EconomicTopic
} from './types';
import { ARGENTINA_ECONOMIC_VARIABLES, ECONOMIC_TOPICS } from './data';
import {
  BRAZIL_ECONOMIC_VARIABLES,
  BRAZIL_ECONOMIC_TOPICS,
  BRAZIL_OFFICIAL_QUOTES
} from './brazilData';
import { computeBankRates, computeBrazilBankRates } from './fixedTermData';
import { getArgentinaTodayDate, formatToDayMonthYear, syncVariablesToCurrentDate } from './dailySync';
import { ArgentinaFlag, BrazilFlag } from './components/FlagIcons';
import { TopicTechVisualizer } from './components/TopicTechVisualizer';
import { MetaIcon } from './MetaIcon';
import { getDailyNewsBriefing } from './dailyNews';
import { DailyNewsModal } from './components/DailyNewsModal';
import {
  convertVariableToUsd,
  isVariableEligibleForUsdConversion,
  deflateHistoricalSeriesToUsd,
  DEFAULT_OFFICIAL_USD_RATE
} from './usdConversion';

type Tab = 'temas' | 'cotizaciones' | 'plazo_fijo' | 'tendencias' | 'fuentes';

// ============================================================================
// Modern Logo Component with Country Flag Display & Switcher
// ============================================================================
function EconoLogo({
  onClick,
  country,
  onSelectCountry
}: {
  onClick?: () => void;
  country: CountryCode;
  onSelectCountry: (c: CountryCode) => void;
}) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div
        onClick={onClick}
        className="flex items-center gap-2.5 cursor-pointer group"
        title="Econoapp"
      >
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2a170f] via-[#3a1d12] to-[#1e0e07] p-[1px] shadow-xs group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-[11px] bg-[#1e0e07] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-rose-400/25 pointer-events-none" />
              <svg
                className="w-5 h-5 relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Modern geometric E ligature */}
                <path
                  d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V7C20 7.55228 19.5523 8 19 8H8.5C7.67157 8 7 8.67157 7 9.5V11H16C16.5523 11 17 11.4477 17 12V12.5C17 13.0523 16.5523 13.5 16 13.5H7V15C7 15.8284 7.67157 16.5 8.5 16.5H19C19.5523 16.5 20 16.9477 20 17.5V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
                  fill="url(#econo-grad-main)"
                />
                {/* Ascending financial vector in sober electric blue */}
                <path
                  d="M13 3L20 3M20 3L20 10M20 3L11 12"
                  stroke="#2563eb"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="3" r="1.5" fill="#38bdf8" />
                <defs>
                  <linearGradient id="econo-grad-main" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#dbeafe" />
                    <stop offset="1" stopColor="#bfdbfe" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[17px] font-black tracking-tight text-slate-900 font-sans">
              Econo<span className="text-blue-600 font-extrabold">app</span>
            </span>
            {/* Country flag displayed on the right */}
            <span className="inline-flex items-center ml-0.5">
              {country === 'AR' ? (
                <ArgentinaFlag className="w-5 h-3.5 shadow-2xs" />
              ) : (
                <BrazilFlag className="w-5 h-3.5 shadow-2xs" />
              )}
            </span>
          </div>
          <span className="text-[10px] font-medium text-blue-900/60 tracking-tight mt-0.5 whitespace-nowrap">
            {country === 'BR' ? 'Dados Oficiais' : 'Datos Oficiales'}
          </span>
        </div>
      </div>

      {/* Flag Country Selector */}
      <div className="flex items-center bg-blue-100/60 p-0.5 rounded-lg border border-blue-200/80 shadow-2xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCountry('AR');
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-xs ${
            country === 'AR'
              ? 'bg-white shadow-xs text-slate-900 font-semibold ring-1 ring-blue-300'
              : 'text-slate-500 hover:text-slate-800 opacity-70 hover:opacity-100'
          }`}
          title="Argentina"
        >
          <ArgentinaFlag className="w-4.5 h-3" />
          <span className="hidden sm:inline text-[10px] font-bold">ARG</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCountry('BR');
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-xs ${
            country === 'BR'
              ? 'bg-white shadow-xs text-slate-900 font-semibold ring-1 ring-blue-300'
              : 'text-slate-500 hover:text-slate-800 opacity-70 hover:opacity-100'
          }`}
          title="Brasil"
        >
          <BrazilFlag className="w-4.5 h-3" />
          <span className="hidden sm:inline text-[10px] font-bold">BRA</span>
        </button>
      </div>
    </div>
  );
}

// Topic Icon Helper
function TopicIcon({ name, className = 'size-4' }: { name: string; className?: string }) {
  switch (name) {
    case 'Coins':
      return <Coins className={className} />;
    case 'BadgePercent':
      return <BadgePercent className={className} />;
    case 'Percent':
      return <Percent className={className} />;
    case 'Factory':
      return <Factory className={className} />;
    case 'Building':
      return <Building className={className} />;
    default:
      return <Layers className={className} />;
  }
}

// High-Density Data-Driven Mini Sparkline
// Sparkline desactivado para mostrar únicamente variaciones porcentuales sin líneas
function MiniSparkline(_props: {
  history?: { date: string; value: number }[];
  isPositive?: boolean;
  compact?: boolean;
}) {
  return null;
}

function getTopicWarmBadge(topicId: TopicId) {
  switch (topicId) {
    case 'cambiario_divisas':
      return {
        badge: 'bg-blue-100/90 text-blue-900 border-blue-300',
        activePill: 'bg-blue-600 text-white font-semibold shadow-xs ring-1 ring-blue-500',
        cardBorder: 'border-blue-400 ring-2 ring-blue-400/40 shadow-lg',
        accentHex: '#2563eb',
        name: 'Cobalto'
      };
    case 'precios_inflacion':
      return {
        badge: 'bg-indigo-100/90 text-indigo-950 border-indigo-300',
        activePill: 'bg-indigo-600 text-white font-semibold shadow-xs ring-1 ring-indigo-500',
        cardBorder: 'border-indigo-400 ring-2 ring-indigo-400/40 shadow-lg',
        accentHex: '#4f46e5',
        name: 'Índigo'
      };
    case 'tasas_ahorro':
      return {
        badge: 'bg-sky-100/90 text-sky-950 border-sky-300',
        activePill: 'bg-sky-600 text-white font-semibold shadow-xs ring-1 ring-sky-500',
        cardBorder: 'border-sky-400 ring-2 ring-sky-400/40 shadow-lg',
        accentHex: '#0284c7',
        name: 'Glaciar'
      };
    case 'actividad_industria':
      return {
        badge: 'bg-slate-200/90 text-slate-900 border-slate-300',
        activePill: 'bg-slate-700 text-white font-semibold shadow-xs ring-1 ring-slate-600',
        cardBorder: 'border-slate-400 ring-2 ring-slate-400/40 shadow-lg',
        accentHex: '#475569',
        name: 'Acero'
      };
    case 'credito_salarios':
    default:
      return {
        badge: 'bg-blue-100/90 text-blue-950 border-blue-300',
        activePill: 'bg-blue-800 text-white font-semibold shadow-xs ring-1 ring-blue-700',
        cardBorder: 'border-blue-600 ring-2 ring-blue-600/40 shadow-lg',
        accentHex: '#1d4ed8',
        name: 'Ultramar'
      };
  }
}

/**
 * Proporciona el enfoque humano y preguntas directas de interés ciudadano para cada tema.
 * Orientado al usuario que ingresa para entender la realidad económica antes de ver números.
 */
function getTopicHumanInfo(topicId: TopicId, country: CountryCode) {
  if (country === 'BR') {
    switch (topicId) {
      case 'precios_inflacion':
        return {
          question: 'Qual o impacto da inflação no custo de vida?',
          summary: 'Acompanhe o IPCA oficial apurado pelo IBGE e o IGP-M da FGV para entender o poder de compra do Real e os reajustes de contratos.'
        };
      case 'cambiario_divisas':
        return {
          question: 'Como estão as cotações do Dólar e moedas?',
          summary: 'Cotações oficiais PTAX do Banco Central do Brasil, Dólar Turismo e o nível das reservas internacionais em moeda estrangeira.'
        };
      case 'tasas_ahorro':
        return {
          question: 'Quanto rendem a poupança e a renda fixa?',
          summary: 'Taxa básica Selic fixada pelo Copom/BCB e taxa DI (CDI da B3) para rendimento de CDBs, Tesouro Direto e depósitos bancários.'
        };
      case 'actividad_industria':
        return {
          question: 'Como avança a atividade produtiva e a indústria?',
          summary: 'Pesquisa Industrial Mensal (PIM-PF) do IBGE, montagem de autoveículos da ANFAVEA e consumo nacional de energia elétrica.'
        };
      case 'credito_salarios':
      default:
        return {
          question: 'Como estão o crédito bancário e o emprego?',
          summary: 'Volume total de concessão de crédito do Sistema Financeiro Nacional divulgado pelo BCB e evolução do emprego formal.'
        };
    }
  }

  // Argentina
  switch (topicId) {
    case 'precios_inflacion':
      return {
        question: '¿Cómo evolucionan los precios y el costo de vida?',
        summary: 'Seguí el ritmo del IPC nacional, las canastas básicas de consumo (CBA y CBT) y la inflación mayorista informadas por el INDEC.'
      };
    case 'cambiario_divisas':
      return {
        question: '¿A cuánto cotizan el dólar y las divisas oficiales?',
        summary: 'Cotizaciones minoristas y mayoristas del Banco Nación (BNA), paridades bursátiles de BYMA y reservas internacionales del BCRA.'
      };
    case 'tasas_ahorro':
      return {
        question: '¿Qué rinde tu dinero en depósitos y plazos fijos?',
        summary: 'Tasa de política monetaria del BCRA, tasa BADLAR de bancos privados y comparador de rendimientos de plazos fijos a 30 días.'
      };
    case 'actividad_industria':
      return {
        question: '¿Cómo marchan la producción y la economía real?',
        summary: 'Índice de producción industrial manufacturero (IPI INDEC), despachos de cemento para la construcción y fabricación automotriz.'
      };
    case 'credito_salarios':
    default:
      return {
        question: '¿Cómo acompañan los sueldos y el crédito bancario?',
        summary: 'Evolución del salario formal registrado (RIPTE) frente a los precios y financiamiento bancario al sector privado.'
      };
  }
}

// Semantic Side-by-Side Variable Pairings (ej: Dólar Blue a la derecha del Dólar Oficial)
export const SEMANTIC_PAIRS_AR: [string, string][] = [
  ['bna_dolar_billete', 'dolar_blue'],                 // Dólar Oficial (izq) y Dólar Blue (der)
  ['dolar_mep_byma', 'dolar_ccl_byma'],                 // Dólar MEP (izq) y Dólar CCL (der)
  ['riesgo_pais_embi', 'reservas_brutas'],              // Riesgo País (izq) y Reservas BCRA (der)
  ['bna_dolar_divisa', 'dolar_tarjeta'],                // Mayorista (izq) y Tarjeta (der)
  ['ipc_inflacion_mensual', 'rem_inflacion_esperada'],   // IPC (izq) y REM (der)
  ['canasta_basica_total', 'canasta_basica_alimentaria'],// CBT y CBA
  ['icc_cac_construccion', 'ipim_mayorista_indec'],     // Costo de Construcción y Mayorista
  ['tasa_plazo_fijo_bna', 'tasa_badlar'],               // Plazo Fijo BNA y Tasa BADLAR
  ['valor_uva', 'coeficiente_cer'],                     // UVA y CER
  ['caucion_bursatil_byma', 'rendimiento_fci_money_market'], // Caución Bursátil y FCI
  ['emae_actividad_indec', 'produccion_automotriz_adefa'],   // EMAE y ADEFA
  ['demanda_electrica_cammesa', 'ventas_minoristas_came'],   // Electricidad y CAME
  ['ripte_salario_estable', 'indice_icl'],              // RIPTE y Coeficiente ICL
  ['creditos_hipotecarios_uva', 'stock_credito_privado'],// Créditos Hipotecarios UVA y Stock
  ['recaudacion_tributaria_arca', 'escrituras_caba'],   // Recaudación ARCA y Escrituras
  ['dolar_cripto', 'liquidacion_ciara_cec']             // Dólar Cripto y Liquidación CIARA
];

export const SEMANTIC_PAIRS_BR: [string, string][] = [
  ['bcb_dolar_ptax_venda', 'bcb_dolar_turismo'],       // Dólar Comercial PTAX (esq) e Turismo (dir)
  ['bcb_euro_ptax', 'ouro_b3'],                        // Euro PTAX (esq) e Ouro (dir)
  ['risco_pais_embi_br', 'bcb_reservas_internacionais'], // Risco País (esq) e Reservas (dir)
  ['ibge_ipca_mensual', 'fgv_igpm'],                   // IPCA (esq) e IGP-M (dir)
  ['ibge_inpc', 'cesta_basica_dieese'],
  ['bcb_selic_meta', 'b3_cdi_taxa'],                   // Selic (esq) e CDI (dir)
  ['tesouro_selic_taxa', 'poupanca_rendimento'],
  ['ibge_producao_industrial', 'anfavea_veiculos_producao'],
  ['b3_ibovespa_pontos', 'balanca_comercial_mensal'],
  ['salario_minimo_nacional', 'caged_emprego_saldo'],
  ['divida_bruta_pib', 'credito_bancario_total']
];

export type ChartYScaleMode = 'auto' | 'zero' | 'percent';

interface ChartScaleControlsProps {
  range: '30D' | '90D' | '1Y' | '3Y';
  onRangeChange: (r: '30D' | '90D' | '1Y' | '3Y') => void;
  yScale: ChartYScaleMode;
  onYScaleChange: (s: ChartYScaleMode) => void;
  paddingLevel: number;
  onPaddingLevelChange: (lvl: number) => void;
  periodLabel?: string;
}

function ChartScaleControls({
  range,
  onRangeChange,
  yScale,
  onYScaleChange,
  paddingLevel,
  onPaddingLevelChange,
  periodLabel = "Período"
}: ChartScaleControlsProps) {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80">
        {/* Selector de Rango Temporal */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500">{periodLabel}:</span>
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
            {(['30D', '90D', '1Y', '3Y'] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => onRangeChange(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  range === r
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Escala Vertical (Eje Y) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <span>Escala Eje Y:</span>
          </span>
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => onYScaleChange('auto')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                yScale === 'auto'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Escala Dinámica: Ajusta el eje vertical al rango exacto de oscilación para ver quiebres y tendencias detalladas"
            >
              Dinámica
            </button>
            <button
              type="button"
              onClick={() => onYScaleChange('zero')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                yScale === 'zero'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Escala Base Cero: Inicia el eje vertical desde 0 para visualizar la magnitud absoluta y la proporción real sin exageraciones"
            >
              Desde 0
            </button>
            <button
              type="button"
              onClick={() => onYScaleChange('percent')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                yScale === 'percent'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
              title="Escala Variación %: Normaliza la serie en porcentaje de variación acumulada respecto al inicio del período (Base 0%)"
            >
              Variación %
            </button>
          </div>

          {/* Ajuste fino de margen en escala dinámica */}
          {yScale === 'auto' && (
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200/90 text-[10px] text-slate-600 shadow-2xs">
              <span className="text-slate-400">Margen:</span>
              {[4, 8, 15].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onPaddingLevelChange(lvl)}
                  className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                    paddingLevel === lvl
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title={`Margen vertical de ${lvl}%`}
                >
                  {lvl}%
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nota explicativa de la escala actual */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>
          {yScale === 'auto' && (
            <span>🔍 <strong>Escala Dinámica:</strong> Enfocada en la oscilación del período (margen ±{paddingLevel}%) para observar cada quiebre de tendencia con nitidez.</span>
          )}
          {yScale === 'zero' && (
            <span>📏 <strong>Escala Base Cero:</strong> Proporción real partiendo desde 0. Ideal para corroborar si la oscilación es marginal o de gran impacto.</span>
          )}
          {yScale === 'percent' && (
            <span>📈 <strong>Escala Variación %:</strong> Valores normalizados al inicio del período (Base 0%). Muestra el rendimiento acumulado real.</span>
          )}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  // --- Country Selection State (defaults to AR or persisted) ---
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    try {
      const saved = localStorage.getItem('econo_country');
      return (saved === 'BR' || saved === 'AR') ? (saved as CountryCode) : 'AR';
    } catch {
      return 'AR';
    }
  });

  // --- Data State (dynamically initialized by country, synced to current date) ---
  const [variables, setVariables] = useState<EconomicVariable[]>(() => {
    const base = selectedCountry === 'BR' ? BRAZIL_ECONOMIC_VARIABLES : ARGENTINA_ECONOMIC_VARIABLES;
    return syncVariablesToCurrentDate(base).updatedVariables;
  });
  const [bankRates, setBankRates] = useState<BankFixedTermRate[]>(() =>
    selectedCountry === 'BR' ? computeBrazilBankRates() : computeBankRates()
  );
  const [topics, setTopics] = useState<EconomicTopic[]>(() =>
    selectedCountry === 'BR' ? BRAZIL_ECONOMIC_TOPICS : ECONOMIC_TOPICS
  );

  // Switch between Argentina and Brazil
  const handleSelectCountry = (newCountry: CountryCode) => {
    if (newCountry === selectedCountry) return;
    setSelectedCountry(newCountry);
    try {
      localStorage.setItem('econo_country', newCountry);
    } catch {}

    const rawVars = newCountry === 'BR' ? BRAZIL_ECONOMIC_VARIABLES : ARGENTINA_ECONOMIC_VARIABLES;
    const newVars = syncVariablesToCurrentDate(rawVars).updatedVariables;
    const newTopicsList = newCountry === 'BR' ? BRAZIL_ECONOMIC_TOPICS : ECONOMIC_TOPICS;
    const newRates = newCountry === 'BR' ? computeBrazilBankRates() : computeBankRates();

    setVariables(newVars);
    setTopics(newTopicsList);
    setBankRates(newRates);
    setSelectedTopicFilter('ALL');
    setSelectedVarId(newVars[0].id);

    // Adjust default simulator capital (R$ 10.000 vs $ 100.000 ARS)
    if (newCountry === 'BR') {
      setSimAmount(10000);
    } else {
      setSimAmount(100000);
    }

    triggerToast(
      newCountry === 'BR'
        ? '🇧🇷 Mercado Brasileiro Carregado (BCB, IBGE, B3, FGV)'
        : '🇦🇷 Mercado Argentino Cargado (BCRA, BNA, INDEC)'
    );
  };

  // Tab State - THE USER'S FIRST EXPERIENCE IS THEIR TOPICS OF INTEREST
  const [activeTab, setActiveTab] = useState<Tab>('temas');

  // Topic Filter in Temas View
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<'ALL' | TopicId>('ALL');

  // User-selected topics of interest (persisted in localStorage)
  const [userInterestTopicIds, setUserInterestTopicIds] = useState<TopicId[]>(() => {
    try {
      const saved = localStorage.getItem('econo_user_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      'cambiario_divisas',
      'precios_inflacion',
      'tasas_ahorro',
      'actividad_industria',
      'credito_salarios'
    ];
  });

  const [isCustomizingTopics, setIsCustomizingTopics] = useState<boolean>(false);

  // Active variable for chart inspection
  const [selectedVarId, setSelectedVarId] = useState<string>(() =>
    selectedCountry === 'BR' ? 'bcb_dolar_ptax_venda' : 'bna_dolar_billete'
  );
  const [chartRange, setChartRange] = useState<'30D' | '90D' | '1Y' | '3Y'>('90D');
  const [chartYScale, setChartYScale] = useState<'auto' | 'zero' | 'percent'>('auto');
  const [chartPaddingLevel, setChartPaddingLevel] = useState<number>(8); // 8% de margen vertical predeterminado
  const [isChartModalOpen, setIsChartModalOpen] = useState<boolean>(false);

  // Global Currency Measurement Mode (ARS vs USD Oficial Desinflado)
  const [isUsdMeasureMode, setIsUsdMeasureMode] = useState<boolean>(false);

  // Plazo Fijo Simulator State
  const [simAmount, setSimAmount] = useState<number>(() => (selectedCountry === 'BR' ? 10000 : 100000));
  const [simDays, setSimDays] = useState<number>(30);
  const [bankTypeFilter, setBankTypeFilter] = useState<'all' | 'publico' | 'privado' | 'non_clients'>('all');

  // Search in catalogue
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Tablero 3x3 layout state (3 filas con 3 recuadros cada fila = 9 por pantalla)
  const [dashboardPage, setDashboardPage] = useState<number>(1);
  const [isViewAllMode, setIsViewAllMode] = useState<boolean>(false);
  const [isPairedView, setIsPairedView] = useState<boolean>(true); // Variable apareada a la derecha por defecto
  const [frequencyFilter, setFrequencyFilter] = useState<'ALL' | 'Diaria' | 'Mensual'>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'gainers' | 'losers' | 'name'>('default');

  // Autonomous Daily News Briefing State (5 cosas del día)
  const [isDailyNewsOpen, setIsDailyNewsOpen] = useState<boolean>(false);

  // Auto-Update Engine State (Revisión automática en segundo plano cada 5 minutos)
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastVerifiedTime, setLastVerifiedTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Save topic preferences
  const toggleTopicInterest = (topicId: TopicId) => {
    let next: TopicId[];
    if (userInterestTopicIds.includes(topicId)) {
      if (userInterestTopicIds.length <= 1) {
        triggerToast('Debes mantener al menos 1 tema de interés.');
        return;
      }
      next = userInterestTopicIds.filter(id => id !== topicId);
    } else {
      next = [...userInterestTopicIds, topicId];
    }
    setUserInterestTopicIds(next);
    try {
      localStorage.setItem('econo_user_topics', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Initial load and periodic refresh
  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const [varsRes, banksRes] = await Promise.all([
        fetch(`/api/variables?country=${selectedCountry}`),
        fetch(`/api/plazos-fijos?country=${selectedCountry}`)
      ]);

      if (varsRes.ok) {
        const varsData = await varsRes.json();
        if (Array.isArray(varsData) && varsData.length > 0) {
          setVariables(varsData);
        }
      }
      if (banksRes.ok) {
        const banksData = await banksRes.json();
        if (banksData.rates) setBankRates(banksData.rates);
      }
      setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.variables && selectedCountry === 'AR') setVariables(data.variables);
        if (selectedCountry === 'BR') {
          setBankRates(computeBrazilBankRates());
        } else {
          setBankRates(computeBankRates());
        }
        setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        triggerToast('Revisión completada: datos al día con fuentes oficiales');
      }
    } catch {
      await loadData(true);
      setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setIsSyncing(false);
    }
  };

  // Revisión automática de la plataforma en segundo plano cada 5 minutos
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
      setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedCountry]);

  // Currency & numbers formatting
  const formatCurrency = (val: number, decimals = 2) => {
    if (selectedCountry === 'BR') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(val);
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const formatArs = formatCurrency;

  const formatRate = (val: number) => {
    return `${val.toFixed(2)}%`;
  };

  // Tipo de cambio oficial BNA para desinflación y medición en USD
  const officialDollarRate = useMemo(() => {
    const dDivisa = variables.find(v => v.id === 'bna_dolar_divisa');
    if (dDivisa && dDivisa.value > 0) return dDivisa.value;
    const dBillete = variables.find(v => v.id === 'bna_dolar_billete');
    if (dBillete && dBillete.value > 0) return dBillete.value;
    return DEFAULT_OFFICIAL_USD_RATE;
  }, [variables]);

  const formatVariableValue = (variable: EconomicVariable) => {
    const locale = selectedCountry === 'BR' ? 'pt-BR' : 'es-AR';

    // Conversión a Dólares Estadounidenses Oficiales (desinflados) si el modo está activo
    if (selectedCountry === 'AR' && isUsdMeasureMode && isVariableEligibleForUsdConversion(variable)) {
      const conv = convertVariableToUsd(variable, officialDollarRate);
      return conv.displayValue;
    }

    if (variable.unit.includes('ARS/USD')) {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(variable.value);
    }
    if (variable.unit.includes('BRL/USD') || variable.unit.includes('BRL/EUR')) {
      return `R$ ${variable.value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
    }
    if (variable.unit === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(variable.value);
    }
    if (variable.unit.includes('Millones BRL')) {
      return `R$ ${(variable.value / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} Tri`;
    }
    if (variable.unit.startsWith('%') || variable.unit.includes('%')) {
      const prefix = variable.value > 0 && variable.unit.includes('interanual') ? '+' : '';
      return `${prefix}${variable.value.toFixed(2)}%`;
    }
    if (variable.unit.includes('USD')) {
      return `USD ${variable.value.toLocaleString(locale)} M`;
    }
    if (variable.unit === 'ARS') {
      return formatCurrency(variable.value, 0);
    }
    if (variable.unit.includes('Millones de ARS')) {
      return `$${(variable.value / 1000000).toLocaleString('es-AR', { maximumFractionDigits: 2 })} B`;
    }
    if (variable.unit.includes('Unidades') || variable.unit.includes('Actos') || variable.unit.includes('GWh') || variable.unit.includes('MW')) {
      return `${variable.value.toLocaleString(locale)} ${variable.unit.split('/')[0]}`;
    }
    return `${variable.value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${variable.unit}`;
  };

  const calculateBankReturn = (tna: number, amount: number, days: number) => {
    const interest = (amount * (tna / 100) * days) / 365;
    return {
      interest: Math.round(interest),
      total: Math.round(amount + interest),
      pct: parseFloat(((interest / amount) * 100).toFixed(2))
    };
  };

  // Selected variable for chart
  const activeVar = useMemo(() => {
    return variables.find(v => v.id === selectedVarId) || variables[0];
  }, [variables, selectedVarId]);

  // Unidad de despliegue activa (considerando desinflación a USD)
  const activeUnit = useMemo(() => {
    if (!activeVar) return '';
    if (selectedCountry === 'AR' && isUsdMeasureMode && isVariableEligibleForUsdConversion(activeVar)) {
      return activeVar.unit.toLowerCase().includes('millones') ? 'Millones USD' : 'US$ Oficial';
    }
    return activeVar.unit;
  }, [activeVar, isUsdMeasureMode, selectedCountry]);

  // Chart data calculation
  const chartData = useMemo(() => {
    if (!activeVar || !activeVar.history || activeVar.history.length === 0) return [];

    const todayStr = getArgentinaTodayDate();
    const isPeriodic = activeVar.frequency !== 'Diaria';

    let result: { date: string; value: number }[] = [];

    if (isPeriodic) {
      // Para series mensuales o periódicas, respetar la elección del usuario:
      const fullHistory = [...activeVar.history];
      if (chartRange === '30D') {
        result = fullHistory.slice(-4); // Últimos 4 períodos
      } else if (chartRange === '90D') {
        result = fullHistory.slice(-7); // Últimos 7 períodos
      } else if (chartRange === '1Y') {
        result = fullHistory.slice(-13); // Últimos 13 períodos
      } else {
        result = fullHistory; // Historial completo de 3 años
      }
    } else {
      // Para series diarias (cotizaciones, tasas, etc.)
      const refDate = new Date();
      let daysToSubtract = 90;
      if (chartRange === '30D') daysToSubtract = 30;
      else if (chartRange === '90D') daysToSubtract = 90;
      else if (chartRange === '1Y') daysToSubtract = 365;
      else if (chartRange === '3Y') daysToSubtract = 365 * 3;

      const cutoffDate = new Date(refDate);
      cutoffDate.setDate(refDate.getDate() - daysToSubtract);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      const filtered = activeVar.history.filter(point => point.date >= cutoffStr && point.date <= todayStr);

      if (filtered.length <= 1) {
        const count = chartRange === '30D' ? 30 : chartRange === '90D' ? 90 : chartRange === '1Y' ? 365 : activeVar.history.length;
        result = activeVar.history.slice(-Math.min(activeVar.history.length, count));
      } else {
        if (chartRange === '3Y' && filtered.length > 50) {
          result = filtered.filter((_, idx) => idx % 2 === 0 || idx === filtered.length - 1);
        } else {
          result = filtered;
        }
      }
    }

    // Sincronización final: garantizar que el último punto del gráfico coincida exactamente con activeVar.value
    if (result.length > 0) {
      const copy = [...result];
      const activeDate = activeVar.lastUpdated || todayStr;
      copy[copy.length - 1] = { ...copy[copy.length - 1], value: activeVar.value };

      // Si el usuario activó la opción de ver series en USD Oficial desinfladas
      if (selectedCountry === 'AR' && isUsdMeasureMode && isVariableEligibleForUsdConversion(activeVar)) {
        return deflateHistoricalSeriesToUsd(copy, officialDollarRate);
      }

      return copy;
    }

    return result;
  }, [activeVar, chartRange, isUsdMeasureMode, selectedCountry, officialDollarRate]);

  // Statistical indicators
  const chartStats = useMemo(() => {
    if (!chartData || chartData.length === 0 || !activeVar) return null;
    const firstPoint = chartData[0];
    const lastPoint = chartData[chartData.length - 1];
    const initialVal = firstPoint.value;
    const finalVal = activeVar.value !== undefined ? activeVar.value : lastPoint.value;
    const nominalDiff = finalVal - initialVal;
    const percentChange = initialVal !== 0 ? ((nominalDiff / initialVal) * 100) : 0;
    const values = chartData.map(p => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const percentValues = chartData.map(p => initialVal !== 0 ? ((p.value - initialVal) / initialVal) * 100 : 0);
    const minPercent = Math.min(...percentValues);
    const maxPercent = Math.max(...percentValues);

    return {
      firstPoint,
      lastPoint,
      initialVal,
      finalVal,
      nominalDiff,
      percentChange,
      minVal,
      maxVal,
      minPercent,
      maxPercent
    };
  }, [chartData, activeVar]);

  // Active chart data: intercambia entre valores nominales y variación % relativa
  const activeChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    if (chartYScale !== 'percent') return chartData;
    const initial = chartData[0].value;
    return chartData.map(p => ({
      ...p,
      nominalValue: p.value,
      value: initial !== 0 ? Number((((p.value - initial) / initial) * 100).toFixed(2)) : 0
    }));
  }, [chartData, chartYScale]);

  // Cálculo calibrado del dominio del eje vertical (Y) según la escala seleccionada
  const yAxisDomain = useMemo<[number | 'auto', number | 'auto']>(() => {
    if (!chartStats) return ['auto', 'auto'];

    if (chartYScale === 'percent') {
      const minP = chartStats.minPercent;
      const maxP = chartStats.maxPercent;
      const spread = Math.max(Math.abs(maxP - minP), 1.5);
      const pad = spread * (chartPaddingLevel / 100);
      const lower = Math.floor((minP - pad) * 10) / 10;
      const upper = Math.ceil((maxP + pad) * 10) / 10;
      return [lower, upper];
    }

    if (chartYScale === 'zero') {
      const minV = chartStats.minVal;
      const maxV = chartStats.maxVal;
      if (minV >= 0) {
        const top = maxV > 0 ? Number((maxV * 1.08).toFixed(maxV < 10 ? 2 : 1)) : 10;
        return [0, top];
      } else {
        const pad = (maxV - minV) * 0.08;
        return [
          Number((minV - pad).toFixed(2)),
          Number((maxV + pad).toFixed(2))
        ];
      }
    }

    // Modo 'auto': Escala dinámica con margen inteligente para ver quiebres reales
    const minV = chartStats.minVal;
    const maxV = chartStats.maxVal;
    const diff = maxV - minV;

    if (diff === 0) {
      const margin = minV !== 0 ? Math.abs(minV) * 0.08 : 1;
      return [
        Number((minV - margin).toFixed(minV < 10 ? 2 : 1)),
        Number((maxV + margin).toFixed(maxV < 10 ? 2 : 1))
      ];
    }

    const padRatio = chartPaddingLevel / 100;
    const padding = Math.max(diff * padRatio, Math.abs(minV) * 0.004);
    const lower = minV - padding;
    const upper = maxV + padding;

    return [
      Number(lower.toFixed(lower < 10 ? 2 : 1)),
      Number(upper.toFixed(upper < 10 ? 2 : 1))
    ];
  }, [chartStats, chartYScale, chartPaddingLevel]);

  // Formateador limpio de números en el eje vertical
  const formatYTick = (val: number) => {
    if (val === undefined || val === null || isNaN(val)) return '';
    if (chartYScale === 'percent') {
      return `${val > 0 ? '+' : ''}${val.toFixed(val % 1 !== 0 ? 1 : 0)}%`;
    }
    const abs = Math.abs(val);
    if (abs >= 1_000_000) {
      return `${(val / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}M`;
    }
    if (abs >= 10_000) {
      return val.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    }
    if (abs >= 100) {
      return val.toLocaleString('es-AR', { maximumFractionDigits: 1 });
    }
    if (abs >= 1) {
      return val.toLocaleString('es-AR', { maximumFractionDigits: 2 });
    }
    return val.toLocaleString('es-AR', { maximumFractionDigits: 3 });
  };

  const formatChartDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const day = parts[2];
    const month = parts[1];
    const year = parts[0].slice(2);

    if (activeVar?.frequency !== 'Diaria') {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mIdx = parseInt(month, 10) - 1;
      const mName = monthNames[mIdx] || month;
      return `${mName} '${year}`;
    }

    if (chartRange === '30D' || chartRange === '90D') {
      return `${day}/${month}`;
    }
    return `${month}/${year}`;
  };

  // Inspect variable helper
  const openVariableInspector = (varId: string) => {
    setSelectedVarId(varId);
    setIsChartModalOpen(true);
  };

  // Filtered banks
  const filteredBanks = bankRates.filter(b => {
    if (bankTypeFilter === 'publico') return b.type === 'publico';
    if (bankTypeFilter === 'privado') return b.type === 'privado';
    if (bankTypeFilter === 'non_clients') return b.nonClientOnline;
    return true;
  });

  const bnaBank = bankRates.find(b => b.id === 'banco_nacion') || bankRates.find(b => b.type === 'publico') || bankRates[0];
  const topBank = bankRates[0];

  // Specific variables for quick reference
  const bnaBillete = variables.find(v => v.id === 'bna_dolar_billete') || variables.find(v => v.id === 'bcb_dolar_ptax_venda');
  const bnaDivisa = variables.find(v => v.id === 'bna_dolar_divisa') || variables.find(v => v.id === 'bcb_dolar_turismo');

  // Filtered Topics for the user
  const displayedTopics = useMemo(() => {
    return topics.filter(topic => {
      if (selectedTopicFilter !== 'ALL' && topic.id !== selectedTopicFilter) {
        return false;
      }
      return userInterestTopicIds.includes(topic.id);
    });
  }, [topics, selectedTopicFilter, userInterestTopicIds]);

  // Filtered variables for the 3x3 Tablero (3 filas con 3 recuadros cada fila = 9 por pantalla)
  const dashboardVariables = useMemo(() => {
    let result = variables.filter(v => {
      if (selectedTopicFilter !== 'ALL' && v.topicId !== selectedTopicFilter) {
        return false;
      }
      if (selectedTopicFilter === 'ALL' && !userInterestTopicIds.includes(v.topicId as TopicId)) {
        return false;
      }
      if (frequencyFilter !== 'ALL' && v.frequency !== frequencyFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return v.name.toLowerCase().includes(q) || v.source.toLowerCase().includes(q);
      }
      return true;
    });

    if (sortBy === 'gainers' || sortBy === 'losers') {
      result = [...result].sort((a, b) => {
        const getPct = (v: EconomicVariable) => {
          if (!v.history || v.history.length < 2) return 0;
          const prev = v.history[v.history.length - 2].value;
          return prev !== 0 ? ((v.value - prev) / prev) * 100 : 0;
        };
        const deltaA = getPct(a);
        const deltaB = getPct(b);
        return sortBy === 'gainers' ? deltaB - deltaA : deltaA - deltaB;
      });
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [variables, selectedTopicFilter, userInterestTopicIds, frequencyFilter, sortBy, searchQuery]);

  // Semantic & dynamic pairing (ej: Dólar Blue a la derecha del Dólar Oficial)
  const pairedDashboardVariables = useMemo(() => {
    const pairsMap = selectedCountry === 'BR' ? SEMANTIC_PAIRS_BR : SEMANTIC_PAIRS_AR;
    const remaining = [...dashboardVariables];
    const pairs: { id: string; left: EconomicVariable; right?: EconomicVariable }[] = [];

    // 1. Emparejar primero según correspondencias semánticas directas (Oficial ↔ Blue, MEP ↔ CCL, etc.)
    for (const [leftId, rightId] of pairsMap) {
      const leftIdx = remaining.findIndex(v => v.id === leftId);
      const rightIdx = remaining.findIndex(v => v.id === rightId);
      if (leftIdx !== -1 && rightIdx !== -1) {
        const leftVar = remaining[leftIdx];
        const rightVar = remaining[rightIdx];
        pairs.push({
          id: `${leftVar.id}_${rightVar.id}`,
          left: leftVar,
          right: rightVar
        });
        const higherIdx = Math.max(leftIdx, rightIdx);
        const lowerIdx = Math.min(leftIdx, rightIdx);
        remaining.splice(higherIdx, 1);
        remaining.splice(lowerIdx, 1);
      }
    }

    // 2. Emparejar variables restantes consecutivamente de a pares
    while (remaining.length > 0) {
      const left = remaining.shift()!;
      const right = remaining.shift();
      pairs.push({
        id: right ? `${left.id}_${right.id}` : left.id,
        left,
        right
      });
    }

    return pairs;
  }, [dashboardVariables, selectedCountry]);

  const activeTotalItems = isPairedView ? pairedDashboardVariables.length : dashboardVariables.length;
  const ITEMS_PER_SCREEN = 9; // Exactly 3 filas con 3 recuadros cada fila!
  const totalPages = Math.max(1, Math.ceil(activeTotalItems / ITEMS_PER_SCREEN));
  const currentPage = Math.min(dashboardPage, totalPages);

  const displayedPairs = isViewAllMode
    ? pairedDashboardVariables
    : pairedDashboardVariables.slice((currentPage - 1) * ITEMS_PER_SCREEN, currentPage * ITEMS_PER_SCREEN);

  const displayedVariables = isViewAllMode
    ? dashboardVariables
    : dashboardVariables.slice((currentPage - 1) * ITEMS_PER_SCREEN, currentPage * ITEMS_PER_SCREEN);

  // Edición 05:00 AM: 5 Claves Económicas del Día (Argentina & El Mundo con Triple Chequeo de Validez)
  const dailyBriefing = useMemo(() => getDailyNewsBriefing(selectedCountry, variables), [selectedCountry, variables]);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 selection:bg-blue-600 selection:text-white pb-24 md:pb-16 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <Check className="size-3.5 text-blue-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Bar with Modern Econoapp Logo */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between gap-6">
          
          {/* Zone 1: Modern Econoapp Logo with Country Flag and Switcher */}
          <EconoLogo
            onClick={() => setActiveTab('temas')}
            country={selectedCountry}
            onSelectCountry={handleSelectCountry}
          />

          {/* Zone 2: Navigation Links (Clean single-line text) */}
          {/* Zone 2: Navigation Links (Iconographic & Clean) */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('temas')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap px-3 py-1.5 rounded-lg ${
                activeTab === 'temas'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span>📑</span>
              <span>Temas</span>
            </button>
            <button
              onClick={() => setActiveTab('cotizaciones')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap px-3 py-1.5 rounded-lg ${
                activeTab === 'cotizaciones' ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span>💱</span>
              <span>{selectedCountry === 'BR' ? 'Cotações' : 'Cotizaciones'}</span>
            </button>
            <button
              onClick={() => setActiveTab('plazo_fijo')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap px-3 py-1.5 rounded-lg ${
                activeTab === 'plazo_fijo' ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span>💰</span>
              <span>{selectedCountry === 'BR' ? 'CDB' : 'Plazo Fijo'}</span>
            </button>
            <button
              onClick={() => setActiveTab('tendencias')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap px-3 py-1.5 rounded-lg ${
                activeTab === 'tendencias' ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span>📈</span>
              <span>{selectedCountry === 'BR' ? 'Tendências' : 'Tendencias'}</span>
            </button>
            <button
              onClick={() => setActiveTab('fuentes')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap px-3 py-1.5 rounded-lg ${
                activeTab === 'fuentes' ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <span>🏛️</span>
              <span>{selectedCountry === 'BR' ? 'Fontes' : 'Fuentes'}</span>
            </button>
          </nav>

          {/* Zone 3: Currency Switcher, Live Status, Autonomous 5 News & Manual Sync */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Currency Mode Switcher (ARS vs USD Oficial BNA Desinflado) */}
            {selectedCountry === 'AR' && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsUsdMeasureMode(false)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                    !isUsdMeasureMode
                      ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-300'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Medir en Pesos Argentinos (ARS)"
                >
                  <span>🇦🇷</span>
                  <span>ARS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUsdMeasureMode(true)}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                    isUsdMeasureMode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title={`Pasar mediciones a Dólares Estadounidenses al Tipo de Cambio Oficial BNA ($${officialDollarRate.toLocaleString('es-AR')})`}
                >
                  <span>💵</span>
                  <span className="hidden sm:inline">USD</span>
                  <span className="text-[10px] font-semibold opacity-95">Oficial</span>
                </button>
              </div>
            )}

            {/* Autonomous 5 News Button */}
            <button
              onClick={() => setIsDailyNewsOpen(true)}
              className="h-8 px-2.5 sm:px-3 text-xs font-bold text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 group"
              title="5 cosas que la gente debería saber hoy (Argentina y el Mundo)"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">📰</span>
              <span className="hidden sm:inline">5 Claves del Día</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            </button>

            <span
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 px-2.5 py-1 bg-slate-100/90 rounded-md border border-slate-200"
              title="Datos sincronizados con fuentes oficiales"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-800">🟢 En vivo</span>
            </span>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="h-8 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-60 shadow-2xs"
              title="Actualizar datos oficiales"
            >
              <RefreshCw className={`size-3 text-slate-500 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden xs:inline">{isSyncing ? 'Sincronizando' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (Ultra Space-Optimized) */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 pt-2.5 sm:pt-3 space-y-2.5 sm:space-y-3">

        {/* Banner de Medición en USD Oficial Desinflado cuando está activo */}
        {selectedCountry === 'AR' && isUsdMeasureMode && (
          <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-200/90 flex items-center justify-between text-xs text-blue-950 shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-lg shrink-0">💵</span>
              <div className="min-w-0">
                <span className="font-bold text-blue-900 block sm:inline mr-1.5">
                  Modo Medición en USD Oficial (BNA):
                </span>
                <span className="text-slate-700">
                  Las series en pesos se muestran desinfladas al tipo de cambio oficial BNA (<strong>${officialDollarRate.toLocaleString('es-AR')}</strong>) para evaluar la evolución en poder adquisitivo en moneda dura.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUsdMeasureMode(false)}
              className="text-[11px] font-bold px-2.5 py-1 bg-white hover:bg-slate-100 border border-blue-300 rounded-lg text-blue-800 shrink-0 ml-2 shadow-2xs transition-all"
            >
              Ver en ARS
            </button>
          </div>
        )}

        {/* Botón Principal al Principio: 5 Claves Económicas del Día (Argentina & El Mundo) */}
        <div
          onClick={() => setIsDailyNewsOpen(true)}
          className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs hover:border-blue-400/80 transition-all border border-blue-900/60 shadow-2xs group"
          title="Abrir 5 Claves Económicas del Día (Edición 05:00 AM · Triple Chequeo de Validez)"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              📰
            </span>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                  {selectedCountry === 'BR' ? '5 Coisas que Você Precisa Saber Hoje (Brasil & Mundo)' : '5 Cosas que Deberías Saber Hoy (Argentina & El Mundo)'}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold uppercase shrink-0">
                  05:00 AM
                </span>
              </div>
              <span className="text-[10px] text-slate-300 block truncate mt-0.5">
                {selectedCountry === 'BR'
                  ? 'Copom/Selic, IPCA, Dólar PTAX, Fed e Safra resumidos em 2 min'
                  : 'Riesgo País (1.042 pb), Dólar, IPC, Cosecha/Reservas y tasas de la Fed en 2 min'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 shadow-2xs group-hover:bg-blue-400 group-hover:text-slate-950 transition-all">
            <span>Leer</span>
            <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex p-1 bg-slate-200/60 rounded-xl gap-1 text-xs font-medium overflow-x-auto scrollbar-none border border-slate-200/80">
          <button
            onClick={() => setActiveTab('temas')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'temas' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <span>📑</span>
            <span>Temas</span>
          </button>
          <button
            onClick={() => setActiveTab('cotizaciones')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'cotizaciones' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <span>💱</span>
            <span>{selectedCountry === 'BR' ? 'Cotações' : 'Cotizaciones'}</span>
          </button>
          <button
            onClick={() => setActiveTab('plazo_fijo')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'plazo_fijo' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <span>💰</span>
            <span>{selectedCountry === 'BR' ? 'CDB' : 'Plazos'}</span>
          </button>
          <button
            onClick={() => setActiveTab('tendencias')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'tendencias' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <span>📈</span>
            <span>Gráficos</span>
          </button>
          <button
            onClick={() => setActiveTab('fuentes')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'fuentes' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <span>🏛️</span>
            <span>Fuentes</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TEMAS DE INTERÉS PRIMERO, DATOS DESPUÉS */}
        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* TAB 1: TABLERO MINIMALISTA ULTRA OPTIMIZADO (3x3 EN PANTALLA) */}
        {/* ============================================================ */}
        {activeTab === 'temas' && (
          <div className="space-y-2.5">
            {/* Grid de Recuadros Ultra-Optimizados: 3x3 (3 columnas x 3 filas) */}
            {isPairedView ? (
              /* MODO PARES: 2 variables complementarias dentro de cada recuadro (ej: Blue a la derecha de Oficial) */
              displayedPairs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                  {displayedPairs.map(pair => {
                    const renderSubItem = (variable: EconomicVariable, side: 'left' | 'right') => {
                      const hasHistory = variable.history && variable.history.length > 1;
                      const latestVal = variable.value;
                      const prevPoint = hasHistory ? variable.history[variable.history.length - 2] : null;
                      const delta = prevPoint ? latestVal - prevPoint.value : 0;
                      const deltaPct = prevPoint && prevPoint.value !== 0 ? ((delta / prevPoint.value) * 100) : 0;
                      const isPositiveDelta = delta >= 0;
                      return (
                        <div
                          key={variable.id}
                          onClick={() => openVariableInspector(variable.id)}
                          className="group relative p-1.5 sm:p-2 hover:bg-blue-50/50 rounded-xl transition-all cursor-pointer flex flex-col justify-between min-w-0"
                          title={`Ver detalle y gráfico de ${variable.name}`}
                        >
                          {/* Fila Superior: Icono de trazo limpio estilo Meta + Nombre */}
                          <div className="flex items-center justify-between gap-1 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <MetaIcon variableId={variable.id} topicId={variable.topicId} size="xs" />
                              <h4 className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors leading-tight min-w-0">
                                {variable.name}
                              </h4>
                            </div>
                          </div>

                          {/* Fila Inferior: Valor numérico grande + Delta + Referencia de comparación */}
                          <div className="flex items-end justify-between gap-1 pt-1 border-t border-slate-100/80 mt-1">
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-[13px] font-black tracking-tight text-slate-950 tabular-nums leading-none truncate">
                                {formatVariableValue(variable)}
                              </div>
                              <div className="mt-0.5 flex flex-col">
                                {delta !== 0 ? (
                                  <span className={`text-[9px] font-bold inline-flex items-center ${
                                    delta > 0 ? 'text-emerald-700' : 'text-rose-700'
                                  }`}>
                                    {delta > 0 ? <ArrowUpRight className="size-2 mr-0.5" /> : <ArrowDownRight className="size-2 mr-0.5" />}
                                    {delta > 0 ? '+' : ''}{deltaPct.toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-400">0.0%</span>
                                )}
                                {variable.comparisonLabel && (
                                  <span className="text-[8px] text-slate-400 truncate leading-none mt-0.5" title={variable.comparisonLabel}>
                                    {variable.comparisonLabel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div
                        key={pair.id}
                        className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400/80 transition-all duration-200 shadow-2xs hover:shadow-xs grid grid-cols-2 divide-x divide-slate-100 min-h-[78px] sm:h-[82px] overflow-hidden"
                      >
                        {renderSubItem(pair.left, 'left')}
                        {pair.right ? (
                          renderSubItem(pair.right, 'right')
                        ) : (
                          <div className="p-2 flex items-center justify-center text-[10px] text-slate-300 italic">
                            —
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  <span>No se encontraron variables con los filtros aplicados.</span>
                </div>
              )
            ) : (
              /* MODO SIMPLE: 1 variable por recuadro */
              displayedVariables.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                  {displayedVariables.map(variable => {
                    const hasHistory = variable.history && variable.history.length > 1;
                    const latestVal = variable.value;
                    const prevPoint = hasHistory ? variable.history[variable.history.length - 2] : null;
                    const delta = prevPoint ? latestVal - prevPoint.value : 0;
                    const deltaPct = prevPoint && prevPoint.value !== 0 ? ((delta / prevPoint.value) * 100) : 0;
                    const isPositiveDelta = delta >= 0;

                    return (
                      <div
                        key={variable.id}
                        onClick={() => openVariableInspector(variable.id)}
                        className="group relative rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-blue-500/80 p-2 sm:p-2.5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] flex flex-col justify-between h-[78px] sm:h-[82px]"
                      >
                        {/* Fila Superior: MetaIcon + Nombre + Fuente */}
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <MetaIcon variableId={variable.id} topicId={variable.topicId} size="xs" />
                            <div className="min-w-0 flex-1 flex items-baseline gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors leading-tight">
                                {variable.name}
                              </h4>
                              <span className="text-[9px] text-slate-400 shrink-0 hidden xs:inline">
                                {variable.source}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Fila Inferior: Número grande + Delta + Referencia de comparación */}
                        <div className="flex items-end justify-between gap-2 pt-0.5 border-t border-slate-100/70">
                          <div className="flex items-baseline gap-1.5 min-w-0">
                            <div className="text-base sm:text-lg font-black tracking-tight text-slate-950 tabular-nums leading-none">
                              {formatVariableValue(variable)}
                            </div>
                            <div className="flex flex-col">
                              {delta !== 0 ? (
                                <span className={`text-[10px] font-bold inline-flex items-center ${
                                  delta > 0 ? 'text-emerald-700' : 'text-rose-700'
                                }`}>
                                  {delta > 0 ? <ArrowUpRight className="size-2.5 mr-0.5" /> : <ArrowDownRight className="size-2.5 mr-0.5" />}
                                  {delta > 0 ? '+' : ''}{deltaPct.toFixed(2)}%
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">0.00%</span>
                              )}
                              {variable.comparisonLabel && (
                                <span className="text-[8px] text-slate-400 leading-tight block">
                                  {variable.comparisonLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  <span>No se encontraron variables con los filtros aplicados.</span>
                </div>
              )
            )}

            {/* Paginación limpia y discreta al pie del tablero */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-1 pb-1">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-2.5 h-8 shadow-2xs text-xs">
                  <button
                    type="button"
                    onClick={() => setDashboardPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-colors font-bold px-1.5 py-0.5"
                    title="Página anterior"
                  >
                    ‹
                  </button>
                  <span className="text-[11px] font-bold text-slate-800 px-1">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDashboardPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-colors font-bold px-1.5 py-0.5"
                    title="Página siguiente"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* TAB 2: COTIZACIONES / COTAÇÕES */}
        {/* ============================================================ */}
        {activeTab === 'cotizaciones' && (
          <div className="space-y-6">
            
            {selectedCountry === 'BR' ? (
              /* COTAÇÕES OFICIAIS BRASIL (BCB PTAX & ABRACAM) */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DÓLAR COMERCIAL PTAX VENDA */}
                  {(() => {
                    const ptaxVar = variables.find(v => v.id === 'bcb_dolar_ptax_venda');
                    const hasHist = ptaxVar?.history && ptaxVar.history.length > 1;
                    const prevP = hasHist ? ptaxVar!.history[ptaxVar!.history.length - 2] : null;
                    const dVal = prevP && ptaxVar ? ptaxVar.value - prevP.value : (ptaxVar?.change || 0);
                    const dPct = prevP && prevP.value !== 0 ? ((dVal / prevP.value) * 100) : (ptaxVar?.changePercent || 0);
                    const isPos = dVal >= 0;

                    return (
                      <div
                        onClick={() => openVariableInspector('bcb_dolar_ptax_venda')}
                        className="group rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500/80 cursor-pointer transition-all shadow-2xs hover:shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-3"
                      >
                        {/* Header estilo Meta Account Center */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <MetaIcon variableId="bcb_dolar_ptax_venda" size="lg" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                                  BCB Oficial
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold">
                                  ⚡ Tempo real
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors truncate mt-0.5">
                                Dólar Comercial PTAX
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                              isPos ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            }`}>
                              {isPos ? '+' : ''}{dPct.toFixed(2)}%
                            </span>
                            <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>

                        {/* Valor numérico principal */}
                        <div className="pt-1">
                          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums block">
                            {ptaxVar ? formatVariableValue(ptaxVar) : 'R$ 5,680'}
                          </span>
                        </div>

                        {/* Bandas de Compra y Venta */}
                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200/70">
                          <span>🟢 Compra: <strong className="text-slate-900 font-bold">R$ {ptaxVar ? (ptaxVar.value * 0.998).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '5,674'}</strong></span>
                          <span>🔴 Venda: <strong className="text-slate-900 font-bold">{ptaxVar ? formatVariableValue(ptaxVar) : 'R$ 5,680'}</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* DÓLAR TURISMO PAPEL MOEDA */}
                  {(() => {
                    const turVar = variables.find(v => v.id === 'bcb_dolar_turismo');
                    const hasHist = turVar?.history && turVar.history.length > 1;
                    const prevP = hasHist ? turVar!.history[turVar!.history.length - 2] : null;
                    const dVal = prevP && turVar ? turVar.value - prevP.value : (turVar?.change || 0);
                    const dPct = prevP && prevP.value !== 0 ? ((dVal / prevP.value) * 100) : (turVar?.changePercent || 0);
                    const isPos = dVal >= 0;

                    return (
                      <div
                        onClick={() => openVariableInspector('bcb_dolar_turismo')}
                        className="group rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500/80 cursor-pointer transition-all shadow-2xs hover:shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-3"
                      >
                        {/* Header estilo Meta Account Center */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <MetaIcon variableId="bcb_dolar_turismo" size="lg" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                                  ABRACAM
                                </span>
                                <span className="text-[10px] text-sky-700 font-bold">
                                  Turismo
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors truncate mt-0.5">
                                Dólar Turismo Papel
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                              isPos ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            }`}>
                              {isPos ? '+' : ''}{dPct.toFixed(2)}%
                            </span>
                            <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>

                        {/* Valor numérico principal */}
                        <div className="pt-1">
                          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums block">
                            {turVar ? formatVariableValue(turVar) : 'R$ 5,920'}
                          </span>
                        </div>

                        {/* Bandas de Compra y Venta */}
                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200/70">
                          <span>🟢 Compra: <strong className="text-slate-900 font-bold">R$ {turVar ? (turVar.value * 0.97).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '5,750'}</strong></span>
                          <span>🔴 Venda: <strong className="text-slate-900 font-bold">{turVar ? formatVariableValue(turVar) : 'R$ 5,920'}</strong></span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Grid de Outras Cotações Oficiais (Estilo Meta Cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'bcb_euro_ptax', label: 'Euro PTAX', defaultVal: 'R$ 6,180', change: '+0.22%' },
                    { id: 'risco_pais_embi_br', label: 'Risco País', defaultVal: '198 pb', change: '-0.50%' },
                    { id: 'bcb_reservas_internacionais', label: 'Reservas BCB', defaultVal: 'US$ 355,4 Bi', change: 'Líquidas' },
                    { id: 'cdi_over_b3', label: 'Taxa CDI', defaultVal: '10,65%', change: 'Anual' }
                  ].map(item => {
                    const targetVar = variables.find(v => v.id === item.id);
                    const displayVal = targetVar ? formatVariableValue(targetVar) : item.defaultVal;

                    return (
                      <div
                        key={item.id}
                        onClick={() => openVariableInspector(item.id)}
                        className="group rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500/80 cursor-pointer shadow-2xs hover:shadow-xs p-3.5 flex flex-col justify-between transition-all"
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MetaIcon variableId={item.id} size="sm" />
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight className="size-3.5 text-slate-300 group-hover:text-slate-600 shrink-0 group-hover:translate-x-0.5 transition-all" />
                        </div>

                        <div className="space-y-1 pt-1 border-t border-slate-100/70">
                          <span className="text-base sm:text-lg font-black text-slate-950 block tabular-nums leading-none">
                            {displayVal}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {item.change}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* COTIZACIONES BNA Y MERCADO ARGENTINA (Foco Visual & Números, con Riesgo País) */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DÓLAR BILLETE BNA */}
                  {bnaBillete && (() => {
                    const hasHist = bnaBillete.history && bnaBillete.history.length > 1;
                    const prevP = hasHist ? bnaBillete.history[bnaBillete.history.length - 2] : null;
                    const dVal = prevP ? bnaBillete.value - prevP.value : (bnaBillete.change || 0);
                    const dPct = prevP && prevP.value !== 0 ? ((dVal / prevP.value) * 100) : (bnaBillete.changePercent || 0);
                    const isPos = dVal >= 0;

                    return (
                      <div
                        onClick={() => openVariableInspector(bnaBillete.id)}
                        className="group rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500/80 cursor-pointer transition-all shadow-2xs hover:shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-3"
                      >
                        {/* Header estilo Meta Account Center */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <MetaIcon variableId={bnaBillete.id} size="lg" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                                  🏛️ BNA Minorista
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold">
                                  ⚡ En vivo
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors truncate mt-0.5">
                                Dólar Minorista Billete
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                              isPos ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            }`}>
                              {isPos ? '+' : ''}{dPct.toFixed(2)}%
                            </span>
                            <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>

                        {/* Valor numérico principal */}
                        <div className="pt-1">
                          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums block">
                            {formatArs(bnaBillete.value)}
                          </span>
                        </div>

                        {/* Bandas de Compra y Venta */}
                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200/70">
                          <span>🟢 Compra: <strong className="text-slate-900 font-bold">${(bnaBillete.value * 0.965).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                          <span>🔴 Venta: <strong className="text-slate-900 font-bold">{formatArs(bnaBillete.value)}</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* DÓLAR DIVISA BNA */}
                  {bnaDivisa && (() => {
                    const hasHist = bnaDivisa.history && bnaDivisa.history.length > 1;
                    const prevP = hasHist ? bnaDivisa.history[bnaDivisa.history.length - 2] : null;
                    const dVal = prevP ? bnaDivisa.value - prevP.value : (bnaDivisa.change || 0);
                    const dPct = prevP && prevP.value !== 0 ? ((dVal / prevP.value) * 100) : (bnaDivisa.changePercent || 0);
                    const isPos = dVal >= 0;

                    return (
                      <div
                        onClick={() => openVariableInspector(bnaDivisa.id)}
                        className="group rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500/80 cursor-pointer transition-all shadow-2xs hover:shadow-xs p-4 sm:p-5 flex flex-col justify-between space-y-3"
                      >
                        {/* Header estilo Meta Account Center */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <MetaIcon variableId={bnaDivisa.id} size="lg" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                                  ⚡ BNA Mayorista
                                </span>
                                <span className="text-[10px] text-blue-700 font-bold">
                                  Com. A 3500
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors truncate mt-0.5">
                                Dólar Mayorista / Divisa
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                              isPos ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            }`}>
                              {isPos ? '+' : ''}{dPct.toFixed(2)}%
                            </span>
                            <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>

                        {/* Valor numérico principal */}
                        <div className="pt-1">
                          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums block">
                            {formatArs(bnaDivisa.value)}
                          </span>
                        </div>

                        {/* Bandas de Compra y Venta */}
                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200/70">
                          <span>🟢 Compra: <strong className="text-slate-900 font-bold">${(bnaDivisa.value * 0.99).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                          <span>🔴 Venta: <strong className="text-slate-900 font-bold">{formatArs(bnaDivisa.value)}</strong></span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Grid Visual de Otras Cotizaciones Clave en Argentina (Estilo Meta Cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { id: 'riesgo_pais_embi', label: 'Riesgo País', defaultVal: '1.042 pb' },
                    { id: 'dolar_mep_byma', label: 'Dólar MEP', defaultVal: '$1.145,20' },
                    { id: 'dolar_ccl_byma', label: 'Dólar CCL', defaultVal: '$1.184,60' },
                    { id: 'dolar_blue', label: 'Dólar Libre', defaultVal: '$1.225,00' },
                    { id: 'dolar_tarjeta', label: 'Dólar Tarjeta', defaultVal: '$1.688,00' },
                    { id: 'reservas_brutas', label: 'Reservas BCRA', defaultVal: 'US$ 28.480 M' }
                  ].map(item => {
                    const targetVar = variables.find(v => v.id === item.id);
                    const displayVal = targetVar ? formatVariableValue(targetVar) : item.defaultVal;
                    const hasHist = targetVar?.history && targetVar.history.length > 1;
                    const curV = targetVar ? targetVar.value : 0;
                    const prevP = hasHist ? targetVar!.history[targetVar!.history.length - 2] : null;
                    const dVal = prevP ? curV - prevP.value : (targetVar?.change || 0);
                    const dPct = prevP && prevP.value !== 0 ? ((dVal / prevP.value) * 100) : (targetVar?.changePercent || 0);
                    const isPos = dVal >= 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => openVariableInspector(item.id)}
                        className={`group rounded-2xl bg-white border ${
                          item.id === 'riesgo_pais_embi' ? 'border-amber-300 ring-1 ring-amber-300/40' : 'border-slate-200/90'
                        } hover:border-blue-500/80 cursor-pointer shadow-2xs hover:shadow-xs p-3.5 flex flex-col justify-between transition-all`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MetaIcon variableId={item.id} size="sm" />
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight className="size-3.5 text-slate-300 group-hover:text-slate-600 shrink-0 group-hover:translate-x-0.5 transition-all" />
                        </div>

                        <div className="space-y-1 pt-1 border-t border-slate-100/70">
                          <span className="text-base sm:text-lg font-black text-slate-950 block tabular-nums leading-none">
                            {displayVal}
                          </span>
                          <span className={`text-[10px] font-bold flex items-center ${isPos ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {dVal !== 0 ? (
                              <>
                                {isPos ? <ArrowUpRight className="size-2.5 mr-0.5" /> : <ArrowDownRight className="size-2.5 mr-0.5" />}
                                {isPos ? '+' : ''}{dPct.toFixed(2)}%
                              </>
                            ) : (
                              '0.00%'
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Chart Inline Container */}
            {activeVar && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-xs text-slate-400">
                      {activeVar.source} · {activeVar.frequency}
                    </div>
                    <h3 className="text-base font-bold text-slate-950 mt-0.5">
                      {activeVar.name}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-slate-500 block">Valor Actualizado</span>
                    <span className="text-xl sm:text-2xl font-black text-slate-950 tabular-nums">
                      {formatVariableValue(activeVar)}
                    </span>
                  </div>
                </div>

                {/* Controles de Escala Vertical y Rango */}
                <ChartScaleControls
                  range={chartRange}
                  onRangeChange={setChartRange}
                  yScale={chartYScale}
                  onYScaleChange={setChartYScale}
                  paddingLevel={chartPaddingLevel}
                  onPaddingLevelChange={setChartPaddingLevel}
                  periodLabel={activeVar.frequency !== 'Diaria' ? 'Períodos' : 'Período'}
                />

                {/* Minimal Recharts Line */}
                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeChartData}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#bfdbfe" strokeOpacity={0.4} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatChartDate}
                        tick={{ fill: '#64748b', fontSize: 10, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}
                        tickLine={false}
                        axisLine={{ stroke: '#bfdbfe', strokeOpacity: 0.5 }}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 10, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}
                        tickLine={false}
                        axisLine={false}
                        domain={yAxisDomain}
                        tickFormatter={formatYTick}
                        orientation="right"
                        width={chartYScale === 'percent' ? 52 : 60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#eff6ff',
                          fontSize: '11px',
                          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
                        }}
                        labelStyle={{ color: '#93c5fd', fontWeight: 600 }}
                        labelFormatter={(label) => `Fecha: ${label}`}
                        formatter={(val: any, name: any, item: any) => {
                          const nominal = item?.payload?.nominalValue !== undefined ? item.payload.nominalValue : val;
                          if (chartYScale === 'percent') {
                            const pNum = Number(val);
                            return [
                              `${pNum > 0 ? '+' : ''}${pNum.toFixed(2)}% (Nominal: ${Number(nominal).toLocaleString('es-AR')} ${activeUnit})`,
                              activeVar.name
                            ];
                          }
                          return [`${Number(val).toLocaleString('es-AR')} ${activeUnit}`, activeVar.name];
                        }}
                      />
                      {chartYScale === 'percent' && (
                        <ReferenceLine
                          y={0}
                          stroke="#64748b"
                          strokeDasharray="3 3"
                          label={{ value: 'Base 0%', fill: '#64748b', fontSize: 10, position: 'insideTopLeft' }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={2.2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#38bdf8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: COMPARADOR Y SIMULADOR DE PLAZO FIJO */}
        {/* ============================================================ */}
        {activeTab === 'plazo_fijo' && (
          <div className="space-y-6">
            {/* Simulator Box */}
            <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                  <span>💰</span>
                  <span>{selectedCountry === 'BR' ? 'Simulador de Renda Fixa CDB' : 'Simulador de Plazo Fijo'}</span>
                </h3>
                <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/60 font-semibold">
                  🏛️ Tasas Oficiales
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-600 font-semibold flex items-center gap-1 mb-1">
                    <span>💵</span>
                    <span>{selectedCountry === 'BR' ? 'Monto em reais (BRL):' : 'Monto en pesos (ARS):'}</span>
                  </label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={e => setSimAmount(Math.max(1000, Number(e.target.value)))}
                    className="w-full h-10 px-3 bg-blue-50/30 border border-blue-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-semibold flex items-center gap-1 mb-1">
                    <span>⏳</span>
                    <span>Plazo de colocación:</span>
                  </label>
                  <select
                    value={simDays}
                    onChange={e => setSimDays(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-blue-50/30 border border-blue-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  >
                    <option value={30}>⚡ 30 días (Mes)</option>
                    <option value={60}>📅 60 días (Bimestral)</option>
                    <option value={90}>📅 90 días (Trimestral)</option>
                    <option value={180}>📅 180 días (Semestral)</option>
                  </select>
                </div>
              </div>

              {topBank && bnaBank && (() => {
                const topGain = calculateBankReturn(topBank.tna, simAmount, simDays);
                const bnaGain = calculateBankReturn(bnaBank.tna, simAmount, simDays);
                return (
                  <div className="mt-4 pt-4 border-t border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80">
                      <span className="text-xs text-blue-900/80 flex items-center gap-1">
                        <span>🏆</span>
                        <span>Mayor tasa: {topBank.shortName} ({topBank.tna.toFixed(2)}%)</span>
                      </span>
                      <span className="text-xl font-bold tabular-nums text-emerald-700 block mt-1">
                        +{formatArs(topGain.interest)}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Total: <strong className="text-slate-900">{formatArs(topGain.total)}</strong>
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-700 flex items-center gap-1">
                        <span>🏛️</span>
                        <span>{selectedCountry === 'BR' ? 'Banco Público' : 'Banco Nación: BNA'} ({bnaBank.tna.toFixed(2)}%)</span>
                      </span>
                      <span className="text-xl font-bold tabular-nums text-slate-950 block mt-1">
                        +{formatArs(bnaGain.interest)}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Total: <strong className="text-slate-900">{formatArs(bnaGain.total)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bank Filter Tabs (Iconographic) */}
            <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setBankTypeFilter('all')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    bankTypeFilter === 'all'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border border-blue-200/70 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  <span>🌐</span>
                  <span>Todos</span>
                </button>
                <button
                  onClick={() => setBankTypeFilter('non_clients')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    bankTypeFilter === 'non_clients'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border border-blue-200/70 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  <span>💳</span>
                  <span>No Clientes</span>
                </button>
                <button
                  onClick={() => setBankTypeFilter('publico')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    bankTypeFilter === 'publico'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border border-blue-200/70 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  <span>🏛️</span>
                  <span>Públicos</span>
                </button>
                <button
                  onClick={() => setBankTypeFilter('privado')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    bankTypeFilter === 'privado'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border border-blue-200/70 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  <span>🏢</span>
                  <span>Privados</span>
                </button>
              </div>

              <span className="text-slate-500 text-[11px] flex items-center gap-1">
                <span>⚡</span>
                <span>Canal digital</span>
              </span>
            </div>

            {/* List of Banks */}
            <div className="divide-y divide-blue-100 bg-white rounded-2xl border border-blue-200/80 overflow-hidden shadow-xs">
              {filteredBanks.map((bank, idx) => {
                const gain = calculateBankReturn(bank.tna, simAmount, simDays);
                const isBNA = bank.id === 'banco_nacion';

                return (
                  <div
                    key={bank.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isBNA ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>#{idx + 1}</span>
                        <span>·</span>
                        <span className="capitalize">{bank.type}</span>
                        {bank.nonClientOnline && (
                          <>
                            <span>·</span>
                            <span className="text-blue-800 font-sans font-medium">No Clientes</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-950 truncate mt-0.5">
                        {bank.bankName}
                        {isBNA && <span className="ml-1.5 text-xs text-blue-800 font-normal">(Oficial BNA)</span>}
                      </h3>

                      <span className="text-xs text-slate-500 block mt-0.5">
                        {bank.channel}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-lg font-extrabold tabular-nums text-slate-950">
                          {bank.tna.toFixed(2)}%
                        </span>
                        <span className="text-xs font-semibold text-slate-500">TNA</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1.5 mt-0.5">
                        <span>TEM: {bank.tem ? `${bank.tem.toFixed(2)}%` : `${((bank.tna * 30) / 365).toFixed(2)}%`}</span>
                        <span>·</span>
                        <span>TEA: {bank.tea ? `${bank.tea.toFixed(2)}%` : `${(((Math.pow(1 + (bank.tna / 100) * (30 / 365), 365 / 30)) - 1) * 100).toFixed(2)}%`}</span>
                      </div>
                      <span className="text-xs text-emerald-700 block mt-0.5 font-bold">
                        +{formatArs(gain.interest)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: TENDENCIAS Y CURVAS HISTÓRICAS (30D, 90D, 1Y, 3Y) */}
        {/* ============================================================ */}
        {activeTab === 'tendencias' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs">
              <label className="text-xs text-slate-500 font-medium block mb-1.5">
                Variable:
              </label>
              <select
                value={selectedVarId}
                onChange={e => setSelectedVarId(e.target.value)}
                className="w-full h-11 px-3 bg-blue-50/30 border border-blue-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              >
                {topics.map(topic => (
                  <optgroup key={topic.id} label={`Tema: ${topic.name}`}>
                    {variables
                      .filter(v => v.topicId === topic.id)
                      .map(v => (
                        <option key={v.id} value={v.id}>
                          [{v.source}] {v.name} ({formatVariableValue(v)})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>

              {activeVar && (
                <div className="mt-5 space-y-4">
                  {/* Meta Account Center styled Header for Selected Variable */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <MetaIcon variableId={activeVar.id} topicId={activeVar.topicId} size="lg" />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200/80 shadow-2xs">
                            {activeVar.source}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                            {activeVar.frequency}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-950 font-sans">{activeVar.name}</h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs text-slate-500 block">Valor Actualizado</span>
                      <span className="text-2xl font-black tracking-tight text-slate-950 tabular-nums">
                        {formatVariableValue(activeVar)}
                      </span>
                    </div>
                  </div>

                  {/* Controles de Escala Vertical y Rango Temporal */}
                  <ChartScaleControls
                    range={chartRange}
                    onRangeChange={setChartRange}
                    yScale={chartYScale}
                    onYScaleChange={setChartYScale}
                    paddingLevel={chartPaddingLevel}
                    onPaddingLevelChange={setChartPaddingLevel}
                    periodLabel={activeVar.frequency !== 'Diaria' ? 'Períodos' : 'Período'}
                  />

                  {/* Summary Metric Cards for Selected Period (Iconographic & Numerical) */}
                  {chartStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <span>📊</span>
                          <span>Variación</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className={`text-sm font-extrabold tabular-nums ${
                            chartStats.nominalDiff > 0
                              ? 'text-emerald-700'
                              : chartStats.nominalDiff < 0
                              ? 'text-rose-700'
                              : 'text-slate-700'
                          }`}>
                            {chartStats.nominalDiff > 0 ? '+' : ''}{chartStats.percentChange.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <span>📍</span>
                          <span>Inicial</span>
                        </div>
                        <div className="text-sm font-extrabold tabular-nums text-slate-900 mt-0.5">
                          {chartStats.initialVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-500">{activeUnit}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <span>📉</span>
                          <span>Mínimo</span>
                        </div>
                        <div className="text-sm font-extrabold tabular-nums text-slate-900 mt-0.5">
                          {chartStats.minVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-500">{activeUnit}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <span>📈</span>
                          <span>Máximo</span>
                        </div>
                        <div className="text-sm font-extrabold tabular-nums text-slate-900 mt-0.5">
                          {chartStats.maxVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-500">{activeUnit}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activeChartData}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#bfdbfe" strokeOpacity={0.4} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatChartDate}
                          tick={{ fill: '#64748b', fontSize: 11, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}
                          tickLine={false}
                          axisLine={{ stroke: '#bfdbfe', strokeOpacity: 0.5 }}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 11, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}
                          tickLine={false}
                          axisLine={false}
                          domain={yAxisDomain}
                          tickFormatter={formatYTick}
                          orientation="right"
                          width={chartYScale === 'percent' ? 52 : 60}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a192f',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            color: '#eff6ff',
                            fontSize: '11px',
                            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
                          }}
                          labelStyle={{ color: '#93c5fd', fontWeight: 600 }}
                          labelFormatter={(label) => `Fecha: ${label}`}
                          formatter={(val: any, name: any, item: any) => {
                            const nominal = item?.payload?.nominalValue !== undefined ? item.payload.nominalValue : val;
                            if (chartYScale === 'percent') {
                              const pNum = Number(val);
                              return [
                                `${pNum > 0 ? '+' : ''}${pNum.toFixed(2)}% (Nominal: ${Number(nominal).toLocaleString('es-AR')} ${activeUnit})`,
                                activeVar.name
                              ];
                            }
                            return [`${Number(val).toLocaleString('es-AR')} ${activeUnit}`, activeVar.name];
                          }}
                        />
                        {chartYScale === 'percent' && (
                          <ReferenceLine
                            y={0}
                            stroke="#64748b"
                            strokeDasharray="3 3"
                            label={{ value: 'Base 0%', fill: '#64748b', fontSize: 10, position: 'insideTopLeft' }}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5, fill: '#1d4ed8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">{activeVar.source} · Serie oficial auditada</span>
                    <a
                      href={activeVar.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>Web oficial</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: FUENTES PÚBLICAS Y CÁMARAS SECTORIALES */}
        {/* ============================================================ */}
        {activeTab === 'fuentes' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <BookOpen className="size-4" />
                <span>Transparencia · Fuentes Primarias</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {selectedCountry === 'BR'
                  ? 'Fontes Oficiais & Câmaras (Brasil)'
                  : 'Fuentes Oficiales y Cámaras (Argentina)'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedCountry === 'BR'
                  ? 'Dados auditados diretamente das entidades soberanas do Sistema Financeiro e entidades setoriais.'
                  : 'Datos auditados directamente del Estado Nacional y cámaras representativas de la producción y finanzas.'}
              </p>
            </div>

            {selectedCountry === 'BR' ? (
              /* FONTES BRASILEIRAS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entidades Públicas Oficiais do Brasil */}
                <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-blue-100 pb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Públicas Oficiais (BR)</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">BCB</strong>
                        <span className="text-[11px] text-blue-700">bcb.gov.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Taxa Selic Meta, PTAX diária oficial e reservas internacionais.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">IBGE</strong>
                        <span className="text-[11px] text-blue-700">ibge.gov.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Inflação oficial (IPCA), INPC e produção industrial.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">Tesouro Nacional</strong>
                        <span className="text-[11px] text-blue-700">tesourodireto.com.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Dívida pública e taxas do Tesouro Direto (Selic, Prefixado, IPCA+).</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">SECEX / MDIC</strong>
                        <span className="text-[11px] text-blue-700">gov.br/mdic</span>
                      </div>
                      <p className="text-slate-600 mt-1">Balança comercial, exportações do agro e importações.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">MTE</strong>
                        <span className="text-[11px] text-blue-700">gov.br/trabalho</span>
                      </div>
                      <p className="text-slate-600 mt-1">Salário Mínimo Nacional e emprego formal (CAGED).</p>
                    </div>
                  </div>
                </div>

                {/* Câmaras Setoriais & Bolsas do Brasil */}
                <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-blue-100 pb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Mercados & Setores (BR)</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">B3 S.A.</strong>
                        <span className="text-[11px] text-sky-700">b3.com.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Taxa DI / CDI Over, contratos futuros de dólar e mercado acionário.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">FGV IBRE</strong>
                        <span className="text-[11px] text-sky-700">ibre.fgv.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Índice IGP-M (reajuste de aluguéis) e IPC-S.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">ANFAVEA</strong>
                        <span className="text-[11px] text-sky-700">anfavea.com.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Produção e exportação de veículos e máquinas agrícolas.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">ANBIMA</strong>
                        <span className="text-[11px] text-sky-700">anbima.com.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Índices de debêntures e taxas médias de CDB e renda fixa privada.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">FENABRAVE & ABRAS</strong>
                        <span className="text-[11px] text-sky-700">fenabrave.org.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Emplacamento de veículos e índice de consumo nos supermercados.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* FONTES ARGENTINAS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fuentes Públicas Oficiales */}
                <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-blue-100 pb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Públicas Oficiales (AR)</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">BCRA</strong>
                        <span className="text-[11px] text-blue-700">bcra.gob.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Reservas, UVA, CER, BADLAR, ICL y relevamiento de expectativas (REM).</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">BNA</strong>
                        <span className="text-[11px] text-blue-700">bna.com.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Cotizaciones minoristas oficiales de billete/divisa y tasas de plazo fijo.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">INDEC</strong>
                        <span className="text-[11px] text-blue-700">indec.gob.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">IPC nacional, Canasta Básica Total, IPIM mayorista y actividad (EMAE).</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">ARCA (ex AFIP)</strong>
                        <span className="text-[11px] text-blue-700">arca.gob.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Recaudación tributaria consolidada y liquidación aduanera.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">Sec. Trabajo</strong>
                        <span className="text-[11px] text-blue-700">argentina.gob.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Remuneración promedio de trabajadores estables (RIPTE).</p>
                    </div>
                  </div>
                </div>

                {/* Cámaras Sectoriales y Bolsas */}
                <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-blue-100 pb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Cámaras y Bolsas (AR)</h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">CIARA-CEC</strong>
                        <span className="text-[11px] text-sky-700">ciaracec.com.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Liquidación efectiva de divisas del complejo cerealero y oleaginoso.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">BYMA</strong>
                        <span className="text-[11px] text-sky-700">byma.com.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Cotizaciones implícitas Dólar MEP, CCL y tasas de caución bursátil.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">ADEFA</strong>
                        <span className="text-[11px] text-sky-700">adefa.org.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Producción, ventas mayoristas y exportaciones automotrices.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">CAME</strong>
                        <span className="text-[11px] text-sky-700">redcame.org.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Ventas minoristas pyme en el territorio nacional.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">CAC</strong>
                        <span className="text-[11px] text-sky-700">camarco.org.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Costo de construcción por m² (materiales y mano de obra).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ============================================================ */}
        {/* INTERACTIVE MODAL / DRAWER FOR VARIABLE INSPECTION */}
        {/* ============================================================ */}
        {isChartModalOpen && activeVar && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4">
              
              {/* Meta Account Center styled Header */}
              <div className="-mx-5 -mt-5 sm:-mx-6 sm:-mt-6 p-5 sm:p-6 bg-slate-50/90 rounded-t-2xl border-b border-slate-200/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MetaIcon variableId={activeVar.id} topicId={activeVar.topicId} size="lg" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-800 border border-slate-200/80 shadow-2xs">
                          {activeVar.source} · {activeVar.sourceType === 'publica' ? 'Oficial' : 'Cámara'}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                          {activeVar.frequency}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-950 font-sans truncate">{activeVar.name}</h3>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mt-1 tabular-nums">
                        {formatVariableValue(activeVar)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsChartModalOpen(false)}
                    className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs shrink-0"
                    title="Cerrar modal"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Selector de Rango y Escala Vertical para el Inspector */}
              <ChartScaleControls
                range={chartRange}
                onRangeChange={setChartRange}
                yScale={chartYScale}
                onYScaleChange={setChartYScale}
                paddingLevel={chartPaddingLevel}
                onPaddingLevelChange={setChartPaddingLevel}
                periodLabel={activeVar.frequency !== 'Diaria' ? 'Períodos' : 'Período'}
              />

              {/* Toggle rápido de moneda dentro del modal si la variable es en pesos */}
              {selectedCountry === 'AR' && isVariableEligibleForUsdConversion(activeVar) && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs">
                  <span className="text-slate-600 font-medium">Unidad de medición:</span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setIsUsdMeasureMode(false)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        !isUsdMeasureMode ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ARS ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUsdMeasureMode(true)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        isUsdMeasureMode ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title={`Desinflado al tipo de cambio oficial BNA ($${officialDollarRate.toLocaleString('es-AR')})`}
                    >
                      USD Oficial (Desinflado)
                    </button>
                  </div>
                </div>
              )}

              {/* KPI Badges */}
              {chartStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-[10px] font-medium text-slate-500">📊 Var {chartRange}</div>
                    <div className="text-xs font-extrabold mt-0.5">
                      <span className={chartStats.nominalDiff > 0 ? 'text-emerald-700' : chartStats.nominalDiff < 0 ? 'text-rose-700' : 'text-slate-700'}>
                        {chartStats.nominalDiff > 0 ? '+' : ''}{chartStats.percentChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-[10px] font-medium text-slate-500">📍 Inicial</div>
                    <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                      {chartStats.initialVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')} <span className="text-[9px] font-normal text-slate-500">{activeUnit}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-[10px] font-medium text-slate-500">📉 Mínimo</div>
                    <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                      {chartStats.minVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')} <span className="text-[9px] font-normal text-slate-500">{activeUnit}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-[10px] font-medium text-slate-500">📈 Máximo</div>
                    <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                      {chartStats.maxVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')} <span className="text-[9px] font-normal text-slate-500">{activeUnit}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeChartData}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" strokeOpacity={0.8} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}
                      tickLine={false}
                      axisLine={false}
                      domain={yAxisDomain}
                      tickFormatter={formatYTick}
                      orientation="right"
                      width={chartYScale === 'percent' ? 52 : 60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '11px',
                        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
                      }}
                      labelStyle={{ color: '#93c5fd', fontWeight: 600 }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                      formatter={(val: any, name: any, item: any) => {
                        const nominal = item?.payload?.nominalValue !== undefined ? item.payload.nominalValue : val;
                        if (chartYScale === 'percent') {
                          const pNum = Number(val);
                          return [
                            `${pNum > 0 ? '+' : ''}${pNum.toFixed(2)}% (Nominal: ${Number(nominal).toLocaleString('es-AR')} ${activeUnit})`,
                            activeVar.name
                          ];
                        }
                        return [`${Number(val).toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')} ${activeUnit}`, activeVar.name];
                      }}
                    />
                    {chartYScale === 'percent' && (
                      <ReferenceLine
                        y={0}
                        stroke="#64748b"
                        strokeDasharray="3 3"
                        label={{ value: 'Base 0%', fill: '#64748b', fontSize: 10, position: 'insideTopLeft' }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#1d4ed8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Visual Metadata & Source Link Bar (No long text) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-bold">{activeVar.source}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 font-semibold">
                    {activeVar.frequency}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeVar.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Fuente oficial</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Clean Footer */}
        <footer className="pt-8 pb-4 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EconoLogo
              country={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px] flex-wrap">
            {selectedCountry === 'BR' ? (
              <>
                <span className="text-slate-800 font-semibold">BCB</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">IBGE</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">B3</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">FGV</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">Tesouro</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">ANFAVEA</span>
                <span>·</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200/60">🟢 En vivo</span>
              </>
            ) : (
              <>
                <span className="text-slate-800 font-semibold">BNA</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">BCRA</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">INDEC</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">CIARA-CEC</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">ADEFA</span>
                <span>·</span>
                <span className="text-slate-800 font-semibold">BYMA</span>
                <span>·</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200/60">🟢 En vivo</span>
              </>
            )}
          </div>
        </footer>
      </main>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center h-16 px-1 shadow-xs">
        <button
          onClick={() => setActiveTab('temas')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'temas' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">📑 Temas</span>
        </button>

        <button
          onClick={() => setActiveTab('cotizaciones')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'cotizaciones' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-base font-bold leading-none">$</span>
          <span className="text-[10px] tracking-tight mt-1">{selectedCountry === 'BR' ? '💱 Câmbio' : '💱 Dólar'}</span>
        </button>

        <button
          onClick={() => setActiveTab('plazo_fijo')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'plazo_fijo' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">{selectedCountry === 'BR' ? '💰 CDB' : '💰 Plazo Fijo'}</span>
        </button>

        <button
          onClick={() => setActiveTab('tendencias')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'tendencias' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">📈 Gráficos</span>
        </button>

        <button
          onClick={() => setActiveTab('fuentes')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'fuentes' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">🏛️ Fuentes</span>
        </button>
      </nav>

      {/* Autonomous Daily News Briefing Modal (5 Claves del Día) */}
      <DailyNewsModal
        isOpen={isDailyNewsOpen}
        onClose={() => setIsDailyNewsOpen(false)}
        briefing={dailyBriefing}
      />
    </div>
  );
}
