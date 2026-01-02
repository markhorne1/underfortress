export function getSpellCostTotal(spell: any): number {
  if (!spell || spell.cost == null) return 0;
  if (typeof spell.cost === 'number') return spell.cost;
  if (typeof spell.cost === 'object') {
    return Object.values(spell.cost).reduce((s, v) => s + (typeof v === 'number' ? v : parseFloat(String(v)) || 0), 0);
  }
  return 0;
}
