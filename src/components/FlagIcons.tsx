import React from 'react';

export function ArgentinaFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-slate-300/40 ${className}`}
      aria-label="Bandera de Argentina"
    >
      {/* Top light blue stripe */}
      <rect width="30" height="6.66" y="0" fill="#74acdf" />
      {/* Middle white stripe */}
      <rect width="30" height="6.68" y="6.66" fill="#ffffff" />
      {/* Bottom light blue stripe */}
      <rect width="30" height="6.66" y="13.34" fill="#74acdf" />
      {/* Sol de Mayo */}
      <circle cx="15" cy="10" r="1.8" fill="#f59e0b" stroke="#d97706" strokeWidth="0.3" />
      {/* Sun rays */}
      <g stroke="#f59e0b" strokeWidth="0.4" strokeLinecap="round">
        <line x1="15" y1="7.4" x2="15" y2="6.6" />
        <line x1="15" y1="12.6" x2="15" y2="13.4" />
        <line x1="12.4" y1="10" x2="11.6" y2="10" />
        <line x1="17.6" y1="10" x2="18.4" y2="10" />
        <line x1="13.2" y1="8.2" x2="12.6" y2="7.6" />
        <line x1="16.8" y1="11.8" x2="17.4" y2="12.4" />
        <line x1="13.2" y1="11.8" x2="12.6" y2="12.4" />
        <line x1="16.8" y1="8.2" x2="17.4" y2="7.6" />
      </g>
    </svg>
  );
}

export function BrazilFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={`inline-block shrink-0 rounded-xs overflow-hidden shadow-2xs border border-emerald-700/30 ${className}`}
      aria-label="Bandeira do Brasil"
    >
      {/* Green background */}
      <rect width="30" height="20" fill="#009c3b" />
      {/* Yellow rhombus */}
      <polygon points="15,2.4 27.6,10 15,17.6 2.4,10" fill="#ffdf00" />
      {/* Dark blue celestial sphere */}
      <circle cx="15" cy="10" r="4.3" fill="#002776" />
      {/* White curved band (Ordem e Progresso) */}
      <path
        d="M 11.2,11.5 C 13,9.5 17,9.5 18.8,11.5"
        stroke="#ffffff"
        strokeWidth="0.75"
        fill="none"
        strokeLinecap="round"
      />
      {/* Southern cross stars representation */}
      <circle cx="15" cy="8.2" r="0.3" fill="#ffffff" />
      <circle cx="13.8" cy="12.2" r="0.25" fill="#ffffff" />
      <circle cx="16.2" cy="12.2" r="0.25" fill="#ffffff" />
      <circle cx="15" cy="12.8" r="0.25" fill="#ffffff" />
    </svg>
  );
}
