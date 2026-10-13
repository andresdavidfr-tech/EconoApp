import { BankFixedTermRate } from './types';

export const INITIAL_BANK_RATES: Omit<BankFixedTermRate, 'tem' | 'tea'>[] = [
  {
    id: 'banco_voii',
    bankName: 'Banco VOII S.A.',
    shortName: 'VOII',
    tna: 38.00,
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
    tna: 37.50,
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
    tna: 37.50,
    channel: 'Web / No Clientes y Clientes',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_uala_uilo',
    bankName: 'Uilo (Ualá)',
    shortName: 'Ualá / Uilo',
    tna: 37.00,
    channel: 'App Ualá / Home Banking',
    type: 'digital',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_hipotecario',
    bankName: 'Banco Hipotecario S.A.',
    shortName: 'Hipotecario',
    tna: 35.50,
    channel: 'Home Banking / App móvil',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_nacion',
    bankName: 'Banco de la Nación Argentina',
    shortName: 'BNA',
    tna: 35.00,
    channel: 'BNA+ / Home Banking BNA',
    type: 'publico',
    nonClientOnline: true,
    minAmount: 500,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_provincia',
    bankName: 'Banco de la Provincia de Buenos Aires',
    shortName: 'BAPRO',
    tna: 34.00,
    channel: 'BIP / Cuenta DNI',
    type: 'publico',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_macro',
    bankName: 'Banco Macro S.A.',
    shortName: 'Macro',
    tna: 34.00,
    channel: 'App Macro / Banca Internet',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_credicoop',
    bankName: 'Banco Credicoop C.L.',
    shortName: 'Credicoop',
    tna: 34.00,
    channel: 'Banca Personal Internet',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_galicia',
    bankName: 'Banco Galicia y Buenos Aires S.A.U.',
    shortName: 'Galicia',
    tna: 33.50,
    channel: 'App Galicia / Online Banking',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_icbc',
    bankName: 'Industrial and Commercial Bank of China (ICBC)',
    shortName: 'ICBC',
    tna: 33.50,
    channel: 'Access Banking / App',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_bbva',
    bankName: 'BBVA Argentina S.A.',
    shortName: 'BBVA',
    tna: 33.00,
    channel: 'BBVA Móvil / Banca Online',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_santander',
    bankName: 'Banco Santander Argentina S.A.',
    shortName: 'Santander',
    tna: 32.00,
    channel: 'Online Banking / App Santander',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_ciudad',
    bankName: 'Banco de la Ciudad de Buenos Aires',
    shortName: 'Ciudad',
    tna: 31.00,
    channel: 'Autoservicio / Home Banking',
    type: 'publico',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  }
];

export function computeBankRates(todayStr?: string): BankFixedTermRate[] {
  const date = todayStr || new Date().toISOString().split('T')[0];
  return INITIAL_BANK_RATES.map(b => {
    // 30 days monthly effective return TEM = TNA * 30 / 365
    const tem = parseFloat(((b.tna * 30) / 365).toFixed(2));
    // Effective Annual Rate TEA = ((1 + (TNA/100)/12)^12 - 1) * 100
    const tea = parseFloat((((Math.pow(1 + (b.tna / 100) / 12, 12)) - 1) * 100).toFixed(2));
    return {
      ...b,
      tem,
      tea,
      lastUpdated: date
    };
  }).sort((a, b) => b.tna - a.tna); // Ordered from highest rate to lowest rate
}
