import { X, BookOpen } from 'lucide-react';
import { useI18n } from '../i18n';

interface Props {
  onClose: () => void;
}

export function RulesModal({ onClose }: Props) {
  const { t, lang } = useI18n();

  const rulesRu = [
    { title: 'Цель игры', body: 'Уничтожить короля (K) противника. Когда король погибает — игра окончена.' },
    { title: 'Ходы', body: 'Команды ходят по очереди. В начале каждого хода каждый D-добывающий приносит 0.5 батончика своей команде.' },
    { title: 'Юниты', body: 'B — Боец (атакует, ходит на 1). K — Король (атакует, ходит на 1). M — Медик (лечит рядом, кулдаун 2 хода). W — Дист. медик (лечит любую клетку, кулдаун 5). D — Добывающий (приносит батончики). E — Защитник (блокирует врагов, нельзя атаковать). R — Разведчик (ходит до 2 клеток, обходит защитника).' },
    { title: 'Атака', body: 'Атаковать можно только соседнюю клетку (не по диагонали). Каждый юнит атакует 1 раз за ход. Атака снимает 1 HP. Защитник (E) блокирует атаку — его нельзя атаковать обычным путём.' },
    { title: 'Движение', body: 'Все юниты ходят на 1 клетку по ортогонали. Разведчик (R) ходит до 2 клеток или на 1 по диагонали. Защитник (E) блокирует вход врагов на клетку (кроме разведчика).' },
    { title: 'Лечение', body: 'M-медик лечит на +1 HP соседнюю клетку (не по диагонали), кулдаун 2 хода. W-медик лечит любую клетку на +1 HP, кулдаун 5 ходов. Медик не лечит сам себя.' },
    { title: 'Размещение', body: 'Юниты размещаются только на своей территории. Лимит 10 юнитов на клетке. Стоимость: B=1, K=3, M=2, W=4, D=2, E=2, R=1 батончиков.' },
    { title: 'Захват', body: 'Любой юнит может захватить клетку, на которой стоит, изменив её территорию на свою. Это меняет контроль над клеткой.' },
    { title: 'Экономика', body: 'Батончики — валюта. Каждый D приносит 0.5 за ход. Деньги можно передавать между командами (дипломатия) или добавлять вручную.' },
    { title: 'Режим разработчика', body: 'Секретный код снимает все ограничения: ходы по диагонали, многократные атаки, размещение на чужой территории, игнорирование кулдаунов и защитников.' },
  ];

  const rulesEn = [
    { title: 'Objective', body: 'Destroy the enemy King (K). When the King dies, the game ends.' },
    { title: 'Turns', body: 'Teams alternate turns. At the start of each turn, each D-miner generates 0.5 Snickers for its team.' },
    { title: 'Units', body: 'B — Fighter (attacks, moves 1). K — King (attacks, moves 1). M — Medic (heals adjacent, 2-turn CD). W — Remote Medic (heals any cell, 5-turn CD). D — Miner (generates Snickers). E — Defender (blocks enemies, cannot be attacked). R — Scout (moves up to 2, bypasses Defender).' },
    { title: 'Attack', body: 'Attack adjacent cells only (not diagonal). Each unit attacks once per turn. Attack deals 1 damage. Defender (E) blocks attacks — it cannot be attacked normally.' },
    { title: 'Movement', body: 'All units move 1 cell orthogonally. Scout (R) moves up to 2 cells or 1 diagonally. Defender (E) blocks enemy entry to its cell (except Scout).' },
    { title: 'Healing', body: 'M-medic heals +1 HP on adjacent cell (not diagonal), 2-turn cooldown. W-medic heals +1 HP on any cell, 5-turn cooldown. Medic cannot heal itself.' },
    { title: 'Placement', body: 'Units are placed only on your own territory. Limit 10 units per cell. Cost: B=1, K=3, M=2, W=4, D=2, E=2, R=1 Snickers.' },
    { title: 'Capture', body: 'Any unit can capture the cell it stands on, changing its territory to its own. This changes control over the cell.' },
    { title: 'Economy', body: 'Snickers are the currency. Each D generates 0.5 per turn. Money can be transferred between teams (diplomacy) or added manually.' },
    { title: 'Developer Mode', body: 'A secret code lifts all restrictions: diagonal moves, multiple attacks, placement on enemy territory, ignoring cooldowns and defenders.' },
  ];

  const rules = lang === 'ru' ? rulesRu : rulesEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-ink-850 border border-ink-600 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto scroll-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-ink-700 sticky top-0 bg-ink-850 z-10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-accent-400" /> {t.rulesTitle}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-ink-700 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className="p-3 bg-ink-900 border border-ink-600 rounded-xl">
              <h3 className="text-sm font-semibold text-accent-300 mb-1">{rule.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rule.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
