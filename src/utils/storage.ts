import { User, Room } from '../types';

const STORAGE_KEYS = {
  USER: 'leanCoffee_user',
  ROOM: 'leanCoffee_room',
} as const;

const SCHEMA_VERSION = 2;

interface StorageEnvelope {
  schemaVersion: number;
  data: Room;
}

// Migrate from v1 (array-based votes) to v2 (Record-based votes, setup phase)
function migrateV1ToV2(raw: Record<string, unknown>): Room {
  const room = raw as Record<string, unknown>;
  const topics = (room.topics as Record<string, unknown>[]) || [];
  return {
    ...room,
    topics: topics.map((t: Record<string, unknown>) => {
      const votes = t.votes;
      if (Array.isArray(votes)) {
        // Convert string[] of user IDs (with duplicates) to Record<string, number>
        const voteRecord: Record<string, number> = {};
        for (const userId of votes) {
          voteRecord[userId] = (voteRecord[userId] || 0) + 1;
        }
        return { ...t, votes: voteRecord };
      }
      return t;
    }),
  } as Room;
}

function migrateRoom(raw: Record<string, unknown>, fromVersion: number): Room {
  let data = raw;
  if (fromVersion < 2) {
    data = migrateV1ToV2(data) as unknown as Record<string, unknown>;
  }
  return data as Room;
}

export const storage = {
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // Handle storage errors silently
    }
  },

  getRoom: (): Room | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROOM);
      if (!stored) return null;
      const parsed = JSON.parse(stored);

      // Versioned envelope format
      if (parsed.schemaVersion) {
        if (parsed.schemaVersion === SCHEMA_VERSION) {
          return parsed.data as Room;
        }
        return migrateRoom(parsed.data, parsed.schemaVersion);
      }

      // No version field = v1 (pre-versioning)
      return migrateRoom(parsed, 1);
    } catch {
      return null;
    }
  },

  setRoom: (room: Room): void => {
    try {
      const envelope: StorageEnvelope = {
        schemaVersion: SCHEMA_VERSION,
        data: room,
      };
      localStorage.setItem(STORAGE_KEYS.ROOM, JSON.stringify(envelope));
    } catch {
      // Handle storage errors silently
    }
  },

  clearRoom: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ROOM);
    } catch {
      // Handle storage errors silently
    }
  },

  clearUser: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {
      // Handle storage errors silently
    }
  },
};
