import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { getPageById, isChoiceAvailable } from '../data/gamePages';
import { getItemById, getSpellById } from '../data/items';
import { testSkill, testLuck } from '../utils/combat';
import CharacterSheet from '../components/CharacterSheet';
import Inventory from '../components/Inventory';
import MapComponent from '../components/MapComponent';
import CombatScreen from '../components/CombatScreen';

export default function GameScreen() {
  const { state, dispatch } = useGame();
  const [showCharSheet, setShowCharSheet] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const currentPage = getPageById(state.currentPageId);

  useEffect(() => {
    if (!currentPage) return;

    // Apply page effects when entering
    if (currentPage.setFlags) {
      currentPage.setFlags.forEach(flag => {
        dispatch({ type: 'ADD_FLAG', payload: flag });
      });
    }

    if (currentPage.removeFlags) {
      currentPage.removeFlags.forEach(flag => {
        dispatch({ type: 'REMOVE_FLAG', payload: flag });
      });
    }

    if (currentPage.modifyStats) {
      const stats = currentPage.modifyStats;
      if (stats.stamina) dispatch({ type: 'MODIFY_STAMINA', payload: stats.stamina });
      if (stats.skill) dispatch({ type: 'MODIFY_SKILL', payload: stats.skill });
      if (stats.luck) dispatch({ type: 'MODIFY_LUCK', payload: stats.luck });
      if (stats.gold) dispatch({ type: 'MODIFY_GOLD', payload: stats.gold });
      if (stats.provisions) dispatch({ type: 'MODIFY_PROVISIONS', payload: stats.provisions });
    }

    if (currentPage.items) {
      currentPage.items.forEach(itemId => {
        const item = getItemById(itemId);
        if (item) {
          dispatch({ type: 'ADD_ITEM', payload: item });
          
          // Auto-learn spells
          if (item.id === 'lightning_spell') {
            const spell = getSpellById('lightning_bolt');
            if (spell) {
              dispatch({ type: 'ADD_SPELL', payload: spell });
            }
          }
        }
      });
    }

    if (currentPage.mapPosition) {
      dispatch({
        type: 'DISCOVER_MAP_CELL',
        payload: currentPage.mapPosition,
      });
    }

    // Check for game over conditions
    if (state.character.stamina <= 0) {
      Alert.alert(
        '☠️ DEFEAT ☠️',
        'Your stamina has reached zero. Your adventure ends here...',
        [{ text: 'New Game', onPress: handleNewGame }]
      );
    }

    if (currentPage.isVictory) {
      Alert.alert(
        '🎉 VICTORY! 🎉',
        'Congratulations! You have successfully completed the adventure!',
        [{ text: 'New Game', onPress: handleNewGame }]
      );
    }

    if (currentPage.isDefeat) {
      Alert.alert(
        '☠️ DEFEAT ☠️',
        'Your adventure ends in defeat...',
        [{ text: 'New Game', onPress: handleNewGame }]
      );
    }
  }, [state.currentPageId]);

  const handleChoice = (choice: any) => {
    // Check if choice is available
    if (!isChoiceAvailable(choice, state.flags, state.inventory)) {
      Alert.alert('Cannot proceed', 'You do not meet the requirements for this choice.');
      return;
    }

    // Handle skill tests
    if (choice.skillTest) {
      const success = testSkill(state.character.skill);
      if (!success) {
        Alert.alert(
          'Skill Test Failed',
          'Your attempt was unsuccessful!',
          [{ text: 'Continue', onPress: () => {} }]
        );
        return;
      } else {
        Alert.alert('Skill Test Passed', 'Your skill proves sufficient!');
      }
    }

    // Handle luck tests
    if (choice.luckTest) {
      const success = testLuck(state.character.luck);
      dispatch({ type: 'TEST_LUCK', payload: success ? 'success' : 'failure' });
      
      if (!success) {
        Alert.alert('Unlucky', 'Bad luck! Things go poorly... (Lost 1 LUCK)');
        // Could apply negative consequences here
      } else {
        Alert.alert('Lucky!', 'Fortune favors you! (Lost 1 LUCK)');
      }
    }

    // Handle combat
    if (choice.action === 'combat' && currentPage?.enemies && currentPage.enemies.length > 0) {
      dispatch({ type: 'START_COMBAT', payload: currentPage.enemies[0] });
      return;
    }

    // Navigate to next page
    dispatch({ type: 'NAVIGATE_TO_PAGE', payload: choice.targetPageId });
  };

  const handleCombatVictory = () => {
    dispatch({ type: 'END_COMBAT' });
    
    // Navigate to the combat victory page if specified
    const combatChoice = currentPage?.choices.find(c => c.action === 'combat');
    if (combatChoice) {
      dispatch({ type: 'NAVIGATE_TO_PAGE', payload: combatChoice.targetPageId });
    }
  };

  const handleCombatDefeat = () => {
    dispatch({ type: 'END_COMBAT' });
    Alert.alert(
      '☠️ DEFEAT ☠️',
      'You have been slain in combat...',
      [{ text: 'New Game', onPress: handleNewGame }]
    );
  };

  const handleCombatFlee = () => {
    dispatch({ type: 'END_COMBAT' });
    // Return to previous page or handle flee logic
    Alert.alert('Fled', 'You escaped from combat!');
  };

  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
    setShowCharSheet(false);
    setShowInventory(false);
    setShowMap(false);
  };

  const handleUseItem = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return;

    if (item.type === 'potion') {
      let healing = 0;
      if (itemId === 'healing_potion') healing = 4;
      if (itemId === 'greater_healing_potion') healing = 8;

      if (healing > 0) {
        dispatch({ type: 'RESTORE_STAMINA', payload: healing });
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
        Alert.alert('Potion Used', `Restored ${healing} STAMINA`);
      }
    }
  };

  const handleEatProvisions = () => {
    if (state.character.provisions <= 0) {
      Alert.alert('No Provisions', 'You have no provisions to eat!');
      return;
    }

    dispatch({ type: 'MODIFY_PROVISIONS', payload: -1 });
    dispatch({ type: 'RESTORE_STAMINA', payload: 4 });
    Alert.alert('Provisions Eaten', 'Restored 4 STAMINA');
  };

  if (!currentPage) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: Page not found</Text>
      </SafeAreaView>
    );
  }

  // Show combat screen if in combat
  if (state.inCombat && state.currentEnemy) {
    return (
      <SafeAreaView style={styles.container}>
        <CombatScreen
          enemy={state.currentEnemy}
          onVictory={handleCombatVictory}
          onDefeat={handleCombatDefeat}
          onFlee={handleCombatFlee}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.gameTitle}>⚔️ Under Fortress ⚔️</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowCharSheet(!showCharSheet)}
          >
            <Text style={styles.headerButtonText}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowInventory(!showInventory)}
          >
            <Text style={styles.headerButtonText}>🎒</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMap(!showMap)}
          >
            <Text style={styles.headerButtonText}>🗺️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEatProvisions}
          >
            <Text style={styles.headerButtonText}>🍖</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} nestedScrollEnabled>
        {showCharSheet && <CharacterSheet />}
        {showInventory && <Inventory onUseItem={handleUseItem} />}
        {showMap && <MapComponent />}

        <View style={styles.pageContainer}>
          <Text style={styles.pageTitle}>{currentPage.title}</Text>
          <Text style={styles.pageNumber}>#{currentPage.id}</Text>
          
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🏰 {currentPage.image || 'scene'}</Text>
          </View>

          <Text style={styles.pageText}>{currentPage.text}</Text>

          <View style={styles.choicesContainer}>
            {currentPage.choices.length > 0 ? (
              currentPage.choices.map((choice, index) => {
                const available = isChoiceAvailable(choice, state.flags, state.inventory);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.choiceButton,
                      !available && styles.choiceButtonDisabled,
                    ]}
                    onPress={() => handleChoice(choice)}
                    disabled={!available}
                  >
                    <Text style={styles.choiceText}>
                      {available ? '▶' : '🔒'} {choice.text}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.endContainer}>
                <Text style={styles.endText}>
                  {currentPage.isVictory ? '🎉 THE END - VICTORY! 🎉' : '☠️ THE END ☠️'}
                </Text>
                <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame}>
                  <Text style={styles.buttonText}>Start New Game</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#ffd700',
  },
  gameTitle: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  headerButton: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffd700',
    minWidth: 50,
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  pageContainer: {
    padding: 15,
  },
  pageTitle: {
    color: '#ffd700',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  pageNumber: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
  },
  imagePlaceholder: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 40,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffd700',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#ffd700',
    fontSize: 32,
  },
  pageText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 25,
    textAlign: 'justify',
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    backgroundColor: '#2a2a2a',
    padding: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  choiceButtonDisabled: {
    opacity: 0.4,
    borderColor: '#666',
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  endContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  endText: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  newGameButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
