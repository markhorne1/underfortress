import React from 'react';
import { Modal, View, Text, StyleSheet, Button, ScrollView } from 'react-native';

type Props = {
  visible: boolean;
  title?: string;
  logs?: string[];
  rewards?: { type: string; id?: string; qty?: number }[];
  onClose: () => void;
};

export default function ResultModal({ visible, title, logs = [], rewards = [], onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title || 'Result'}</Text>
          <ScrollView style={styles.body}>
            {logs.map((l, i) => (
              <Text key={i} style={styles.log}>{l}</Text>
            ))}

            {rewards.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: '700' }}>Rewards</Text>
                {rewards.map((r, i) => (
                  <Text key={i}>{`${r.type}${r.id ? ` ${r.id}` : ''}${r.qty ? ` x${r.qty}` : ''}`}</Text>
                ))}
              </View>
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Button title="Close" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '60%' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  body: { marginBottom: 8 },
  log: { fontSize: 14, marginBottom: 4 },
  footer: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 8 }
});
