import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { type User, type Agent, type Key } from '../types';
import { api } from '../services/mockApi';

interface AuthState {
  user: User | Agent | null;
  authKey: Key | null;
  isLoading: boolean;
  error: string | null;
  login: (keyValue: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (data: Partial<User | Agent>) => void;
  setAgentStatus: (status: 'online' | 'offline' | 'busy') => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authKey: null,
      isLoading: false,
      error: null,
      login: async (keyValue) => {
        set({ isLoading: true, error: null });
        try {
          const { user, key } = await api.login(keyValue);
          set({ user, authKey: key, isLoading: false });
        } catch (err) {
          const error = err instanceof Error ? err.message : 'An unknown error occurred';
          set({ error, isLoading: false, user: null, authKey: null });
          throw new Error(error);
        }
      },
      logout: () => {
        set({ user: null, authKey: null, isLoading: false, error: null });
      },
      updateCurrentUser: (data) => {
        set(state => ({
            user: state.user ? { ...state.user, ...data } : null
        }));
      },
      setAgentStatus: async (status) => {
        const { user } = get();
        if (user && 'status' in user) { // Type guard for Agent
            await api.setAgentStatus(user.id, status);
            set(produce((draft: AuthState) => {
                if (draft.user && 'status' in draft.user) {
                    draft.user.status = status;
                }
            }));
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);