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
  Download,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
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
import { exportVariableHistoryToCsv } from './utils/csvExport';
import { getVariableImage } from './variableImages';
import { getDailyNewsBriefing } from './dailyNews';
import { DailyNewsModal } from './components/DailyNewsModal';

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
function MiniSparkline({
  history,
  isPositive = true,
  compact = false
}: {
  history?: { date: string; value: number }[];
  isPositive?: boolean;
  compact?: boolean;
}) {
  if (!history || history.length < 2) return null;
  const points = history.slice(-12);
  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;
  const width = compact ? 56 : 80;
  const height = compact ? 16 : 22;
  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p.value - min) / range) * (height - 5) - 2.5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pointsString = coords.join(' ');
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className={`${compact ? 'w-14 h-4' : 'w-20 h-5.5'} shrink-0 opacity-85 group-hover:opacity-100 transition-opacity`} title="Trayectoria reciente">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth={compact ? '1.5' : '1.75'}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsString}
        />
      </svg>
    </div>
  );
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
  const [isChartModalOpen, setIsChartModalOpen] = useState<boolean>(false);

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

  const formatVariableValue = (variable: EconomicVariable) => {
    const locale = selectedCountry === 'BR' ? 'pt-BR' : 'es-AR';
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

  // Chart data calculation
  const chartData = useMemo(() => {
    if (!activeVar || !activeVar.history || activeVar.history.length === 0) return [];

    const todayStr = getArgentinaTodayDate();
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
      return activeVar.history.slice(-Math.min(activeVar.history.length, 30));
    }

    if (chartRange === '3Y' && filtered.length > 50) {
      return filtered.filter((_, idx) => idx % 2 === 0 || idx === filtered.length - 1);
    }

    return filtered;
  }, [activeVar, chartRange]);

  // Statistical indicators
  const chartStats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    const firstPoint = chartData[0];
    const lastPoint = chartData[chartData.length - 1];
    const initialVal = firstPoint.value;
    const finalVal = lastPoint.value;
    const nominalDiff = finalVal - initialVal;
    const percentChange = initialVal !== 0 ? ((nominalDiff / initialVal) * 100) : 0;
    const values = chartData.map(p => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    return {
      firstPoint,
      lastPoint,
      initialVal,
      finalVal,
      nominalDiff,
      percentChange,
      minVal,
      maxVal
    };
  }, [chartData]);

  const formatChartDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const day = parts[2];
    const month = parts[1];
    const year = parts[0].slice(2);
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

  const ITEMS_PER_SCREEN = 9; // Exactly 3 filas con 3 recuadros cada fila!
  const totalPages = Math.max(1, Math.ceil(dashboardVariables.length / ITEMS_PER_SCREEN));
  const currentPage = Math.min(dashboardPage, totalPages);
  const displayedVariables = isViewAllMode
    ? dashboardVariables
    : dashboardVariables.slice((currentPage - 1) * ITEMS_PER_SCREEN, currentPage * ITEMS_PER_SCREEN);

  // Autonomous 5 Economic News Briefing (Argentina & El Mundo)
  const dailyBriefing = useMemo(() => getDailyNewsBriefing(selectedCountry), [selectedCountry]);

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

          {/* Zone 3: Live Status, Autonomous 5 News & Manual Sync */}
          <div className="flex items-center gap-2 shrink-0">
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
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-mono px-2.5 py-1 bg-slate-100/90 rounded-md border border-slate-200"
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

        {/* Botón Principal al Principio: 5 Claves Económicas del Día (Argentina & El Mundo) */}
        <div
          onClick={() => setIsDailyNewsOpen(true)}
          className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs hover:border-blue-400/80 transition-all border border-blue-900/60 shadow-2xs group"
          title="Abrir síntesis de noticias desarrollada de manera autónoma"
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
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold uppercase shrink-0">
                  Autónomo
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-300 block truncate mt-0.5">
                {selectedCountry === 'BR'
                  ? 'Copom/Selic, IPCA, Dólar PTAX, Fed e Safra resumidos em 2 min'
                  : 'Riesgo País (1.042 pb), Dólar, IPC, Cosecha/Reservas y tasas de la Fed en 2 min'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 shadow-2xs group-hover:bg-blue-400 group-hover:text-slate-950 transition-all font-mono">
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
            {/* Barra Unificada de Filtros Desplegables y Control (Máxima Densidad y Cero Espacio Perdido) */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Grupo de Filtros Desplegables (Sectores, Frecuencia, Orden, Búsqueda) */}
                <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-[280px]">
                  {/* Desplegable 1: Temas / Sectores */}
                  <div className="relative">
                    <select
                      value={selectedTopicFilter}
                      onChange={(e) => {
                        setSelectedTopicFilter(e.target.value as any);
                        setDashboardPage(1);
                      }}
                      className="h-8 pl-2.5 pr-7 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 transition-colors cursor-pointer appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      title="Filtrar por sector económico"
                    >
                      <option value="ALL">✨ Todos los temas ({variables.length})</option>
                      {topics.map(t => {
                        const count = variables.filter(v => v.topicId === t.id).length;
                        const topicEmojis: Record<string, string> = {
                          cambiario_divisas: '💵',
                          precios_inflacion: '🛒',
                          tasas_ahorro: '🏦',
                          actividad_industria: '🏭',
                          credito_salarios: '🏠'
                        };
                        return (
                          <option key={t.id} value={t.id}>
                            {topicEmojis[t.id] || '📊'} {t.shortName} ({count})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="size-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>

                  {/* Desplegable 2: Frecuencia de Actualización */}
                  <div className="relative">
                    <select
                      value={frequencyFilter}
                      onChange={(e) => {
                        setFrequencyFilter(e.target.value as any);
                        setDashboardPage(1);
                      }}
                      className="h-8 pl-2.5 pr-7 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 transition-colors cursor-pointer appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      title="Filtrar por frecuencia de datos"
                    >
                      <option value="ALL">⚡ Frecuencia: Todas</option>
                      <option value="Diaria">⚡ Diaria (En vivo)</option>
                      <option value="Mensual">📅 Mensual (Oficial)</option>
                    </select>
                    <ChevronDown className="size-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>

                  {/* Desplegable 3: Criterio de Ordenamiento */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as any);
                        setDashboardPage(1);
                      }}
                      className="h-8 pl-2.5 pr-7 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 transition-colors cursor-pointer appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      title="Ordenar variables"
                    >
                      <option value="default">📊 Orden: Relevancia</option>
                      <option value="gainers">📈 Mayor suba (%)</option>
                      <option value="losers">📉 Mayor baja (%)</option>
                      <option value="name">🔤 Nombre (A-Z)</option>
                    </select>
                    <ChevronDown className="size-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>

                  {/* Campo de Búsqueda Compacto */}
                  <div className="relative flex-1 min-w-[120px] max-w-[180px]">
                    <Search className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setDashboardPage(1);
                      }}
                      placeholder="Buscar..."
                      className="w-full h-8 pl-7 pr-6 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono text-slate-900 placeholder:text-slate-400 shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setDashboardPage(1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Acciones y Vista a la Derecha */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* Selector Vista 3x3 vs Todas */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                    <button
                      onClick={() => setIsViewAllMode(false)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        !isViewAllMode
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Vista en 3 filas x 3 recuadros (9 en pantalla)"
                    >
                      <span>🔲 3x3</span>
                    </button>
                    <button
                      onClick={() => setIsViewAllMode(true)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        isViewAllMode
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ver todas las variables continuas"
                    >
                      <span>📑 ({dashboardVariables.length})</span>
                    </button>
                  </div>

                  {/* Paginación si 3x3 */}
                  {!isViewAllMode && totalPages > 1 && (
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-1.5 h-8 text-xs font-mono shadow-2xs">
                      <button
                        onClick={() => setDashboardPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-colors font-bold px-1"
                        title="Página anterior"
                      >
                        ‹
                      </button>
                      <span className="text-[11px] font-bold text-slate-800">
                        {currentPage}/{totalPages}
                      </span>
                      <button
                        onClick={() => setDashboardPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-colors font-bold px-1"
                        title="Página siguiente"
                      >
                        ›
                      </button>
                    </div>
                  )}

                  {/* Botón Exportar CSV */}
                  <button
                    type="button"
                    onClick={() => {
                      dashboardVariables.forEach(v => exportVariableHistoryToCsv(v));
                      triggerToast(`Descargando ${dashboardVariables.length} variables en CSV`);
                    }}
                    className="h-8 px-2.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors shadow-2xs"
                    title="Exportar indicadores filtrados a CSV (Excel / Sheets)"
                  >
                    <Download className="size-3" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Grid de Recuadros Ultra-Optimizados: 3x3 (3 columnas x 3 filas perfectamente visibles en pantalla) */}
            {displayedVariables.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                {displayedVariables.map(variable => {
                  const hasHistory = variable.history && variable.history.length > 1;
                  const latestVal = variable.value;
                  const prevPoint = hasHistory ? variable.history[variable.history.length - 2] : null;
                  const delta = prevPoint ? latestVal - prevPoint.value : 0;
                  const deltaPct = prevPoint && prevPoint.value !== 0 ? ((delta / prevPoint.value) * 100) : 0;
                  const isPositiveDelta = delta >= 0;
                  const varImage = getVariableImage(variable.id, variable.topicId);

                  return (
                    <div
                      key={variable.id}
                      onClick={() => openVariableInspector(variable.id)}
                      className="group relative rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-blue-500/80 p-2 sm:p-2.5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] flex flex-col justify-between h-[78px] sm:h-[82px]"
                    >
                      {/* Fila Superior: Mini Thumbnail + Nombre + Fuente + CSV */}
                      <div className="flex items-center justify-between gap-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80 shadow-2xs">
                            <img
                              src={varImage}
                              alt={variable.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                          </div>
                          <div className="min-w-0 flex-1 flex items-baseline gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors leading-tight">
                              {variable.name}
                            </h4>
                            <span className="text-[9px] font-mono text-slate-400 shrink-0 hidden xs:inline">
                              {variable.source}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportVariableHistoryToCsv(variable);
                            triggerToast(`Descargando ${variable.name} (.csv)`);
                          }}
                          className="p-1 rounded-md text-slate-300 group-hover:text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                          title="Descargar datos en CSV"
                        >
                          <Download className="size-3" />
                        </button>
                      </div>

                      {/* Fila Inferior: Número grande monospaciado + Delta + MiniSparkline */}
                      <div className="flex items-end justify-between gap-2 pt-0.5 border-t border-slate-100/70">
                        <div className="flex items-baseline gap-1.5 min-w-0">
                          <div className="text-base sm:text-lg font-black font-mono tracking-tight text-slate-950 tabular-nums leading-none">
                            {formatVariableValue(variable)}
                          </div>
                          <div>
                            {delta !== 0 ? (
                              <span className={`text-[10px] font-mono font-bold inline-flex items-center ${
                                delta > 0 ? 'text-emerald-700' : 'text-rose-700'
                              }`}>
                                {delta > 0 ? <ArrowUpRight className="size-2.5 mr-0.5" /> : <ArrowDownRight className="size-2.5 mr-0.5" />}
                                {delta > 0 ? '+' : ''}{deltaPct.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400">0.00%</span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          <MiniSparkline history={variable.history} isPositive={isPositiveDelta} compact={true} />
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
                    const imgUrl = getVariableImage('bcb_dolar_ptax_venda', 'cambiario_divisas');
                    return (
                      <div
                        onClick={() => openVariableInspector('bcb_dolar_ptax_venda')}
                        className="group rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400/80 cursor-pointer transition-all shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt="Dólar PTAX"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/95 text-slate-900 shadow-2xs backdrop-blur-xs">
                              BCB Oficial
                            </span>
                          </div>
                          {ptaxVar && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportVariableHistoryToCsv(ptaxVar);
                                triggerToast('Descargando histórico de PTAX (.csv)');
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-blue-700 hover:bg-white shadow-2xs transition-all active:scale-95"
                              title="Exportar dados em CSV"
                            >
                              <Download className="size-3.5" />
                            </button>
                          )}
                          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between text-white">
                            <span className="text-xs font-bold font-sans drop-shadow-xs">Dólar Comercial PTAX</span>
                            <span className="text-[11px] font-mono text-emerald-300 flex items-center font-bold bg-slate-950/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                              <ArrowDownRight className="size-3" /> -0.15%
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono tabular-nums">
                              R$ 5,680
                            </span>
                            {ptaxVar?.history && (
                              <MiniSparkline history={ptaxVar.history} isPositive={false} />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span>🟢 Compra: <strong className="text-slate-900">R$ 5,674</strong></span>
                            <span>🔴 Venda: <strong className="text-slate-900">R$ 5,680</strong></span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">⚡ Tempo real</span>
                            <span className="text-blue-700 font-sans font-medium flex items-center gap-0.5">
                              Gráfico <ChevronRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* DÓLAR TURISMO PAPEL MOEDA */}
                  {(() => {
                    const turVar = variables.find(v => v.id === 'bcb_dolar_turismo');
                    const imgUrl = getVariableImage('bcb_dolar_turismo', 'cambiario_divisas');
                    return (
                      <div
                        onClick={() => openVariableInspector('bcb_dolar_turismo')}
                        className="group rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400/80 cursor-pointer transition-all shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt="Dólar Turismo"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/95 text-slate-900 shadow-2xs backdrop-blur-xs">
                              ABRACAM
                            </span>
                          </div>
                          {turVar && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportVariableHistoryToCsv(turVar);
                                triggerToast('Descargando histórico Turismo (.csv)');
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-blue-700 hover:bg-white shadow-2xs transition-all active:scale-95"
                              title="Exportar dados em CSV"
                            >
                              <Download className="size-3.5" />
                            </button>
                          )}
                          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between text-white">
                            <span className="text-xs font-bold font-sans drop-shadow-xs">Dólar Turismo</span>
                            <span className="text-[11px] font-mono text-emerald-300 flex items-center font-bold bg-slate-950/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                              <ArrowDownRight className="size-3" /> -0.10%
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono tabular-nums">
                              R$ 5,920
                            </span>
                            {turVar?.history && (
                              <MiniSparkline history={turVar.history} isPositive={false} />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span>🟢 Compra: <strong className="text-slate-900">R$ 5,750</strong></span>
                            <span>🔴 Venda: <strong className="text-slate-900">R$ 5,920</strong></span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">⚡ Tempo real</span>
                            <span className="text-blue-700 font-sans font-medium flex items-center gap-0.5">
                              Gráfico <ChevronRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Grid de Outras Cotações Oficiais (Visual + CSV + Numbers) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(() => {
                    const euroVar = variables.find(v => v.id === 'bcb_euro_ptax');
                    const euroImg = getVariableImage('bcb_euro_ptax', 'cambiario_divisas');
                    return (
                      <div
                        onClick={() => openVariableInspector('bcb_euro_ptax')}
                        className="group rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 cursor-pointer shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative h-16 w-full bg-slate-100 overflow-hidden">
                          <img src={euroImg} alt="Euro PTAX" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                          <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white font-sans">💶 Euro PTAX</span>
                          {euroVar && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportVariableHistoryToCsv(euroVar);
                                triggerToast('Descargando Euro PTAX (.csv)');
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded bg-white/90 text-slate-700 hover:text-blue-700"
                              title="Exportar CSV"
                            >
                              <Download className="size-3" />
                            </button>
                          )}
                        </div>
                        <div className="p-3">
                          <span className="text-lg font-black font-mono text-slate-950 block">R$ 6,180</span>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold">+0.22%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Risco País Brasil */}
                  {(() => {
                    const rpBrVar = variables.find(v => v.id === 'risco_pais_embi_br');
                    const rpImg = getVariableImage('risco_pais_embi_br', 'cambiario_divisas');
                    return (
                      <div
                        onClick={() => openVariableInspector('risco_pais_embi_br')}
                        className="group rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 cursor-pointer shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative h-16 w-full bg-slate-100 overflow-hidden">
                          <img src={rpImg} alt="Risco País" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                          <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white font-sans">📉 Risco País</span>
                          {rpBrVar && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportVariableHistoryToCsv(rpBrVar);
                                triggerToast('Descargando Risco País (.csv)');
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded bg-white/90 text-slate-700 hover:text-blue-700"
                              title="Exportar CSV"
                            >
                              <Download className="size-3" />
                            </button>
                          )}
                        </div>
                        <div className="p-3">
                          <span className="text-lg font-black font-mono text-slate-950 block">198 pb</span>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold">-0.50%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const resVar = variables.find(v => v.id === 'bcb_reservas_internacionais');
                    const resImg = getVariableImage('bcb_reservas_internacionais', 'cambiario_divisas');
                    return (
                      <div
                        onClick={() => openVariableInspector('bcb_reservas_internacionais')}
                        className="group rounded-xl bg-white border border-slate-200/80 hover:border-blue-400 cursor-pointer shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative h-16 w-full bg-slate-100 overflow-hidden">
                          <img src={resImg} alt="Reservas" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                          <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white font-sans">🏛️ Reservas</span>
                          {resVar && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportVariableHistoryToCsv(resVar);
                                triggerToast('Descargando Reservas BCB (.csv)');
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded bg-white/90 text-slate-700 hover:text-blue-700"
                              title="Exportar CSV"
                            >
                              <Download className="size-3" />
                            </button>
                          )}
                        </div>
                        <div className="p-3">
                          <span className="text-lg font-black font-mono text-slate-950 block">US$ 355,4 Bi</span>
                          <span className="text-[10px] text-slate-500 font-mono">Líquidas</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="group rounded-xl bg-white border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
                    <div className="relative h-16 w-full bg-slate-100 overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80" alt="Ouro" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white font-sans">🟡 Ouro (B3)</span>
                    </div>
                    <div className="p-3">
                      <span className="text-lg font-black font-mono text-slate-950 block">R$ 478,50</span>
                      <span className="text-[10px] text-emerald-600 font-mono font-bold">Por grama</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* COTIZACIONES BNA Y MERCADO ARGENTINA (Foco Visual & Números, con Riesgo País) */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DÓLAR BILLETE BNA */}
                  {bnaBillete && (() => {
                    const imgUrl = getVariableImage(bnaBillete.id, bnaBillete.topicId);
                    return (
                      <div
                        onClick={() => openVariableInspector(bnaBillete.id)}
                        className="group rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400/80 cursor-pointer transition-all shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={bnaBillete.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/95 text-slate-900 shadow-2xs backdrop-blur-xs">
                              🏛️ BNA Minorista
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportVariableHistoryToCsv(bnaBillete);
                              triggerToast(`Descargando historial de ${bnaBillete.name} (.csv)`);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-blue-700 hover:bg-white shadow-2xs transition-all active:scale-95"
                            title="Descargar cotizaciones en CSV (Excel / Sheets)"
                          >
                            <Download className="size-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between text-white">
                            <span className="text-xs font-bold font-sans drop-shadow-xs">💵 Dólar Minorista Billete</span>
                            <span className="text-[11px] font-mono text-emerald-300 flex items-center font-bold bg-slate-950/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                              <ArrowUpRight className="size-3" /> +0.06%
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono tabular-nums">
                              {formatArs(bnaBillete.value)}
                            </span>
                            {bnaBillete.history && (
                              <MiniSparkline history={bnaBillete.history} isPositive={true} />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span>🟢 Compra: <strong className="text-slate-900">$1.005,00</strong></span>
                            <span>🔴 Venta: <strong className="text-slate-900">$1.025,00</strong></span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">⚡ En vivo</span>
                            <span className="text-blue-700 font-sans font-medium flex items-center gap-0.5">
                              Gráfico <ChevronRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* DÓLAR DIVISA BNA */}
                  {bnaDivisa && (() => {
                    const imgUrl = getVariableImage(bnaDivisa.id, bnaDivisa.topicId);
                    return (
                      <div
                        onClick={() => openVariableInspector(bnaDivisa.id)}
                        className="group rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400/80 cursor-pointer transition-all shadow-xs overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={bnaDivisa.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/95 text-slate-900 shadow-2xs backdrop-blur-xs">
                              ⚡ BNA Mayorista
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportVariableHistoryToCsv(bnaDivisa);
                              triggerToast(`Descargando historial de ${bnaDivisa.name} (.csv)`);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-blue-700 hover:bg-white shadow-2xs transition-all active:scale-95"
                            title="Descargar cotizaciones en CSV (Excel / Sheets)"
                          >
                            <Download className="size-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between text-white">
                            <span className="text-xs font-bold font-sans drop-shadow-xs">💳 Dólar Mayorista / Divisa</span>
                            <span className="text-[11px] font-mono text-emerald-300 flex items-center font-bold bg-slate-950/50 px-1.5 py-0.5 rounded backdrop-blur-xs">
                              <ArrowUpRight className="size-3" /> +0.05%
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono tabular-nums">
                              {formatArs(bnaDivisa.value)}
                            </span>
                            {bnaDivisa.history && (
                              <MiniSparkline history={bnaDivisa.history} isPositive={true} />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                            <span>🟢 Compra: <strong className="text-slate-900">$995,00</strong></span>
                            <span>🔴 Venta: <strong className="text-slate-900">$1.005,00</strong></span>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">⚡ En vivo</span>
                            <span className="text-blue-700 font-sans font-medium flex items-center gap-0.5">
                              Gráfico <ChevronRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Grid Visual de Otras Cotizaciones Clave en Argentina (Incluye RIESGO PAÍS JP MORGAN) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { id: 'riesgo_pais_embi', icon: '📉', label: 'Riesgo País', defaultVal: '1.042 pb', delta: '-1.14%', positive: false },
                    { id: 'dolar_mep_byma', icon: '📈', label: 'Dólar MEP', defaultVal: '$1.140,50', delta: '+0.12%', positive: true },
                    { id: 'dolar_ccl_byma', icon: '🌐', label: 'Dólar CCL', defaultVal: '$1.185,20', delta: '+0.08%', positive: true },
                    { id: 'dolar_blue', icon: '💸', label: 'Dólar Libre', defaultVal: '$1.190,00', delta: '-0.42%', positive: false },
                    { id: 'dolar_tarjeta', icon: '💳', label: 'Dólar Tarjeta', defaultVal: '$1.640,00', delta: '+0.06%', positive: true },
                    { id: 'reservas_brutas', icon: '🏛️', label: 'Reservas BCRA', defaultVal: 'US$ 28.480 M', delta: '+0.35%', positive: true }
                  ].map(item => {
                    const targetVar = variables.find(v => v.id === item.id);
                    const imgUrl = getVariableImage(item.id, 'cambiario_divisas');
                    const displayVal = targetVar ? formatVariableValue(targetVar) : item.defaultVal;
                    return (
                      <div
                        key={item.id}
                        onClick={() => openVariableInspector(item.id)}
                        className={`group rounded-xl bg-white border ${item.id === 'riesgo_pais_embi' ? 'border-amber-300 ring-1 ring-amber-300/40' : 'border-slate-200/80'} hover:border-blue-400 cursor-pointer shadow-xs overflow-hidden flex flex-col justify-between`}
                      >
                        <div className="relative h-18 w-full bg-slate-100 overflow-hidden">
                          <img src={imgUrl} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                          <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-white font-sans truncate pr-8 flex items-center gap-1">
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </span>
                          {targetVar && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                exportVariableHistoryToCsv(targetVar);
                                triggerToast(`Descargando ${item.label} (.csv)`);
                              }}
                              className="absolute top-1.5 right-1.5 p-1 rounded bg-white/90 text-slate-700 hover:text-blue-700 shadow-2xs"
                              title="Exportar CSV"
                            >
                              <Download className="size-3" />
                            </button>
                          )}
                        </div>
                        <div className="p-3">
                          <span className="text-base sm:text-lg font-black font-mono text-slate-950 block tabular-nums">
                            {displayVal}
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${item.positive ? 'text-emerald-600' : 'text-emerald-700'}`}>
                            {item.delta}
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
                    <div className="text-xs text-slate-400 font-mono">
                      {activeVar.source} · {activeVar.frequency}
                    </div>
                    <h3 className="text-base font-bold text-slate-950 mt-0.5">
                      {activeVar.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                        <button
                          key={range}
                          onClick={() => setChartRange(range)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            chartRange === range
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        exportVariableHistoryToCsv(activeVar, chartData);
                        triggerToast(`Descargando datos de ${activeVar.name} (.csv)`);
                      }}
                      className="h-7 px-2.5 rounded-md text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 transition-colors"
                      title="Descargar datos en CSV para abrir en Excel o Google Sheets"
                    >
                      <Download className="size-3" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                {/* Minimal Recharts Line */}
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#bfdbfe" strokeOpacity={0.4} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatChartDate}
                        tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        tickLine={false}
                        axisLine={{ stroke: '#bfdbfe', strokeOpacity: 0.5 }}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                        orientation="right"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a192f',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '8px',
                          color: '#eff6ff',
                          fontSize: '11px',
                          fontFamily: 'JetBrains Mono'
                        }}
                        labelStyle={{ color: '#93c5fd' }}
                        labelFormatter={(label) => `${label}`}
                        formatter={(val: any) => [`${Number(val).toLocaleString('es-AR')} ${activeVar.unit}`, activeVar.name]}
                      />
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
                <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/60 font-semibold">
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
                    className="w-full h-10 px-3 bg-blue-50/30 border border-blue-200 rounded-xl text-sm font-mono font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
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
                      <span className="text-xs text-blue-900/80 font-mono flex items-center gap-1">
                        <span>🏆</span>
                        <span>Mayor tasa: {topBank.shortName} ({topBank.tna.toFixed(2)}%)</span>
                      </span>
                      <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 block mt-1">
                        +{formatArs(topGain.interest)}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Total: <strong className="font-mono text-slate-900">{formatArs(topGain.total)}</strong>
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-700 font-mono flex items-center gap-1">
                        <span>🏛️</span>
                        <span>{selectedCountry === 'BR' ? 'Banco Público' : 'Banco Nación: BNA'} ({bnaBank.tna.toFixed(2)}%)</span>
                      </span>
                      <span className="text-xl font-bold font-mono tabular-nums text-slate-950 block mt-1">
                        +{formatArs(bnaGain.interest)}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Total: <strong className="font-mono text-slate-900">{formatArs(bnaGain.total)}</strong>
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

              <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
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
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
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
                        {isBNA && <span className="ml-1.5 text-xs text-blue-800 font-normal font-mono">(Oficial BNA)</span>}
                      </h3>

                      <span className="text-xs text-slate-500 block mt-0.5">
                        {bank.channel}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold font-mono tabular-nums text-slate-950 block">
                        {bank.tna.toFixed(2)}% <span className="text-xs font-normal text-slate-500">TNA</span>
                      </span>
                      <span className="text-xs font-mono text-emerald-700 block mt-0.5 font-medium">
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
                  {/* Brief Illustrative Image Banner for Selected Variable */}
                  <div className="relative h-28 sm:h-32 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img
                      src={getVariableImage(activeVar.id, activeVar.topicId)}
                      alt={activeVar.name}
                      className="w-full h-full object-cover opacity-60"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-2.5 left-3 flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-900 shadow-2xs">
                        {activeVar.source}
                      </span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-200 backdrop-blur-xs">
                        {activeVar.frequency}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold font-sans drop-shadow-xs">{activeVar.name}</h3>
                        <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white mt-0.5 tabular-nums">
                          {formatVariableValue(activeVar)}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          exportVariableHistoryToCsv(activeVar, chartData);
                          triggerToast(`Descargando datos de ${activeVar.name} (.csv)`);
                        }}
                        className="h-8 px-3 rounded-lg text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors shadow-xs active:scale-95 shrink-0"
                        title="Descargar datos en CSV para abrir en Excel o Google Sheets"
                      >
                        <Download className="size-3.5" />
                        <span>Exportar CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Chart Range Switcher */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs font-mono text-slate-500">Período de gráfico:</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                        <button
                          key={range}
                          onClick={() => setChartRange(range)}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            chartRange === range
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Metric Cards for Selected Period (Iconographic & Numerical) */}
                  {chartStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <span>📊</span>
                          <span>Variación</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className={`text-sm font-extrabold font-mono tabular-nums ${
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
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                          {chartStats.initialVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-500">{activeVar.unit}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <span>📉</span>
                          <span>Mínimo</span>
                        </div>
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                          {chartStats.minVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-500">{activeVar.unit}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <span>📈</span>
                          <span>Máximo</span>
                        </div>
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                          {chartStats.maxVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-500">{activeVar.unit}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#bfdbfe" strokeOpacity={0.4} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatChartDate}
                          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                          tickLine={false}
                          axisLine={{ stroke: '#bfdbfe', strokeOpacity: 0.5 }}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                          tickLine={false}
                          axisLine={false}
                          domain={['auto', 'auto']}
                          orientation="right"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a192f',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            color: '#eff6ff',
                            fontSize: '11px',
                            fontFamily: 'JetBrains Mono'
                          }}
                          labelStyle={{ color: '#93c5fd' }}
                          labelFormatter={(label) => `${label}`}
                          formatter={(val: any) => [`${Number(val).toLocaleString('es-AR')} ${activeVar.unit}`, activeVar.name]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ r: 2, fill: '#38bdf8' }}
                          activeDot={{ r: 5, fill: '#1d4ed8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono text-[11px]">{activeVar.source} · Serie oficial auditada</span>
                    <a
                      href={activeVar.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-mono text-[11px] flex items-center gap-1 transition-colors"
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
              <div className="flex items-center gap-2 text-xs font-mono text-blue-700">
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
                        <strong className="text-slate-900 font-mono">BCB</strong>
                        <span className="text-[11px] text-blue-700 font-mono">bcb.gov.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Taxa Selic Meta, PTAX diária oficial e reservas internacionais.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">IBGE</strong>
                        <span className="text-[11px] text-blue-700 font-mono">ibge.gov.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Inflação oficial (IPCA), INPC e produção industrial.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">Tesouro Nacional</strong>
                        <span className="text-[11px] text-blue-700 font-mono">tesourodireto.com.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Dívida pública e taxas do Tesouro Direto (Selic, Prefixado, IPCA+).</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">SECEX / MDIC</strong>
                        <span className="text-[11px] text-blue-700 font-mono">gov.br/mdic</span>
                      </div>
                      <p className="text-slate-600 mt-1">Balança comercial, exportações do agro e importações.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">MTE</strong>
                        <span className="text-[11px] text-blue-700 font-mono">gov.br/trabalho</span>
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
                        <strong className="text-slate-900 font-mono">B3 S.A.</strong>
                        <span className="text-[11px] text-sky-700 font-mono">b3.com.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Taxa DI / CDI Over, contratos futuros de dólar e mercado acionário.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">FGV IBRE</strong>
                        <span className="text-[11px] text-sky-700 font-mono">ibre.fgv.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Índice IGP-M (reajuste de aluguéis) e IPC-S.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">ANFAVEA</strong>
                        <span className="text-[11px] text-sky-700 font-mono">anfavea.com.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Produção e exportação de veículos e máquinas agrícolas.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">ANBIMA</strong>
                        <span className="text-[11px] text-sky-700 font-mono">anbima.com.br</span>
                      </div>
                      <p className="text-slate-600 mt-1">Índices de debêntures e taxas médias de CDB e renda fixa privada.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">FENABRAVE & ABRAS</strong>
                        <span className="text-[11px] text-sky-700 font-mono">fenabrave.org.br</span>
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
                        <strong className="text-slate-900 font-mono">BCRA</strong>
                        <span className="text-[11px] text-blue-700 font-mono">bcra.gob.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Reservas, UVA, CER, BADLAR, ICL y relevamiento de expectativas (REM).</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">BNA</strong>
                        <span className="text-[11px] text-blue-700 font-mono">bna.com.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Cotizaciones minoristas oficiales de billete/divisa y tasas de plazo fijo.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">INDEC</strong>
                        <span className="text-[11px] text-blue-700 font-mono">indec.gob.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">IPC nacional, Canasta Básica Total, IPIM mayorista y actividad (EMAE).</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">ARCA (ex AFIP)</strong>
                        <span className="text-[11px] text-blue-700 font-mono">arca.gob.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Recaudación tributaria consolidada y liquidación aduanera.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">Sec. Trabajo</strong>
                        <span className="text-[11px] text-blue-700 font-mono">argentina.gob.ar</span>
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
                        <strong className="text-slate-900 font-mono">CIARA-CEC</strong>
                        <span className="text-[11px] text-sky-700 font-mono">ciaracec.com.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Liquidación efectiva de divisas del complejo cerealero y oleaginoso.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">BYMA</strong>
                        <span className="text-[11px] text-sky-700 font-mono">byma.com.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Cotizaciones implícitas Dólar MEP, CCL y tasas de caución bursátil.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">ADEFA</strong>
                        <span className="text-[11px] text-sky-700 font-mono">adefa.org.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Producción, ventas mayoristas y exportaciones automotrices.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">CAME</strong>
                        <span className="text-[11px] text-sky-700 font-mono">redcame.org.ar</span>
                      </div>
                      <p className="text-slate-600 mt-1">Ventas minoristas pyme en el territorio nacional.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono">CAC</strong>
                        <span className="text-[11px] text-sky-700 font-mono">camarco.org.ar</span>
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
              
              {/* Illustrative Image Banner Header for Variable */}
              <div className="relative h-32 sm:h-36 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 rounded-t-2xl overflow-hidden bg-slate-950">
                <img
                  src={getVariableImage(activeVar.id, activeVar.topicId)}
                  alt={activeVar.name}
                  className="w-full h-full object-cover opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                
                {/* Top Actions: Badges & Close Button */}
                <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-slate-950 shadow-2xs">
                      {activeVar.source} · {activeVar.sourceType === 'publica' ? 'Oficial' : 'Cámara'}
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-200 backdrop-blur-xs">
                      {activeVar.frequency}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsChartModalOpen(false)}
                    className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white/80 hover:text-white transition-colors backdrop-blur-xs"
                    title="Cerrar modal"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Bottom Header: Name, Bold Numerical Value & CSV Downloads */}
                <div className="absolute bottom-3 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-sans drop-shadow-xs">{activeVar.name}</h3>
                    <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white mt-0.5 tabular-nums">
                      {formatVariableValue(activeVar)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        exportVariableHistoryToCsv(activeVar, chartData);
                        triggerToast(`Descargando datos del período (${chartRange}) en CSV`);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
                      title="Descargar datos del período en formato CSV para Excel o Google Sheets"
                    >
                      <Download className="size-3.5" />
                      <span>CSV ({chartRange})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        exportVariableHistoryToCsv(activeVar);
                        triggerToast(`Descargando historial completo de ${activeVar.name} en CSV`);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
                      title="Descargar historial completo en CSV"
                    >
                      <Download className="size-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Historial completo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Range Selector: 30D, 90D, 1Y, 3Y */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-xs font-mono text-slate-500">Período de análisis:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        chartRange === range
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Badges */}
              {chartStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-[10px] font-medium text-slate-500">📊 Var {chartRange}</div>
                    <div className="text-xs font-extrabold font-mono mt-0.5">
                      <span className={chartStats.nominalDiff > 0 ? 'text-emerald-700' : chartStats.nominalDiff < 0 ? 'text-rose-700' : 'text-slate-700'}>
                        {chartStats.nominalDiff > 0 ? '+' : ''}{chartStats.percentChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-[10px] font-medium text-slate-500">📍 Inicial</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.initialVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-[10px] font-medium text-slate-500">📉 Mínimo</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.minVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-[10px] font-medium text-slate-500">📈 Máximo</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.maxVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')}
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div className="h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" strokeOpacity={0.8} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      orientation="right"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono'
                      }}
                      labelStyle={{ color: '#93c5fd' }}
                      labelFormatter={(label) => `${label}`}
                      formatter={(val: any) => [`${Number(val).toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')} ${activeVar.unit}`, activeVar.name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 2, fill: '#38bdf8' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Visual Metadata & Source Link Bar (No long text) */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-600 font-bold">{activeVar.source}</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-mono text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-semibold">
                    Auditado
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
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono flex-wrap">
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
          <span className="text-base font-mono font-bold leading-none">$</span>
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
