# 🔗 前端与 Cloudflare Workers 后端集成指南

## 📋 概述

现在您已经有了完整的 Cloudflare Workers 后端，需要修改前端的 `mockApi.ts` 来连接真实的 API。

## 🔄 集成步骤

### 第一步：更新 API 配置

创建新的 API 配置文件：

```typescript
// services/realApi.ts
const API_BASE_URL = 'https://your-worker-domain.workers.dev/api';
const WS_BASE_URL = 'wss://your-worker-domain.workers.dev';

class RealApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // 认证相关
  async login(keyValue: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ keyValue }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // 管理员相关
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getKeys() {
    return this.request('/admin/keys');
  }

  async createKey(data: any) {
    return this.request('/admin/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKey(id: string, data: any) {
    return this.request(`/admin/keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKey(id: string) {
    return this.request(`/admin/keys/${id}`, { method: 'DELETE' });
  }

  async getAgents() {
    return this.request('/admin/agents');
  }

  // 客服相关
  async getAgentDashboardData(agentId: string) {
    return this.request(`/agent/${agentId}/dashboard`);
  }

  async getAgentSettings(agentId: string) {
    return this.request(`/agent/${agentId}/settings`);
  }

  async updateAgentSettings(agentId: string, data: any) {
    return this.request(`/agent/${agentId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async setAgentStatus(agentId: string, status: string) {
    return this.request(`/agent/${agentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateAgentDetails(agentId: string, data: any) {
    return this.request(`/agent/${agentId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 聊天相关
  async createVisitorSession(shareId: string) {
    return this.request(`/chat/visitor/${shareId}`, { method: 'POST' });
  }

  async getVisitorSession(sessionId: string) {
    return this.request(`/chat/visitor/session/${sessionId}`);
  }

  async getSession(sessionId: string) {
    return this.request(`/chat/session/${sessionId}`);
  }

  async getMessages(sessionId: string, limit = 50, offset = 0) {
    return this.request(`/chat/session/${sessionId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(sessionId: string, senderId: string, senderType: string, content: string, type = 'text') {
    return this.request(`/chat/session/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ senderId, senderType, content, type }),
    });
  }

  // WebSocket 连接
  createWebSocketConnection(userId: string, userType: string) {
    const wsUrl = `${WS_BASE_URL}/websocket?userId=${userId}&userType=${userType}`;
    return new WebSocket(wsUrl);
  }
}

export const realApi = new RealApiService();
```

### 第二步：创建 WebSocket 管理器

```typescript
// services/websocketManager.ts
import { realApi } from './realApi';

class WebSocketManager {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private userType: string | null = null;
  private messageHandlers: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(userId: string, userType: string) {
    this.userId = userId;
    this.userType = userType;
    this.createConnection();
  }

  private createConnection() {
    if (!this.userId || !this.userType) return;

    try {
      this.ws = realApi.createWebSocketConnection(this.userId, this.userType);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit(message.type, message.data || message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected', {});
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // 指数退避
      setTimeout(() => this.createConnection(), delay);
    }
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }

  on(eventType: string, handler: Function) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: Function) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, data: any) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  // 聊天相关方法
  sendChatMessage(chatSessionId: string, messageId: string, content: string, messageType = 'text') {
    this.send('chat_message', {
      chatSessionId,
      messageId,
      content,
      messageType
    });
  }

  startTyping(chatSessionId: string) {
    this.send('typing_start', { chatSessionId });
  }

  stopTyping(chatSessionId: string) {
    this.send('typing_stop', { chatSessionId });
  }

  joinChat(chatSessionId: string) {
    this.send('join_chat', { chatSessionId });
  }

  leaveChat(chatSessionId: string) {
    this.send('leave_chat', { chatSessionId });
  }
}

export const wsManager = new WebSocketManager();
```

### 第三步：更新现有的 API 服务

修改 `services/mockApi.ts`：

```typescript
// services/mockApi.ts
import { realApi } from './realApi';
import { wsManager } from './websocketManager';

// 保留原有的接口，但实现改为调用真实 API
export const api = {
  // 直接使用真实 API
  ...realApi,
  
  // 如果需要保持兼容性，可以添加适配器方法
  async login(keyValue: string) {
    const result = await realApi.login(keyValue);
    
    // 登录成功后建立 WebSocket 连接
    if (result.user) {
      wsManager.connect(result.user.id, result.user.role.name);
    }
    
    return result;
  },

  async logout() {
    wsManager.disconnect();
    return realApi.logout();
  },

  // 其他方法保持不变或添加 WebSocket 集成
};

export default api;
```

### 第四步：更新 Zustand Stores

修改 stores 以使用 WebSocket：

```typescript
// stores/agentStore.ts (部分修改)
import { wsManager } from '../services/websocketManager';

export const useAgentStore = create<AgentState>((set, get) => ({
  // ... 现有状态

  fetchAgentData: async (agentId) => {
    set({ isLoading: true, error: null });
    try {
      const dashboardData = await api.getAgentDashboardData(agentId);
      const settings = await api.getAgentSettings(agentId);

      set({ 
        customers: dashboardData.customers, 
        sessions: dashboardData.sessions, 
        messages: dashboardData.messages, 
        settings, 
        isLoading: false,
        activeSessionId: dashboardData.sessions.length > 0 ? dashboardData.sessions[0].id : null,
      });

      // 设置 WebSocket 事件监听
      wsManager.on('new_message', (messageData) => {
        set(produce((draft: AgentState) => {
          draft.messages.push(messageData);
        }));
      });

      wsManager.on('typing_status', (typingData) => {
        // 处理打字状态
        console.log('Typing status:', typingData);
      });

    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch agent data';
      set({ error, isLoading: false });
    }
  },

  sendMessage: async (sessionId: string, senderId: string, content: string, type = 'text') => {
    const messageId = crypto.randomUUID();
    
    // 发送到后端
    const newMessage = await api.sendMessage(sessionId, senderId, 'agent', content, type);
    
    // 通过 WebSocket 广播
    wsManager.sendChatMessage(sessionId, messageId, content, type);
    
    // 更新本地状态
    set(produce((draft: AgentState) => {
      draft.messages.push(newMessage);
      const session = draft.sessions.find(s => s.id === sessionId);
      if(session) {
          session.lastMessageTime = newMessage.timestamp;
      }
    }));
  },

  // ... 其他方法
}));
```

## 🔧 配置更新

### 环境变量配置

创建 `.env.local` 文件：

```env
VITE_API_BASE_URL=https://your-worker-domain.workers.dev/api
VITE_WS_BASE_URL=wss://your-worker-domain.workers.dev
VITE_ENVIRONMENT=production
```

### 更新 API 配置

```typescript
// services/config.ts
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8787',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
};
```

## 🧪 测试集成

### 1. 本地测试
```bash
# 启动 Workers 开发服务器
npm run worker:dev

# 在另一个终端启动前端
npm run dev
```

### 2. 生产测试
```bash
# 部署后端
npm run deploy

# 更新环境变量中的域名
# 重新构建和部署前端
npm run build
```

## 🔍 调试技巧

### 查看 Workers 日志
```bash
npm run worker:tail
```

### 检查 WebSocket 连接
在浏览器开发者工具中：
1. Network 标签查看 WebSocket 连接
2. Console 查看连接日志
3. Application > Storage 查看本地数据

### API 测试
使用 Postman 或 curl 测试 API 端点：
```bash
curl -X POST https://your-worker-domain.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"keyValue":"ADMIN-SUPER-SECRET"}'
```

## ✅ 验证清单

- [ ] 后端 API 正常响应
- [ ] WebSocket 连接成功
- [ ] 用户登录功能正常
- [ ] 实时消息传递工作
- [ ] 客服状态同步
- [ ] 访客聊天功能正常
- [ ] 管理员功能可用

完成这些步骤后，您的 NexusDesk 就从演示应用转变为真正的生产级聊天系统了！🎉