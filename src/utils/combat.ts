// Combat and dice utilities for Fighting Fantasy style gameplay

export function rollDice(numDice: number = 1): number {
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * 6) + 1;
  }
  return total;
}

export function rollD6(): number {
  return rollDice(1);
}

export function roll2D6(): number {
  return rollDice(2);
}

// Test SKILL - roll 2d6, if result <= SKILL, test passes
export function testSkill(skillValue: number): boolean {
  const roll = roll2D6();
  return roll <= skillValue;
}

// Test LUCK - roll 2d6, if result <= LUCK, test passes
export function testLuck(luckValue: number): boolean {
  const roll = roll2D6();
  return roll <= luckValue;
}

// Calculate attack strength for combat
export function calculateAttackStrength(skill: number): number {
  return skill + roll2D6();
}

// Combat round - returns damage dealt to player (0 if player wins)
export function resolveCombatRound(
  playerSkill: number,
  enemySkill: number
): { playerWins: boolean; playerAttackStrength: number; enemyAttackStrength: number } {
  const playerAttackStrength = calculateAttackStrength(playerSkill);
  const enemyAttackStrength = calculateAttackStrength(enemySkill);

  return {
    playerWins: playerAttackStrength > enemyAttackStrength,
    playerAttackStrength,
    enemyAttackStrength,
  };
}

export interface CombatResult {
  playerHit: boolean;
  enemyHit: boolean;
  playerDamage: number;
  enemyDamage: number;
  playerAttackStrength: number;
  enemyAttackStrength: number;
}

export function executeCombatRound(
  playerSkill: number,
  enemySkill: number,
  enemyDamage: number = 2
): CombatResult {
  const playerAttackStrength = calculateAttackStrength(playerSkill);
  const enemyAttackStrength = calculateAttackStrength(enemySkill);

  if (playerAttackStrength > enemyAttackStrength) {
    // Player hits enemy
    return {
      playerHit: false,
      enemyHit: true,
      playerDamage: 0,
      enemyDamage: 2, // Standard damage
      playerAttackStrength,
      enemyAttackStrength,
    };
  } else if (enemyAttackStrength > playerAttackStrength) {
    // Enemy hits player
    return {
      playerHit: true,
      enemyHit: false,
      playerDamage: enemyDamage,
      enemyDamage: 0,
      playerAttackStrength,
      enemyAttackStrength,
    };
  } else {
    // Tie - no damage
    return {
      playerHit: false,
      enemyHit: false,
      playerDamage: 0,
      enemyDamage: 0,
      playerAttackStrength,
      enemyAttackStrength,
    };
  }
}
