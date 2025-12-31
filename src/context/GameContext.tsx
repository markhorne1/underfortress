import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Character, Item, Spell, Enemy } from '../types/game';

const STORAGE_KEY = '@underfortress:gamestate';

// Initial character stats (Fighting Fantasy style)
const createInitialCharacter = (): Character => ({
  skill: 8 + Math.floor(Math.random() * 6) + 1, // 9-14
  stamina: 12 + Math.floor(Math.random() * 12) + 2, // 14-26
  maxStamina: 14,
  luck: 6 + Math.floor(Math.random() * 6) + 1, // 7-13
  maxLuck: 7,
  gold: 10,
  provisions: 10,
});

const initialState: GameState = {
  character: createInitialCharacter(),
  inventory: [],
  spells: [],
  currentPageId: 1,
  flags: [],
  visitedPages: [1],
  visitedMapCells: [{ x: 5, y: 5 }],
  inCombat: false,
  combatRound: 0,
};

type GameAction =
  | { type: 'NAVIGATE_TO_PAGE'; payload: number }
  | { type: 'ADD_FLAG'; payload: string }
  | { type: 'REMOVE_FLAG'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'ADD_SPELL'; payload: Spell }
  | { type: 'MODIFY_STAMINA'; payload: number }
  | { type: 'MODIFY_SKILL'; payload: number }
  | { type: 'MODIFY_LUCK'; payload: number }
  | { type: 'MODIFY_GOLD'; payload: number }
  | { type: 'MODIFY_PROVISIONS'; payload: number }
  | { type: 'START_COMBAT'; payload: Enemy }
  | { type: 'END_COMBAT' }
  | { type: 'DISCOVER_MAP_CELL'; payload: { x: number; y: number } }
  | { type: 'NEW_GAME' }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESTORE_STAMINA'; payload: number }
  | { type: 'TEST_LUCK'; payload: 'success' | 'failure' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAVIGATE_TO_PAGE':
      return {
        ...state,
        currentPageId: action.payload,
        visitedPages: state.visitedPages.includes(action.payload)
          ? state.visitedPages
          : [...state.visitedPages, action.payload],
      };
    
    case 'ADD_FLAG':
      return {
        ...state,
        flags: state.flags.includes(action.payload)
          ? state.flags
          : [...state.flags, action.payload],
      };
    
    case 'REMOVE_FLAG':
      return {
        ...state,
        flags: state.flags.filter(f => f !== action.payload),
      };
    
    case 'ADD_ITEM':
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload),
      };
    
    case 'ADD_SPELL':
      return {
        ...state,
        spells: [...state.spells, action.payload],
      };
    
    case 'MODIFY_STAMINA': {
      const newStamina = Math.max(0, state.character.stamina + action.payload);
      return {
        ...state,
        character: {
          ...state.character,
          stamina: Math.min(newStamina, state.character.maxStamina),
        },
      };
    }
    
    case 'MODIFY_SKILL':
      return {
        ...state,
        character: {
          ...state.character,
          skill: Math.max(0, state.character.skill + action.payload),
        },
      };
    
    case 'MODIFY_LUCK':
      return {
        ...state,
        character: {
          ...state.character,
          luck: Math.max(0, state.character.luck + action.payload),
        },
      };
    
    case 'MODIFY_GOLD':
      return {
        ...state,
        character: {
          ...state.character,
          gold: Math.max(0, state.character.gold + action.payload),
        },
      };
    
    case 'MODIFY_PROVISIONS':
      return {
        ...state,
        character: {
          ...state.character,
          provisions: Math.max(0, state.character.provisions + action.payload),
        },
      };
    
    case 'START_COMBAT':
      return {
        ...state,
        inCombat: true,
        currentEnemy: action.payload,
        combatRound: 1,
      };
    
    case 'END_COMBAT':
      return {
        ...state,
        inCombat: false,
        currentEnemy: undefined,
        combatRound: 0,
      };
    
    case 'DISCOVER_MAP_CELL': {
      const exists = state.visitedMapCells.some(
        cell => cell.x === action.payload.x && cell.y === action.payload.y
      );
      return {
        ...state,
        visitedMapCells: exists
          ? state.visitedMapCells
          : [...state.visitedMapCells, action.payload],
      };
    }
    
    case 'RESTORE_STAMINA':
      return {
        ...state,
        character: {
          ...state.character,
          stamina: Math.min(
            state.character.stamina + action.payload,
            state.character.maxStamina
          ),
        },
      };
    
    case 'TEST_LUCK':
      return {
        ...state,
        character: {
          ...state.character,
          luck: Math.max(0, state.character.luck - 1),
        },
      };
    
    case 'NEW_GAME': {
      const newChar = createInitialCharacter();
      return {
        ...initialState,
        character: {
          ...newChar,
          maxStamina: newChar.stamina,
          maxLuck: newChar.luck,
        },
      };
    }
    
    case 'LOAD_GAME':
      return action.payload;
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    character: {
      ...initialState.character,
      maxStamina: initialState.character.stamina,
      maxLuck: initialState.character.luck,
    },
  });

  const saveGame = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  const loadGame = async (): Promise<boolean> => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const loadedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_GAME', payload: loadedState });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  };

  // Auto-save on state changes
  useEffect(() => {
    saveGame();
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch, saveGame, loadGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
