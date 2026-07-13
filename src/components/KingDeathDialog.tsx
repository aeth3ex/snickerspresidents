import { Crown, Skull, Swords, Flag } from 'lucide-react';
import type { Team } from '../game/types';
import type { Lang } from '../i18n';

interface Props {
  killedTeam: Team;
  lang: Lang;
  onContinue: () => void;
  onEnd: () => void;
}

export function KingDeathDialog({ killedTeam, lang, onContinue, onEnd }: Props) {
  const teamName = killedTeam === 'red'
    ? (lang === 'ru' ? 'Красных' : 'Red')
    : (lang === 'ru' ? 'Жёлтых' : 'Yellow');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-ink-850 border-2 border-red-600 rounded-2xl max-w-md w-full p-6 animate-fade-in shadow-2xl">
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="relative">
            <Crown size={48} className="text-teamgold-300" />
            <Skull size={28} className="text-red-500 absolute -bottom-1 -right-1" />
          </div>
          <h2 className="text-lg font-bold text-red-300">
            {lang === 'ru' ? ' КОРОЛЯ УБИТО!' : 'THE KING IS DEAD!'}
          </h2>
          <p className="text-sm text-slate-300">
            {lang === 'ru'
              ? `Король команды ${teamName} пал в бою. Игра может быть окончена или продолжена.`
              : `The ${teamName} King has fallen in battle. The game can end or continue.`}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onContinue}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors"
          >
            <Swords size={16} />
            {lang === 'ru' ? 'Продолжить игру' : 'Continue playing'}
          </button>
          <button
            onClick={onEnd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-teamred-800 hover:bg-teamred-700 border border-teamred-600 text-teamred-200 transition-colors"
          >
            <Flag size={16} />
            {lang === 'ru' ? 'Завершить игру' : 'End the game'}
          </button>
        </div>

        <p className="text-[10px] text-slate-500 text-center mt-3">
          {lang === 'ru'
            ? 'Решение будет записано в лог и историю'
            : 'The decision will be recorded in the log and history'}
        </p>
      </div>
    </div>
  );
}
