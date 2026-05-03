import { SessionResult } from "../types";

const HISTORY_KEY = "smilezemi_history";

export function saveResult(result: SessionResult): void {
  const history = loadHistory();
  history.unshift(result);
  const trimmed = history.slice(0, 200);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function loadHistory(): SessionResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SessionResult[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}
