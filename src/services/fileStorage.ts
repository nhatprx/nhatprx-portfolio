// Lightweight IndexedDB helper for storing user-uploaded binary files (e.g. Resume PDF)
// Prevents localStorage QuotaExceededError (~5MB limit)

const DB_NAME = 'nhatprx_portfolio_db'
const DB_VERSION = 1
const STORE_NAME = 'files'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'))
      return
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveFileToIndexedDB(key: string, file: File | Blob): Promise<string> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(file, key)
    request.onsuccess = () => {
      // Create and return an active Object URL for instant viewing / downloading
      const objectUrl = URL.createObjectURL(file)
      resolve(objectUrl)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getFileFromIndexedDB(key: string): Promise<string | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(key)
      request.onsuccess = () => {
        const result = request.result
        if (result instanceof Blob) {
          resolve(URL.createObjectURL(result))
        } else {
          resolve(null)
        }
      }
      request.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

