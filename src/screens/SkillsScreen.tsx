import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayerStore } from '../store/playerStore';

export default function SkillsScreen() {
  const stats = usePlayerStore(s => s.stats);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skills & Stats</Text>
      <Text>Skill: {stats.skill}</Text>
      <Text>Stamina: {stats.stamina}</Text>
      <Text>Luck: {stats.luck}</Text>
      <Text>Gold: {stats.gold}</Text>
      <Text>XP: {stats.xp}</Text>
      <Text>Level: {stats.level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, title: { fontSize: 18, fontWeight: '700' } });
