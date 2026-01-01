import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { usePlayerStore } from '../store/playerStore';
import { Threat } from '../engine/threat';
import { useSettingsStore } from '../store/settingsStore';
import { getContentSnapshot } from '../engine/contentLoader';
import { executeChoice, canExecute } from '../engine/execute';
import { getAreaById } from '../engine/contentLoader';
import PageIllustration from '../components/PageIllustration';
import ResultModal from '../components/ResultModal';
import ChoiceDialog from '../components/ChoiceDialog';

export default function GameScreen({ navigation }: any) {
  const currentAreaId = usePlayerStore(s => s.currentAreaId);
  const moveTo = usePlayerStore(s => s.moveTo);
  const area = getAreaById(currentAreaId) ?? getAreaById('start')!;
  const activeThreat = usePlayerStore(s => (s as any).activeThreat as Threat | undefined);
  const trackedId = useSettingsStore(s => s.trackedQuestId);
  const content = getContentSnapshot();
  const trackedQuest = trackedId ? content.quests?.get(trackedId) : null;
  const playerState = (usePlayerStore as any).getState();
  const trackedStage = trackedQuest && playerState.quests && playerState.quests[trackedId]?.stageId ? trackedQuest.stages.find((s:any)=>s.id===playerState.quests[trackedId].stageId) : null;
  const dangerLevel = (playerState as any).flags?.danger_level || 0;

  const exits = area.exits ?? {};
  const [resultVisible, setResultVisible] = React.useState(false);
  const [resultLogs, setResultLogs] = React.useState<string[]>([]);
  const [resultTitle, setResultTitle] = React.useState<string | undefined>(undefined);
  const [resultRewards, setResultRewards] = React.useState<any[]>([]);
  const [choiceDialogVisible, setChoiceDialogVisible] = React.useState(false);
  const [activeChoice, setActiveChoice] = React.useState<any>(null);
  const choices = area.choices || [];

  return (
    <View style={styles.container}>
      <ScrollView>
        <PageIllustration area={area} />
        <View style={{ padding: 12 }}>
          <Text style={styles.title}>{area.title}</Text>
          <Text style={styles.desc}>{area.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.actionsRow}>
        <Button title="Map" onPress={() => navigation.navigate('Map')} />
        <Button title="Inventory" onPress={() => navigation.navigate('Inventory')} />
        <Button title="Skills" onPress={() => navigation.navigate('Skills')} />
        <Button title="Equip" onPress={() => navigation.navigate('Equipment')} />
        <Button title="Spells" onPress={() => navigation.navigate('Spells')} />
      </View>
      <ResultModal visible={resultVisible} title={resultTitle} logs={resultLogs} rewards={resultRewards} onClose={() => setResultVisible(false)} />

      {activeThreat ? (
        <View style={styles.threatBox}>
          <Text style={{ fontWeight: '700' }}>Enemy Approaching!</Text>
          <Text>{`Group: ${activeThreat.enemyGroupId} — distance ${activeThreat.distance}`}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 }}>
            <Button title="Shoot" onPress={async ()=>{
              const res = (usePlayerStore.getState() as any).shootActiveThreat?.(1);
              if (res && res.log) {
                setResultTitle('Shot Results');
                setResultLogs(res.log);
                setResultRewards([]);
                setResultVisible(true);
              }
            }} />
            <Button title="Spikes" onPress={async ()=>{
              const res = (usePlayerStore.getState() as any).placeHazardActive?.('spikes');
              if (res && res.log) {
                setResultTitle('Placed Spikes');
                setResultLogs(res.log);
                setResultRewards([]);
                setResultVisible(true);
              }
            }} />
            <Button title="Retreat" onPress={async ()=>{
              const res = (usePlayerStore.getState() as any).retreatFromThreat?.();
              if (res && res.log) {
                setResultTitle('Retreat');
                setResultLogs(res.log);
                setResultRewards([]);
                setResultVisible(true);
              }
            }} />
          </View>
        </View>
      ) : null}

      {dangerLevel > 0 ? (
        <View style={{ position: 'absolute', top: 44, left: 12, right: 12, backgroundColor: '#fff6e6', padding: 8, borderRadius: 6, borderWidth:1, borderColor:'#f5c06b' }}>
          <Text style={{ fontWeight: '700' }}>Warning</Text>
          <Text>{`Danger level: ${dangerLevel}. Breachers are active — resolve the hunt quickly.`}</Text>
        </View>
      ) : null}

      {trackedQuest ? (
        <View style={styles.trackedChip}>
          <Text style={{ fontWeight: '700' }}>{trackedQuest.name}</Text>
          <Text>{trackedStage ? trackedStage.objectiveText : trackedQuest.summary}</Text>
        </View>
      ) : null}

      <View style={{ padding: 12 }}>
        {choices.map((c: any, idx: number) => {
          const can = canExecute(c.requirements, playerState as any);
          return (
            <View key={c.id ?? idx} style={{ marginBottom: 6 }}>
              <Button title={c.label || c.text || 'Action'} disabled={!can.ok} onPress={async () => {
                if (c.longText || c.options || c.dialogOptions) {
                  setActiveChoice(c);
                  setChoiceDialogVisible(true);
                  return;
                }
                const res = executeChoice(c, (usePlayerStore as any).getState());
                // apply returned state patch into store
                if (res && res.state) {
                  (usePlayerStore as any).setState(res.state);
                }
                // show result logs
                if (res && res.log && res.log.length > 0) {
                  setResultTitle('Choice Result');
                  setResultLogs(res.log);
                  // detect simple rewards from log (grantGold/grantXP/addItem)
                  const rewards: any[] = [];
                  res.log.forEach((l: string) => {
                    if (l.startsWith('grantGold')) rewards.push({ type: 'gold', qty: Number(l.split(' ')[1]) });
                    if (l.startsWith('grantXP')) rewards.push({ type: 'xp', qty: Number(l.split(' ')[1]) });
                    if (l.startsWith('addItem')) {
                      const parts = l.split(' ');
                      rewards.push({ type: 'item', id: parts[1], qty: Number((parts[2] || 'x1').replace('x','')) });
                    }
                  });
                  setResultRewards(rewards);
                  setResultVisible(true);
                }
                // if choice requests navigation, call moveTo after applying effects
                if (res && res.goToAreaId) {
                  moveTo(res.goToAreaId);
                }
              }} />
              {!can.ok && <Text style={{ fontSize: 12, color: '#888' }}>{can.reason}</Text>}
            </View>
          );
        })}
        <ChoiceDialog visible={choiceDialogVisible} choice={activeChoice} onClose={() => { setChoiceDialogVisible(false); setActiveChoice(null); }} onExecute={(opt) => {
          // opt may be the choice itself or a nested option; execute it then close dialog
          setChoiceDialogVisible(false);
          const toExec = opt || activeChoice;
          if (!toExec) return;
          const res = executeChoice(toExec, (usePlayerStore as any).getState());
          if (res && res.state) (usePlayerStore as any).setState(res.state);
          if (res && res.log) {
            setResultTitle('Choice Result');
            setResultLogs(res.log);
            const rewards: any[] = [];
            res.log.forEach((l: string) => {
              if (l.startsWith('grantGold')) rewards.push({ type: 'gold', qty: Number(l.split(' ')[1]) });
              if (l.startsWith('grantXP')) rewards.push({ type: 'xp', qty: Number(l.split(' ')[1]) });
              if (l.startsWith('addItem')) {
                const parts = l.split(' ');
                rewards.push({ type: 'item', id: parts[1], qty: Number((parts[2] || 'x1').replace('x','')) });
              }
            });
            setResultRewards(rewards);
            setResultVisible(true);
          }
          if (res && res.goToAreaId) moveTo(res.goToAreaId);
        }} />
      </View>

      <View style={styles.moveRow}>
        <Button title="N" disabled={!exits.n} onPress={() => moveTo(exits.n)} />
        <Button title="S" disabled={!exits.s} onPress={() => moveTo(exits.s)} />
        <Button title="W" disabled={!exits.w} onPress={() => moveTo(exits.w)} />
        <Button title="E" disabled={!exits.e} onPress={() => moveTo(exits.e)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  desc: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 8, borderTopWidth: 1, borderColor: '#ddd' },
  moveRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 8 }
  , trackedChip: { position: 'absolute', bottom: 120, left: 12, right: 12, backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth:1, borderColor:'#ddd' },
  threatBox: { position: 'absolute', bottom: 12, left: 12, right: 12, backgroundColor: '#fee', padding: 8, borderRadius: 8, borderWidth:1, borderColor:'#f88' }
});
