import React from 'react';
import { Modal, View, Text, Button, ScrollView, StyleSheet } from 'react-native';

type Choice = any;

type Props = {
  visible: boolean;
  choice?: Choice;
  onExecute: (choiceOrOption: any) => void;
  onClose: () => void;
};

export default function ChoiceDialog({ visible, choice, onExecute, onClose }: Props) {
  if (!choice) return null;
  const options = choice.options || choice.dialogOptions || [];
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView style={styles.body}>
            <Text style={styles.title}>{choice.label || choice.text || 'Choice'}</Text>
            {choice.longText && <Text style={styles.long}>{choice.longText}</Text>}
            {options.length === 0 && choice.text && <Text style={styles.long}>{choice.text}</Text>}
            {options.map((o: any, i: number) => (
              <View key={i} style={{ marginTop: 8 }}>
                <Button title={o.label || o.text || `Option ${i+1}`} onPress={() => onExecute(o)} />
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            {options.length === 0 && <Button title="Proceed" onPress={() => onExecute(choice)} />}
            <Button title="Close" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 12 },
  sheet: { backgroundColor: '#fff', padding: 12, borderRadius: 8, maxHeight: '80%' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  body: { marginBottom: 8 },
  long: { fontSize: 14, marginBottom: 6 },
  footer: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 8 }
});
