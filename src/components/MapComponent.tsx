import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';

const MAP_SIZE = 11; // 11x11 grid

export default function MapComponent() {
  const { state } = useGame();
  const { visitedMapCells } = state;

  const renderCell = (x: number, y: number) => {
    const isVisited = visitedMapCells.some(cell => cell.x === x && cell.y === y);
    const isCurrent = visitedMapCells.length > 0 && 
      visitedMapCells[visitedMapCells.length - 1].x === x && 
      visitedMapCells[visitedMapCells.length - 1].y === y;

    return (
      <View
        key={`${x}-${y}`}
        style={[
          styles.cell,
          isVisited && styles.visitedCell,
          isCurrent && styles.currentCell,
        ]}
      >
        {isCurrent && <Text style={styles.playerMarker}>@</Text>}
      </View>
    );
  };

  const renderRow = (y: number) => {
    const cells = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      cells.push(renderCell(x, y));
    }
    return (
      <View key={y} style={styles.row}>
        {cells}
      </View>
    );
  };

  const renderMap = () => {
    const rows = [];
    for (let y = 0; y < MAP_SIZE; y++) {
      rows.push(renderRow(y));
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map - Fog of War</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.scrollView}
      >
        <View style={styles.mapContainer}>
          {renderMap()}
        </View>
      </ScrollView>
      <Text style={styles.legend}>
        @ = You | ■ = Visited | □ = Unknown
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  title: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 250,
  },
  mapContainer: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitedCell: {
    backgroundColor: '#2a4a2a',
    borderColor: '#4a6a4a',
  },
  currentCell: {
    backgroundColor: '#4a4a2a',
    borderColor: '#ffd700',
    borderWidth: 2,
  },
  playerMarker: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  legend: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
