import React, { useEffect, useState } from 'react';
import { loadContent, getContentSnapshot, getStartAreaId, getAllAreas, getAreaById } from './engine/contentLoader';
import { usePlayerStore } from './store/playerStore';
import { executeChoice } from './engine/execute';
import { getActiveSkills, getPassiveSkills } from './engine/skillCalculations';

export default function App() {
  const [page, setPage] = useState<'title'|'menu'|'game'>('title');
  const [loading, setLoading] = useState(true);
  const [modalPage, setModalPage] = useState<'inventory'|'equipment'|'skills'|'spells'|'quests'|'map'|null>(null);
  const [statAllocMode, setStatAllocMode] = useState(false); // Stat allocation modal
  const [pendingStats, setPendingStats] = useState({ power: 0, mind: 0, agility: 0, vision: 0 }); // Pending changes
  const newGame = usePlayerStore(s => s.newGame);
  const loadState = usePlayerStore(s => s.loadState);
  const currentAreaId = usePlayerStore(s => s.currentAreaId);
  const inventory = usePlayerStore(s => s.inventory);
  const equipment = usePlayerStore(s => s.equipment);
  const stats = usePlayerStore(s => s.stats);
  const health = usePlayerStore(s => s.health);
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

  // build ordered choices: area.choices, actions array, actionsAvailable (legacy), exits
  const orderedChoices: any[] = [];
  if (area) {
    if (Array.isArray(area.choices)) orderedChoices.push(...area.choices.map((c:any)=>({ ...c })));
    
    // New actions array format
    if (Array.isArray((area as any).actions)) {
      for (const act of (area as any).actions) {
        const actionType = act.type || 'unknown';
        const actionIcons: Record<string, string> = {
          search: '🔍',
          investigate: '🔎',
          lockpick: '🔓',
          pickpocket: '👛'
        };
        const icon = actionIcons[actionType] || '⚡';
        const label = act.label || `${icon} ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`;
        orderedChoices.push({ id: `action_${actionType}`, label, actionType, rawAction: act });
      }
    }
    
    // Legacy actionsAvailable object format
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
      
      {/* Health Bar */}
      {page === 'game' && (
        <div style={{ padding: '8px 20px', background: '#f8f8f8', borderBottom: '1px solid #ddd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 800, margin: '0 auto' }}>
            <span style={{ fontSize: 14, fontWeight: 'bold', minWidth: 60 }}>Health:</span>
            <div style={{ flex: 1, height: 24, background: '#e0e0e0', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
              <div style={{ 
                width: `${health}%`, 
                height: '100%', 
                background: health > 50 ? '#2ecc71' : health > 25 ? '#f39c12' : '#e74c3c',
                transition: 'width 0.3s ease, background 0.3s ease'
              }}></div>
              <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 12, fontWeight: 'bold', color: '#333' }}>
                {health}/100
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content - Centered */}
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {area ? (
          <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
            <h1 style={{ marginBottom: 20 }}>{area.title ?? area.id}</h1>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{area.description}</p>
            
            {/* Spend Stat Points Button */}
            {stats.statPoints > 0 && (
              <div style={{ marginTop: 20 }}>
                <button 
                  onClick={() => {
                    setStatAllocMode(true);
                    setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 });
                  }}
                  style={{ 
                    padding: '12px 24px', 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    borderRadius: 8, 
                    background: 'linear-gradient(135deg, #f39c12, #e67e22)', 
                    color: '#fff', 
                    border: '2px solid #d68910',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(243, 156, 18, 0.4)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  ⚡ Spend {stats.statPoints} Stat Point{stats.statPoints !== 1 ? 's' : ''}
                </button>
              </div>
            )}
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
                {Object.keys(equipment).length === 0 ? (
                  <p>No equipment worn.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {Object.entries(equipment).map(([slot, itemId]) => (
                      <li key={slot} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                        <strong>{slot}:</strong> {itemId || '(empty)'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {modalPage === 'skills' && (
              <div>
                <h3 style={{ marginTop: 0 }}>Core Stats</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '12px 8px', marginBottom: 20, alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>Power:</div>
                  <div style={{ background: '#f0f0f0', height: 20, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ background: '#e74c3c', width: `${stats.power * 10}%`, height: '100%' }}></div>
                  </div>
                  <div style={{ fontWeight: 'bold', minWidth: 30 }}>{stats.power}/10</div>
                  
                  <div style={{ fontWeight: 'bold' }}>Mind:</div>
                  <div style={{ background: '#f0f0f0', height: 20, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ background: '#9b59b6', width: `${stats.mind * 10}%`, height: '100%' }}></div>
                  </div>
                  <div style={{ fontWeight: 'bold', minWidth: 30 }}>{stats.mind}/10</div>
                  
                  <div style={{ fontWeight: 'bold' }}>Agility:</div>
                  <div style={{ background: '#f0f0f0', height: 20, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ background: '#2ecc71', width: `${stats.agility * 10}%`, height: '100%' }}></div>
                  </div>
                  <div style={{ fontWeight: 'bold', minWidth: 30 }}>{stats.agility}/10</div>
                  
                  <div style={{ fontWeight: 'bold' }}>Vision:</div>
                  <div style={{ background: '#f0f0f0', height: 20, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ background: '#3498db', width: `${stats.vision * 10}%`, height: '100%' }}></div>
                  </div>
                  <div style={{ fontWeight: 'bold', minWidth: 30 }}>{stats.vision}/10</div>
                </div>
                
                {stats.statPoints > 0 && (
                  <div style={{ marginBottom: 20, padding: 12, background: '#fffbea', border: '1px solid #f39c12', borderRadius: 8 }}>
                    <strong>⚡ {stats.statPoints} Stat Points Available</strong>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Spend points to increase your core stats and improve your skills.</div>
                  </div>
                )}
                
                <h3>Active Skills (% chance)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>🔍 Search</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).search}%</span>
                  </div>
                  <button style={{ padding: '4px 12px', fontSize: 12, borderRadius: 4, background: '#4a90e2', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => alert('Vision × 10 = ' + getActiveSkills(state).search + '%')}>Info</button>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>🔎 Investigate</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).investigate}%</span>
                  </div>
                  <button style={{ padding: '4px 12px', fontSize: 12, borderRadius: 4, background: '#4a90e2', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => alert('Mind × 10 = ' + getActiveSkills(state).investigate + '%')}>Info</button>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>⚔️ Melee Attack</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).meleeAttack}%</span>
                  </div>
                  <button style={{ padding: '4px 12px', fontSize: 12, borderRadius: 4, background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => alert('Power × 10 = ' + getActiveSkills(state).meleeAttack + '%')}>Info</button>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>🏹 Ranged Attack</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).rangedAttack}%</span>
                  </div>
                  <button style={{ padding: '4px 12px', fontSize: 12, borderRadius: 4, background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => alert('Agility × 10 = ' + getActiveSkills(state).rangedAttack + '%')}>Info</button>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>✨ Cast Spell</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).castSpell}%</span>
                  </div>
                  <button style={{ padding: '4px 12px', fontSize: 12, borderRadius: 4, background: '#9b59b6', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => alert('Mind × 10 = ' + getActiveSkills(state).castSpell + '%')}>Info</button>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>🔓 Lockpick</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).lockpick}%</span>
                  </div>
                  <button style={{ padding: '4px 12px', fontSize: 12, borderRadius: 4, background: '#4a90e2', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => alert('Vision×5 + Agility×5 = ' + getActiveSkills(state).lockpick + '%')}>Info</button>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>👛 Pickpocket</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).pickpocket}%</span>
                  </div>
                  <button style={{ padding: '4px 12px', fontSize: 12, borderRadius: 4, background: '#4a90e2', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => alert('Mind×5 + Agility×5 = ' + getActiveSkills(state).pickpocket + '%')}>Info</button>
                </div>
                
                <h3>Passive Skills</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', fontSize: 14 }}>
                  <div>Perception</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).perception}%</div>
                  
                  <div>Melee Defense</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).meleeDefense}</div>
                  
                  <div>Ranged Defense</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).rangedDefense}%</div>
                  
                  <div>Dodge</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).dodge}%</div>
                  
                  <div>Spell Resistance</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).spellResistance}%</div>
                  
                  <div>Stealth</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).stealth}%</div>
                  
                  <div>Persuasion</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).persuasion}%</div>
                  
                  <div>Intimidation</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).intimidation}%</div>
                </div>
                
                <div style={{ marginTop: 20, padding: 12, background: '#f0f0f0', borderRadius: 8, fontSize: 12 }}>
                  <strong>Currency:</strong> 💰 {stats.gold} Gold
                </div>
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
      
      {/* Stat Allocation Modal */}
      {statAllocMode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => { setStatAllocMode(false); setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 }); }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, maxWidth: 500, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Allocate Stat Points</h2>
            <p style={{ marginBottom: 20, color: '#666' }}>
              Available Points: <strong style={{ fontSize: 20, color: '#f39c12' }}>{stats.statPoints - (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision)}</strong>
            </p>
            
            {/* Power */}
            <div style={{ marginBottom: 16, padding: 12, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <strong style={{ color: '#e74c3c' }}>⚔️ Power</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>Melee Attack, Intimidation</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stats.power + pendingStats.power}/10</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  onClick={() => setPendingStats(p => ({ ...p, power: Math.max(-(stats.power - 1), p.power - 1) }))}
                  disabled={pendingStats.power <= -(stats.power - 1)}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: 18, 
                    borderRadius: 6, 
                    background: pendingStats.power <= -(stats.power - 1) ? '#ddd' : '#e74c3c', 
                    color: '#fff', 
                    border: 'none', 
                    cursor: pendingStats.power <= -(stats.power - 1) ? 'not-allowed' : 'pointer',
                    opacity: pendingStats.power <= -(stats.power - 1) ? 0.5 : 1
                  }}
                >
                  −
                </button>
                <div style={{ flex: 1, height: 24, background: '#f0f0f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.power + pendingStats.power) * 10}%`, height: '100%', background: '#e74c3c', transition: 'width 0.3s' }}></div>
                </div>
                <button 
                  onClick={() => {
                    const totalSpent = pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision;
                    if (totalSpent < stats.statPoints && stats.power + pendingStats.power < 10) {
                      setPendingStats(p => ({ ...p, power: p.power + 1 }));
                    }
                  }}
                  disabled={stats.power + pendingStats.power >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: 18, 
                    borderRadius: 6, 
                    background: (stats.power + pendingStats.power >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? '#ddd' : '#27ae60', 
                    color: '#fff', 
                    border: 'none', 
                    cursor: (stats.power + pendingStats.power >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 'not-allowed' : 'pointer',
                    opacity: (stats.power + pendingStats.power >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 0.5 : 1,
                    animation: (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0 ? 'pulse 2s infinite' : 'none'
                  }}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Mind */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f3f0ff', borderRadius: 8, border: '1px solid #d1c4e9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <strong style={{ color: '#9b59b6' }}>🧠 Mind</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>Magic, Investigation, Persuasion</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stats.mind + pendingStats.mind}/10</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  onClick={() => setPendingStats(p => ({ ...p, mind: Math.max(-(stats.mind - 1), p.mind - 1) }))}
                  disabled={pendingStats.mind <= -(stats.mind - 1)}
                  style={{ padding: '8px 16px', fontSize: 18, borderRadius: 6, background: pendingStats.mind <= -(stats.mind - 1) ? '#ddd' : '#9b59b6', color: '#fff', border: 'none', cursor: pendingStats.mind <= -(stats.mind - 1) ? 'not-allowed' : 'pointer', opacity: pendingStats.mind <= -(stats.mind - 1) ? 0.5 : 1 }}
                >
                  −
                </button>
                <div style={{ flex: 1, height: 24, background: '#f0f0f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.mind + pendingStats.mind) * 10}%`, height: '100%', background: '#9b59b6', transition: 'width 0.3s' }}></div>
                </div>
                <button 
                  onClick={() => {
                    const totalSpent = pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision;
                    if (totalSpent < stats.statPoints && stats.mind + pendingStats.mind < 10) {
                      setPendingStats(p => ({ ...p, mind: p.mind + 1 }));
                    }
                  }}
                  disabled={stats.mind + pendingStats.mind >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints}
                  style={{ padding: '8px 16px', fontSize: 18, borderRadius: 6, background: (stats.mind + pendingStats.mind >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? '#ddd' : '#27ae60', color: '#fff', border: 'none', cursor: (stats.mind + pendingStats.mind >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 'not-allowed' : 'pointer', opacity: (stats.mind + pendingStats.mind >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 0.5 : 1, animation: (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0 ? 'pulse 2s infinite' : 'none' }}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Agility */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f1f8f4', borderRadius: 8, border: '1px solid #c8e6c9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <strong style={{ color: '#2ecc71' }}>🏃 Agility</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>Ranged Attack, Dodge, Stealth</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stats.agility + pendingStats.agility}/10</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  onClick={() => setPendingStats(p => ({ ...p, agility: Math.max(-(stats.agility - 1), p.agility - 1) }))}
                  disabled={pendingStats.agility <= -(stats.agility - 1)}
                  style={{ padding: '8px 16px', fontSize: 18, borderRadius: 6, background: pendingStats.agility <= -(stats.agility - 1) ? '#ddd' : '#2ecc71', color: '#fff', border: 'none', cursor: pendingStats.agility <= -(stats.agility - 1) ? 'not-allowed' : 'pointer', opacity: pendingStats.agility <= -(stats.agility - 1) ? 0.5 : 1 }}
                >
                  −
                </button>
                <div style={{ flex: 1, height: 24, background: '#f0f0f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.agility + pendingStats.agility) * 10}%`, height: '100%', background: '#2ecc71', transition: 'width 0.3s' }}></div>
                </div>
                <button 
                  onClick={() => {
                    const totalSpent = pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision;
                    if (totalSpent < stats.statPoints && stats.agility + pendingStats.agility < 10) {
                      setPendingStats(p => ({ ...p, agility: p.agility + 1 }));
                    }
                  }}
                  disabled={stats.agility + pendingStats.agility >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints}
                  style={{ padding: '8px 16px', fontSize: 18, borderRadius: 6, background: (stats.agility + pendingStats.agility >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? '#ddd' : '#27ae60', color: '#fff', border: 'none', cursor: (stats.agility + pendingStats.agility >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 'not-allowed' : 'pointer', opacity: (stats.agility + pendingStats.agility >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 0.5 : 1, animation: (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0 ? 'pulse 2s infinite' : 'none' }}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Vision */}
            <div style={{ marginBottom: 20, padding: 12, background: '#e3f2fd', borderRadius: 8, border: '1px solid #bbdefb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <strong style={{ color: '#3498db' }}>👁️ Vision</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>Search, Perception, Ranged Defense</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stats.vision + pendingStats.vision}/10</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  onClick={() => setPendingStats(p => ({ ...p, vision: Math.max(-(stats.vision - 1), p.vision - 1) }))}
                  disabled={pendingStats.vision <= -(stats.vision - 1)}
                  style={{ padding: '8px 16px', fontSize: 18, borderRadius: 6, background: pendingStats.vision <= -(stats.vision - 1) ? '#ddd' : '#3498db', color: '#fff', border: 'none', cursor: pendingStats.vision <= -(stats.vision - 1) ? 'not-allowed' : 'pointer', opacity: pendingStats.vision <= -(stats.vision - 1) ? 0.5 : 1 }}
                >
                  −
                </button>
                <div style={{ flex: 1, height: 24, background: '#f0f0f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${(stats.vision + pendingStats.vision) * 10}%`, height: '100%', background: '#3498db', transition: 'width 0.3s' }}></div>
                </div>
                <button 
                  onClick={() => {
                    const totalSpent = pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision;
                    if (totalSpent < stats.statPoints && stats.vision + pendingStats.vision < 10) {
                      setPendingStats(p => ({ ...p, vision: p.vision + 1 }));
                    }
                  }}
                  disabled={stats.vision + pendingStats.vision >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints}
                  style={{ padding: '8px 16px', fontSize: 18, borderRadius: 6, background: (stats.vision + pendingStats.vision >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? '#ddd' : '#27ae60', color: '#fff', border: 'none', cursor: (stats.vision + pendingStats.vision >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 'not-allowed' : 'pointer', opacity: (stats.vision + pendingStats.vision >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 0.5 : 1, animation: (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0 ? 'pulse 2s infinite' : 'none' }}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Confirm/Cancel Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => {
                  setStatAllocMode(false);
                  setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 });
                }}
                style={{ flex: 1, padding: '12px', fontSize: 16, borderRadius: 8, background: '#95a5a6', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  const totalChanges = pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision;
                  if (totalChanges > 0) {
                    const allocateStats = (usePlayerStore as any).getState().allocateStats;
                    await allocateStats(pendingStats);
                    setStatAllocMode(false);
                    setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 });
                  }
                }}
                disabled={(pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  borderRadius: 8, 
                  background: (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0 ? '#ddd' : 'linear-gradient(135deg, #27ae60, #229954)', 
                  color: '#fff', 
                  border: 'none', 
                  cursor: (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0 ? 'not-allowed' : 'pointer',
                  opacity: (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0 ? 0.5 : 1
                }}
              >
                ✓ Confirm Changes
              </button>
            </div>
            
            <p style={{ marginTop: 16, fontSize: 12, color: '#999', textAlign: 'center' }}>
              Changes are permanent once confirmed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle: any = { background:'#222', color:'#fff', padding:12, margin:'8px 0', borderRadius:8, width:260, cursor:'pointer', border:'none', fontSize:14 }
