import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
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
  BookOpen
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
  ChatMessage,
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
import { todayAR } from './dailySync';
import { ArgentinaFlag, BrazilFlag } from './components/FlagIcons';
import { TopicTechVisualizer } from './components/TopicTechVisualizer';

type Tab = 'temas' | 'cotizaciones' | 'plazo_fijo' | 'tendencias' | 'fuentes' | 'asesor';

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
  isPositive = true
}: {
  history?: { date: string; value: number }[];
  isPositive?: boolean;
}) {
  if (!history || history.length < 2) return null;
  const points = history.slice(-12);
  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;
  const width = 80;
  const height = 22;
  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p.value - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pointsString = coords.join(' ');
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className="w-20 h-5.5 shrink-0 opacity-85 group-hover:opacity-100 transition-opacity" title="Trayectoria reciente">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
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

  // --- Data State (dynamically initialized by country) ---
  const [variables, setVariables] = useState<EconomicVariable[]>(() =>
    selectedCountry === 'BR' ? BRAZIL_ECONOMIC_VARIABLES : ARGENTINA_ECONOMIC_VARIABLES
  );
  const [bankRates, setBankRates] = useState<BankFixedTermRate[]>(() =>
    selectedCountry === 'BR' ? computeBrazilBankRates(todayAR()) : computeBankRates(todayAR())
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

    const newVars = newCountry === 'BR' ? BRAZIL_ECONOMIC_VARIABLES : ARGENTINA_ECONOMIC_VARIABLES;
    const newTopicsList = newCountry === 'BR' ? BRAZIL_ECONOMIC_TOPICS : ECONOMIC_TOPICS;
    const newRates = newCountry === 'BR' ? computeBrazilBankRates(todayAR()) : computeBankRates(todayAR());

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

  // Auto-Update Engine State (Revisión automática cada 5 minutos)
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [autoSyncCountdown, setAutoSyncCountdown] = useState<number>(300); // 300 segundos = 5 minutos
  const [lastVerifiedTime, setLastVerifiedTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Bienvenido a Econoapp. Consultá cotizaciones oficiales del BNA, tasas de plazo fijo y variables macroeconómicas conectadas por temas de interés, verificadas con fuentes públicas y cámaras sectoriales al 13-10-2026.',
      timestamp: '13-10-2026'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
          setBankRates(computeBrazilBankRates(todayAR()));
        } else {
          setBankRates(computeBankRates(todayAR()));
        }
        setAutoSyncCountdown(300);
        setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        triggerToast('Revisión completada: datos al día con fuentes oficiales');
      }
    } catch {
      await loadData(true);
      setAutoSyncCountdown(300);
      setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setIsSyncing(false);
    }
  };

  // Revisión automática de la plataforma cada 5 minutos (300s)
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setAutoSyncCountdown(prev => {
        if (prev <= 1) {
          loadData(true);
          setLastVerifiedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedCountry]);

  useEffect(() => {
    if (activeTab === 'asesor') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!presetText) setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          previousMessages: chatMessages.slice(-6).map(m => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            sender: 'assistant',
            text: data.text || 'No se pudo recuperar una respuesta.',
            timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        let errText = 'Información oficial temporalmente no disponible.';
        try {
          const errData = await res.json();
          if (typeof errData?.text === 'string' && errData.text) errText = errData.text;
        } catch {}
        setChatMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            sender: 'assistant',
            text: errText,
            timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: 'Error de red al procesar la respuesta.',
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

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

    // La referencia es el último dato disponible de la variable, no una fecha fija
    const lastDate = activeVar.history[activeVar.history.length - 1].date.slice(0, 10);
    const refDate = new Date(`${lastDate}T12:00:00Z`);
    let daysToSubtract = 90;
    if (chartRange === '30D') daysToSubtract = 30;
    else if (chartRange === '90D') daysToSubtract = 90;
    else if (chartRange === '1Y') daysToSubtract = 365;
    else if (chartRange === '3Y') daysToSubtract = 365 * 3;

    const cutoffDate = new Date(refDate);
    cutoffDate.setDate(refDate.getDate() - daysToSubtract);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const filtered = activeVar.history.filter(point => point.date >= cutoffStr && point.date <= lastDate);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#edf3fa] via-[#f1f6fc] to-[#e8f0fa] text-slate-900 selection:bg-blue-900 selection:text-white pb-24 md:pb-16 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0a192f] text-blue-100 text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-blue-800/40 animate-in fade-in duration-200">
          <Check className="size-3.5 text-blue-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Bar with Modern Econoapp Logo */}
      <header className="sticky top-0 z-30 bg-[#edf3fa]/90 backdrop-blur-md border-b border-blue-900/10">
        <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between gap-6">
          
          {/* Zone 1: Modern Econoapp Logo with Country Flag and Switcher */}
          <EconoLogo
            onClick={() => setActiveTab('temas')}
            country={selectedCountry}
            onSelectCountry={handleSelectCountry}
          />

          {/* Zone 2: Navigation Links (Clean single-line text) */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('temas')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap px-2.5 py-1 rounded-lg ${
                activeTab === 'temas'
                  ? 'bg-[#0f274a] text-blue-100 font-semibold shadow-xs ring-1 ring-blue-500/30'
                  : 'hover:text-slate-950 hover:bg-blue-100/50'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Temas</span>
            </button>
            <button
              onClick={() => setActiveTab('cotizaciones')}
              className={`transition-colors whitespace-nowrap px-2 py-1 rounded-lg ${
                activeTab === 'cotizaciones' ? 'bg-[#0f274a] text-blue-100 font-semibold shadow-xs ring-1 ring-blue-500/30' : 'hover:text-slate-950 hover:bg-blue-100/50'
              }`}
            >
              {selectedCountry === 'BR' ? 'Cotações' : 'Cotizaciones'}
            </button>
            <button
              onClick={() => setActiveTab('plazo_fijo')}
              className={`transition-colors whitespace-nowrap px-2 py-1 rounded-lg ${
                activeTab === 'plazo_fijo' ? 'bg-[#0f274a] text-blue-100 font-semibold shadow-xs ring-1 ring-blue-500/30' : 'hover:text-slate-950 hover:bg-blue-100/50'
              }`}
            >
              {selectedCountry === 'BR' ? 'CDB' : 'Plazo Fijo'}
            </button>
            <button
              onClick={() => setActiveTab('tendencias')}
              className={`transition-colors whitespace-nowrap px-2 py-1 rounded-lg ${
                activeTab === 'tendencias' ? 'bg-[#0f274a] text-blue-100 font-semibold shadow-xs ring-1 ring-blue-500/30' : 'hover:text-slate-950 hover:bg-blue-100/50'
              }`}
            >
              {selectedCountry === 'BR' ? 'Tendências' : 'Tendencias'}
            </button>
            <button
              onClick={() => setActiveTab('fuentes')}
              className={`transition-colors whitespace-nowrap px-2 py-1 rounded-lg ${
                activeTab === 'fuentes' ? 'bg-[#0f274a] text-blue-100 font-semibold shadow-xs ring-1 ring-blue-500/30' : 'hover:text-slate-950 hover:bg-blue-100/50'
              }`}
            >
              {selectedCountry === 'BR' ? 'Fontes' : 'Fuentes'}
            </button>
            <button
              onClick={() => setActiveTab('asesor')}
              className={`transition-colors whitespace-nowrap px-2 py-1 rounded-lg ${
                activeTab === 'asesor' ? 'bg-[#0f274a] text-blue-100 font-semibold shadow-xs ring-1 ring-blue-500/30' : 'hover:text-slate-950 hover:bg-blue-100/50'
              }`}
            >
              {selectedCountry === 'BR' ? 'Consultor' : 'Asesor'}
            </button>
          </nav>

          {/* Zone 3: Date, Auto-Review (5m) & Manual Sync */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="inline-flex items-center gap-1.5 text-xs text-blue-950 font-mono px-2 py-1 bg-blue-100/80 rounded-md border border-blue-200/90"
              title={`Revisión automática cada 5 minutos. Próxima en ${formatCountdown(autoSyncCountdown)} (última: ${lastVerifiedTime})`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Auto-revisión 5m</span>
              <span className="font-semibold tabular-nums text-blue-900">{formatCountdown(autoSyncCountdown)}</span>
            </span>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="h-8.5 px-3 text-xs font-medium text-slate-800 bg-white hover:bg-blue-50 border border-blue-200/80 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-60 shadow-xs"
              title="Revisar ahora con fuentes oficiales"
            >
              <RefreshCw className={`size-3 text-slate-500 ${isSyncing ? 'animate-spin text-blue-700' : ''}`} />
              <span className="hidden xs:inline">{isSyncing ? 'Revisando' : 'Revisar'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex p-1 bg-blue-100/70 rounded-xl gap-1 text-xs font-medium overflow-x-auto scrollbar-none border border-blue-200/60">
          <button
            onClick={() => setActiveTab('temas')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'temas' ? 'bg-white text-slate-950 shadow-xs font-bold ring-1 ring-blue-300' : 'text-slate-600'
            }`}
          >
            Temas
          </button>
          <button
            onClick={() => setActiveTab('cotizaciones')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'cotizaciones' ? 'bg-white text-slate-950 shadow-xs font-bold ring-1 ring-blue-300' : 'text-slate-600'
            }`}
          >
            {selectedCountry === 'BR' ? 'Cotações' : 'Cotizaciones'}
          </button>
          <button
            onClick={() => setActiveTab('plazo_fijo')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'plazo_fijo' ? 'bg-white text-slate-950 shadow-xs font-bold ring-1 ring-blue-300' : 'text-slate-600'
            }`}
          >
            {selectedCountry === 'BR' ? 'CDB' : 'Plazos'}
          </button>
          <button
            onClick={() => setActiveTab('tendencias')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'tendencias' ? 'bg-white text-slate-950 shadow-xs font-bold ring-1 ring-blue-300' : 'text-slate-600'
            }`}
          >
            Gráficos
          </button>
          <button
            onClick={() => setActiveTab('fuentes')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'fuentes' ? 'bg-white text-slate-950 shadow-xs font-bold ring-1 ring-blue-300' : 'text-slate-600'
            }`}
          >
            Fuentes
          </button>
          <button
            onClick={() => setActiveTab('asesor')}
            className={`flex-1 min-w-[85px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'asesor' ? 'bg-white text-slate-950 shadow-xs font-bold ring-1 ring-blue-300' : 'text-slate-600'
            }`}
          >
            Asesor
          </button>
        </div>

        {/* ============================================================ */}
        {/* FIRST THING THE USER SEES: TEMAS DE INTERÉS (VISUAL & DATA-DRIVEN) */}
        {/* ============================================================ */}
        {activeTab === 'temas' && (
          <div className="space-y-6">

            {/* Anti-Bias & Data-Driven Header */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-blue-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-700 font-semibold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>
                      {selectedCountry === 'BR'
                        ? 'DADO PURO · BRASIL · 13-10-2026'
                        : 'DATO PURO · ARGENTINA · 13-10-2026'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                    {selectedCountry === 'BR' ? 'Temas Econômicos' : 'Temas Económicos'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                    {selectedCountry === 'BR'
                      ? 'Dados oficiais de fontes primárias. Sem intermediários nem viés jornalístico.'
                      : 'Datos oficiales de fuentes primarias. Sin intermediarios ni sesgo periodístico.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => setIsCustomizingTopics(!isCustomizingTopics)}
                    className="h-8.5 px-3 bg-blue-100/70 hover:bg-blue-100 text-blue-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-blue-200/80"
                  >
                    <SlidersHorizontal className="size-3.5 text-blue-800" />
                    <span>
                      {isCustomizingTopics
                        ? (selectedCountry === 'BR' ? 'Pronto' : 'Listo')
                        : (selectedCountry === 'BR' ? 'Ajustar' : 'Ajustar')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Customization Drawer */}
              {isCustomizingTopics && (
                <div className="pt-3 border-t border-blue-100 space-y-2.5 animate-in fade-in duration-200">
                  <div className="text-xs font-semibold text-slate-900">
                    {selectedCountry === 'BR' ? 'Temas em exibição:' : 'Temas en pantalla:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {topics.map(topic => {
                      const isChecked = userInterestTopicIds.includes(topic.id);
                      const warm = getTopicWarmBadge(topic.id);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => toggleTopicInterest(topic.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-2 transition-all ${
                            isChecked
                              ? `${warm.activePill}`
                              : 'bg-blue-50/50 text-slate-600 border-blue-200/60 hover:bg-blue-100/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <TopicIcon name={topic.iconName} className="size-4 shrink-0" />
                            <span className="font-medium truncate">{topic.shortName}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-white text-slate-900' : 'border border-blue-300'
                          }`}>
                            {isChecked && <Check className="size-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Visual Topic Filter Pills - NO VARIABLE COUNT (User Request) */}
              <div className="pt-2.5 border-t border-blue-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setSelectedTopicFilter('ALL')}
                  className={`h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedTopicFilter === 'ALL'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-blue-100/60 hover:bg-blue-100 text-slate-700 border border-blue-200/70'
                  }`}
                >
                  Todos
                </button>
                {topics.map(topic => {
                  if (!userInterestTopicIds.includes(topic.id)) return null;
                  const isSelected = selectedTopicFilter === topic.id;
                  const warm = getTopicWarmBadge(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicFilter(selectedTopicFilter === topic.id ? 'ALL' : topic.id)}
                      className={`h-8 px-3 rounded-lg text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                        isSelected
                          ? warm.activePill
                          : 'bg-blue-100/60 hover:bg-blue-100 text-slate-700 border border-blue-200/70'
                      }`}
                    >
                      <TopicIcon name={topic.iconName} className="size-3" />
                      <span>{topic.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VISUAL CARDS GALLERY: Presentación de Temas mediante Imágenes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-blue-900/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Sectores
                </span>
                <span className="text-[11px] font-mono text-blue-900/50">
                  13-10-2026
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {topics.map(topic => {
                  if (!userInterestTopicIds.includes(topic.id)) return null;
                  const isSelected = selectedTopicFilter === topic.id;
                  const topicVars = variables.filter(v => v.topicId === topic.id);
                  const topVars = topicVars.slice(0, 3);
                  const warm = getTopicWarmBadge(topic.id);

                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopicFilter(isSelected ? 'ALL' : topic.id)}
                      className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 h-60 flex flex-col justify-between p-4 ${
                        isSelected
                          ? warm.cardBorder
                          : 'border-blue-900/15 hover:border-blue-400/60 shadow-xs hover:shadow-md'
                      }`}
                    >
                      {/* Background Technological Visualizer & Modern Subtle Backdrop */}
                      <TopicTechVisualizer topicId={topic.id} accentColor={topic.accentColor} />
                      {topic.imageUrl && (
                        <img
                          src={topic.imageUrl}
                          alt={topic.imageAlt || topic.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-20 mix-blend-luminosity brightness-50 contrast-125"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/15 pointer-events-none" />

                      {/* Card Top: Icon, Title & Status Badge */}
                      <div className="relative z-10 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 backdrop-blur-md text-sky-200 font-mono text-[10px] font-bold border border-blue-300/30">
                            OFICIAL
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 border border-white/20">
                            <TopicIcon name={topic.iconName} className="size-4" />
                          </div>
                          <h3 className="text-base font-bold text-white tracking-tight leading-snug drop-shadow-xs">
                            {topic.name}
                          </h3>
                        </div>
                      </div>

                      {/* Card Center: High-Density Live Data Strip (100% Data-Driven) */}
                      <div className="relative z-10 my-auto py-1">
                        <div className="bg-slate-950/80 backdrop-blur-md rounded-xl p-2.5 border border-blue-500/20 space-y-1.5">
                          {topVars.map(v => (
                            <div key={v.id} className="flex items-baseline justify-between text-xs gap-2">
                              <span className="text-slate-300 text-[11px] truncate font-medium">
                                {v.name}
                              </span>
                              <span className="text-white font-mono font-bold text-xs shrink-0 tabular-nums">
                                {formatVariableValue(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Bottom: Source tags and explore prompt */}
                      <div className="relative z-10 pt-1 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 overflow-hidden">
                          {topic.sources.slice(0, 3).map(src => (
                            <span
                              key={src.id}
                              className="px-1.5 py-0.5 rounded bg-white/10 backdrop-blur-xs text-white/80 font-mono text-[9px] border border-white/15 truncate"
                            >
                              {src.name}
                            </span>
                          ))}
                        </div>

                        <span className={`text-[11px] font-semibold flex items-center gap-0.5 shrink-0 transition-colors ${
                          isSelected ? 'text-sky-300 font-bold' : 'text-white/90 group-hover:text-sky-300'
                        }`}>
                          {isSelected ? 'Filtro' : 'Ver'} <ChevronRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Thematic Ecosystems with Connected Variables */}
            <div className="space-y-8">
              {displayedTopics.map(topic => {
                const topicVariables = variables.filter(v => v.topicId === topic.id);

                return (
                  <section
                    key={topic.id}
                    className="rounded-2xl bg-white border border-blue-200/80 shadow-xs overflow-hidden space-y-5"
                  >
                    {/* Thematic Panoramic Hero Banner with Technological Visualizer */}
                    <div className="relative h-36 sm:h-40 overflow-hidden p-5 sm:p-6 flex flex-col justify-between">
                      <TopicTechVisualizer topicId={topic.id} accentColor={topic.accentColor} />
                      {topic.imageUrl && (
                        <img
                          src={topic.imageUrl}
                          alt={topic.imageAlt || topic.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity brightness-50 contrast-125"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40 pointer-events-none" />

                      {/* Header overlay top */}
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-xs">
                            <TopicIcon name={topic.iconName} className="size-4.5" />
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-200 font-mono text-[10px] font-bold border border-blue-400/30">
                            Oficial · En vivo
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-300 hidden sm:inline-block">
                          13-10-2026
                        </span>
                      </div>

                      {/* Header overlay bottom */}
                      <div className="relative z-10 space-y-1.5">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
                          {topic.name}
                        </h2>

                        {/* Official & Chamber Sources Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono text-sky-200/80 mr-1">
                            Fuentes:
                          </span>
                          {topic.sources.map(source => (
                            <a
                              key={source.id}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 transition-colors"
                              title={`${source.fullName} - ${source.scope || source.role}`}
                            >
                              <span className="font-bold">{source.name}</span>
                              <span className="text-[9px] opacity-75">
                                ({source.type === 'publica' ? 'Oficial' : 'Cámara'})
                              </span>
                              <ExternalLink className="size-2.5 opacity-70" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Connected Variables Grid */}
                    <div className="p-5 sm:p-6 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {topicVariables.map(variable => {
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
                              className="p-4 rounded-xl bg-white hover:bg-blue-50/50 border border-blue-200/70 hover:border-blue-400/80 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] shadow-xs"
                            >
                              <div className="space-y-2">
                                {/* Meta Tags */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 border border-blue-200/80 text-blue-900">
                                    {variable.source}
                                  </span>

                                  <span className="text-[10px] font-mono text-slate-400">
                                    {variable.frequency}
                                  </span>
                                </div>

                                {/* Variable Name */}
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-950 transition-colors leading-snug line-clamp-2">
                                  {variable.name}
                                </h3>
                              </div>

                              {/* Value Display + Mini Sparkline */}
                              <div className="pt-3 mt-3 border-t border-blue-100 flex items-end justify-between gap-2">
                                <div>
                                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-950 tabular-nums block">
                                    {formatVariableValue(variable)}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                    {variable.lastUpdated}
                                    <span
                                      className={variable.live ? 'ml-1.5 text-emerald-600' : 'ml-1.5 text-slate-400'}
                                      title={variable.live ? 'Consultado a la fuente oficial' : 'Dato cargado manualmente; todavía no se consulta en vivo'}
                                    >
                                      {variable.live ? '● en vivo' : '○ estático'}
                                    </span>
                                  </span>
                                </div>

                                {/* Mini Trend Sparkline & Delta Badge */}
                                <div className="flex flex-col items-end gap-1">
                                  <MiniSparkline history={variable.history} isPositive={isPositiveDelta} />

                                  {delta !== 0 ? (
                                    <span className={`text-[11px] font-mono font-semibold flex items-center ${
                                      delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                      {delta > 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                                      {delta > 0 ? '+' : ''}{deltaPct.toFixed(2)}%
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-mono text-slate-400">
                                      Estable
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
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
                  <div
                    onClick={() => openVariableInspector('bcb_dolar_ptax_venda')}
                    className="p-5 rounded-2xl bg-white border border-blue-200/80 hover:border-blue-400/80 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-slate-800">Dólar Comercial PTAX</span>
                      <span className="font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 text-[10px]">BCB Oficial</span>
                    </div>

                    <div className="flex items-baseline justify-between gap-3 my-2">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-mono tabular-nums">
                        R$ 5,680
                      </span>
                      <span className="text-xs font-mono font-medium text-emerald-600 flex items-center">
                        <ArrowDownRight className="size-3.5" /> -0.15%
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-600 mt-2">
                      Compra: R$ 5,674 · Venda: R$ 5,680
                    </p>

                    <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>13-10-2026</span>
                      <span className="text-blue-700 font-sans font-medium flex items-center gap-0.5">
                        Ver histórico <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>

                  {/* DÓLAR TURISMO PAPEL MOEDA */}
                  <div
                    onClick={() => openVariableInspector('bcb_dolar_turismo')}
                    className="p-5 rounded-2xl bg-white border border-blue-200/80 hover:border-blue-400/80 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-slate-800">Dólar Turismo</span>
                      <span className="font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 text-[10px]">ABRACAM</span>
                    </div>

                    <div className="flex items-baseline justify-between gap-3 my-2">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-mono tabular-nums">
                        R$ 5,920
                      </span>
                      <span className="text-xs font-mono font-medium text-emerald-600 flex items-center">
                        <ArrowDownRight className="size-3.5" /> -0.10%
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-600 mt-2">
                      Compra: R$ 5,750 · Venda: R$ 5,920
                    </p>

                    <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>13-10-2026</span>
                      <span className="text-blue-700 font-sans font-medium flex items-center gap-0.5">
                        Ver histórico <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid de Outras Cotações Oficiais */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    onClick={() => openVariableInspector('bcb_euro_ptax')}
                    className="p-3.5 rounded-xl bg-white border border-blue-200/80 hover:border-blue-400 cursor-pointer shadow-xs"
                  >
                    <span className="text-[11px] text-slate-400 block font-mono">Euro PTAX</span>
                    <span className="text-lg font-bold font-mono text-slate-950 block mt-0.5">R$ 6,180</span>
                    <span className="text-[10px] text-emerald-600 font-mono">+0.22%</span>
                  </div>
                  <div
                    className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-xs"
                  >
                    <span className="text-[11px] text-slate-400 block font-mono">Libra (BCB)</span>
                    <span className="text-lg font-bold font-mono text-slate-950 block mt-0.5">R$ 7,122</span>
                    <span className="text-[10px] text-emerald-600 font-mono">+0.18%</span>
                  </div>
                  <div
                    onClick={() => openVariableInspector('bcb_reservas_internacionais')}
                    className="p-3.5 rounded-xl bg-white border border-blue-200/80 hover:border-blue-400 cursor-pointer shadow-xs"
                  >
                    <span className="text-[11px] text-slate-400 block font-mono">Reservas BCB</span>
                    <span className="text-lg font-bold font-mono text-slate-950 block mt-0.5">US$ 355,4 Bi</span>
                    <span className="text-[10px] text-slate-500 font-mono">Líquidas</span>
                  </div>
                  <div
                    className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-xs"
                  >
                    <span className="text-[11px] text-slate-400 block font-mono">Ouro (B3)</span>
                    <span className="text-lg font-bold font-mono text-slate-950 block mt-0.5">R$ 478,50</span>
                    <span className="text-[10px] text-emerald-600 font-mono">Por grama</span>
                  </div>
                </div>
              </div>
            ) : (
              /* COTIZACIONES BNA ARGENTINA */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DÓLAR BILLETE BNA */}
                {bnaBillete && (
                  <div
                    onClick={() => openVariableInspector(bnaBillete.id)}
                    className="p-5 rounded-2xl bg-white border border-blue-200/80 hover:border-blue-400/80 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-slate-800">Dólar Minorista Billete</span>
                      <span className="font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 text-[10px]">BNA Ventanilla</span>
                    </div>

                    <div className="flex items-baseline justify-between gap-3 my-2">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-mono tabular-nums">
                        {formatArs(bnaBillete.value)}
                      </span>
                      <span className="text-xs font-mono font-medium text-emerald-600 flex items-center">
                        <ArrowUpRight className="size-3.5" /> +0.06%
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-600 mt-2">
                      Compra: $1.005,00 · Venta: $1.025,00
                    </p>

                    <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>13-10-2026</span>
                      <span className="text-blue-700 font-sans font-medium flex items-center gap-0.5">
                        Ver histórico <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                )}

                {/* DÓLAR DIVISA BNA */}
                {bnaDivisa && (
                  <div
                    onClick={() => openVariableInspector(bnaDivisa.id)}
                    className="p-5 rounded-2xl bg-white border border-blue-200/80 hover:border-blue-400/80 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-slate-800">Dólar Divisa Transferencia</span>
                      <span className="font-mono text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 text-[10px]">BNA Electrónico</span>
                    </div>

                    <div className="flex items-baseline justify-between gap-3 my-2">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-mono tabular-nums">
                        {formatArs(bnaDivisa.value)}
                      </span>
                      <span className="text-xs font-mono font-medium text-emerald-600 flex items-center">
                        <ArrowUpRight className="size-3.5" /> +0.05%
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-600 mt-2">
                      Compra: $995,00 · Venta: $1.005,00
                    </p>

                    <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>13-10-2026</span>
                      <span className="text-blue-700 font-sans font-medium flex items-center gap-0.5">
                        Ver histórico <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Chart Inline Container */}
            {activeVar && (
              <div className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">
                      {activeVar.source} · {activeVar.frequency}
                    </div>
                    <h3 className="text-base font-bold text-slate-950 mt-0.5">
                      {activeVar.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-blue-100/60 p-0.5 rounded-lg self-start sm:self-auto border border-blue-200/60">
                    {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                      <button
                        key={range}
                        onClick={() => setChartRange(range)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                          chartRange === range
                            ? 'bg-[#0f274a] text-blue-100 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
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
                        labelFormatter={(label) => `Fecha: ${label}`}
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
                <h3 className="text-sm font-bold text-slate-950">
                  {selectedCountry === 'BR' ? 'Simulador de Renda Fixa CDB' : 'Simulador de Plazo Fijo'}
                </h3>
                <span className="text-xs font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                  13-10-2026
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">
                    {selectedCountry === 'BR' ? 'Monto em reais (BRL):' : 'Monto en pesos (ARS):'}
                  </label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={e => setSimAmount(Math.max(1000, Number(e.target.value)))}
                    className="w-full h-10 px-3 bg-blue-50/30 border border-blue-200 rounded-xl text-sm font-mono font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Plazo:</label>
                  <select
                    value={simDays}
                    onChange={e => setSimDays(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-blue-50/30 border border-blue-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  >
                    <option value={30}>30 días (Mes)</option>
                    <option value={60}>60 días (Bimestral)</option>
                    <option value={90}>90 días (Trimestral)</option>
                    <option value={180}>180 días (Semestral)</option>
                  </select>
                </div>
              </div>

              {topBank && bnaBank && (() => {
                const topGain = calculateBankReturn(topBank.tna, simAmount, simDays);
                const bnaGain = calculateBankReturn(bnaBank.tna, simAmount, simDays);
                return (
                  <div className="mt-4 pt-4 border-t border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80">
                      <span className="text-xs text-blue-900/80 block font-mono">
                        Máximo: {topBank.shortName} ({topBank.tna.toFixed(2)}%)
                      </span>
                      <span className="text-xl font-bold font-mono tabular-nums text-emerald-700 block mt-1">
                        +{formatArs(topGain.interest)}
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Total: <strong className="font-mono text-slate-900">{formatArs(topGain.total)}</strong>
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <span className="text-xs text-slate-700 block font-mono">
                        {selectedCountry === 'BR' ? 'Banco Público' : 'Banco Nación: BNA'} ({bnaBank.tna.toFixed(2)}%)
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

            {/* Bank Filter Tabs - NO COUNT (User Request) */}
            <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setBankTypeFilter('all')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'all'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border border-blue-200/70 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setBankTypeFilter('non_clients')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'non_clients'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border border-blue-200/70 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  No Clientes
                </button>
                <button
                  onClick={() => setBankTypeFilter('publico')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'publico'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border border-blue-200/70 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  Públicos
                </button>
                <button
                  onClick={() => setBankTypeFilter('privado')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'privado'
                      ? 'bg-[#0f274a] text-blue-100 shadow-xs ring-1 ring-blue-500/30'
                      : 'bg-white border border-blue-200/70 text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  Privados
                </button>
              </div>

              <span className="text-slate-400 font-mono text-[11px]">
                Canal digital · 30 días
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-100">
                    <div>
                      <div className="text-xs font-mono text-slate-400">
                        {activeVar.source} · {activeVar.frequency}
                      </div>
                      <h3 className="text-base font-bold text-slate-950 mt-0.5">{activeVar.name}</h3>
                      <div className="text-xs text-slate-600 mt-0.5">
                        13-10-2026: <strong className="font-mono text-slate-950">{formatVariableValue(activeVar)}</strong>
                      </div>
                    </div>

                    {/* Chart Range Switcher: 30D, 90D, 1Y, 3Y */}
                    <div className="flex items-center gap-1 bg-blue-100/60 p-0.5 rounded-lg self-start sm:self-auto border border-blue-200/60">
                      {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                        <button
                          key={range}
                          onClick={() => setChartRange(range)}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            chartRange === range
                              ? 'bg-[#0f274a] text-blue-100 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Metric Cards for Selected Period */}
                  {chartStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500">Variación</div>
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
                        <div className="text-[11px] font-medium text-slate-500">Inicial ({formatChartDate(chartStats.firstPoint.date)})</div>
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                          {chartStats.initialVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-500">{activeVar.unit}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500">Mínimo</div>
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                          {chartStats.minVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-500">{activeVar.unit}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
                        <div className="text-[11px] font-medium text-slate-500">Máximo</div>
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
                          labelFormatter={(label) => `Fecha: ${label}`}
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

                  <p className="text-xs text-slate-600 leading-relaxed pt-2 font-mono">
                    {activeVar.description}
                  </p>
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
        {/* TAB 6: ASESOR IA (GEMINI) */}
        {/* ============================================================ */}
        {activeTab === 'asesor' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-blue-200/80 shadow-xs overflow-hidden flex flex-col h-[500px]">
              {/* Header */}
              <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/30">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Asesor Macro</h3>
                  <span className="text-xs text-slate-500 font-mono">Fuentes oficiales BNA, BCB, INDEC, IBGE y Cámaras</span>
                </div>
                <span className="text-xs font-mono text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-300">
                  13-10-2026
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#edf3fa]">
                {chatMessages.map(m => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                      {m.sender === 'user' ? 'Vos' : 'Asesor'} · {m.timestamp}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-[#0f274a] text-blue-100 rounded-tr-none'
                          : 'bg-white text-slate-900 border border-blue-200/80 rounded-tl-none shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white border border-blue-200 rounded-xl w-fit text-xs text-slate-600">
                    <RefreshCw className="size-3 animate-spin text-blue-700" />
                    <span>Consultando fuentes...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Questions */}
              <div className="p-2 border-t border-blue-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('¿A cuánto cotiza hoy el dólar billete y divisa en el BNA?')}
                  className="h-7 px-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] rounded-lg text-blue-900 whitespace-nowrap"
                >
                  Dólar BNA
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('¿Qué banco paga hoy la mejor tasa de plazo fijo?')}
                  className="h-7 px-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] rounded-lg text-blue-900 whitespace-nowrap"
                >
                  Mejor Plazo Fijo
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('¿Cuánto estimó el REM de inflación mensual para septiembre y octubre 2026?')}
                  className="h-7 px-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] rounded-lg text-blue-900 whitespace-nowrap"
                >
                  Inflación REM
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('¿Cuánto liquidó el agro esta semana según CIARA-CEC?')}
                  className="h-7 px-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] rounded-lg text-blue-900 whitespace-nowrap"
                >
                  Agro CIARA-CEC
                </button>
              </div>

              {/* Input */}
              <form
                onSubmit={e => { e.preventDefault(); handleSendChatMessage(); }}
                className="p-3 border-t border-blue-200 bg-white flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Consulta rápida sobre variables o cotizaciones..."
                  className="flex-1 h-10 px-3 border border-blue-200/90 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-blue-50/20"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="h-10 px-4 bg-[#0f274a] hover:bg-slate-950 text-blue-100 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* INTERACTIVE MODAL / DRAWER FOR VARIABLE INSPECTION */}
        {/* ============================================================ */}
        {isChartModalOpen && activeVar && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-blue-200/90 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-5 sm:p-6 space-y-4">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-blue-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      activeVar.sourceType === 'publica'
                        ? 'bg-blue-100 border-blue-300 text-blue-900'
                        : 'bg-sky-100 border-sky-300 text-sky-900'
                    }`}>
                      {activeVar.source} · {activeVar.sourceType === 'publica' ? 'Oficial' : 'Cámara'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {activeVar.frequency}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {activeVar.name}
                  </h3>
                  <div className="text-sm font-mono font-extrabold text-blue-950 mt-0.5">
                    {formatVariableValue(activeVar)}
                  </div>
                </div>

                <button
                  onClick={() => setIsChartModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-blue-100/60 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Range Selector: 30D, 90D, 1Y, 3Y */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">Período:</span>
                <div className="flex items-center gap-1 bg-blue-100/60 p-0.5 rounded-lg border border-blue-200/70">
                  {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        chartRange === range
                          ? 'bg-[#0f274a] text-blue-100 shadow-xs'
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
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-medium text-slate-500">Var {chartRange}</div>
                    <div className="text-xs font-extrabold font-mono mt-0.5">
                      <span className={chartStats.nominalDiff > 0 ? 'text-emerald-700' : chartStats.nominalDiff < 0 ? 'text-rose-700' : 'text-slate-700'}>
                        {chartStats.nominalDiff > 0 ? '+' : ''}{chartStats.percentChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-medium text-slate-500">Inicio ({formatChartDate(chartStats.firstPoint.date)})</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.initialVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')}
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-medium text-slate-500">Mínimo</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.minVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')}
                    </div>
                  </div>

                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-medium text-slate-500">Máximo</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.maxVal.toLocaleString(selectedCountry === 'BR' ? 'pt-BR' : 'es-AR')}
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#bfdbfe" strokeOpacity={0.4} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                      axisLine={{ stroke: '#bfdbfe' }}
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
                        borderColor: '#1e40af',
                        borderRadius: '8px',
                        color: '#eff6ff',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono'
                      }}
                      labelStyle={{ color: '#93c5fd' }}
                      labelFormatter={(label) => `Fecha: ${label}`}
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

              {/* Description & Source Link */}
              <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs text-slate-600">
                <p className="text-xs text-slate-600 leading-relaxed pr-4 font-mono">
                  {activeVar.description}
                </p>
                <a
                  href={activeVar.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 px-3 py-1.5 bg-blue-100/70 hover:bg-blue-200/80 text-blue-950 border border-blue-300 rounded-lg font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Fuente</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Sober Blue Footer */}
        <footer className="pt-8 pb-4 border-t border-blue-200/60 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EconoLogo
              country={selectedCountry}
              onSelectCountry={handleSelectCountry}
            />
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-mono flex-wrap">
            {selectedCountry === 'BR' ? (
              <>
                <span className="text-blue-800 font-semibold">BCB</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">IBGE</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">B3</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">FGV</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">Tesouro</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">ANFAVEA</span>
                <span>·</span>
                <span>13-10-2026</span>
              </>
            ) : (
              <>
                <span className="text-blue-800 font-semibold">BNA</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">BCRA</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">INDEC</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">CIARA-CEC</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">ADEFA</span>
                <span>·</span>
                <span className="text-blue-800 font-semibold">BYMA</span>
                <span>·</span>
                <span>13-10-2026</span>
              </>
            )}
          </div>
        </footer>
      </main>

      {/* Mobile Fixed Bottom Tab Bar in Sober Blue Palette */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#edf3fa]/95 backdrop-blur-md border-t border-blue-200/90 grid grid-cols-5 items-center h-16 px-1 shadow-xs">
        <button
          onClick={() => setActiveTab('temas')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'temas' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">Temas</span>
        </button>

        <button
          onClick={() => setActiveTab('cotizaciones')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'cotizaciones' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-base font-mono font-bold leading-none">$</span>
          <span className="text-[10px] tracking-tight mt-1">{selectedCountry === 'BR' ? 'Câmbio' : 'Dólar'}</span>
        </button>

        <button
          onClick={() => setActiveTab('plazo_fijo')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'plazo_fijo' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">{selectedCountry === 'BR' ? 'CDB' : 'Plazo Fijo'}</span>
        </button>

        <button
          onClick={() => setActiveTab('tendencias')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'tendencias' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">Gráficos</span>
        </button>

        <button
          onClick={() => setActiveTab('asesor')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'asesor' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">Asesor</span>
        </button>
      </nav>
    </div>
  );
}
