import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { executeCombatRound } from '../utils/combat';
import { Enemy } from '../types/game';

interface CombatScreenProps {
  enemy: Enemy;
  onVictory: () => void;
  onDefeat: () => void;
  onFlee?: () => void;
}

export default function CombatScreen({ enemy, onVictory, onDefeat, onFlee }: CombatScreenProps) {
  const { state, dispatch } = useGame();
  const [enemyStamina, setEnemyStamina] = useState(enemy.stamina);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [canAct, setCanAct] = useState(true);

  useEffect(() => {
    setCombatLog([`Combat begins! You face ${enemy.name}!`]);
  }, []);

  const addToLog = (message: string) => {
    setCombatLog(prev => [...prev, message]);
  };

  const handleAttack = () => {
    if (!canAct) return;
    setCanAct(false);

    const result = executeCombatRound(
      state.character.skill,
      enemy.skill,
      enemy.damage
    );

    addToLog(`\n--- Round ${roundNumber} ---`);
    addToLog(`Your attack strength: ${result.playerAttackStrength}`);
    addToLog(`Enemy attack strength: ${result.enemyAttackStrength}`);

    if (result.enemyHit) {
      addToLog(`💥 You hit ${enemy.name} for 2 damage!`);
      const newEnemyStamina = Math.max(0, enemyStamina - 2);
      setEnemyStamina(newEnemyStamina);

      if (newEnemyStamina <= 0) {
        addToLog(`\n🎉 Victory! ${enemy.name} is defeated!`);
        setTimeout(() => onVictory(), 1500);
        return;
      }
    } else if (result.playerHit) {
      addToLog(`💔 ${enemy.name} hits you for ${result.playerDamage} damage!`);
      dispatch({ type: 'MODIFY_STAMINA', payload: -result.playerDamage });

      if (state.character.stamina - result.playerDamage <= 0) {
        addToLog('\n☠️ You have been defeated...');
        setTimeout(() => onDefeat(), 1500);
        return;
      }
    } else {
      addToLog('⚔️ Both attacks miss!');
    }

    setRoundNumber(prev => prev + 1);
    setTimeout(() => setCanAct(true), 500);
  };

  const handleRangedAttack = () => {
    if (!canAct) return;
    setCanAct(false);

    addToLog(`\n--- Round ${roundNumber} ---`);
    addToLog('You attempt a ranged attack!');

    const hit = Math.random() > 0.3; // 70% chance to hit
    if (hit) {
      addToLog('🏹 Your ranged attack hits!');
      const newEnemyStamina = Math.max(0, enemyStamina - 1);
      setEnemyStamina(newEnemyStamina);

      if (newEnemyStamina <= 0) {
        addToLog(`\n🎉 Victory! ${enemy.name} is defeated!`);
        setTimeout(() => onVictory(), 1500);
        return;
      }
    } else {
      addToLog('❌ Your ranged attack misses!');
    }

    // Enemy counter-attack if ranged
    if (enemy.isRanged) {
      const enemyHit = Math.random() > 0.4;
      if (enemyHit) {
        addToLog(`💔 ${enemy.name} returns fire and hits you!`);
        dispatch({ type: 'MODIFY_STAMINA', payload: -enemy.damage });

        if (state.character.stamina - enemy.damage <= 0) {
          addToLog('\n☠️ You have been defeated...');
          setTimeout(() => onDefeat(), 1500);
          return;
        }
      }
    }

    setRoundNumber(prev => prev + 1);
    setTimeout(() => setCanAct(true), 500);
  };

  const handleFlee = () => {
    if (!enemy.canFlee) {
      Alert.alert('Cannot Flee', 'This enemy blocks your escape!');
      return;
    }

    addToLog('\n🏃 You attempt to flee...');
    const success = Math.random() > 0.5;

    if (success) {
      addToLog('✅ You successfully escape!');
      setTimeout(() => onFlee && onFlee(), 1000);
    } else {
      addToLog('❌ Failed to escape!');
      addToLog(`💔 ${enemy.name} strikes you as you retreat!`);
      dispatch({ type: 'MODIFY_STAMINA', payload: -enemy.damage });

      if (state.character.stamina - enemy.damage <= 0) {
        addToLog('\n☠️ You have been defeated...');
        setTimeout(() => onDefeat(), 1500);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️ COMBAT ⚔️</Text>

      <View style={styles.combatants}>
        <View style={styles.combatantCard}>
          <Text style={styles.combatantName}>You</Text>
          <Text style={styles.stat}>SKILL: {state.character.skill}</Text>
          <Text style={[styles.stat, { color: '#EF5350' }]}>
            STAMINA: {state.character.stamina}/{state.character.maxStamina}
          </Text>
        </View>

        <Text style={styles.vs}>VS</Text>

        <View style={styles.combatantCard}>
          <Text style={styles.combatantName}>{enemy.name}</Text>
          <Text style={styles.stat}>SKILL: {enemy.skill}</Text>
          <Text style={[styles.stat, { color: '#EF5350' }]}>
            STAMINA: {enemyStamina}/{enemy.stamina}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.logContainer} nestedScrollEnabled>
        {combatLog.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.attackButton, !canAct && styles.disabledButton]}
          onPress={handleAttack}
          disabled={!canAct}
        >
          <Text style={styles.buttonText}>⚔️ ATTACK</Text>
        </TouchableOpacity>

        {enemy.isRanged && (
          <TouchableOpacity
            style={[styles.button, styles.rangedButton, !canAct && styles.disabledButton]}
            onPress={handleRangedAttack}
            disabled={!canAct}
          >
            <Text style={styles.buttonText}>🏹 RANGED</Text>
          </TouchableOpacity>
        )}

        {enemy.canFlee && onFlee && (
          <TouchableOpacity
            style={[styles.button, styles.fleeButton]}
            onPress={handleFlee}
          >
            <Text style={styles.buttonText}>🏃 FLEE</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a0a',
    padding: 15,
  },
  title: {
    color: '#ff4444',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  combatants: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  combatantCard: {
    backgroundColor: '#2a1a1a',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#ffd700',
    minWidth: 130,
  },
  combatantName: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  stat: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 2,
  },
  vs: {
    color: '#ff4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logContainer: {
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: '#444',
  },
  logText: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  actions: {
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  attackButton: {
    backgroundColor: '#8B0000',
    borderColor: '#ff4444',
  },
  rangedButton: {
    backgroundColor: '#0a4a0a',
    borderColor: '#4CAF50',
  },
  fleeButton: {
    backgroundColor: '#4a4a0a',
    borderColor: '#FFA726',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
