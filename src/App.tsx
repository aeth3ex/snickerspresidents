import { useCallback, useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { useGame, type AIResponse, type SavedState } from './game/useGame';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { GameGrid } from './components/GameGrid';
import { SelectedPanel } from './components/SelectedPanel';
import { LogPanel } from './components/LogPanel';
import { RightBar } from './components/RightBar';
import { ChangelogModal } from './components/ChangelogModal';
import { RulesModal } from './components/RulesModal';
import { NewsModal } from './components/NewsModal';
import { KingDeathDialog } from './components/KingDeathDialog';
import { SettingsModal } from './components/SettingsModal';
import { verifyAdminCode, fetchVersion } from './lib/supabase';
import { I18nContext, translations } from './i18n';
import type { GameActions } from './components/types';

function App() {
  const { state, actions, buildGameStateJson, buildTextExport, buildHistoryFile } = useGame();
  const [showChangelog, setShowChangelog] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [version, setVersion] = useState('v1.0');
  const lang = state.lang;
  const setLang = actions.setLang;

  const t = translations[lang];

  useEffect(() => {
    fetchVersion().then(setVersion).catch(() => {});
  }, []);

  const handleExport = useCallback(() => {
    const json = buildGameStateJson(lang);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `snickers_t${state.turn}_${state.turnTeam}.json`;
    a.click();
  }, [buildGameStateJson, state.turn, state.turnTeam, lang]);

  const handleCopy = useCallback(() => {
    const json = buildGameStateJson(lang);
    navigator.clipboard.writeText(JSON.stringify(json, null, 2)).catch(() => {});
  }, [buildGameStateJson, lang]);

  const handleDownloadHistory = useCallback(() => {
    const hist = buildHistoryFile();
    const blob = new Blob([JSON.stringify(hist, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `snickers_history_t${state.turn}.json`;
    a.click();
  }, [buildHistoryFile, state.turn]);

  const handleImport = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          actions.loadState(JSON.parse(e.target?.result as string) as SavedState);
        } catch (err) {
          alert('JSON error: ' + (err as Error).message);
        }
      };
      reader.readAsText(file);
    },
    [actions]
  );

  const handleLoadAI = useCallback(
    (raw: string) => {
      if (!raw.trim()) return;
      try {
        actions.applyAI(JSON.parse(raw) as AIResponse);
      } catch (e) {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            actions.applyAI(JSON.parse(m[0]) as AIResponse);
          } catch (e2) {
            alert('Invalid JSON: ' + (e2 as Error).message);
          }
        } else {
          alert('Invalid JSON: ' + (e as Error).message);
        }
      }
    },
    [actions]
  );

  const handleDevCodeSubmit = useCallback(async (code: string): Promise<boolean> => {
    const ok = await verifyAdminCode(code);
    if (ok) setAdminCode(code);
    return ok;
  }, []);

  const gameActions = actions as GameActions;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen flex flex-col bg-ink-950 text-slate-200">
        <TopBar
          turn={state.turn}
          turnTeam={state.turnTeam}
          winner={state.winner}
          devMode={state.devMode}
          changelogVersion={version}
          lang={lang}
          onNextTurn={actions.nextTurn}
          onPrevTurn={actions.prevTurn}
          onExport={handleExport}
          onCopy={handleCopy}
          onHistory={handleDownloadHistory}
          onImport={handleImport}
          onResetGame={actions.resetGame}
          onClearHistory={actions.clearHistory}
          onDownloadHistory={handleDownloadHistory}
          onToggleDevMode={actions.toggleDevMode}
          onShowChangelog={() => setShowChangelog(true)}
          onShowRules={() => setShowRules(true)}
          onShowNews={() => setShowNews(true)}
          onShowSettings={() => setShowSettings(true)}
          onDevCodeSubmit={handleDevCodeSubmit}
          onSetLang={setLang}
        />

        <div className="flex gap-2.5 p-2.5 items-start">
          <div className="w-56 flex-shrink-0 overflow-y-auto scroll-thin" style={{ maxHeight: 'calc(100vh - 60px)' }}>
            <Sidebar
              cols={state.cols}
              rows={state.rows}
              mode={state.mode}
              pickedType={state.pickedType}
              pickedTeam={state.pickedTeam}
              pickedMaxHp={state.pickedMaxHp}
              redMoney={state.redMoney}
              yelMoney={state.yelMoney}
              wCooldownRed={state.wCooldownRed}
              wCooldownYellow={state.wCooldownYellow}
              actions={gameActions}
            />
          </div>

          <main className="flex-1 flex flex-col gap-2.5 min-w-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-ink-850 border border-ink-700 rounded-xl text-xs text-slate-400">
              <Info size={14} className="text-accent-400 flex-shrink-0" />
              {state.info}
            </div>

            <SelectedPanel
              selCell={state.selCell}
              selIdx={state.selIdx}
              grid={state.grid}
              actions={gameActions}
            />

            <GameGrid
              cols={state.cols}
              rows={state.rows}
              grid={state.grid}
              mode={state.mode}
              actionFrom={state.actionFrom}
              selCell={state.selCell}
              selIdx={state.selIdx}
              onCellClick={actions.cellClick}
              onChipClick={actions.chipClick}
            />

            <LogPanel log={state.log} onClear={actions.clearLog} />
          </main>

          <div className="w-60 flex-shrink-0 overflow-y-auto scroll-thin" style={{ maxHeight: 'calc(100vh - 60px)' }}>
            <RightBar
              events={state.events}
              turn={state.turn}
              aiMessage={state.aiMessage}
              aiNotes={state.aiNotes}
              playerPeekedNotes={state.playerPeekedNotes}
              yourNotes={state.yourNotes}
              yourNotesExpanded={state.yourNotesExpanded}
              opponentType={state.opponentType}
              actions={gameActions}
              onExportText={buildTextExport}
              onLoadAI={handleLoadAI}
            />
          </div>
        </div>
      </div>

      {showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} adminCode={adminCode} lang={lang} />
      )}
      {showRules && (
        <RulesModal onClose={() => setShowRules(false)} />
      )}
      {showNews && (
        <NewsModal onClose={() => setShowNews(false)} adminCode={adminCode} lang={lang} />
      )}
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)} 
          lang={lang} 
          onSetLang={setLang}
          opponentType={state.opponentType}
          onSetOpponentType={actions.setOpponentType}
          rulesDisabled={state.rulesDisabled}
          onSetRulesDisabled={actions.setRulesDisabled}
        />
      )}
      {state.kingKilledTeam && !state.winner && (
        <KingDeathDialog
          killedTeam={state.kingKilledTeam}
          lang={lang}
          onContinue={actions.continueAfterKing}
          onEnd={actions.endAfterKing}
        />
      )}
    </I18nContext.Provider>
  );
}

export default App;
