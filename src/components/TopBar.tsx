import { useState } from 'react';
import {
  ChevronRight, ChevronLeft, Save, Copy, FolderOpen, Crown,
  RotateCcw, Trash2, Download, Unlock, KeyRound, ScrollText, BookOpen, Users,
  Newspaper,
} from 'lucide-react';
import { useI18n, type Lang } from '../i18n';
import type { Team } from '../game/types';

interface Props {
  turn: number;
  turnTeam: Team;
  winner: Team | null;
  devMode: boolean;
  changelogVersion: string;
  lang: Lang;
  onNextTurn: () => void;
  onPrevTurn: () => void;
  onExport: () => void;
  onCopy: () => void;
  onHistory: () => void;
  onImport: (file: File) => void;
  onResetGame: () => void;
  onClearHistory: () => void;
  onDownloadHistory: () => void;
  onToggleDevMode: () => void;
  onShowChangelog: () => void;
  onShowRules: () => void;
  onShowNews: () => void;
  onShowSettings: () => void;
  onDevCodeSubmit: (code: string) => Promise<boolean>;
  onSetLang: (l: Lang) => void;
}

export function TopBar({
  turn, turnTeam, winner, devMode, changelogVersion, lang,
  onNextTurn, onPrevTurn, onExport, onCopy, onHistory: _onHistory, onImport,
  onResetGame, onClearHistory, onDownloadHistory, onToggleDevMode,
  onShowChangelog, onShowRules, onShowNews, onShowSettings, onDevCodeSubmit, onSetLang,
}: Props) {
  const { t } = useI18n();
  const isRed = turnTeam === 'red';
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeVerifying, setCodeVerifying] = useState(false);

  const teamLabel = isRed ? t.teamRed : t.teamYellow;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onImport(f);
    e.target.value = '';
  };

  const handleCodeSubmit = async () => {
    if (!codeInput) return;
    setCodeVerifying(true);
    const ok = await onDevCodeSubmit(codeInput);
    setCodeVerifying(false);
    setCodeInput('');
    setShowCodeInput(false);
    if (ok) onToggleDevMode();
  };

  return (
    <header className="flex items-center gap-3 px-4 py-2.5 bg-ink-900 border-b border-ink-700 flex-wrap no-select">
      <div className="flex items-center gap-2">
        <Crown size={20} className="text-teamgold-300" />
        <h1 className="text-base font-bold text-white tracking-wide hidden sm:block">{t.appTitle}</h1>
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-700 text-emerald-200 border border-emerald-500">{changelogVersion}</span>
      </div>

      <div
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
          isRed ? 'bg-teamred-800 text-teamred-200' : 'bg-teamgold-800 text-teamgold-200'
        }`}
      >
        {teamLabel}
      </div>
      <span className="text-xs text-slate-400">{t.turn} {turn}</span>

      <button
        onClick={onNextTurn}
        disabled={!!winner}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t.nextTurn} <ChevronRight size={14} />
      </button>
      <button
        onClick={onPrevTurn}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors"
      >
        <ChevronLeft size={14} /> {t.prevTurn}
      </button>

      <div className="flex-1" />

      {/* Settings button */}
      <button
        onClick={onShowSettings}
        title={lang === 'ru' ? 'Настройки' : 'Settings'}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-300 transition-colors"
      >
        <Users size={13} /> <span className="hidden md:inline">{lang === 'ru' ? 'Настройки' : 'Settings'}</span>
      </button>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={onShowRules}
          title={t.rules}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-300 transition-colors"
        >
          <BookOpen size={13} /> <span className="hidden md:inline">{t.rules}</span>
        </button>
        <button
          onClick={onShowNews}
          title={lang === 'ru' ? 'Новости' : 'News'}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-300 transition-colors"
        >
          <Newspaper size={13} /> <span className="hidden md:inline">{lang === 'ru' ? 'Новости' : 'News'}</span>
        </button>
        <button
          onClick={onShowChangelog}
          title={t.changelog}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-300 transition-colors"
        >
          <ScrollText size={13} /> <span className="hidden md:inline">{t.changelog}</span>
        </button>

        <button
          onClick={() => { if (confirm(t.confirmReset)) onResetGame(); }}
          title={t.newGame}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-red-900 border border-ink-600 hover:border-red-600 text-slate-300 hover:text-red-200 transition-colors"
        >
          <RotateCcw size={13} /> <span className="hidden lg:inline">{t.newGame}</span>
        </button>
        <button
          onClick={() => { if (confirm(t.confirmClearHistory)) onClearHistory(); }}
          title={t.clearHistory}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-300 transition-colors"
        >
          <Trash2 size={13} /> <span className="hidden lg:inline">{t.clearHistory}</span>
        </button>
        <button
          onClick={onDownloadHistory}
          title={t.history}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-violet-700 hover:bg-violet-600 border border-violet-500 text-white transition-colors"
        >
          <Download size={13} /> <span className="hidden md:inline">{t.history}</span>
        </button>

        <div className="h-5 w-px bg-ink-600 mx-0.5" />

        <button
          onClick={onExport}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-teamgold-800 hover:bg-teamgold-700 border border-teamgold-600 text-teamgold-200 transition-colors"
        >
          <Save size={13} /> <span className="hidden md:inline">{t.exportJson}</span>
        </button>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-teamgold-800 hover:bg-teamgold-700 border border-teamgold-600 text-teamgold-200 transition-colors"
        >
          <Copy size={13} /> <span className="hidden md:inline">{t.copy}</span>
        </button>
        <button
          onClick={() => document.getElementById('import-trigger')?.click()}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-accent-500 hover:bg-accent-400 border border-accent-400 text-white transition-colors"
        >
          <FolderOpen size={13} /> <span className="hidden md:inline">{t.import}</span>
        </button>
        <input type="file" id="import-trigger" accept=".json" className="hidden" onChange={handleImport} />

        <div className="h-5 w-px bg-ink-600 mx-0.5" />

        {devMode ? (
          <button
            onClick={onToggleDevMode}
            title={t.devOn}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 border border-amber-400 text-white transition-colors animate-pulse-soft"
          >
            <Unlock size={13} /> {t.dev}
          </button>
        ) : showCodeInput ? (
          <div className="flex items-center gap-1">
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
              placeholder={t.codePlaceholder}
              autoFocus
              disabled={codeVerifying}
              className="w-16 px-2 py-1 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200"
            />
            <button
              onClick={handleCodeSubmit}
              disabled={codeVerifying}
              className="px-2 py-1 text-xs rounded-md bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors disabled:opacity-50"
            >
              {codeVerifying ? '...' : t.verify}
            </button>
            <button onClick={() => { setShowCodeInput(false); setCodeInput(''); }} className="px-1.5 py-1 text-xs rounded-md bg-ink-800 border border-ink-600 text-slate-400 transition-colors">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setShowCodeInput(true)}
            title=""
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-500 transition-colors"
          >
            <KeyRound size={13} />
          </button>
        )}
      </div>

      {winner && (
        <div className="w-full mt-1 px-4 py-2 rounded-lg bg-red-900/80 border border-red-600 text-center text-sm font-bold text-red-100 animate-shake">
          {t.kingSlain} {t.victory}: {winner === 'red' ? t.teamRed : t.teamYellow}
        </div>
      )}
    </header>
  );
}
