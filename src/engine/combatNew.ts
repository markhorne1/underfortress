import { PlayerState, Enemy, EnemyInstance } from './types';
import { getTotalArmourRating, getTotalDamageRating, getMeleeAttack, getMeleeDefense } from './skillCalculations';
import { getContentSnapshot } from './contentLoader';

function rollD100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

function getEnemyById(enemyId: string): Enemy | null {
  const content = getContentSnapshot();
  const enemies = content?.enemies || [];
  return enemies.find((e: Enemy) => e.id === enemyId) || null;
}

function getEnemyMeleeAttack(enemy: EnemyInstance): number {
  return enemy.stats.power * 10;
}

function getEnemyMeleeDefense(enemy: EnemyInstance): number {
  const ar = getEnemyArmourRating(enemy);
  return ar + enemy.stats.power * 5 + enemy.stats.agility * 5;
}

function getEnemyArmourRating(enemy: EnemyInstance): number {
  let total = 0;
  const content = getContentSnapshot();
  const items = content?.items || [];
  const itemMap = new Map();
  
  for (const item of items) {
    if (item && item.id) itemMap.set(item.id, item);
  }
  
  for (const [slot, itemId] of Object.entries(enemy.equipment || {})) {
    if (itemId) {
      const item = itemMap.get(itemId);
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
  const items = content?.items || [];
  const itemMap = new Map();
  
  for (const item of items) {
    if (item && item.id) itemMap.set(item.id, item);
  }
  
  const mainhand = enemy.equipment?.mainhand;
  if (mainhand) {
    const weapon = itemMap.get(mainhand);
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
  
  for (let i = 0; i < enemyIds.length; i++) {
    const enemyDef = getEnemyById(enemyIds[i]);
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
    combatLog: [`Combat initiated! ${enemyInstances.length} ${enemyInstances.length === 1 ? 'enemy' : 'enemies'} appeared!`]
  };
  
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
  const attackSkill = getMeleeAttack(state);
  const attackSuccess = attackRoll <= attackSkill;
  
  log.push(`🗡️ You attack ${enemy.name}!`);
  log.push(`→ Attack roll: ${attackRoll} vs ${attackSkill}% (${attackSuccess ? 'HIT' : 'MISS'})`);
  
  if (attackSuccess) {
    const defenseRoll = rollD100();
    const defenseSkill = getEnemyMeleeDefense(enemy);
    const defenseSuccess = defenseRoll <= defenseSkill;
    
    log.push(`🛡️ ${enemy.name} defends: ${defenseRoll} vs ${defenseSkill}% (${defenseSuccess ? 'PARRIED' : 'FAILED'})`);
    
    if (!defenseSuccess) {
      const damage = getTotalDamageRating(state);
      enemy.health = Math.max(0, enemy.health - damage);
      
      log.push(`💥 ${enemy.name} takes ${damage} damage! (${enemy.health}/${enemy.maxHealth} HP)`);
      
      if (enemy.health <= 0) {
        log.push(`☠️ ${enemy.name} defeated!`);
      }
    } else {
      log.push(`The attack was parried!`);
    }
  } else {
    log.push(`Your attack missed!`);
  }
  
  newState.combat.combatLog = [...newState.combat.combatLog, ...log];
  
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
  
  const livingEnemies = newState.combat.enemies.filter((e: EnemyInstance) => e.health > 0);
  
  for (const enemy of livingEnemies) {
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
      const defenseSkill = getMeleeDefense(state);
      const defenseSuccess = defenseRoll <= defenseSkill;
      
      log.push(`🛡️ You defend: ${defenseRoll} vs ${defenseSkill}% (${defenseSuccess ? 'PARRIED' : 'FAILED'})`);
      
      if (!defenseSuccess) {
        const damage = getEnemyDamageRating(enemy);
        newState.health = Math.max(0, newState.health - damage);
        
        log.push(`💔 You take ${damage} damage! (${newState.health}/100 HP)`);
        
        if (newState.health <= 0) {
          log.push(`💀 You have been defeated!`);
          newState.combat.active = false;
          newState.combat.combatLog = [...newState.combat.combatLog, ...log];
          return { state: newState, log };
        }
      } else {
        log.push(`You parried the attack!`);
      }
    } else {
      log.push(`${enemy.name} missed!`);
    }
  }
  
  for (const enemy of newState.combat.enemies) {
    if (enemy.statusEffects) {
      enemy.statusEffects = enemy.statusEffects
        .map((e: any) => ({ ...e, duration: e.duration - 1 }))
        .filter((e: any) => e.duration > 0);
    }
  }
  
  newState.combat.combatLog = [...newState.combat.combatLog, ...log];
  newState.combat.playerTurn = true;
  newState.combat.turnNumber += 1;
  log.push(`--- Turn ${newState.combat.turnNumber} ---`);
  
  return { state: newState, log };
}

export function endCombat(victory: boolean, state: PlayerState): { state: PlayerState; log: string[] } {
  const newState = JSON.parse(JSON.stringify(state));
  const log: string[] = [];
  
  if (!newState.combat) {
    return { state: newState, log: [] };
  }
  
  if (victory) {
    log.push(`🎉 Victory! All enemies defeated!`);
    
    let totalGold = 0;
    let totalStatPoints = 0;
    const itemsLooted: string[] = [];
    
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
      
      if (enemyDef.loot) {
        for (const lootEntry of enemyDef.loot) {
          const chance = lootEntry.chance || 1;
          if (Math.random() <= chance) {
            const qty = Math.floor(Math.random() * (lootEntry.max - lootEntry.min + 1)) + lootEntry.min;
            if (qty > 0) {
              const existing = newState.inventory.find((i: any) => i.itemId === lootEntry.itemId);
              if (existing) {
                existing.qty += qty;
              } else {
                newState.inventory.push({ itemId: lootEntry.itemId, qty });
              }
              itemsLooted.push(`${lootEntry.itemId} x${qty}`);
            }
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
  } else {
    log.push(`💀 Defeat...`);
  }
  
  newState.combat = undefined;
  
  return { state: newState, log };
}

export function selectEnemy(enemyInstanceId: string | undefined, state: PlayerState): PlayerState {
  const newState = JSON.parse(JSON.stringify(state));
  
  if (newState.combat) {
    newState.combat.selectedEnemyId = enemyInstanceId;
  }
  
  return newState;
}
