import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { getAllAreas } from '../engine/contentLoader';

export default function MapScreen() {
  const all = getAllAreas();
  const discoveredMap = usePlayerStore(s => s.discoveredMap);
  const current = usePlayerStore(s => s.currentAreaId);

  // compute grid bounds
  const xs = all.map(a => a.x);
  const ys = all.map(a => a.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 0);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);

  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;

  const grid: any[][] = Array.from({ length: rows }).map(() => Array.from({ length: cols }).map(() => null));
  const byPos: Record<string, any> = {};
  for (const a of all) {
    byPos[`${a.x},${a.y}`] = a;
    const row = a.y - minY;
    const col = a.x - minX;
    grid[row][col] = a;
  }

  const tileColor = (tileStyle: string | undefined) => {
    switch (tileStyle) {
      case 'forest': return '#0b6623';
      case 'dungeon': return '#8a8f94';
      case 'city': return '#d6c6a8';
      case 'sewer': return '#6b8e23';
      default: return '#bdbdbd';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map</Text>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#d6c6a8' }]} /><Text>City</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#0b6623' }]} /><Text>Forest</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#8a8f94' }]} /><Text>Dungeon</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: '#6b8e23' }]} /><Text>Sewer</Text></View>
      </View>

      <View style={styles.gridContainer}>
        {grid.map((row, rIdx) => (
          <View key={rIdx} style={styles.gridRow}>
            {row.map((cell, cIdx) => {
              if (!cell) return <View key={cIdx} style={[styles.tile, { backgroundColor: '#111' }]} />;
              const discovered = !!(discoveredMap && discoveredMap[cell.id]);
              const isPlayer = current === cell.id;
              return (
                <View key={cIdx} style={[styles.tile, { backgroundColor: discovered ? tileColor(cell.tileStyle) : '#333' }]}>
                  {isPlayer ? <View style={styles.playerMarker} /> : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  gridContainer: { alignItems: 'center', justifyContent: 'center' },
  gridRow: { flexDirection: 'row' },
  tile: { width: 40, height: 40, margin: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  playerMarker: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#ffdd57' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  legendSwatch: { width: 20, height: 12, marginRight: 6 }
});
