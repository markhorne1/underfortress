import React, { useEffect, useState, useRef } from 'react';
import { loadContent, getContentSnapshot, getStartAreaId, getAllAreas, getAreaById, getAllSpells } from './engine/contentLoader';
import { usePlayerStore } from './store/playerStore';
import { executeChoice } from './engine/execute';
import { getActiveSkills, getPassiveSkills, getTotalArmourRating } from './engine/skillCalculations';
import { initiateCombat, playerAttack, enemyTurn, selectEnemy, castSpell, intimidateEnemy, playerSlash, playerPivot } from './engine/combatNew';

export default function App() {
  const [page, setPage] = useState<'title'|'menu'|'game'>('title');
  const [loading, setLoading] = useState(true);
  const [modalPage, setModalPage] = useState<'inventory'|'equipment'|'skills'|'spells'|'quests'|'map'|null>(null);
  const [statAllocMode, setStatAllocMode] = useState(false); // Stat allocation modal
  const [spellTreePath, setSpellTreePath] = useState<string | null>(null); // Which path's spell tree to show
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null); // Selected spell for casting
  const [pendingStats, setPendingStats] = useState({ power: 0, mind: 0, agility: 0, vision: 0 }); // Pending changes
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
      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflowY: 'auto' }}>
        {area ? (
          <div style={{ maxWidth: 800, width: '100%' }}>
            <h1 style={{ marginBottom: 20, textAlign: 'center' }}>{area.title ?? area.id}</h1>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, textAlign: 'center' }}>{area.description}</p>
            
            {/* Spend Stat Points Button */}
            {stats.statPoints > 0 && (
              <div style={{ marginTop: 20 }}>
                <button 
                  onClick={() => {
                    setModalPage('skills');
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

            {/* Test Combat Button (DEBUG) */}
            {!combat && (
              <div style={{ marginTop: 20 }}>
                <button 
                  onClick={() => {
                    const currentState = usePlayerStore.getState();
                    const newState = initiateCombat(['test_goblin', 'test_goblin', 'test_goblin', 'test_goblin'], currentState);
                    usePlayerStore.setState({ combat: newState.combat });
                  }}
                  style={{ 
                    padding: '12px 24px', 
                    fontSize: 14, 
                    fontWeight: 'bold',
                    borderRadius: 8, 
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)', 
                    color: '#fff', 
                    border: '2px solid #a93226',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.4)'
                  }}
                >
                  ⚔️ Test Combat (DEBUG)
                </button>
              </div>
            )}

            {/* Combat UI - Positioned ABOVE continuing text */}
            {combat && combat.active && (
              <div style={{ 
                marginTop: 20, 
                padding: 20, 
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', 
                borderRadius: 12, 
                border: '3px solid #e74c3c',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
              }}>
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
                    <h3 style={{ color: '#fff', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                      You
                    </h3>
                    <div style={{
                      padding: 16,
                      background: 'rgba(241, 196, 15, 0.2)',
                      border: '3px solid #f1c40f',
                      borderRadius: 12,
                      minWidth: 140,
                      boxShadow: '0 0 20px rgba(241, 196, 15, 0.4)'
                    }}>
                      <div style={{ 
                        fontSize: 40, 
                        textAlign: 'center', 
                        marginBottom: 8
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
                      <h3 style={{ color: '#fff', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
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
                                minWidth: 140,
                                cursor: isDead || !combat.playerTurn ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: isDead ? 0.4 : 1,
                                boxShadow: isSelected ? '0 0 20px rgba(231, 76, 60, 0.6)' : 'none'
                              }}
                            >
                              <div style={{ 
                                fontSize: 40, 
                                textAlign: 'center', 
                                marginBottom: 8,
                                filter: isDead ? 'grayscale(100%)' : 'none'
                              }}>
                                {isDead ? '💀' : '👹'}
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
                          <h3 style={{ color: '#fff', marginBottom: 12, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
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
                            {reserveEnemies.map((enemy) => (
                              <div
                                key={enemy.instanceId}
                                style={{
                                  padding: 10,
                                  background: 'rgba(52, 73, 94, 0.4)',
                                  border: '2px solid #34495e',
                                  borderRadius: 8,
                                  minWidth: 100,
                                  opacity: 0.7
                                }}
                              >
                                <div style={{ 
                                  fontSize: 28, 
                                  textAlign: 'center', 
                                  marginBottom: 4
                                }}>
                                  👹
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
                            ))}
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
                          activeBuffs: result.state.activeBuffs
                        });
                        
                        // Enemy turn after player attacks
                        setTimeout(() => {
                          if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                            const enemyResult = enemyTurn(result.state);
                            usePlayerStore.setState({ 
                              combat: enemyResult.state.combat,
                              health: enemyResult.state.health,
                              activeBuffs: enemyResult.state.activeBuffs
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
                              activeBuffs: result.state.activeBuffs
                            });
                            
                            // Enemy turn after slash
                            setTimeout(() => {
                              if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                                const enemyResult = enemyTurn(result.state);
                                usePlayerStore.setState({ 
                                  combat: enemyResult.state.combat,
                                  health: enemyResult.state.health,
                                  activeBuffs: enemyResult.state.activeBuffs
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
                      const pivotCost = 2;
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
                              health: result.state.health 
                            });
                            
                            // Enemy turn after intimidation attempt
                            if (result.success) {
                              // If successful, check if combat ended
                              setTimeout(() => {
                                if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                                  const enemyResult = enemyTurn(result.state);
                                  usePlayerStore.setState({ 
                                    combat: enemyResult.state.combat,
                                    health: enemyResult.state.health 
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
                                    health: enemyResult.state.health 
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
                                  activeBuffs: result.state.activeBuffs
                                });
                                setSelectedSpell(null);
                                
                                // Enemy turn after casting
                                setTimeout(() => {
                                  if (result.state.combat && result.state.combat.active && !result.state.combat.playerTurn) {
                                    const enemyResult = enemyTurn(result.state);
                                    usePlayerStore.setState({ 
                                      combat: enemyResult.state.combat,
                                      health: enemyResult.state.health 
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
                  {combat.combatLog.slice(-30).map((entry, idx) => {
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>Equipment</h3>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>
                    AR: {getTotalArmourRating({ stats, equipment, inventory, currentAreaId, discoveredMap, spellsKnown, spellPathsUnlocked, combatSkills: combatSkills || [], health, stamina: stamina || 0, maxStamina: maxStamina || 0, lastCheckpointId, flags: flags || {}, quests: quests || {}, questLog: questLog || [] })}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Paper Doll Visual with body-shaped layout */}
                  <div style={{ 
                    position: 'relative', 
                    width: '100%', 
                    maxWidth: 400,
                    margin: '0 auto',
                    minHeight: 600,
                    background: 'url(/icons/paper_doll_bg.svg) center center no-repeat, linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)', 
                    backgroundSize: 'contain',
                    borderRadius: 12, 
                    border: '3px solid #dee2e6', 
                    padding: '30px 20px'
                  }}>
                    {/* Head slot */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 16, 
                      background: equipment.head ? '#d1ecf1' : '#fff', 
                      border: '3px dashed #6c757d', 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600,
                      width: 80,
                      height: 80,
                      margin: '0 auto 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {equipment.head || 'HEAD'}
                    </div>
                    
                    {/* Chest slot */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 20, 
                      background: equipment.chest ? '#d1ecf1' : '#fff', 
                      border: '3px dashed #6c757d', 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600,
                      width: 100,
                      height: 120,
                      margin: '0 auto 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {equipment.chest || 'CHEST'}
                    </div>
                    
                    {/* Hands row - shows gloves with weapons layered on top */}
                    <div style={{ display: 'flex', gap: 60, justifyContent: 'center', marginBottom: 20 }}>
                      {/* Offhand (left hand) */}
                      <div style={{ 
                        position: 'relative', 
                        textAlign: 'center', 
                        padding: 16, 
                        background: (equipment.gloves || equipment.offhand) ? '#d1ecf1' : '#fff', 
                        border: '3px dashed #6c757d', 
                        borderRadius: 8, 
                        fontSize: 14, 
                        fontWeight: 600,
                        width: 80,
                        height: 80,
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
                        padding: 16, 
                        background: (equipment.gloves || equipment.mainhand) ? '#d1ecf1' : '#fff', 
                        border: '3px dashed #6c757d', 
                        borderRadius: 8, 
                        fontSize: 14, 
                        fontWeight: 600,
                        width: 80,
                        height: 80,
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
                      padding: 16, 
                      background: equipment.legs ? '#d1ecf1' : '#fff', 
                      border: '3px dashed #6c757d', 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600,
                      width: 100,
                      height: 100,
                      margin: '0 auto 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {equipment.legs || 'LEGS'}
                    </div>
                    
                    {/* Boots slot */}
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 16, 
                      background: equipment.boots ? '#d1ecf1' : '#fff', 
                      border: '3px dashed #6c757d', 
                      borderRadius: 8, 
                      fontSize: 14, 
                      fontWeight: 600,
                      width: 80,
                      height: 60,
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {equipment.boots || 'BOOTS'}
                    </div>
                  </div>
                  
                  {/* Equipment Details - Weapons Section Below */}
                  <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
                    <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 14, color: '#6c757d', textAlign: 'center' }}>EQUIPPED WEAPONS</h4>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
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
                            {itemId && (
                              <button onClick={() => {
                                console.log(`Unequip ${itemId} from ${slot}`);
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
                    
                    <h4 style={{ marginTop: 20, marginBottom: 8, fontSize: 14, color: '#6c757d', textAlign: 'center' }}>ARMOR PIECES</h4>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {['head', 'chest', 'gloves', 'legs', 'boots'].map(slot => {
                        const itemId = equipment[slot];
                        return (
                          <div key={slot} style={{ 
                            flex: '0 0 calc(50% - 6px)',
                            padding: '8px 12px', 
                            background: '#f8f9fa',
                            border: '2px solid #dee2e6', 
                            borderRadius: 6,
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            minWidth: 120
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#6c757d' }}>
                              {slot}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: '600' }}>
                              {itemId || <em style={{ color: '#adb5bd' }}>Empty</em>}
                            </div>
                            {itemId && (
                              <button onClick={() => {
                                console.log(`Unequip ${itemId} from ${slot}`);
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
                
                <h3>Combat Skills</h3>
                <div style={{ marginBottom: 20 }}>
                  {[
                    { id: 'clash', name: 'Clash', cost: 1, stamina: 1, icon: '🛡️', desc: 'Force enemy back, preventing their attack and second enemy\'s attack' },
                    { id: 'pivot', name: 'Pivot', cost: 2, stamina: 2, icon: '🔄', desc: 'Normal attack + 50% defense boost against second opponent' },
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
                
                <div style={{ marginTop: 20, padding: 12, background: '#f0f0f0', borderRadius: 8, fontSize: 12 }}>
                  <strong>Currency:</strong> 💰 {stats.gold} Gold
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
                        { id: 'fire', name: 'Fire', icon: '🔥', color: '#e74c3c', desc: 'Offensive magic' },
                        { id: 'water', name: 'Water', icon: '💧', color: '#3498db', desc: 'Control & crowd control' },
                        { id: 'earth', name: 'Earth', icon: '🪨', color: '#95a5a6', desc: 'Defense & utility' },
                        { id: 'air', name: 'Air', icon: '💨', color: '#1abc9c', desc: 'Speed & mobility' }
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
                            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                              {path.desc}
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
            
            {modalPage === 'map' && (
              <div>
                <p>Current Area: {currentAreaId}</p>
                <p>Map system coming soon...</p>
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

const btnStyle: any = { background:'#222', color:'#fff', padding:12, margin:'8px 0', borderRadius:8, width:260, cursor:'pointer', border:'none', fontSize:14 }
