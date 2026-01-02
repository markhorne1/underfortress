import React, { useEffect, useState } from 'react';
import { loadContent, getContentSnapshot } from '../engine/contentLoader';

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
        setSummary({ areas, items, enemies, snap });
        setLoaded(true);
      } catch (e) {
        setSummary({ error: String(e) });
      }
    }
    init();
  }, []);

  const copyToClipboard = async (str: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(str);
    } else if ((window as any).clipboardData?.setData) {
      (window as any).clipboardData.setData('Text', str);
    } else {
      console.log('Clipboard API not available');
    }
  };

  if (!loaded) return <div style={{ padding: 12 }}>Loading content...</div>;

  return (
    <div style={{ padding: 12 }}>
      <h2>Content Debug</h2>
      {summary?.error ? <div style={{ color: 'red' }}>{summary.error}</div> : null}

      <div style={{ marginTop: 12 }}>
        <strong>Areas ({summary.areas.length})</strong>
        <div>{summary.areas.slice(0, 50).map((id:string)=> <div key={id}>{id}</div>)}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Items ({summary.items.length})</strong>
        <div>{summary.items.slice(0,50).map((id:string)=> <div key={id}>{id}</div>)}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Enemies ({summary.enemies.length})</strong>
        <div>{summary.enemies.slice(0,50).map((id:string)=> <div key={id}>{id}</div>)}</div>
      </div>

      <div style={{ height: 16 }} />
      <button onClick={async ()=>{
        const snap = getContentSnapshot();
        const prompts:any = { areas: [], items: [], enemies: [], portraits: {}, leonardo_page_prompts: {}, leonardo_portrait_prompts: {} };
        for (const a of snap.areas?.values()||[]) prompts.areas.push({ id: a.id, prompt: a.imagePrompt || snap.leonardo_page_prompts?.[a.id] || null });
        for (const i of snap.items?.values()||[]) if (i.imagePrompt) prompts.items.push({ id: i.id, prompt: i.imagePrompt });
        for (const e of snap.enemies?.values()||[]) if (e.imagePrompt) prompts.enemies.push({ id: e.id, prompt: e.imagePrompt });
        prompts.leonardo_page_prompts = snap.leonardo_page_prompts || {};
        prompts.leonardo_portrait_prompts = snap.leonardo_portrait_prompts || {};
        if (!snap.leonardo_portrait_prompts) {
          for (const n of snap.npcs?.values()||[]) if (n.imagePrompt) prompts.portraits[n.id] = n.imagePrompt;
        }
        await copyToClipboard(JSON.stringify(prompts, null, 2));
        console.log('Prompts copied to clipboard');
      }} style={{ padding: 8 }}>Copy all prompts JSON</button>

      <div style={{ height: 8 }} />
      <button onClick={async ()=>{
        const snap = getContentSnapshot();
        const data = snap.leonardo_page_prompts && Object.keys(snap.leonardo_page_prompts).length ? snap.leonardo_page_prompts : Object.fromEntries(Array.from(snap.areas?.values()||[]).map((a:any)=>[a.id, a.imagePrompt || '']));
        await copyToClipboard(JSON.stringify(data, null, 2));
      }} style={{ padding: 8 }}>Copy page prompts (leonardo_page_prompts.json)</button>

      <div style={{ height: 8 }} />
      <button onClick={async ()=>{
        const snap = getContentSnapshot();
        const data = snap.leonardo_portrait_prompts && Object.keys(snap.leonardo_portrait_prompts).length ? snap.leonardo_portrait_prompts : Object.fromEntries(Array.from(snap.npcs?.values()||[]).map((n:any)=>[n.id, n.imagePrompt || '']));
        await copyToClipboard(JSON.stringify(data, null, 2));
      }} style={{ padding: 8 }}>Copy portrait prompts (leonardo_portrait_prompts.json)</button>
    </div>
  );
}
