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
  EconomicVariable,
  ChatMessage,
  BankFixedTermRate,
  TopicId,
  EconomicTopic
} from './types';
import { ARGENTINA_ECONOMIC_VARIABLES, ECONOMIC_TOPICS } from './data';
import { computeBankRates } from './fixedTermData';

type Tab = 'temas' | 'cotizaciones' | 'plazo_fijo' | 'tendencias' | 'fuentes' | 'asesor';

// ============================================================================
// Modern Logo Component
// ============================================================================
function EconoLogo({ onClick }: { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2.5 cursor-pointer group select-none"
      title="Econoapp - Monitor Económico Argentino"
    >
      <div className="relative flex items-center justify-center shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-[1px] shadow-xs group-hover:scale-105 transition-transform duration-200">
          <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 via-indigo-500/10 to-teal-400/20 pointer-events-none" />
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
              {/* Ascending financial vector and pulse dot */}
              <path
                d="M13 3L20 3M20 3L20 10M20 3L11 12"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="3" r="1.5" fill="#34d399" />
              <defs>
                <linearGradient id="econo-grad-main" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f8fafc" />
                  <stop offset="1" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-[17px] font-black tracking-tight text-slate-950 font-sans">
            Econo<span className="text-emerald-600 font-extrabold">app</span>
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-md">
            ARG
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-400 tracking-tight mt-0.5">
          Variables Oficiales & Cámaras
        </span>
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

export default function App() {
  // --- Data State ---
  const [variables, setVariables] = useState<EconomicVariable[]>(ARGENTINA_ECONOMIC_VARIABLES);
  const [bankRates, setBankRates] = useState<BankFixedTermRate[]>(computeBankRates('2026-10-13'));
  const [topics] = useState<EconomicTopic[]>(ECONOMIC_TOPICS);

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
  const [selectedVarId, setSelectedVarId] = useState<string>('bna_dolar_billete');
  const [chartRange, setChartRange] = useState<'30D' | '90D' | '1Y' | '3Y'>('90D');
  const [isChartModalOpen, setIsChartModalOpen] = useState<boolean>(false);

  // Plazo Fijo Simulator State
  const [simAmount, setSimAmount] = useState<number>(100000);
  const [simDays, setSimDays] = useState<number>(30);
  const [bankTypeFilter, setBankTypeFilter] = useState<'all' | 'publico' | 'privado' | 'non_clients'>('all');

  // Search in catalogue
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Auto-Update Engine State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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

  // Initial load
  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsSyncing(true);
      const [varsRes, banksRes] = await Promise.all([
        fetch('/api/variables'),
        fetch('/api/plazos-fijos')
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
        if (data.variables) setVariables(data.variables);
        setBankRates(computeBankRates('2026-10-13'));
        triggerToast('Datos sincronizados exactamente al 13-10-2026');
      }
    } catch {
      loadData(true);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
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
            text: data.reply,
            timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            sender: 'assistant',
            text: 'Información oficial temporalmente no disponible.',
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
  const formatArs = (val: number, decimals = 2) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const formatRate = (val: number) => {
    return `${val.toFixed(2)}%`;
  };

  const formatVariableValue = (variable: EconomicVariable) => {
    if (variable.unit.includes('ARS/USD')) {
      return formatArs(variable.value, 2);
    }
    if (variable.unit.startsWith('%') || variable.unit.includes('%')) {
      const prefix = variable.value > 0 && variable.unit.includes('interanual') ? '+' : '';
      return `${prefix}${variable.value.toFixed(2)}%`;
    }
    if (variable.unit.includes('USD')) {
      return `USD ${variable.value.toLocaleString('es-AR')} M`;
    }
    if (variable.unit === 'ARS') {
      return formatArs(variable.value, 0);
    }
    if (variable.unit.includes('Millones de ARS')) {
      return `$${(variable.value / 1000000).toLocaleString('es-AR', { maximumFractionDigits: 2 })} B`;
    }
    if (variable.unit.includes('Unidades') || variable.unit.includes('Actos') || variable.unit.includes('GWh')) {
      return `${variable.value.toLocaleString('es-AR')} ${variable.unit.split('/')[0]}`;
    }
    return `${variable.value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${variable.unit}`;
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

    const refDate = new Date('2026-10-13T12:00:00Z');
    let daysToSubtract = 90;
    if (chartRange === '30D') daysToSubtract = 30;
    else if (chartRange === '90D') daysToSubtract = 90;
    else if (chartRange === '1Y') daysToSubtract = 365;
    else if (chartRange === '3Y') daysToSubtract = 365 * 3;

    const cutoffDate = new Date(refDate);
    cutoffDate.setDate(refDate.getDate() - daysToSubtract);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const filtered = activeVar.history.filter(point => point.date >= cutoffStr && point.date <= '2026-10-13');

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

  const bnaBank = bankRates.find(b => b.id === 'banco_nacion');
  const topBank = bankRates[0];

  // Specific variables for quick reference
  const bnaBillete = variables.find(v => v.id === 'bna_dolar_billete');
  const bnaDivisa = variables.find(v => v.id === 'bna_dolar_divisa');

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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-slate-900 selection:text-white pb-24 md:pb-16 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-slate-800 animate-in fade-in duration-200">
          <Check className="size-3.5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Bar with Modern Econoapp Logo */}
      <header className="sticky top-0 z-30 bg-[#fafafa]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 h-15 flex items-center justify-between gap-6">
          
          {/* Zone 1: Modern Econoapp Logo */}
          <EconoLogo onClick={() => setActiveTab('temas')} />

          {/* Zone 2: Navigation Links (Clean single-line text) */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('temas')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap px-2.5 py-1 rounded-lg ${
                activeTab === 'temas'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Layers className="size-3.5" />
              <span>Temas de Interés</span>
            </button>
            <button
              onClick={() => setActiveTab('cotizaciones')}
              className={`transition-colors whitespace-nowrap ${
                activeTab === 'cotizaciones' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Cotizaciones BNA
            </button>
            <button
              onClick={() => setActiveTab('plazo_fijo')}
              className={`transition-colors whitespace-nowrap ${
                activeTab === 'plazo_fijo' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Plazo Fijo
            </button>
            <button
              onClick={() => setActiveTab('tendencias')}
              className={`transition-colors whitespace-nowrap ${
                activeTab === 'tendencias' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Tendencias
            </button>
            <button
              onClick={() => setActiveTab('fuentes')}
              className={`transition-colors whitespace-nowrap ${
                activeTab === 'fuentes' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Fuentes & Cámaras
            </button>
            <button
              onClick={() => setActiveTab('asesor')}
              className={`transition-colors whitespace-nowrap ${
                activeTab === 'asesor' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Asesor IA
            </button>
          </nav>

          {/* Zone 3: Date & Manual Sync */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 font-mono px-2 py-1 bg-slate-100 rounded-md border border-slate-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              13-10-2026
            </span>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="h-8.5 px-3 text-xs font-medium text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-60 shadow-2xs"
              title="Actualizar datos oficiales"
            >
              <RefreshCw className={`size-3 text-slate-500 ${isSyncing ? 'animate-spin text-slate-900' : ''}`} />
              <span className="hidden xs:inline">{isSyncing ? 'Sincronizando' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex p-1 bg-slate-200/60 rounded-xl gap-1 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('temas')}
            className={`flex-1 min-w-[95px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'temas' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Temas
          </button>
          <button
            onClick={() => setActiveTab('cotizaciones')}
            className={`flex-1 min-w-[95px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'cotizaciones' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Cotizaciones
          </button>
          <button
            onClick={() => setActiveTab('plazo_fijo')}
            className={`flex-1 min-w-[95px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'plazo_fijo' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Plazos Fijos
          </button>
          <button
            onClick={() => setActiveTab('tendencias')}
            className={`flex-1 min-w-[95px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'tendencias' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Gráficos
          </button>
          <button
            onClick={() => setActiveTab('fuentes')}
            className={`flex-1 min-w-[95px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'fuentes' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Fuentes
          </button>
          <button
            onClick={() => setActiveTab('asesor')}
            className={`flex-1 min-w-[95px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'asesor' ? 'bg-white text-slate-950 shadow-xs font-bold' : 'text-slate-600'
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
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 font-semibold tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>DATO PURO Y TRANSPARENTE · 13-10-2026</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                    Temas de Interés Económico
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                    Monitoreo visual y directo de fuentes primarias (BCRA, INDEC, BNA, BYMA, ADEFA, CAC, CAME). Sin opiniones periodísticas, sin sesgos ideológicos y sin la complejidad de los boletines oficiales.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => setIsCustomizingTopics(!isCustomizingTopics)}
                    className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <SlidersHorizontal className="size-3.5 text-slate-600" />
                    <span>{isCustomizingTopics ? 'Cerrar Ajustes' : 'Personalizar Temas'}</span>
                  </button>
                </div>
              </div>

              {/* Customization Drawer */}
              {isCustomizingTopics && (
                <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">Elegí qué temas querés fijar en tu panel:</span>
                    <span className="text-slate-400 font-mono text-[11px]">{userInterestTopicIds.length} de {topics.length} activos</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {topics.map(topic => {
                      const isChecked = userInterestTopicIds.includes(topic.id);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => toggleTopicInterest(topic.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-2 transition-all ${
                            isChecked
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <TopicIcon name={topic.iconName} className="size-4 shrink-0" />
                            <span className="font-medium truncate">{topic.shortName}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-white text-slate-900' : 'border border-slate-300'
                          }`}>
                            {isChecked && <Check className="size-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Visual Topic Filter Pills */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setSelectedTopicFilter('ALL')}
                  className={`h-8 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedTopicFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Todos los temas ({userInterestTopicIds.length})
                </button>
                {topics.map(topic => {
                  if (!userInterestTopicIds.includes(topic.id)) return null;
                  const isSelected = selectedTopicFilter === topic.id;
                  const varCount = variables.filter(v => v.topicId === topic.id).length;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicFilter(selectedTopicFilter === topic.id ? 'ALL' : topic.id)}
                      className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <TopicIcon name={topic.iconName} className="size-3" />
                      <span>{topic.shortName}</span>
                      <span className="text-[10px] font-mono opacity-60">({varCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VISUAL CARDS GALLERY: Presentación de Temas mediante Imágenes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 px-1">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Galería Visual de Sectores Económicos (Clic para filtrar)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  5 Temas · 29 Variables Oficiales
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {topics.map(topic => {
                  if (!userInterestTopicIds.includes(topic.id)) return null;
                  const isSelected = selectedTopicFilter === topic.id;
                  const topicVars = variables.filter(v => v.topicId === topic.id);
                  const topVars = topicVars.slice(0, 3);

                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopicFilter(isSelected ? 'ALL' : topic.id)}
                      className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 h-60 flex flex-col justify-between p-4 ${
                        isSelected
                          ? 'border-emerald-500 shadow-lg ring-2 ring-emerald-500/30'
                          : 'border-slate-200/90 hover:border-slate-400 shadow-2xs hover:shadow-md'
                      }`}
                    >
                      {/* Background Image with Dark Vignette */}
                      <img
                        src={topic.imageUrl}
                        alt={topic.imageAlt || topic.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.60] contrast-[1.05]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/30" />

                      {/* Card Top: Icon, Title & Variable Badge */}
                      <div className="relative z-10 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/20">
                            {topicVars.length} variables
                          </span>

                          {topic.visualSummary && (
                            <span className="text-[10px] font-mono text-emerald-300 font-semibold px-2 py-0.5 rounded-md bg-slate-950/70 border border-emerald-500/30">
                              {topic.visualSummary}
                            </span>
                          )}
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
                        <div className="bg-slate-950/75 backdrop-blur-md rounded-xl p-2.5 border border-white/10 space-y-1.5">
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
                          isSelected ? 'text-emerald-400 font-bold' : 'text-white/90 group-hover:text-emerald-300'
                        }`}>
                          {isSelected ? 'Filtrado' : 'Ver todo'} <ChevronRight className="size-3" />
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
                    className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden space-y-5"
                  >
                    {/* Thematic Panoramic Hero Banner with Image */}
                    <div className="relative h-40 sm:h-44 overflow-hidden p-5 sm:p-6 flex flex-col justify-between">
                      {/* Background photographic banner */}
                      <img
                        src={topic.imageUrl}
                        alt={topic.imageAlt || topic.name}
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.55] contrast-[1.1]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />

                      {/* Header overlay top */}
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-xs">
                            <TopicIcon name={topic.iconName} className="size-4.5" />
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                            {topicVariables.length} variables oficiales conectadas
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-300 hidden sm:inline-block">
                          Corte unificado: 13-10-2026
                        </span>
                      </div>

                      {/* Header overlay bottom */}
                      <div className="relative z-10 space-y-2">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
                          {topic.name}
                        </h2>

                        {/* Official & Chamber Sources Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-300 mr-1">
                            Fuentes primarias:
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
                                ({source.type === 'publica' ? 'Pública' : 'Cámara'})
                              </span>
                              <ExternalLink className="size-2.5 opacity-70" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Connected Variables Grid (at least 5 per topic!) */}
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
                              className="p-4 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] shadow-2xs hover:shadow-xs"
                            >
                              <div className="space-y-2">
                                {/* Meta Tags */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
                                    variable.sourceType === 'publica'
                                      ? 'bg-white border-blue-200 text-blue-700'
                                      : 'bg-white border-emerald-200 text-emerald-700'
                                  }`}>
                                    {variable.source} · {variable.sourceType === 'publica' ? 'Pública' : 'Cámara'}
                                  </span>

                                  <span className="text-[10px] font-mono text-slate-400">
                                    {variable.frequency}
                                  </span>
                                </div>

                                {/* Variable Name */}
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors leading-snug line-clamp-2">
                                  {variable.name}
                                </h3>
                              </div>

                              {/* Value Display + Mini Sparkline */}
                              <div className="pt-3 mt-3 border-t border-slate-200/50 flex items-end justify-between gap-2">
                                <div>
                                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-950 tabular-nums block">
                                    {formatVariableValue(variable)}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                    Corte: {variable.lastUpdated}
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
        {/* TAB 2: COTIZACIONES MINORISTAS BNA */}
        {/* ============================================================ */}
        {activeTab === 'cotizaciones' && (
          <div className="space-y-6">
            
            {/* 2 Primary BNA Cards: Clean, bold typography */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* DÓLAR BILLETE BNA */}
              {bnaBillete && (
                <div
                  onClick={() => openVariableInspector(bnaBillete.id)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 cursor-pointer transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-800">Dólar Minorista Billete</span>
                    <span className="font-mono text-slate-400">BNA · Ventanilla</span>
                  </div>

                  <div className="flex items-baseline justify-between gap-3 my-2">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-mono tabular-nums">
                      {formatArs(bnaBillete.value)}
                    </span>
                    <span className="text-xs font-mono font-medium text-emerald-600 flex items-center">
                      <ArrowUpRight className="size-3.5" /> +0.06%
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    Cotización oficial de venta en ventanilla en sucursales del Banco Nación. Base de cálculo impositiva para turismo y consumos. Compra: $1.485,00 | Venta: $1.535,00 al 13-10-2026.
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Ajuste: 13-10-2026</span>
                    <span className="text-slate-900 font-sans font-medium flex items-center gap-0.5">
                      Ver curva 30D / 90D / 1Y / 3Y <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              )}

              {/* DÓLAR DIVISA BNA */}
              {bnaDivisa && (
                <div
                  onClick={() => openVariableInspector(bnaDivisa.id)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 cursor-pointer transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-800">Dólar Minorista Divisa</span>
                    <span className="font-mono text-slate-400">BNA · Transferencia</span>
                  </div>

                  <div className="flex items-baseline justify-between gap-3 my-2">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-mono tabular-nums">
                      {formatArs(bnaDivisa.value)}
                    </span>
                    <span className="text-xs font-mono font-medium text-emerald-600 flex items-center">
                      <ArrowUpRight className="size-3.5" /> +0.05%
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    Cotización para transferencias y operaciones electrónicas bancarias reguladas por el Banco Nación. Compra: $1.508,00 | Venta: $1.517,00 al 13-10-2026.
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Ajuste: 13-10-2026</span>
                    <span className="text-slate-900 font-sans font-medium flex items-center gap-0.5">
                      Ver curva 30D / 90D / 1Y / 3Y <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chart Inline Container */}
            {activeVar && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">
                      {activeVar.source} · {activeVar.frequency} · {activeVar.sourceType === 'publica' ? 'Entidad Pública' : 'Cámara Sectorial'}
                    </div>
                    <h3 className="text-base font-bold text-slate-950 mt-0.5">
                      {activeVar.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg self-start sm:self-auto">
                    {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                      <button
                        key={range}
                        onClick={() => setChartRange(range)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                          chartRange === range
                            ? 'bg-white text-slate-950 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
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
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatChartDate}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        tickLine={false}
                        axisLine={{ stroke: '#f1f5f9' }}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                        orientation="right"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'JetBrains Mono'
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                        labelFormatter={(label) => `Fecha: ${label}`}
                        formatter={(val: any) => [`${Number(val).toLocaleString('es-AR')} ${activeVar.unit}`, activeVar.name]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0f172a"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
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
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-950">Simulador de Depósito a Plazo Fijo</h3>
                <span className="text-xs font-mono text-slate-400">TNA Oficiales al 13-10-2026</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Monto en pesos (ARS):</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={e => setSimAmount(Math.max(1000, Number(e.target.value)))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Plazo en días:</label>
                  <select
                    value={simDays}
                    onChange={e => setSimDays(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                  >
                    <option value={30}>30 días (Mes completo)</option>
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
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400 block font-mono">Máximo Mercado: {topBank.shortName} ({topBank.tna.toFixed(2)}%)</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
                        +{formatArs(topGain.interest)}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Total a cobrar: <strong className="font-mono text-slate-700">{formatArs(topGain.total)}</strong>
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400 block font-mono">Banco Nación: BNA ({bnaBank.tna.toFixed(2)}%)</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
                        +{formatArs(bnaGain.interest)}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Total a cobrar: <strong className="font-mono text-slate-700">{formatArs(bnaGain.total)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bank Filter Tabs */}
            <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setBankTypeFilter('all')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todos ({bankRates.length})
                </button>
                <button
                  onClick={() => setBankTypeFilter('non_clients')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'non_clients'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  No Clientes Web
                </button>
                <button
                  onClick={() => setBankTypeFilter('publico')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'publico'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Públicos
                </button>
                <button
                  onClick={() => setBankTypeFilter('privado')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'privado'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Privados
                </button>
              </div>

              <span className="text-slate-400 font-mono text-[11px]">
                Tasas a 30 días canal digital
              </span>
            </div>

            {/* List of Banks */}
            <div className="divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
              {filteredBanks.map((bank, idx) => {
                const gain = calculateBankReturn(bank.tna, simAmount, simDays);
                const isBNA = bank.id === 'banco_nacion';

                return (
                  <div
                    key={bank.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isBNA ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'
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
                            <span className="text-emerald-600 font-sans font-medium">No Clientes Web</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-950 truncate mt-0.5">
                        {bank.bankName}
                        {isBNA && <span className="ml-1.5 text-xs text-slate-500 font-normal font-mono">(Oficial BNA)</span>}
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
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <label className="text-xs text-slate-500 font-medium block mb-1.5">
                Seleccionar variable para graficar tendencias históricas:
              </label>
              <select
                value={selectedVarId}
                onChange={e => setSelectedVarId(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-xs font-mono text-slate-400">
                        {activeVar.source} · {activeVar.frequency} · {activeVar.sourceType === 'publica' ? 'Entidad Pública Oficial' : 'Cámara Sectorial'}
                      </div>
                      <h3 className="text-base font-bold text-slate-950 mt-0.5">{activeVar.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Valor al 13-10-2026: <strong className="font-mono text-slate-900">{formatVariableValue(activeVar)}</strong>
                      </div>
                    </div>

                    {/* Chart Range Switcher: 30D, 90D, 1Y, 3Y */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg self-start sm:self-auto">
                      {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                        <button
                          key={range}
                          onClick={() => setChartRange(range)}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            chartRange === range ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
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
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[11px] font-medium text-slate-400">Variación {chartRange}</div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className={`text-sm font-extrabold font-mono tabular-nums ${
                            chartStats.nominalDiff > 0
                              ? 'text-emerald-600'
                              : chartStats.nominalDiff < 0
                              ? 'text-rose-600'
                              : 'text-slate-700'
                          }`}>
                            {chartStats.nominalDiff > 0 ? '+' : ''}{chartStats.percentChange.toFixed(2)}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({chartStats.nominalDiff > 0 ? '+' : ''}{chartStats.nominalDiff.toLocaleString('es-AR', { maximumFractionDigits: 2 })})
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[11px] font-medium text-slate-400">Valor Inicial ({formatChartDate(chartStats.firstPoint.date)})</div>
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                          {chartStats.initialVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-400">{activeVar.unit}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[11px] font-medium text-slate-400">Mínimo en {chartRange}</div>
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                          {chartStats.minVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-400">{activeVar.unit}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-[11px] font-medium text-slate-400">Máximo en {chartRange}</div>
                        <div className="text-sm font-extrabold font-mono tabular-nums text-slate-900 mt-0.5">
                          {chartStats.maxVal.toLocaleString('es-AR')} <span className="text-[10px] font-normal text-slate-400">{activeVar.unit}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatChartDate}
                          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                          tickLine={false}
                          axisLine={{ stroke: '#f1f5f9' }}
                        />
                        <YAxis
                          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                          tickLine={false}
                          axisLine={false}
                          domain={['auto', 'auto']}
                          orientation="right"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px',
                            fontFamily: 'JetBrains Mono'
                          }}
                          labelStyle={{ color: '#94a3b8' }}
                          labelFormatter={(label) => `Fecha: ${label}`}
                          formatter={(val: any) => [`${Number(val).toLocaleString('es-AR')} ${activeVar.unit}`, activeVar.name]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#0f172a"
                          strokeWidth={2.5}
                          dot={{ r: 2, fill: '#0f172a' }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed pt-2">
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
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-600">
                <BookOpen className="size-4" />
                <span>Transparencia y Rigor Metodológico · 13-10-2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
                Directorio de Fuentes Públicas y Cámaras Sectoriales
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Econoapp no inventa valores: releva y procesa datos suministrados directamente por entidades oficiales del Estado Nacional y cámaras representativas de la industria, comercio y finanzas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fuentes Públicas Oficiales */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="text-sm font-bold text-slate-950">Entidades Públicas Oficiales</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">BCRA</strong>
                      <span className="text-[11px] text-blue-600 font-mono">bcra.gob.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Banco Central de la República Argentina. Informa Reservas, UVA, CER, BADLAR, ICL y el Relevamiento de Expectativas de Mercado (REM).</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">BNA</strong>
                      <span className="text-[11px] text-blue-600 font-mono">bna.com.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Banco de la Nación Argentina. Publica cotización oficial minorista de Dólar Billete y Dólar Divisa, y tasas de Plazo Fijo electrónico.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">INDEC</strong>
                      <span className="text-[11px] text-blue-600 font-mono">indec.gob.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Instituto Nacional de Estadística y Censos. Publica IPC, Canasta Básica Total y Alimentaria, IPIM y Estimador de Actividad (EMAE).</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">ARCA (ex AFIP)</strong>
                      <span className="text-[11px] text-blue-600 font-mono">arca.gob.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Agencia de Recaudación y Control Aduanero. Emite los informes mensuales de recaudación tributaria nacional consolidada.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">MECON / Sec. Trabajo</strong>
                      <span className="text-[11px] text-blue-600 font-mono">argentina.gob.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Secretaría de Trabajo. Elabora la Remuneración Imponible Promedio de los Trabajadores Estables (RIPTE).</p>
                  </div>
                </div>
              </div>

              {/* Cámaras Sectoriales y Bolsas */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-950">Cámaras Sectoriales y Bolsas</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">CIARA-CEC</strong>
                      <span className="text-[11px] text-emerald-600 font-mono">ciaracec.com.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Cámara de la Industria Aceitera y Centro de Exportadores de Cereales. Publica la liquidación semanal efectiva de divisas del agro.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">BYMA</strong>
                      <span className="text-[11px] text-emerald-600 font-mono">byma.com.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Bolsas y Mercados Argentinos. Provee las cotizaciones bursátiles implícitas Dólar MEP, Dólar CCL y tasas de caución a 1 día.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">ADEFA</strong>
                      <span className="text-[11px] text-emerald-600 font-mono">adefa.org.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Asociación de Fábricas de Automotores. Informa mensualmente la producción nacional, despachos y exportaciones del sector.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">CAME</strong>
                      <span className="text-[11px] text-emerald-600 font-mono">redcame.org.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Confederación Argentina de la Mediana Empresa. Releva el Índice de Ventas Minoristas Pymes en todo el territorio nacional.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">CAC</strong>
                      <span className="text-[11px] text-emerald-600 font-mono">camarco.org.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Cámara Argentina de la Construcción. Elabora el Índice del Costo de Construcción por metro cuadrado (materiales y mano de obra).</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-mono">Colegio de Escribanos CABA</strong>
                      <span className="text-[11px] text-emerald-600 font-mono">colegio-escribanos.org.ar</span>
                    </div>
                    <p className="text-slate-500 mt-1">Releva y audita mensualmente la cantidad total de escrituras de compraventa inmobiliaria otorgadas en la Ciudad de Buenos Aires.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: ASESOR IA (GEMINI) */}
        {/* ============================================================ */}
        {activeTab === 'asesor' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col h-[500px]">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Asesor Macroeconómico Econoapp</h3>
                  <span className="text-xs text-slate-500 font-mono">Entrenado en boletines oficiales BNA, BCRA, INDEC y Cámaras</span>
                </div>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  13-10-2026
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
                {chatMessages.map(m => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                      {m.sender === 'user' ? 'Vos' : 'Asesor'} · {m.timestamp}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl w-fit text-xs text-slate-500">
                    <RefreshCw className="size-3 animate-spin text-slate-900" />
                    <span>Consultando bases oficiales y cámaras...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Questions */}
              <div className="p-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('¿A cuánto cotiza hoy el dólar billete y divisa en el BNA?')}
                  className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-[11px] rounded-lg text-slate-700 whitespace-nowrap"
                >
                  ¿Dólar BNA hoy?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('¿Qué banco paga hoy la mejor tasa de plazo fijo?')}
                  className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-[11px] rounded-lg text-slate-700 whitespace-nowrap"
                >
                  ¿Mejor tasa de plazo fijo?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('¿Cuánto estimó el REM de inflación mensual para septiembre y octubre 2026?')}
                  className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-[11px] rounded-lg text-slate-700 whitespace-nowrap"
                >
                  ¿Inflación REM BCRA?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('¿Cuánto liquidó el agro esta semana según CIARA-CEC?')}
                  className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-[11px] rounded-lg text-slate-700 whitespace-nowrap"
                >
                  ¿Liquidación CIARA-CEC?
                </button>
              </div>

              {/* Input */}
              <form
                onSubmit={e => { e.preventDefault(); handleSendChatMessage(); }}
                className="p-3 border-t border-slate-200 bg-white flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Escribí una consulta sobre temas de interés, cotizaciones o tasas..."
                  className="flex-1 h-10 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-900"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
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
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-5 sm:p-6 space-y-4">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      activeVar.sourceType === 'publica'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      {activeVar.source} · {activeVar.sourceType === 'publica' ? 'Pública Oficial' : 'Cámara Sectorial'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Frecuencia: {activeVar.frequency}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mt-1">
                    {activeVar.name}
                  </h3>
                  <div className="text-sm font-mono font-extrabold text-slate-900 mt-0.5">
                    {formatVariableValue(activeVar)}
                  </div>
                </div>

                <button
                  onClick={() => setIsChartModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Range Selector: 30D, 90D, 1Y, 3Y */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">Periodo de análisis:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  {(['30D', '90D', '1Y', '3Y'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setChartRange(range)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        chartRange === range
                          ? 'bg-white text-slate-950 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
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
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-medium text-slate-400">Variación {chartRange}</div>
                    <div className="text-xs font-extrabold font-mono mt-0.5">
                      <span className={chartStats.nominalDiff > 0 ? 'text-emerald-600' : chartStats.nominalDiff < 0 ? 'text-rose-600' : 'text-slate-700'}>
                        {chartStats.nominalDiff > 0 ? '+' : ''}{chartStats.percentChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-medium text-slate-400">Inicio ({formatChartDate(chartStats.firstPoint.date)})</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.initialVal.toLocaleString('es-AR')}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-medium text-slate-400">Mínimo en {chartRange}</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.minVal.toLocaleString('es-AR')}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-medium text-slate-400">Máximo en {chartRange}</div>
                    <div className="text-xs font-extrabold font-mono text-slate-900 mt-0.5">
                      {chartStats.maxVal.toLocaleString('es-AR')}
                    </div>
                  </div>
                </div>
              )}

              {/* Chart */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                      axisLine={{ stroke: '#f1f5f9' }}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      orientation="right"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono'
                      }}
                      labelStyle={{ color: '#94a3b8' }}
                      labelFormatter={(label) => `Fecha: ${label}`}
                      formatter={(val: any) => [`${Number(val).toLocaleString('es-AR')} ${activeVar.unit}`, activeVar.name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0f172a"
                      strokeWidth={2.5}
                      dot={{ r: 2, fill: '#0f172a' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Description & Source Link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <p className="text-xs text-slate-500 leading-relaxed pr-4">
                  {activeVar.description}
                </p>
                <a
                  href={activeVar.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Portal Fuente</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Footer */}
        <footer className="pt-8 pb-4 border-t border-slate-200/60 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <EconoLogo />
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono flex-wrap">
            <span>BNA</span>
            <span>·</span>
            <span>BCRA</span>
            <span>·</span>
            <span>INDEC</span>
            <span>·</span>
            <span>CIARA-CEC</span>
            <span>·</span>
            <span>ADEFA</span>
            <span>·</span>
            <span>BYMA</span>
            <span>·</span>
            <span>Actualizado al 13-10-2026</span>
          </div>
        </footer>
      </main>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center h-16 px-1 shadow-xs">
        <button
          onClick={() => setActiveTab('temas')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'temas' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Layers className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">Temas</span>
        </button>

        <button
          onClick={() => setActiveTab('cotizaciones')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'cotizaciones' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span className="text-base font-mono font-bold leading-none">$</span>
          <span className="text-[10px] tracking-tight mt-1">Dólar</span>
        </button>

        <button
          onClick={() => setActiveTab('plazo_fijo')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'plazo_fijo' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Landmark className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">Plazo Fijo</span>
        </button>

        <button
          onClick={() => setActiveTab('tendencias')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'tendencias' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">Gráficos</span>
        </button>

        <button
          onClick={() => setActiveTab('asesor')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'asesor' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sparkles className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">Asesor</span>
        </button>
      </nav>
    </div>
  );
}
