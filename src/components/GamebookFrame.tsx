import React from 'react';
import { View, StyleSheet } from 'react-native';
import TopNav from './TopNav';
import ChoiceBar from './ChoiceBar';
import PageTurnArrow from './PageTurnArrow';

export default function GamebookFrame({ children, choices, onNextPage }: any) {
  const hasChoices = Array.isArray(choices) && choices.length > 0;
  return (
    <View style={styles.container}>
      <TopNav />
      <View style={styles.content}>{children}</View>
      <View style={styles.bottom}>
        {hasChoices ? <ChoiceBar choices={choices} /> : <PageTurnArrow onPress={onNextPage} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  bottom: { borderTopWidth: 1, borderColor: '#eee' }
});
