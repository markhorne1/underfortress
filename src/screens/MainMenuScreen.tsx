import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePlayerStore } from '../store/playerStore';

type Props = NativeStackScreenProps<any>;

export default function MainMenuScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const newGame = usePlayerStore((s) => s.newGame);
  const loadState = usePlayerStore((s) => s.loadState);
  const hasSave = usePlayerStore((s) => s.hasSave);

  const onNew = async () => {
    setLoading(true);
    try {
      await newGame();
      navigation.navigate('Game');
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally { setLoading(false); }
  };

  const onLoad = async () => {
    setLoading(true);
    try {
      await loadState();
      const state = usePlayerStore.getState();
      if (state.hasSave) {
        navigation.navigate('Game');
      } else {
        Alert.alert('No save found');
      }
    } catch (e) {
      Alert.alert('Load failed', String(e));
    } finally { setLoading(false); }
  };

  const onSettings = () => navigation.navigate('Settings');

  const onExit = () => {
    if (Platform.OS === 'web') return navigation.navigate('Title');
    BackHandler.exitApp();
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Main Menu</Text>
        <View style={styles.menu}>
          <TouchableOpacity style={styles.btn} onPress={onNew} disabled={loading}><Text style={styles.btnText}>New Game</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onLoad} disabled={loading}><Text style={styles.btnText}>Load Game</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onSettings}><Text style={styles.btnText}>Settings</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onExit}><Text style={styles.btnText}>Exit</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#efe6d8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, marginBottom: 16 },
  menu: { width: 260 },
  btn: { backgroundColor: '#222', padding: 12, marginVertical: 8, borderRadius: 8 },
  btnText: { color: 'white', textAlign: 'center', fontSize: 16 }
});
