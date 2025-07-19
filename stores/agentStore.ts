import { create } from 'zustand';
import { type Customer, type ChatSession, type ChatMessage, type AgentSettings, type Agent } from '../types';
import { api } from '../services/mockApi';
import { produce } from 'immer';


interface AgentState {
  customers: Customer[];
  sessions: ChatSession[];
  messages: ChatMessage[];
  settings: AgentSettings | null;
  isLoading: boolean;
  error: string | null;
  activeSessionId: string | null;
  
  fetchAgentData: (agentId: string) => Promise<void>;
  setActiveSessionId: (sessionId: string | null) => void;
  sendMessage: (sessionId: string, senderId: string, content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  updateSettings: (agentId: string, data: Partial<AgentSettings>) => Promise<void>;
  updateAgentDetails: (agentId: string, data: { name?: string; avatarUrl?: string }) => Promise<Agent>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  customers: [],
  sessions: [],
  messages: [],
  settings: null,
  isLoading: false,
  error: null,
  activeSessionId: null,

  fetchAgentData: async (agentId) => {
    set({ isLoading: true, error: null });
    try {
      const [dashboardData, settings] = await Promise.all([
        api.getAgentDashboardData(agentId),
        api.getAgentSettings(agentId)
      ]);

      const { customers, sessions, messages } = dashboardData;
      
      set({ 
        customers, 
        sessions, 
        messages, 
        settings, 
        isLoading: false,
        activeSessionId: sessions.length > 0 ? sessions[0].id : null,
      });

    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch agent data';
      set({ error, isLoading: false });
    }
  },

  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
  
  sendMessage: async (sessionId: string, senderId: string, content: string, type: 'text' | 'image' | 'file' = 'text') => {
    const newMessage = await api.sendMessage(sessionId, senderId, 'agent', content, type);
    set(produce((draft: AgentState) => {
      draft.messages.push(newMessage);
      const session = draft.sessions.find(s => s.id === sessionId);
      if(session) {
          session.lastMessageTime = newMessage.timestamp;
      }
    }));

    // This part simulates the automatic reply from the mock API appearing in the chat
    setTimeout(() => {
        const latestMessages = (api as any).DB.chatMessages;
        const newReplies = latestMessages.filter((msg: ChatMessage) => !get().messages.some(m => m.id === msg.id));
        if (newReplies.length > 0) {
            set(produce((draft: AgentState) => {
                draft.messages.push(...newReplies);
            }));
        }
    }, 1600);
  },

  updateSettings: async (agentId, data) => {
    const updatedSettings = await api.updateAgentSettings(agentId, data);
    set({ settings: updatedSettings });
  },

  updateAgentDetails: async (agentId, data) => {
    const updatedAgent = await api.updateAgentDetails(agentId, data);
    return updatedAgent;
  },
}));
