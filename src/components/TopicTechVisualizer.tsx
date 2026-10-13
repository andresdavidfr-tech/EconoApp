import React from 'react';
import { TopicId } from '../types';

interface TopicTechVisualizerProps {
  topicId: TopicId;
  accentColor: string;
  className?: string;
  interactive?: boolean;
}

/**
 * Visualizador tecnológico vectorial con variantes del azul (sobrio, tecnológico y contemporáneo).
 * Malla isométrica telemétrica y curvas con gamas diferenciadas de azul: zafiro, índigo, glaciar, acero y ultramar.
 */
export function TopicTechVisualizer({
  topicId,
  className = '',
}: TopicTechVisualizerProps) {
  // Paleta de tonos sobrios en variantes de azul diferenciados por sector
  const getThemePalette = () => {
    switch (topicId) {
      case 'cambiario_divisas':
        return {
          stroke: '#38bdf8', // Azul celeste / zafiro luminoso
          fill: '#0284c7',
          glow: 'rgba(56, 189, 248, 0.40)',
          grid: 'rgba(56, 189, 248, 0.16)',
          bg: 'bg-gradient-to-br from-[#0c234a] via-[#071733] to-[#020b1c]',
          label: 'CORREDOR FX'
        };
      case 'precios_inflacion':
        return {
          stroke: '#818cf8', // Azul índigo marino
          fill: '#4f46e5',
          glow: 'rgba(129, 140, 248, 0.40)',
          grid: 'rgba(129, 140, 248, 0.16)',
          bg: 'bg-gradient-to-br from-[#0e1c42] via-[#08122c] to-[#030817]',
          label: 'PRECIOS'
        };
      case 'tasas_ahorro':
        return {
          stroke: '#67e8f9', // Azul glaciar / cian financiero
          fill: '#0891b2',
          glow: 'rgba(103, 232, 249, 0.40)',
          grid: 'rgba(103, 232, 249, 0.16)',
          bg: 'bg-gradient-to-br from-[#0a2744] via-[#05182e] to-[#020b17]',
          label: 'RENDIMIENTO'
        };
      case 'actividad_industria':
        return {
          stroke: '#93c5fd', // Azul cobalto acero
          fill: '#2563eb',
          glow: 'rgba(147, 197, 253, 0.40)',
          grid: 'rgba(147, 197, 253, 0.16)',
          bg: 'bg-gradient-to-br from-[#091f3d] via-[#051329] to-[#020914]',
          label: 'ACTIVIDAD'
        };
      case 'credito_salarios':
      default:
        return {
          stroke: '#60a5fa', // Azul real ultramar
          fill: '#1d4ed8',
          glow: 'rgba(96, 165, 250, 0.40)',
          grid: 'rgba(96, 165, 250, 0.16)',
          bg: 'bg-gradient-to-br from-[#0d2149] via-[#081533] to-[#030a1c]',
          label: 'CRÉDITO'
        };
    }
  };

  const palette = getThemePalette();

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${palette.bg} ${className}`}>
      {/* 1. Malla isométrica en tonos cálidos */}
      <svg className="absolute inset-0 w-full h-full opacity-45" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`tech-grid-${topicId}`} width="26" height="26" patternUnits="userSpaceOnUse">
            <path
              d="M 26 0 L 0 0 0 26"
              fill="none"
              stroke={palette.grid}
              strokeWidth="0.8"
            />
            <circle cx="26" cy="0" r="1.1" fill={palette.stroke} opacity="0.65" />
          </pattern>
          <linearGradient id={`curve-fill-${topicId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.stroke} stopOpacity="0.32" />
            <stop offset="100%" stopColor={palette.stroke} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill={`url(#tech-grid-${topicId})`} />

        {/* 2. Formas vectoriales telemétricas cálidas */}
        {topicId === 'cambiario_divisas' && (
          <g>
            <path
              d="M 0 160 Q 90 90 180 130 T 360 80 T 540 110 T 720 50 L 720 240 L 0 240 Z"
              fill={`url(#curve-fill-${topicId})`}
            />
            <path
              d="M 0 160 Q 90 90 180 130 T 360 80 T 540 110 T 720 50"
              fill="none"
              stroke={palette.stroke}
              strokeWidth="2.5"
            />
            <path
              d="M 0 190 Q 110 140 220 160 T 440 120 T 660 140 T 720 100"
              fill="none"
              stroke={palette.stroke}
              strokeWidth="1.2"
              strokeOpacity="0.5"
              strokeDasharray="4 3"
            />
            <circle cx="180" cy="130" r="4" fill={palette.stroke} />
            <circle cx="360" cy="80" r="5" fill={palette.stroke} />
            <circle cx="540" cy="110" r="4" fill={palette.stroke} />
            <circle cx="720" cy="50" r="5" fill={palette.stroke} />
          </g>
        )}

        {topicId === 'precios_inflacion' && (
          <g>
            <path
              d="M 0 180 C 80 190, 140 80, 240 100 C 340 120, 420 60, 520 75 C 620 90, 680 40, 720 45 L 720 240 L 0 240 Z"
              fill={`url(#curve-fill-${topicId})`}
            />
            <path
              d="M 0 180 C 80 190, 140 80, 240 100 C 340 120, 420 60, 520 75 C 620 90, 680 40, 720 45"
              fill="none"
              stroke={palette.stroke}
              strokeWidth="2.5"
            />
            <path
              d="M 0 140 C 90 150, 160 50, 260 70 C 360 90, 440 30, 540 45 C 640 60, 700 20, 720 25"
              fill="none"
              stroke={palette.stroke}
              strokeWidth="1.2"
              strokeOpacity="0.45"
              strokeDasharray="3 3"
            />
            {[60, 140, 220, 300, 380, 460, 540, 620].map((x, i) => (
              <line
                key={i}
                x1={x}
                y1={200 - (i % 3) * 20}
                x2={x}
                y2={220}
                stroke={palette.stroke}
                strokeWidth="1.2"
                strokeOpacity="0.35"
              />
            ))}
          </g>
        )}

        {topicId === 'tasas_ahorro' && (
          <g>
            <path
              d="M 0 190 L 120 180 L 120 150 L 260 140 L 260 115 L 420 105 L 420 75 L 580 70 L 580 50 L 720 45 L 720 240 L 0 240 Z"
              fill={`url(#curve-fill-${topicId})`}
            />
            <path
              d="M 0 190 L 120 180 L 120 150 L 260 140 L 260 115 L 420 105 L 420 75 L 580 70 L 580 50 L 720 45"
              fill="none"
              stroke={palette.stroke}
              strokeWidth="2.5"
            />
            <circle cx="260" cy="115" r="4.5" fill={palette.stroke} />
            <circle cx="420" cy="75" r="4.5" fill={palette.stroke} />
            <circle cx="580" cy="50" r="4.5" fill={palette.stroke} />
          </g>
        )}

        {topicId === 'actividad_industria' && (
          <g>
            {[40, 95, 150, 205, 260, 315, 370, 425, 480, 535, 590, 645].map((x, idx) => {
              const heights = [50, 70, 60, 88, 105, 96, 122, 110, 138, 150, 132, 165];
              const h = heights[idx % heights.length];
              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={220 - h}
                    width="16"
                    height={h}
                    fill={palette.stroke}
                    fillOpacity="0.18"
                    stroke={palette.stroke}
                    strokeWidth="1"
                    strokeOpacity="0.45"
                    rx="2"
                  />
                  <line
                    x1={x}
                    y1={220 - h}
                    x2={x + 16}
                    y2={220 - h}
                    stroke={palette.stroke}
                    strokeWidth="2.5"
                    strokeOpacity="0.9"
                  />
                </g>
              );
            })}
            <path
              d="M 0 170 Q 180 145 360 120 T 720 70"
              fill="none"
              stroke={palette.stroke}
              strokeWidth="2.5"
            />
          </g>
        )}

        {topicId === 'credito_salarios' && (
          <g>
            <line x1="80" y1="160" x2="220" y2="120" stroke={palette.stroke} strokeWidth="1.2" strokeOpacity="0.45" />
            <line x1="220" y1="120" x2="380" y2="140" stroke={palette.stroke} strokeWidth="1.2" strokeOpacity="0.45" />
            <line x1="380" y1="140" x2="520" y2="80" stroke={palette.stroke} strokeWidth="1.2" strokeOpacity="0.45" />
            <line x1="520" y1="80" x2="680" y2="60" stroke={palette.stroke} strokeWidth="1.2" strokeOpacity="0.45" />

            <circle cx="80" cy="160" r="4.5" fill={palette.stroke} />
            <circle cx="220" cy="120" r="6" fill={palette.stroke} />
            <circle cx="380" cy="140" r="5.5" fill={palette.stroke} />
            <circle cx="520" cy="80" r="6.5" fill={palette.stroke} />
            <circle cx="680" cy="60" r="5" fill={palette.stroke} />

            <path
              d="M 0 190 Q 200 160 400 135 T 720 90 L 720 240 L 0 240 Z"
              fill={`url(#curve-fill-${topicId})`}
            />
            <path
              d="M 0 190 Q 200 160 400 135 T 720 90"
              fill="none"
              stroke={palette.stroke}
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* 3. Viñeta cálida suave */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

      {/* 4. Etiqueta abreviada en esquina */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono text-[9px] text-blue-100/80 font-semibold tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.stroke }} />
        <span>{palette.label}</span>
      </div>
    </div>
  );
}
