
export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  CUSTOMER = 'customer'
}

export interface Role {
  id: number;
  name: UserRole;
  displayName: string;
  level: number;
  color: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarUrl: string;
}

export interface Agent extends User {
  status: 'online' | 'offline' | 'busy';
  currentSessions: number;
  maxSessions: number;
  shareId: string;
}

export interface Customer {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen: string;
  ipAddress: string;
  deviceInfo: string;
  avatarUrl: string;
}

export interface Key {
  id: string;
  keyValue: string;
  type: 'admin' | 'agent';
  status: 'active' | 'suspended' | 'expired';
  createdAt: string;
  expiresAt: string | null;
  agentId: string | null;
  note: string;
}

export interface ChatSession {
  id: string;
  customerId: string;
  agentId: string;
  status: 'open' | 'closed' | 'pending';
  startTime: string;
  lastMessageTime: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'agent' | 'customer' | 'system';
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
}

export interface QuickReply {
  id: string;
  shortcut: string;
  message: string;
}

export interface WelcomeMessage {
  id: string;
  message: string;
  delaySeconds: number;
}

export interface BlacklistedUser {
  id: string;
  ipAddress: string;
  reason: string;
  timestamp: string;
}

export interface AgentSettings {
  id: string;
  agentId: string;
  autoWelcomeEnabled: boolean;
  soundNotifications: boolean;
  quickReplies: QuickReply[];
  welcomeMessages: WelcomeMessage[];
  blacklist: BlacklistedUser[];
}
