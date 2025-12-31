import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GameProvider } from './src/context/GameContext';
import GameScreen from './src/screens/GameScreen';

export default function App() {
  return (
    <GameProvider>
      <StatusBar style="light" />
      <GameScreen />
    </GameProvider>
  );
}
