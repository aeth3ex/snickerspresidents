import { memo } from 'react';
import { Crown } from 'lucide-react';
import type { Cell, Mode, Unit } from '../game/types';
import { coordId, colLetter } from '../game/types';

interface Props {
  cols: number;
  rows: number;
  grid: Cell[][];
  mode: Mode;
  actionFrom: [number, number] | null;
  selCell: [number, number] | null;
  selIdx: number | null;
  onCellClick: (r: number, c: number) => void;
  onChipClick: (r: number, c: number, idx: number) => void;
}

const TERR_BG: Record<string, string> = {
  'red-t': 'bg-teamred-950/70',
  'yellow-t': 'bg-teamgold-950/70',
  'neutral-t': 'bg-ink-800/60',
};

function teamColor(u: Unit): string {
  return u.team === 'red' ? 'text-teamred-300' : u.team === 'yellow' ? 'text-teamgold-300' : 'text-slate-300';
}

function teamBorder(u: Unit): string {
  return u.team === 'red' ? 'border-l-2 border-l-teamred-500/60' : u.team === 'yellow' ? 'border-l-2 border-l-teamgold-500/60' : 'border-l-2 border-l-slate-500/40';
}

export const GameGrid = memo(function GameGrid({
  cols, rows, grid, mode, actionFrom, selCell, selIdx, onCellClick, onChipClick,
}: Props) {
  const gridCols = `20px repeat(${cols}, minmax(56px, 1fr))`;
  const gridRows = `18px repeat(${rows}, auto)`;

  return (
    <div className="bg-ink-850 border border-ink-700 rounded-xl p-2 overflow-auto scroll-thin">
      <div
        className="inline-grid no-select gap-px"
        style={{ gridTemplateColumns: gridCols, gridTemplateRows: gridRows, minWidth: `${20 + cols * 57}px` }}
      >
        {/* Top-left corner */}
        <div className="w-5 h-[18px]" />
        {/* Column headers */}
        {Array.from({ length: cols }, (_, c) => (
          <div key={`col-${c}`} className="flex items-center justify-center text-[9px] font-semibold text-slate-400 h-[18px]">
            {colLetter(c)}
          </div>
        ))}
        {/* Rows */}
        {Array.from({ length: rows }, (_, r) => (
          <RowFragment
            key={`row-${r}`}
            r={r}
            cols={cols}
            grid={grid}
            mode={mode}
            actionFrom={actionFrom}
            selCell={selCell}
            selIdx={selIdx}
            onCellClick={onCellClick}
            onChipClick={onChipClick}
          />
        ))}
      </div>
    </div>
  );
});

function RowFragment({
  r, cols, grid, actionFrom, selCell, selIdx, onCellClick, onChipClick,
}: {
  r: number;
  cols: number;
  grid: Cell[][];
  mode: Mode;
  actionFrom: [number, number] | null;
  selCell: [number, number] | null;
  selIdx: number | null;
  onCellClick: (r: number, c: number) => void;
  onChipClick: (r: number, c: number, idx: number) => void;
}) {
  return (
    <>
      <div className="flex items-start justify-center w-5 pt-1 text-[9px] font-semibold text-slate-400">{r + 1}</div>
      {Array.from({ length: cols }, (_, c) => {
        const cell = grid[r][c];
        const isFrom = actionFrom && actionFrom[0] === r && actionFrom[1] === c;
        return (
          <div
            key={`cell-${r}-${c}`}
            onClick={() => onCellClick(r, c)}
            className={`cell-hover relative flex flex-col items-stretch cursor-pointer px-1 py-0.5 min-h-[34px] ${TERR_BG[cell.territory]} ${
              isFrom ? 'outline outline-2 outline-accent-500 outline-offset-[-2px] z-10' : ''
            } ${cell.units.length >= 10 ? 'ring-1 ring-amber-500/40' : ''}`}
          >
            <span className="absolute top-0 left-0.5 text-[7px] text-white/20 leading-none">{coordId(r, c)}</span>
            <div className="flex flex-col gap-px mt-1.5">
              {cell.units.map((u, i) => (
                <button
                  key={u.id}
                  onClick={(e) => { e.stopPropagation(); onChipClick(r, c, i); }}
                  className={`flex items-center justify-between rounded px-1 py-px text-[11px] font-bold ${teamColor(u)} ${teamBorder(u)} ${
                    selCell && selCell[0] === r && selCell[1] === c && selIdx === i
                      ? 'bg-accent-500/25 border border-accent-400'
                      : 'bg-black/20 hover:bg-black/40 border border-transparent'
                  } transition-colors`}
                >
                  <span className="flex items-center gap-0.5">
                    {u.t === 'K' && <Crown size={9} className="text-teamgold-300" />}
                    {u.t}
                  </span>
                  <span className="text-[9px] font-normal opacity-80">{u.hp}/{u.maxhp}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
