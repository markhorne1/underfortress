export function createSeededRng(seed: number) {
  // mulberry32
  let a = seed >>> 0;
  return {
    random() {
      a += 0x6d2b79f5;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    rollDie(sides = 6) {
      return Math.floor(this.random() * sides) + 1;
    },
    roll2d6() {
      return this.rollDie(6) + this.rollDie(6);
    }
  };
}
