export interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export type VariableCategory = 'FINANCIAL_RATES' | 'MONETARY_EXCHANGE' | 'MACRO_INFLATION_FISCAL' | 'SECTORS_SALARIES_SOCIAL';

export type TopicId =
  | 'cambiario_divisas'
  | 'precios_inflacion'
  | 'tasas_ahorro'
  | 'actividad_industria'
  | 'credito_salarios';

export interface TopicSource {
  id: string;
  name: string;
  fullName: string;
  type: 'publica' | 'camara';
  scope?: string;
  role?: string;
  url: string;
}

export type CountryCode = 'AR' | 'BR';

export interface EconomicTopic {
  id: TopicId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string; // 'blue' | 'emerald' | 'amber' | 'violet' | 'rose'
  imageUrl: string;
  imageAlt?: string;
  visualSummary?: string;
  country?: CountryCode;
  sources: TopicSource[];
  variableIds: string[];
}

export interface EconomicVariable {
  id: string; // e.g. "rem_inflacion_esperada", "bna_dolar_billete"
  name: string;
  category: VariableCategory;
  topicId: TopicId;
  sourceType: 'publica' | 'camara';
  country?: CountryCode;
  value: number;
  unit: string; // e.g. "%", "ARS", "BRL", "USD (M)", "Índice"
  frequency: 'Diaria' | 'Mensual' | 'Trimestral';
  source: string; // e.g. "BCRA", "INDEC", "BCB", "IBGE", "B3", "FGV"
  sourceUrl: string;
  description: string;
  lastUpdated: string; // YYYY-MM-DD (fecha real del dato)
  history: HistoricalDataPoint[];
  live?: boolean;       // true si el valor viene de una fuente consultada en vivo
  fetchedAt?: string;   // ISO: cuándo se consultó la fuente por última vez
}

export interface SecurityNotice {
  legalBasis: string; // Ley 25.326 / Ley 26.529
  explanation: string;
}

export interface AlertRule {
  id: string;
  variableId: string;
  condition: 'above' | 'below';
  threshold: number;
  isActive: boolean;
}

export interface AlertLog {
  id: string;
  variableId: string;
  variableName: string;
  condition: 'above' | 'below';
  threshold: number;
  triggeredValue: number;
  timestamp: string; // ISO String
}

export interface CustomMonitor {
  id: string;
  name: string;
  description: string;
  variableIds: string[];
  createdAt: string;
  themeColor: string; // Tailwind color class, e.g. "indigo", "emerald", "amber"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface BankFixedTermRate {
  id: string;
  bankName: string;
  shortName: string;
  tna: number; // Tasa Nominal Anual (e.g. 35.0%)
  tem: number; // Tasa Efectiva Mensual a 30 días
  tea: number; // Tasa Efectiva Anual
  channel: string; // Canal electrónico (Web / App)
  type: 'publico' | 'privado' | 'digital';
  nonClientOnline: boolean; // Si permite a no clientes
  minAmount: number;
  lastUpdated: string;
}
