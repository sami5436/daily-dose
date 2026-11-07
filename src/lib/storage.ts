import { addDays, dayKey } from "./daily";

const PREFIX = "dd:v1:";
const RESULT = `${PREFIX}result:`;

export type GameResult = {
  completed: boolean;
  score: number;
  maxScore: number;
  summary: string;
  share: string;
  finishedAt: string;
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

/** Subscribe to saves in this tab and in other tabs. Returns an unsubscribe. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(PREFIX)) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

function store(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function read<T>(key: string): T | null {
  try {
    const raw = store()?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    const s = store();
    if (!s) return false;
    s.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getResult(gameId: string, key: string): GameResult | null {
  return read<GameResult>(`${RESULT}${gameId}:${key}`);
}

export function saveResult(gameId: string, key: string, result: GameResult): void {
  if (write(`${RESULT}${gameId}:${key}`, result)) notify();
}

export function getProgress<T>(gameId: string, key: string): T | null {
  return read<T>(`${PREFIX}progress:${gameId}:${key}`);
}

export function saveProgress<T>(gameId: string, key: string, state: T): void {
  write(`${PREFIX}progress:${gameId}:${key}`, state);
}

/** Days (YYYY-MM-DD) that have at least one completed game. */
function completedDays(): Set<string> {
  const days = new Set<string>();
  try {
    const s = store();
    if (!s) return days;
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (!k || !k.startsWith(RESULT)) continue;
      const [, day] = k.slice(RESULT.length).split(":");
      if (day && read<GameResult>(k)?.completed) days.add(day);
    }
  } catch {
    // storage unavailable
  }
  return days;
}

/** Consecutive days with a completed game, ending today (or yesterday if today is empty). */
export function streak(today: string = dayKey()): number {
  const days = completedDays();
  let cursor = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function completedToday(gameIds: readonly string[], key: string = dayKey()): number {
  return gameIds.filter((id) => getResult(id, key)?.completed).length;
}
