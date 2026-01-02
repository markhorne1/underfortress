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
import GamebookFrame from '../components/GamebookFrame';
import ChoiceBar from '../components/ChoiceBar';
import PageTurnArrow from '../components/PageTurnArrow';

export default function GameScreen({ navigation }: any) {
  const currentAreaId = usePlayerStore(s => s.currentAreaId);
  const moveTo = usePlayerStore(s => s.moveTo);
  const area = getAreaById(currentAreaId) ?? getAreaById('start') ?? null;
  const activeThreat = usePlayerStore(s => (s as any).activeThreat as Threat | undefined);
  const trackedId = useSettingsStore(s => s.trackedQuestId);
  const content = getContentSnapshot();
  const trackedQuest = trackedId ? content.quests?.get(trackedId) : null;
  const playerState = (usePlayerStore as any).getState();
  const trackedStage = trackedQuest && playerState.quests && playerState.quests[trackedId]?.stageId ? trackedQuest.stages.find((s:any)=>s.id===playerState.quests[trackedId].stageId) : null;
  const dangerLevel = (playerState as any).flags?.danger_level || 0;

  if (!area) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading game data...</Text>
      </View>
    );
  }

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
      <GamebookFrame
        choices={[]}
        onNextPage={async () => {
          // arrow advance rules
          if (area.continueToAreaId) {
            await moveTo(area.continueToAreaId);
            return;
          }
          const exIds = Object.values(area.exits || {});
          if (exIds.length === 1) {
            await moveTo(exIds[0]);
            return;
          }
          console.warn('No choices and no unambiguous continue path for area:', area.id);
        }}
      >
        <ScrollView>
          <PageIllustration area={area} />
          <View style={{ padding: 12 }}>
            <Text style={styles.title}>{area.title}</Text>
            <Text style={styles.desc}>{area.description}</Text>
          </View>
        </ScrollView>
      </GamebookFrame>
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
        {/* Action buttons (Search, etc.) */}
        {area.actions && Array.isArray(area.actions) && area.actions.length > 0 ? (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Actions:</Text>
            {area.actions.map((action: any, idx: number) => {
              const searchFlag = `area:${currentAreaId}:searched`;
              const alreadySearched = (playerState.flags as any)?.[searchFlag];
              
              if (alreadySearched) return null;
              
              return (
                <Button
                  key={idx}
                  title={`\ud83d\udd0d Search Area`}
                  onPress={async () => {
                    const handleAction = (usePlayerStore.getState() as any).handleAction;
                    const result = await handleAction(action.type, action);
                    setResultTitle(result.success ? 'Search Success' : 'Search Failed');
                    setResultLogs(result.log);
                    setResultRewards([]);
                    setResultVisible(true);
                  }}
                />
              );
            })}
          </View>
        ) : null}
        {/* build ordered choices: area.choices, actionsAvailable, exits */}
        {(() => {
          const ordered: any[] = [];
          if (area.choices && Array.isArray(area.choices)) ordered.push(...area.choices.map((c:any)=>({ ...c })));
          if (area.actionsAvailable) {
            for (const k of Object.keys(area.actionsAvailable)) {
              const act = area.actionsAvailable[k];
              ordered.push({ id: k, label: act.text ?? act.label ?? k, requirements: act.requirements, effects: act.effects, goToAreaId: act.goToAreaId, rawAction: act });
            }
          }
          // exits as navigation choices
          for (const [dir, aid] of Object.entries(exits)) {
            ordered.push({ id: `exit_${dir}`, label: `Go to: ${getAreaById(aid as string)?.title ?? aid}`, goToAreaId: aid });
          }

          if (ordered.length === 0) {
            // nothing to render here; bottom arrow will handle continuation
            return null;
          }

          return <ChoiceBar choices={ordered} />;
        })()}
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
