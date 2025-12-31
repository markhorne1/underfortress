import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGame } from '../context/GameContext';

interface InventoryProps {
  onUseItem?: (itemId: string) => void;
}

export default function Inventory({ onUseItem }: InventoryProps) {
  const { state } = useGame();
  const { inventory, spells } = state;

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'weapon': return '#EF5350';
      case 'armor': return '#42A5F5';
      case 'potion': return '#66BB6A';
      case 'key': return '#FFD700';
      case 'treasure': return '#AB47BC';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>
      
      <ScrollView style={styles.scrollView} nestedScrollEnabled>
        {inventory.length === 0 ? (
          <Text style={styles.emptyText}>No items</Text>
        ) : (
          inventory.map((item, index) => (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              style={styles.itemCard}
              onPress={() => onUseItem && onUseItem(item.id)}
              disabled={!onUseItem || item.type === 'key'}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={[styles.typeBadge, { backgroundColor: getItemTypeColor(item.type) }]}>
                  <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.itemDescription}>{item.description}</Text>
              {item.effect && (
                <Text style={styles.itemEffect}>Effect: {item.effect}</Text>
              )}
            </TouchableOpacity>
          ))
        )}

        {spells.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Spells</Text>
            {spells.map((spell, index) => (
              <View key={`${spell.id}-${index}`} style={styles.spellCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{spell.name}</Text>
                  <Text style={styles.spellCost}>Cost: {spell.cost} STAMINA</Text>
                </View>
                <Text style={styles.itemDescription}>{spell.description}</Text>
                <Text style={styles.itemEffect}>Effect: {spell.effect}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    maxHeight: 300,
  },
  title: {
    color: '#ffd700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#AB47BC',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  scrollView: {
    maxHeight: 250,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  itemCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  spellCard: {
    backgroundColor: '#2a1a3a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#AB47BC',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  spellCost: {
    color: '#AB47BC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDescription: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 4,
  },
  itemEffect: {
    color: '#4CAF50',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
