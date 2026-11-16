// "Acting as" simulator: the current agent ID lives in localStorage (no auth in v1).
import { useSyncExternalStore } from 'react';

const KEY = 'actingAgentId';
const EVENT = 'acting-as-changed';

function read() {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

function subscribe(cb) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

export function setActingAs(agentId) {
  try {
    if (agentId) localStorage.setItem(KEY, agentId);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useActingAs() {
  return useSyncExternalStore(subscribe, read, () => '');
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}
