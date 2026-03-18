import { PlayerState, Enemy, EnemyInstance } from './types';
import { getTotalArmourRating, getTotalDamageRating, getMeleeAttack, getMeleeDefense, getIntimidation, getMaxStamina } from './skillCalculations';
import { getContentSnapshot } from './contentLoader';

function rollD100(): number {
  // Use crypto.getRandomValues for truly random numbers
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Convert to 1-100 range
  return (array[0] % 100) + 1;
}

function getEnemyById(enemyId: string): Enemy | null {
  const content = getContentSnapshot();
  if (!content || !content.enemies) {
    console.error('Content not loaded or enemies missing');
    return null;
  }
  // enemies is a Map, not an array
  let enemy: any = null;
  if (content.enemies instanceof Map) {
    enemy = content.enemies.get(enemyId);
  } else {
    // Fallback for array (shouldn't happen but be safe)
    const enemies = Array.isArray(content.enemies) ? content.enemies : [];
    enemy = enemies.find((e: any) => e.id === enemyId);
  }
  
  if (!enemy) return null;
  
  // Convert legacy format (skill/stamina) to new format (stats/maxHealth) if needed
  if (enemy.skill !== undefined && !enemy.stats) {
    const power = Math.floor(enemy.skill / 2) || 1;
    const agility = Math.floor(enemy.skill / 2) || 1;
    enemy = {
      ...enemy,
      stats: {
        power: power,
        mind: 1,
        agility: agility,
        vision: 1
      },
      maxHealth: enemy.stamina * 10 || 10
    };
  }
  
  return enemy;
}

function isEnemyWeakened(enemy: EnemyInstance): boolean {
  // Check if enemy health is at or below 50%
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  if (healthPercent > 50) return false;
  
  // Check if enemy is a boss (exclude bosses from weakening mechanic)
  const enemyDef = getEnemyById(enemy.enemyId);
  if (enemyDef && enemyDef.tags && enemyDef.tags.includes('boss')) {
    return false;
  }
  
  return true;
}

function isEnemyDying(enemy: EnemyInstance): boolean {
  // Check if enemy health is below 10%
  const healthPercent = (enemy.health / enemy.maxHealth) * 100;
  if (healthPercent >= 10) return false;
  
  // Check if enemy is a boss (exclude bosses from dying mechanic)
  const enemyDef = getEnemyById(enemy.enemyId);
  if (enemyDef && enemyDef.tags && enemyDef.tags.includes('boss')) {
    return false;
  }
  
  return true;
}

function getEnemyMeleeAttack(enemy: EnemyInstance): number {
  return enemy.stats.power * 10;
}

function getEnemyMeleeDefense(enemy: EnemyInstance): number {
  const ar = getEnemyArmourRating(enemy);
  let defense = ar + enemy.stats.power * 5 + enemy.stats.agility * 5;
  
  // Apply weakening penalty: defense reduced by half when below 50% health
  if (isEnemyWeakened(enemy)) {
    defense = Math.floor(defense / 2);
  }
  
  return defense;
}

function getEnemyArmourRating(enemy: EnemyInstance): number {
  let total = 0;
  const content = getContentSnapshot();
  const items = content?.items; // Already a Map
  if (!items) return total;
  
  for (const [slot, itemId] of Object.entries(enemy.equipment || {})) {
    if (itemId) {
      const item = items instanceof Map ? items.get(itemId) : null;
      if (item && typeof item.armourRating === 'number') {
        total += item.armourRating;
      }
    }
  }
  
  return total;
}

function getEnemyDamageRating(enemy: EnemyInstance): number {
  let total = 0;
  const content = getContentSnapshot();
  const items = content?.items; // Already a Map
  if (!items) {
    return Math.max(1, Math.floor(enemy.stats.power / 2));
  }
  
  const mainhand = enemy.equipment?.mainhand;
  if (mainhand) {
    const weapon = items instanceof Map ? items.get(mainhand) : null;
    if (weapon && typeof weapon.damageRating === 'number') {
      total += weapon.damageRating;
    }
  }
  
  if (total === 0) {
    total = Math.max(1, Math.floor(enemy.stats.power / 2));
  }
  
  return total;
}

export function initiateCombat(enemyIds: string[], state: PlayerState): PlayerState {
  const newState = JSON.parse(JSON.stringify(state));
  const enemyInstances: EnemyInstance[] = [];
  newState.flags = newState.flags || {};

  // Apply pending consumable pre-combat effects.
  const pendingDamageBonus = Number(newState.flags._nextCombatAttackDamageBonus || 0);
  if (pendingDamageBonus > 0) {
    newState.activeBuffs = newState.activeBuffs || [];
    newState.activeBuffs.push({
      stat: 'attackDamage',
      value: pendingDamageBonus,
      duration: 999,
      source: 'next_combat_consumable'
    } as any);
    delete newState.flags._nextCombatAttackDamageBonus;
  }

  const staminaMult = Number(newState.flags._nextBattleStaminaMultiplier || 1);
  if (staminaMult > 1) {
    const baseMax = newState.maxStamina || getMaxStamina(newState);
    newState.flags._baseMaxStaminaBeforeNextBattle = baseMax;
    newState.maxStamina = baseMax * staminaMult;
    newState.stamina = newState.maxStamina;
    delete newState.flags._nextBattleStaminaMultiplier;
  }
  
  console.log('🎮 initiateCombat called with enemyIds:', enemyIds);
  const content = getContentSnapshot();
  console.log('📦 Content snapshot:', content ? 'loaded' : 'NOT LOADED');
  if (content && content.enemies instanceof Map) {
    console.log('👹 Enemies Map size:', content.enemies.size);
  }
  
  for (let i = 0; i < enemyIds.length; i++) {
    const enemyDef = getEnemyById(enemyIds[i]);
    console.log(`🔍 Loading enemy ${i}: ${enemyIds[i]}`, enemyDef ? 'Found' : 'NOT FOUND');
    if (!enemyDef) continue;
    
    const instance: EnemyInstance = {
      instanceId: `${enemyDef.id}_${i}_${Date.now()}`,
      enemyId: enemyDef.id,
      name: enemyDef.name,
      health: enemyDef.maxHealth,
      maxHealth: enemyDef.maxHealth,
      stats: { ...enemyDef.stats },
      equipment: enemyDef.equipment ? { ...enemyDef.equipment } : {},
      spells: enemyDef.spells ? [...enemyDef.spells] : [],
      position: i < 2 ? 'front' : 'back', // First 2 enemies in front, rest in back
      statusEffects: []
    };
    
    enemyInstances.push(instance);
  }
  
  newState.combat = {
    active: true,
    enemies: enemyInstances,
    selectedEnemyId: undefined,
    playerTurn: true,
    turnNumber: 1,
    combatLog: [`Combat initiated! ${enemyInstances.length} ${enemyInstances.length === 1 ? 'enemy' : 'enemies'} appeared!`],
    intimidationAttempts: {}
  };

  if (pendingDamageBonus > 0) {
    newState.combat.combatLog.push(`🍄 Golden mushroom effect active: +${pendingDamageBonus} damage this combat.`);
  }
  if (staminaMult > 1) {
    newState.combat.combatLog.push(`🍄 Purplish mushroom effect active: max stamina x${staminaMult} this combat.`);
  }
  
  return newState;
}

export function playerAttack(state: PlayerState): { state: PlayerState; log: string[] } {
  const newState = JSON.parse(JSON.stringify(state));
  const log: string[] = [];
  
  if (!newState.combat || !newState.combat.active) {
    return { state: newState, log: ['No active combat.'] };
  }
  
  if (!newState.combat.playerTurn) {
    return { state: newState, log: ['Not your turn!'] };
  }
  
  const targetId = newState.combat.selectedEnemyId;
  if (!targetId) {
    return { state: newState, log: ['No enemy selected!'] };
  }
  
  const enemy = newState.combat.enemies.find((e: EnemyInstance) => e.instanceId === targetId);
  if (!enemy || enemy.health <= 0) {
    return { state: newState, log: ['Invalid target!'] };
  }
  
  const attackRoll = rollD100();
  let attackSkill = getMeleeAttack(state);
  
  // Debug: Log active buffs
  if (state.activeBuffs && state.activeBuffs.length > 0) {
    const attackBuffs = state.activeBuffs.filter(b => b.stat === 'meleeAttack');
    if (attackBuffs.length > 0) {
      const bonusTotal = attackBuffs.reduce((sum, b) => sum + b.value, 0);
      log.push(`📊 Attack buffs active: +${bonusTotal}% (base: ${attackSkill - bonusTotal}%)`);
    }
  }
  
  // Check for dying state (coup de grace)
  const isDying = isEnemyDying(enemy);
  const isWeakened = isEnemyWeakened(enemy);
  
  let attackRequirement = attackSkill;
  
  if (isDying) {
    // Coup de grace: only need <90% to hit
    attackRequirement = 90;
  } else if (isWeakened) {
    // Apply bonus against weakened enemies: +50% to attack
    attackRequirement = Math.floor(attackSkill * 1.5);
  }
  
  const attackSuccess = attackRoll <= attackRequirement;
  
  let statusText = '';
  if (isDying) statusText = ' 💀 (Dying!)';
  else if (isWeakened) statusText = ' ⚠️ (Weakened!)';
  
  log.push(`🗡️ You attack ${enemy.name}!${statusText}`);
  log.push(`→ Attack roll: ${attackRoll} vs ${attackRequirement}% (${attackSuccess ? 'HIT' : 'MISS'})`);
  
  if (attackSuccess) {
    const defenseRoll = rollD100();
    const defenseSkill = getEnemyMeleeDefense(enemy);
    const defenseSuccess = defenseRoll <= defenseSkill;
    
    log.push(`🛡️ ${enemy.name} defends: ${defenseRoll} vs ${defenseSkill}% (${defenseSuccess ? 'PARRIED' : 'FAILED'})`);
    
    if (!defenseSuccess) {
      const damage = getTotalDamageRating(state);
      
      // Debug: Log damage buffs
      if (state.activeBuffs && state.activeBuffs.length > 0) {
        const damageBuffs = state.activeBuffs.filter(b => b.stat === 'attackDamage');
        if (damageBuffs.length > 0) {
          const bonusTotal = damageBuffs.reduce((sum, b) => sum + b.value, 0);
          log.push(`📊 Damage buffs active: +${bonusTotal} damage`);
        }
      }
      
      enemy.health = Math.max(0, enemy.health - damage);
      
      log.push(`💥 ${enemy.name} takes ${damage} damage! (${enemy.health}/${enemy.maxHealth} HP)`);
      
      if (enemy.health <= 0) {
        log.push(`☠️ ${enemy.name} defeated!`);
        enemy.deathTimestamp = Date.now();
        
        // Promote a back enemy to front if one exists
        const frontEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'front');
        const backEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'back');
        
        if (frontEnemies.length < 2 && backEnemies.length > 0) {
          const promoted = backEnemies[0];
          promoted.position = 'front';
          log.push(`⚔️ ${promoted.name} steps forward to fight!`);
        }
      }
    } else {
      log.push(`The attack was parried!`);
    }
  } else {
    log.push(`Your attack missed!`);
  }
  
  newState.combat.combatLog = [...newState.combat.combatLog, ...log].slice(-60);
  
  const livingEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0);
  if (livingEnemies.length === 0) {
    return endCombat(true, newState);
  }
  
  newState.combat.playerTurn = false;
  
  return { state: newState, log };
}

export function playerSlash(state: PlayerState): { state: PlayerState; log: string[] } {
  const newState = JSON.parse(JSON.stringify(state));
  const log: string[] = [];
  
  if (!newState.combat || !newState.combat.active) {
    return { state: newState, log: ['No active combat.'] };
  }
  
  if (!newState.combat.playerTurn) {
    return { state: newState, log: ['Not your turn!'] };
  }
  
  // Get front enemies
  const frontEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'front');
  
  if (frontEnemies.length === 0) {
    return { state: newState, log: ['No enemies to attack!'] };
  }
  
  log.push(`⚔️💥 You perform a SLASH attack against all front enemies!`);
  
  // Attack each front enemy separately
  for (const enemy of frontEnemies) {
    const attackRoll = rollD100();
    let attackSkill = getMeleeAttack(state);
    
    // Debug: Log active buffs
    if (state.activeBuffs && state.activeBuffs.length > 0) {
      const attackBuffs = state.activeBuffs.filter(b => b.stat === 'meleeAttack');
      if (attackBuffs.length > 0) {
        const bonusTotal = attackBuffs.reduce((sum, b) => sum + b.value, 0);
        log.push(`📊 Attack buffs active: +${bonusTotal}% (base: ${attackSkill - bonusTotal}%)`);
      }
    }
    
    // Check for dying state (coup de grace)
    const isDying = isEnemyDying(enemy);
    const isWeakened = isEnemyWeakened(enemy);
    
    let attackRequirement = attackSkill;
    
    if (isDying) {
      attackRequirement = 90;
    } else if (isWeakened) {
      attackRequirement = Math.floor(attackSkill * 1.5);
    }
    
    const attackSuccess = attackRoll <= attackRequirement;
    
    let statusText = '';
    if (isDying) statusText = ' 💀 (Dying!)';
    else if (isWeakened) statusText = ' ⚠️ (Weakened!)';
    
    log.push(`→ ${enemy.name}${statusText}: Roll ${attackRoll} vs ${attackRequirement}% (${attackSuccess ? 'HIT' : 'MISS'})`);
    
    if (attackSuccess) {
      const defenseRoll = rollD100();
      const defenseSkill = getEnemyMeleeDefense(enemy);
      const defenseSuccess = defenseRoll <= defenseSkill;
      
      log.push(`  🛡️ ${enemy.name} defends: ${defenseRoll} vs ${defenseSkill}% (${defenseSuccess ? 'PARRIED' : 'FAILED'})`);
      
      if (!defenseSuccess) {
        const damage = getTotalDamageRating(state);
        enemy.health = Math.max(0, enemy.health - damage);
        
        log.push(`  💥 ${enemy.name} takes ${damage} damage! (${enemy.health}/${enemy.maxHealth} HP)`);
        
        if (enemy.health <= 0) {
          log.push(`  ☠️ ${enemy.name} defeated!`);
          enemy.deathTimestamp = Date.now();
          
          // Promote a back enemy to front if one exists
          const currentFrontEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'front');
          const backEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'back');
          
          if (currentFrontEnemies.length < 2 && backEnemies.length > 0) {
            const promoted = backEnemies[0];
            promoted.position = 'front';
            log.push(`  ⚔️ ${promoted.name} steps forward to fight!`);
          }
        }
      } else {
        log.push(`  The attack was parried!`);
      }
    }
  }
  
  newState.combat.combatLog = [...newState.combat.combatLog, ...log].slice(-60);
  
  const livingEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0);
  if (livingEnemies.length === 0) {
    return endCombat(true, newState);
  }
  
  newState.combat.playerTurn = false;
  
  return { state: newState, log };
}

export function enemyTurn(state: PlayerState): { state: PlayerState; log: string[] } {
  const newState = JSON.parse(JSON.stringify(state));
  const log: string[] = [];
  
  if (!newState.combat || !newState.combat.active) {
    return { state: newState, log: ['No active combat.'] };
  }
  
  // Only front enemies can attack
  const livingEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'front');
  let attackerCount = 0;
  
  for (const enemy of livingEnemies) {
    attackerCount++;
    const frozen = enemy.statusEffects?.find((e: any) => e.type === 'frozen');
    if (frozen) {
      log.push(`❄️ ${enemy.name} is frozen and cannot act!`);
      continue;
    }
    
    const attackRoll = rollD100();
    const attackSkill = getEnemyMeleeAttack(enemy);
    const attackSuccess = attackRoll <= attackSkill;
    
    log.push(`⚔️ ${enemy.name} attacks!`);
    log.push(`→ Attack roll: ${attackRoll} vs ${attackSkill}% (${attackSuccess ? 'HIT' : 'MISS'})`);
    
    if (attackSuccess) {
      const defenseRoll = rollD100();
      let defenseSkill = getMeleeDefense(state);
      
      // Apply pivot defense bonus to second attacker
      if (attackerCount === 2 && newState.combat.pivotDefenseBonus?.active) {
        defenseSkill = Math.floor(defenseSkill * 1.5);
        log.push(`🔄 Pivot bonus: defense increased to ${defenseSkill}% against second attacker!`);
      }
      
      const defenseSuccess = defenseRoll <= defenseSkill;
      
      log.push(`🛡️ You defend: ${defenseRoll} vs ${defenseSkill}% (${defenseSuccess ? 'PARRIED' : 'FAILED'})`);
      
      if (!defenseSuccess) {
        const baseDamage = getEnemyDamageRating(enemy);
        const playerAR = getTotalArmourRating(state);
        const arReduction = Math.floor(baseDamage * (playerAR / 100));
        const damage = Math.max(1, baseDamage - arReduction);
        
        newState.health = Math.max(0, newState.health - damage);
        
        if (playerAR > 0) {
          log.push(`💔 You take ${damage} damage (${baseDamage} - ${arReduction} AR)! (${newState.health}/100 HP)`);
        } else {
          log.push(`💔 You take ${damage} damage! (${newState.health}/100 HP)`);
        }
        
        if (newState.health <= 0) {
          log.push(`💀 You have been defeated!`);
          newState.combat.active = false;
          newState.combat.combatLog = [...newState.combat.combatLog, ...log].slice(-60);
          return { state: newState, log };
        }
      } else {
        log.push(`You parried the attack!`);
      }
    } else {
      log.push(`${enemy.name} missed!`);
    }
  }
  
  // Clear pivot defense bonus after enemy turn
  if (newState.combat && newState.combat.pivotDefenseBonus) {
    newState.combat.pivotDefenseBonus.active = false;
  }
  
  // Don't remove dead enemies - keep them for victory screen tallying
  // They'll be cleaned up when combat ends
  
  // Promote reserves to front line if slots are available
  const livingFrontEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'front');
  const livingBackEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'back');
  
  if (livingFrontEnemies.length < 2 && livingBackEnemies.length > 0) {
    const promoted = livingBackEnemies[0];
    promoted.position = 'front';
    log.push(`⚔️ ${promoted.name} steps forward from reserves!`);
  }
  
  for (const enemy of newState.combat.enemies) {
    if (enemy.statusEffects) {
      enemy.statusEffects = enemy.statusEffects
        .map((e: any) => ({ ...e, duration: e.duration - 1 }))
        .filter((e: any) => e.duration > 0);
    }
  }
  
  // Decrement player buffs
  if (newState.activeBuffs) {
    newState.activeBuffs = newState.activeBuffs
      .map((b: any) => ({ ...b, duration: b.duration - 1 }))
      .filter((b: any) => b.duration > 0);
  }
  
  newState.combat.combatLog = [...newState.combat.combatLog, ...log].slice(-60);
  newState.combat.playerTurn = true;
  newState.combat.turnNumber += 1;
  log.push(`--- Turn ${newState.combat.turnNumber} ---`);
  
  return { state: newState, log };
}

export function playerPivot(targetInstanceId: string, state: PlayerState): { state: PlayerState; log: string[] } {
  const newState = JSON.parse(JSON.stringify(state));
  const log: string[] = [];
  
  if (!newState.combat || !newState.combat.active) {
    return { state: newState, log: ['No active combat.'] };
  }
  
  if (!newState.combat.playerTurn) {
    return { state: newState, log: ['Not your turn!'] };
  }
  
  const targetEnemy = newState.combat.enemies.find((e: EnemyInstance) => e.instanceId === targetInstanceId);
  if (!targetEnemy || targetEnemy.health <= 0) {
    return { state: newState, log: ['Invalid target.'] };
  }
  
  log.push(`🔄 You pivot to attack ${targetEnemy.name}!`);
  
  // Perform normal attack
  const enemyDef = getEnemyById(targetEnemy.enemyId);
  if (!enemyDef) {
    return { state: newState, log: ['Enemy definition not found.'] };
  }
  
  // Calculate player attack with potential weakening bonus
  let playerAttackSkill = getMeleeAttack(newState);
  if (isEnemyWeakened(targetEnemy)) {
    playerAttackSkill = Math.floor(playerAttackSkill * 1.5);
    log.push(`${targetEnemy.name} is weakened! Your attack skill increased to ${playerAttackSkill}%.`);
  }
  
  const playerRoll = rollD100();
  const attackSuccess = playerRoll <= playerAttackSkill;
  log.push(`Player rolls ${playerRoll} vs Attack ${playerAttackSkill}% → ${attackSuccess ? 'HIT' : 'MISS'}`);
  
  if (attackSuccess) {
    const dmg = getTotalDamageRating(newState);
    const ar = getEnemyArmourRating(targetEnemy);
    let finalDmg = Math.max(1, dmg - ar);
    
    // Apply weakening damage multiplier
    if (isEnemyWeakened(targetEnemy)) {
      finalDmg = Math.floor(finalDmg * 1.5);
    }
    
    targetEnemy.health = Math.max(0, targetEnemy.health - finalDmg);
    log.push(`💥 You deal ${finalDmg} damage! (${targetEnemy.name}: ${targetEnemy.health}/${enemyDef.maxHealth} HP)`);
    
    if (targetEnemy.health <= 0) {
      log.push(`☠️ ${targetEnemy.name} is defeated!`);
      targetEnemy.deathTimestamp = Date.now();
      
      // Promote a back enemy to front if one exists
      const frontEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'front');
      const backEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0 && e.position === 'back');
      
      if (frontEnemies.length < 2 && backEnemies.length > 0) {
        const promoted = backEnemies[0];
        promoted.position = 'front';
        log.push(`⚔️ ${promoted.name} steps forward to fight!`);
      }
    }
  } else {
    log.push(`Miss! ${targetEnemy.name} dodges your attack.`);
  }
  
  // Set pivot defense bonus flag for this combat round
  if (!newState.combat.pivotDefenseBonus) {
    newState.combat.pivotDefenseBonus = {} as any;
  }
  newState.combat.pivotDefenseBonus.active = true;
  newState.combat.pivotDefenseBonus.targetId = targetInstanceId;
  
  log.push(`🛡️ Pivot stance: +50% defense against second attacker this turn!`);
  
  // End player turn
  newState.combat.playerTurn = false;
  
  return { state: newState, log };
}

export function intimidateEnemy(enemyInstanceId: string, state: PlayerState): { state: PlayerState; log: string[]; success: boolean } {
  const newState = JSON.parse(JSON.stringify(state));
  const log: string[] = [];
  
  if (!newState.combat || !newState.combat.active) {
    return { state: newState, log: ['No active combat.'], success: false };
  }
  
  const enemy = newState.combat.enemies.find((e: EnemyInstance) => e.instanceId === enemyInstanceId);
  if (!enemy || enemy.health <= 0) {
    return { state: newState, log: ['Invalid target!'], success: false };
  }
  
  // Check if enemy is humanoid
  const enemyDef = getEnemyById(enemy.enemyId);
  if (!enemyDef || enemyDef.kind !== 'humanoid') {
    return { state: newState, log: [`${enemy.name} is not humanoid and cannot be intimidated!`], success: false };
  }
  
  // Check if we're inside city walls (check current area tags)
  const content = getContentSnapshot();
  const currentArea = content?.areas?.get?.(state.currentAreaId);
  const insideCityWalls = currentArea?.tags?.includes('city') || currentArea?.tags?.includes('fortress');
  
  if (!insideCityWalls) {
    return { state: newState, log: ['You can only send enemies to the dungeons inside the city walls!'], success: false };
  }
  
  // Roll intimidation
  const intimidationRoll = rollD100();
  let intimidationSkill = getIntimidation(state);
  
  // Apply bonus for Weakened (50% health) or Dying (10% health) enemies
  const isWeakened = isEnemyWeakened(enemy);
  const isDying = isEnemyDying(enemy);
  
  if (isWeakened) {
    intimidationSkill = Math.floor(intimidationSkill * 1.5);
  }
  
  // Initialize intimidation attempts tracking if needed
  if (!newState.combat.intimidationAttempts) {
    newState.combat.intimidationAttempts = {};
  }
  
  // Get previous attempts against this specific enemy
  const previousAttempts = newState.combat.intimidationAttempts[enemyInstanceId] || 0;
  
  // Add 5% bonus per previous attempt (cumulative)
  const attemptBonus = previousAttempts * 5;
  intimidationSkill += attemptBonus;
  
  // Track this attempt
  newState.combat.intimidationAttempts[enemyInstanceId] = previousAttempts + 1;
  
  const success = intimidationRoll <= intimidationSkill;
  
  const statusText = isDying ? ' 💀 (Dying!)' : isWeakened ? ' ⚠️ (Weakened!)' : '';
  const attemptText = previousAttempts > 0 ? ` [+${attemptBonus}% from ${previousAttempts} previous attempt${previousAttempts > 1 ? 's' : ''}]` : '';
  
  log.push(`👁️ You attempt to intimidate ${enemy.name}!${statusText}${attemptText}`);
  log.push(`→ Intimidation roll: ${intimidationRoll} vs ${intimidationSkill}% (${success ? 'SUCCESS' : 'FAILED'})`);
  
  if (success) {
    // Mark enemy as defeated (set health to 0)
    enemy.health = 0;
    enemy.surrendered = true;
    log.push(`⛓️ ${enemy.name} surrenders and is sent to the dungeons!`);
  } else {
    log.push(`${enemy.name} refuses to surrender!`);
  }
  
  newState.combat.combatLog = [...newState.combat.combatLog, ...log].slice(-60);
  
  // Check if all enemies are defeated
  const livingEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0);
  if (livingEnemies.length === 0) {
    const endResult = endCombat(true, newState);
    return { ...endResult, success };
  }
  
  // End player turn after intimidation attempt
  newState.combat.playerTurn = false;
  
  return { state: newState, log, success };
}

export function endCombat(victory: boolean, state: PlayerState): { state: PlayerState; log: string[] } {
  const newState = JSON.parse(JSON.stringify(state));
  const log: string[] = [];
  
  if (!newState.combat) {
    return { state: newState, log: [] };
  }
  
  if (victory) {
    log.push(`🎉 Victory! All enemies defeated!`);
    
    // Restore stamina to max after combat (don't recalculate maxStamina, only restore current stamina)
    const maxStam = newState.maxStamina || getMaxStamina(newState);
    newState.stamina = maxStam;
    
    let totalGold = 0;
    let totalStatPoints = 0;
    const itemsLooted: string[] = [];

    const grantLootItem = (itemId: string, qty: number) => {
      if (!itemId || qty <= 0) return;
      const existing = newState.inventory.find((i: any) => i.itemId === itemId);
      if (existing) {
        existing.qty += qty;
      } else {
        newState.inventory.push({ itemId, qty });
      }
      itemsLooted.push(`${itemId} x${qty}`);
    };

    const isOrcOrGoblin = (enemyDef: any) => {
      const id = String(enemyDef?.id || '').toLowerCase();
      const name = String(enemyDef?.name || '').toLowerCase();
      const tags = Array.isArray(enemyDef?.tags)
        ? enemyDef.tags.map((t: any) => String(t).toLowerCase())
        : [];
      return id.includes('orc') || id.includes('goblin') || name.includes('orc') || name.includes('goblin') || tags.includes('orc') || tags.includes('goblin');
    };
    
    for (const enemy of newState.combat.enemies) {
      const enemyDef = getEnemyById(enemy.enemyId);
      if (!enemyDef) continue;
      
      if (enemyDef.goldDrop) {
        const gold = Math.floor(Math.random() * (enemyDef.goldDrop.max - enemyDef.goldDrop.min + 1)) + enemyDef.goldDrop.min;
        totalGold += gold;
      }
      
      if (enemyDef.statPointsDrop) {
        totalStatPoints += enemyDef.statPointsDrop;
      }
      
      // Handle loot object structure
      if (enemyDef.loot) {
        // Gold drops
        if (enemyDef.loot.gold) {
          const gold = Math.floor(Math.random() * (enemyDef.loot.gold.max - enemyDef.loot.gold.min + 1)) + enemyDef.loot.gold.min;
          totalGold += gold;
        }
        
        // Stat point drops
        if (enemyDef.loot.statPoints) {
          const roll = Math.random();
          if (roll <= enemyDef.loot.statPoints.probability) {
            totalStatPoints += enemyDef.loot.statPoints.amount;
          }
        }
        
        // Item drops
        if (enemyDef.loot.items && Array.isArray(enemyDef.loot.items)) {
          for (const lootEntry of enemyDef.loot.items) {
            const chance = lootEntry.chance ?? lootEntry.probability ?? 1;
            if (Math.random() <= chance) {
              const minQty = lootEntry.min ?? lootEntry.qty ?? 1;
              const maxQty = lootEntry.max ?? lootEntry.qty ?? minQty;
              const qty = Math.max(1, Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty);
              grantLootItem(lootEntry.itemId, qty);
            }
          }
        }
      }

      // Bonus common-sense drops for orc/goblin encounters.
      if (isOrcOrGoblin(enemyDef)) {
        const idText = String(enemyDef.id || '').toLowerCase();
        const isOrc = idText.includes('orc');
        const bonusDrops = [
          { itemId: 'redknife', chance: 0.2, qty: 1 },
          { itemId: 'cutlass', chance: 0.14, qty: 1 },
          { itemId: 'small_shield', chance: 0.1, qty: 1 },
          { itemId: 'chainmail', chance: isOrc ? 0.08 : 0.03, qty: 1 }
        ];

        for (const drop of bonusDrops) {
          if (Math.random() <= drop.chance) {
            grantLootItem(drop.itemId, drop.qty);
          }
        }
      }
    }
    
    if (totalGold > 0) {
      newState.stats.gold += totalGold;
      log.push(`💰 Looted ${totalGold} gold`);
    }
    
    if (totalStatPoints > 0) {
      newState.stats.statPoints += totalStatPoints;
      log.push(`⭐ Gained ${totalStatPoints} Stat Points`);
    }
    
    if (itemsLooted.length > 0) {
      log.push(`📦 Looted: ${itemsLooted.join(', ')}`);
    }
    
    // Set victory screen data - separate killed from imprisoned
    const enemiesKilled = newState.combat.enemies
      .filter((e: EnemyInstance) => !e.surrendered)
      .map((e: EnemyInstance) => ({
        name: e.name,
        enemyId: e.enemyId
      }));
    
    const enemiesImprisoned = newState.combat.enemies
      .filter((e: EnemyInstance) => e.surrendered)
      .map((e: EnemyInstance) => ({
        name: e.name,
        enemyId: e.enemyId
      }));
    
    const itemsLootedParsed = itemsLooted.map((item: string) => {
      const match = item.match(/(.+) x(\d+)/);
      if (match) {
        return { itemId: match[1], qty: parseInt(match[2]) };
      }
      return { itemId: item, qty: 1 };
    });
    
    newState.combat.victoryScreen = {
      enemiesKilled,
      enemiesImprisoned,
      goldLooted: totalGold,
      statPointsGained: totalStatPoints,
      itemsLooted: itemsLootedParsed
    };
    
    newState.combat.active = false;
  } else {
    log.push(`💀 Defeat...`);
    
    // Find the enemy that's currently attacking (assume last alive enemy)
    const killerEnemy = newState.combat.enemies.find((e: EnemyInstance) => e.health > 0);
    
    newState.combat.defeatScreen = {
      killedBy: killerEnemy ? killerEnemy.name : 'Unknown Enemy',
      checkpointName: newState.lastCheckpointId || 'Starting Area'
    };
    
    newState.combat.active = false;
  }

  // Clear one-combat consumable effects after combat ends.
  if (Array.isArray(newState.activeBuffs)) {
    newState.activeBuffs = newState.activeBuffs.filter((b: any) => b.source !== 'next_combat_consumable');
  }

  // Revert temporary max stamina granted for one battle.
  if (newState.flags && newState.flags._baseMaxStaminaBeforeNextBattle) {
    const baseMax = Number(newState.flags._baseMaxStaminaBeforeNextBattle);
    if (baseMax > 0) {
      newState.maxStamina = baseMax;
      newState.stamina = baseMax;
    }
    delete newState.flags._baseMaxStaminaBeforeNextBattle;
  }
  
  return { state: newState, log };
}

export function selectEnemy(enemyInstanceId: string | undefined, state: PlayerState): PlayerState {
  const newState = JSON.parse(JSON.stringify(state));
  
  if (newState.combat) {
    // Reset intimidation attempts when switching to a different enemy
    if (newState.combat.selectedEnemyId !== enemyInstanceId) {
      if (!newState.combat.intimidationAttempts) {
        newState.combat.intimidationAttempts = {};
      }
      // Don't reset the counter for the newly selected enemy, just switch selection
    }
    newState.combat.selectedEnemyId = enemyInstanceId;
  }
  
  return newState;
}

function getSpellResistance(enemy: EnemyInstance): number {
  // SR = Mind * 10 + base 20
  return enemy.stats.mind * 10 + 20;
}

export function castSpell(spellId: string, targetIds: string[] | undefined, state: PlayerState): { state: PlayerState; log: string[] } {
  const newState = JSON.parse(JSON.stringify(state));
  const log: string[] = [];
  
  if (!newState.combat || !newState.combat.active) {
    return { state: newState, log: ['No active combat.'] };
  }
  
  if (!newState.combat.playerTurn) {
    return { state: newState, log: ['Not your turn!'] };
  }
  
  // Get spell data
  const content = getContentSnapshot();
  const spells = content?.spells || new Map();
  const spell = spells.get(spellId);
  
  if (!spell) {
    return { state: newState, log: [`Unknown spell: ${spellId}`] };
  }
  
  if (!newState.spellsKnown.includes(spellId)) {
    return { state: newState, log: [`You haven't learned ${spell.name}!`] };
  }
  
  log.push(`✨ Casting ${spell.name}...`);
  
  // Determine targets based on spell targeting
  let targets: EnemyInstance[] = [];
  
  switch (spell.targeting) {
    case 'single':
      if (targetIds && targetIds.length > 0) {
        const target = newState.combat.enemies.find((e: EnemyInstance) => e.instanceId === targetIds[0]);
        if (target && target.health > 0) targets.push(target);
      }
      if (targets.length === 0) {
        return { state: newState, log: ['No valid target selected!'] };
      }
      break;
      
    case 'multi':
      // Target up to 3 enemies
      const aliveEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0);
      targets = aliveEnemies.slice(0, Math.min(3, aliveEnemies.length));
      break;
      
    case 'all_enemies':
      targets = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0);
      break;
      
    case 'self':
      // Self-targeting spells (buffs)
      break;
      
    case 'area':
      targets = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0);
      break;
  }
  
  // Apply spell effects
  const effects = spell.effects || {};
  
  // Self buffs
  if (spell.targeting === 'self' && effects.buff) {
    const buffArray = Array.isArray(effects.buff) ? effects.buff : [effects.buff];
    
    newState.activeBuffs = newState.activeBuffs || [];
    
    // Remove old buffs from THIS spell to prevent self-stacking
    // This allows Fireblade + Iceblade to stack, but not Fireblade + Fireblade
    newState.activeBuffs = newState.activeBuffs.filter((b: any) => b.source !== spellId);
    
    for (const buff of buffArray) {
      // Add new buff with spell source
      newState.activeBuffs.push({
        stat: buff.stat,
        value: buff.value,
        duration: buff.duration,
        source: spellId
      });
      
      log.push(`🛡️ Gained ${buff.stat} +${buff.value} for ${buff.duration} turns`);
    }
  }
  
  // Special effects
  if (effects.special) {
    switch (effects.special) {
      case 'double_action':
        log.push('⚡ You can take 2 actions this turn!');
        // Note: Would need to track action count in combat state
        break;
      case 'can_flee':
        log.push('💨 You can now flee combat!');
        break;
      case 'chain_damage':
        // Chain lightning - variable damage
        targets.forEach((target: EnemyInstance) => {
          const damage = Math.floor(rollD100() / 10);
          target.health = Math.max(0, target.health - damage);
          log.push(`⚡ ${target.name} takes ${damage} lightning damage! (${target.health}/${target.maxHealth} HP)`);
        });
        break;
    }
  }
  
  // Damage and status effects on targets
  targets.forEach((target: EnemyInstance) => {
    let applyEffect = true;
    
    // Spell Resistance check
    if (spell.requiresSR) {
      const srRoll = rollD100();
      const sr = getSpellResistance(target);
      
      if (srRoll <= sr) {
        log.push(`🛡️ ${target.name} resisted! (${srRoll} ≤ ${sr} SR)`);
        
        if (spell.srEffect === 'negate') {
          applyEffect = false;
        } else if (spell.srEffect === 'halve') {
          // Damage will be halved below
        } else if (spell.srEffect === 'reduce_duration') {
          // Duration will be reduced below
        }
      }
    }
    
    if (!applyEffect) return;
    
    // Apply damage
    if (effects.damage) {
      let damage = Math.floor(Math.random() * (effects.damage.max - effects.damage.min + 1)) + effects.damage.min;
      
      // Halve damage if SR successful and effect is 'halve'
      if (spell.requiresSR && spell.srEffect === 'halve') {
        const srRoll = rollD100();
        const sr = getSpellResistance(target);
        if (srRoll <= sr) {
          damage = Math.floor(damage / 2);
        }
      }
      
      // Ignore AR if spell has that property
      if (!effects.ignoresAR) {
        const ar = getEnemyArmourRating(target);
        damage = Math.max(1, damage - ar);
      }
      
      target.health = Math.max(0, target.health - damage);
      log.push(`💥 ${target.name} takes ${damage} damage! (${target.health}/${target.maxHealth} HP)`);
      
      if (target.health <= 0) {
        log.push(`☠️ ${target.name} defeated!`);
      }
    }
    
    // Apply status effect
    if (effects.statusEffect) {
      const status = effects.statusEffect;
      let duration = status.duration;
      
      // Reduce duration if SR successful and effect is 'reduce_duration'
      if (spell.requiresSR && spell.srEffect === 'reduce_duration') {
        const srRoll = rollD100();
        const sr = getSpellResistance(target);
        if (srRoll <= sr) {
          duration = Math.max(1, duration - 1);
        }
      }
      
      target.statusEffects = target.statusEffects || [];
      target.statusEffects.push({
        type: status.type,
        duration: duration,
        value: status.value
      });
      
      const effectEmojis: Record<string, string> = {
        frozen: '❄️',
        burning: '🔥',
        stunned: '💫',
        poisoned: '☠️'
      };
      
      log.push(`${effectEmojis[status.type] || '✨'} ${target.name} is ${status.type} for ${duration} turn(s)!`);
    }
    
    // Apply debuff (negative buff on enemy)
    if (effects.buff && effects.buff.value < 0) {
      log.push(`⬇️ ${target.name}'s ${effects.buff.stat} reduced by ${Math.abs(effects.buff.value)} for ${effects.buff.duration} turns`);
    }
  });
  
  // End player turn
  newState.combat.playerTurn = false;
  newState.combat.combatLog = [...newState.combat.combatLog, ...log].slice(-60);
  
  // Check if all enemies defeated
  const allDead = newState.combat.enemies.every((e: EnemyInstance) => e.health <= 0);
  if (allDead) {
    const endResult = endCombat(true, newState);
    return { state: endResult.state, log: [...log, ...endResult.log] };
  }
  
  return { state: newState, log };
}
