export const MOOD_MAX = 100;
export const MOOD_START = 55;

export function createMood(initial = MOOD_START) {
  return {
    value: Math.max(0, Math.min(MOOD_MAX, initial)),
    gain(amount) {
      this.value = Math.min(MOOD_MAX, this.value + amount);
      return this.value;
    }
  };
}
