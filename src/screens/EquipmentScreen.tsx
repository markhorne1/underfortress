import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayerStore } from '../store/playerStore';

export default function EquipmentScreen() {
  const equipment = usePlayerStore(s => s.equipment);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Equipment</Text>
      {Object.entries(equipment).map(([slot, itemId]) => (
        <Text key={slot}>{slot}: {itemId ?? 'empty'}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, title: { fontSize: 18, fontWeight: '700' } });
