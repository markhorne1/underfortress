import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export default function PageTurnArrow({ onPress }: any) {
  return (
    <View style={styles.container}>
      <TouchableOpacity accessibilityLabel="Next page" style={styles.btn} onPress={onPress}>
        <Text style={styles.arrow}>⤷</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-end', padding: 12 },
  btn: { backgroundColor: '#222', padding: 10, borderRadius: 28 },
  arrow: { color: 'white', fontSize: 20 }
});
