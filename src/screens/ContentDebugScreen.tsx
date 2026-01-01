import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { loadContent, getContentSnapshot } from '../engine/contentLoader';
import * as Clipboard from 'expo-clipboard';

export default function ContentDebugScreen() {
  const [loaded, setLoaded] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        await loadContent();
        const snap = getContentSnapshot();
        const areas = Array.from(snap.areas?.keys() || []);
        const items = Array.from(snap.items?.keys() || []);
        const enemies = Array.from(snap.enemies?.keys() || []);
        setSummary({ areas, items, enemies });
        setLoaded(true);
      } catch (e) {
        setSummary({ error: String(e) });
      }
    }
    init();
  }, []);

  if (!loaded) return <View style={styles.container}><Text>Loading content...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Content Debug</Text>
      {summary.error ? <Text style={{ color: 'red' }}>{summary.error}</Text> : null}

      <Text style={styles.heading}>Areas ({summary.areas.length})</Text>
      {summary.areas.slice(0,20).map((id:string)=> <Text key={id}>{id}</Text>)}

      <Text style={styles.heading}>Items ({summary.items.length})</Text>
      {summary.items.slice(0,20).map((id:string)=> <Text key={id}>{id}</Text>)}

      <Text style={styles.heading}>Enemies ({summary.enemies.length})</Text>
      {summary.enemies.slice(0,20).map((id:string)=> <Text key={id}>{id}</Text>)}

      <View style={{ height: 16 }} />
      <Button title="Copy all prompts JSON" onPress={async ()=>{
        const snap = getContentSnapshot();
        const prompts:any = { areas: [], items: [], enemies: [], portraits: {}, leonardo_page_prompts: {}, leonardo_portrait_prompts: {} };
        // area prompts
        for (const a of snap.areas?.values()||[]) prompts.areas.push({ id: a.id, prompt: a.imagePrompt || snap.leonardo_page_prompts?.[a.id] || null });
        // item prompts
        for (const i of snap.items?.values()||[]) if (i.imagePrompt) prompts.items.push({ id: i.id, prompt: i.imagePrompt });
        // enemy prompts
        for (const e of snap.enemies?.values()||[]) if (e.imagePrompt) prompts.enemies.push({ id: e.id, prompt: e.imagePrompt });
        // portrait prompts: prefer loaded portrait prompts object else fallback to npc imagePrompt
        prompts.leonardo_page_prompts = snap.leonardo_page_prompts || {};
        prompts.leonardo_portrait_prompts = snap.leonardo_portrait_prompts || {};
        // build portrait map from npcs if not present
        if (!snap.leonardo_portrait_prompts) {
          for (const n of snap.npcs?.values()||[]) if (n.imagePrompt) prompts.portraits[n.id] = n.imagePrompt;
        }
        await Clipboard.setStringAsync(JSON.stringify(prompts, null, 2));
        console.log('Prompts copied to clipboard');
      }} />

      <View style={{ height: 8 }} />
      <Button title="Copy page prompts (leonardo_page_prompts.json)" onPress={async ()=>{
        const snap = getContentSnapshot();
        const data = snap.leonardo_page_prompts && Object.keys(snap.leonardo_page_prompts).length ? snap.leonardo_page_prompts : Object.fromEntries(Array.from(snap.areas?.values()||[]).map((a:any)=>[a.id, a.imagePrompt || '']));
        await Clipboard.setStringAsync(JSON.stringify(data, null, 2));
      }} />

      <View style={{ height: 8 }} />
      <Button title="Copy portrait prompts (leonardo_portrait_prompts.json)" onPress={async ()=>{
        const snap = getContentSnapshot();
        const data = snap.leonardo_portrait_prompts && Object.keys(snap.leonardo_portrait_prompts).length ? snap.leonardo_portrait_prompts : Object.fromEntries(Array.from(snap.npcs?.values()||[]).map((n:any)=>[n.id, n.imagePrompt || '']));
        await Clipboard.setStringAsync(JSON.stringify(data, null, 2));
      }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, title: { fontSize: 20, fontWeight: '700' }, heading: { marginTop: 12, fontWeight: '700' } });
