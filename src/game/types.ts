export type UnitType = 'B' | 'K' | 'M' | 'W' | 'D' | 'E' | 'R';
export type Team = 'red' | 'yellow' | 'neutral';
export type Territory = 'red-t' | 'yellow-t' | 'neutral-t';

export type Mode =
  | 'paint-red'
  | 'paint-yellow'
  | 'paint-neutral'
  | 'place-unit'
  | 'move'
  | 'attack'
  | 'heal'
  | 'wheal'
  | 'capture'
  | 'delete-unit';

export interface Unit {
  id: string;
  t: UnitType;
  hp: number;
  maxhp: number;
  team: Team;
}

export interface Cell {
  territory: Territory;
  units: Unit[];
}

export interface GameEvent {
  id: string;
  text: string;
  expTurn: number | null;
  done: boolean;
}

export interface LogEntry {
  turn: number;
  text: string;
}

export interface UnitDef {
  hp: number;
  maxhp: number;
  cost: number;
  label: string;
  desc: string;
  descEn: string;
  canAttack: boolean;
  canCapture: boolean;
  moveRange: number;
}

export const UDEFS: Record<UnitType, UnitDef> = {
  B: { hp: 4, maxhp: 4, cost: 3, label: 'Боец', desc: 'Атакует и захватывает. Ходит на 1 клетку.', descEn: 'Attacks and captures. Moves 1 cell.', canAttack: true, canCapture: true, moveRange: 1 },
  K: { hp: 5, maxhp: 5, cost: 0, label: 'Король', desc: 'Ходит на 1 клетку, захватывает. Если умрёт — поражение команды.', descEn: 'Moves 1 cell, captures. If killed — team loses.', canAttack: true, canCapture: true, moveRange: 1 },
  M: { hp: 3, maxhp: 3, cost: 3, label: 'Медик', desc: 'Лечит соседнего юнита (+1 HP), не себя. Раз в 2 хода.', descEn: 'Heals adjacent unit (+1 HP), not self. 2-turn cooldown.', canAttack: false, canCapture: false, moveRange: 1 },
  W: { hp: 2, maxhp: 2, cost: 7, label: 'Дист. медик', desc: 'Лечит любого юнита на карте. Общий кулдаун 5 ходов для всех W.', descEn: 'Heals any unit on the map. Shared 5-turn cooldown for all W.', canAttack: false, canCapture: false, moveRange: 1 },
  D: { hp: 2, maxhp: 2, cost: 2, label: 'Денежник', desc: 'Даёт +0.5 батончика каждый ход.', descEn: 'Generates +0.5 Snickers each turn.', canAttack: false, canCapture: false, moveRange: 1 },
  E: { hp: 4, maxhp: 4, cost: 3, label: 'Защитник', desc: 'Блокирует атаки на свою клетку. Не даёт зайти врагу.', descEn: 'Blocks attacks on its cell. Prevents enemy entry.', canAttack: false, canCapture: false, moveRange: 1 },
  R: { hp: 1, maxhp: 1, cost: 6, label: 'Разведчик', desc: 'Ходит на 2 клетки (1 по диагонали). Захватывает, не атакует. Может перепрыгнуть защитника.', descEn: 'Moves 2 cells (1 diagonal). Captures, cannot attack. Bypasses Defender.', canAttack: false, canCapture: true, moveRange: 2 },
};

export const RULES = `GAME: Snickers Presidents
UNITS: B=Fighter(cost:3,hp:4,attack,capture) K=King(cost:free,hp:5,move1,capture) M=Medic(cost:3,hp:3,healAdjacent) W=RemoteMedic(cost:7,hp:2,healAny,cooldown5) D=Banker(cost:2,hp:2,gives:0.5perTurn) E=Defender(cost:3,hp:4,blocks) R=Scout(cost:6,hp:1,move2,capture,noAttack)
MOVEMENT: 1 cell per turn (no diagonal). R can move 2 cells (1 diagonal allowed, NOT 2-diagonal).
ATTACK: adjacent cells only, no diagonal. B and K can attack. E blocks all attacks. If King dies - team loses.
HEALING: M heals +1hp to one adjacent unit (not self), once per 2 turns. W heals any unit on map +1hp, shared cooldown 5 turns.
CAPTURE: B,K,R capture cells by moving onto / standing on non-own territory.
MONEY: D gives 0.5 per turn per unit. Max 10 units per cell. Up to 5 actions per turn.
SPAWN: Units can only be spawned on own territory.
TERRITORY: red=Red team, yellow=Yellow team
RESPONSE: Respond ONLY with valid JSON. No markdown outside JSON.
NOTEBOOK: You have a private notebook (aiNotebook). Use notebookOps to add/edit/delete notes so you remember plans, diplomacy and positions between turns.`;

export const TEAM_LABELS: Record<Team, string> = {
  red: 'Красные',
  yellow: 'Жёлтые',
  neutral: 'Нейтральные',
};

export const TEAM_SHORT: Record<Team, string> = {
  red: 'Кр',
  yellow: 'Жл',
  neutral: 'Нт',
};

export const MODE_INFO: Record<Mode, string> = {
  'paint-red': '🔴 Рисуем красную территорию — клик по клетке',
  'paint-yellow': '🟡 Рисуем жёлтую территорию — клик по клетке',
  'paint-neutral': '⬜ Нейтральная территория — клик по клетке',
  'place-unit': '🪖 Выбери юнита слева, клик по своей клетке (деньги спишутся)',
  'move': '✋ Клик по юниту → клик куда переместить',
  'attack': '⚔️ Клик по атакующему → клик по соседней клетке с врагом',
  'heal': '💊 Клик по M-медику → клик по соседней клетке с союзником',
  'wheal': '📡 Клик по W-медику → клик по любому юниту (кулдаун 5)',
  'capture': '🏳️ Клик по юниту → кнопка «Захватить» в панели',
  'delete-unit': '🗑 Клик по юниту — удалить',
};

export const MODE_INFO_EN: Record<Mode, string> = {
  'paint-red': '🔴 Painting red territory — click a cell',
  'paint-yellow': '🟡 Painting yellow territory — click a cell',
  'paint-neutral': '⬜ Neutral territory — click a cell',
  'place-unit': '🪖 Pick a unit on the left, click your cell (costs money)',
  'move': '✋ Click a unit → click where to move',
  'attack': '⚔️ Click an attacker → click an adjacent enemy cell',
  'heal': '💊 Click an M-medic → click an adjacent ally cell',
  'wheal': '📡 Click a W-medic → click any unit (5-turn CD)',
  'capture': '🏳️ Click a unit → press "Capture" in the panel',
  'delete-unit': '🗑 Click a unit to delete',
};

export const MODE_INFO_BI: Record<Mode, { ru: string; en: string }> = Object.fromEntries(
  (Object.keys(MODE_INFO) as Mode[]).map((m) => [m, { ru: MODE_INFO[m], en: MODE_INFO_EN[m] }])
) as Record<Mode, { ru: string; en: string }>;

export function colLetter(c: number): string {
  return String.fromCharCode(65 + c);
}

export function coordId(r: number, c: number): string {
  return colLetter(c) + (r + 1);
}

export function coordToRC(coord: string): [number, number] | null {
  if (!coord || coord.length < 2) return null;
  const c = coord.charCodeAt(0) - 65;
  const r = parseInt(coord.slice(1), 10) - 1;
  if (isNaN(r) || c < 0 || r < 0) return null;
  return [r, c];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function territoryToTeam(t: Territory): Team {
  return t === 'red-t' ? 'red' : t === 'yellow-t' ? 'yellow' : 'neutral';
}

export function teamToTerritory(team: Team): Territory {
  return team === 'red' ? 'red-t' : team === 'yellow' ? 'yellow-t' : 'neutral-t';
}

export function isOrthogonalAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

/** Scout (R) movement validation: up to 2 orthogonal, or 1 diagonal step. */
export function isScoutMove(fr: number, fc: number, tr: number, tc: number): boolean {
  const dr = Math.abs(tr - fr);
  const dc = Math.abs(tc - fc);
  if (dr === 0 && dc === 0) return false;
  // 1 diagonal step (dr === 1 && dc === 1)
  if (dr === 1 && dc === 1) return true;
  // up to 2 orthogonal
  if ((dr === 0 && dc <= 2) || (dc === 0 && dr <= 2)) return true;
  return false;
}

export function teamBalance(team: Team, red: number, yellow: number): number {
  return team === 'red' ? red : team === 'yellow' ? yellow : 0;
}
