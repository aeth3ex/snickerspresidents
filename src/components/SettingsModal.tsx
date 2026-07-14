import { X } from 'lucide-react';
import type { Lang } from '../i18n';

interface Props {
  onClose: () => void;
  lang: Lang;
  onSetLang: (l: Lang) => void;
  opponentType: 'ai' | 'human-offline' | 'human-online';
  onSetOpponentType: (t: 'ai' | 'human-offline' | 'human-online') => void;
  rulesDisabled: boolean;
  onSetRulesDisabled: (value: boolean) => void;
}

export function SettingsModal({ onClose, lang, onSetLang, opponentType, onSetOpponentType, rulesDisabled, onSetRulesDisabled }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-ink-850 border border-ink-700 rounded-2xl p-4 w-full max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">
            {lang === 'ru' ? 'Настройки' : 'Settings'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>

        {/* Language */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            {lang === 'ru' ? 'Язык' : 'Language'}
          </label>
          <div className="flex gap-1.5">
            <button
              onClick={() => onSetLang('en')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                lang === 'en'
                  ? 'bg-accent-700 text-white border border-accent-500'
                  : 'bg-ink-900 text-slate-300 border border-ink-700 hover:bg-ink-800'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onSetLang('ru')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                lang === 'ru'
                  ? 'bg-accent-700 text-white border border-accent-500'
                  : 'bg-ink-900 text-slate-300 border border-ink-700 hover:bg-ink-800'
              }`}
            >
              Русский
            </button>
          </div>
        </div>

        {/* Opponent Type */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            {lang === 'ru' ? 'Тип оппонента' : 'Opponent type'}
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => onSetOpponentType('ai')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                opponentType === 'ai'
                  ? 'bg-emerald-700 text-white border border-emerald-500'
                  : 'bg-ink-900 text-slate-300 border border-ink-700 hover:bg-ink-800'
              }`}
            >
              {lang === 'ru' ? 'ИИ' : 'AI'}
            </button>
            <button
              onClick={() => onSetOpponentType('human-offline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                opponentType === 'human-offline'
                  ? 'bg-violet-700 text-white border border-violet-500'
                  : 'bg-ink-900 text-slate-300 border border-ink-700 hover:bg-ink-800'
              }`}
            >
              {lang === 'ru' ? 'Человек (Offline)' : 'Human (Offline)'}
            </button>
            <button
              onClick={() => onSetOpponentType('human-online')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                opponentType === 'human-online'
                  ? 'bg-amber-700 text-white border border-amber-500'
                  : 'bg-ink-900 text-slate-300 border border-ink-700 hover:bg-ink-800'
              }`}
            >
              {lang === 'ru' ? 'Человек (Online)' : 'Human (Online)'}
            </button>
          </div>
        </div>

        {/* Rules Disabled */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            {lang === 'ru' ? 'Правила' : 'Rules'}
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetRulesDisabled(!rulesDisabled)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                rulesDisabled
                  ? 'bg-red-700 text-white border border-red-500'
                  : 'bg-emerald-700 text-white border border-emerald-500'
              }`}
            >
              {rulesDisabled
                ? (lang === 'ru' ? 'Отключены (Чит-режим)' : 'Disabled (Cheat mode)')
                : (lang === 'ru' ? 'Включены' : 'Enabled')}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {lang === 'ru' 
              ? 'Отключение правил позволяет обрабатывать ограничения игры. В Human Online это будет скрыто в JSON.'
              : 'Disabling rules allows bypassing game restrictions. In Human Online this is hidden in JSON.'}
          </p>
        </div>

        <button onClick={onClose} className="w-full mt-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-700 text-slate-300 transition-colors">
          {lang === 'ru' ? 'Закрыть' : 'Close'}
        </button>
      </div>
    </div>
  );
}
