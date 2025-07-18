
import { UserRole, type Role, type User, type Agent, type Key, type Customer, type ChatSession, type ChatMessage, type AgentSettings } from '../types';
import { produce } from 'immer';

// --- MOCK DATABASE ---
let DB = {
  roles: [
    { id: 1, name: UserRole.ADMIN, displayName: 'Administrator', level: 10, color: 'bg-red-500' },
    { id: 2, name: UserRole.AGENT, displayName: 'Agent', level: 5, color: 'bg-sky-500' },
  ] as Role[],
  users: [
    { id: 'user-admin-01', name: 'Admin User', role: { id: 1, name: UserRole.ADMIN, displayName: 'Administrator', level: 10, color: 'bg-red-500' }, avatarUrl: 'https://picsum.photos/seed/admin/100' },
  ] as User[],
  agents: [
    { id: 'user-agent-01', name: 'Alice', role: { id: 2, name: UserRole.AGENT, displayName: 'Agent', level: 5, color: 'bg-sky-500' }, avatarUrl: 'https://picsum.photos/seed/alice/100', status: 'online', currentSessions: 1, maxSessions: 5, shareId: 'chat-with-alice' },
    { id: 'user-agent-02', name: 'Bob', role: { id: 2, name: UserRole.AGENT, displayName: 'Agent', level: 5, color: 'bg-sky-500' }, avatarUrl: 'https://picsum.photos/seed/bob/100', status: 'offline', currentSessions: 0, maxSessions: 3, shareId: 'talk-to-bob' },
  ] as Agent[],
  keys: [
    { id: 'key-01', keyValue: 'ADMIN-SUPER-SECRET', type: 'admin', status: 'active', createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(), expiresAt: null, agentId: null, note: 'Main admin key' },
    { id: 'key-02', keyValue: 'AGENT-ALICE-123', type: 'agent', status: 'active', createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(), agentId: 'user-agent-01', note: 'Key for Alice' },
    { id: 'key-03', keyValue: 'AGENT-BOB-456', type: 'agent', status: 'suspended', createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(), agentId: 'user-agent-02', note: 'Key for Bob' },
    { id: 'key-04', keyValue: 'AGENT-EXPIRED-789', type: 'agent', status: 'expired', createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(), expiresAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), agentId: null, note: 'Expired key' },
 ] as Key[],
  customers: [
      {id: 'cust-01', name: 'Curious George', isOnline: true, lastSeen: new Date().toISOString(), ipAddress: '192.168.1.101', deviceInfo: 'Chrome on Windows', avatarUrl: 'https://picsum.photos/seed/george/100'},
      {id: 'cust-02', name: 'Jane Doe', isOnline: false, lastSeen: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), ipAddress: '203.0.113.55', deviceInfo: 'Safari on iPhone', avatarUrl: 'https://picsum.photos/seed/jane/100'},
  ] as Customer[],
  chatSessions: [
      {id: 'session-01', customerId: 'cust-01', agentId: 'user-agent-01', status: 'open', startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), lastMessageTime: new Date().toISOString()},
  ] as ChatSession[],
  chatMessages: [
      {id: 'msg-01', sessionId: 'session-01', senderId: 'cust-01', senderType: 'customer', content: 'Hello, I have a question about my order.', type: 'text', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()},
      {id: 'msg-02', sessionId: 'session-01', senderId: 'user-agent-01', senderType: 'agent', content: 'Hi there! I\'d be happy to help. What\'s your order number?', type: 'text', timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString()},
      {id: 'msg-03', sessionId: 'session-01', senderId: 'cust-01', senderType: 'customer', content: 'It\'s #12345. I received the wrong item.', type: 'text', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()},
      {id: 'msg-04', sessionId: 'session-01', senderId: 'system', senderType: 'system', content: 'File "receipt.png" uploaded.', type: 'file', timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString()},

  ] as ChatMessage[],
  agentSettings: [
      { id: 'settings-01', agentId: 'user-agent-01', autoWelcomeEnabled: true, soundNotifications: true,
          quickReplies: [{id: 'qr-1', shortcut: '/thanks', message: 'You\'re welcome! Is there anything else I can help with today?'}, {id: 'qr-2', shortcut: '/np', message: 'No problem at all!'}],
          welcomeMessages: [{id: 'wm-1', message: 'Welcome to our support chat! How can I assist you?', delaySeconds: 2}],
          blacklist: [{id: 'bl-1', ipAddress: '99.99.99.99', reason: 'Spam', timestamp: new Date().toISOString()}]
      },
      { id: 'settings-02', agentId: 'user-agent-02', autoWelcomeEnabled: false, soundNotifications: true, quickReplies: [], welcomeMessages: [], blacklist: []},
  ] as AgentSettings[]
};

const networkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API FUNCTIONS ---

export const api = {
  // Auth
  async login(keyValue: string): Promise<{ user: User | Agent; key: Key }> {
    await networkDelay(500);
    const key = DB.keys.find(k => k.keyValue === keyValue);
    if (!key) throw new Error('Invalid key');
    if (key.status !== 'active') throw new Error(`Key is ${key.status}`);

    let user;
    if (key.type === 'admin') {
      user = DB.users.find(u => u.role.name === 'admin'); // Assuming one admin for simplicity
    } else {
      user = DB.agents.find(a => a.id === key.agentId);
    }
    
    if (!user) throw new Error('User not found for this key');

    return { user, key };
  },

  async getAgentByShareId(shareId: string): Promise<Agent> {
    await networkDelay(300);
    const agent = DB.agents.find(a => a.shareId === shareId);
    if (!agent) throw new Error('Agent not found');
    return agent;
  },

  // Admin: Key Management
  async getKeys(): Promise<Key[]> {
    await networkDelay(400);
    return DB.keys;
  },

  async createKey(data: { type: 'admin' | 'agent', agentId?: string, note: string, expiresAt: string | null }): Promise<Key> {
    await networkDelay(500);
    const newKey: Key = {
      id: `key-${Date.now()}`,
      keyValue: `${data.type.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      type: data.type,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
      agentId: data.agentId || null,
      note: data.note,
    };
    DB = produce(DB, draft => {
        draft.keys.push(newKey);
    });
    return newKey;
  },

  async updateKey(id: string, data: Partial<Key>): Promise<Key> {
      await networkDelay(300);
      let updatedKey: Key | undefined;
      DB = produce(DB, draft => {
          const keyIndex = draft.keys.findIndex(k => k.id === id);
          if (keyIndex !== -1) {
              draft.keys[keyIndex] = { ...draft.keys[keyIndex], ...data };
              updatedKey = draft.keys[keyIndex];
          }
      });
      if (!updatedKey) throw new Error('Key not found');
      return updatedKey;
  },

  async deleteKey(id: string): Promise<{ id: string }> {
      await networkDelay(500);
      DB = produce(DB, draft => {
          draft.keys = draft.keys.filter(k => k.id !== id);
      });
      return { id };
  },

  // Admin: Agent Management
  async getAgents(): Promise<Agent[]> {
    await networkDelay(400);
    return DB.agents;
  },
   
  async updateAgentDetails(agentId: string, data: { name?: string, avatarUrl?: string }): Promise<Agent> {
    await networkDelay(400);
    let updatedAgent: Agent | undefined;
    DB = produce(DB, draft => {
      const agentIndex = draft.agents.findIndex(a => a.id === agentId);
      if (agentIndex !== -1) {
        draft.agents[agentIndex] = { ...draft.agents[agentIndex], ...data };
        updatedAgent = draft.agents[agentIndex];
      }
    });
    if (!updatedAgent) throw new Error('Agent not found');
    return updatedAgent;
  },

  async setAgentStatus(agentId: string, status: 'online' | 'offline' | 'busy'): Promise<Agent> {
      await networkDelay(200);
      let updatedAgent: Agent | undefined;
      DB = produce(DB, draft => {
          const agentIndex = draft.agents.findIndex(a => a.id === agentId);
          if (agentIndex !== -1) {
              draft.agents[agentIndex].status = status;
              updatedAgent = draft.agents[agentIndex];
          }
      });
      if (!updatedAgent) throw new Error('Agent not found');
      return updatedAgent;
  },
  
  // Agent: Chat Data
  async getAgentDashboardData(agentId: string): Promise<{ customers: Customer[], sessions: ChatSession[], messages: ChatMessage[] }> {
    await networkDelay(600);
    const agentSessions = DB.chatSessions.filter(s => s.agentId === agentId);
    const agentSessionIds = agentSessions.map(s => s.id);
    const customers = DB.customers.filter(c => agentSessions.some(s => s.customerId === c.id));
    const messages = DB.chatMessages.filter(m => agentSessionIds.includes(m.sessionId));
    return { customers, sessions: agentSessions, messages };
  },

  async getVisitorChatData(shareId: string): Promise<{agent: Agent, customer: Customer, session: ChatSession, messages: ChatMessage[]}>{
    await networkDelay(500);
    const agent = await this.getAgentByShareId(shareId);

    // For simulation, find if a chat already exists, or create a new one for the visitor
    let session = DB.chatSessions.find(s => s.agentId === agent.id && s.status === 'pending');
    let customer, messages;

    if (session) {
      customer = DB.customers.find(c => c.id === session.customerId);
      messages = DB.chatMessages.filter(m => m.sessionId === session.id);
    } else {
      const customerId = `cust-${Date.now()}`;
      customer = {id: customerId, name: `Visitor ${Math.floor(Math.random() * 1000)}`, isOnline: true, lastSeen: new Date().toISOString(), ipAddress: '127.0.0.1', deviceInfo: 'Chrome on macOS', avatarUrl: `https://picsum.photos/seed/${customerId}/100`};
      const sessionId = `session-${Date.now()}`;
      session = {id: sessionId, customerId: customer.id, agentId: agent.id, status: 'pending', startTime: new Date().toISOString(), lastMessageTime: new Date().toISOString()};
      messages = [{
          id: `msg-${Date.now()}`,
          sessionId: sessionId,
          senderId: 'system',
          senderType: 'system',
          content: 'You are now connected to the agent.',
          type: 'text',
          timestamp: new Date().toISOString()
      }];

      DB = produce(DB, draft => {
          draft.customers.push(customer!);
          draft.chatSessions.push(session!);
          draft.chatMessages.push(...messages);
      });
    }

    if (!customer || !session) throw new Error("Could not create chat session");

    return { agent, customer, session, messages };
  },

  async sendMessage(sessionId: string, senderId: string, senderType: 'agent' | 'customer', content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<ChatMessage> {
    await networkDelay(200);
    const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sessionId,
        senderId,
        senderType,
        content,
        type,
        timestamp: new Date().toISOString()
    };
    DB = produce(DB, draft => {
        draft.chatMessages.push(newMessage);
        const session = draft.chatSessions.find(s => s.id === sessionId);
        if (session) {
            session.lastMessageTime = newMessage.timestamp;
            if (session.status === 'pending') {
              session.status = 'open';
            }
        }
    });

    // Simulate agent auto-reply for demo
    if (senderType === 'customer') {
        setTimeout(() => {
            const agentSession = DB.chatSessions.find(s => s.id === sessionId);
            if (!agentSession) return;
            const agentReply: ChatMessage = {
                id: `msg-${Date.now()}-reply`,
                sessionId,
                senderId: agentSession.agentId,
                senderType: 'agent',
                content: `I've received your message: "${content.substring(0, 30)}...". I'll get back to you shortly.`,
                type: 'text',
                timestamp: new Date().toISOString()
            };
            DB = produce(DB, draft => {
                draft.chatMessages.push(agentReply);
            });
        }, 1500);
    }
    
    return newMessage;
  },

  // Agent: Settings
  async getAgentSettings(agentId: string): Promise<AgentSettings> {
    await networkDelay(400);
    let settings = DB.agentSettings.find(s => s.agentId === agentId);
    if (!settings) {
        settings = {
            id: `settings-${agentId}`, agentId, autoWelcomeEnabled: false, soundNotifications: true,
            quickReplies: [], welcomeMessages: [], blacklist: []
        };
        DB.agentSettings.push(settings);
    }
    return settings;
  },

  async updateAgentSettings(agentId: string, data: Partial<AgentSettings>): Promise<AgentSettings> {
    await networkDelay(300);
    let updatedSettings: AgentSettings | undefined;
    DB = produce(DB, draft => {
        const settingsIndex = draft.agentSettings.findIndex(s => s.agentId === agentId);
        if (settingsIndex !== -1) {
            draft.agentSettings[settingsIndex] = { ...draft.agentSettings[settingsIndex], ...data };
            updatedSettings = draft.agentSettings[settingsIndex];
        }
    });
    if (!updatedSettings) throw new Error('Settings not found');
    return updatedSettings;
  },
  
  async uploadFile(file: File): Promise<{fileUrl: string, fileName: string}> {
      await networkDelay(1000);
      console.log('Uploading file:', file.name, file.type, file.size);
      return { fileUrl: URL.createObjectURL(file), fileName: file.name };
  }
};
