// idb.js
// Minimal, dependency-free IndexedDB wrapper for offline book storage.
// Two object stores:
//   "books"       — one record per book: metadata + (for PDFs) the blob itself
//   "book_assets" — one record per asset, keyed by `${bookId}/${path}`, used for
//                   multi-file HTML books (index.html, css, images, etc.)

const DB_NAME = 'offline-books';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const ASSETS_STORE = 'book_assets';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        const store = db.createObjectStore(BOOKS_STORE, { keyPath: 'bookId' });
        store.createIndex('downloadedAt', 'downloadedAt');
      }

      if (!db.objectStoreNames.contains(ASSETS_STORE)) {
        db.createObjectStore(ASSETS_STORE, { keyPath: 'key' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB upgrade blocked by another open tab'));
  });

  return dbPromise;
}

function tx(db, storeName, mode) {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function promisifyRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------- Books (metadata + single-blob books like PDFs) ----------

/**
 * @param {object} record
 * @param {string} record.bookId
 * @param {'pdf'|'html'} record.type
 * @param {number} record.version
 * @param {Blob} [record.blob]         - present for pdf books
 * @param {string[]} [record.assetPaths] - present for html books, relative paths of assets
 * @param {number} record.sizeBytes
 */
export async function putBook(record) {
  const db = await openDB();
  const store = tx(db, BOOKS_STORE, 'readwrite');
  return promisifyRequest(
    store.put({ ...record, downloadedAt: Date.now() })
  );
}

export async function getBook(bookId) {
  const db = await openDB();
  const store = tx(db, BOOKS_STORE, 'readonly');
  return promisifyRequest(store.get(bookId));
}

export async function getAllBooks() {
  const db = await openDB();
  const store = tx(db, BOOKS_STORE, 'readonly');
  return promisifyRequest(store.getAll());
}

export async function deleteBook(bookId) {
  const db = await openDB();

  // Delete metadata record
  const booksStore = tx(db, BOOKS_STORE, 'readwrite');
  await promisifyRequest(booksStore.delete(bookId));

  // Delete any associated assets (for html books)
  const assetsStore = tx(db, ASSETS_STORE, 'readwrite');
  const allKeys = await promisifyRequest(assetsStore.getAllKeys());
  const prefix = `${bookId}/`;
  const toDelete = allKeys.filter((k) => k.startsWith(prefix));

  const assetsStoreWrite = tx(db, ASSETS_STORE, 'readwrite');
  await Promise.all(toDelete.map((k) => promisifyRequest(assetsStoreWrite.delete(k))));
}

// ---------- Assets (multi-file HTML books) ----------

export async function putAsset(bookId, path, blob) {
  const db = await openDB();
  const store = tx(db, ASSETS_STORE, 'readwrite');
  const key = `${bookId}/${path}`;
  return promisifyRequest(store.put({ key, blob, contentType: blob.type }));
}

export async function getAsset(bookId, path) {
  const db = await openDB();
  const store = tx(db, ASSETS_STORE, 'readonly');
  const key = `${bookId}/${path}`;
  const record = await promisifyRequest(store.get(key));
  return record || null;
}

// ---------- Storage usage ----------

export async function estimateUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota, percentUsed: quota ? (usage / quota) * 100 : null };
  }
  return { usage: null, quota: null, percentUsed: null };
}

export async function requestPersistence() {
  if (navigator.storage && navigator.storage.persist) {
    return navigator.storage.persist();
  }
  return false;
}