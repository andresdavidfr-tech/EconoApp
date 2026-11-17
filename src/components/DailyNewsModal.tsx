import React, { useEffect, useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { DailyBriefing, formatFriendlyDate } from '../dailyNews';

interface DailyNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: DailyBriefing;
}

const ITEM_ACCENTS = [
  {
    kicker: 'text-blue-700',
    metric: 'text-blue-900',
    wash: 'bg-blue-50/55',
    indexBg: 'bg-blue-50 text-blue-700 border-blue-200/80'
  },
  {
    kicker: 'text-indigo-700',
    metric: 'text-indigo-900',
    wash: 'bg-indigo-50/55',
    indexBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
  },
  {
    kicker: 'text-emerald-700',
    metric: 'text-emerald-900',
    wash: 'bg-emerald-50/55',
    indexBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
  },
  {
    kicker: 'text-sky-700',
    metric: 'text-sky-900',
    wash: 'bg-sky-50/55',
    indexBg: 'bg-sky-50 text-sky-700 border-sky-200/80'
  },
  {
    kicker: 'text-amber-700',
    metric: 'text-amber-900',
    wash: 'bg-amber-50/55',
    indexBg: 'bg-amber-50 text-amber-800 border-amber-200/80'
  }
];

export function DailyNewsModal({ isOpen, onClose, briefing }: DailyNewsModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isBrazil = briefing.country === 'BR';
  const headerTitle = isBrazil ? '5 Chaves Econômicas do Dia' : '5 Claves Económicas del Día';

  const handleCopy = () => {
    const textToCopy =
      `${headerTitle}\n` +
      `${formatFriendlyDate(briefing.lastUpdatedDate)}\n\n` +
      briefing.items
        .map(
          item =>
            `${item.order}. ${item.title}\n` +
            `${item.highlightNumber} · ${item.summary}\n` +
            `Fuente: ${item.source}`
        )
        .join('\n\n') +
      `\n\nEconoapp`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-2.5 sm:p-5 animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={headerTitle}
        className="bg-white text-slate-900 border border-slate-200/90 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Encabezado limpio con matiz azul editorial */}
        <header className="px-5 sm:px-7 py-4 bg-gradient-to-r from-slate-50 via-blue-50/70 to-indigo-50/50 border-b border-slate-200/80 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-blue-700 capitalize">
              {formatFriendlyDate(briefing.lastUpdatedDate)}
            </p>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 leading-tight mt-0.5 text-balance">
              {headerTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar noticias"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer shrink-0"
            title="Cerrar"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Lista única minimalista de las 5 noticias */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-2 divide-y divide-slate-200/70 bg-white">
          {briefing.items.map((item, idx) => {
            const theme = ITEM_ACCENTS[idx % ITEM_ACCENTS.length];
            return (
              <article key={item.id} className="py-5 first:pt-4 last:pb-5">
                <div className="flex items-start gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-lg border text-xs font-bold tabular-nums flex items-center justify-center shrink-0 mt-0.5 ${theme.indexBg}`}
                  >
                    {item.order}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.kicker}`}>
                        {item.badge}
                      </span>
                      <span className={`text-sm font-extrabold tabular-nums shrink-0 ${theme.metric}`}>
                        {item.highlightNumber}
                      </span>
                    </div>

                    <h3 className="font-editorial text-lg sm:text-[21px] font-bold text-slate-900 leading-snug mt-1 text-balance">
                      {item.title}
                    </h3>

                    <p className="font-editorial-prose text-[15px] leading-relaxed text-slate-700 mt-2">
                      {item.summary}
                    </p>

                    {item.whyItMatters && (
                      <p className={`mt-2.5 px-3 py-2 rounded-lg text-[12.5px] leading-relaxed text-slate-700 ${theme.wash}`}>
                        <strong className={`font-semibold ${theme.kicker}`}>
                          {isBrazil ? 'Leitura: ' : 'Clave: '}
                        </strong>
                        {item.whyItMatters}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500 mt-2">
                      Fuente: {item.source}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pie minimalista */}
        <footer className="px-5 sm:px-7 py-3 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-slate-500" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
