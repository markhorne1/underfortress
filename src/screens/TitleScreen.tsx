import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

export default function TitleScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Underfortress</Text>
        <Text style={styles.subtitle}>A gamebook adventure</Text>
      </View>

      <TouchableOpacity
        accessibilityLabel="Next page"
        style={styles.arrow}
        onPress={() => navigation.navigate('MainMenu')}
      >
        <Text style={styles.arrowText}>⤷</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7efe0' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 42, fontWeight: '700', fontFamily: 'serif' as any },
  subtitle: { marginTop: 8, fontSize: 16, color: '#555' },
  arrow: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#222', padding: 12, borderRadius: 28 },
  arrowText: { color: 'white', fontSize: 20 }
});
