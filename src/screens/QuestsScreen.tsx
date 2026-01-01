import React from 'react';
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { getContentSnapshot } from '../engine/contentLoader';
import { canAcceptQuest, acceptQuest, completeQuest } from '../engine/quests';
import { useSettingsStore } from '../store/settingsStore';

export default function QuestsScreen() {
  const content = getContentSnapshot();
  const questsContent = Array.from(content.quests?.values() || []);
  const state = (usePlayerStore as any).getState();
  const playerQuests = state.quests || {};
  const setTracked = useSettingsStore(s => s.setTracked);

  const available = questsContent.filter(q => !playerQuests[q.id] || playerQuests[q.id].status !== 'active');
  const active = Object.entries(playerQuests).filter(([id, q]) => q.status === 'active').map(([id,q])=>({ id, ...q }));
  const completed = Object.entries(playerQuests).filter(([id, q]) => q.status === 'completed').map(([id,q])=>({ id, ...q }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quests</Text>
      <Text style={styles.sub}>Active</Text>
      <FlatList
        data={active}
        keyExtractor={i => i.id}
        renderItem={({ item }) => {
          const qc = content.quests.get(item.id);
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{qc.name}</Text>
              <Text>{qc.summary}</Text>
              <Text style={{fontStyle:'italic'}}>Objective: {qc.stages.find((s:any)=>s.id===item.stageId)?.objectiveText}</Text>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <Button title="Track" onPress={()=>setTracked(item.id)} />
                <View style={{ width:8 }} />
                <Button title="Abandon" onPress={() => { (usePlayerStore.getState() as any).failQuest(item.id); console.log('Abandoned'); }} />
              </View>
            </View>
          );
        }}
      />

      <Text style={styles.sub}>Available</Text>
      <FlatList
        data={available}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>{item.summary}</Text>
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              <Button title="Accept" onPress={() => {
                const can = canAcceptQuest(item.id, state);
                if (!can.ok) return console.log(`Cannot accept: ${can.reason}`);
                const res = acceptQuest(item.id, state);
                // persist state
                (usePlayerStore.getState() as any).loadState().then(()=>{});
                console.log('Accepted');
              }} />
            </View>
          </View>
        )}
      />

      <Text style={styles.sub}>Completed</Text>
      <FlatList data={completed} keyExtractor={i=>i.id} renderItem={({item})=>{
        const qc = content.quests.get(item.id);
        return <View style={styles.card}><Text style={styles.cardTitle}>{qc.name}</Text><Text>Completed</Text></View>;
      }} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, title: { fontSize: 20, fontWeight: '700' }, sub: { marginTop: 12, fontWeight: '700' }, card: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginVertical: 6 }, cardTitle: { fontWeight: '700' } });
