import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TopNav() {
  const nav = useNavigation();
  const { width } = useWindowDimensions();
  const compact = width < 768;

  const Item = ({ label, route }: any) => (
    <TouchableOpacity style={styles.item} onPress={() => nav.navigate(route)}>
      <Text style={styles.itemText}>{compact ? label.charAt(0) : label}</Text>
      {!compact && <Text style={styles.itemLabel}>{label}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Item label="Inventory" route="Inventory" />
      <Item label="Equipment" route="Equipment" />
      <Item label="Skills" route="Skills" />
      <Item label="Spells" route="Spells" />
      <Item label="Quests" route="Quests" />
      <Item label="Map" route="Map" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#faf6ef', borderBottomWidth: 1, borderColor: '#eee' },
  item: { alignItems: 'center' },
  itemText: { fontSize: 12, fontWeight: '700' },
  itemLabel: { fontSize: 12 }
});
