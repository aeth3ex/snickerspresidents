import { useState } from 'react';
import { Plus, X, FileText, Copy, CheckCircle, FileInput, Eye, Lock } from 'lucide-react';
import type { GameEvent } from '../game/types';
import type { AINote } from '../game/useGame';
import type { GameActions } from './types';
import { useI18n } from '../i18n';

interface Props {
  events: GameEvent[];
  turn: number;
  aiMessage: string;
  aiNotes: AINote[];
  playerPeekedNotes: boolean;
  actions: GameActions;
  onExportText: () => string;
  onLoadAI: (raw: string) => void;
}

export function RightBar({ events, turn, aiMessage, aiNotes, playerPeekedNotes, actions, onExportText, onLoadAI }: Props) {
  const { t, lang } = useI18n();
  const [news, setNews] = useState('');
  const [playerMsg, setPlayerMsg] = useState('');
  const [eventText, setEventText] = useState('');
  const [eventTurn, setEventTurn] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [exportText, setExportText] = useState(lang === 'ru' ? 'Нажмите «Обновить»' : 'Click "Refresh"');
  const [copied, setCopied] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const refreshText = () => setExportText(onExportText());
  const copyText = () => {
    navigator.clipboard.writeText(exportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const loadAI = () => {
    onLoadAI(aiInput);
    setAiInput('');
  };

  const loadAIFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setAiInput(text);
      onLoadAI(text);
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col gap-2 no-select">
      <Card title={`📰 ${t.newsEvents}`}>
        <textarea
          value={news}
          onChange={(e) => { setNews(e.target.value); actions.setNews(e.target.value); }}
          rows={3}
          placeholder={lang === 'ru' ? 'Введите новость...' : 'Enter news...'}
          className="w-full px-2 py-1.5 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200 resize-y font-mono"
        />
        <p className="text-[10px] text-slate-500 mt-1">{lang === 'ru' ? 'Будет включено в JSON для ИИ' : 'Will be included in JSON for AI'}</p>
      </Card>

      <Card title={`📋 ${lang === 'ru' ? 'Блокнот событий' : 'Event Tracker'}`}>
        <div className="flex gap-1 items-center mb-2">
          <input
            type="text"
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            placeholder={lang === 'ru' ? 'Событие...' : 'Event...'}
            className="flex-1 min-w-0 px-2 py-1 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200"
          />
          <input
            type="number"
            value={eventTurn}
            onChange={(e) => setEventTurn(e.target.value)}
            placeholder={lang === 'ru' ? 'Ход' : 'Turn'}
            title={t.expireTurn}
            className="w-11 px-1 py-1 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200"
          />
          <button
            onClick={() => {
              if (eventText.trim()) {
                actions.addEvent(eventText.trim(), eventTurn ? +eventTurn : null);
                setEventText('');
                setEventTurn('');
              }
            }}
            className="p-1 rounded-md bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="max-h-36 overflow-y-auto scroll-thin flex flex-col gap-1">
          {events.length === 0 ? (
            <span className="text-[11px] text-slate-600">{lang === 'ru' ? 'Событий нет' : 'No events'}</span>
          ) : (
            events.map((ev, idx) => {
              const expired = ev.expTurn && turn >= ev.expTurn;
              return (
                <div
                  key={ev.id}
                  className={`flex items-center gap-1.5 bg-ink-900 border border-ink-600 rounded-md px-2 py-1 text-[11px] ${
                    ev.done ? 'opacity-45 line-through' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={ev.done}
                    onChange={() => actions.toggleEvent(idx)}
                    className="accent-emerald-500 cursor-pointer"
                  />
                  <span className="flex-1">{ev.text}</span>
                  {ev.expTurn && (
                    <span className={`text-[10px] whitespace-nowrap ${expired ? 'text-red-400' : 'text-teamgold-300'}`}>
                      {t.turn} {ev.expTurn}{expired ? ' ⚠️' : ''}
                    </span>
                  )}
                  <button
                    onClick={() => actions.deleteEvent(idx)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card title={`✍️ ${lang === 'ru' ? 'Сообщение для ИИ' : 'Message to AI'}`}>
        <textarea
          value={playerMsg}
          onChange={(e) => { setPlayerMsg(e.target.value); actions.setPlayerMsg(e.target.value); }}
          rows={4}
          placeholder={lang === 'ru' ? 'Дипломатия, угрозы, союзы...' : 'Diplomacy, threats, alliances...'}
          className="w-full px-2 py-1.5 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200 resize-y"
        />
      </Card>

      <Card title={`🤖 ${t.aiResponse}`}>
        <div className="text-xs leading-relaxed text-cyan-200 whitespace-pre-wrap break-words min-h-[40px] bg-ink-900 rounded-md p-2 border border-ink-600">
          {aiMessage}
        </div>
        <div className="h-px bg-ink-700 my-2" />
        <div className="text-[10px] text-slate-500 mb-1">{lang === 'ru' ? 'Вставьте JSON ответ ИИ:' : 'Paste AI JSON response:'}</div>
        <textarea
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          rows={3}
          placeholder='{"message":"...","actions":[...]}'
          className="w-full px-2 py-1.5 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200 resize-y font-mono"
        />
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <button
            onClick={loadAI}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors"
          >
            <CheckCircle size={12} /> {t.applyAi}
          </button>
          <button
            onClick={() => document.getElementById('ai-file-input')?.click()}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors"
          >
            <FileInput size={12} /> {lang === 'ru' ? 'Из файла' : 'From file'}
          </button>
          <input type="file" id="ai-file-input" accept=".json" className="hidden" onChange={loadAIFile} />
        </div>
      </Card>

      {/* AI notebook */}
      <Card title={`🤖 ${t.aiNotebookSecret}`}>
        <div className="flex gap-1.5 mb-2">
          <button
            onClick={() => {
              const next = !showNotes;
              setShowNotes(next);
              if (next) actions.playerPeekNotes();
            }}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors ${
              showNotes
                ? 'bg-violet-700 border-violet-500 text-white'
                : 'bg-ink-800 hover:bg-ink-700 border-ink-600 text-slate-300'
            }`}
          >
            {showNotes ? <Eye size={12} /> : <Lock size={12} />}
            {showNotes ? t.hideNotes : t.showNotes}
          </button>
          {playerPeekedNotes && (
            <span className="flex items-center text-[10px] text-amber-400">{t.peekWarning}</span>
          )}
        </div>
        {showNotes ? (
          aiNotes.length === 0 ? (
            <span className="text-[11px] text-slate-600">{t.notesEmpty}</span>
          ) : (
            <div className="max-h-40 overflow-y-auto scroll-thin flex flex-col gap-1">
              {aiNotes.map((n) => (
                <div key={n.id} className="bg-ink-900 border border-violet-800/50 rounded-md px-2 py-1 text-[11px]">
                  <div className="text-slate-300 whitespace-pre-wrap break-words">{n.text}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {t.noteTurn} {n.createdTurn}{n.updatedTurn !== n.createdTurn ? ` (${t.noteUpdated} ${t.noteTurn} ${n.updatedTurn})` : ''}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <span className="text-[10px] text-slate-500">{t.notesHint}</span>
        )}
      </Card>

      <Card title={`📄 ${t.textExport}`}>
        <div className="flex gap-1.5 mb-1.5">
          <button onClick={refreshText} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors">
            <FileText size={12} /> {t.refresh}
          </button>
          <button onClick={copyText} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors">
            {copied ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />} {t.copyText}
          </button>
        </div>
        <textarea
          readOnly
          value={exportText}
          rows={6}
          className="w-full px-2 py-1.5 text-[10px] rounded-md bg-ink-900 border border-ink-600 text-slate-300 resize-y font-mono scroll-thin"
        />
      </Card>
    </aside>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-ink-850 border border-ink-700 rounded-xl p-2.5">
      <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{title}</h3>
      {children}
    </div>
  );
}
