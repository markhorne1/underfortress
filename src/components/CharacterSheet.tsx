import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

export default function CharacterSheet() {
  const { state } = useGame();
  const { character } = state;

  const getStatColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage > 66) return '#4CAF50';
    if (percentage > 33) return '#FFA726';
    return '#EF5350';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Character Stats</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>SKILL:</Text>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>
            {character.skill}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>STAMINA:</Text>
          <Text style={[styles.statValue, { 
            color: getStatColor(character.stamina, character.maxStamina) 
          }]}>
            {character.stamina} / {character.maxStamina}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>LUCK:</Text>
          <Text style={[styles.statValue, { 
            color: getStatColor(character.luck, character.maxLuck) 
          }]}>
            {character.luck} / {character.maxLuck}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>GOLD:</Text>
          <Text style={[styles.statValue, { color: '#FFD700' }]}>
            {character.gold}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>PROVISIONS:</Text>
          <Text style={[styles.statValue, { color: '#8B4513' }]}>
            {character.provisions}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  title: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsContainer: {
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 5,
  },
});
