import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  Search,
  Plus,
  Trash2,
  Bell,
  Sparkles,
  RefreshCw,
  Sliders,
  Globe,
  Send,
  AlertTriangle,
  Scale,
  X,
  ChevronRight,
  Info,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  BarChart2,
  ShieldCheck,
  Clock,
  Landmark,
  Calculator,
  UserCheck,
  Award
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

// Category metadata with clean styling
const CATEGORY_LABELS: Record<VariableCategory, string> = {
  MONETARY_EXCHANGE: 'Cambiario y BNA',
  FINANCIAL_RATES: 'Tasas y UVA',
  MACRO_INFLATION_FISCAL: 'Macro e Inflación',
  SECTORS_SALARIES_SOCIAL: 'Social y Canastas'
};

type ActiveTab = 'cotizaciones' | 'plazos_fijos' | 'graficos' | 'catalogo' | 'herramientas';

export default function App() {
  // --- Core State ---
  const [variables, setVariables] = useState<EconomicVariable[]>([]);
  const [bankRates, setBankRates] = useState<BankFixedTermRate[]>(computeBankRates());
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('cotizaciones');
  
  // Active variable for chart inspection
  const [selectedVarId, setSelectedVarId] = useState<string>('bna_dolar_billete');
  const [chartRange, setChartRange] = useState<'7D' | '15D' | '30D'>('15D');

  // Search & Filter in Catalogue
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<VariableCategory | 'ALL'>('ALL');

  // Plazo Fijo Simulator State
  const [simAmount, setSimAmount] = useState<number>(100000);
  const [simDays, setSimDays] = useState<number>(30);
  const [bankFilter, setBankFilter] = useState<'all' | 'publico' | 'privado' | 'non_clients'>('all');

  // Daily Auto-Sync Engine State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncDate, setLastSyncDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Hoy');
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(true);

  // Alerts State
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [newAlertVarId, setNewAlertVarId] = useState<string>('bna_dolar_billete');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  const [newAlertThreshold, setNewAlertThreshold] = useState<string>('');

  // AI Advisor Chat State (Gemini)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy tu asistente financiero para datos oficiales de Argentina (BNA, BCRA e INDEC). Podés consultarme sobre la cotización del dólar BNA minorista (billete y divisa), el comparativo de tasas de plazo fijo entre bancos o el valor de la UVA.',
      timestamp: 'Hoy'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Initial Data Load & Daily Sync ---
  const fetchVariables = async (showNotification = false) => {
    try {
      setIsSyncing(true);
      const [varsRes, banksRes] = await Promise.all([
        fetch('/api/variables'),
        fetch('/api/plazos-fijos')
      ]);

      if (varsRes.ok) {
        const data: EconomicVariable[] = await varsRes.json();
        setVariables(data);
        const todayStr = new Date().toISOString().split('T')[0];
        setLastSyncDate(todayStr);
        setLastSyncTime(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
        checkAlertRules(data);
      }

      if (banksRes.ok) {
        const banksData = await banksRes.json();
        if (banksData.rates) {
          setBankRates(banksData.rates);
        }
      }

      if (showNotification) {
        showToast('Variables y tasas bancarias actualizadas automáticamente');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  };

  // Manual Trigger Force Sync
  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/sync/trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.variables) {
          setVariables(data.variables);
        }
        setBankRates(computeBankRates(data.syncDate));
        setLastSyncDate(data.syncDate || new Date().toISOString().split('T')[0]);
        setLastSyncTime(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
        showToast('Cotizaciones y tasas de plazo fijo actualizadas al día');
      }
    } catch (err) {
      console.error('Error in manual trigger sync:', err);
      fetchVariables(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Check alert conditions against latest values
  const checkAlertRules = (currentVars: EconomicVariable[]) => {
    const savedRulesStr = localStorage.getItem('ar_alert_rules');
    if (!savedRulesStr) return;
    try {
      const rules: AlertRule[] = JSON.parse(savedRulesStr);
      rules.forEach(rule => {
        if (!rule.isActive) return;
        const v = currentVars.find(item => item.id === rule.variableId);
        if (!v) return;

        const isTriggered = rule.condition === 'above' ? v.value > rule.threshold : v.value < rule.threshold;
        if (isTriggered) {
          const newLog: AlertLog = {
            id: `alert_${Date.now()}_${rule.id}`,
            variableId: v.id,
            variableName: v.name,
            condition: rule.condition,
            threshold: rule.threshold,
            triggeredValue: v.value,
            timestamp: new Date().toISOString()
          };
          setAlertLogs(prev => [newLog, ...prev.slice(0, 9)]);
        }
      });
    } catch (e) {
      console.error('Error checking alerts', e);
    }
  };

  useEffect(() => {
    fetchVariables();

    // Load saved alerts
    const savedRules = localStorage.getItem('ar_alert_rules');
    if (savedRules) {
      try { setAlertRules(JSON.parse(savedRules)); } catch (e) {}
    }

    // Daily interval check: checks every 60 seconds if date advanced or auto-update is pending
    const interval = setInterval(() => {
      if (autoUpdateEnabled) {
        fetchVariables();
      }
    }, 60000);

    // Auto update when window regains focus (e.g. mobile app switched back)
    const handleFocus = () => {
      if (autoUpdateEnabled) {
        fetchVariables();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && autoUpdateEnabled) {
        fetchVariables();
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [autoUpdateEnabled]);

  // Persist alerts to localStorage
  useEffect(() => {
    localStorage.setItem('ar_alert_rules', JSON.stringify(alertRules));
  }, [alertRules]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'herramientas') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // --- Handlers ---
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdNum = parseFloat(newAlertThreshold);
    if (isNaN(thresholdNum) || thresholdNum <= 0) {
      showToast('Ingresá un valor numérico válido');
      return;
    }
    const rule: AlertRule = {
      id: `rule_${Date.now()}`,
      variableId: newAlertVarId,
      condition: newAlertCondition,
      threshold: thresholdNum,
      isActive: true
    };
    setAlertRules(prev => [...prev, rule]);
    setNewAlertThreshold('');
    showToast('Alarma guardada');
  };

  const handleDeleteAlert = (id: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== id));
    showToast('Alarma eliminada');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
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
          message: userText,
          previousMessages: chatMessages.slice(-5)
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: data.text || 'Consulta procesada.',
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, assistantMsg]);
      } else {
        const data = await res.json().catch(() => ({}));
        const errReply: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: data.text || 'No se pudo conectar con el servicio de análisis en este momento.',
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, errReply]);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: 'Error de conexión al procesar la respuesta.',
          timestamp: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Helper formatting for currency and indicators
  const formatValue = (num: number, unit: string) => {
    if (unit.toLowerCase().includes('ars') || unit.toLowerCase().includes('peso')) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    }
    if (unit.toLowerCase().includes('%')) {
      return `${num.toFixed(2)}%`;
    }
    if (unit.toLowerCase().includes('millones')) {
      return `${num.toLocaleString('es-AR')} M`;
    }
    return `${num.toLocaleString('es-AR')} ${unit}`;
  };

  const formatCurrencySimple = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate 24h variation from history
  const get24hChange = (variable: EconomicVariable) => {
    if (!variable.history || variable.history.length < 2) return null;
    const current = variable.value;
    const prev = variable.history[variable.history.length - 2]?.value;
    if (!prev) return null;
    const diff = current - prev;
    const pct = (diff / prev) * 100;
    return { diff, pct, isPositive: diff >= 0 };
  };

  // Find key variables for quick display
  const bnaBillete = variables.find(v => v.id === 'bna_dolar_billete');
  const bnaDivisa = variables.find(v => v.id === 'bna_dolar_divisa');
  const mayoristaBcra = variables.find(v => v.id === 'tipo_cambio_mayorista');
  const uva = variables.find(v => v.id === 'valor_uva');
  const tasaPolitica = variables.find(v => v.id === 'tasa_politica_monetaria');
  const badlar = variables.find(v => v.id === 'tasa_badlar');
  const ipc = variables.find(v => v.id === 'ipc_inflacion_mensual');

  // Currently inspected variable
  const activeVar = variables.find(v => v.id === selectedVarId) || bnaBillete || variables[0];

  // Filtered chart data based on selected range
  const filteredHistory = React.useMemo(() => {
    if (!activeVar || !activeVar.history) return [];
    const count = chartRange === '7D' ? 7 : chartRange === '15D' ? 15 : 30;
    return activeVar.history.slice(-count);
  }, [activeVar, chartRange]);

  // Catalogue search & filter
  const filteredCatalog = variables.filter(v => {
    const matchCat = selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtered Banks for Plazo Fijo
  const filteredBanks = bankRates.filter(b => {
    if (bankFilter === 'publico') return b.type === 'publico';
    if (bankFilter === 'privado') return b.type === 'privado';
    if (bankFilter === 'non_clients') return b.nonClientOnline;
    return true;
  });

  // Calculate return for a specific bank rate
  const calculateGain = (tna: number, amount: number, days: number) => {
    const interest = (amount * (tna / 100) * days) / 365;
    return {
      interest: Math.round(interest),
      total: Math.round(amount + interest),
      returnPct: parseFloat(((interest / amount) * 100).toFixed(2))
    };
  };

  // Top rate bank
  const topBank = bankRates.length > 0 ? bankRates[0] : null;
  const bnaBank = bankRates.find(b => b.id === 'banco_nacion');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24 md:pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in border border-slate-700">
          <Check className="size-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              AR
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                Monitor Financiero
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">Cotizaciones BNA & Tasas Bancarias</span>
            </div>
          </div>

          {/* Daily Auto-Sync Status & Refresh CTA */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Auto-actualización diaria</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-mono text-[11px]">{lastSyncTime}</span>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="min-h-[44px] min-w-[44px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60"
              title="Actualizar cotizaciones del día"
            >
              <RefreshCw className={`size-3.5 text-slate-600 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden xs:inline">{isSyncing ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* Desktop Segmented Navigation Tabs */}
        <div className="hidden md:block border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-5xl mx-auto px-4 flex gap-1 py-1.5">
            <button
              onClick={() => setActiveTab('cotizaciones')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'cotizaciones'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cotizaciones BNA
            </button>
            <button
              onClick={() => setActiveTab('plazos_fijos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'plazos_fijos'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="size-3.5 text-blue-600" />
              Plazo Fijo Bancos ({bankRates.length})
            </button>
            <button
              onClick={() => setActiveTab('graficos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'graficos'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gráficos y Tendencias
            </button>
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'catalogo'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catálogo de Variables ({variables.length})
            </button>
            <button
              onClick={() => setActiveTab('herramientas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'herramientas'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Asesor IA y Alarmas
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-4 md:pt-6">
        
        {/* Daily Auto-Update Notice (Mobile-Friendly Banner) */}
        <div className="mb-4 bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="size-4 text-blue-600 shrink-0" />
            <span>
              Actualizado hoy <strong className="text-slate-900 font-mono">{lastSyncDate}</strong> con cotizaciones BNA y tasas informadas al BCRA
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
            Al Día
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="size-6 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-xs text-slate-500">Cargando cotizaciones oficiales y tasas bancarias...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: COTIZACIONES DEL DÍA (Simplified Mobile-First Focus) */}
            {activeTab === 'cotizaciones' && (
              <div className="space-y-4">
                
                {/* HERO BNA MINORISTA SECTION */}
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Banco de la Nación Argentina (BNA) · Monedas Minoristas
                    </h2>
                    <span className="text-[11px] text-slate-400">Oficial en mostrador</span>
                  </div>

                  {/* 2 Main Cards: Dólar Billete and Dólar Divisa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* BNA DÓLAR BILLETE */}
                    {bnaBillete && (() => {
                      const change = get24hChange(bnaBillete);
                      const isSelected = selectedVarId === bnaBillete.id;
                      return (
                        <div
                          onClick={() => setSelectedVarId(bnaBillete.id)}
                          className={`p-4 rounded-xl border bg-white cursor-pointer transition-all active:scale-[0.99] min-h-[110px] ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-500/10 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span className="font-semibold text-slate-700">Dólar Minorista Billete</span>
                            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">BNA</span>
                          </div>
                          <div className="flex items-baseline justify-between gap-2 my-1">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                              {formatValue(bnaBillete.value, bnaBillete.unit)}
                            </span>
                            {change && (
                              <span className={`text-xs font-semibold flex items-center font-mono ${change.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {change.isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                                {change.pct.toFixed(2)}%
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                            Venta en ventanilla · Base para turismo y tarjeta
                          </p>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Último ajuste: {bnaBillete.lastUpdated}</span>
                            <span className="text-blue-600 font-medium flex items-center gap-0.5">
                              {isSelected ? 'Mostrando tendencia abajo' : 'Ver gráfico'} <ChevronRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* BNA DÓLAR DIVISA */}
                    {bnaDivisa && (() => {
                      const change = get24hChange(bnaDivisa);
                      const isSelected = selectedVarId === bnaDivisa.id;
                      return (
                        <div
                          onClick={() => setSelectedVarId(bnaDivisa.id)}
                          className={`p-4 rounded-xl border bg-white cursor-pointer transition-all active:scale-[0.99] min-h-[110px] ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-500/10 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span className="font-semibold text-slate-700">Dólar Minorista Divisa</span>
                            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">BNA</span>
                          </div>
                          <div className="flex items-baseline justify-between gap-2 my-1">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                              {formatValue(bnaDivisa.value, bnaDivisa.unit)}
                            </span>
                            {change && (
                              <span className={`text-xs font-semibold flex items-center font-mono ${change.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {change.isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                                {change.pct.toFixed(2)}%
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                            Liquidaciones electrónicas y operaciones cambiarias BNA
                          </p>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Último ajuste: {bnaDivisa.lastUpdated}</span>
                            <span className="text-blue-600 font-medium flex items-center gap-0.5">
                              {isSelected ? 'Mostrando tendencia abajo' : 'Ver gráfico'} <ChevronRight className="size-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* BANNER COMPARADOR PLAZO FIJO (Quick Entry) */}
                <div
                  onClick={() => setActiveTab('plazos_fijos')}
                  className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 shadow-xs cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between gap-3 border border-blue-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-lg shrink-0">
                      <Landmark className="size-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tracking-tight">Comparativo Plazo Fijo Electrónico</span>
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                          Hasta 38% TNA
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-200 mt-0.5 line-clamp-1">
                        Consultá tasas del BNA ({bnaBank?.tna.toFixed(1)}% TNA), BAPRO, Santander, Galicia y más. Simulador de ganancias a 30 días.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-blue-300 shrink-0" />
                </div>

                {/* BCRA MAYORISTA & KEY MACRO CARDS */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Variables Clave BCRA e INDEC
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Mayorista A 3500 */}
                    {mayoristaBcra && (
                      <div
                        onClick={() => setSelectedVarId(mayoristaBcra.id)}
                        className={`p-3 rounded-xl border bg-white cursor-pointer transition-all active:scale-95 ${
                          selectedVarId === mayoristaBcra.id
                            ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 font-medium block">Dólar Mayorista</span>
                        <span className="text-base font-bold text-slate-900 font-mono block mt-1">
                          {formatValue(mayoristaBcra.value, mayoristaBcra.unit)}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">BCRA Com. A 3500</span>
                      </div>
                    )}

                    {/* UVA */}
                    {uva && (
                      <div
                        onClick={() => setSelectedVarId(uva.id)}
                        className={`p-3 rounded-xl border bg-white cursor-pointer transition-all active:scale-95 ${
                          selectedVarId === uva.id
                            ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 font-medium block">Valor UVA</span>
                        <span className="text-base font-bold text-slate-900 font-mono block mt-1">
                          {formatValue(uva.value, uva.unit)}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">Ajuste préstamos/CER</span>
                      </div>
                    )}

                    {/* Tasa Política Monetaria */}
                    {tasaPolitica && (
                      <div
                        onClick={() => setSelectedVarId(tasaPolitica.id)}
                        className={`p-3 rounded-xl border bg-white cursor-pointer transition-all active:scale-95 ${
                          selectedVarId === tasaPolitica.id
                            ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 font-medium block">Tasa Política Mon.</span>
                        <span className="text-base font-bold text-slate-900 font-mono block mt-1">
                          {formatValue(tasaPolitica.value, tasaPolitica.unit)}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">Referencia BCRA</span>
                      </div>
                    )}

                    {/* Inflación IPC */}
                    {ipc && (
                      <div
                        onClick={() => setSelectedVarId(ipc.id)}
                        className={`p-3 rounded-xl border bg-white cursor-pointer transition-all active:scale-95 ${
                          selectedVarId === ipc.id
                            ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 font-medium block">Inflación (IPC)</span>
                        <span className="text-base font-bold text-rose-600 font-mono block mt-1">
                          {formatValue(ipc.value, ipc.unit)}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">INDEC Último Mes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* INLINE CHART PREVIEW FOR SELECTED VARIABLE */}
                {activeVar && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-blue-600">{activeVar.source}</span>
                          <span>·</span>
                          <span>Frecuencia {activeVar.frequency}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeVar.name}</h3>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                          {(['7D', '15D', '30D'] as const).map(range => (
                            <button
                              key={range}
                              onClick={() => setChartRange(range)}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                chartRange === range
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-56 pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filteredHistory}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                          />
                          <YAxis
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#0f172a',
                              borderRadius: '8px',
                              border: 'none',
                              color: '#fff',
                              fontSize: '11px',
                              padding: '8px 12px'
                            }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                            formatter={(val: any) => [formatValue(Number(val), activeVar.unit), activeVar.name]}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={2.5}
                            dot={{ r: 2, fill: '#2563eb' }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 text-right">
                      Fuente oficial:{' '}
                      <a href={activeVar.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {activeVar.sourceUrl}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: COMPARATIVO DE PLAZOS FIJOS ELECTRÓNICOS */}
            {activeTab === 'plazos_fijos' && (
              <div className="space-y-4">
                
                {/* SIMULADOR INTERACTIVO DE PLAZO FIJO */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="size-4 text-blue-600" />
                      <h2 className="text-sm font-bold text-slate-900">Simulador de Plazo Fijo Personal Electrónico</h2>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">BCRA Canal Online</span>
                  </div>

                  {/* Input Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Monto a invertir (en pesos argentinos):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          min="1000"
                          step="1000"
                          value={simAmount}
                          onChange={e => setSimAmount(Math.max(0, Number(e.target.value)))}
                          className="w-full min-h-[44px] pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Fast Amount Buttons */}
                      <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none">
                        {[50000, 100000, 500000, 1000000].map(amt => (
                          <button
                            key={amt}
                            onClick={() => setSimAmount(amt)}
                            className={`min-h-[32px] px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors ${
                              simAmount === amt
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            ${amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Plazo de la colocación:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[30, 60, 90].map(days => (
                          <button
                            key={days}
                            onClick={() => setSimDays(days)}
                            className={`min-h-[44px] text-xs font-semibold rounded-xl border transition-all ${
                              simDays === days
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {days} días
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* HIGHLIGHT TOP RESULTS (BNA vs TOP RATE) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* TOP RATE BANK */}
                    {topBank && (() => {
                      const gain = calculateGain(topBank.tna, simAmount, simDays);
                      return (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
                            <span className="font-bold flex items-center gap-1">
                              <Award className="size-3.5 text-emerald-600" /> Mayor Tasa Disponible
                            </span>
                            <span className="font-mono font-bold text-emerald-700">{topBank.tna.toFixed(2)}% TNA</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-900">{topBank.bankName}</div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-[11px] text-slate-600">Ganancia en {simDays} días:</span>
                            <span className="text-base font-extrabold text-emerald-700 font-mono">
                              +{formatCurrencySimple(gain.interest)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex justify-between mt-0.5">
                            <span>Monto final total:</span>
                            <strong className="text-slate-900 font-mono">{formatCurrencySimple(gain.total)}</strong>
                          </div>
                        </div>
                      );
                    })()}

                    {/* BNA BENCHMARK */}
                    {bnaBank && (() => {
                      const gain = calculateGain(bnaBank.tna, simAmount, simDays);
                      return (
                        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                          <div className="flex items-center justify-between text-xs text-blue-800 mb-1">
                            <span className="font-bold flex items-center gap-1">
                              <Landmark className="size-3.5 text-blue-600" /> Banco Nación (BNA)
                            </span>
                            <span className="font-mono font-bold text-blue-700">{bnaBank.tna.toFixed(2)}% TNA</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-900">Banco de la Nación Argentina</div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-[11px] text-slate-600">Ganancia en {simDays} días:</span>
                            <span className="text-base font-extrabold text-blue-700 font-mono">
                              +{formatCurrencySimple(gain.interest)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex justify-between mt-0.5">
                            <span>Monto final total:</span>
                            <strong className="text-slate-900 font-mono">{formatCurrencySimple(gain.total)}</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* FILTROS DE BANCOS */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                    <button
                      onClick={() => setBankFilter('all')}
                      className={`min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                        bankFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Todos ({bankRates.length})
                    </button>
                    <button
                      onClick={() => setBankFilter('non_clients')}
                      className={`min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                        bankFilter === 'non_clients'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="size-3.5 text-emerald-500" />
                      Para No Clientes Web
                    </button>
                    <button
                      onClick={() => setBankFilter('publico')}
                      className={`min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                        bankFilter === 'publico'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Bancos Públicos
                    </button>
                    <button
                      onClick={() => setBankFilter('privado')}
                      className={`min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                        bankFilter === 'privado'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Bancos Privados
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Ordenado por TNA decreciente
                  </span>
                </div>

                {/* COMPARATIVE BANK CARDS LIST (Mobile Optimized Layout B) */}
                <div className="space-y-2.5">
                  {filteredBanks.map((bank, index) => {
                    const gain = calculateGain(bank.tna, simAmount, simDays);
                    const isBNA = bank.id === 'banco_nacion';

                    return (
                      <div
                        key={bank.id}
                        className={`p-3.5 bg-white rounded-xl border transition-all ${
                          isBNA
                            ? 'border-blue-400 ring-1 ring-blue-400/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: Bank Name & Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span className="font-bold text-slate-400 font-mono">#{index + 1}</span>
                              <span>·</span>
                              <span className="capitalize">{bank.type}</span>
                              {bank.nonClientOnline && (
                                <>
                                  <span>·</span>
                                  <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                    <UserCheck className="size-3" /> No Clientes Web
                                  </span>
                                </>
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5 flex items-center gap-1.5">
                              {bank.bankName}
                              {isBNA && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                                  BNA
                                </span>
                              )}
                            </h3>

                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Canal: {bank.channel}
                            </span>
                          </div>

                          {/* Right: Rates & Return */}
                          <div className="text-right shrink-0">
                            <span className="text-base font-extrabold text-slate-900 font-mono tabular-nums block">
                              {bank.tna.toFixed(2)}% <span className="text-xs font-semibold text-slate-500">TNA</span>
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              TEM {bank.tem.toFixed(2)}% · TEA {bank.tea.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Bottom Row: Profit with current simulated amount */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Ganás con {formatCurrencySimple(simAmount)} ({simDays}d):
                          </span>
                          <span className="font-bold font-mono text-emerald-700">
                            +{formatCurrencySimple(gain.interest)} ({gain.returnPct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                  <strong>Información de Transparencia del BCRA:</strong> Las tasas informadas corresponden a colocaciones intransferibles a 30 días realizadas a través de canales electrónicos (Home Banking y plataformas online para personas humanas) conforme el régimen informativo diario del Banco Central de la República Argentina.
                </div>
              </div>
            )}

            {/* TAB 3: GRÁFICOS Y TENDENCIAS DETALLADAS */}
            {activeTab === 'graficos' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Seleccionar variable para graficar:
                    </label>
                    <select
                      value={selectedVarId}
                      onChange={e => setSelectedVarId(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <optgroup label="Cambiario y BNA (Minorista)">
                        {variables
                          .filter(v => v.category === 'MONETARY_EXCHANGE')
                          .map(v => (
                            <option key={v.id} value={v.id}>
                              [{v.source}] {v.name} ({formatValue(v.value, v.unit)})
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
                  </div>

                  {activeVar && (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{activeVar.name}</h3>
                          <span className="text-xs text-slate-500">
                            Valor vigente: <strong className="font-mono text-slate-800">{formatValue(activeVar.value, activeVar.unit)}</strong> · Actualizado {activeVar.lastUpdated}
                          </span>
                        </div>

                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 self-start sm:self-auto">
                          {(['7D', '15D', '30D'] as const).map(range => (
                            <button
                              key={range}
                              onClick={() => setChartRange(range)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                chartRange === range
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="w-full h-72 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredHistory}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: '#64748b', fontSize: 11 }}
                              tickLine={false}
                              axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis
                              tick={{ fill: '#64748b', fontSize: 11 }}
                              tickLine={false}
                              axisLine={false}
                              domain={['auto', 'auto']}
                            />
                            <Tooltip
                              contentStyle={{
                                background: '#0f172a',
                                borderRadius: '8px',
                                border: 'none',
                                color: '#fff',
                                fontSize: '12px'
                              }}
                              labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                              formatter={(val: any) => [formatValue(Number(val), activeVar.unit), activeVar.name]}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#2563eb"
                              strokeWidth={3}
                              dot={{ r: 3, fill: '#2563eb' }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-200">
                        <strong>Descripción:</strong> {activeVar.description}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CATÁLOGO COMPLETO DE VARIABLES (Simple List for Mobile) */}
            {activeTab === 'catalogo' && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar variable (ej: BNA, Dólar, UVA, BADLAR)..."
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Category Filters */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory('ALL')}
                    className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === 'ALL'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Todas ({variables.length})
                  </button>
                  {(['MONETARY_EXCHANGE', 'FINANCIAL_RATES', 'MACRO_INFLATION_FISCAL', 'SECTORS_SALARIES_SOCIAL'] as const).map(
                    cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedCategory === cat
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    )
                  )}
                </div>

                {/* Variables List (Touch-Friendly Rows) */}
                <div className="space-y-2">
                  {filteredCatalog.map(v => {
                    const change = get24hChange(v);
                    const isSelected = selectedVarId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVarId(v.id);
                          setActiveTab('cotizaciones');
                          showToast(`Mostrando ${v.name}`);
                        }}
                        className={`p-3.5 bg-white rounded-xl border cursor-pointer transition-all active:scale-[0.99] min-h-[56px] flex items-center justify-between gap-3 ${
                          isSelected ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="font-bold text-blue-700 uppercase tracking-tight">{v.source}</span>
                            <span>·</span>
                            <span>{v.frequency}</span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 truncate mt-0.5">{v.name}</h4>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-slate-900 font-mono tabular-nums block">
                            {formatValue(v.value, v.unit)}
                          </span>
                          {change && (
                            <span
                              className={`text-[10px] font-mono font-medium ${
                                change.isPositive ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {change.isPositive ? '+' : ''}
                              {change.pct.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredCatalog.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No se encontraron variables con esa búsqueda.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: HERRAMIENTAS (Asesor IA Gemini & Alarmas) */}
            {activeTab === 'herramientas' && (
              <div className="space-y-6">
                
                {/* AI ADVISOR SECTION */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[480px]">
                  {/* Chat Header */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-amber-300" />
                      <div>
                        <h3 className="text-xs font-bold leading-none">Asesor Financiero IA</h3>
                        <span className="text-[10px] text-blue-200">Datos oficiales BNA / BCRA / INDEC</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Thread */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 px-1 mb-0.5">
                          {msg.sender === 'user' ? 'Vos' : 'Asesor'} · {msg.timestamp}
                        </span>
                        <div
                          className={`p-3 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}

                    {isChatLoading && (
                      <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl w-fit text-xs text-slate-500">
                        <RefreshCw className="size-3 animate-spin text-blue-600" />
                        <span>Consultando boletines oficiales...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick suggested chips */}
                  <div className="p-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setChatInput('¿Qué banco paga hoy la mejor tasa de plazo fijo en pesos?')}
                      className="bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap"
                    >
                      ¿Mejor tasa de plazo fijo?
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput('¿A cuánto cotiza hoy el Dólar Billete y Divisa en el BNA?')}
                      className="bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap"
                    >
                      ¿Cotización BNA hoy?
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput('¿Conviene hacer plazo fijo tradicional a 30 días o plazo fijo UVA?')}
                      className="bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap"
                    >
                      ¿Plazo Fijo vs UVA?
                    </button>
                  </div>

                  {/* Chat Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Hacé una consulta sobre cotizaciones, bancos o tasas..."
                      className="flex-1 min-h-[44px] px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !chatInput.trim()}
                      className="min-h-[44px] min-w-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex items-center justify-center disabled:opacity-50"
                    >
                      <Send className="size-4" />
                    </button>
                  </form>
                </div>

                {/* ALERTS CONFIGURATION */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Bell className="size-4 text-indigo-600" /> Alarmas de Cotización
                  </h3>

                  {/* Existing Alerts */}
                  <div className="space-y-2 mb-4">
                    {alertRules.map(rule => {
                      const v = variables.find(item => item.id === rule.variableId);
                      return (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 block">{v?.name || rule.variableId}</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              Avisar si {rule.condition === 'above' ? 'supera' : 'cae por debajo de'}{' '}
                              <strong>{rule.threshold}</strong>
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteAlert(rule.id)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600"
                            title="Eliminar alarma"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      );
                    })}

                    {alertRules.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-2">
                        No hay alarmas configuradas.
                      </p>
                    )}
                  </div>

                  {/* Add Alert Form */}
                  <form onSubmit={handleAddAlert} className="space-y-3 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Variable</label>
                      <select
                        value={newAlertVarId}
                        onChange={e => setNewAlertVarId(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        {variables.map(v => (
                          <option key={v.id} value={v.id}>
                            [{v.source}] {v.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Condición</label>
                        <select
                          value={newAlertCondition}
                          onChange={e => setNewAlertCondition(e.target.value as 'above' | 'below')}
                          className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="above">Mayor a (&gt;)</option>
                          <option value="below">Menor a (&lt;)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor Límite</label>
                        <input
                          type="number"
                          step="any"
                          value={newAlertThreshold}
                          onChange={e => setNewAlertThreshold(e.target.value)}
                          placeholder="Ej: 1050"
                          className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="size-4" /> Agregar Alarma
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* Quiet Legal Transparency Accordion */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-1 text-slate-700 font-semibold">
            <ShieldCheck className="size-4 text-blue-600" />
            <span>Fuentes Oficiales y Resguardo Legal</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Plataforma con actualización automática diaria basada en boletines públicos del Banco de la Nación Argentina (BNA), Banco Central de la República Argentina (BCRA) e INDEC. Cumplimiento con Ley 25.326 de Protección de Datos Personales y Ley 26.529 de Derechos del Paciente.
          </p>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb Ergonomics - 5 Destinations) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center h-16 pb-safe px-1 shadow-lg">
        <button
          onClick={() => setActiveTab('cotizaciones')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'cotizaciones' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="size-5" />
          <span className="text-[10px] tracking-tight mt-0.5">BNA</span>
        </button>

        <button
          onClick={() => setActiveTab('plazos_fijos')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'plazos_fijos' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Landmark className="size-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Plazo Fijo</span>
        </button>

        <button
          onClick={() => setActiveTab('graficos')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'graficos' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="size-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Gráficos</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogo')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'catalogo' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="size-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Variables</span>
        </button>

        <button
          onClick={() => setActiveTab('herramientas')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'herramientas' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="size-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Asesor IA</span>
        </button>
      </nav>
    </div>
  );
}
