import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Sparkles, Newspaper, Globe, ArrowUpRight } from 'lucide-react';
import { DailyBriefing } from '../dailyNews';

interface DailyNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: DailyBriefing;
}

export function DailyNewsModal({ isOpen, onClose, briefing }: DailyNewsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = `${briefing.title} - ${briefing.subtitle}\n\n` +
      briefing.items.map(item => (
        `#${item.order} ${item.emoji} ${item.title}\n` +
        `Dato: ${item.highlightNumber} (${item.highlightLabel})\n` +
        `${item.summary}\n` +
        `Impacto: ${item.whyItMatters}\n` +
        `Fuente: ${item.source}\n`
      )).join('\n---\n\n') +
      `\nGenerado de manera autónoma por Econoapp`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white shrink-0 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
                <Newspaper className="size-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-300" />
                    Síntesis Autónoma del Día
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">
                    ⏱️ ~{briefing.readingTimeMinutes} min
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-1">
                  {briefing.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Cerrar modal"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2 relative z-10 leading-relaxed max-w-xl">
            {briefing.subtitle}
          </p>
        </div>

        {/* Scrollable Content: 5 Essential Things */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-100">
          {briefing.items.map((item, idx) => (
            <div key={item.id} className={idx > 0 ? 'pt-3.5' : ''}>
              <div className="flex items-start gap-3">
                {/* Order Circle Badge */}
                <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-mono font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {item.order}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Category Pill & Key Metric Highlight */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{item.emoji}</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
                        {item.badge}
                      </span>
                    </div>

                    <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-black text-slate-900 flex items-center gap-1 shadow-2xs">
                      <span>{item.highlightNumber}</span>
                      <span className="text-[10px] font-normal text-slate-500 font-sans">
                        · {item.highlightLabel}
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h4 className="text-xs sm:text-sm font-bold text-slate-950 leading-snug">
                    {item.title}
                  </h4>

                  {/* Clean Synthesis Body */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Impact Box: Why this matters to people */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/90 text-xs text-blue-950 flex items-start gap-1.5">
                    <span className="shrink-0 font-bold text-blue-600 text-[11px]">💡 En tu bolsillo:</span>
                    <span className="text-slate-700 leading-relaxed text-[11.5px]">{item.whyItMatters}</span>
                  </div>

                  {/* Source Footer */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                    <span>Fuente oficial: {item.source}</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                      Auditado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Copiar las 5 noticias completas al portapapeles"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-slate-500" />
                <span>Copiar 5 Claves</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
