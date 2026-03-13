import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import manifest from '../../content/leonardo/generatedManifest.json';

function normalizeImagePath(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('file://') || trimmed.startsWith('/workspaces/')) {
    const fileName = trimmed.split('/').pop();
    return fileName ? `/content/leonardo/pages/${fileName}` : null;
  }
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('content/')) return `/${trimmed}`;
  if (trimmed.startsWith('./content/')) return `/${trimmed.replace(/^\.\//, '')}`;
  return `/content/${trimmed.replace(/^\.\//, '').replace(/^\/+/, '')}`;
}

function candidateFromManifestValue(value: any, preferMobile: boolean): string[] {
  if (!value) return [];
  if (typeof value === 'string') {
    const normalized = normalizeImagePath(value);
    return normalized ? [normalized] : [];
  }
  if (Array.isArray(value)) return value.flatMap((v) => candidateFromManifestValue(v, preferMobile));
  if (typeof value === 'object') {
    const out: string[] = [];
    const preferred = preferMobile ? [value.mobile, value.mobileUrl, value.mobilePath, value.mobileImage] : [value.desktop, value.desktopUrl, value.desktopPath, value.desktopImage];
    const alternate = preferMobile ? [value.desktop, value.desktopUrl, value.desktopPath, value.desktopImage] : [value.mobile, value.mobileUrl, value.mobilePath, value.mobileImage];
    for (const v of [...preferred, ...alternate]) {
      const normalized = normalizeImagePath(v);
      if (normalized) out.push(normalized);
    }
    const direct = [value.uri, value.url, value.path, value.file, value.filename, value.src, value.imageUrl, value.imagePath];
    for (const v of direct) {
      const normalized = normalizeImagePath(v);
      if (normalized) out.push(normalized);
    }
    if (Array.isArray(value.files)) out.push(...value.files.flatMap((f: any) => candidateFromManifestValue(f, preferMobile)));
    if (Array.isArray(value.images)) out.push(...value.images.flatMap((i: any) => candidateFromManifestValue(i, preferMobile)));
    return out;
  }
  return [];
}

function getImageCandidates(area: any, preferMobile: boolean): string[] {
  const directAreaImage = [
    area?.image,
    area?.imageUrl,
    area?.imageURI,
    area?.imagePath,
    area?.backgroundImage,
    area?.coverImage,
    area?.art,
    area?.illustration
  ]
    .map((s: any) => normalizeImagePath(s))
    .filter(Boolean) as string[];

  const entry = (manifest as any)?.pages?.[area?.id] ?? (manifest as any)?.[area?.id];
  const fromManifest = candidateFromManifestValue(entry, preferMobile);

  const localBases = [
    `/content/leonardo/pages/${area?.id}`,
    `/content/leonardo/generated/${area?.id}`,
    `/content/leonardo/${area?.id}`
  ];
  const localExts = ['.png', '.jpg', '.jpeg', '.webp'];
  const localById: string[] = [];
  for (const b of localBases) {
    for (const ext of localExts) {
      localById.push(`${b}${ext}`);
    }
  }

  return Array.from(new Set([...directAreaImage, ...fromManifest, ...localById]));
}

export default function PageIllustration({ area }: any) {
  const preferMobile = typeof window !== 'undefined' ? window.innerWidth <= 767 : false;
  const candidates = React.useMemo(() => getImageCandidates(area, preferMobile), [area, preferMobile]);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    setIdx(0);
  }, [area?.id]);

  const activeImage = candidates[idx];

  if (activeImage) {
    return (
      <Image
        source={{ uri: activeImage }}
        style={styles.image}
        resizeMode="cover"
        onError={() => {
          if (idx + 1 < candidates.length) setIdx(idx + 1);
        }}
      />
    );
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
