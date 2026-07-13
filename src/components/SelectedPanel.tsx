import { Trash2, X, Swords, Heart, Radio, Flag, Footprints } from 'lucide-react';
import type { Cell, Mode } from '../game/types';
import { UDEFS, coordId } from '../game/types';
import type { GameActions } from './types';
import { useI18n } from '../i18n';

interface Props {
  selCell: [number, number] | null;
  selIdx: number | null;
  grid: Cell[][];
  actions: GameActions;
}

export function SelectedPanel({ selCell, selIdx, grid, actions }: Props) {
  const { t, lang } = useI18n();
  if (!selCell || selIdx === null) return null;
  const [r, c] = selCell;
  const u = grid[r][c].units[selIdx];
  if (!u) return null;

  const def = UDEFS[u.t];
  const hpPct = Math.max(0, Math.min(100, Math.round((u.hp / u.maxhp) * 100)));
  const hpColor = hpPct > 60 ? 'bg-emerald-500' : hpPct > 30 ? 'bg-orange-500' : 'bg-red-500';
  const teamLabel = u.team === 'red' ? t.teamRed : u.team === 'yellow' ? t.teamYellow : t.teamNeutral;
  const unitLabel: Record<string, string> = {
    B: t.unitB, K: t.unitK, M: t.unitM, W: t.unitW, D: t.unitD, E: t.unitE, R: t.unitR,
  };
  const desc = lang === 'ru' ? def.desc : def.descEn;

  const setModeFrom = (m: Mode) => {
    actions.setMode(m);
  };

  return (
    <div className="bg-ink-850 border border-ink-700 rounded-xl p-3 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">
          <span className="font-bold text-white">{u.t}</span>
          <span className="text-slate-400"> — {unitLabel[u.t]} — {teamLabel} — {coordId(r, c)}</span>
        </div>
        <button onClick={actions.clearSel} className="p-1 rounded-md hover:bg-ink-700 text-slate-400 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-ink-900 overflow-hidden">
          <div className={`h-full transition-all ${hpColor}`} style={{ width: `${hpPct}%` }} />
        </div>
        <span className="text-xs text-slate-300 min-w-[40px] text-right">{u.hp}/{u.maxhp}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {def.canAttack && (
          <ActBtn icon={<Swords size={13} />} label={t.modeAttack} onClick={() => setModeFrom('attack')} />
        )}
        {u.t === 'M' && (
          <ActBtn icon={<Heart size={13} />} label={t.modeHeal} onClick={() => setModeFrom('heal')} />
        )}
        {u.t === 'W' && (
          <ActBtn icon={<Radio size={13} />} label={t.modeWheal} onClick={() => setModeFrom('wheal')} />
        )}
        {def.canCapture && (
          <ActBtn icon={<Flag size={13} />} label={t.capture} onClick={actions.captureCell} />
        )}
        <ActBtn icon={<Footprints size={13} />} label={t.modeMove} onClick={() => setModeFrom('move')} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <CtrlBtn label="HP −1" onClick={() => actions.editHp(-1)} />
        <CtrlBtn label="HP +1" onClick={() => actions.editHp(1)} />
        <CtrlBtn label={`${t.maxHpLabel} −1`} onClick={() => actions.editMaxHp(-1)} />
        <CtrlBtn label={`${t.maxHpLabel} +1`} onClick={() => actions.editMaxHp(1)} />
        <button
          onClick={actions.deleteSelected}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-teamred-800 hover:bg-teamred-700 border border-teamred-600 text-teamred-200 transition-colors"
        >
          <Trash2 size={12} /> {t.delete}
        </button>
      </div>

      <p className="text-[10px] text-slate-500 mt-2">{desc}</p>
    </div>
  );
}

function ActBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-ink-700 hover:bg-ink-600 border border-ink-600 text-slate-200 transition-colors"
    >
      {icon} {label}
    </button>
  );
}

function CtrlBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-0.5 px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-300 transition-colors"
    >
      {label}
    </button>
  );
}
