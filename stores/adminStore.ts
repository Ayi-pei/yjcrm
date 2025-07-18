
import { create } from 'zustand';
import { type Key, type Agent } from '../types';
import { api } from '../services/mockApi';

interface AdminState {
  keys: Key[];
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  createKey: (data: { type: 'admin' | 'agent', agentId?: string, note: string, expiresAt: string | null }) => Promise<void>;
  updateKey: (id: string, data: Partial<Key>) => Promise<void>;
  deleteKey: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  keys: [],
  agents: [],
  isLoading: false,
  error: null,
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [keys, agents] = await Promise.all([api.getKeys(), api.getAgents()]);
      set({ keys, agents, isLoading: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      set({ error, isLoading: false });
    }
  },
  createKey: async (data) => {
    const newKey = await api.createKey(data);
    set(state => ({ keys: [...state.keys, newKey]}));
  },
  updateKey: async (id, data) => {
    const updatedKey = await api.updateKey(id, data);
    set(state => ({
        keys: state.keys.map(k => k.id === id ? updatedKey : k)
    }));
  },
  deleteKey: async (id: string) => {
    await api.deleteKey(id);
    set(state => ({
        keys: state.keys.filter(k => k.id !== id)
    }));
  }
}));
