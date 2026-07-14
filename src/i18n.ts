import { createContext, useContext } from 'react';

export type Lang = 'ru' | 'en';

export interface Translations {
  // TopBar
  appTitle: string;
  turn: string;
  nextTurn: string;
  prevTurn: string;
  changelog: string;
  newGame: string;
  clearHistory: string;
  history: string;
  exportJson: string;
  copy: string;
  import: string;
  dev: string;
  rules: string;
  // Confirm messages
  confirmReset: string;
  confirmClearHistory: string;
  // Winner
  kingSlain: string;
  victory: string;
  // Sidebar
  mapSetup: string;
  cols: string;
  rows: string;
  rebuild: string;
  fillRed: string;
  fillYellow: string;
  fillNeutral: string;
  fillHalf: string;
  clearMap: string;
  unitPicker: string;
  team: string;
  red: string;
  yellow: string;
  neutral: string;
  maxHp: string;
  money: string;
  wCooldown: string;
  addMoney: string;
  transfer: string;
  from: string;
  to: string;
  amount: string;
  setWcd: string;
  // Modes
  modePaint: string;
  modePaintRed: string;
  modePaintYellow: string;
  modePaintNeutral: string;
  modePlace: string;
  modeDelete: string;
  modeMove: string;
  modeAttack: string;
  modeHeal: string;
  modeWheal: string;
  modeCapture: string;
  // Unit names
  unitB: string;
  unitK: string;
  unitM: string;
  unitW: string;
  unitD: string;
  unitE: string;
  unitR: string;
  // SelectedPanel
  selected: string;
  type: string;
  hp: string;
  maxHpLabel: string;
  actions: string;
  heal1: string;
  damage1: string;
  addMaxHp: string;
  removeMaxHp: string;
  delete: string;
  capture: string;
  deselect: string;
  // LogPanel
  log: string;
  clearLog: string;
  // RightBar
  newsEvents: string;
  news: string;
  playerMsg: string;
  events: string;
  eventText: string;
  expireTurn: string;
  addEvent: string;
  aiControl: string;
  aiResponse: string;
  pasteAiJson: string;
  applyAi: string;
  textExport: string;
  refresh: string;
  copyText: string;
  aiNotebook: string;
  aiNotebookSecret: string;
  showNotes: string;
  hideNotes: string;
  peekWarning: string;
  notesEmpty: string;
  notesHint: string;
  noteTurn: string;
  noteUpdated: string;
  // Changelog modal
  changelogTitle: string;
  loading: string;
  newEntry: string;
  changeVersion: string;
  changeCode: string;
  versionPlaceholder: string;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  sortPlaceholder: string;
  save: string;
  cancel: string;
  newCodePlaceholder: string;
  change: string;
  noEntries: string;
  codeChanged: string;
  versionUpdated: string;
  // Rules modal
  rulesTitle: string;
  // Dev mode
  devOn: string;
  devOff: string;
  devOnInfo: string;
  devOffInfo: string;
  codePlaceholder: string;
  verify: string;
  // Info messages
  selectUnitFirst: string;
  selectAttackerFirst: string;
  selectMedicFirst: string;
  selectWhealerFirst: string;
  alreadyAttacked: string;
  cannotAttack: string;
  attackAdjacentOnly: string;
  noUnits: string;
  cannotAttackAlly: string;
  defenderBlocks: string;
  moveOneCell: string;
  defenderBlocksCell: string;
  cellLimit: string;
  placeOwnTerritory: string;
  notEnoughMoney: string;
  unitPlaced: string;
  medicCooldown: string;
  medicHealAdjacent: string;
  medicSelfHeal: string;
  fullHp: string;
  wCooldownMsg: string;
  alreadyYours: string;
  transferSelf: string;
  notEnoughFunds: string;
  // Team labels
  teamRed: string;
  teamYellow: string;
  teamNeutral: string;
  // AI message default
  aiNoResponse: string;
  // Language
  language: string;
}

const ru: Translations = {
  appTitle: 'Snickers Presidents',
  turn: 'Ход',
  nextTurn: 'Следующий ход',
  prevTurn: 'Назад',
  changelog: 'Changelog',
  newGame: 'Новая игра',
  clearHistory: 'Очистить историю',
  history: 'История',
  exportJson: 'JSON',
  copy: 'Копировать',
  import: 'Загрузить',
  dev: 'DEV',
  rules: 'Правила',
  confirmReset: 'Сбросить всю игру? Карта, деньги, юниты — всё вернётся к началу.',
  confirmClearHistory: 'Очистить историю ходов? Позиция останется, но вся запись событий исчезнет.',
  kingSlain: 'Король пал!',
  victory: 'Победа',
  mapSetup: 'Настройка карты',
  cols: 'Столбцы',
  rows: 'Строки',
  rebuild: 'Перестроить',
  fillRed: 'Залить красным',
  fillYellow: 'Залить жёлтым',
  fillNeutral: 'Залить нейтральным',
  fillHalf: 'Половина 50/50',
  clearMap: 'Очистить карту',
  unitPicker: 'Выбор юнита',
  team: 'Команда',
  red: 'Красные',
  yellow: 'Жёлтые',
  neutral: 'Нейтральные',
  maxHp: 'Макс HP',
  money: 'Батончики',
  wCooldown: 'W кулдаун',
  addMoney: 'Добавить деньги',
  transfer: 'Передача',
  from: 'От',
  to: 'Кому',
  amount: 'Сумма',
  setWcd: 'Установить W-кд',
  modePaint: 'Покраска',
  modePaintRed: 'Красная территория',
  modePaintYellow: 'Жёлтая территория',
  modePaintNeutral: 'Нейтральная территория',
  modePlace: 'Разместить юнита',
  modeDelete: 'Удалить юнита',
  modeMove: 'Движение',
  modeAttack: 'Атака',
  modeHeal: 'Лечение (M)',
  modeWheal: 'Дист. лечение (W)',
  modeCapture: 'Захват клетки',
  unitB: 'B — Боец',
  unitK: 'K — Король',
  unitM: 'M — Медик',
  unitW: 'W — Дист. медик',
  unitD: 'D — Добывающий',
  unitE: 'E — Защитник',
  unitR: 'R — Разведчик',
  selected: 'Выбран',
  type: 'Тип',
  hp: 'HP',
  maxHpLabel: 'Макс HP',
  actions: 'Действия',
  heal1: 'Лечить +1',
  damage1: 'Урон -1',
  addMaxHp: '+1 Макс HP',
  removeMaxHp: '-1 Макс HP',
  delete: 'Удалить',
  capture: 'Захватить клетку',
  deselect: 'Снять выделение',
  log: 'Журнал',
  clearLog: 'Очистить',
  newsEvents: 'Новости и события',
  news: 'Новости',
  playerMsg: 'Сообщение игроку',
  events: 'События',
  eventText: 'Текст события',
  expireTurn: 'Истекает на ходу',
  addEvent: 'Добавить событие',
  aiControl: 'Управление оппонентом',
  aiResponse: 'Ответ оппонента',
  pasteAiJson: 'Вставьте JSON ответ оппонента...',
  applyAi: 'Применить',
  textExport: 'Текстовый экспорт',
  refresh: 'Обновить',
  copyText: 'Копировать текст',
  aiNotebook: 'Блокнот оппонента',
  aiNotebookSecret: 'Блокнот оппонента (секретный)',
  showNotes: 'Показать',
  hideNotes: 'Скрыть',
  peekWarning: 'WARNING: Opponent will know you peeked',
  notesEmpty: 'Блокнот пуст — оппонент ещё ничего не записал',
  notesHint: 'Личные заметки оппонента. Если вы посмотрите — оппонент получит сигнал в следующем JSON.',
  noteTurn: 'ход',
  noteUpdated: 'изм.',
  changelogTitle: 'Список изменений',
  loading: 'Загрузка...',
  newEntry: 'Новая запись',
  changeVersion: 'Изменить версию',
  changeCode: 'Сменить код',
  versionPlaceholder: 'Версия (v1.1)',
  titlePlaceholder: 'Заголовок',
  bodyPlaceholder: 'Текст изменений...',
  sortPlaceholder: 'Сорт.',
  save: 'Сохранить',
  cancel: 'Отмена',
  newCodePlaceholder: 'Новый код',
  change: 'Сменить',
  noEntries: 'Записей пока нет',
  codeChanged: 'Код успешно изменён!',
  versionUpdated: 'Версия обновлена!',
  rulesTitle: 'Правила игры',
  devOn: 'Режим разработчика включён — все ограничения сняты. Нажмите чтобы выключить.',
  devOff: 'Режим разработчика отключён',
  devOnInfo: 'Developer mode on - all restrictions lifted',
  devOffInfo: 'Developer mode off',
  codePlaceholder: 'Код',
  verify: 'OK',
  selectUnitFirst: 'Сначала кликни по юниту',
  selectAttackerFirst: 'Сначала кликни по атакующему',
  selectMedicFirst: 'Сначала кликни по M-медику',
  selectWhealerFirst: 'Сначала кликни по W-медику',
  alreadyAttacked: 'уже атаковал в этот ход!',
  cannotAttack: 'не может атаковать!',
  attackAdjacentOnly: 'WARNING: Attack adjacent only, not diagonal!',
  noUnits: 'Нет юнитов на',
  cannotAttackAlly: 'WARNING: Cannot attack an ally!',
  defenderBlocks: 'Defender (E) blocks the attack!',
  moveOneCell: 'ходит только на 1 клетку (не по диагонали)',
  defenderBlocksCell: 'Defender blocks the cell!',
  cellLimit: 'WARNING: Limit 10 units per cell!',
  placeOwnTerritory: 'WARNING: Place only on your own territory',
  notEnoughMoney: 'WARNING: Not enough Snickers! Need',
  unitPlaced: 'Размещён',
  medicCooldown: 'WARNING: M on cooldown! ',
  medicHealAdjacent: 'WARNING: Medic heals adjacent only, not diagonal!',
  medicSelfHeal: 'Медик не лечит сам себя!',
  fullHp: 'уже на полном HP',
  wCooldownMsg: 'WARNING: W on cooldown! ',
  alreadyYours: 'уже ваша!',
  transferSelf: 'Нельзя передать самому себе',
  notEnoughFunds: 'WARNING: Insufficient funds!',
  teamRed: 'Красные',
  teamYellow: 'Жёлтые',
  teamNeutral: 'Нейтральные',
  aiNoResponse: '-- No response yet --',
  language: 'Язык',
};

const en: Translations = {
  appTitle: 'Snickers Presidents',
  turn: 'Turn',
  nextTurn: 'Next Turn',
  prevTurn: 'Back',
  changelog: 'Changelog',
  newGame: 'New Game',
  clearHistory: 'Clear History',
  history: 'History',
  exportJson: 'JSON',
  copy: 'Copy',
  import: 'Import',
  dev: 'DEV',
  rules: 'Rules',
  confirmReset: 'Reset the entire game? Map, money, units — everything returns to start.',
  confirmClearHistory: 'Clear turn history? Positions remain, but all event records disappear.',
  kingSlain: 'King has fallen!',
  victory: 'Victory',
  mapSetup: 'Map Setup',
  cols: 'Columns',
  rows: 'Rows',
  rebuild: 'Rebuild',
  fillRed: 'Fill Red',
  fillYellow: 'Fill Yellow',
  fillNeutral: 'Fill Neutral',
  fillHalf: 'Split 50/50',
  clearMap: 'Clear Map',
  unitPicker: 'Unit Picker',
  team: 'Team',
  red: 'Red',
  yellow: 'Yellow',
  neutral: 'Neutral',
  maxHp: 'Max HP',
  money: 'Snickers',
  wCooldown: 'W Cooldown',
  addMoney: 'Add Money',
  transfer: 'Transfer',
  from: 'From',
  to: 'To',
  amount: 'Amount',
  setWcd: 'Set W-CD',
  modePaint: 'Paint',
  modePaintRed: 'Red Territory',
  modePaintYellow: 'Yellow Territory',
  modePaintNeutral: 'Neutral Territory',
  modePlace: 'Place Unit',
  modeDelete: 'Delete Unit',
  modeMove: 'Move',
  modeAttack: 'Attack',
  modeHeal: 'Heal (M)',
  modeWheal: 'Remote Heal (W)',
  modeCapture: 'Capture Cell',
  unitB: 'B — Fighter',
  unitK: 'K — King',
  unitM: 'M — Medic',
  unitW: 'W — Remote Medic',
  unitD: 'D — Miner',
  unitE: 'E — Defender',
  unitR: 'R — Scout',
  selected: 'Selected',
  type: 'Type',
  hp: 'HP',
  maxHpLabel: 'Max HP',
  actions: 'Actions',
  heal1: 'Heal +1',
  damage1: 'Damage -1',
  addMaxHp: '+1 Max HP',
  removeMaxHp: '-1 Max HP',
  delete: 'Delete',
  capture: 'Capture Cell',
  deselect: 'Deselect',
  log: 'Log',
  clearLog: 'Clear',
  newsEvents: 'News & Events',
  news: 'News',
  playerMsg: 'Player Message',
  events: 'Events',
  eventText: 'Event text',
  expireTurn: 'Expires on turn',
  addEvent: 'Add Event',
  aiControl: 'Opponent Control',
  aiResponse: 'Opponent Response',
  pasteAiJson: 'Paste opponent JSON response...',
  applyAi: 'Apply',
  textExport: 'Text Export',
  refresh: 'Refresh',
  copyText: 'Copy Text',
  aiNotebook: 'Opponent Notebook',
  aiNotebookSecret: 'Opponent Notebook (secret)',
  showNotes: 'Show',
  hideNotes: 'Hide',
  peekWarning: 'WARNING: Opponent will know you peeked',
  notesEmpty: 'Notebook is empty — opponent hasn\'t written anything yet',
  notesHint: 'Opponent\'s private notes. If you look — opponent gets a signal in the next JSON.',
  noteTurn: 'turn',
  noteUpdated: 'upd.',
  changelogTitle: 'Changelog',
  loading: 'Loading...',
  newEntry: 'New Entry',
  changeVersion: 'Change Version',
  changeCode: 'Change Code',
  versionPlaceholder: 'Version (v1.1)',
  titlePlaceholder: 'Title',
  bodyPlaceholder: 'Change description...',
  sortPlaceholder: 'Sort',
  save: 'Save',
  cancel: 'Cancel',
  newCodePlaceholder: 'New code',
  change: 'Change',
  noEntries: 'No entries yet',
  codeChanged: 'Code changed successfully!',
  versionUpdated: 'Version updated!',
  rulesTitle: 'Game Rules',
  devOn: 'Developer mode on — all restrictions lifted. Click to turn off.',
  devOff: 'Developer mode off',
  devOnInfo: 'Developer mode on - all restrictions lifted',
  devOffInfo: 'Developer mode off',
  codePlaceholder: 'Code',
  verify: 'OK',
  selectUnitFirst: 'Click a unit first',
  selectAttackerFirst: 'Click an attacker first',
  selectMedicFirst: 'Click an M-medic first',
  selectWhealerFirst: 'Click a W-medic first',
  alreadyAttacked: 'already attacked this turn!',
  cannotAttack: 'cannot attack!',
  attackAdjacentOnly: 'WARNING: Attack adjacent only, not diagonal!',
  noUnits: 'No units on',
  cannotAttackAlly: 'WARNING: Cannot attack an ally!',
  defenderBlocks: 'Defender (E) blocks the attack!',
  moveOneCell: 'moves only 1 cell (not diagonal)',
  defenderBlocksCell: 'Defender blocks the cell!',
  cellLimit: 'WARNING: Limit 10 units per cell!',
  placeOwnTerritory: 'WARNING: Place only on your own territory',
  notEnoughMoney: 'WARNING: Not enough Snickers! Need',
  unitPlaced: 'Placed',
  medicCooldown: 'WARNING: M on cooldown! ',
  medicHealAdjacent: 'WARNING: Medic heals adjacent only, not diagonal!',
  medicSelfHeal: 'Medic cannot heal itself!',
  fullHp: 'is already at full HP',
  wCooldownMsg: 'WARNING: W on cooldown! ',
  alreadyYours: 'is already yours!',
  transferSelf: 'Cannot transfer to yourself',
  notEnoughFunds: 'WARNING: Insufficient funds!',
  teamRed: 'Red',
  teamYellow: 'Yellow',
  teamNeutral: 'Neutral',
  aiNoResponse: '— No response yet —',
  language: 'Language',
};

export const translations: Record<Lang, Translations> = { ru, en };

export interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'ru',
  setLang: () => {},
  t: ru,
});

export function useI18n() {
  return useContext(I18nContext);
}
