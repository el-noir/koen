import { openDB } from 'idb';
import { Language } from '@/types';

const DB_NAME = 'koen_offline_db';
const STORE_NAME = 'pending_records';

export interface QueuedVoiceRecord {
  id?: number;
  projectId: string;
  blob: Blob;
  language: Language;
  timestamp: string;
}

export const offlineService = {
  async init() {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      },
    });
  },

  async queueRecord(projectId: string, blob: Blob, language: Language = 'en') {
    const db = await this.init();
    await db.add(STORE_NAME, {
      projectId,
      blob,
      language,
      timestamp: new Date().toISOString(),
    } satisfies QueuedVoiceRecord);
  },

  async getQueue() {
    const db = await this.init();
    return db.getAll(STORE_NAME) as Promise<QueuedVoiceRecord[]>;
  },

  async clearItem(id: number) {
    const db = await this.init();
    await db.delete(STORE_NAME, id);
  },
};
