import { useCallback, useMemo, useReducer } from 'react';
import type { Lang } from '../i18n';
import {
  type Cell,
  type GameEvent,
  type LogEntry,
  type Mode,
  type Team,
  type Territory,
  type Unit,
  type UnitType,
  MODE_INFO_BI,
  RULES,
  UDEFS,
  coordId,
  coordToRC,
  isOrthogonalAdjacent,
  isScoutMove,
  teamBalance,
  teamToTerritory,
  territoryToTeam,
  uid,
} from './types';

export interface AINote {
  id: string;
  text: string;
  createdTurn: number;
  updatedTurn: number;
}

export interface GameState {
  cols: number;
  rows: number;
  grid: Cell[][];
  mode: Mode;
  pickedType: UnitType;
  pickedTeam: Team;
  pickedMaxHp: number;
  turn: number;
  turnTeam: Team;
  redMoney: number;
  yelMoney: number;
  wCooldown: number;
  medicCooldowns: Record<string, number>;
  /** unit ids that already attacked this turn */
  actedUnits: Set<string>;
  log: LogEntry[];
  /** full turn-by-turn history, cleared by CLEAR_HISTORY */
  history: LogEntry[];
  events: GameEvent[];
  actionFrom: [number, number] | null;
  actionFromIdx: number | null;
  selCell: [number, number] | null;
  selIdx: number | null;
  info: string;
  news: string;
  playerMessage: string;
  aiMessage: string;
  /** ИИ личный блокнот */
  aiNotes: AINote[];
  /** флаг: игрок заглянул в блокнот ИИ с момента последнего JSON-экспорта */
  playerPeekedNotes: boolean;
  winner: Team | null;
  kingKilledTeam: Team | null;
  /** режим разработчика, разблокированный кодом 2003 */
  devMode: boolean;
  /** текущий язык интерфейса */
  lang: Lang;
}

type Action =
  | { type: 'SET_MODE'; mode: Mode }
  | { type: 'PICK_UNIT'; utype: UnitType }
  | { type: 'SET_PICKED_TEAM'; team: Team }
  | { type: 'SET_PICKED_MAXHP'; hp: number }
  | { type: 'REBUILD'; cols: number; rows: number }
  | { type: 'RESET_GRID' }
  | { type: 'RESET_GAME' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'FILL_ALL'; territory: Territory }
  | { type: 'FILL_HALF' }
  | { type: 'CELL_CLICK'; r: number; c: number }
  | { type: 'CHIP_CLICK'; r: number; c: number; idx: number }
  | { type: 'CLEAR_SEL' }
  | { type: 'EDIT_HP'; delta: number }
  | { type: 'EDIT_MAXHP'; delta: number }
  | { type: 'DELETE_SELECTED' }
  | { type: 'CAPTURE_CELL' }
  | { type: 'ADD_MONEY'; team: Team; amount: number }
  | { type: 'TRANSFER'; from: Team; to: Team; amount: number }
  | { type: 'WCD_SET'; value: number }
  | { type: 'NEXT_TURN' }
  | { type: 'PREV_TURN' }
  | { type: 'SET_NEWS'; text: string }
  | { type: 'SET_PLAYER_MSG'; text: string }
  | { type: 'ADD_EVENT'; text: string; expTurn: number | null }
  | { type: 'TOGGLE_EVENT'; idx: number }
  | { type: 'DELETE_EVENT'; idx: number }
  | { type: 'APPLY_AI'; resp: AIResponse }
  | { type: 'LOAD_STATE'; state: SavedState }
  | { type: 'CLEAR_LOG' }
  | { type: 'TOGGLE_DEV_MODE' }
  | { type: 'PLAYER_PEEK_NOTES' }
  | { type: 'RESET_PEEK_FLAG' }
  | { type: 'CONTINUE_AFTER_KING' }
  | { type: 'END_AFTER_KING' }
  | { type: 'SET_LANG'; lang: Lang };

export interface AIAction {
  type?: string;
  unit?: string;
  from?: string;
  to?: string;
  note?: string;
  /** notebook operations */
  noteId?: string;
  noteText?: string;
}

export interface AIResponse {
  message?: string;
  actions?: AIAction[];
  /** ИИ обновляет свой блокнот */
  notebookOps?: AINotebookOp[];
}

export interface AINotebookOp {
  op: 'add' | 'edit' | 'delete';
  id?: string;
  text?: string;
}

export interface SavedState {
  meta?: { turn?: number; activeTeam?: Team };
  money?: { red?: number; yellow?: number };
  wCooldown?: number;
  medicCooldowns?: Record<string, number>;
  map?: {
    cols?: number;
    rows?: number;
    grid?: { coord?: string; territory?: string; units?: { t: UnitType; hp: number; maxhp: number; team: Team }[] }[][];
  };
  news?: string;
  events?: { text: string; expiresOnTurn: number | null }[];
  aiNotes?: AINote[];
}

function initGrid(cols: number, rows: number): Cell[][] {
  const g: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    g[r] = [];
    for (let c = 0; c < cols; c++) {
      g[r][c] = { territory: 'neutral-t', units: [] };
    }
  }
  return g;
}

function fillHalfGrid(cols: number, rows: number): Cell[][] {
  const g = initGrid(cols, rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      g[r][c].territory = c < Math.floor(cols / 2) ? 'red-t' : 'yellow-t';
    }
  }
  return g;
}

function addLogEntry(log: LogEntry[], turn: number, text: string): LogEntry[] {
  const next = [...log, { turn, text }];
  return next.length > 300 ? next.slice(next.length - 300) : next;
}

function r01(v: number): number {
  return Math.round(v * 10) / 10;
}

function makeInitialState(): GameState {
  const cols = 8;
  const rows = 8;
  return {
    cols,
    rows,
    grid: fillHalfGrid(cols, rows),
    mode: 'paint-red',
    pickedType: 'B',
    pickedTeam: 'red',
    pickedMaxHp: UDEFS.B.maxhp,
    turn: 1,
    turnTeam: 'red',
    redMoney: 5,
    yelMoney: 5,
    wCooldown: 0,
    medicCooldowns: {},
    actedUnits: new Set(),
    log: [{ turn: 1, text: 'Game started' }],
    history: [{ turn: 1, text: 'Game started' }],
    events: [],
    actionFrom: null,
    actionFromIdx: null,
    selCell: null,
    selIdx: null,
    info: 'Выберите режим и действуйте',
    news: '',
    playerMessage: '',
    aiMessage: '— No response yet —',
    aiNotes: [],
    playerPeekedNotes: false,
    winner: null,
    kingKilledTeam: null,
    devMode: false,
    lang: (localStorage.getItem('sp-lang') as Lang) || 'ru',
  };
}

function canMoveTo(u: Unit, fr: number, fc: number, tr: number, tc: number): boolean {
  const def = UDEFS[u.t];
  if (def.moveRange === 1) return isOrthogonalAdjacent(fr, fc, tr, tc);
  return isScoutMove(fr, fc, tr, tc);
}

function cellHasEnemyDefender(cell: Cell, attackerTeam: Team): boolean {
  return cell.units.some((u) => u.t === 'E' && u.team !== attackerTeam && u.team !== 'neutral');
}

type MsgKey =
  | 'chooseMode' | 'noUnits' | 'alreadyYours' | 'transferSelf' | 'insufficientFunds'
  | 'devOn' | 'devOff' | 'cellLimit' | 'placeOwnTerritory' | 'notEnoughMoney'
  | 'unitPlaced' | 'clickUnitFirst' | 'clickAttackerFirst' | 'clickMedicFirst'
  | 'clickWhealerFirst' | 'defenderBlocksCell' | 'cellLimitBattle' | 'cannotAttack'
  | 'alreadyAttacked' | 'attackAdjacentOnly' | 'noUnitsOnCell' | 'cannotAttackAlly'
  | 'defenderBlocksAttack' | 'onlyMHeals' | 'mCooldown' | 'medicAdjacentOnly'
  | 'noUnitsToHeal' | 'medicSelfHeal' | 'fullHp' | 'onlyWHeals' | 'wCooldown'
  | 'unitSelected' | 'gridRebuilt' | 'medicCooldownEnd';

const MSG_RU: Record<MsgKey, string> = {
  chooseMode: 'Выберите режим и действуйте',
  noUnits: 'Нет юнитов',
  alreadyYours: 'уже ваша!',
  transferSelf: 'Нельзя передать самому себе',
  insufficientFunds: '⚠️ Недостаточно средств!',
  devOn: '🔓 Режим разработчика включён — все ограничения сняты',
  devOff: '🔒 Режим разработчика отключён',
  cellLimit: '⚠️ Лимит 10 юнитов!',
  placeOwnTerritory: '⚠️ Размещать только на своей территории',
  notEnoughMoney: '⚠️ Мало батончиков! Нужно',
  unitPlaced: 'Размещён',
  clickUnitFirst: 'Сначала кликни по юниту',
  clickAttackerFirst: 'Сначала кликни по атакующему',
  clickMedicFirst: 'Сначала кликни по M-медику',
  clickWhealerFirst: 'Сначала кликни по W-медику',
  defenderBlocksCell: '🛡 Защитник блокирует клетку!',
  cellLimitBattle: '⚠️ Лимит 10 юнитов на клетке!',
  cannotAttack: 'не может атаковать!',
  alreadyAttacked: 'уже атаковал в этот ход!',
  attackAdjacentOnly: '⚠️ Атака только по соседству, не по диагонали!',
  noUnitsOnCell: 'Нет юнитов на клетке',
  cannotAttackAlly: '⚠️ Нельзя атаковать союзника!',
  defenderBlocksAttack: '🛡 Защитник (E) блокирует атаку!',
  onlyMHeals: 'Только M-медик может лечить рядом',
  mCooldown: '⚠️ M на кулдауне! Ещё',
  medicAdjacentOnly: '⚠️ Медик лечит только рядом, не по диагонали!',
  noUnitsToHeal: 'Нет юнитов для лечения',
  medicSelfHeal: 'Медик не лечит сам себя!',
  fullHp: 'уже на полном HP',
  onlyWHeals: 'Только W может лечить дистанционно',
  wCooldown: '⚠️ W на кулдауне! Ещё',
  unitSelected: 'Выбран',
  gridRebuilt: 'Сетка перестроена',
  medicCooldownEnd: 'ходов',
};

const MSG_EN: Record<MsgKey, string> = {
  chooseMode: 'Choose a mode and act',
  noUnits: 'No units',
  alreadyYours: 'is already yours!',
  transferSelf: 'Cannot transfer to yourself',
  insufficientFunds: '⚠️ Insufficient funds!',
  devOn: '🔓 Developer mode on — all restrictions lifted',
  devOff: '🔒 Developer mode off',
  cellLimit: '⚠️ Limit 10 units!',
  placeOwnTerritory: '⚠️ Place only on your own territory',
  notEnoughMoney: '⚠️ Not enough Snickers! Need',
  unitPlaced: 'Placed',
  clickUnitFirst: 'Click a unit first',
  clickAttackerFirst: 'Click an attacker first',
  clickMedicFirst: 'Click an M-medic first',
  clickWhealerFirst: 'Click a W-medic first',
  defenderBlocksCell: '🛡 Defender blocks the cell!',
  cellLimitBattle: '⚠️ Limit 10 units per cell!',
  cannotAttack: 'cannot attack!',
  alreadyAttacked: 'already attacked this turn!',
  attackAdjacentOnly: '⚠️ Attack adjacent only, not diagonal!',
  noUnitsOnCell: 'No units on cell',
  cannotAttackAlly: '⚠️ Cannot attack an ally!',
  defenderBlocksAttack: '🛡 Defender (E) blocks the attack!',
  onlyMHeals: 'Only M-medic can heal adjacent',
  mCooldown: '⚠️ M on cooldown! ',
  medicAdjacentOnly: '⚠️ Medic heals adjacent only, not diagonal!',
  noUnitsToHeal: 'No units to heal',
  medicSelfHeal: 'Medic cannot heal itself!',
  fullHp: 'is already at full HP',
  onlyWHeals: 'Only W can heal remotely',
  wCooldown: '⚠️ W on cooldown! ',
  unitSelected: 'Selected',
  gridRebuilt: 'Grid rebuilt',
  medicCooldownEnd: 'turns',
};

function tr(state: GameState, key: MsgKey): string {
  return state.lang === 'en' ? MSG_EN[key] : MSG_RU[key];
}

function teamName(state: GameState, team: Team): string {
  if (state.lang === 'en') return team === 'red' ? 'Red' : team === 'yellow' ? 'Yellow' : 'Neutral';
  return team === 'red' ? 'Красные' : team === 'yellow' ? 'Жёлтые' : 'Нейтральные';
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode, actionFrom: null, actionFromIdx: null, info: MODE_INFO_BI[action.mode]?.[state.lang] ?? action.mode };

    case 'PICK_UNIT':
      return { ...state, pickedType: action.utype, pickedMaxHp: UDEFS[action.utype].maxhp };

    case 'SET_PICKED_TEAM':
      return { ...state, pickedTeam: action.team };

    case 'SET_PICKED_MAXHP':
      return { ...state, pickedMaxHp: Math.max(1, Math.min(99, action.hp)) };

    case 'REBUILD': {
      const cols = Math.max(3, Math.min(20, action.cols));
      const rows = Math.max(3, Math.min(20, action.rows));
      return { ...state, cols, rows, grid: initGrid(cols, rows), actionFrom: null, actionFromIdx: null, selCell: null, selIdx: null, info: `${tr(state, 'gridRebuilt')} ${cols}×${rows}` };
    }

    case 'RESET_GRID': {
      const g = initGrid(state.cols, state.rows);
      const msg = 'Карта очищена';
      return {
        ...state,
        grid: g,
        actionFrom: null,
        actionFromIdx: null,
        selCell: null,
        selIdx: null,
        log: addLogEntry(state.log, state.turn, msg),
        history: addLogEntry(state.history, state.turn, msg),
      };
    }

    case 'RESET_GAME': {
      const fresh = makeInitialState();
      return { ...fresh, aiNotes: state.aiNotes };
    }

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    case 'FILL_ALL': {
      const g = state.grid.map((row) => row.map((cell) => ({ ...cell, territory: action.territory })));
      return { ...state, grid: g };
    }

    case 'FILL_HALF': {
      const g = initGrid(state.cols, state.rows);
      for (let r = 0; r < state.rows; r++)
        for (let c = 0; c < state.cols; c++)
          g[r][c].territory = c < Math.floor(state.cols / 2) ? 'red-t' : 'yellow-t';
      return { ...state, grid: g };
    }

    case 'CELL_CLICK': {
      const { r, c } = action;
      const cell = state.grid[r][c];
      if (state.mode === 'paint-red') { const g = cloneGrid(state.grid); g[r][c].territory = 'red-t'; return { ...state, grid: g }; }
      if (state.mode === 'paint-yellow') { const g = cloneGrid(state.grid); g[r][c].territory = 'yellow-t'; return { ...state, grid: g }; }
      if (state.mode === 'paint-neutral') { const g = cloneGrid(state.grid); g[r][c].territory = 'neutral-t'; return { ...state, grid: g }; }
      if (state.mode === 'place-unit') return doPlaceUnit(state, r, c);
      if (state.mode === 'delete-unit') {
        if (cell.units.length === 0) return { ...state, info: `${tr(state, 'noUnits')} ${coordId(r, c)}` };
        const g = cloneGrid(state.grid);
        const u = g[r][c].units.pop()!;
        const msg = `Удалён ${u.t} с ${coordId(r, c)}`;
        return { ...state, grid: g, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
      }
      if (state.mode === 'move') return doMove(state, r, c);
      if (state.mode === 'attack') return doAttack(state, r, c);
      if (state.mode === 'heal') return doHeal(state, r, c);
      if (state.mode === 'wheal') return doWheal(state, r, c);
      return state;
    }

    case 'CHIP_CLICK':
      return doChipClick(state, action.r, action.c, action.idx);

    case 'CLEAR_SEL':
      return { ...state, selCell: null, selIdx: null, actionFrom: null, actionFromIdx: null };

    case 'EDIT_HP': {
      if (!state.selCell || state.selIdx === null) return state;
      const [r, c] = state.selCell;
      const g = cloneGrid(state.grid);
      const u = g[r][c].units[state.selIdx];
      if (!u) return state;
      u.hp = Math.max(0, Math.min(u.maxhp, u.hp + action.delta));
      if (u.hp <= 0) {
        const msg = `${u.t} умер на ${coordId(r, c)}`;
        g[r][c].units.splice(state.selIdx, 1);
        return { ...state, grid: g, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg), selCell: null, selIdx: null, actionFrom: null, actionFromIdx: null };
      }
      return { ...state, grid: g };
    }

    case 'EDIT_MAXHP': {
      if (!state.selCell || state.selIdx === null) return state;
      const [r, c] = state.selCell;
      const g = cloneGrid(state.grid);
      const u = g[r][c].units[state.selIdx];
      if (!u) return state;
      u.maxhp = Math.max(1, u.maxhp + action.delta);
      u.hp = Math.min(u.hp, u.maxhp);
      const msg = `${u.t} максHP→${u.maxhp}`;
      return { ...state, grid: g, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
    }

    case 'DELETE_SELECTED': {
      if (!state.selCell || state.selIdx === null) return state;
      const [r, c] = state.selCell;
      const g = cloneGrid(state.grid);
      const u = g[r][c].units.splice(state.selIdx, 1)[0];
      const msg = `Удалён ${u.t} с ${coordId(r, c)}`;
      return { ...state, grid: g, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg), selCell: null, selIdx: null, actionFrom: null, actionFromIdx: null };
    }

    case 'CAPTURE_CELL': {
      if (!state.selCell || state.selIdx === null) return state;
      const [r, c] = state.selCell;
      const g = cloneGrid(state.grid);
      const u = g[r][c].units[state.selIdx];
      if (!u) return state;
      const capTerr = teamToTerritory(u.team);
      if (g[r][c].territory === capTerr) return { ...state, info: `${coordId(r, c)} ${tr(state, 'alreadyYours')}` };
      g[r][c].territory = capTerr;
      const msg = `🏳️ ${u.t}(${u.team}) захватил ${coordId(r, c)}`;
      return { ...state, grid: g, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg), selCell: null, selIdx: null, actionFrom: null, actionFromIdx: null };
    }

    case 'ADD_MONEY': {
      const v = r01(action.amount);
      let redMoney = state.redMoney;
      let yelMoney = state.yelMoney;
      if (action.team === 'red') redMoney = r01(redMoney + v);
      else if (action.team === 'yellow') yelMoney = r01(yelMoney + v);
      const msg = `${action.team === 'red' ? '🔴' : '🟡'} ${v >= 0 ? '+' : ''}${v}🍫`;
      return { ...state, redMoney, yelMoney, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
    }

    case 'TRANSFER': {
      if (action.from === action.to) return { ...state, info: tr(state, 'transferSelf') };
      const amt = r01(action.amount);
      const bal = teamBalance(action.from, state.redMoney, state.yelMoney);
      if (bal < amt) return { ...state, info: tr(state, 'insufficientFunds') };
      let redMoney = state.redMoney;
      let yelMoney = state.yelMoney;
      if (action.from === 'red') { redMoney = r01(redMoney - amt); yelMoney = r01(yelMoney + amt); }
      else { yelMoney = r01(yelMoney - amt); redMoney = r01(redMoney + amt); }
      const msg = `📨 Передача ${action.from}→${action.to}: ${amt}🍫`;
      return { ...state, redMoney, yelMoney, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
    }

    case 'WCD_SET': {
      const msg = `W кд→${action.value}`;
      return { ...state, wCooldown: action.value, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
    }

    case 'NEXT_TURN': {
      let rd = 0, yd = 0;
      for (let r = 0; r < state.rows; r++)
        for (let c = 0; c < state.cols; c++)
          state.grid[r][c].units.forEach((u) => {
            if (u.t === 'D') { if (u.team === 'red') rd++; else if (u.team === 'yellow') yd++; }
          });
      const redMoney = r01(state.redMoney + rd * 0.5);
      const yelMoney = r01(state.yelMoney + yd * 0.5);
      const wCooldown = Math.max(0, state.wCooldown - 1);
      const medicCooldowns: Record<string, number> = {};
      for (const [id, cd] of Object.entries(state.medicCooldowns)) {
        if (cd > 1) medicCooldowns[id] = cd - 1;
      }
      const newTurn = state.turn + 1;
      const newTeam: Team = state.turnTeam === 'red' ? 'yellow' : 'red';
      const header = `═══ Turn ${newTurn} (${newTeam === 'red' ? 'Red' : 'Yellow'}) ═══`;
      let log = addLogEntry(state.log, newTurn, header);
      let history = addLogEntry(state.history, newTurn, header);
      state.events.forEach((ev) => {
        if (!ev.done && ev.expTurn && newTurn >= ev.expTurn) {
          const w = `⚠️ СОБЫТИЕ ИСТЕКЛО: ${ev.text}`;
          log = addLogEntry(log, newTurn, w);
          history = addLogEntry(history, newTurn, w);
        }
      });
      return {
        ...state,
        redMoney, yelMoney, wCooldown, medicCooldowns,
        actedUnits: new Set(),
        turn: newTurn, turnTeam: newTeam,
        log, history,
        actionFrom: null, actionFromIdx: null, selCell: null, selIdx: null,
        info: `${state.lang === 'en' ? 'Turn' : 'Ход'} ${newTurn} — ${teamName(state, newTeam)}`,
        playerPeekedNotes: false,
      };
    }

    case 'PREV_TURN': {
      if (state.turn <= 1) return state;
      const newTurn = state.turn - 1;
      const newTeam: Team = state.turnTeam === 'red' ? 'yellow' : 'red';
      return { ...state, turn: newTurn, turnTeam: newTeam, info: `${state.lang === 'en' ? 'Turn' : 'Ход'} ${newTurn} — ${teamName(state, newTeam)}` };
    }

    case 'SET_NEWS': return { ...state, news: action.text };
    case 'SET_PLAYER_MSG': return { ...state, playerMessage: action.text };

    case 'ADD_EVENT': {
      const ev: GameEvent = { id: uid(), text: action.text, expTurn: action.expTurn, done: false };
      return { ...state, events: [...state.events, ev] };
    }

    case 'TOGGLE_EVENT': {
      const events = state.events.map((ev, i) => i === action.idx ? { ...ev, done: !ev.done } : ev);
      return { ...state, events };
    }

    case 'DELETE_EVENT': {
      const events = state.events.filter((_, i) => i !== action.idx);
      return { ...state, events };
    }

    case 'APPLY_AI': {
      let s = { ...state, aiMessage: action.resp.message || '(Сообщение не указано)' };
      let log = s.log;
      let history = s.history;
      const acts = action.resp.actions ?? [];
      for (let i = 0; i < acts.length; i++) {
        const result = applyAIAction(s, acts[i], i + 1);
        s = result.state;
        log = result.log ?? s.log;
        history = result.history ?? s.history;
      }
      // Apply notebook ops
      let aiNotes = s.aiNotes;
      for (const op of (action.resp.notebookOps ?? [])) {
        aiNotes = applyNotebookOp(aiNotes, op, s.turn);
      }
      const m = state.lang === 'en' ? `🤖 AI response: ${acts.length} actions` : `🤖 Ответ ИИ: ${acts.length} действий`;
      log = addLogEntry(log, s.turn, m);
      history = addLogEntry(history, s.turn, m);
      return { ...s, log, history, aiNotes };
    }

    case 'LOAD_STATE':
      return loadState(state, action.state);

    case 'CLEAR_LOG':
      return { ...state, log: [] };

    case 'TOGGLE_DEV_MODE':
      return { ...state, devMode: !state.devMode, info: state.devMode ? tr(state, 'devOff') : tr(state, 'devOn') };

    case 'PLAYER_PEEK_NOTES':
      return { ...state, playerPeekedNotes: true };

    case 'RESET_PEEK_FLAG':
      return { ...state, playerPeekedNotes: false };

    case 'SET_LANG':
      return { ...state, lang: action.lang };

    case 'CONTINUE_AFTER_KING': {
      const killedTeam = state.kingKilledTeam;
      if (!killedTeam) return state;
      const logMsg = state.lang === 'en'
        ? `👑 King of ${killedTeam === 'red' ? 'Red' : 'Yellow'} was slain, but players chose to continue the game`
        : `👑 Король ${killedTeam === 'red' ? 'Красных' : 'Жёлтых'} погиб, но игроки решили продолжить игру`;
      return {
        ...state,
        kingKilledTeam: null,
        log: addLogEntry(state.log, state.turn, logMsg),
        history: addLogEntry(state.history, state.turn, logMsg),
      };
    }

    case 'END_AFTER_KING': {
      const killedTeam = state.kingKilledTeam;
      if (!killedTeam) return state;
      const winner = killedTeam === 'red' ? 'yellow' : 'red' as Team;
      const logMsg = state.lang === 'en'
        ? `👑 King of ${killedTeam === 'red' ? 'Red' : 'Yellow'} was slain — ${winner === 'red' ? 'Red' : 'Yellow'} wins!`
        : `👑 Король ${killedTeam === 'red' ? 'Красных' : 'Жёлтых'} погиб — ${winner === 'red' ? 'Красные' : 'Жёлтые'} побеждают!`;
      return {
        ...state,
        kingKilledTeam: null,
        winner,
        log: addLogEntry(state.log, state.turn, logMsg),
        history: addLogEntry(state.history, state.turn, logMsg),
      };
    }

    default:
      return state;
  }
}

// ─── Helpers ─────────────────────────────────────────────

function cloneGrid(g: Cell[][]): Cell[][] {
  return g.map((row) => row.map((cell) => ({ ...cell, units: cell.units.map((u) => ({ ...u })) })));
}

function doPlaceUnit(state: GameState, r: number, c: number): GameState {
  const cell = state.grid[r][c];
  if (!state.devMode && cell.units.length >= 10) return { ...state, info: tr(state, 'cellLimit') };
  const team = state.pickedTeam;
  const cellTeam = territoryToTeam(cell.territory);
  if (!state.devMode && team !== 'neutral' && cellTeam !== team)
    return { ...state, info: `${tr(state, 'placeOwnTerritory')} (${teamName(state, team)})` };
  const maxhp = state.pickedMaxHp || UDEFS[state.pickedType].maxhp;
  const cost = UDEFS[state.pickedType].cost;
  let redMoney = state.redMoney;
  let yelMoney = state.yelMoney;
  if (!state.devMode && cost > 0) {
    if (team === 'red' && redMoney < cost) return { ...state, info: `${tr(state, 'notEnoughMoney')} ${cost}` };
    if (team === 'yellow' && yelMoney < cost) return { ...state, info: `${tr(state, 'notEnoughMoney')} ${cost}` };
  }
  if (cost > 0) {
    if (team === 'red') redMoney = r01(redMoney - cost);
    else if (team === 'yellow') yelMoney = r01(yelMoney - cost);
  }
  const g = cloneGrid(state.grid);
  g[r][c].units.push({ id: uid(), t: state.pickedType, hp: maxhp, maxhp, team });
  const msg = `Разм. ${state.pickedType}(${team}) ${maxhp}/${maxhp} → ${coordId(r, c)}${cost > 0 ? ` [−${cost}🍫]` : ''}`;
  return { ...state, grid: g, redMoney, yelMoney, info: `${tr(state, 'unitPlaced')} ${state.pickedType} ${state.lang === 'en' ? 'on' : 'на'} ${coordId(r, c)}`, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
}

function doMove(state: GameState, r: number, c: number): GameState {
  if (!state.actionFrom || state.actionFromIdx === null) return { ...state, info: tr(state, 'clickUnitFirst') };
  const [fr, fc] = state.actionFrom;
  const fi = state.actionFromIdx;
  if (fr === r && fc === c) return { ...state, actionFrom: null, actionFromIdx: null, selCell: null, selIdx: null };
  const u = state.grid[fr][fc].units[fi];
  if (!u) return state;
  if (!state.devMode && !canMoveTo(u, fr, fc, r, c)) {
    const def = UDEFS[u.t];
    return { ...state, info: `⚠️ ${u.t} ${state.lang === 'en' ? 'moves only' : 'ходит только'} ${def.moveRange === 1 ? (state.lang === 'en' ? '1 cell (not diagonal)' : 'на 1 клетку (не по диагонали)') : (state.lang === 'en' ? 'up to 2 cells' : 'до 2 клеток')}!` };
  }
  if (!state.devMode && cellHasEnemyDefender(state.grid[r][c], u.team) && u.t !== 'R')
    return { ...state, info: tr(state, 'defenderBlocksCell') };
  if (!state.devMode && state.grid[r][c].units.length >= 10) return { ...state, info: tr(state, 'cellLimitBattle') };
  const g = cloneGrid(state.grid);
  const moved = g[fr][fc].units.splice(fi, 1)[0];
  g[r][c].units.push(moved);
  const msg = `${u.t} ${coordId(fr, fc)}→${coordId(r, c)}`;
  return { ...state, grid: g, actionFrom: null, actionFromIdx: null, selCell: null, selIdx: null, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
}

function doAttack(state: GameState, r: number, c: number): GameState {
  if (!state.actionFrom || state.actionFromIdx === null) return { ...state, info: tr(state, 'clickAttackerFirst') };
  const [fr, fc] = state.actionFrom;
  const fi = state.actionFromIdx;
  const atk = state.grid[fr][fc].units[fi];
  if (!atk) return state;
  if (!UDEFS[atk.t].canAttack) return { ...state, info: `⚠️ ${atk.t} ${tr(state, 'cannotAttack')}` };
  // Per-turn attack limit (1 attack per unit per turn), bypassed in devMode
  if (!state.devMode && state.actedUnits.has(atk.id))
    return { ...state, info: `⚠️ ${atk.t} ${tr(state, 'alreadyAttacked')}` };
  if (!state.devMode && !isOrthogonalAdjacent(fr, fc, r, c))
    return { ...state, info: tr(state, 'attackAdjacentOnly') };
  const tgtCell = state.grid[r][c];
  if (tgtCell.units.length === 0) return { ...state, info: `${tr(state, 'noUnitsOnCell')} ${coordId(r, c)}` };
  const enemy = tgtCell.units[tgtCell.units.length - 1];
  if (enemy.team === atk.team) return { ...state, info: tr(state, 'cannotAttackAlly') };
  if (!state.devMode && enemy.t === 'E')
    return { ...state, info: tr(state, 'defenderBlocksAttack'), actionFrom: null, actionFromIdx: null, selCell: null, selIdx: null };
  const g = cloneGrid(state.grid);
  const e = g[r][c].units[g[r][c].units.length - 1];
  e.hp -= 1;
  const newActed = new Set(state.actedUnits);
  newActed.add(atk.id);
  let log = addLogEntry(state.log, state.turn, `⚔️ ${atk.t}(${atk.team})→${e.t}(${e.team}) на ${coordId(r, c)} → ${e.hp}/${e.maxhp}`);
  let history = addLogEntry(state.history, state.turn, `⚔️ ${atk.t}(${atk.team})→${e.t}(${e.team}) на ${coordId(r, c)} → ${e.hp}/${e.maxhp}`);
  let winner = state.winner;
  let kingKilledTeam = state.kingKilledTeam;
  if (e.hp <= 0) {
    const kill = `💀 ${e.t} ${state.lang === 'en' ? 'destroyed at' : 'уничтожен на'} ${coordId(r, c)}`;
    log = addLogEntry(log, state.turn, kill);
    history = addLogEntry(history, state.turn, kill);
    g[r][c].units.splice(g[r][c].units.indexOf(e), 1);
    if (e.t === 'K') {
      const kingMsg = state.lang === 'en'
        ? `👑💀 King of ${e.team === 'red' ? 'Red' : 'Yellow'} was slain!`
        : `👑💀 КОРОЛЬ ${e.team === 'red' ? 'КРАСНЫХ' : 'ЖЁЛТЫХ'} УБИТ!`;
      log = addLogEntry(log, state.turn, kingMsg);
      history = addLogEntry(history, state.turn, kingMsg);
      kingKilledTeam = e.team;
    }
  }
  return { ...state, grid: g, log, history, winner, kingKilledTeam, actedUnits: newActed, actionFrom: null, actionFromIdx: null, selCell: null, selIdx: null };
}

function doHeal(state: GameState, r: number, c: number): GameState {
  if (!state.actionFrom || state.actionFromIdx === null) return { ...state, info: tr(state, 'clickMedicFirst') };
  const [fr, fc] = state.actionFrom;
  const fi = state.actionFromIdx;
  const medic = state.grid[fr][fc].units[fi];
  if (!medic || medic.t !== 'M') return { ...state, info: tr(state, 'onlyMHeals') };
  if (!state.devMode && (state.medicCooldowns[medic.id] ?? 0) > 0)
    return { ...state, info: `${tr(state, 'mCooldown')} ${state.medicCooldowns[medic.id]} ${tr(state, 'medicCooldownEnd')}` };
  if (!state.devMode && !isOrthogonalAdjacent(fr, fc, r, c))
    return { ...state, info: tr(state, 'medicAdjacentOnly') };
  if (state.grid[r][c].units.length === 0) return { ...state, info: `${tr(state, 'noUnitsOnCell')} ${coordId(r, c)}` };
  const target = state.grid[r][c].units[state.grid[r][c].units.length - 1];
  if (target === medic) return { ...state, info: tr(state, 'medicSelfHeal') };
  if (target.hp >= target.maxhp) return { ...state, info: `${target.t} ${tr(state, 'fullHp')}` };
  const g = cloneGrid(state.grid);
  const t = g[r][c].units[g[r][c].units.length - 1];
  t.hp = Math.min(t.maxhp, t.hp + 1);
  const msg = `💊 M лечит ${t.t} → ${t.hp}/${t.maxhp} на ${coordId(r, c)}`;
  return { ...state, grid: g, medicCooldowns: { ...state.medicCooldowns, [medic.id]: 2 }, actionFrom: null, actionFromIdx: null, selCell: null, selIdx: null, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
}

function doWheal(state: GameState, r: number, c: number): GameState {
  if (!state.actionFrom || state.actionFromIdx === null) return { ...state, info: tr(state, 'clickWhealerFirst') };
  if (!state.devMode && state.wCooldown > 0) return { ...state, info: `${tr(state, 'wCooldown')} ${state.wCooldown} ${tr(state, 'medicCooldownEnd')}` };
  const wmed = state.grid[state.actionFrom[0]][state.actionFrom[1]].units[state.actionFromIdx];
  if (!wmed || wmed.t !== 'W') return { ...state, info: tr(state, 'onlyWHeals') };
  if (state.grid[r][c].units.length === 0) return { ...state, info: `${tr(state, 'noUnitsOnCell')} ${coordId(r, c)}` };
  const target = state.grid[r][c].units[state.grid[r][c].units.length - 1];
  if (target.hp >= target.maxhp) return { ...state, info: `${target.t} ${tr(state, 'fullHp')}` };
  const g = cloneGrid(state.grid);
  const t = g[r][c].units[g[r][c].units.length - 1];
  t.hp = Math.min(t.maxhp, t.hp + 1);
  const msg = `📡 W дист. лечит ${t.t} → ${t.hp}/${t.maxhp} | кд→5`;
  return { ...state, grid: g, wCooldown: 5, actionFrom: null, actionFromIdx: null, selCell: null, selIdx: null, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
}

function doChipClick(state: GameState, r: number, c: number, idx: number): GameState {
  const u = state.grid[r][c].units[idx];
  if (!u) return state;
  if (state.mode === 'delete-unit') {
    const g = cloneGrid(state.grid);
    g[r][c].units.splice(idx, 1);
    const msg = `Удалён ${u.t} с ${coordId(r, c)}`;
    return { ...state, grid: g, selCell: null, selIdx: null, log: addLogEntry(state.log, state.turn, msg), history: addLogEntry(state.history, state.turn, msg) };
  }
  if (state.actionFrom && state.actionFromIdx !== null && ['move', 'attack', 'heal', 'wheal'].includes(state.mode)) {
    if (state.mode === 'move') return doMove(state, r, c);
    if (state.mode === 'attack') return doAttack(state, r, c);
    if (state.mode === 'heal') return doHeal(state, r, c);
    if (state.mode === 'wheal') return doWheal(state, r, c);
  }
  const selecting = ['move', 'attack', 'heal', 'wheal', 'capture'].includes(state.mode);
  return {
    ...state,
    actionFrom: selecting ? [r, c] : null,
    actionFromIdx: selecting ? idx : null,
    selCell: [r, c],
    selIdx: idx,
    info: `${tr(state, 'unitSelected')} ${u.hp}/${u.maxhp}${u.t} ${state.lang === 'en' ? 'at' : 'на'} ${coordId(r, c)}${selecting ? (state.lang === 'en' ? '. Click a target.' : '. Кликни на цель.') : ''}`,
  };
}

// ─── AI notebook ops ─────────────────────────────────────

function applyNotebookOp(notes: AINote[], op: AINotebookOp, turn: number): AINote[] {
  if (op.op === 'add') {
    return [...notes, { id: uid(), text: op.text ?? '', createdTurn: turn, updatedTurn: turn }];
  }
  if (op.op === 'edit' && op.id) {
    return notes.map((n) => n.id === op.id ? { ...n, text: op.text ?? n.text, updatedTurn: turn } : n);
  }
  if (op.op === 'delete' && op.id) {
    return notes.filter((n) => n.id !== op.id);
  }
  return notes;
}

// ─── AI action executor ───────────────────────────────────

function applyAIAction(state: GameState, act: AIAction, num: number): { state: GameState; log?: LogEntry[]; history?: LogEntry[] } {
  const type = act.type ?? '';
  const note = act.note ? ` (${act.note})` : '';
  let s = state;
  let log = state.log;
  let history = state.history;

  if (type === 'pass') { log = addLogEntry(log, s.turn, `🤖 ${num}: пропуск${note}`); history = addLogEntry(history, s.turn, `🤖 ${num}: пропуск${note}`); return { state: s, log, history }; }
  if (type === 'diplomacy') { log = addLogEntry(log, s.turn, `🤖 Дипломатия${note}`); history = addLogEntry(history, s.turn, `🤖 Дипломатия${note}`); return { state: s, log, history }; }

  if (type === 'move') {
    const from = coordToRC(act.from ?? ''); const to = coordToRC(act.to ?? '');
    if (!from || !to) { log = addLogEntry(log, s.turn, `🤖 ${num}: некорректные координаты move`); return { state: s, log, history }; }
    const [fr, fc] = from; const [tr, tc] = to;
    const unit = s.grid[fr][fc].units.find((u) => u.t === (act.unit as UnitType));
    if (!unit) { log = addLogEntry(log, s.turn, `🤖 ${num}: юнит ${act.unit} не найден на ${act.from}`); return { state: s, log, history }; }
    if (s.grid[tr][tc].units.length >= 10) { log = addLogEntry(log, s.turn, `🤖 ${num}: лимит на ${act.to}`); return { state: s, log, history }; }
    const g = cloneGrid(s.grid);
    const idx = g[fr][fc].units.findIndex((u) => u.id === unit.id);
    const moved = g[fr][fc].units.splice(idx, 1)[0];
    g[tr][tc].units.push(moved);
    s = { ...s, grid: g };
    const m = `🤖 ${num}: move ${act.unit} ${act.from}→${act.to}${note}`;
    log = addLogEntry(log, s.turn, m); history = addLogEntry(history, s.turn, m);
    return { state: s, log, history };
  }

  if (type === 'attack') {
    const from = coordToRC(act.from ?? ''); const to = coordToRC(act.to ?? '');
    if (!from || !to) return { state: s, log, history };
    const [fr, fc] = from; const [tr, tc] = to;
    const atk = s.grid[fr][fc].units.find((u) => u.t === (act.unit as UnitType));
    if (!atk) { log = addLogEntry(log, s.turn, `🤖 ${num}: атакующий не найден`); return { state: s, log, history }; }
    const tgt = s.grid[tr][tc];
    if (tgt.units.length === 0) { log = addLogEntry(log, s.turn, `🤖 ${num}: цель пуста ${act.to}`); return { state: s, log, history }; }
    const enemy = tgt.units[tgt.units.length - 1];
    if (enemy.t === 'E') { log = addLogEntry(log, s.turn, `🤖 ${num}: Защитник заблокировал на ${act.to}`); return { state: s, log, history }; }
    const g = cloneGrid(s.grid);
    const e = g[tr][tc].units[g[tr][tc].units.length - 1];
    e.hp -= 1;
    const m = `🤖 ${num}: attack ${atk.t}→${e.t} ${act.to} → ${e.hp}/${e.maxhp}${note}`;
    log = addLogEntry(log, s.turn, m); history = addLogEntry(history, s.turn, m);
    if (e.hp <= 0) {
      g[tr][tc].units.splice(g[tr][tc].units.indexOf(e), 1);
      const kill = `🤖 ${e.t} ${s.lang === 'en' ? 'destroyed at' : 'уничтожен на'} ${act.to}`;
      log = addLogEntry(log, s.turn, kill); history = addLogEntry(history, s.turn, kill);
      if (e.t === 'K') {
        const end = s.lang === 'en'
          ? `👑💀 King of ${e.team === 'red' ? 'Red' : 'Yellow'} was slain!`
          : `👑💀 КОРОЛЬ ${e.team === 'red' ? 'КРАСНЫХ' : 'ЖЁЛТЫХ'} УБИТ!`;
        log = addLogEntry(log, s.turn, end); history = addLogEntry(history, s.turn, end);
        s = { ...s, kingKilledTeam: e.team };
      }
    }
    s = { ...s, grid: g };
    return { state: s, log, history };
  }

  if (type === 'heal') {
    const to = coordToRC(act.to ?? ''); if (!to) return { state: s, log, history };
    const [tr, tc] = to;
    if (s.grid[tr][tc].units.length === 0) return { state: s, log, history };
    const g = cloneGrid(s.grid);
    const t = g[tr][tc].units[g[tr][tc].units.length - 1];
    t.hp = Math.min(t.maxhp, t.hp + 1);
    s = { ...s, grid: g };
    const m = `🤖 ${num}: heal ${t.t} → ${t.hp}/${t.maxhp}${note}`;
    log = addLogEntry(log, s.turn, m); history = addLogEntry(history, s.turn, m);
    return { state: s, log, history };
  }

  if (type === 'wheal') {
    const to = coordToRC(act.to ?? ''); if (!to) return { state: s, log, history };
    if (s.wCooldown > 0) { log = addLogEntry(log, s.turn, `🤖 ${num}: W на кулдауне!`); return { state: s, log, history }; }
    const [tr, tc] = to;
    if (s.grid[tr][tc].units.length === 0) return { state: s, log, history };
    const g = cloneGrid(s.grid);
    const t = g[tr][tc].units[g[tr][tc].units.length - 1];
    t.hp = Math.min(t.maxhp, t.hp + 1);
    s = { ...s, grid: g, wCooldown: 5 };
    const m = `🤖 ${num}: wheal ${t.t} → ${t.hp}/${t.maxhp}${note}`;
    log = addLogEntry(log, s.turn, m); history = addLogEntry(history, s.turn, m);
    return { state: s, log, history };
  }

  if (type === 'capture') {
    const at = coordToRC(act.from ?? act.to ?? ''); if (!at) return { state: s, log, history };
    const [ar, ac] = at;
    const unit = s.grid[ar][ac].units.find((u) => u.t === (act.unit as UnitType));
    if (!unit) return { state: s, log, history };
    const g = cloneGrid(s.grid);
    g[ar][ac].territory = unit.team === 'red' ? 'red-t' : 'yellow-t';
    s = { ...s, grid: g };
    const m = `🤖 ${num}: capture ${coordId(ar, ac)}(${act.unit})${note}`;
    log = addLogEntry(log, s.turn, m); history = addLogEntry(history, s.turn, m);
    return { state: s, log, history };
  }

  if (type === 'spawn') {
    const at = coordToRC(act.to ?? act.from ?? ''); if (!at) return { state: s, log, history };
    const utype = (act.unit as UnitType) || 'B';
    const udef = UDEFS[utype] ?? UDEFS.B;
    const team = s.turnTeam;
    const cost = udef.cost;
    const bal = teamBalance(team, s.redMoney, s.yelMoney);
    if (cost > 0 && bal < cost) { log = addLogEntry(log, s.turn, `🤖 ${num}: не хватает денег для ${utype}`); return { state: s, log, history }; }
    let redMoney = s.redMoney, yelMoney = s.yelMoney;
    if (cost > 0) { if (team === 'red') redMoney = r01(redMoney - cost); else yelMoney = r01(yelMoney - cost); }
    const g = cloneGrid(s.grid);
    g[at[0]][at[1]].units.push({ id: uid(), t: utype, hp: udef.maxhp, maxhp: udef.maxhp, team });
    s = { ...s, grid: g, redMoney, yelMoney };
    const m = `🤖 ${num}: spawn ${utype} на ${coordId(at[0], at[1])}${cost > 0 ? ` [−${cost}🍫]` : ''}${note}`;
    log = addLogEntry(log, s.turn, m); history = addLogEntry(history, s.turn, m);
    return { state: s, log, history };
  }

  log = addLogEntry(log, s.turn, `🤖 ${num}: неизвестный тип: ${type}`);
  return { state: s, log, history };
}

function loadState(state: GameState, sv: SavedState): GameState {
  let turn = state.turn, turnTeam = state.turnTeam, redMoney = state.redMoney, yelMoney = state.yelMoney;
  let wCooldown = state.wCooldown, medicCooldowns = state.medicCooldowns, cols = state.cols, rows = state.rows;
  let grid = state.grid, news = state.news, events = state.events, aiNotes = state.aiNotes;

  if (sv.meta) { turn = sv.meta.turn ?? turn; turnTeam = sv.meta.activeTeam ?? turnTeam; }
  if (sv.money) { redMoney = sv.money.red ?? redMoney; yelMoney = sv.money.yellow ?? yelMoney; }
  if (sv.wCooldown !== undefined) wCooldown = sv.wCooldown;
  if (sv.medicCooldowns) medicCooldowns = sv.medicCooldowns;
  if (sv.map) {
    cols = sv.map.cols ?? cols; rows = sv.map.rows ?? rows;
    const g = initGrid(cols, rows);
    sv.map.grid?.forEach((row, r) => row.forEach((cell, c) => {
      g[r][c].territory = cell.territory === 'red' ? 'red-t' : cell.territory === 'yellow' ? 'yellow-t' : 'neutral-t';
      g[r][c].units = (cell.units ?? []).map((u) => ({ id: uid(), t: u.t, hp: u.hp, maxhp: u.maxhp, team: u.team }));
    }));
    grid = g;
  }
  if (sv.news !== undefined) news = sv.news;
  if (sv.events) events = sv.events.map((e, i) => ({ id: String(i), text: e.text, expTurn: e.expiresOnTurn ?? null, done: false }));
  if (sv.aiNotes) aiNotes = sv.aiNotes;
  const msg = state.lang === 'en' ? `📂 State loaded: turn ${turn}` : `📂 Состояние загружено: ход ${turn}`;
  return { ...state, turn, turnTeam, redMoney, yelMoney, wCooldown, medicCooldowns, cols, rows, grid, news, events, aiNotes, info: msg, log: addLogEntry(state.log, turn, msg), history: addLogEntry(state.history, turn, msg) };
}

// ─── Hook ────────────────────────────────────────────────

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  const actions = useMemo(() => ({
    setMode: (mode: Mode) => dispatch({ type: 'SET_MODE', mode }),
    pickUnit: (utype: UnitType) => dispatch({ type: 'PICK_UNIT', utype }),
    setPickedTeam: (team: Team) => dispatch({ type: 'SET_PICKED_TEAM', team }),
    setPickedMaxHp: (hp: number) => dispatch({ type: 'SET_PICKED_MAXHP', hp }),
    rebuild: (cols: number, rows: number) => dispatch({ type: 'REBUILD', cols, rows }),
    resetGrid: () => dispatch({ type: 'RESET_GRID' }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    clearHistory: () => dispatch({ type: 'CLEAR_HISTORY' }),
    fillAll: (territory: Territory) => dispatch({ type: 'FILL_ALL', territory }),
    fillHalf: () => dispatch({ type: 'FILL_HALF' }),
    cellClick: (r: number, c: number) => dispatch({ type: 'CELL_CLICK', r, c }),
    chipClick: (r: number, c: number, idx: number) => dispatch({ type: 'CHIP_CLICK', r, c, idx }),
    clearSel: () => dispatch({ type: 'CLEAR_SEL' }),
    editHp: (delta: number) => dispatch({ type: 'EDIT_HP', delta }),
    editMaxHp: (delta: number) => dispatch({ type: 'EDIT_MAXHP', delta }),
    deleteSelected: () => dispatch({ type: 'DELETE_SELECTED' }),
    captureCell: () => dispatch({ type: 'CAPTURE_CELL' }),
    addMoney: (team: Team, amount: number) => dispatch({ type: 'ADD_MONEY', team, amount }),
    transfer: (from: Team, to: Team, amount: number) => dispatch({ type: 'TRANSFER', from, to, amount }),
    wcdSet: (value: number) => dispatch({ type: 'WCD_SET', value }),
    nextTurn: () => dispatch({ type: 'NEXT_TURN' }),
    prevTurn: () => dispatch({ type: 'PREV_TURN' }),
    setNews: (text: string) => dispatch({ type: 'SET_NEWS', text }),
    setPlayerMsg: (text: string) => dispatch({ type: 'SET_PLAYER_MSG', text }),
    addEvent: (text: string, expTurn: number | null) => dispatch({ type: 'ADD_EVENT', text, expTurn }),
    toggleEvent: (idx: number) => dispatch({ type: 'TOGGLE_EVENT', idx }),
    deleteEvent: (idx: number) => dispatch({ type: 'DELETE_EVENT', idx }),
    applyAI: (resp: AIResponse) => dispatch({ type: 'APPLY_AI', resp }),
    loadState: (sv: SavedState) => dispatch({ type: 'LOAD_STATE', state: sv }),
    clearLog: () => dispatch({ type: 'CLEAR_LOG' }),
    toggleDevMode: () => dispatch({ type: 'TOGGLE_DEV_MODE' }),
    playerPeekNotes: () => dispatch({ type: 'PLAYER_PEEK_NOTES' }),
    resetPeekFlag: () => dispatch({ type: 'RESET_PEEK_FLAG' }),
    continueAfterKing: () => dispatch({ type: 'CONTINUE_AFTER_KING' }),
    endAfterKing: () => dispatch({ type: 'END_AFTER_KING' }),
    setLang: (lang: Lang) => {
      localStorage.setItem('sp-lang', lang);
      dispatch({ type: 'SET_LANG', lang });
    },
  }), [dispatch]);

  const buildGameStateJson = useCallback((lang: Lang) => buildExportJson(state, lang), [state]);
  const buildTextExport = useCallback(() => buildExportText(state), [state]);
  const buildHistoryFile = useCallback(() => buildHistoryJson(state), [state]);

  return { state, actions, buildGameStateJson, buildTextExport, buildHistoryFile };
}

// ─── Export helpers ──────────────────────────────────────

function buildExportJson(state: GameState, lang: Lang) {
  const mapGrid = state.grid.map((row, r) =>
    row.map((cell, c) => ({
      coord: coordId(r, c),
      territory: territoryToTeam(cell.territory),
      units: cell.units.map((u) => ({ t: u.t, hp: u.hp, maxhp: u.maxhp, team: u.team })),
    }))
  );
  return {
    meta: {
      game: 'Snickers Presidents',
      turn: state.turn,
      activeTeam: state.turnTeam,
      activeTeamName: state.turnTeam === 'red' ? 'Red' : 'Yellow',
      devMode: state.devMode,
      language: lang,
    },
    money: { red: state.redMoney, yellow: state.yelMoney },
    wCooldown: state.wCooldown,
    map: { cols: state.cols, rows: state.rows, grid: mapGrid },
    news: state.news,
    playerMessage: state.playerMessage,
    playerPeekedYourNotes: state.playerPeekedNotes,
    events: state.events.filter((e) => !e.done).map((e) => ({ text: e.text, expiresOnTurn: e.expTurn })),
    /** Личный блокнот ИИ — доступен только ИИ, игрок узнаёт содержимое через playerPeekedYourNotes */
    aiNotebook: state.aiNotes.map((n) => ({ id: n.id, text: n.text, createdTurn: n.createdTurn, updatedTurn: n.updatedTurn })),
    recentLog: state.log.slice(-20).map((l) => `[${l.turn}] ${l.text}`),
    rules: RULES,
    responseSchema: {
      _instructions: `Respond ONLY with this JSON structure. Write "message" in ${lang === 'ru' ? 'Russian' : 'English'}. Use English for action type/unit/coord values.`,
      message: `string — your message to the game master in ${lang === 'ru' ? 'Russian' : 'English'}`,
      actions: 'array of up to 5 action objects',
      actionFormat: { type: 'move|attack|heal|wheal|capture|spawn|pass|diplomacy', unit: 'B,K,M,W,D,E,R', from: 'source coord e.g. A1', to: 'target coord e.g. B2', note: `optional short comment in ${lang === 'ru' ? 'Russian' : 'English'}` },
      notebookOps: 'array — manage your private notes to avoid forgetting between turns',
      notebookOpFormat: {
        _note: 'You can add, edit or delete notes in your private notebook. Use this to remember plans, diplomacy, threats, unit positions.',
        op: 'add|edit|delete',
        id: 'note id (required for edit/delete)',
        text: 'note content (required for add/edit)',
      },
    },
  };
}

function buildHistoryJson(state: GameState) {
  return {
    meta: { game: 'Snickers Presidents', exportTime: new Date().toISOString(), totalTurns: state.turn },
    fullHistory: state.history,
  };
}

function buildExportText(state: GameState) {
  const lines: string[] = [
    `=== SNICKERS PRESIDENTS | Turn ${state.turn} | ${state.turnTeam === 'red' ? 'Red' : 'Yellow'} ===`,
    `Money: Red=${state.redMoney.toFixed(1)} | Yellow=${state.yelMoney.toFixed(1)} | W-CD=${state.wCooldown}`,
    '',
  ];
  if (state.news) lines.push(`NEWS: ${state.news}`, '');
  if (state.playerMessage) lines.push(`MESSAGE: ${state.playerMessage}`, '');
  const activeEvents = state.events.filter((e) => !e.done);
  if (activeEvents.length) lines.push(`EVENTS: ${activeEvents.map((e) => e.text + (e.expTurn ? ` (turn ${e.expTurn})` : '')).join(' | ')}`, '');
  let hdr = '   ';
  for (let c = 0; c < state.cols; c++) hdr += String.fromCharCode(65 + c).padEnd(10);
  lines.push(hdr);
  for (let r = 0; r < state.rows; r++) {
    let row = String(r + 1).padStart(2) + ' ';
    for (let c = 0; c < state.cols; c++) {
      const d = state.grid[r][c];
      const terr = d.territory === 'red-t' ? 'R' : d.territory === 'yellow-t' ? 'Y' : 'N';
      if (d.units.length === 0) { row += `[${terr}        ]`; }
      else {
        const us = d.units.map((u) => `${u.hp}/${u.maxhp}${u.t}${u.team === 'red' ? 'r' : u.team === 'yellow' ? 'y' : 'g'}`).join(',');
        row += `[${terr} ${us.length > 8 ? us.slice(0, 8) + '…' : us.padEnd(8)}]`;
      }
    }
    lines.push(row);
  }
  lines.push('', 'Legend: R/Y/N=territory | r=red y=yellow g=neutral | format: hp/max+type+team');
  return lines.join('\n');
}

export type { Mode, Team, Territory, Unit, UnitType, GameEvent } from './types';
