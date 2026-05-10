// Simple local key store using localStorage for development/testing
const STORAGE_KEY = 'base44:localKeyStore';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function write(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export const KeyStore = {
  create(item) {
    const store = read();
    const now = new Date().toISOString();
    const record = {
      id: item.id || generateId(),
      name: item.name || 'Untitled',
      curve: item.curve || null,
      public_key_pem: item.public_key_pem || null,
      private_key_pem: item.private_key_pem || null,
      fingerprint: item.fingerprint || null,
      notes: item.notes || null,
      created_date: item.created_date || now,
      updated_date: item.updated_date || now,
    };
    store.push(record);
    write(store);
    return record;
  },

  list(sortKey) {
    const store = read();
    if (!sortKey) return store;
    // support '-created_date' for descending
    if (sortKey === '-created_date') {
      return store.slice().sort((a, b) => (a.created_date < b.created_date ? 1 : -1));
    }
    return store;
  },

  get(id) {
    const store = read();
    return store.find((s) => s.id === id) || null;
  },

  delete(id) {
    const store = read();
    const next = store.filter((s) => s.id !== id);
    write(next);
    return true;
  },

  clear() {
    write([]);
  }
};

export default KeyStore;
