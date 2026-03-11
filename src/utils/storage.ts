import { User, Room } from '../types';

const STORAGE_KEYS = {
  USER: 'leanCoffee_user',
  ROOM: 'leanCoffee_room',
} as const;

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
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setRoom: (room: Room): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOM, JSON.stringify(room));
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
};