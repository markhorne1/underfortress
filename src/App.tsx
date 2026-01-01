import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import MapScreen from './screens/MapScreen';
import InventoryScreen from './screens/InventoryScreen';
import SkillsScreen from './screens/SkillsScreen';
import EquipmentScreen from './screens/EquipmentScreen';
import SpellsScreen from './screens/SpellsScreen';
import ContentDebugScreen from './screens/ContentDebugScreen';
import { StatusBar } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar />
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="ContentDebug" component={ContentDebugScreen} />
        <Stack.Screen name="Quests" component={require('./screens/QuestsScreen').default} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="Skills" component={SkillsScreen} />
        <Stack.Screen name="Equipment" component={EquipmentScreen} />
        <Stack.Screen name="Spells" component={SpellsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
