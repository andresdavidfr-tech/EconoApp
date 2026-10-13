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

// Taxas oficiais de CDB (Certificado de Depósito Bancário) e Renda Fixa dos principais bancos do Brasil
// Baseado no CDI de 10,65% ao ano (Banco Central do Brasil e B3)
export const INITIAL_BRAZIL_BANK_RATES: Omit<BankFixedTermRate, 'tem' | 'tea'>[] = [
  {
    id: 'banco_daycoval',
    bankName: 'Banco Daycoval S.A.',
    shortName: 'Daycoval',
    tna: 11.18, // 105% do CDI
    channel: 'Daycoval Digital / App',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_bmg',
    bankName: 'Banco BMG S.A.',
    shortName: 'BMG',
    tna: 11.29, // 106% do CDI
    channel: 'App BMG / Internet Banking',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 50,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'btg_pactual',
    bankName: 'Banco BTG Pactual S.A.',
    shortName: 'BTG Pactual',
    tna: 11.02, // 103.5% do CDI
    channel: 'BTG Pactual Banking / App',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 1000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_safra',
    bankName: 'Banco Safra S.A.',
    shortName: 'Safra',
    tna: 10.97, // 103% do CDI
    channel: 'Safra Internet / App',
    type: 'privado',
    nonClientOnline: true,
    minAmount: 5000,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_inter',
    bankName: 'Banco Inter S.A.',
    shortName: 'Inter',
    tna: 10.86, // 102% do CDI
    channel: 'Super App Inter',
    type: 'digital',
    nonClientOnline: true,
    minAmount: 100,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'c6_bank',
    bankName: 'Banco C6 S.A.',
    shortName: 'C6 Bank',
    tna: 10.92, // 102.5% do CDI
    channel: 'App C6 Bank',
    type: 'digital',
    nonClientOnline: true,
    minAmount: 20,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'nubank',
    bankName: 'Nu Financeira S.A. (Nubank)',
    shortName: 'Nubank',
    tna: 10.65, // 100% do CDI
    channel: 'App Nubank (Caixinhas RDB)',
    type: 'digital',
    nonClientOnline: true,
    minAmount: 1,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'itau_unibanco',
    bankName: 'Itaú Unibanco S.A.',
    shortName: 'Itaú',
    tna: 10.65, // 100% do CDI
    channel: 'App Itaú / Itaú Personnalité',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 100,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'santander_brasil',
    bankName: 'Banco Santander (Brasil) S.A.',
    shortName: 'Santander BR',
    tna: 10.65, // 100% do CDI
    channel: 'Santander Way / App',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 100,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'bradesco',
    bankName: 'Banco Bradesco S.A.',
    shortName: 'Bradesco',
    tna: 10.60, // 99.5% do CDI
    channel: 'Bradesco Net Empresa / App',
    type: 'privado',
    nonClientOnline: false,
    minAmount: 100,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'banco_do_brasil',
    bankName: 'Banco do Brasil S.A.',
    shortName: 'Banco do Brasil',
    tna: 10.54, // 99% do CDI
    channel: 'App BB / Autoatendimento',
    type: 'publico',
    nonClientOnline: false,
    minAmount: 500,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'caixa_economica',
    bankName: 'Caixa Econômica Federal',
    shortName: 'Caixa',
    tna: 10.49, // 98.5% do CDI
    channel: 'App Caixa / Agências',
    type: 'publico',
    nonClientOnline: false,
    minAmount: 200,
    lastUpdated: '2026-10-13'
  }
];

export function computeBrazilBankRates(todayStr?: string): BankFixedTermRate[] {
  const date = todayStr || '2026-10-13';
  return INITIAL_BRAZIL_BANK_RATES.map(b => {
    // Rendimento mensal: TEM = (TNA * 30) / 365
    const tem = parseFloat(((b.tna * 30) / 365).toFixed(2));
    // Taxa Efetiva Anual
    const tea = parseFloat((((Math.pow(1 + (b.tna / 100) / 12, 12)) - 1) * 100).toFixed(2));
    return {
      ...b,
      tem,
      tea,
      lastUpdated: date
    };
  }).sort((a, b) => b.tna - a.tna);
}
