export interface CounterState {
  count: number;
}

export function incrementCounter(currentCount: number): number {
  return currentCount + 1;
}

export function resetCounter(): number {
  return 0;
}

export function formatCount(count: number): string {
  return `count is ${count}`;
}

export function isEvenCount(count: number): boolean {
  return count % 2 === 0;
}
