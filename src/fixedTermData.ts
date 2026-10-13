import { BankFixedTermRate } from './types';

// Tasas oficiales extraídas de la Tabla Comparativa del BCRA (Régimen de Transparencia de Plazos Fijos para Personas Humanas)
export const INITIAL_BANK_RATES: Omit<BankFixedTermRate, 'tem' | 'tea'>[] = [
  {
    id: 'banco_voii',
    bankName: 'Banco VOII S.A.',
    shortName: 'VOII',
    tna: 23.50,
    channel: 'Web / No Clientes y Clientes',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_cmf',
    bankName: 'Banco CMF S.A.',
    shortName: 'CMF',
    tna: 23.50,
    channel: 'Web / No Clientes y Clientes',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_bica',
    bankName: 'Banco BICA S.A.',
    shortName: 'BICA',
    tna: 23.00,
    channel: 'Web / No Clientes y Clientes',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_meridian',
    bankName: 'Banco Meridian S.A.',
    shortName: 'Meridian',
    tna: 23.00,
    channel: 'Web / No Clientes y Clientes',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_del_sol',
    bankName: 'Banco del Sol S.A.',
    shortName: 'Del Sol',
    tna: 23.00,
    channel: 'App Móvil / Web',
    type: 'digital',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_provincia',
    bankName: 'Banco de la Provincia de Buenos Aires',
    shortName: 'BAPRO',
    tna: 21.00,
    channel: 'BIP / Cuenta DNI (22% No Clientes)',
    type: 'publico',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_hipotecario',
    bankName: 'Banco Hipotecario S.A.',
    shortName: 'Hipotecario',
    tna: 19.50,
    channel: 'Home Banking / App móvil',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_macro',
    bankName: 'Banco Macro S.A.',
    shortName: 'Macro',
    tna: 19.50,
    channel: 'App Macro / Banca Internet',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_nacion',
    bankName: 'Banco de la Nación Argentina',
    shortName: 'BNA',
    tna: 19.25,
    channel: 'BNA+ / Home Banking BNA',
    type: 'publico',
    nonClientOnline: true,
    minAmount: 500,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_bbva',
    bankName: 'BBVA Argentina S.A.',
    shortName: 'BBVA',
    tna: 19.00,
    channel: 'BBVA Móvil / Banca Online',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_credicoop',
    bankName: 'Banco Credicoop C.L.',
    shortName: 'Credicoop',
    tna: 18.50,
    channel: 'Banca Personal Internet (18,5% Clientes y No Clientes)',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_galicia',
    bankName: 'Banco Galicia y Buenos Aires S.A.U.',
    shortName: 'Galicia',
    tna: 18.25,
    channel: 'App Galicia / Online Banking',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_icbc',
    bankName: 'ICBC Argentina',
    shortName: 'ICBC',
    tna: 18.10,
    channel: 'Access Banking / App ICBC',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_ciudad',
    bankName: 'Banco de la Ciudad de Buenos Aires',
    shortName: 'Ciudad',
    tna: 17.00,
    channel: 'Autoservicio / Home Banking',
    type: 'publico',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_santander',
    bankName: 'Banco Santander Argentina S.A.',
    shortName: 'Santander',
    tna: 16.50,
    channel: 'Online Banking / App Santander',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_patagonia',
    bankName: 'Banco Patagonia S.A.',
    shortName: 'Patagonia',
    tna: 16.00,
    channel: 'Patagonia e-Bank',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  }
];

export function computeBankRates(todayStr?: string): BankFixedTermRate[] {
  const date = todayStr || '2026-10-13';
  return INITIAL_BANK_RATES.map(b => {
    // Rendimiento mensual a 30 días: TEM = (TNA * 30) / 365
    const tem = parseFloat(((b.tna * 30) / 365).toFixed(2));
    // Tasa Efectiva Anual con reinversión mensual: TEA = ((1 + (TNA/100)/12)^12 - 1) * 100
    const tea = parseFloat((((Math.pow(1 + (b.tna / 100) / 12, 12)) - 1) * 100).toFixed(2));
    return {
      ...b,
      tem,
      tea,
      lastUpdated: date
    };
  }).sort((a, b) => b.tna - a.tna);
}
