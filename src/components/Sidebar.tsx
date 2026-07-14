import { useState } from 'react';
import {
  Square,
  Swords, Heart, Radio, Flag, Trash2,
  Footprints, Plus, Minus, ArrowRight,
} from 'lucide-react';
import type { Mode, Team, UnitType } from '../game/types';
import { UDEFS } from '../game/types';
import type { GameActions } from './types';
import { useI18n } from '../i18n';

interface Props {
  cols: number;
  rows: number;
  mode: Mode;
  pickedType: UnitType;
  pickedTeam: Team;
  pickedMaxHp: number;
  redMoney: number;
  yelMoney: number;
  wCooldownRed: number;
  wCooldownYellow: number;
  actions: GameActions;
}

function getModeButtons(t: ReturnType<typeof useI18n>['t']): { mode: Mode; label: string; icon: React.ReactNode }[] {
  return [
    { mode: 'paint-red', label: t.modePaintRed, icon: <Square size={14} className="text-teamred-400" /> },
    { mode: 'paint-yellow', label: t.modePaintYellow, icon: <Square size={14} className="text-teamgold-400" /> },
    { mode: 'paint-neutral', label: t.modePaintNeutral, icon: <Square size={14} className="text-slate-400" /> },
    { mode: 'place-unit', label: t.modePlace, icon: <Footprints size={14} className="text-accent-400" /> },
    { mode: 'move', label: t.modeMove, icon: <span className="text-sm leading-none">✋</span> },
    { mode: 'attack', label: t.modeAttack, icon: <Swords size={14} className="text-red-400" /> },
    { mode: 'heal', label: t.modeHeal, icon: <Heart size={14} className="text-emerald-400" /> },
    { mode: 'wheal', label: t.modeWheal, icon: <Radio size={14} className="text-cyan-400" /> },
    { mode: 'capture', label: t.modeCapture, icon: <Flag size={14} className="text-amber-400" /> },
    { mode: 'delete-unit', label: t.modeDelete, icon: <Trash2 size={14} className="text-rose-400" /> },
  ];
}

export function Sidebar({
  cols, rows, mode, pickedType, pickedTeam, pickedMaxHp,
  redMoney, yelMoney, wCooldownRed, wCooldownYellow, actions,
}: Props) {
  const { t, lang } = useI18n();
  const [colsInput, setColsInput] = useState(cols);
  const [rowsInput, setRowsInput] = useState(rows);
  const [moneyTeam, setMoneyTeam] = useState<Team>('red');
  const [moneyAmt, setMoneyAmt] = useState(3);
  const [transferFrom, setTransferFrom] = useState<Team>('red');
  const [transferTo, setTransferTo] = useState<Team>('yellow');
  const [transferAmt, setTransferAmt] = useState(1);

  const cost = UDEFS[pickedType].cost;
  const bal = pickedTeam === 'red' ? redMoney : yelMoney;
  const canAfford = cost === 0 || bal >= cost;
  const unitLabels: Record<UnitType, string> = {
    B: t.unitB, K: t.unitK, M: t.unitM, W: t.unitW, D: t.unitD, E: t.unitE, R: t.unitR,
  };
  const teamOpt = (val: Team) => (
    <>
      <option value="red">{val === 'red' ? (lang === 'ru' ? '🔴 Красные' : '🔴 Red') : (lang === 'ru' ? '🔴 Красные' : '🔴 Red')}</option>
      <option value="yellow">{val === 'yellow' ? (lang === 'ru' ? '🟡 Жёлтые' : '🟡 Yellow') : (lang === 'ru' ? '🟡 Жёлтые' : '🟡 Yellow')}</option>
      <option value="neutral">{lang === 'ru' ? '⬜ Нейтр.' : '⬜ Neutral'}</option>
    </>
  );

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col gap-2 no-select">
      <Card title={t.mapSetup}>
        <div className="flex gap-1.5 items-center mb-1.5 text-xs text-slate-400">
          <span>{t.cols}</span>
          <NumInput value={colsInput} onChange={setColsInput} min={3} max={20} />
          <span>{t.rows}</span>
          <NumInput value={rowsInput} onChange={setRowsInput} min={3} max={20} />
        </div>
        <div className="flex gap-1.5 mb-2">
          <button onClick={() => actions.rebuild(colsInput, rowsInput)} className="px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors">{t.rebuild}</button>
          <button onClick={() => actions.resetGrid()} className="px-2 py-1 text-xs rounded-md bg-teamred-800 hover:bg-teamred-700 border border-teamred-600 text-teamred-200 transition-colors">{t.clearMap}</button>
        </div>
        <div className="flex flex-wrap gap-1">
          <MiniBtn label={t.fillRed} onClick={() => actions.fillAll('red-t')} />
          <MiniBtn label={t.fillYellow} onClick={() => actions.fillAll('yellow-t')} />
          <MiniBtn label={t.fillHalf} onClick={() => actions.fillHalf()} />
          <MiniBtn label={t.fillNeutral} onClick={() => actions.fillAll('neutral-t')} />
        </div>
      </Card>

      <Card title={lang === 'ru' ? 'Режим кисти' : 'Brush Mode'}>
        <div className="flex flex-col gap-0.5">
          {getModeButtons(t).map((b) => (
            <button
              key={b.mode}
              onClick={() => actions.setMode(b.mode)}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-md text-left transition-colors ${
                mode === b.mode ? 'bg-ink-700 border border-accent-500 text-accent-300' : 'bg-ink-800/50 border border-transparent text-slate-300 hover:bg-ink-700'
              }`}
            >
              {b.icon} {b.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title={t.unitPicker}>
        <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-400">
          <span>{t.team}</span>
          <select value={pickedTeam} onChange={(e) => actions.setPickedTeam(e.target.value as Team)} className="px-1.5 py-0.5 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200 max-w-[100px]">
            {teamOpt(pickedTeam)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {(Object.keys(UDEFS) as UnitType[]).map((ut) => (
            <button
              key={ut}
              onClick={() => actions.pickUnit(ut)}
              title={`${unitLabels[ut]} — ${UDEFS[ut].cost}🍫`}
              className={`px-1.5 py-1 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1 ${
                pickedType === ut ? 'border-accent-500 bg-ink-700 text-accent-300' : 'border-ink-600 bg-ink-900 text-slate-200 hover:border-accent-500'
              }`}
            >
              {ut}
              <span className="text-[9px] text-teamgold-300">{UDEFS[ut].cost === 0 ? '—' : UDEFS[ut].cost + '🍫'}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-400">
          <span>{t.maxHp}</span>
          <NumInput value={pickedMaxHp} onChange={(v) => actions.setPickedMaxHp(v)} min={1} max={99} />
        </div>
        <p className={`text-xs ${canAfford ? 'text-slate-400' : 'text-red-400'}`}>
          {cost === 0 ? (lang === 'ru' ? 'Бесплатно' : 'Free') : `${lang === 'ru' ? 'Стоимость' : 'Cost'}: ${cost}🍫 | ${lang === 'ru' ? 'Баланс' : 'Balance'}: ${bal.toFixed(1)}`}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">{lang === 'ru' ? UDEFS[pickedType].desc : UDEFS[pickedType].descEn}</p>
      </Card>

      <Card title={`${t.money} 🍫`}>
        <div className="flex gap-4 mb-2">
          <div>
            <div className="text-[10px] text-slate-400">{t.red}</div>
            <div className="text-lg font-semibold text-teamred-300">{redMoney.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">{t.yellow}</div>
            <div className="text-lg font-semibold text-teamgold-300">{yelMoney.toFixed(1)}</div>
          </div>
        </div>
        <div className="flex gap-1 items-center mb-2">
          <select value={moneyTeam} onChange={(e) => setMoneyTeam(e.target.value as Team)} className="px-1.5 py-0.5 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200">
            <option value="red">{t.red}</option>
            <option value="yellow">{t.yellow}</option>
          </select>
          <NumInput value={moneyAmt} onChange={setMoneyAmt} step={0.5} />
          <button onClick={() => actions.addMoney(moneyTeam, moneyAmt)} className="p-1 rounded-md bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 text-white transition-colors"><Plus size={14} /></button>
          <button onClick={() => actions.addMoney(moneyTeam, -moneyAmt)} className="p-1 rounded-md bg-teamred-800 hover:bg-teamred-700 border border-teamred-600 text-teamred-200 transition-colors"><Minus size={14} /></button>
        </div>
        <div className="text-[10px] text-slate-400 mb-1">📨 {t.transfer}:</div>
        <div className="flex gap-1 items-center flex-wrap">
          <select value={transferFrom} onChange={(e) => setTransferFrom(e.target.value as Team)} className="px-1 py-0.5 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200">
            <option value="red">{lang === 'ru' ? 'Крас.' : 'Red'}</option>
            <option value="yellow">{lang === 'ru' ? 'Жёлт.' : 'Yel.'}</option>
          </select>
          <ArrowRight size={12} className="text-slate-500" />
          <select value={transferTo} onChange={(e) => setTransferTo(e.target.value as Team)} className="px-1 py-0.5 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200">
            <option value="yellow">{lang === 'ru' ? 'Жёлт.' : 'Yel.'}</option>
            <option value="red">{lang === 'ru' ? 'Крас.' : 'Red'}</option>
          </select>
          <NumInput value={transferAmt} onChange={setTransferAmt} step={0.5} />
          <button onClick={() => actions.transfer(transferFrom, transferTo, transferAmt)} className="px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors">{t.transfer}</button>
        </div>
      </Card>

      <Card title={t.wCooldown}>
        <div className="flex flex-col gap-2 mb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{lang === 'ru' ? 'Красные:' : 'Red:'}</span>
            <span className={`font-semibold ${wCooldownRed > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{wCooldownRed}</span>
            <span className="text-slate-400">{lang === 'ru' ? 'ходов' : 'turns'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{lang === 'ru' ? 'Жёлтые:' : 'Yellow:'}</span>
            <span className={`font-semibold ${wCooldownYellow > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{wCooldownYellow}</span>
            <span className="text-slate-400">{lang === 'ru' ? 'ходов' : 'turns'}</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => actions.wcdSet('red', 5)} className="px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors">{lang === 'ru' ? 'R→5' : 'R→5'}</button>
          <button onClick={() => actions.wcdSet('yellow', 5)} className="px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors">{lang === 'ru' ? 'Y→5' : 'Y→5'}</button>
          <button onClick={() => actions.wcdSet('red', 0)} className="px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors">{lang === 'ru' ? 'R→0' : 'R→0'}</button>
          <button onClick={() => actions.wcdSet('yellow', 0)} className="px-2 py-1 text-xs rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-200 transition-colors">{lang === 'ru' ? 'Y→0' : 'Y→0'}</button>
        </div>
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

function MiniBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-1.5 py-1 text-[10px] rounded-md bg-ink-800 hover:bg-ink-700 border border-ink-600 text-slate-300 transition-colors">{label}</button>
  );
}

function NumInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(+e.target.value)} className="w-12 px-1.5 py-0.5 text-xs rounded-md bg-ink-900 border border-ink-600 text-slate-200" />
  );
}
