import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getAreaById } from '../engine/contentLoader';
import { usePlayerStore } from '../store/playerStore';

interface ChoiceBarProps {
  choices: any[];
  onExecute?: (choice: any) => void;
}

export default function ChoiceBar({ choices, onExecute }: ChoiceBarProps) {
  const handleChoice = usePlayerStore(s => s.handleChoice);
  // choices is an array of choice objects already ordered by GameScreen
  return (
    <View style={styles.container}>
      {choices.map((c: any, idx: number) => (
        <TouchableOpacity key={c.id ?? idx} style={styles.button} onPress={() => {
          console.log('🔘 ChoiceBar button clicked:', c.id || c.label);
          handleChoice(c);
        }}>
          <Text style={styles.text}>{c.label || c.text || (c.goToAreaId ? `Go to: ${getAreaById(c.goToAreaId)?.title ?? c.goToAreaId}` : 'Action')}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, justifyContent: 'center' },
  button: { backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 14, margin: 6, borderRadius: 8, minWidth: 140 },
  text: { color: 'white', textAlign: 'center' }
});
