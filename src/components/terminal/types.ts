export interface HistoryEntry {
  type: 'input' | 'output' | 'error' | 'system'
  text: string
}

