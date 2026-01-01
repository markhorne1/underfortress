import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayerStore } from '../store/playerStore';

export default function SpellsScreen() {
  const spells = usePlayerStore(s => s.spellsKnown);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spells</Text>
      {spells.length === 0 ? <Text>No spells known</Text> : spells.map(s => <Text key={s}>{s}</Text>)}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, title: { fontSize: 18, fontWeight: '700' } });
