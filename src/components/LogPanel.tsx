import { useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { LogEntry } from '../game/types';
import { useI18n } from '../i18n';

interface Props {
  log: LogEntry[];
  onClear: () => void;
}

export function LogPanel({ log, onClear }: Props) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log]);

  return (
    <div className="bg-ink-850 border border-ink-700 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t.log}</h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-400 transition-colors"
        >
          <Trash2 size={11} /> {t.clearLog}
        </button>
      </div>
      <div ref={ref} className="max-h-32 overflow-y-auto scroll-thin text-[11px] text-slate-400 leading-relaxed font-mono">
        {log.length === 0 ? (
          <span className="text-slate-600">{lang === 'ru' ? '— Лог пуст —' : '— Log empty —'}</span>
        ) : (
          log.map((entry, i) => (
            <div key={i} className="py-px">
              <span className="text-slate-600">[{entry.turn}]</span> {entry.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
