import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Send,
  Bell,
  Trash2,
  Plus,
  X,
  Check,
  Landmark,
  TrendingUp,
  SlidersHorizontal,
  Shield,
  Layers,
  HelpCircle
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
import { EconomicVariable, AlertRule, AlertLog, ChatMessage, VariableCategory, BankFixedTermRate } from './types';
import { computeBankRates } from './fixedTermData';

type Tab = 'cotizaciones' | 'plazo_fijo' | 'tendencias' | 'catalogo' | 'asesor';

function formatDateArg(dateStr: string): string {
  if (!dateStr) return '13-10-2026';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

export default function App() {
  // --- Data State ---
  const [variables, setVariables] = useState<EconomicVariable[]>([]);
  const [bankRates, setBankRates] = useState<BankFixedTermRate[]>(computeBankRates('2026-10-13'));
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>('cotizaciones');

  // Active variable for chart inspection
  const [selectedVarId, setSelectedVarId] = useState<string>('bna_dolar_billete');
  const [chartRange, setChartRange] = useState<'7D' | '15D' | '30D'>('15D');

  // Plazo Fijo Simulator State
  const [simAmount, setSimAmount] = useState<number>(100000);
  const [simDays, setSimDays] = useState<number>(30);
  const [bankTypeFilter, setBankTypeFilter] = useState<'all' | 'publico' | 'privado' | 'non_clients'>('all');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<VariableCategory | 'ALL'>('ALL');

  // Auto-Update Engine State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncDate, setLastSyncDate] = useState<string>('2026-10-13');
  const [lastSyncTime, setLastSyncTime] = useState<string>('13:40');

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
      text: 'Bienvenido. Consultá cotizaciones minoristas del BNA, tasas de plazo fijo y variables oficiales actualizadas al 13-10-2026.',
      timestamp: '13-10-2026'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
        setVariables(varsData);
      }
      if (banksRes.ok) {
        const banksData = await banksRes.json();
        if (banksData.rates) setBankRates(banksData.rates);
      }

      setLastSyncDate('2026-10-13');
      setLastSyncTime(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsSyncing(false);
      setLoading(false);
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
        triggerToast('Datos sincronizados al 13-10-2026');
      }
    } catch {
      loadData(true);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-update interval every minute
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

  const handleSendChatMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          previousMessages: chatMessages.slice(-4)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            sender: 'assistant',
            text: data.text || 'Consulta completada.',
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

  const calculateBankReturn = (tna: number, amount: number, days: number) => {
    const interest = (amount * (tna / 100) * days) / 365;
    return {
      interest: Math.round(interest),
      total: Math.round(amount + interest),
      pct: parseFloat(((interest / amount) * 100).toFixed(2))
    };
  };

  // Selected variables
  const bnaBillete = variables.find(v => v.id === 'bna_dolar_billete');
  const bnaDivisa = variables.find(v => v.id === 'bna_dolar_divisa');
  const rem = variables.find(v => v.id === 'rem_inflacion_esperada');
  const uva = variables.find(v => v.id === 'valor_uva');
  const badlar = variables.find(v => v.id === 'tasa_badlar');
  const ipc = variables.find(v => v.id === 'ipc_inflacion_mensual');
  const cer = variables.find(v => v.id === 'coeficiente_cer');
  const reservas = variables.find(v => v.id === 'reservas_brutas');

  const activeVar = variables.find(v => v.id === selectedVarId) || bnaBillete || variables[0];

  const chartData = useMemo(() => {
    if (!activeVar || !activeVar.history) return [];
    const count = chartRange === '7D' ? 7 : chartRange === '15D' ? 15 : 30;
    return activeVar.history.slice(-count);
  }, [activeVar, chartRange]);

  // Filtered banks
  const filteredBanks = bankRates.filter(b => {
    if (bankTypeFilter === 'publico') return b.type === 'publico';
    if (bankTypeFilter === 'privado') return b.type === 'privado';
    if (bankTypeFilter === 'non_clients') return b.nonClientOnline;
    return true;
  });

  const bnaBank = bankRates.find(b => b.id === 'banco_nacion');
  const topBank = bankRates[0];

  // Catalogue search
  const filteredCatalogue = variables.filter(v => {
    const matchCat = selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-slate-900 selection:text-white pb-24 md:pb-16 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-slate-800 animate-in fade-in duration-200">
          <Check className="size-3.5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Bar Minimalista (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 bg-[#fafafa]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
          
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={e => { e.preventDefault(); setActiveTab('cotizaciones'); }}
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
          >
            BNA Financiero
          </a>

          {/* Zone 2: Navigation Links (Clean single-line text) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('cotizaciones')}
              className={`transition-colors whitespace-nowrap ${activeTab === 'cotizaciones' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'}`}
            >
              Cotizaciones
            </button>
            <button
              onClick={() => setActiveTab('plazo_fijo')}
              className={`transition-colors whitespace-nowrap ${activeTab === 'plazo_fijo' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'}`}
            >
              Plazo Fijo
            </button>
            <button
              onClick={() => setActiveTab('tendencias')}
              className={`transition-colors whitespace-nowrap ${activeTab === 'tendencias' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'}`}
            >
              Tendencias
            </button>
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`transition-colors whitespace-nowrap ${activeTab === 'catalogo' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'}`}
            >
              Variables
            </button>
            <button
              onClick={() => setActiveTab('asesor')}
              className={`transition-colors whitespace-nowrap ${activeTab === 'asesor' ? 'text-slate-950 font-semibold' : 'hover:text-slate-900'}`}
            >
              Asesor IA
            </button>
          </nav>

          {/* Zone 3: Primary Action & Auto-Sync Status */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-xs text-slate-500 font-mono">
              13-10-2026
            </span>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="h-9 px-3 text-xs font-medium text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
              title="Actualizar datos oficiales"
            >
              <RefreshCw className={`size-3 text-slate-500 ${isSyncing ? 'animate-spin text-slate-900' : ''}`} />
              <span className="hidden xs:inline">{isSyncing ? 'Actualizando' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

        {/* Minimal Hero Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Mercado Financiero Argentino</span>
            <span aria-hidden="true">·</span>
            <span>Datos Oficiales BNA y BCRA</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-600">Al 13-10-2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            {activeTab === 'cotizaciones' && 'Cotizaciones Minoristas'}
            {activeTab === 'plazo_fijo' && 'Plazo Fijo Electrónico'}
            {activeTab === 'tendencias' && 'Tendencias Históricas'}
            {activeTab === 'catalogo' && 'Variables Económicas'}
            {activeTab === 'asesor' && 'Asesor Macroeconómico'}
          </h1>
        </div>

        {/* Segmented Control on Mobile / Secondary switcher */}
        <div className="md:hidden flex p-1 bg-slate-200/60 rounded-xl gap-1 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('cotizaciones')}
            className={`flex-1 min-w-[90px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'cotizaciones' ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Cotizaciones
          </button>
          <button
            onClick={() => setActiveTab('plazo_fijo')}
            className={`flex-1 min-w-[90px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'plazo_fijo' ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Plazo Fijo
          </button>
          <button
            onClick={() => setActiveTab('tendencias')}
            className={`flex-1 min-w-[90px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'tendencias' ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Gráficos
          </button>
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`flex-1 min-w-[90px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'catalogo' ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Variables
          </button>
          <button
            onClick={() => setActiveTab('asesor')}
            className={`flex-1 min-w-[90px] py-2 text-center rounded-lg transition-all ${
              activeTab === 'asesor' ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            Asesor
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: COTIZACIONES MINORISTAS BNA */}
        {/* ============================================================ */}
        {activeTab === 'cotizaciones' && (
          <div className="space-y-6">
            
            {/* 2 Primary BNA Cards: Clean, bold typography */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* DÓLAR BILLETE BNA */}
              {bnaBillete && (
                <div
                  onClick={() => { setSelectedVarId(bnaBillete.id); }}
                  className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all active:scale-[0.99] ${
                    selectedVarId === bnaBillete.id
                      ? 'border-slate-900 ring-1 ring-slate-900/10 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-medium text-slate-600">Dólar Minorista Billete</span>
                    <span className="font-mono text-slate-400">BNA · Mostrador</span>
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
                    Venta en ventanilla en sucursales del Banco Nación. Base de cálculo impositiva para turismo y consumos con tarjeta.
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Ajuste: 13-10-2026</span>
                    <span className="text-slate-900 font-sans font-medium flex items-center gap-0.5">
                      Ver curva <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              )}

              {/* DÓLAR DIVISA BNA */}
              {bnaDivisa && (
                <div
                  onClick={() => { setSelectedVarId(bnaDivisa.id); }}
                  className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all active:scale-[0.99] ${
                    selectedVarId === bnaDivisa.id
                      ? 'border-slate-900 ring-1 ring-slate-900/10 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-medium text-slate-600">Dólar Minorista Divisa</span>
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
                    Cotización para transferencias y operaciones electrónicas bancarias directas reguladas por el Banco Nación.
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Ajuste: 13-10-2026</span>
                    <span className="text-slate-900 font-sans font-medium flex items-center gap-0.5">
                      Ver curva <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Fila de Indicadores Rápidos Oficiales (BCRA e INDEC) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rem && (
                <div
                  onClick={() => setSelectedVarId(rem.id)}
                  className={`p-3.5 rounded-xl bg-white border cursor-pointer transition-all active:scale-95 ${
                    selectedVarId === rem.id ? 'border-slate-900 ring-1 ring-slate-900/10 shadow-xs' : 'border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs text-slate-500 block">REM BCRA (Mediana)</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-950 block mt-1">
                    {formatRate(rem.value)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">Inflación esperada</span>
                </div>
              )}

              {ipc && (
                <div
                  onClick={() => setSelectedVarId(ipc.id)}
                  className={`p-3.5 rounded-xl bg-white border cursor-pointer transition-all active:scale-95 ${
                    selectedVarId === ipc.id ? 'border-slate-900 ring-1 ring-slate-900/10 shadow-xs' : 'border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs text-slate-500 block">Inflación IPC</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-rose-600 block mt-1">
                    {formatRate(ipc.value)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">INDEC Oficial</span>
                </div>
              )}

              {badlar && (
                <div
                  onClick={() => setSelectedVarId(badlar.id)}
                  className={`p-3.5 rounded-xl bg-white border cursor-pointer transition-all active:scale-95 ${
                    selectedVarId === badlar.id ? 'border-slate-900 ring-1 ring-slate-900/10 shadow-xs' : 'border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs text-slate-500 block">Tasa BADLAR</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-950 block mt-1">
                    {formatRate(badlar.value)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">Bancos Priv. BCRA</span>
                </div>
              )}

              {uva && (
                <div
                  onClick={() => setSelectedVarId(uva.id)}
                  className={`p-3.5 rounded-xl bg-white border cursor-pointer transition-all active:scale-95 ${
                    selectedVarId === uva.id ? 'border-slate-900 ring-1 ring-slate-900/10 shadow-xs' : 'border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs text-slate-500 block">Valor UVA</span>
                  <span className="text-lg font-bold font-mono tabular-nums text-slate-950 block mt-1">
                    {formatArs(uva.value)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">BCRA Diario</span>
                </div>
              )}
            </div>

            {/* Quick Chart Inline Container */}
            {activeVar && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">
                      {activeVar.source} · {activeVar.frequency}
                    </div>
                    <h3 className="text-sm font-bold text-slate-950 mt-0.5">
                      {activeVar.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg self-start sm:self-auto">
                    {(['7D', '15D', '30D'] as const).map(range => (
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
                <div className="h-56 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
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
                        formatter={(val: any) => [`$${Number(val).toLocaleString('es-AR')}`, activeVar.name]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0f172a"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: '#0f172a' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Quick Plazo Fijo Access Callout */}
            <div
              onClick={() => setActiveTab('plazo_fijo')}
              className="p-4 rounded-xl bg-slate-900 text-white cursor-pointer hover:bg-slate-800 transition-colors flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-xs text-slate-400 font-mono block">Régimen de Transparencia BCRA</span>
                <span className="text-sm font-semibold tracking-tight text-white block mt-0.5">
                  Comparativo de Tasas de Plazo Fijo en Pesos · Hasta 23.50% TNA · BNA 19.25%
                </span>
              </div>
              <ChevronRight className="size-5 text-slate-400 shrink-0" />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PLAZO FIJO ELECTRÓNICO (Calculadora & Comparativo) */}
        {/* ============================================================ */}
        {activeTab === 'plazo_fijo' && (
          <div className="space-y-6">
            
            {/* Simulador Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
              <h2 className="text-sm font-bold text-slate-950 mb-3 flex items-center justify-between">
                <span>Calculadora de Ganancia Neta</span>
                <span className="text-xs font-normal font-mono text-slate-400">Vigente 13-10-2026</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">
                    Monto en pesos a invertir:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-medium">$</span>
                    <input
                      type="number"
                      min="1000"
                      step="10000"
                      value={simAmount}
                      onChange={e => setSimAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full h-11 pl-8 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold font-mono tabular-nums text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Fast Amount Selectors */}
                  <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none">
                    {[50000, 100000, 250000, 500000, 1000000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setSimAmount(amt)}
                        className={`h-7 px-2.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap ${
                          simAmount === amt
                            ? 'bg-slate-900 text-white font-medium'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        ${amt >= 1000000 ? '1M' : `${amt / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">
                    Plazo de la colocación:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 90].map(days => (
                      <button
                        key={days}
                        onClick={() => setSimDays(days)}
                        className={`h-9 text-xs font-medium rounded-lg border transition-all ${
                          simDays === days
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {days} días
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Highlight Return */}
              {topBank && bnaBank && (() => {
                const topGain = calculateBankReturn(topBank.tna, simAmount, simDays);
                const bnaGain = calculateBankReturn(bnaBank.tna, simAmount, simDays);
                return (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-xs text-slate-400 block font-mono">Máximo Mercado: {topBank.shortName} ({topBank.tna.toFixed(2)}%)</span>
                      <span className="text-xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
                        +{formatArs(topGain.interest)}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Total a cobrar: <strong className="font-mono text-slate-700">{formatArs(topGain.total)}</strong>
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl">
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

            {/* Filters */}
            <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setBankTypeFilter('all')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todos ({bankRates.length})
                </button>
                <button
                  onClick={() => setBankTypeFilter('non_clients')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'non_clients'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  No Clientes Web
                </button>
                <button
                  onClick={() => setBankTypeFilter('publico')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'publico'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Públicos
                </button>
                <button
                  onClick={() => setBankTypeFilter('privado')}
                  className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    bankTypeFilter === 'privado'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Privados
                </button>
              </div>

              <span className="text-slate-400 font-mono text-[11px]">
                Tasas a 30 días canal web
              </span>
            </div>

            {/* List of Banks */}
            <div className="divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              {filteredBanks.map((bank, idx) => {
                const gain = calculateBankReturn(bank.tna, simAmount, simDays);
                const isBNA = bank.id === 'banco_nacion';

                return (
                  <div
                    key={bank.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isBNA ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
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
        {/* TAB 3: TENDENCIAS Y CURVAS HISTÓRICAS */}
        {/* ============================================================ */}
        {activeTab === 'tendencias' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80">
              <label className="text-xs text-slate-500 font-medium block mb-1.5">
                Seleccionar variable para graficar:
              </label>
              <select
                value={selectedVarId}
                onChange={e => setSelectedVarId(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              >
                <optgroup label="Cambiario y BNA">
                  {variables
                    .filter(v => v.category === 'MONETARY_EXCHANGE')
                    .map(v => (
                      <option key={v.id} value={v.id}>
                        [{v.source}] {v.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Tasas e Inflación">
                  {variables
                    .filter(v => v.category !== 'MONETARY_EXCHANGE')
                    .map(v => (
                      <option key={v.id} value={v.id}>
                        [{v.source}] {v.name}
                      </option>
                    ))}
                </optgroup>
              </select>

              {activeVar && (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-950">{activeVar.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Valor al 13-10-2026: <strong className="font-mono text-slate-900">{activeVar.value} {activeVar.unit}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg self-start sm:self-auto">
                      {(['7D', '15D', '30D'] as const).map(range => (
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

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
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
                          formatter={(val: any) => [`${val} ${activeVar.unit}`, activeVar.name]}
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
        {/* TAB 4: CATÁLOGO COMPLETO DE VARIABLES */}
        {/* ============================================================ */}
        {activeTab === 'catalogo' && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar variable oficial (ej. BNA, Dólar, UVA, BADLAR)..."
                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              {filteredCatalogue.map(v => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVarId(v.id);
                    setActiveTab('cotizaciones');
                    triggerToast(`Seleccionado: ${v.name}`);
                  }}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <span>{v.source}</span>
                      <span>·</span>
                      <span>{v.frequency}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-950 truncate mt-0.5">{v.name}</h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold font-mono tabular-nums text-slate-950 block">
                      {v.value.toLocaleString('es-AR')} <span className="text-xs font-normal text-slate-500">{v.unit}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">13-10-2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: ASESOR IA (Gemini) */}
        {/* ============================================================ */}
        {activeTab === 'asesor' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col h-[480px]">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Asesor Financiero Institucional</h3>
                  <span className="text-xs text-slate-500 font-mono">Boletines oficiales BNA / BCRA / INDEC</span>
                </div>
                <span className="text-xs font-mono text-slate-400">13-10-2026</span>
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
                    <span>Consultando bases oficiales...</span>
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
                  onClick={() => handleSendChatMessage('¿Qué diferencia existe entre el Dólar Billete y el Dólar Divisa del BNA?')}
                  className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-[11px] rounded-lg text-slate-700 whitespace-nowrap"
                >
                  ¿Billete vs Divisa?
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
                  placeholder="Escribí una consulta sobre cotizaciones o tasas..."
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

        {/* Minimal Footer */}
        <footer className="pt-8 pb-4 border-t border-slate-200/60 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-800">Monitor Financiero Argentina</span>
            <span className="text-slate-400"> · Actualizado automáticamente al 13-10-2026</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>BNA</span>
            <span>·</span>
            <span>BCRA</span>
            <span>·</span>
            <span>INDEC</span>
            <span>·</span>
            <span>Ley 25.326</span>
          </div>
        </footer>
      </main>

      {/* Mobile Fixed Bottom Tab Bar (Ergonomic Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center h-16 px-1 shadow-xs">
        <button
          onClick={() => setActiveTab('cotizaciones')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'cotizaciones' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span className="text-base font-mono font-bold leading-none">$</span>
          <span className="text-[10px] tracking-tight mt-1">BNA</span>
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
          onClick={() => setActiveTab('catalogo')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeTab === 'catalogo' ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Layers className="size-4" />
          <span className="text-[10px] tracking-tight mt-1">Variables</span>
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
