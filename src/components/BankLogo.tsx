import React from 'react';

interface BankLogoProps {
  bankId: string;
  bankName?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-5 h-5 rounded-md',
  sm: 'w-7 h-7 rounded-lg',
  md: 'w-8 h-8 rounded-xl'
};

/**
 * Logotipos vectoriales institucionales (SVG propios, sin dependencias externas frágiles)
 * para las entidades financieras de Argentina y Brasil y organismos oficiales.
 */
export function BankLogo({ bankId, bankName = '', size = 'sm', className = '' }: BankLogoProps) {
  const id = bankId.toLowerCase();
  const sizeCls = SIZE_MAP[size];

  const renderMark = () => {
    switch (id) {
      // ==================== ARGENTINA - BANCOS ====================
      case 'banco_nacion':
      case 'bna':
        return (
          <div className={`${sizeCls} bg-[#005596] border border-[#004478] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco de la Nación Argentina'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path d="M4 9.5L12 4.5L20 9.5H4Z" fill="#7DD3FC" />
              <rect x="6" y="11" width="2.3" height="6.5" rx="0.5" fill="#FFFFFF" />
              <rect x="10.85" y="11" width="2.3" height="6.5" rx="0.5" fill="#FFFFFF" />
              <rect x="15.7" y="11" width="2.3" height="6.5" rx="0.5" fill="#FFFFFF" />
              <rect x="4" y="18.5" width="16" height="2" rx="0.5" fill="#FACC15" />
            </svg>
          </div>
        );

      case 'banco_galicia':
        return (
          <div className={`${sizeCls} bg-[#FA6400] border border-[#D95300] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Galicia'}>
            <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none">
              <path d="M16.8 8.2A6 6 0 1 0 18 12.5H12.5" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="16.5" cy="15.5" r="1.4" fill="#FDE047" />
            </svg>
          </div>
        );

      case 'banco_santander':
      case 'santander_brasil':
        return (
          <div className={`${sizeCls} bg-[#EC0000] border border-[#C40000] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Santander'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path
                d="M12.2 4.5C12.2 6.8 14.5 7.9 14.5 10.2C14.5 11.4 13.8 12.4 12.9 13C14.2 12.5 15.6 11.4 15.6 9.8C17.2 10.7 18.2 12.3 18.2 14.1C18.2 16.9 15.5 19 12 19C8.5 19 5.8 16.9 5.8 14.1C5.8 12.1 7 10.4 8.8 9.6C8.6 11 9.5 12.1 10.7 12.7C9.8 11.9 9.5 10.8 9.8 9.5C10.2 7.8 11.7 6.5 12.2 4.5Z"
                fill="#FFFFFF"
              />
            </svg>
          </div>
        );

      case 'banco_bbva':
        return (
          <div className={`${sizeCls} bg-[#004481] border border-[#003363] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'BBVA Argentina'}>
            <svg viewBox="0 0 24 24" className="w-[76%] h-[76%]" fill="none">
              <path d="M5 14.5L9.5 6.5H12.5L8 14.5H5Z" fill="#2DCCCD" />
              <path d="M10.5 17.5L15 9.5H18L13.5 17.5H10.5Z" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'banco_provincia':
        return (
          <div className={`${sizeCls} bg-[#007A33] border border-[#005E27] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Provincia'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <circle cx="12" cy="12" r="7.5" stroke="#86EFAC" strokeWidth="1.8" />
              <path d="M9 16V8H12.8C14.3 8 15.3 8.9 15.3 10.3C15.3 11.7 14.3 12.6 12.8 12.6H9" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );

      case 'banco_macro':
        return (
          <div className={`${sizeCls} bg-[#003B71] border border-[#00284D] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Macro'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path d="M5 17V7L12 13L19 7V17" stroke="#FFFFFF" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="6.5" r="1.5" fill="#38BDF8" />
            </svg>
          </div>
        );

      case 'banco_icbc':
        return (
          <div className={`${sizeCls} bg-[#C8102E] border border-[#9E0B23] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'ICBC Argentina'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <circle cx="12" cy="12" r="7.5" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M9 9H15M12 9V15M9 15H15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'banco_ciudad':
        return (
          <div className={`${sizeCls} bg-[#00549E] border border-[#003F77] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Ciudad'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path d="M12 4L14.2 19H9.8L12 4Z" fill="#FFFFFF" />
              <path d="M5.5 19H18.5" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'banco_patagonia':
        return (
          <div className={`${sizeCls} bg-[#004B49] border border-[#003634] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Patagonia'}>
            <svg viewBox="0 0 24 24" className="w-[74%] h-[74%]" fill="none">
              <path d="M4.5 16.5L10 8.5L13.5 13L16 10L19.5 16.5H4.5Z" fill="#FFFFFF" />
              <path d="M4.5 18.5H19.5" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'banco_credicoop':
        return (
          <div className={`${sizeCls} bg-[#B5121B] border border-[#8E0C13] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Credicoop'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <circle cx="10" cy="12" r="4.5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="14.5" cy="12" r="4.5" stroke="#FDE047" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'banco_hipotecario':
        return (
          <div className={`${sizeCls} bg-[#FF6B00] border border-[#D95900] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Hipotecario'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path d="M4.5 11.5L12 5.5L19.5 11.5" stroke="#FFFFFF" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 11V18H17V11" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="10.5" y="13.5" width="3" height="4.5" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'banco_cmf':
        return (
          <div className={`${sizeCls} bg-[#1E3A5F] border border-[#142944] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco CMF'}>
            <span className="text-[9px] font-black tracking-tighter text-white leading-none">CMF</span>
          </div>
        );

      case 'banco_bica':
        return (
          <div className={`${sizeCls} bg-[#0066B3] border border-[#004D87] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco BICA'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <rect x="5.5" y="6" width="5.5" height="12" rx="1.5" fill="#FFFFFF" />
              <circle cx="15.5" cy="9.5" r="2.8" fill="#38BDF8" />
              <circle cx="15.5" cy="15" r="2.8" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'banco_voii':
        return (
          <div className={`${sizeCls} bg-[#18181B] border border-[#27272A] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco VOII'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path d="M5.5 7L10.5 17L15.5 7" stroke="#A78BFA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="15.5" r="1.7" fill="#38BDF8" />
            </svg>
          </div>
        );

      case 'banco_meridian':
        return (
          <div className={`${sizeCls} bg-[#1D4ED8] border border-[#1E40AF] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Meridian'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <circle cx="12" cy="12" r="7" stroke="#FFFFFF" strokeWidth="1.9" />
              <ellipse cx="12" cy="12" rx="3.2" ry="7" stroke="#93C5FD" strokeWidth="1.6" />
              <path d="M5 12H19" stroke="#93C5FD" strokeWidth="1.5" />
            </svg>
          </div>
        );

      case 'banco_del_sol':
        return (
          <div className={`${sizeCls} bg-[#0F172A] border border-[#1E293B] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco del Sol'}>
            <svg viewBox="0 0 24 24" className="w-[74%] h-[74%]" fill="none">
              <circle cx="12" cy="12" r="4.2" fill="#FBBF24" />
              <path d="M12 4V6.2M12 17.8V20M4 12H6.2M17.8 12H20M6.4 6.4L8 8M16 16L17.6 17.6M17.6 6.4L16 8M8 16L6.4 17.6" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        );

      // ==================== BRASIL - BANCOS ====================
      case 'itau_unibanco':
        return (
          <div className={`${sizeCls} bg-[#EC7000] border border-[#CC6000] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Itaú Unibanco'}>
            <div className="w-[70%] h-[70%] rounded-[3px] bg-[#003399] flex items-center justify-center">
              <span className="text-[8px] font-black text-[#FFEF00] leading-none">it</span>
            </div>
          </div>
        );

      case 'banco_do_brasil':
        return (
          <div className={`${sizeCls} bg-[#FFEF00] border border-[#E5D200] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco do Brasil'}>
            <svg viewBox="0 0 24 24" className="w-[74%] h-[74%]" fill="none">
              <path d="M6 12L12 6L18 12L12 18L6 12Z" stroke="#003882" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M9.5 12L12 9.5L14.5 12L12 14.5L9.5 12Z" fill="#003882" />
            </svg>
          </div>
        );

      case 'caixa_economica':
        return (
          <div className={`${sizeCls} bg-[#005CA9] border border-[#004682] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Caixa Econômica Federal'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path d="M6 6L12 12L6 18" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 6L12 12L18 18" stroke="#F39200" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );

      case 'bradesco':
        return (
          <div className={`${sizeCls} bg-[#CC092F] border border-[#A30725] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Bradesco'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path d="M6 16C7.5 11.5 10.5 9.5 14.5 9.5C16.5 9.5 18 10.5 18.5 12" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M10.5 16C11.5 13.5 13 12.5 15.5 12.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="12" cy="17.5" r="1.4" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'nubank':
        return (
          <div className={`${sizeCls} bg-[#820AD1] border border-[#6A07AD] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Nubank'}>
            <span className="text-[10px] font-black tracking-tighter text-white leading-none">Nu</span>
          </div>
        );

      case 'banco_inter':
        return (
          <div className={`${sizeCls} bg-[#FF7A00] border border-[#D96800] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Inter'}>
            <span className="text-[9px] font-extrabold tracking-tight text-white leading-none">inter</span>
          </div>
        );

      case 'c6_bank':
        return (
          <div className={`${sizeCls} bg-[#111827] border border-[#374151] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'C6 Bank'}>
            <span className="text-[9.5px] font-black tracking-tight text-slate-100 leading-none">C6</span>
          </div>
        );

      case 'btg_pactual':
        return (
          <div className={`${sizeCls} bg-[#001E50] border border-[#001438] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'BTG Pactual'}>
            <span className="text-[8.5px] font-black tracking-tight text-white leading-none">BTG</span>
          </div>
        );

      case 'banco_safra':
        return (
          <div className={`${sizeCls} bg-[#0A2240] border border-[#07182E] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Safra'}>
            <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none">
              <path d="M12 5L18 12L12 19L6 12L12 5Z" stroke="#EAB308" strokeWidth="2.1" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2" fill="#EAB308" />
            </svg>
          </div>
        );

      case 'banco_bmg':
        return (
          <div className={`${sizeCls} bg-[#FF6600] border border-[#D95700] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco BMG'}>
            <span className="text-[8.5px] font-black tracking-tight text-white leading-none">BMG</span>
          </div>
        );

      case 'banco_daycoval':
        return (
          <div className={`${sizeCls} bg-[#0F3D3E] border border-[#0A292A] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Daycoval'}>
            <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none">
              <path d="M8 6H12.5C15.8 6 18 8.3 18 12C18 15.7 15.8 18 12.5 18H8V6Z" stroke="#FBBF24" strokeWidth="2.2" strokeLinejoin="round" />
            </svg>
          </div>
        );

      // ==================== ORGANISMOS Y BOLSAS ====================
      case 'bcra':
        return (
          <div className={`${sizeCls} bg-[#0F274A] border border-[#1E3A8A] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'BCRA'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <circle cx="12" cy="12" r="7" stroke="#93C5FD" strokeWidth="1.7" />
              <path d="M7.5 15.5H16.5M9 15.5V10M12 15.5V9M15 15.5V10" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'indec':
        return (
          <div className={`${sizeCls} bg-[#0284C7] border border-[#0369A1] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'INDEC'}>
            <svg viewBox="0 0 24 24" className="w-[70%] h-[70%]" fill="none">
              <rect x="5" y="13" width="3" height="6" rx="0.5" fill="#FFFFFF" />
              <rect x="10.5" y="9" width="3" height="10" rx="0.5" fill="#BAE6FD" />
              <rect x="16" y="5" width="3" height="14" rx="0.5" fill="#FFFFFF" />
            </svg>
          </div>
        );

      case 'byma':
        return (
          <div className={`${sizeCls} bg-[#111827] border border-[#334155] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'BYMA'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <path d="M4.5 16L9.5 11L13.5 14L19.5 7.5" stroke="#38BDF8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 7.5H19.5V11" stroke="#38BDF8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );

      case 'arca':
        return (
          <div className={`${sizeCls} bg-[#1E40AF] border border-[#1E3A8A] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'ARCA'}>
            <span className="text-[7.5px] font-black tracking-tight text-white leading-none">ARCA</span>
          </div>
        );

      case 'bcb':
        return (
          <div className={`${sizeCls} bg-[#004A8F] border border-[#003669] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Banco Central do Brasil'}>
            <svg viewBox="0 0 24 24" className="w-[72%] h-[72%]" fill="none">
              <circle cx="12" cy="12" r="7" stroke="#FACC15" strokeWidth="1.8" />
              <path d="M8.5 14.5H15.5M10 14.5V9.5M14 14.5V9.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        );

      case 'b3':
        return (
          <div className={`${sizeCls} bg-[#002B5C] border border-[#001D3D] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'B3 S.A.'}>
            <span className="text-[9.5px] font-black text-[#38BDF8] leading-none">B3</span>
          </div>
        );

      case 'ibge':
        return (
          <div className={`${sizeCls} bg-[#0F766E] border border-[#115E59] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'IBGE'}>
            <span className="text-[7.5px] font-black text-white leading-none">IBGE</span>
          </div>
        );

      case 'tesouro':
        return (
          <div className={`${sizeCls} bg-[#005B4F] border border-[#00443B] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'Tesouro Nacional'}>
            <span className="text-[8px] font-black text-[#FACC15] leading-none">TN</span>
          </div>
        );

      case 'fgv':
        return (
          <div className={`${sizeCls} bg-[#1D4ED8] border border-[#1E40AF] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'FGV IBRE'}>
            <span className="text-[8px] font-black text-white leading-none">FGV</span>
          </div>
        );

      case 'anbima':
        return (
          <div className={`${sizeCls} bg-[#0F172A] border border-[#334155] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'ANBIMA'}>
            <span className="text-[7px] font-black text-sky-300 leading-none">ANB</span>
          </div>
        );

      case 'ciara':
        return (
          <div className={`${sizeCls} bg-[#15803D] border border-[#166534] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'CIARA-CEC'}>
            <span className="text-[7.5px] font-black text-[#FEF08A] leading-none">CC</span>
          </div>
        );

      case 'adefa':
        return (
          <div className={`${sizeCls} bg-[#0369A1] border border-[#075985] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'ADEFA'}>
            <span className="text-[7px] font-black text-white leading-none">ADF</span>
          </div>
        );

      case 'came':
        return (
          <div className={`${sizeCls} bg-[#0284C7] border border-[#0369A1] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'CAME'}>
            <span className="text-[6.5px] font-black text-white leading-none">CAME</span>
          </div>
        );

      case 'cac':
        return (
          <div className={`${sizeCls} bg-[#B45309] border border-[#92400E] flex items-center justify-center shrink-0 shadow-2xs ${className}`} title={bankName || 'CAC'}>
            <span className="text-[8px] font-black text-white leading-none">CAC</span>
          </div>
        );

      default: {
        const initials = (bankName || bankId)
          .replace(/banco|s\.a\.|s\.a\.u\.|c\.l\.|argentina|brasil/gi, '')
          .replace(/[^a-zA-Z0-9\s]/g, ' ')
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map(w => w[0]?.toUpperCase() || '')
          .join('') || 'EF';

        return (
          <div
            className={`${sizeCls} bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-2xs ${className}`}
            title={bankName || bankId}
          >
            <span className="text-[9px] font-bold tracking-tight text-white leading-none">
              {initials}
            </span>
          </div>
        );
      }
    }
  };

  return renderMark();
}
