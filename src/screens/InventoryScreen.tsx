import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayerStore } from '../store/playerStore';

export default function InventoryScreen() {
  const inventory = usePlayerStore(s => s.inventory);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      {inventory.length === 0 ? <Text>No items</Text> : inventory.map(it => (<Text key={it.itemId}>{it.itemId} x{it.qty}</Text>))}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, title: { fontSize: 18, fontWeight: '700' } });
