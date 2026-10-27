const ORG_ID_KEY = 'erp.orgId';
const ORG_ID_EVENT = 'erp:org-id-change';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredOrgId(): number | null {
  const raw = getStorage()?.getItem(ORG_ID_KEY);
  if (!raw) return null;

  const orgId = Number(raw);
  return Number.isInteger(orgId) && orgId > 0 ? orgId : null;
}

export function setStoredOrgId(orgId: number): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(ORG_ID_KEY, String(orgId));
  window.dispatchEvent(new Event(ORG_ID_EVENT));
}

export function clearStoredOrgId(): void {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(ORG_ID_KEY);
  window.dispatchEvent(new Event(ORG_ID_EVENT));
}

export function subscribeToOrgId(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(ORG_ID_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(ORG_ID_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
