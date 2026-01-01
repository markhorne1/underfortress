import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import manifest from '../../content/leonardo/generatedManifest.json';

export default function PageIllustration({ area }: any) {
  const id = area.id;
  const pageEntry = (manifest as any).pages?.[id];

  if (pageEntry && pageEntry.uri) {
    return <Image source={{ uri: pageEntry.uri }} style={styles.image} resizeMode="cover" />;
  }

  // Fallback: show prompt text so prompts are always preserved and visible in dev
  return (
    <View style={styles.fallback}>
      <Text style={styles.promptLabel}>[Art Prompt]</Text>
      <Text style={styles.promptText}>{area.imagePrompt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ image: { width: '100%', height: 200, backgroundColor: '#ccc' }, fallback: { width: '100%', height: 200, backgroundColor: '#222', padding: 12 }, promptLabel: { color: '#fff', fontWeight: '700', marginBottom: 6 }, promptText: { color: '#ddd' } });
