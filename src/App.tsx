import React, { useEffect, useState } from 'react';
import { loadContent, getContentSnapshot, getStartAreaId, getAllAreas, getAreaById } from './engine/contentLoader';
import { usePlayerStore } from './store/playerStore';
import { executeChoice } from './engine/execute';

export default function App() {
  const [page, setPage] = useState<'title'|'menu'|'game'>('title');
  const [loading, setLoading] = useState(true);
  const [modalPage, setModalPage] = useState<'inventory'|'equipment'|'skills'|'spells'|'quests'|'map'|null>(null);
  const newGame = usePlayerStore(s => s.newGame);
  const loadState = usePlayerStore(s => s.loadState);
  const currentAreaId = usePlayerStore(s => s.currentAreaId);
  const inventory = usePlayerStore(s => s.inventory);
  const stats = usePlayerStore(s => s.stats);
  const spellsKnown = usePlayerStore(s => s.spellsKnown);
  const quests = usePlayerStore(s => s.quests);
  const flags = usePlayerStore(s => s.flags);
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
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <h2 style={{marginBottom: 20}}>Main Menu</h2>
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
      {/* Top Navigation */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#faf6ef', borderBottom: '1px solid #eee' }}>
        <button onClick={() => setModalPage('inventory')} style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Inventory</button>
        <button onClick={() => setModalPage('equipment')} style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Equipment</button>
        <button onClick={() => setModalPage('skills')} style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Skills</button>
        <button onClick={() => setModalPage('spells')} style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Spells</button>
        <button onClick={() => setModalPage('quests')} style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Quests</button>
        <button onClick={() => setModalPage('map')} style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Map</button>
      </div>
      
      {/* Main Content - Centered */}
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {area ? (
          <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
            <h1 style={{ marginBottom: 20 }}>{area.title ?? area.id}</h1>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{area.description}</p>
          </div>
        ) : (
          <div>No area loaded.</div>
        )}
      </div>

      {/* Bottom Buttons - Centered */}
      <div style={{ borderTop: '1px solid #eee', padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {orderedChoices.length > 0 ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 800 }}>
            {orderedChoices.map((c:any, idx:number) => (
              <button key={c.id ?? idx} onClick={async () => {
                // Use universal handleChoice
                const handleChoice = (usePlayerStore as any).getState().handleChoice;
                await handleChoice(c);
              }} style={{ minWidth: 160, padding: 12, borderRadius: 8, background: '#222', color: '#fff', cursor: 'pointer', border: 'none', fontSize: 14 }}>{c.label}</button>
            ))}
          </div>
        ) : (
          <button aria-label="Next page" onClick={onNextPage} style={{ position: 'absolute', right: 20, bottom: 12, padding: 12, borderRadius: 28, background: '#222', color: '#fff', cursor: 'pointer', border: 'none' }}>⤷</button>
        )}
      </div>
      
      {/* Modal Overlay */}
      {modalPage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setModalPage(null)}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, maxWidth: 600, maxHeight: '80vh', overflow: 'auto', minWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>{modalPage.charAt(0).toUpperCase() + modalPage.slice(1)}</h2>
              <button onClick={() => setModalPage(null)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            
            {modalPage === 'inventory' && (
              <div>
                {inventory.length === 0 ? (
                  <p>No items in inventory.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {inventory.map((item, idx) => (
                      <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        {item.itemId} (x{item.qty})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {modalPage === 'equipment' && (
              <div>
                <p>Equipment system coming soon...</p>
              </div>
            )}
            
            {modalPage === 'skills' && (
              <div>
                <h3>Stats</h3>
                <p>Skill: {stats.skill}</p>
                <p>Stamina: {stats.stamina}</p>
                <p>Luck: {stats.luck}</p>
                <p>Gold: {stats.gold}</p>
                <p>XP: {stats.xp}</p>
                <p>Level: {stats.level}</p>
              </div>
            )}
            
            {modalPage === 'spells' && (
              <div>
                {spellsKnown.length === 0 ? (
                  <p>No spells known.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {spellsKnown.map((spellId, idx) => (
                      <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        {spellId}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {modalPage === 'quests' && (
              <div>
                {Object.keys(quests).length === 0 ? (
                  <p>No active quests.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {Object.entries(quests).map(([questId, stageId]) => (
                      <li key={questId} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        {questId}: {stageId === 'completed' ? 'Completed' : `Stage ${stageId}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {modalPage === 'map' && (
              <div>
                <p>Current Area: {currentAreaId}</p>
                <p>Map system coming soon...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle: any = { background:'#222', color:'#fff', padding:12, margin:'8px 0', borderRadius:8, width:260, cursor:'pointer', border:'none', fontSize:14 }
