import React, { useEffect, useState, useRef } from 'react';
import { loadContent, getContentSnapshot, getStartAreaId, getAllAreas, getAreaById, getAllSpells } from './engine/contentLoader';
import { usePlayerStore } from './store/playerStore';
import { executeChoice } from './engine/execute';
import { getActiveSkills, getPassiveSkills, getTotalArmourRating } from './engine/skillCalculations';
import { initiateCombat, playerAttack, enemyTurn, selectEnemy, castSpell, intimidateEnemy, playerSlash, playerPivot } from './engine/combatNew';

export default function App() {
  const [page, setPage] = useState<'title'|'menu'|'game'>('title');
  const [loading, setLoading] = useState(true);
  const [mapZLevel, setMapZLevel] = useState<number>(0);
  
  // Add responsive CSS for health bar visibility
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Desktop: Show health in topNav, hide separate mobile bar */
      @media (min-width: 768px) {
        .desktop-health-bar {
          display: flex !important;
        }
        .mobile-health-bar {
          display: none !important;
        }
        .desktop-return-text {
          display: inline !important;
        }
        .mobile-close-x {
          display: none !important;
        }
      }
      
      /* Mobile: Hide health in topNav, show separate mobile bar */
      @media (max-width: 767px) {
        .desktop-health-bar {
          display: none !important;
        }
        .mobile-health-bar {
          display: block !important;
        }
        .desktop-return-text {
          display: none !important;
        }
        .mobile-close-x {
          display: inline !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [modalPage, setModalPage] = useState<'inventory'|'equipment'|'skills'|'spells'|'quests'|'map'|'settings'|null>(null);
  const [statAllocMode, setStatAllocMode] = useState(false); // Stat allocation modal
  const [spellTreePath, setSpellTreePath] = useState<string | null>(null); // Which path's spell tree to show
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null); // Selected spell for casting
  const [pendingStats, setPendingStats] = useState({ power: 0, mind: 0, agility: 0, vision: 0 }); // Pending changes
  const [actionResult, setActionResult] = useState<{ title: string; logs: string[]; success: boolean } | null>(null); // Action result popup
  const combatLogRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling combat log
  const newGame = usePlayerStore(s => s.newGame);
  const loadState = usePlayerStore(s => s.loadState);
  const currentAreaId = usePlayerStore(s => s.currentAreaId);
  const discoveredMap = usePlayerStore(s => s.discoveredMap);
  const lastCheckpointId = usePlayerStore(s => s.lastCheckpointId);
  const inventory = usePlayerStore(s => s.inventory);
  const equipment = usePlayerStore(s => s.equipment);
  const stats = usePlayerStore(s => s.stats);
  const health = usePlayerStore(s => s.health);
  const stamina = usePlayerStore(s => s.stamina);
  const maxStamina = usePlayerStore(s => s.maxStamina);
  const combat = usePlayerStore(s => s.combat);
  const spellsKnown = usePlayerStore(s => s.spellsKnown);
  const spellPathsUnlocked = usePlayerStore(s => s.spellPathsUnlocked);
  const combatSkills = usePlayerStore(s => s.combatSkills);
  const quests = usePlayerStore(s => s.quests);
  const questLog = usePlayerStore(s => s.questLog);
  const flags = usePlayerStore(s => s.flags);
  const state = (usePlayerStore as any).getState();

  useEffect(() => {
    async function init() {
      await loadContent();
      setLoading(false);
    }
    init();
  }, []);

  // Auto-scroll combat log to bottom when new entries are added
  useEffect(() => {
    if (combatLogRef.current && combat?.combatLog) {
      combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
    }
  }, [combat?.combatLog]);

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
      <div style={{height:'100vh', background:'#2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', position:'relative'}}>
        <div style={{textAlign:'center'}}>
          <h1 style={{fontSize:48, fontFamily:'serif', color:'#f5e6c8', textShadow:'2px 2px 8px rgba(0,0,0,0.6)'}}>Underfortress</h1>
          <div style={{marginTop:8,color:'#c9a84c'}}>A gamebook adventure</div>
        </div>
        <button aria-label="Enter the Underfortress" onClick={() => setPage('menu')} style={{marginTop:32, background:'transparent', border:'none', cursor:'pointer', padding:0}}>
          <img src="/content/ui/start_button.png" alt="Enter The Underfortress" style={{height:64, filter:'drop-shadow(0 4px 12px rgba(201,168,76,0.5))', transition:'transform 0.2s'}} onMouseOver={e => e.currentTarget.style.transform='scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'} />
        </button>
      </div>
    );
  }

  if (page === 'menu') {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#2a2a2a'}}>
        <h2 style={{marginBottom: 20, color: '#f5e6c8', fontFamily: 'serif'}}>Main Menu</h2>
        <div style={{width:260, display:'flex', flexDirection:'column', alignItems:'center'}}>
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
    for (const [dir, exitData] of Object.entries(exits)) {
      // Handle both string and object exit formats
      if (typeof exitData === 'string') {
        orderedChoices.push({ 
          id: `exit_${dir}`, 
          label: `Go to: ${getAreaById(exitData)?.title ?? exitData}`, 
          goToAreaId: exitData 
        });
      } else if (exitData && typeof exitData === 'object') {
        const exit = exitData as any;
        orderedChoices.push({ 
          id: `exit_${dir}`, 
          label: exit.label || `Go to: ${getAreaById(exit.target)?.title ?? exit.target}`,
          hoverMessage: exit.hoverMessage,
          requirements: exit.requirements,
          goToAreaId: exit.target 
        });
      }
    }
  }

  const onNextPage = async () => {
    if (!area) return;
    if ((area as any).continueToAreaId) {
      await (usePlayerStore as any).getState().moveTo?.((area as any).continueToAreaId);
      return;
    }
    const exIds = Object.values(area.exits || {}).map((e: any) => 
      typeof e === 'string' ? e : e.target
    );
    if (exIds.length === 1) {
      await (usePlayerStore as any).getState().moveTo?.(exIds[0]);
      return;
    }
    console.warn('No choices and no unambiguous continue path for area:', area?.id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <div style={{ 
        minHeight: 56, 
        display: 'flex', 
        alignItems: 'center', 
        backgroundColor: 'rgba(30,28,24,0.92)', 
        borderBottom: '1px solid rgba(201,168,76,0.3)',
        padding: '8px 12px',
        gap: 12,
        flexWrap: 'wrap',
        backdropFilter: 'blur(8px)',
        zIndex: 100
      }}>
        {/* Navigation Buttons */}
        <div 
          className="nav-buttons-container"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            justifyContent: 'space-around',
            flex: '0.67 1 auto',
            minWidth: 0
          }}>
          {(['inventory','equipment','skills','spells','quests','map'] as const).map(pg => (
            <button key={pg} onClick={() => setModalPage(pg)} style={{ background: 'linear-gradient(135deg, #c9a84c, #a07830)', border: '1px solid #e0c068', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', color: '#1a1000', padding: '6px 12px', borderRadius: 6, textTransform: 'capitalize' }}>{pg}</button>
          ))}
        </div>
        
        {/* Health Bar (Desktop Only) */}
        {page === 'game' && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            flex: '1 1 auto',
            minWidth: 300,
            maxWidth: 600
          }}
          className="desktop-health-bar"
          >
            <span style={{ fontSize: 12, fontWeight: 'bold', whiteSpace: 'nowrap', color: '#f5e6c8' }}>Health:</span>
            <div style={{ flex: 1, height: 20, background: '#e0e0e0', borderRadius: 10, overflow: 'hidden', position: 'relative', minWidth: 100 }}>
              <div style={{ 
                width: `${health}%`, 
                height: '100%', 
                background: health > 50 ? '#2ecc71' : health > 25 ? '#f39c12' : '#e74c3c',
                transition: 'width 0.3s ease, background 0.3s ease'
              }}></div>
              <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 11, fontWeight: 'bold', color: '#333' }}>
                {health}/100
              </span>
            </div>
            {stats.statPoints > 0 && (
              <button 
                onClick={() => {
                  setModalPage('skills');
                  setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 });
                }}
                style={{ 
                  padding: '4px 12px', 
                  fontSize: 11, 
                  fontWeight: 'bold',
                  borderRadius: 6, 
                  background: 'linear-gradient(135deg, #f39c12, #e67e22)', 
                  color: '#fff', 
                  border: '2px solid #d68910',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(243, 156, 18, 0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                ⚡ Spend {stats.statPoints} Stat Point{stats.statPoints !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}
        
        {/* Settings Button */}
        <button onClick={() => setModalPage('settings')} title="Settings" style={{ background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer', color:'#f5e6c8' }}>⚙️</button>
      </div>
      
      {/* Health Bar (Mobile Only) */}
      {page === 'game' && (
        <div className="mobile-health-bar" style={{ padding: '8px 20px', background: 'rgba(30,28,24,0.92)', borderBottom: '1px solid rgba(201,168,76,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 1200, margin: '0 auto' }}>
            <span style={{ fontSize: 14, fontWeight: 'bold', minWidth: 60, color: '#f5e6c8' }}>Health:</span>
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
            {stats.statPoints > 0 && (
              <button 
                onClick={() => {
                  setModalPage('skills');
                  setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 });
                }}
                style={{ 
                  padding: '6px 16px', 
                  fontSize: 13, 
                  fontWeight: 'bold',
                  borderRadius: 6, 
                  background: 'linear-gradient(135deg, #f39c12, #e67e22)', 
                  color: '#fff', 
                  border: '2px solid #d68910',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(243, 156, 18, 0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                ⚡ Spend {stats.statPoints} SP
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Main Content - Centered with fullscreen area background */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', overflowY: 'auto', position: 'relative', background: '#2a2a2a' }}>
        {/* Fullscreen background image keyed to area */}
        {area && (() => {
          const areaId = area.id || currentAreaId || '';
          const bgPath = `/content/leonardo/nano banana pro/desktop/${areaId}.jpg`;
          return (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${bgPath}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 0
            }} />
          );
        })()}
        {area ? (
          <div style={{ maxWidth: 800, width: '100%', position: 'relative', zIndex: 1, marginTop: 'auto', padding: '20px 20px 0 20px' }}>
            <div style={{ background: 'rgba(30,28,24,0.80)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '20px 28px', border: '1px solid rgba(201,168,76,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <h1 style={{ marginBottom: 16, textAlign: 'center', fontSize: 18, color: '#f5e6c8', textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}>{area.title ?? area.id}</h1>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, textAlign: 'center', color: '#e8dcc8' }}>{area.description}</p>
            </div>
            
            {/* Combat UI - Fixed Overlay Beneath TopNav */}
            {combat && (combat.active || combat.victoryScreen || combat.defeatScreen) && (
              <>
                {/* Blocker overlay to prevent clicking area buttons (starts beneath topNav) */}
                <div style={{
                  position: 'fixed',
                  top: 60,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  zIndex: 9998
                }} />
                
                {/* Combat Window */}
                <div style={{ 
                  position: 'fixed',
                  top: 60,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflowY: 'auto',
                  padding: 20,
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  border: '3px solid #e74c3c',
                  borderTop: 'none',
                  boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
                  zIndex: 9999
                }}>
                {/* Victory Screen Overlay */}
                {combat.victoryScreen && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      borderRadius: 12,
                      padding: 40,
                      maxWidth: 600,
                      width: '90%',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      border: '3px solid #e74c3c'
                    }}>
                      <h2 style={{ 
                        textAlign: 'center', 
                        color: '#2ecc71', 
                        fontSize: 36, 
                        marginBottom: 24,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        ⚔️ Victory! ⚔️
                      </h2>
                      
                      {/* Enemies Killed */}
                      {combat.victoryScreen.enemiesKilled.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <h3 style={{ color: '#e74c3c', marginBottom: 12, fontSize: 18, fontWeight: 'bold' }}>
                            💀 Slain: {combat.victoryScreen.enemiesKilled.length}
                          </h3>
                          <div style={{ 
                            background: 'rgba(0,0,0,0.4)', 
                            padding: 12, 
                            borderRadius: 8,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8
                          }}>
                            {combat.victoryScreen.enemiesKilled.map((enemy, idx) => (
                              <div key={idx} style={{
                                background: 'rgba(231, 76, 60, 0.6)',
                                padding: '6px 12px',
                                borderRadius: 6,
                                color: '#fff',
                                fontSize: 14,
                                border: '2px solid rgba(192, 57, 43, 0.8)'
                              }}>
                                ☠️ {enemy.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Enemies Imprisoned */}
                      {combat.victoryScreen.enemiesImprisoned.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <h3 style={{ color: '#f39c12', marginBottom: 12, fontSize: 18, fontWeight: 'bold' }}>
                            ⛓️ Imprisoned: {combat.victoryScreen.enemiesImprisoned.length}
                          </h3>
                          <div style={{ 
                            background: 'rgba(0,0,0,0.4)', 
                            padding: 12, 
                            borderRadius: 8,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8
                          }}>
                            {combat.victoryScreen.enemiesImprisoned.map((enemy, idx) => (
                              <div key={idx} style={{
                                background: 'rgba(243, 156, 18, 0.6)',
                                padding: '6px 12px',
                                borderRadius: 6,
                                color: '#fff',
                                fontSize: 14,
                                border: '2px solid rgba(211, 84, 0, 0.8)'
                              }}>
                                ⛓️ {enemy.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Loot Summary */}
                      <div style={{ marginBottom: 24 }}>
                        <h3 style={{ color: '#f1c40f', marginBottom: 12, fontSize: 18, fontWeight: 'bold' }}>
                          💰 Rewards:
                        </h3>
                        <div style={{ 
                          background: 'rgba(0,0,0,0.4)', 
                          padding: 16, 
                          borderRadius: 8 
                        }}>
                          {combat.victoryScreen.goldLooted > 0 && (
                            <div style={{ color: '#f1c40f', fontSize: 16, marginBottom: 8 }}>
                              💰 {combat.victoryScreen.goldLooted} Gold
                            </div>
                          )}
                          {combat.victoryScreen.statPointsGained > 0 && (
                            <div style={{ color: '#3498db', fontSize: 16, marginBottom: 8 }}>
                              ⭐ {combat.victoryScreen.statPointsGained} Stat Points
                            </div>
                          )}
                          {combat.victoryScreen.itemsLooted.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              {combat.victoryScreen.itemsLooted.map((item, idx) => (
                                <div key={idx} style={{ color: '#fff', fontSize: 14, marginBottom: 4 }}>
                                  📦 {item.itemId} x{item.qty}
                                </div>
                              ))}
                            </div>
                          )}
                          {combat.victoryScreen.goldLooted === 0 && 
                           combat.victoryScreen.statPointsGained === 0 && 
                           combat.victoryScreen.itemsLooted.length === 0 && (
                            <div style={{ color: '#95a5a6', fontSize: 14, fontStyle: 'italic' }}>
                              No loot found.
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Continue Button */}
                      <button
                        onClick={() => {
                          const currentState = usePlayerStore.getState();
                          const newFlags = { ...currentState.flags };
                          
                          console.log(`🏁 Victory Continue clicked. combat.originAreaId=${combat.originAreaId}, combat.threatId=${combat.threatId}`);
                          
                          // Mark area as combat defeated if this was triggered by entering the area
                          if (combat.originAreaId) {
                            newFlags[`area:${combat.originAreaId}:combat_defeated`] = true;
                            console.log(`✅ Marked area ${combat.originAreaId} as combat defeated`);
                          }
                          
                          // Mark threat as defeated if combat was triggered by a threat
                          if (combat.threatId && combat.threatId !== 'direct_combat') {
                            newFlags[`threat:${combat.threatId}:defeated`] = true;
                            console.log(`✅ Marked threat ${combat.threatId} as defeated`);
                            
                            // Check if this was the prison patrol
                            if (combat.threatId === 't_prison_patrol_01') {
                              // If goblin was shot, redirect to hunt it down
                              if (newFlags['goblin_shot'] && !newFlags['goblin_finished']) {
                                console.log('🩸 Goblin was shot - must hunt it down!');
                                usePlayerStore.setState({ 
                                  combat: undefined,
                                  flags: newFlags
                                });
                                // Navigate to wounded goblin area
                                (usePlayerStore as any).getState().moveTo?.('u_wounded_goblin_trail');
                                return;
                              }
                              
                              // If goblin wasn't shot at all, spawn pursuit patrol
                              if (!newFlags['goblin_shot']) {
                                console.log('⚠️ Goblin was not shot - starting pursuit patrol!');
                                const newActiveThreats = [...((currentState as any).activeThreats || [])];
                                newActiveThreats.push({
                                  id: 't_prison_pursuit_01',
                                  threatId: 't_prison_pursuit_01',
                                  enemyGroupId: 'prison_pursuit',
                                  distance: 5,
                                  direction: 'n',
                                  speed: 2,
                                  targetAreaId: currentState.currentAreaId,
                                  hazards: []
                                });
                                usePlayerStore.setState({ 
                                  combat: undefined,
                                  flags: newFlags,
                                  activeThreats: newActiveThreats
                                } as any);
                                return;
                              }
                            }
                          }
                          
                          // Check if this was the wounded goblin - mark as finished and cancel pursuit
                          if (combat.threatId === 'direct_combat' && combat.enemies && 
                              combat.enemies.some((e: any) => e.enemyId === 'wounded_goblin_runner')) {
                            newFlags['goblin_finished'] = true;
                            console.log('✅ Wounded goblin finished - pursuit cancelled');
                            
                            // Remove pursuit threat if it exists
                            const activeThreats = ((currentState as any).activeThreats || []);
                            const filteredThreats = activeThreats.filter((t: any) => 
                              t.id !== 't_prison_pursuit_01' && t.threatId !== 't_prison_pursuit_01'
                            );
                            
                            usePlayerStore.setState({ 
                              combat: undefined,
                              flags: newFlags,
                              activeThreats: filteredThreats
                            } as any);
                            return;
                          }
                          
                          // Clear combat state and update flags
                          usePlayerStore.setState({ 
                            combat: undefined,
                            flags: newFlags
                          });
                          // Trigger autosave by accessing the store's save mechanism
                          const storage = localStorage;
                          if (storage) {
                            storage.setItem('underfortress_save_v1', JSON.stringify(usePlayerStore.getState()));
                            console.log('💾 Saved after combat victory');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '16px 32px',
                          fontSize: 18,
                          fontWeight: 'bold',
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                          color: '#fff',
                          border: '2px solid #229954',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(46, 204, 113, 0.4)',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        Continue ➜
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Defeat Screen Overlay */}
                {combat.defeatScreen && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)',
                      borderRadius: 16,
                      padding: 40,
                      maxWidth: 600,
                      width: '90%',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                      border: '4px solid #e74c3c'
                    }}>
                      <h2 style={{ 
                        textAlign: 'center', 
                        color: '#fff', 
                        fontSize: 42, 
                        marginBottom: 16,
                        textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
                      }}>
                        💀 DEFEATED 💀
                      </h2>
                      
                      <p style={{
                        textAlign: 'center',
                        color: '#ecf0f1',
                        fontSize: 18,
                        marginBottom: 32,
                        lineHeight: 1.6
                      }}>
                        You were slain by <strong style={{ color: '#e74c3c' }}>{combat.defeatScreen.killedBy}</strong>
                      </p>
                      
                      {/* Respawn Info */}
                      <div style={{ 
                        background: 'rgba(0,0,0,0.4)', 
                        padding: 20, 
                        borderRadius: 8,
                        marginBottom: 24,
                        border: '2px solid rgba(236, 240, 241, 0.2)'
                      }}>
                        <div style={{ 
                          color: '#95a5a6', 
                          fontSize: 14, 
                          textAlign: 'center',
                          marginBottom: 8
                        }}>
                          You will respawn at:
                        </div>
                        <div style={{ 
                          color: '#3498db', 
                          fontSize: 20, 
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          📍 {combat.defeatScreen.checkpointName}
                        </div>
                        <div style={{
                          color: '#e67e22',
                          fontSize: 14,
                          textAlign: 'center',
                          marginTop: 12,
                          fontStyle: 'italic'
                        }}>
                          Health restored to full
                        </div>
                      </div>
                      
                      {/* Respawn Button */}
                      <button
                        onClick={() => {
                          const currentState = usePlayerStore.getState();
                          // Respawn at checkpoint with full health
                          usePlayerStore.setState({ 
                            combat: undefined,
                            health: 100,
                            currentAreaId: currentState.lastCheckpointId || currentState.currentAreaId
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '16px 32px',
                          fontSize: 18,
                          fontWeight: 'bold',
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, #3498db, #2980b9)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(52, 152, 219, 0.4)',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        ⚰️ Respawn
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Turn Indicator */}
                <div style={{ 
                  textAlign: 'center', 
                  marginBottom: 16, 
                  padding: 12, 
                  background: combat.playerTurn ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                  borderRadius: 8,
                  border: `2px solid ${combat.playerTurn ? '#2ecc71' : '#e74c3c'}`,
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {combat.playerTurn ? '⚔️ Your Turn' : '🛡️ Enemy Turn'} - Turn {combat.turnNumber}
                </div>

                {/* Combat Participants Container */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 20, alignItems: 'flex-start', justifyContent: 'center' }}>
                  {/* Player Display */}
                  <div>
                    <h3 style={{ color: '#f5e6c8', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                      You
                    </h3>
                    <div style={{
                      padding: 16,
                      background: 'rgba(241, 196, 15, 0.2)',
                      border: '3px solid #f1c40f',
                      borderRadius: 12,
                      width: 160,
                      minHeight: 220,
                      boxShadow: '0 0 20px rgba(241, 196, 15, 0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f1c40f, #e67e22)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36, marginBottom: 8, border: '2px solid #f39c12'
                      }}>
                        🛡️
                      </div>
                      <div style={{ color: '#f1c40f', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
                        Hero
                      </div>
                      {/* Health Bar */}
                      <div style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        borderRadius: 8, 
                        height: 12, 
                        overflow: 'hidden',
                        marginBottom: 4 
                      }}>
                        <div style={{ 
                          height: '100%', 
                          background: health > 50 
                            ? 'linear-gradient(90deg, #2ecc71, #27ae60)' 
                            : health > 25 
                              ? 'linear-gradient(90deg, #f39c12, #e67e22)'
                              : 'linear-gradient(90deg, #e74c3c, #c0392b)',
                          width: `${Math.max(0, health)}%`,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <div style={{ color: '#f1c40f', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
                        {Math.max(0, health)} / 100 HP
                      </div>
                      {/* Stamina Bar */}
                      <div style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        borderRadius: 8, 
                        height: 10, 
                        overflow: 'hidden',
                        marginTop: 8,
                        marginBottom: 4 
                      }}>
                        <div style={{ 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #3498db, #2980b9)',
                          width: `${Math.max(0, (stamina / maxStamina) * 100)}%`,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <div style={{ color: '#5dade2', fontSize: 11, textAlign: 'center', fontWeight: 'bold' }}>
                        ⚡ {Math.max(0, stamina)} / {maxStamina} Stamina
                      </div>
                    </div>
                  </div>

                  {/* Enemy Display */}
                  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    {/* Front Row Enemies */}
                    <div>
                      <h3 style={{ color: '#f5e6c8', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Front Line
                      </h3>
                      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'flex-end' }}>
                        {combat.enemies.filter(e => {
                          // Show if alive and in front
                          if (e.health > 0 && e.position === 'front') return true;
                          // Show if dead but within 2 seconds
                          if (e.health <= 0 && e.position === 'front' && e.deathTimestamp && (Date.now() - e.deathTimestamp) < 2000) return true;
                          return false;
                        }).map((enemy) => {
                          const isSelected = combat.selectedEnemyId === enemy.instanceId;
                          const isDead = enemy.health <= 0;
                          const nameLC = (enemy.name || '').toLowerCase();
                          const isOrc = nameLC.includes('orc');
                          const creatureImg = isOrc ? '/content/creatures/orc.png' : '/content/creatures/goblin.png';
                          
                          return (
                            <div
                              key={enemy.instanceId}
                              onClick={() => {
                                if (!isDead && combat.playerTurn) {
                                  const currentState = usePlayerStore.getState();
                                  const newState = selectEnemy(enemy.instanceId, currentState);
                                  usePlayerStore.setState({ combat: newState.combat });
                                }
                              }}
                              style={{
                                padding: 16,
                                background: isDead
                                  ? 'rgba(127, 140, 141, 0.3)'
                                  : isSelected 
                                    ? 'rgba(231, 76, 60, 0.4)' 
                                    : 'rgba(52, 73, 94, 0.6)',
                                border: `3px solid ${isDead ? '#7f8c8d' : isSelected ? '#e74c3c' : '#34495e'}`,
                                borderRadius: 12,
                                width: 160,
                                minHeight: 220,
                                cursor: isDead || !combat.playerTurn ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: isDead ? 0.4 : 1,
                                boxShadow: isSelected ? '0 0 20px rgba(231, 76, 60, 0.6)' : 'none',
                                display: 'flex',
                                flexDirection: 'column' as const,
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ 
                                width: 72, height: 72, borderRadius: '50%',
                                overflow: isOrc ? 'visible' : 'hidden',
                                marginBottom: 8,
                                filter: isDead ? 'grayscale(100%)' : 'none',
                                position: 'relative',
                                flexShrink: 0
                              }}>
                                {isDead ? (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: 'rgba(0,0,0,0.3)', borderRadius: '50%' }}>💀</div>
                                ) : (
                                  <img src={creatureImg} alt={enemy.name} style={{
                                    width: isOrc ? 88 : 72,
                                    height: isOrc ? 88 : 72,
                                    objectFit: 'cover',
                                    borderRadius: isOrc ? 0 : '50%',
                                    position: isOrc ? 'absolute' : 'static',
                                    top: isOrc ? -8 : undefined,
                                    left: isOrc ? -8 : undefined
                                  }} />
                                )}
                              </div>
                              <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
                                {enemy.name}
                              </div>
                              {/* Health Bar */}
                              <div style={{ 
                                background: 'rgba(0,0,0,0.3)', 
                                borderRadius: 8, 
                                height: 12, 
                                overflow: 'hidden',
                                marginBottom: 4
                              }}>
                                <div style={{ 
                                  height: '100%', 
                                  background: enemy.health > enemy.maxHealth * 0.5 
                                    ? 'linear-gradient(90deg, #2ecc71, #27ae60)' 
                                    : enemy.health > enemy.maxHealth * 0.25 
                                      ? 'linear-gradient(90deg, #f39c12, #e67e22)'
                                      : 'linear-gradient(90deg, #e74c3c, #c0392b)',
                                  width: `${Math.max(0, (enemy.health / enemy.maxHealth) * 100)}%`,
                                  transition: 'width 0.3s'
                                }} />
                              </div>
                              <div style={{ color: '#ecf0f1', fontSize: 12, textAlign: 'center' }}>
                                {Math.max(0, enemy.health)} / {enemy.maxHealth} HP
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Reserve Enemies */}
                    {(() => {
                      const reserveEnemies = combat.enemies.filter(e => e.health > 0 && e.position === 'back');
                      if (reserveEnemies.length === 0) return null;
                      
                      return (
                        <div>
                          <h3 style={{ color: '#f5e6c8', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                            Reserve ({reserveEnemies.length})
                          </h3>
                          <div style={{ 
                            maxHeight: 400, 
                            overflowY: reserveEnemies.length > 4 ? 'auto' : 'visible',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            paddingRight: reserveEnemies.length > 4 ? 8 : 0
                          }}>
                            {reserveEnemies.map((enemy) => {
                              const nameLC = (enemy.name || '').toLowerCase();
                              const isOrc = nameLC.includes('orc');
                              const creatureImg = isOrc ? '/content/creatures/orc.png' : '/content/creatures/goblin.png';
                              return (
                              <div
                                key={enemy.instanceId}
                                style={{
                                  padding: 10,
                                  background: 'rgba(52, 73, 94, 0.4)',
                                  border: '2px solid #34495e',
                                  borderRadius: 8,
                                  width: 110,
                                  opacity: 0.7,
                                  display: 'flex',
                                  flexDirection: 'column' as const,
                                  alignItems: 'center'
                                }}
                              >
                                <div style={{ 
                                  width: 48, height: 48, borderRadius: '50%',
                                  overflow: isOrc ? 'visible' : 'hidden',
                                  marginBottom: 4, position: 'relative', flexShrink: 0
                                }}>
                                  <img src={creatureImg} alt={enemy.name} style={{
                                    width: isOrc ? 58 : 48,
                                    height: isOrc ? 58 : 48,
                                    objectFit: 'cover',
                                    borderRadius: isOrc ? 0 : '50%',
                                    position: isOrc ? 'absolute' : 'static',
                                    top: isOrc ? -5 : undefined,
                                    left: isOrc ? -5 : undefined
                                  }} />
                                </div>
                                <div style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 }}>
                                  {enemy.name}
                                </div>
                                {/* Health Bar */}
                                <div style={{ 
                                  background: 'rgba(0,0,0,0.3)', 
                                  borderRadius: 6, 
                                  height: 8, 
                                  overflow: 'hidden',
                                  marginBottom: 3
                                }}>
                                  <div style={{ 
                                    height: '100%', 
                                    background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
                                    width: `${Math.max(0, (enemy.health / enemy.maxHealth) * 100)}%`,
                                    transition: 'width 0.3s'
                                  }} />
                                </div>
                                <div style={{ color: '#ecf0f1', fontSize: 10, textAlign: 'center' }}>
                                  {Math.max(0, enemy.health)} / {enemy.maxHealth} HP
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Combat Actions */}
                {combat.playerTurn && (
                  <div style={{ marginBottom: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        if (!combat.selectedEnemyId) {
                          alert('Select an enemy first!');
                          return;
                        }
                        const currentState = usePlayerStore.getState();
                        const result = playerAttack(currentState);
                        usePlayerStore.setState({ 
                          combat: result.state.combat,
                          activeBuffs: result.state.activeBuffs,
                          stats: result.state.stats,
                          inventory: result.state.inventory,
                          stamina: result.state.stamina
                        });
                        
                        // Enemy turn after player attacks
                        setTimeout(() => {
                          if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                            const enemyResult = enemyTurn(result.state);
                            usePlayerStore.setState({ 
                              combat: enemyResult.state.combat,
                              health: enemyResult.state.health,
                              activeBuffs: enemyResult.state.activeBuffs,
                              stats: enemyResult.state.stats,
                              inventory: enemyResult.state.inventory
                            });
                          }
                        }, 800);
                      }}
                      disabled={!combat.selectedEnemyId || combat.enemies.every(e => e.health <= 0)}
                      style={{
                        padding: '12px 32px',
                        fontSize: 16,
                        fontWeight: 'bold',
                        borderRadius: 8,
                        background: combat.selectedEnemyId && combat.enemies.some(e => e.instanceId === combat.selectedEnemyId && e.health > 0)
                          ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
                          : '#7f8c8d',
                        color: '#fff',
                        border: 'none',
                        cursor: combat.selectedEnemyId && combat.enemies.some(e => e.instanceId === combat.selectedEnemyId && e.health > 0) ? 'pointer' : 'not-allowed',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }}
                    >
                      ⚔️ Attack {combat.selectedEnemyId ? combat.enemies.find(e => e.instanceId === combat.selectedEnemyId)?.name : 'Enemy'}
                    </button>

                    {/* Slash Button - Attack All Front Enemies */}
                    {(() => {
                      const frontEnemies = combat.enemies.filter(e => e.health > 0 && e.position === 'front');
                      const slashCost = 3;
                      const hasSkill = combatSkills?.includes('slash');
                      const hasStamina = stamina >= slashCost;
                      if (frontEnemies.length < 2 || !hasSkill) return null;
                      
                      return (
                        <button
                          onClick={() => {
                            if (!hasStamina) {
                              alert('Out of Stamina!');
                              return;
                            }
                            const currentState = usePlayerStore.getState();
                            const result = playerSlash(currentState);
                            usePlayerStore.setState({ 
                              combat: result.state.combat,
                              stamina: Math.max(0, currentState.stamina - slashCost),
                              activeBuffs: result.state.activeBuffs,
                              stats: result.state.stats,
                              inventory: result.state.inventory
                            });
                            
                            // Enemy turn after slash
                            setTimeout(() => {
                              if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                                const enemyResult = enemyTurn(result.state);
                                usePlayerStore.setState({ 
                                  combat: enemyResult.state.combat,
                                  health: enemyResult.state.health,
                                  activeBuffs: enemyResult.state.activeBuffs,
                                  stats: enemyResult.state.stats,
                                  inventory: enemyResult.state.inventory
                                });
                              }
                            }, 1200);
                          }}
                          disabled={!hasStamina}
                          style={{
                            padding: '12px 32px',
                            fontSize: 16,
                            fontWeight: 'bold',
                            borderRadius: 8,
                            background: hasStamina ? 'linear-gradient(135deg, #e67e22, #d35400)' : '#95a5a6',
                            color: '#fff',
                            border: 'none',
                            cursor: hasStamina ? 'pointer' : 'not-allowed',
                            boxShadow: hasStamina ? '0 4px 12px rgba(230, 126, 34, 0.4)' : 'none',
                            opacity: hasStamina ? 1 : 0.6
                          }}
                        >
                          ⚔️💥 Slash All ({frontEnemies.length} enemies) [{slashCost}⚡]
                        </button>
                      );
                    })()}

                    {/* Pivot Button - Attack + Defense Boost */}
                    {(() => {
                      const pivotCost = 1;
                      const hasSkill = combatSkills?.includes('pivot');
                      const hasStamina = stamina >= pivotCost;
                      if (!hasSkill) return null;
                      
                      return (
                        <button
                          onClick={() => {
                            if (!combat.selectedEnemyId) {
                              alert('Select an enemy first!');
                              return;
                            }
                            if (!hasStamina) {
                              alert('Out of Stamina!');
                              return;
                            }
                            const currentState = usePlayerStore.getState();
                            const result = playerPivot(combat.selectedEnemyId, currentState);
                            usePlayerStore.setState({ 
                              combat: result.state.combat,
                              stamina: Math.max(0, currentState.stamina - pivotCost),
                              activeBuffs: result.state.activeBuffs
                            });
                            
                            // Enemy turn after pivot
                            setTimeout(() => {
                              if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                                const enemyResult = enemyTurn(result.state);
                                usePlayerStore.setState({ 
                                  combat: enemyResult.state.combat,
                                  health: enemyResult.state.health,
                                  activeBuffs: enemyResult.state.activeBuffs
                                });
                              }
                            }, 1000);
                          }}
                          disabled={!hasStamina}
                          style={{
                            padding: '12px 32px',
                            fontSize: 16,
                            fontWeight: 'bold',
                            borderRadius: 8,
                            background: hasStamina ? 'linear-gradient(135deg, #16a085, #138d75)' : '#95a5a6',
                            color: '#fff',
                            border: 'none',
                            cursor: hasStamina ? 'pointer' : 'not-allowed',
                            boxShadow: hasStamina ? '0 4px 12px rgba(22, 160, 133, 0.4)' : 'none',
                            opacity: hasStamina ? 1 : 0.6
                          }}
                        >
                          🔄 Pivot [{pivotCost}⚡]
                        </button>
                      );
                    })()}

                    {/* Intimidation Button - Send to Dungeons */}
                    {(() => {
                      if (!combat.selectedEnemyId) return null;
                      const selectedEnemy = combat.enemies.find(e => e.instanceId === combat.selectedEnemyId);
                      if (!selectedEnemy || selectedEnemy.health <= 0) return null;
                      
                      // Check if enemy is at or below 50% health
                      const healthPercent = (selectedEnemy.health / selectedEnemy.maxHealth) * 100;
                      if (healthPercent > 50) return null;
                      
                      // Get enemy definition to check if humanoid
                      const content = getContentSnapshot();
                      const enemyDef = content?.enemies?.get?.(selectedEnemy.enemyId);
                      if (!enemyDef || enemyDef.kind !== 'humanoid') return null;
                      
                      // Check if inside city walls
                      const currentAreaData = content?.areas?.get?.(currentAreaId as string);
                      const insideCityWalls = currentAreaData?.tags?.includes('city') || currentAreaData?.tags?.includes('fortress');
                      if (!insideCityWalls) return null;
                      
                      return (
                        <button
                          onClick={() => {
                            const currentState = usePlayerStore.getState();
                            const result = intimidateEnemy(combat.selectedEnemyId!, currentState);
                            usePlayerStore.setState({ 
                              combat: result.state.combat,
                              health: result.state.health,
                              stats: result.state.stats,
                              inventory: result.state.inventory
                            });
                            
                            // Enemy turn after intimidation attempt
                            if (result.success) {
                              // If successful, check if combat ended
                              setTimeout(() => {
                                if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                                  const enemyResult = enemyTurn(result.state);
                                  usePlayerStore.setState({ 
                                    combat: enemyResult.state.combat,
                                    health: enemyResult.state.health,
                                    stats: enemyResult.state.stats,
                                    inventory: enemyResult.state.inventory
                                  });
                                }
                              }, 1200);
                            } else {
                              // If failed, enemy turn
                              setTimeout(() => {
                                if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                                  const enemyResult = enemyTurn(result.state);
                                  usePlayerStore.setState({ 
                                    combat: enemyResult.state.combat,
                                    health: enemyResult.state.health,
                                    stats: enemyResult.state.stats,
                                    inventory: enemyResult.state.inventory
                                  });
                                }
                              }, 1200);
                            }
                          }}
                          style={{
                            padding: '12px 32px',
                            fontSize: 16,
                            fontWeight: 'bold',
                            borderRadius: 8,
                            background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(243, 156, 18, 0.4)'
                          }}
                        >
                          ⛓️ Send {selectedEnemy.name} to Dungeons
                        </button>
                      );
                    })()}

                    {/* Spell Casting */}
                    {spellsKnown.length > 0 && (
                      <>
                        <select
                          value={selectedSpell || ''}
                          onChange={(e) => setSelectedSpell(e.target.value || null)}
                          style={{
                            padding: '12px 16px',
                            fontSize: 14,
                            fontWeight: 'bold',
                            borderRadius: 8,
                            background: '#9b59b6',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(155, 89, 182, 0.4)'
                          }}
                        >
                          <option value="">✨ Select Spell</option>
                          {spellsKnown.map(spellId => {
                            const spell = getAllSpells().find((s: any) => s.id === spellId) as any;
                            return spell ? (
                              <option key={spellId} value={spellId}>
                                {spell.name} ({spell.targeting})
                              </option>
                            ) : null;
                          })}
                        </select>

                        {selectedSpell && (() => {
                          const spell = getAllSpells().find((s: any) => s.id === selectedSpell) as any;
                          // Determine stamina cost based on spell path (all paths cost 1 SP to unlock)
                          const spellCost = 1;
                          const hasStamina = stamina >= spellCost;
                          
                          return (
                            <button
                              onClick={() => {
                                if (!spell) return;
                                
                                if (!hasStamina) {
                                  alert('Out of Stamina!');
                                  return;
                                }

                                let targetIds: string[] | undefined = undefined;
                                
                                // Handle targeting
                                if (spell.targeting === 'single') {
                                  if (!combat.selectedEnemyId) {
                                    alert('Select an enemy target first!');
                                    return;
                                  }
                                  targetIds = [combat.selectedEnemyId];
                                }
                                // multi and all_enemies are handled automatically in castSpell
                                
                                const currentState = usePlayerStore.getState();
                                const result = castSpell(selectedSpell, targetIds, currentState);
                                usePlayerStore.setState({ 
                                  combat: result.state.combat,
                                  health: result.state.health,
                                  stamina: Math.max(0, currentState.stamina - spellCost),
                                  activeBuffs: result.state.activeBuffs,
                                  stats: result.state.stats,
                                  inventory: result.state.inventory
                                });
                                setSelectedSpell(null);
                                
                                // Enemy turn after casting
                                setTimeout(() => {
                                  if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                                    const enemyResult = enemyTurn(result.state);
                                    usePlayerStore.setState({ 
                                      combat: enemyResult.state.combat,
                                      health: enemyResult.state.health,
                                      stats: enemyResult.state.stats,
                                      inventory: enemyResult.state.inventory
                                    });
                                  }
                                }, 1200);
                              }}
                              disabled={!hasStamina}
                              style={{
                                padding: '12px 24px',
                                fontSize: 16,
                                fontWeight: 'bold',
                                borderRadius: 8,
                                background: hasStamina ? 'linear-gradient(135deg, #8e44ad, #9b59b6)' : '#95a5a6',
                                color: '#fff',
                                border: 'none',
                                cursor: hasStamina ? 'pointer' : 'not-allowed',
                                boxShadow: hasStamina ? '0 4px 12px rgba(142, 68, 173, 0.4)' : 'none',
                                opacity: hasStamina ? 1 : 0.6
                              }}
                            >
                              ✨ Cast {spell.name} [1⚡]
                            </button>
                          );
                        })()}
                      </>
                    )}
                  </div>
                )}

                {/* Combat Log */}
                <div 
                  ref={combatLogRef}
                  style={{ 
                    background: 'rgba(0,0,0,0.4)', 
                    borderRadius: 8, 
                    padding: 16,
                    maxHeight: 400,
                    minHeight: 300,
                    overflowY: 'auto'
                  }}
                >
                  <h4 style={{ color: '#ecf0f1', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 'bold' }}>
                    Combat Log
                  </h4>
                  {combat.combatLog.slice(-60).map((entry, idx) => {
                    // Check if this is a player action entry
                    const isPlayerAction = entry.startsWith('🗡️ You') || entry.startsWith('⚔️💥 You') || entry.startsWith('✨ Casting') || entry.startsWith('🛡️ You');
                    const isPlayerRoll = entry.startsWith('→ Attack roll') || entry.startsWith('📊');
                    const isTurnMarker = entry.startsWith('---');
                    
                    return (
                      <div key={idx} style={{ 
                        color: isPlayerAction ? '#2ecc71' : isPlayerRoll ? '#3498db' : isTurnMarker ? '#f39c12' : '#bdc3c7', 
                        fontSize: isPlayerAction ? 16 : isPlayerRoll ? 15 : 13, 
                        fontWeight: isPlayerAction ? 'bold' : isPlayerRoll ? '600' : 'normal',
                        marginBottom: isPlayerAction ? 8 : 4,
                        paddingLeft: isPlayerAction ? 12 : 8,
                        paddingTop: isPlayerAction ? 4 : 0,
                        paddingBottom: isPlayerAction ? 4 : 0,
                        borderLeft: isPlayerAction ? '4px solid #2ecc71' : isPlayerRoll ? '3px solid #3498db' : '2px solid #34495e',
                        background: isPlayerAction ? 'rgba(46, 204, 113, 0.1)' : 'transparent',
                        borderRadius: isPlayerAction ? 4 : 0
                      }}>
                        {entry}
                      </div>
                    );
                  })}
                </div>
              </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ color: '#f5e6c8' }}>No area loaded.</div>
        )}
      </div>

      {/* Bottom Buttons - Centered */}
      <div style={{ borderTop: '1px solid rgba(201,168,76,0.3)', padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', background: 'rgba(30,28,24,0.92)', backdropFilter: 'blur(8px)' }}>
        {orderedChoices.length > 0 ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 800 }}>
            {orderedChoices.map((c:any, idx:number) => {
              // Check requirements
              const meetsRequirements = !c.requirements || (() => {
                try {
                  const { evaluateRequirements } = require('./engine/requirements');
                  const fullState = usePlayerStore.getState();
                  return evaluateRequirements(c.requirements, fullState);
                } catch {
                  return true; // If requirements check fails, allow the choice
                }
              })();

              // Check if Goto buttons should be locked by active patrol
              const isExitButton = c.id?.startsWith('exit_');
              const patrolAlive = combat && combat.active;
              const patrolLocked = isExitButton && patrolAlive;
              
              const isDisabled = !meetsRequirements || patrolLocked;
              const hoverText = patrolLocked ? 'Defeat the patrol first!' : isDisabled && c.hoverMessage ? c.hoverMessage : c.label;
              
              return (
                <button 
                  key={c.id ?? idx} 
                  onClick={async () => {
                    if (isDisabled) return;
                    // Check if this is an action that returns a result
                    if (c.actionType && c.rawAction) {
                      const handleAction = (usePlayerStore as any).getState().handleAction;
                      const result = await handleAction(c.actionType, c.rawAction);
                      if (result && result.log) {
                        setActionResult({
                          title: result.success ? '✅ Success!' : '❌ Failed',
                          logs: result.log,
                          success: result.success
                        });
                      }
                    } else {
                      const handleChoice = (usePlayerStore as any).getState().handleChoice;
                      await handleChoice(c);
                    }
                  }} 
                  title={hoverText}
                  disabled={isDisabled}
                  style={{ 
                    minWidth: 160, 
                    padding: 12, 
                    borderRadius: 8, 
                    background: isDisabled ? '#555' : 'linear-gradient(135deg, #c9a84c, #a07830)', 
                    color: isDisabled ? '#888' : '#1a1000', 
                    cursor: isDisabled ? 'not-allowed' : 'pointer', 
                    border: isDisabled ? '1px solid #666' : '1px solid #e0c068', 
                    fontSize: 14,
                    fontWeight: 700,
                    opacity: isDisabled ? 0.5 : 1,
                    boxShadow: isDisabled ? 'none' : '0 2px 8px rgba(201,168,76,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        ) : (
          <button aria-label="Next page" onClick={onNextPage} style={{ position: 'absolute', right: 20, bottom: 12, padding: 12, borderRadius: 28, background: 'linear-gradient(135deg, #c9a84c, #a07830)', color: '#1a1000', cursor: 'pointer', border: '1px solid #e0c068', fontWeight: 700 }}>⤷</button>
        )}
      </div>
      
      {/* Action Result Popup */}
      {actionResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: actionResult.success ? '#27ae60' : '#e74c3c',
              fontSize: 20
            }}>
              {actionResult.title}
            </h3>
            <div style={{ marginBottom: 20 }}>
              {actionResult.logs.map((log, i) => (
                <div key={i} style={{ 
                  padding: '6px 0', 
                  borderBottom: i < actionResult.logs.length - 1 ? '1px solid #eee' : 'none',
                  fontSize: 14,
                  color: '#333'
                }}>
                  {log}
                </div>
              ))}
            </div>
            <button
              onClick={() => setActionResult(null)}
              style={{
                width: '100%',
                padding: 12,
                fontSize: 16,
                fontWeight: 'bold',
                borderRadius: 8,
                background: actionResult.success ? '#27ae60' : '#e74c3c',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      {/* Modal Overlay */}
      {modalPage && (
        <div style={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 10000, overflow: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingBottom: 20, borderBottom: '2px solid #eee' }}>
              <h2 style={{ margin: 0, fontSize: 32, color: '#2c3e50' }}>{modalPage.charAt(0).toUpperCase() + modalPage.slice(1)}</h2>
              <button onClick={() => setModalPage(null)} style={{ background: '#e74c3c', border: 'none', fontSize: 14, cursor: 'pointer', color: '#fff', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                <span className="desktop-return-text">Return ↩</span>
                <span className="mobile-close-x">×</span>
              </button>
            </div>
            
            {modalPage === 'inventory' && (
              <div>
                {/* Stash Section */}
                <div style={{ marginBottom: 30, padding: 24, background: 'linear-gradient(135deg, #f39c12, #e67e22)', borderRadius: 12, border: '3px solid #d68910', boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 4, opacity: 0.9 }}>STASH</div>
                      <div style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>💰 {stats.gold} Gold</div>
                    </div>
                    <div style={{ fontSize: 48, opacity: 0.3 }}>💰</div>
                  </div>
                </div>
                
                {/* Items Section */}
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: 16, color: '#2c3e50', fontSize: 20 }}>Items</h3>
                  {inventory.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', background: '#f8f9fa', borderRadius: 8, border: '2px dashed #dee2e6' }}>
                      <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>📦</div>
                      <p style={{ color: '#6c757d', fontSize: 16, margin: 0 }}>No items in inventory</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                      {inventory.map((item, idx) => {
                        const content = getContentSnapshot();
                        const items = content?.items || new Map();
                        const itemDef = items.get(item.itemId);
                        
                        return (
                          <div key={idx} style={{ 
                            position: 'relative',
                            padding: 12, 
                            background: '#fff', 
                            borderRadius: 8, 
                            border: '2px solid #dee2e6',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8
                          }}>
                            {itemDef?.icon && (
                              <img src={itemDef.icon} alt={itemDef.name} style={{ width: 48, height: 48 }} />
                            )}
                            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', lineHeight: 1.2 }}>
                              {itemDef?.name || item.itemId}
                            </div>
                            <div style={{ fontSize: 11, color: '#6c757d' }}>
                              Qty: <span style={{ fontWeight: 'bold', color: '#3498db' }}>×{item.qty}</span>
                            </div>
                            
                            {/* Sell button positioned at bottom right */}
                            <button
                              onClick={() => {
                                // Placeholder for shop functionality
                                alert(`Sell ${itemDef?.name || item.itemId}? (Shop system not yet implemented)`);
                              }}
                              style={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                padding: '4px 8px',
                                fontSize: 10,
                                fontWeight: 'bold',
                                background: '#f39c12',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }}
                            >
                              Sell
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {modalPage === 'equipment' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>Equipment</h3>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>
                    AR: {getTotalArmourRating({ stats, equipment, inventory, currentAreaId, discoveredMap, spellsKnown, spellPathsUnlocked, combatSkills: combatSkills || [], health, stamina: stamina || 0, maxStamina: maxStamina || 0, lastCheckpointId, flags: flags || {}, quests: quests || {}, questLog: questLog || [] })}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'row', gap: 32, flexWrap: 'wrap' }}>
                  {/* Paper Doll Visual with body-shaped layout */}
                  <div style={{ 
                    position: 'relative', 
                    width: '100%', 
                    maxWidth: 400,
                    flex: '0 0 auto',
                    background: 'url(/icons/paper_doll_bg.svg) center center no-repeat, linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)', 
                    backgroundSize: 'contain',
                    borderRadius: 12, 
                    border: '3px solid #dee2e6', 
                    padding: '24px 20px'
                  }}>
                    {/* Head slot */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 12, 
                      background: equipment.head ? '#d1ecf1' : '#fff', 
                      border: '3px dashed #6c757d', 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600,
                      width: 80,
                      height: 64,
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {equipment.head || 'HEAD'}
                    </div>
                    
                    {/* Chest slot */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 16, 
                      background: equipment.chest ? '#d1ecf1' : '#fff', 
                      border: '3px dashed #6c757d', 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600,
                      width: 100,
                      height: 96,
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {equipment.chest || 'CHEST'}
                    </div>
                    
                    {/* Hands row - shows gloves with weapons layered on top */}
                    <div style={{ display: 'flex', gap: 48, justifyContent: 'center', marginBottom: 16 }}>
                      {/* Offhand (left hand) */}
                      <div style={{ 
                        position: 'relative', 
                        textAlign: 'center', 
                        padding: 12, 
                        background: (equipment.gloves || equipment.offhand) ? '#d1ecf1' : '#fff', 
                        border: '3px dashed #6c757d', 
                        borderRadius: 8, 
                        fontSize: 14, 
                        fontWeight: 600,
                        width: 80,
                        height: 64,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {equipment.gloves && <div style={{ fontSize: 10, color: '#6c757d', marginBottom: 4 }}>GLOVES</div>}
                        {equipment.offhand ? (
                          <div style={{ position: 'relative' }}>
                            {(() => {
                              const content = getContentSnapshot();
                              const items = content?.items || new Map();
                              const item = items.get(equipment.offhand);
                              return item?.icon ? (
                                <img src={item.icon} alt={item.name} style={{ width: 64, height: 64, display: 'block', margin: '0 auto' }} />
                              ) : equipment.offhand;
                            })()}
                          </div>
                        ) : (
                          <div>L.HAND</div>
                        )}
                      </div>
                      {/* Mainhand (right hand) */}
                      <div style={{ 
                        position: 'relative', 
                        textAlign: 'center', 
                        padding: 12, 
                        background: (equipment.gloves || equipment.mainhand) ? '#d1ecf1' : '#fff', 
                        border: '3px dashed #6c757d', 
                        borderRadius: 8, 
                        fontSize: 14, 
                        fontWeight: 600,
                        width: 80,
                        height: 64,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {equipment.gloves && <div style={{ fontSize: 10, color: '#6c757d', marginBottom: 4 }}>GLOVES</div>}
                        {equipment.mainhand ? (
                          <div style={{ position: 'relative' }}>
                            {(() => {
                              const content = getContentSnapshot();
                              const items = content?.items || new Map();
                              const item = items.get(equipment.mainhand);
                              return item?.icon ? (
                                <img src={item.icon} alt={item.name} style={{ width: 64, height: 64, display: 'block', margin: '0 auto' }} />
                              ) : equipment.mainhand;
                            })()}
                          </div>
                        ) : (
                          <div>R.HAND</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Legs slot */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 12, 
                      background: equipment.legs ? '#d1ecf1' : '#fff', 
                      border: '3px dashed #6c757d', 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600,
                      width: 100,
                      height: 80,
                      margin: '0 auto 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {equipment.legs || 'LEGS'}
                    </div>
                    
                    {/* Boots slot */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 12, 
                      background: equipment.boots ? '#d1ecf1' : '#fff', 
                      border: '3px dashed #6c757d', 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600,
                      width: 80,
                      height: 48,
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {equipment.boots || 'BOOTS'}
                    </div>
                  </div>
                  
                  {/* Equipment Details - Weapons and Armor Sections */}
                  <div style={{ flex: '1 1 400px', minWidth: 300 }}>
                    <h4 style={{ marginTop: 0, marginBottom: 12, fontSize: 16, color: '#2c3e50' }}>EQUIPPED WEAPONS</h4>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                      {['mainhand', 'offhand'].map(slot => {
                        const itemId = equipment[slot];
                        return (
                          <div key={slot} style={{ 
                            flex: 1,
                            padding: '8px 12px', 
                            background: '#f8f9fa',
                            border: '2px solid #dee2e6', 
                            borderRadius: 6,
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#6c757d' }}>
                              {slot === 'mainhand' ? 'Main Hand' : 'Off Hand'}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: '600' }}>
                              {itemId || <em style={{ color: '#adb5bd' }}>Empty</em>}
                            </div>
                            {itemId && (() => {
                              const content = getContentSnapshot();
                              const items = content?.items || new Map();
                              const item = items.get(itemId);
                              return (
                                <div style={{ fontSize: 10, color: '#495057', marginTop: 4 }}>
                                  {item?.attackBonus && <div>⚔️ +{item.attackBonus}% Attack</div>}
                                  {item?.defenseBonus && <div>🛡️ +{item.defenseBonus}% Defense</div>}
                                  {item?.damageRating && <div>💥 {item.damageRating} Damage</div>}
                                </div>
                              );
                            })()}
                            {itemId && (
                              <button onClick={() => {
                                const currentState = usePlayerStore.getState();
                                const newEquipment = { ...currentState.equipment };
                                delete newEquipment[slot];
                                usePlayerStore.setState({ equipment: newEquipment });
                              }} style={{ 
                                padding: '3px 8px', 
                                fontSize: 10, 
                                background: '#dc3545', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: 3, 
                                cursor: 'pointer',
                                marginTop: 4
                              }}>
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <h4 style={{ marginTop: 0, marginBottom: 12, fontSize: 16, color: '#2c3e50' }}>ARMOR PIECES</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                      {['head', 'chest', 'gloves', 'legs', 'boots'].map(slot => {
                        const itemId = equipment[slot];
                        return (
                          <div key={slot} style={{ 
                            padding: '8px 12px', 
                            background: '#f8f9fa',
                            border: '2px solid #dee2e6', 
                            borderRadius: 6,
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#6c757d' }}>
                              {slot}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: '600' }}>
                              {itemId || <em style={{ color: '#adb5bd' }}>Empty</em>}
                            </div>
                            {itemId && (() => {
                              const content = getContentSnapshot();
                              const items = content?.items || new Map();
                              const item = items.get(itemId);
                              return (
                                <div style={{ fontSize: 10, color: '#495057', marginTop: 4 }}>
                                  {item?.armourRating && <div>🛡️ {item.armourRating} AR</div>}
                                  {item?.defenseBonus && <div>🛡️ +{item.defenseBonus}% Defense</div>}
                                </div>
                              );
                            })()}
                            {itemId && (
                              <button onClick={() => {
                                const currentState = usePlayerStore.getState();
                                const newEquipment = { ...currentState.equipment };
                                delete newEquipment[slot];
                                usePlayerStore.setState({ equipment: newEquipment });
                              }} style={{ 
                                padding: '3px 8px', 
                                fontSize: 10, 
                                background: '#dc3545', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: 3, 
                                cursor: 'pointer',
                                marginTop: 4
                              }}>
                                Remove
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Available Equipment from Inventory */}
                    <h4 style={{ marginTop: 24, marginBottom: 12, fontSize: 16, color: '#2c3e50' }}>AVAILABLE EQUIPMENT</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                      {(() => {
                        const content = getContentSnapshot();
                        const items = content?.items || new Map();
                        const equipmentItems = inventory.filter(invItem => {
                          const item = items.get(invItem.itemId);
                          return item && (item.type === 'weapon' || item.type === 'armor' || item.type === 'ammunition');
                        });
                        
                        if (equipmentItems.length === 0) {
                          return (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 20, color: '#999', fontSize: 14 }}>
                              No equipment items in inventory
                            </div>
                          );
                        }
                        
                        return equipmentItems.map(invItem => {
                          const item = items.get(invItem.itemId);
                          if (!item) return null;
                          
                          const isEquipped = Object.values(equipment).includes(invItem.itemId);
                          
                          return (
                            <div key={invItem.itemId} style={{ 
                              padding: '6px', 
                              background: isEquipped ? '#e8f8f0' : '#f8f9fa',
                              border: `2px solid ${isEquipped ? '#2ecc71' : '#dee2e6'}`, 
                              borderRadius: 6,
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 4,
                              opacity: isEquipped ? 0.6 : 1
                            }}>
                              {item.icon && (
                                <img src={item.icon} alt={item.name} style={{ width: 32, height: 32 }} />
                              )}
                              <div style={{ fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>
                                {item.name}
                              </div>
                              {invItem.qty > 1 && (
                                <div style={{ fontSize: 9, color: '#6c757d' }}>×{invItem.qty}</div>
                              )}
                              {!isEquipped && item.slot && (
                                <button
                                  onClick={() => {
                                    const currentState = usePlayerStore.getState();
                                    const newEquipment = { ...currentState.equipment, [item.slot]: invItem.itemId };
                                    usePlayerStore.setState({ equipment: newEquipment });
                                  }}
                                  style={{ 
                                    padding: '2px 6px', 
                                    fontSize: 9, 
                                    background: '#28a745', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 3, 
                                    cursor: 'pointer',
                                    marginTop: 2
                                  }}
                                >
                                  Add
                                </button>
                              )}
                              {isEquipped && (
                                <div style={{ fontSize: 9, color: '#2ecc71', marginTop: 2 }}>✓ Equipped</div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {modalPage === 'skills' && (
              <div>
                <h3 style={{ marginTop: 0 }}>Core Stats</h3>
                {stats.statPoints > 0 && (
                  <div style={{ marginBottom: 16, padding: 12, background: '#fffbea', border: '1px solid #f39c12', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <strong>⚡ {stats.statPoints - (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision)} Stat Points Available</strong>
                      {(pendingStats.power !== 0 || pendingStats.mind !== 0 || pendingStats.agility !== 0 || pendingStats.vision !== 0) && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 })}
                            style={{
                              padding: '6px 12px',
                              fontSize: 13,
                              borderRadius: 6,
                              background: '#95a5a6',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              const allocateStats = (usePlayerStore as any).getState().allocateStats;
                              await allocateStats(pendingStats);
                              setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 });
                            }}
                            style={{
                              padding: '6px 16px',
                              fontSize: 13,
                              borderRadius: 6,
                              background: 'linear-gradient(135deg, #27ae60, #229954)',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)'
                            }}
                          >
                            ✓ Confirm
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Click + to increase stats, − to decrease. Click Confirm to apply changes.</div>
                  </div>
                )}
                
                {/* Godstone Reset */}
                {(() => {
                  const inv = (usePlayerStore as any).getState().inventory || [];
                  const godstone = inv.find((i: any) => i.itemId === 'godstone');
                  const hasGodstone = godstone && godstone.qty > 0;
                  
                  if (hasGodstone) {
                    return (
                      <div style={{ marginBottom: 16, padding: 12, background: '#f3e5f5', border: '2px solid #9c27b0', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#9c27b0' }}>🔮 Godstone of Renewal</strong>
                            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                              Reset all stats to 1 and recover all spent points. The Godstone will be consumed.
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to reset all your stats? This will consume your Godstone and cannot be undone!')) {
                                const resetStats = (usePlayerStore as any).getState().resetStats;
                                const result = await resetStats();
                                if (result?.success) {
                                  setPendingStats({ power: 0, mind: 0, agility: 0, vision: 0 });
                                  alert(result.message);
                                  setModalPage(null);
                                } else {
                                  alert(result?.message || 'Failed to reset stats');
                                }
                              }
                            }}
                            style={{
                              padding: '8px 16px',
                              fontSize: 13,
                              borderRadius: 6,
                              background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Reset Stats
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Power */}
                <div style={{ marginBottom: 12, padding: 12, background: '#fff5f5', borderRadius: 8, border: '1px solid #ffcdd2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <strong style={{ color: '#e74c3c' }}>⚔️ Power</strong>
                      <div style={{ fontSize: 11, color: '#666' }}>Melee Attack, Intimidation</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stats.power + pendingStats.power}/10</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button 
                      onClick={() => setPendingStats(p => ({ ...p, power: p.power - 1 }))}
                      disabled={pendingStats.power <= 0}
                      style={{ padding: '4px 12px', fontSize: 16, borderRadius: 6, background: (pendingStats.power <= 0) ? '#ddd' : '#e74c3c', color: '#fff', border: 'none', cursor: (pendingStats.power <= 0) ? 'not-allowed' : 'pointer', opacity: (pendingStats.power <= 0) ? 0.5 : 1 }}
                    >−</button>
                    <div style={{ flex: 1, height: 20, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
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
                      style={{ padding: '4px 12px', fontSize: 16, borderRadius: 6, background: (stats.power + pendingStats.power >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? '#ddd' : '#27ae60', color: '#fff', border: 'none', cursor: (stats.power + pendingStats.power >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 'not-allowed' : 'pointer', opacity: (stats.power + pendingStats.power >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 0.5 : 1 }}
                    >+</button>
                  </div>
                </div>
                
                {/* Mind */}
                <div style={{ marginBottom: 12, padding: 12, background: '#f8f5ff', borderRadius: 8, border: '1px solid #e1d5ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <strong style={{ color: '#9b59b6' }}>🧠 Mind</strong>
                      <div style={{ fontSize: 11, color: '#666' }}>Magic Power, Ranged Attack</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stats.mind + pendingStats.mind}/10</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button 
                      onClick={() => setPendingStats(p => ({ ...p, mind: p.mind - 1 }))}
                      disabled={pendingStats.mind <= 0}
                      style={{ padding: '4px 12px', fontSize: 16, borderRadius: 6, background: (pendingStats.mind <= 0) ? '#ddd' : '#9b59b6', color: '#fff', border: 'none', cursor: (pendingStats.mind <= 0) ? 'not-allowed' : 'pointer', opacity: (pendingStats.mind <= 0) ? 0.5 : 1 }}
                    >−</button>
                    <div style={{ flex: 1, height: 20, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
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
                      style={{ padding: '4px 12px', fontSize: 16, borderRadius: 6, background: (stats.mind + pendingStats.mind >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? '#ddd' : '#27ae60', color: '#fff', border: 'none', cursor: (stats.mind + pendingStats.mind >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 'not-allowed' : 'pointer', opacity: (stats.mind + pendingStats.mind >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 0.5 : 1 }}
                    >+</button>
                  </div>
                </div>
                
                {/* Agility */}
                <div style={{ marginBottom: 12, padding: 12, background: '#f0fff4', borderRadius: 8, border: '1px solid #c6f6d5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <strong style={{ color: '#2ecc71' }}>🏃 Agility</strong>
                      <div style={{ fontSize: 11, color: '#666' }}>Dodge, Ranged Attack, Pickpocket</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stats.agility + pendingStats.agility}/10</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button 
                      onClick={() => setPendingStats(p => ({ ...p, agility: p.agility - 1 }))}
                      disabled={pendingStats.agility <= 0}
                      style={{ padding: '4px 12px', fontSize: 16, borderRadius: 6, background: (pendingStats.agility <= 0) ? '#ddd' : '#2ecc71', color: '#fff', border: 'none', cursor: (pendingStats.agility <= 0) ? 'not-allowed' : 'pointer', opacity: (pendingStats.agility <= 0) ? 0.5 : 1 }}
                    >−</button>
                    <div style={{ flex: 1, height: 20, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.agility + pendingStats.agility) * 10}%`, height: '100%', background: '#2ecc71', transition: 'width 0.3s' }}></div>
                    </div>
                    <button 
                      onClick={() => setPendingStats(p => ({ ...p, agility: p.agility + 1 }))}
                      disabled={stats.agility + pendingStats.agility >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints}
                      style={{ padding: '4px 12px', fontSize: 16, borderRadius: 6, background: (stats.agility + pendingStats.agility >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? '#ddd' : '#27ae60', color: '#fff', border: 'none', cursor: (stats.agility + pendingStats.agility >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 'not-allowed' : 'pointer', opacity: (stats.agility + pendingStats.agility >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 0.5 : 1 }}
                    >+</button>
                  </div>
                </div>
                
                {/* Vision */}
                <div style={{ marginBottom: 20, padding: 12, background: '#f0f8ff', borderRadius: 8, border: '1px solid #bee3f8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <strong style={{ color: '#3498db' }}>👁️ Vision</strong>
                      <div style={{ fontSize: 11, color: '#666' }}>Perception, Ranged Attack</div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{stats.vision + pendingStats.vision}/10</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button 
                      onClick={() => setPendingStats(p => ({ ...p, vision: p.vision - 1 }))}
                      disabled={pendingStats.vision <= 0}
                      style={{ padding: '4px 12px', fontSize: 16, borderRadius: 6, background: (pendingStats.vision <= 0) ? '#ddd' : '#3498db', color: '#fff', border: 'none', cursor: (pendingStats.vision <= 0) ? 'not-allowed' : 'pointer', opacity: (pendingStats.vision <= 0) ? 0.5 : 1 }}
                    >−</button>
                    <div style={{ flex: 1, height: 20, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${(stats.vision + pendingStats.vision) * 10}%`, height: '100%', background: '#3498db', transition: 'width 0.3s' }}></div>
                    </div>
                    <button 
                      onClick={() => setPendingStats(p => ({ ...p, vision: p.vision + 1 }))}
                      disabled={stats.vision + pendingStats.vision >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints}
                      style={{ padding: '4px 12px', fontSize: 16, borderRadius: 6, background: (stats.vision + pendingStats.vision >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? '#ddd' : '#27ae60', color: '#fff', border: 'none', cursor: (stats.vision + pendingStats.vision >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 'not-allowed' : 'pointer', opacity: (stats.vision + pendingStats.vision >= 10 || (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) >= stats.statPoints) ? 0.5 : 1, animation: stats.statPoints > 0 && (pendingStats.power + pendingStats.mind + pendingStats.agility + pendingStats.vision) === 0 ? 'pulse 2s infinite' : 'none' }}
                    >+</button>
                  </div>
                </div>
                
                <h3>Active Skills (% chance)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>🔍 Search</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).search}%</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>(Vision × 10)</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>🔎 Investigate</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).investigate}%</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>(Mind × 10)</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>⚔️ Melee Attack</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).meleeAttack}%</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>(Power × 10)</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>🏹 Ranged Attack</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).rangedAttack}%</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>(Agility × 10)</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>✨ Cast Spell</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).castSpell}%</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>(Mind × 10)</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>🔓 Lockpick</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).lockpick}%</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>(Vision×5 + Agility×5)</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>👛 Pickpocket</span>
                    <span style={{ marginRight: 8, fontWeight: 'bold' }}>{getActiveSkills(state).pickpocket}%</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>(Mind×5 + Agility×5)</span>
                </div>
                
                <h3>Purchasable Skills</h3>
                <div style={{ marginBottom: 20 }}>
                  {/* Muffle Steps */}
                  {(() => {
                    const hasMuffleSteps = combatSkills.includes('muffle_steps');
                    const canAfford = stats.statPoints >= 2;
                    const meetsRequirement = stats.agility >= 2;
                    const canPurchase = !hasMuffleSteps && canAfford && meetsRequirement;
                    
                    return (
                      <div
                        style={{
                          padding: 12,
                          marginBottom: 12,
                          background: hasMuffleSteps ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : canPurchase ? 'rgba(243, 156, 18, 0.1)' : '#f5f5f5',
                          border: `2px solid ${hasMuffleSteps ? '#27ae60' : canPurchase ? '#f39c12' : '#ddd'}`,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          opacity: hasMuffleSteps ? 1 : canPurchase ? 0.9 : 0.5
                        }}
                      >
                        <div style={{ fontSize: 32 }}>🐭</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: hasMuffleSteps ? '#fff' : '#333' }}>
                            Muffle Steps
                          </div>
                          <div style={{ fontSize: 12, color: hasMuffleSteps ? '#e8f8f0' : '#666', marginBottom: 4 }}>
                            Once purchased your footsteps are like a mouse
                          </div>
                          {!hasMuffleSteps && (
                            <div style={{ fontSize: 11, color: meetsRequirement ? '#2ecc71' : '#e74c3c' }}>
                              Requires: Agility 2 {meetsRequirement ? '✓' : '✗'}
                            </div>
                          )}
                        </div>
                        {!hasMuffleSteps && (
                          <button
                            onClick={() => {
                              if (canPurchase) {
                                const currentState = usePlayerStore.getState();
                                usePlayerStore.setState({
                                  stats: { ...currentState.stats, statPoints: currentState.stats.statPoints - 2 },
                                  combatSkills: [...currentState.combatSkills, 'muffle_steps']
                                });
                              }
                            }}
                            disabled={!canPurchase}
                            style={{
                              padding: '8px 16px',
                              fontSize: 14,
                              fontWeight: 'bold',
                              borderRadius: 6,
                              background: canPurchase ? 'linear-gradient(135deg, #f39c12, #e67e22)' : '#95a5a6',
                              color: '#fff',
                              border: 'none',
                              cursor: canPurchase ? 'pointer' : 'not-allowed'
                            }}
                          >
                            {canAfford && meetsRequirement ? 'Buy (2 SP)' : !meetsRequirement ? 'Need Agility 2' : 'Need 2 SP'}
                          </button>
                        )}
                        {hasMuffleSteps && (
                          <div style={{ padding: '8px 16px', fontSize: 14, fontWeight: 'bold', color: '#fff' }}>
                            ✓ Owned
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                <h3>Combat Skills</h3>
                <div style={{ marginBottom: 20 }}>
                  {[
                    { id: 'clash', name: 'Clash', cost: 1, stamina: 1, icon: '🛡️', desc: 'Force enemy back, preventing their attack and second enemy\'s attack' },
                    { id: 'pivot', name: 'Pivot', cost: 2, stamina: 1, icon: '🔄', desc: 'Normal attack + 50% defense boost against second opponent' },
                    { id: 'feint', name: 'Feint', cost: 2, stamina: 2, icon: '🤺', desc: 'Dodge targeted enemy\'s attack AND attack any second enemy' },
                    { id: 'slash', name: 'Slash', cost: 3, stamina: 3, icon: '⚔️💥', desc: 'Attack all front enemies with separate rolls' }
                  ].map(skill => {
                    const isLearned = combatSkills.includes(skill.id);
                    const canAfford = stats.statPoints >= skill.cost;
                    
                    return (
                      <div
                        key={skill.id}
                        style={{
                          padding: 12,
                          marginBottom: 8,
                          background: isLearned ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : canAfford ? 'rgba(243, 156, 18, 0.1)' : '#f5f5f5',
                          border: `2px solid ${isLearned ? '#27ae60' : canAfford ? '#f39c12' : '#ddd'}`,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          opacity: isLearned ? 1 : canAfford ? 0.9 : 0.5
                        }}
                      >
                        <div style={{ fontSize: 32 }}>{skill.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: isLearned ? '#fff' : '#333' }}>
                            {skill.name}
                          </div>
                          <div style={{ fontSize: 12, color: isLearned ? '#e8f8f0' : '#666' }}>
                            {skill.desc}
                          </div>
                          <div style={{ fontSize: 11, color: isLearned ? '#d5f4e6' : '#999', marginTop: 4 }}>
                            ⚡ Uses {skill.stamina} Stamina in combat
                          </div>
                        </div>
                        {!isLearned && (
                          <button
                            onClick={() => {
                              if (canAfford) {
                                const currentState = usePlayerStore.getState();
                                const newStats = { ...currentState.stats, statPoints: currentState.stats.statPoints - skill.cost };
                                usePlayerStore.setState({ 
                                  stats: newStats,
                                  combatSkills: [...(currentState.combatSkills || []), skill.id]
                                });
                              }
                            }}
                            disabled={!canAfford}
                            style={{
                              padding: '8px 16px',
                              fontSize: 14,
                              fontWeight: 'bold',
                              borderRadius: 6,
                              background: canAfford ? 'linear-gradient(135deg, #f39c12, #e67e22)' : '#ccc',
                              color: '#fff',
                              border: 'none',
                              cursor: canAfford ? 'pointer' : 'not-allowed',
                              boxShadow: canAfford ? '0 2px 8px rgba(243, 156, 18, 0.3)' : 'none'
                            }}
                          >
                            {canAfford ? `Learn (${skill.cost} SP)` : `Requires ${skill.cost} SP`}
                          </button>
                        )}
                        {isLearned && (
                          <div style={{ 
                            padding: '8px 16px',
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#fff',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 6
                          }}>
                            ✓ Learned
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <h3>Passive Skills</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', fontSize: 14 }}>
                  <div>Perception</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).perception}%</div>
                  
                  <div>Melee Defense</div>
                  <div style={{ fontWeight: 'bold' }}>{getPassiveSkills(state).meleeDefense}%</div>
                  
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
              </div>
            )}
            
            {modalPage === 'spells' && (
              <div>
                {!spellTreePath ? (
                  <>
                    <h3 style={{ marginTop: 0, marginBottom: 20 }}>Spell Paths</h3>
                    
                    {/* Spell Path Runes */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 30 }}>
                      {[
                        { id: 'fire', name: 'Fire', icon: '🔥', color: '#e74c3c' },
                        { id: 'water', name: 'Water', icon: '💧', color: '#3498db' },
                        { id: 'earth', name: 'Earth', icon: '🪨', color: '#95a5a6' },
                        { id: 'air', name: 'Air', icon: '💨', color: '#1abc9c' }
                      ].map(path => {
                        const isUnlocked = spellPathsUnlocked.includes(path.id as any);
                        const canAfford = stats.statPoints >= 1;
                        return (
                          <div
                            key={path.id}
                            onClick={() => {
                              if (isUnlocked) {
                                setSpellTreePath(path.id);
                              } else if (canAfford) {
                                const currentState = usePlayerStore.getState();
                                const newStats = { ...currentState.stats, statPoints: currentState.stats.statPoints - 1 };
                                usePlayerStore.setState({ 
                                  stats: newStats,
                                  spellPathsUnlocked: [...(currentState.spellPathsUnlocked || []), path.id as any]
                                });
                              }
                            }}
                            style={{
                              padding: 20,
                              background: isUnlocked 
                                ? `linear-gradient(135deg, ${path.color}22, ${path.color}44)` 
                                : '#f5f5f5',
                              border: `3px solid ${isUnlocked ? path.color : '#ddd'}`,
                              borderRadius: 12,
                              cursor: isUnlocked || canAfford ? 'pointer' : 'default',
                              opacity: isUnlocked ? 1 : canAfford ? 0.7 : 0.4,
                              transition: 'all 0.3s',
                              textAlign: 'center',
                              animation: !isUnlocked && canAfford ? 'pulse 2s infinite' : 'none'
                            }}
                          >
                            <div style={{ fontSize: 48, marginBottom: 8, filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                              {path.icon}
                            </div>
                            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: isUnlocked ? path.color : '#666' }}>
                              {path.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>
                              ⚡ All spells use 1 Stamina
                            </div>
                            {!isUnlocked && (
                              <div style={{ 
                                fontSize: 14, 
                                fontWeight: 'bold', 
                                color: canAfford ? '#f39c12' : '#999',
                                padding: '6px 12px',
                                background: canAfford ? 'rgba(243, 156, 18, 0.1)' : 'transparent',
                                borderRadius: 6,
                                display: 'inline-block'
                              }}>
                                {canAfford ? '1 SP to unlock' : 'Need 1 SP'}
                              </div>
                            )}
                            {isUnlocked && (
                              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#2ecc71' }}>
                                ✓ View Spells
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Known Spells Summary */}
                    {spellsKnown.length > 0 && (
                      <div>
                        <h4 style={{ marginTop: 20, marginBottom: 12 }}>Known Spells ({spellsKnown.length})</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {spellsKnown.map((spellId, idx) => {
                            const spell = getAllSpells().find((s: any) => s.id === spellId) as any;
                            return (
                              <div key={idx} style={{ 
                                padding: '8px 12px', 
                                background: '#f9f9f9',
                                borderRadius: 6,
                                fontSize: 13,
                                border: '1px solid #ddd'
                              }}>
                                ✨ {spell?.name || spellId}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {spellPathsUnlocked.length === 0 && (
                      <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>
                        Unlock spell paths to gain access to powerful magic.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {/* Spell Tree View */}
                    {(() => {
                      const pathData = [
                        { id: 'fire', name: 'Fire', icon: '🔥', color: '#e74c3c' },
                        { id: 'water', name: 'Water', icon: '💧', color: '#3498db' },
                        { id: 'earth', name: 'Earth', icon: '🪨', color: '#95a5a6' },
                        { id: 'air', name: 'Air', icon: '💨', color: '#1abc9c' }
                      ].find(p => p.id === spellTreePath);
                      
                      if (!pathData) return null;
                      
                      const pathSpells = getAllSpells().filter((s: any) => s.path === spellTreePath);
                      const spellsByTier: Record<number, any[]> = {};
                      pathSpells.forEach((s: any) => {
                        const tier = s.tier || 1;
                        if (!spellsByTier[tier]) spellsByTier[tier] = [];
                        spellsByTier[tier].push(s);
                      });
                      
                      // Check highest tier unlocked (must have learned a spell from previous tier)
                      const getHighestAvailableTier = () => {
                        for (let tier = 1; tier <= 4; tier++) {
                          const tierSpells = spellsByTier[tier] || [];
                          const hasLearnedFromTier = tierSpells.some((s: any) => spellsKnown.includes(s.id));
                          if (tier === 1) continue; // Tier 1 always available
                          if (!hasLearnedFromTier) return tier - 1;
                        }
                        return 4;
                      };
                      
                      const highestTier = getHighestAvailableTier();
                      
                      return (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                            <button 
                              onClick={() => setSpellTreePath(null)}
                              style={{ 
                                padding: '8px 16px', 
                                marginRight: 16,
                                background: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 14
                              }}
                            >
                              ← Back
                            </button>
                            <div style={{ fontSize: 32 }}>{pathData.icon}</div>
                            <h3 style={{ margin: '0 0 0 12px', color: pathData.color }}>{pathData.name} Path</h3>
                          </div>
                          
                          {[1, 2, 3, 4].map(tier => {
                            const tierSpells = spellsByTier[tier] || [];
                            if (tierSpells.length === 0) return null;
                            
                            const tierUnlocked = tier === 1 || tier <= highestTier + 1;
                            
                            return (
                              <div key={tier} style={{ marginBottom: 24 }}>
                                <h4 style={{ 
                                  color: tierUnlocked ? pathData.color : '#999',
                                  marginBottom: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8
                                }}>
                                  Tier {tier}
                                  {!tierUnlocked && (
                                    <span style={{ fontSize: 12, color: '#999', fontWeight: 'normal' }}>
                                      (Learn a Tier {tier - 1} spell first)
                                    </span>
                                  )}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  {tierSpells.map((spell: any) => {
                                    const isLearned = spellsKnown.includes(spell.id);
                                    const canLearn = tierUnlocked && !isLearned && stats.statPoints >= spell.cost;
                                    
                                    return (
                                      <div
                                        key={spell.id}
                                        style={{
                                          padding: 16,
                                          background: isLearned 
                                            ? `linear-gradient(135deg, ${pathData.color}11, ${pathData.color}22)` 
                                            : tierUnlocked ? '#f9f9f9' : '#fafafa',
                                          border: `2px solid ${isLearned ? pathData.color : '#ddd'}`,
                                          borderRadius: 8,
                                          opacity: tierUnlocked ? 1 : 0.5
                                        }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                                          <div>
                                            <div style={{ fontSize: 16, fontWeight: 'bold', color: isLearned ? pathData.color : '#333' }}>
                                              {isLearned && '✓ '}{spell.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                                              {spell.targeting} • {spell.requiresSR ? 'SR Check' : 'No SR'}
                                            </div>
                                          </div>
                                          {!isLearned && tierUnlocked && (
                                            <button
                                              onClick={() => {
                                                if (canLearn && confirm(`Learn ${spell.name} for ${spell.cost} Stat Points?`)) {
                                                  const currentState = usePlayerStore.getState();
                                                  usePlayerStore.setState({
                                                    stats: { ...currentState.stats, statPoints: currentState.stats.statPoints - spell.cost },
                                                    spellsKnown: [...currentState.spellsKnown, spell.id]
                                                  });
                                                }
                                              }}
                                              disabled={!canLearn}
                                              style={{
                                                padding: '6px 12px',
                                                background: canLearn ? pathData.color : '#ddd',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 6,
                                                fontSize: 13,
                                                fontWeight: 'bold',
                                                cursor: canLearn ? 'pointer' : 'not-allowed',
                                                opacity: canLearn ? 1 : 0.6
                                              }}
                                            >
                                              Learn ({spell.cost} SP)
                                            </button>
                                          )}
                                        </div>
                                        <div style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                                          {spell.description}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
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
            
            {modalPage === 'map' && (() => {
              // Get all discovered areas with their coordinates
              const discoveredAreas = Object.keys(discoveredMap || {})
                .map(areaId => getAreaById(areaId))
                .filter(area => area && typeof area.x === 'number' && typeof area.y === 'number');
              
              if (discoveredAreas.length === 0) {
                return (
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: 20 }}>Map</h3>
                    <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>
                      <p style={{ fontSize: 16, marginBottom: 8 }}>🗺️ No areas discovered yet</p>
                      <p style={{ fontSize: 14 }}>Explore the world to reveal the map</p>
                    </div>
                  </div>
                );
              }
              
              // Assign z-level based on y-coordinate (deeper = lower z)
              // Group areas into z-levels for multi-floor display
              const areasWithZ = discoveredAreas.map(area => ({
                ...area,
                z: area.z !== undefined ? area.z : Math.floor(area.y / 10) // Auto-assign z based on y depth
              }));
              
              // Get unique z-levels
              const zLevels = [...new Set(areasWithZ.map(a => a.z))].sort((a, b) => b - a); // Highest first
              
              // Set initial z-level if not already set
              if (!zLevels.includes(mapZLevel)) {
                setMapZLevel(zLevels[0]);
              }
              
              const currentZ = mapZLevel;
              
              // Filter areas for current z-level
              const currentLevelAreas = areasWithZ.filter(a => a.z === currentZ);
              const currentArea = getAreaById(currentAreaId);
              const currentAreaZ = currentArea && typeof currentArea.z === 'number' 
                ? currentArea.z 
                : currentArea ? Math.floor(currentArea.y / 10) : currentZ;
              
              // Calculate bounds of the current z-level
              const minX = Math.min(...currentLevelAreas.map(a => a.x));
              const maxX = Math.max(...currentLevelAreas.map(a => a.x));
              const minY = Math.min(...currentLevelAreas.map(a => a.y));
              const maxY = Math.max(...currentLevelAreas.map(a => a.y));
              
              // Create a grid
              const cellSize = 60;
              const gap = 2;
              const padding = 40;
              
              // Build area lookup by coordinates for current z-level
              const areaByCoords: Record<string, any> = {};
              currentLevelAreas.forEach(area => {
                areaByCoords[`${area.x},${area.y}`] = area;
              });
              
              const gridWidth = (maxX - minX + 1) * (cellSize + gap) + padding * 2;
              const gridHeight = (maxY - minY + 1) * (cellSize + gap) + padding * 2;
              
              return (
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: 20 }}>Map</h3>
                      {/* Z-Level Controls */}
                      {zLevels.length > 1 && (
                        <div style={{ 
                          marginBottom: 20, 
                          padding: 16, 
                          background: '#fff',
                          borderRadius: 8,
                          border: '2px solid #dee2e6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#2c3e50' }}>Floor Level:</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {zLevels.map(z => (
                                <button
                                  key={z}
                                  onClick={() => setMapZLevel(z)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    borderRadius: 6,
                                    background: z === currentZ 
                                      ? 'linear-gradient(135deg, #3498db, #2980b9)'
                                      : z === currentAreaZ
                                        ? 'linear-gradient(135deg, #f39c12, #e67e22)'
                                        : '#ecf0f1',
                                    color: z === currentZ || z === currentAreaZ ? '#fff' : '#2c3e50',
                                    border: z === currentAreaZ ? '2px solid #f39c12' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseOver={(e) => {
                                    if (z !== currentZ) {
                                      e.currentTarget.style.background = '#d5dbdb';
                                    }
                                  }}
                                  onMouseOut={(e) => {
                                    if (z !== currentZ) {
                                      e.currentTarget.style.background = z === currentAreaZ 
                                        ? 'linear-gradient(135deg, #f39c12, #e67e22)'
                                        : '#ecf0f1';
                                    }
                                  }}
                                >
                                  {z > 0 ? `+${z}` : z}
                                  {z === currentAreaZ && ' 📍'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: '#6c757d', fontStyle: 'italic' }}>
                            {currentZ > 0 ? '⬆️ Upper Level' : currentZ < 0 ? '⬇️ Lower Level' : '➡️ Ground Level'}
                          </div>
                        </div>
                      )}
                      
                      <div style={{ 
                        overflowX: 'auto', 
                        overflowY: 'auto', 
                        maxHeight: 'calc(100vh - 300px)',
                        border: '2px solid #dee2e6',
                        borderRadius: 8,
                        background: '#f8f9fa'
                      }}>
                        <div style={{ 
                          position: 'relative', 
                          width: gridWidth, 
                          height: gridHeight,
                          margin: '20px auto',
                          minWidth: 'fit-content'
                        }}>
                          {/* Render grid cells for discovered areas */}
                          {Array.from({ length: maxY - minY + 1 }, (_, yi) => {
                            const y = maxY - yi; // Start from top (max Y)
                            return Array.from({ length: maxX - minX + 1 }, (_, xi) => {
                              const x = minX + xi;
                              const area = areaByCoords[`${x},${y}`];
                              
                              if (!area) return null;
                              
                              const isCurrentArea = area.id === currentAreaId;
                              
                              // Check if there are areas above or below this position
                              const hasAreaAbove = areasWithZ.some(a => a.x === x && a.y === y && a.z > currentZ);
                              const hasAreaBelow = areasWithZ.some(a => a.x === x && a.y === y && a.z < currentZ);
                              
                              // Determine tile color based on floorId or tileStyle
                            let bgColor = '#95a5a6';
                            if (area.floorId === 'underfortress') bgColor = '#7f8c8d';
                            if (area.floorId === 'battle') bgColor = '#e74c3c';
                            if (area.tileStyle === 'cavern') bgColor = '#5d6d7e';
                            if (area.tileStyle === 'cistern') bgColor = '#3498db';
                            if (isCurrentArea) bgColor = '#f39c12';
                            
                            return (
                              <div
                                key={`${x},${y}`}
                                title={area.title || area.id}
                                style={{
                                  position: 'absolute',
                                  left: padding + (x - minX) * (cellSize + gap),
                                  top: padding + (maxY - y) * (cellSize + gap),
                                  width: cellSize,
                                  height: cellSize,
                                  backgroundColor: bgColor,
                                  border: isCurrentArea ? '3px solid #fff' : '2px solid rgba(0,0,0,0.2)',
                                  borderRadius: 4,
                                  boxShadow: isCurrentArea 
                                    ? '0 0 12px rgba(243, 156, 18, 0.8)' 
                                    : '0 2px 4px rgba(0,0,0,0.1)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s',
                                  fontSize: 24
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                  e.currentTarget.style.zIndex = '10';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.zIndex = '1';
                                }}
                              >
                                {isCurrentArea ? '📍' : '▪'}
                                {/* Z-level indicators */}
                                {(hasAreaAbove || hasAreaBelow) && (
                                  <div style={{ 
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                    fontSize: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                  }}>
                                    {hasAreaAbove && <span>⬆️</span>}
                                    {hasAreaBelow && <span>⬇️</span>}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        }).flat()}
                        
                        {/* Draw connection lines between areas with exits */}
                        <svg style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none'
                        }}>
                          {currentLevelAreas.map(area => {
                            if (!area.exits) return null;
                            
                            const fromX = padding + (area.x - minX) * (cellSize + gap) + cellSize / 2;
                            const fromY = padding + (maxY - area.y) * (cellSize + gap) + cellSize / 2;
                            
                            return Object.entries(area.exits).map(([dir, targetId]) => {
                              const targetAreaObj = getAreaById(targetId as string);
                              if (!targetAreaObj) return null;
                              const targetArea = areaByCoords[`${targetAreaObj.x},${targetAreaObj.y}`];
                              if (!targetArea) return null;
                              
                              const toX = padding + (targetArea.x - minX) * (cellSize + gap) + cellSize / 2;
                              const toY = padding + (maxY - targetArea.y) * (cellSize + gap) + cellSize / 2;
                              
                              return (
                                <line
                                  key={`${area.id}-${dir}-${targetId}`}
                                  x1={fromX}
                                  y1={fromY}
                                  x2={toX}
                                  y2={toY}
                                  stroke="rgba(52, 73, 94, 0.3)"
                                  strokeWidth="2"
                                  strokeDasharray="4,4"
                                />
                              );
                            });
                          }).flat()}
                        </svg>
                      </div>
                      
                      {/* Legend */}
                      <div style={{ 
                        padding: 20, 
                        borderTop: '2px solid #dee2e6',
                        background: '#fff',
                        display: 'flex',
                        gap: 20,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        fontSize: 12
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, background: '#f39c12', border: '2px solid #333', borderRadius: 2 }}></div>
                          <span>Current Location</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, background: '#7f8c8d', border: '2px solid #333', borderRadius: 2 }}></div>
                          <span>Underfortress</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, background: '#5d6d7e', border: '2px solid #333', borderRadius: 2 }}></div>
                          <span>Cavern</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, background: '#3498db', border: '2px solid #333', borderRadius: 2 }}></div>
                          <span>Cistern</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, background: '#e74c3c', border: '2px solid #333', borderRadius: 2 }}></div>
                          <span>Battle</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10 }}>⬆️ Above</span>
                          <span style={{ fontSize: 10 }}>⬇️ Below</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            
            {modalPage === 'settings' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 20 }}>Settings</h3>
                
                {/* Test Combat Templates */}
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 12, color: '#2c3e50' }}>Debug: Combat Templates</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {/* Test Goblins */}
                    <button 
                      onClick={() => {
                        const currentState = usePlayerStore.getState();
                        const newState = initiateCombat(['test_goblin', 'test_goblin', 'test_goblin', 'test_goblin'], currentState);
                        usePlayerStore.setState({ combat: newState.combat });
                        setModalPage(null);
                      }}
                      style={{ 
                        padding: '10px 16px', 
                        fontSize: 13, 
                        fontWeight: 'bold',
                        borderRadius: 6, 
                        background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
                        color: '#fff', 
                        border: '2px solid #a93226',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)'
                      }}
                    >
                      👹 Test Goblins (4x)
                    </button>
                    
                    {/* Cave Rats */}
                    <button 
                      onClick={() => {
                        const currentState = usePlayerStore.getState();
                        const newState = initiateCombat(['cave_rat', 'cave_rat'], currentState);
                        usePlayerStore.setState({ combat: newState.combat });
                        setModalPage(null);
                      }}
                      style={{ 
                        padding: '10px 16px', 
                        fontSize: 13, 
                        fontWeight: 'bold',
                        borderRadius: 6, 
                        background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)', 
                        color: '#fff', 
                        border: '2px solid #5d6d7e',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(149, 165, 166, 0.3)'
                      }}
                    >
                      🐀 Cave Rats (2x)
                    </button>
                    
                    {/* Blind Cave Snake Boss */}
                    <button 
                      onClick={() => {
                        const currentState = usePlayerStore.getState();
                        const newState = initiateCombat(['blind_cave_snake'], currentState);
                        usePlayerStore.setState({ combat: newState.combat });
                        setModalPage(null);
                      }}
                      style={{ 
                        padding: '10px 16px', 
                        fontSize: 13, 
                        fontWeight: 'bold',
                        borderRadius: 6, 
                        background: 'linear-gradient(135deg, #8e44ad, #6c3483)', 
                        color: '#fff', 
                        border: '2px solid #5b2c6f',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(142, 68, 173, 0.3)'
                      }}
                    >
                      🐍 Blind Cave Snake (Boss)
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: '#6c757d', marginTop: 12, fontStyle: 'italic' }}>
                    💡 Tip: Combat templates are loaded from enemy definitions. Areas with onEnter: initiateCombat will start combat automatically.
                  </p>
                </div>
                
                <div style={{ padding: 20, background: '#f8f9fa', borderRadius: 8, border: '2px dashed #dee2e6' }}>
                  <p style={{ color: '#6c757d', fontSize: 14, margin: 0, textAlign: 'center' }}>More settings coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Stat Allocation Modal - REMOVED: Now integrated into Skills page */}
      {false && statAllocMode && (
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

const btnStyle: any = { background:'linear-gradient(135deg, #c9a84c, #a07830)', color:'#1a1000', padding:12, margin:'8px 0', borderRadius:8, width:260, cursor:'pointer', border:'1px solid #e0c068', fontSize:14, fontWeight:700, boxShadow:'0 2px 8px rgba(201,168,76,0.3)', transition:'all 0.2s ease' }
