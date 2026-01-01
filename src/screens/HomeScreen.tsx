import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { loadContent } from '../engine/contentLoader';

export default function HomeScreen({ navigation }: any) {
  const { loadState, hasSave, newGame } = usePlayerStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      await loadContent();
      await loadState();
      setReady(true);
    }
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Underfortress — Prototype</Text>
      <View style={{ height: 12 }} />
      <Button title="New Game" onPress={() => { newGame(); navigation.navigate('Game'); }} />
      <View style={{ height: 8 }} />
      <Button title="Continue" onPress={() => { navigation.navigate('Game'); }} disabled={!hasSave} />
      <View style={{ height: 16 }} />
      <Button title="Map" onPress={() => navigation.navigate('Map')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: '600' }
});
