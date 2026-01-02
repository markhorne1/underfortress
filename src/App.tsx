import React, { useEffect, useState } from 'react';
import { loadContent, getContentSnapshot, getStartAreaId, getAllAreas, getAreaById } from './engine/contentLoader';
import { usePlayerStore } from './store/playerStore';
import { executeChoice } from './engine/execute';

export default function App() {
  const [page, setPage] = useState<'title'|'menu'|'game'>('title');
  const [loading, setLoading] = useState(true);
  const newGame = usePlayerStore(s => s.newGame);
  const loadState = usePlayerStore(s => s.loadState);
  const state = (usePlayerStore as any).getState();

  useEffect(() => {
    async function init() {
      await loadContent();
      setLoading(false);
    }
    init();
  }, []);

  const onNew = async () => {
    await newGame();
    setPage('game');
  };

  const onLoad = async () => {
    await loadState();
    const st = (usePlayerStore as any).getState();
    if (st.hasSave) setPage('game'); else alert('No save found');
  };

  if (loading) return <div style={{padding:20}}>Loading content...</div>;

  if (page === 'title') {
    return (
      <div style={{height:'100vh', background:'#f7efe0', display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
        <div style={{textAlign:'center'}}>
          <h1 style={{fontSize:48, fontFamily:'serif'}}>Underfortress</h1>
          <div style={{marginTop:8,color:'#555'}}>A gamebook adventure</div>
        </div>
        <button aria-label="Next page" onClick={() => setPage('menu')} style={{position:'absolute', right:20, bottom:20, padding:12, borderRadius:28, background:'#222', color:'#fff'}}>⤷</button>
      </div>
    );
  }

  if (page === 'menu') {
    return (
      <div style={{padding:40}}>
        <h2>Main Menu</h2>
        <div style={{width:260}}>
          <button onClick={onNew} style={btnStyle}>New Game</button>
          <button onClick={onLoad} style={btnStyle}>Load Game</button>
          <button onClick={() => setPage('title')} style={btnStyle}>Back</button>
        </div>
      </div>
    );
  }

  // game page: render current area from engine + simple choice UI
  const content = getContentSnapshot();
  const areas = getAllAreas();
  const currentAreaId = state.currentAreaId || getStartAreaId();
  const area = getAreaById(currentAreaId as string);

  const execute = (choice: any) => {
    const res = executeChoice(choice, (usePlayerStore as any).getState());
    if (res && res.state) (usePlayerStore as any).setState(res.state);
    if (res && res.goToAreaId) (usePlayerStore as any).getState().moveTo?.(res.goToAreaId);
  };

  // build ordered choices: area.choices, actionsAvailable, exits
  const orderedChoices: any[] = [];
  if (area) {
    if (Array.isArray(area.choices)) orderedChoices.push(...area.choices.map((c:any)=>({ ...c })));
    if (area.actionsAvailable) {
      for (const k of Object.keys(area.actionsAvailable)) {
        const act = area.actionsAvailable[k];
        orderedChoices.push({ id: `action_${k}`, label: act.text ?? act.label ?? k, requirements: act.requirements, effects: act.effects, goToAreaId: act.goToAreaId, rawAction: act });
      }
    }
    const exits = area.exits || {};
    for (const [dir, aid] of Object.entries(exits)) {
      orderedChoices.push({ id: `exit_${dir}`, label: `Go to: ${getAreaById(aid as string)?.title ?? aid}`, goToAreaId: aid });
    }
  }

  const onNextPage = async () => {
    if (!area) return;
    if ((area as any).continueToAreaId) {
      await (usePlayerStore as any).getState().moveTo?.((area as any).continueToAreaId);
      return;
    }
    const exIds = Object.values(area.exits || {});
    if (exIds.length === 1) {
      await (usePlayerStore as any).getState().moveTo?.(exIds[0]);
      return;
    }
    console.warn('No choices and no unambiguous continue path for area:', area?.id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, padding: 20 }}>
        {area ? (
          <div>
            <h1>{area.title ?? area.id}</h1>
            <p style={{ whiteSpace: 'pre-wrap' }}>{area.description}</p>
          </div>
        ) : (
          <div>No area loaded.</div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #eee', padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {orderedChoices.length > 0 ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {orderedChoices.map((c:any, idx:number) => (
              <button key={c.id ?? idx} onClick={async () => {
                if (c.rawAction || c.effects) {
                  const res = execute(c.rawAction ?? c);
                }
                if (c.goToAreaId) {
                  await (usePlayerStore as any).getState().moveTo?.(c.goToAreaId);
                }
              }} style={{ minWidth: 160, padding: 10, borderRadius: 8, background: '#222', color: '#fff' }}>{c.label}</button>
            ))}
          </div>
        ) : (
          <button aria-label="Next page" onClick={onNextPage} style={{ position: 'absolute', right: 20, bottom: 12, padding: 12, borderRadius: 28, background: '#222', color: '#fff' }}>⤷</button>
        )}
      </div>
    </div>
  );
}

const btnStyle: any = { background:'#222', color:'#fff', padding:12, margin:'8px 0', borderRadius:8, width:260 }
