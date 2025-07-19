// 新的 API 服务 - 连接真实的 Cloudflare Workers 后端
// 这个文件将替换 mockApi.ts

// 🔧 配置您的 Worker URL
const API_BASE_URL = "https://nexusdesk-api.你的用户名.workers.dev/api";

// 真实 API 服务类
class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // 🔐 认证相关
  async login(keyValue: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ keyValue }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // 👑 管理员相关
  async getDashboardData() {
    const data = await this.request('/admin/dashboard');
    return {
      keys: data.keys,
      agents: data.agents
    };
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

  // 💼 客服相关
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

  // 💬 聊天相关
  async createVisitorSession(shareId: string) {
    return this.request(`/chat/visitor/${shareId}`, { method: 'POST' });
  }

  async getVisitorSession(sessionId: string) {
    return this.request(`/chat/visitor/session/${sessionId}`);
  }

  async getSessionMessages(sessionId: string) {
    return this.request(`/chat/session/${sessionId}/messages`);
  }

  async sendMessage(sessionId: string, senderId: string, senderType: string, content: string, type = 'text') {
    return this.request(`/chat/session/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ senderId, senderType, content, type }),
    });
  }

  // 🔄 为了兼容现有代码，保留一些 mock API 的方法名
  async fetchDashboardData() {
    return this.getDashboardData();
  }

  async getMessages(sessionId: string) {
    return this.getSessionMessages(sessionId);
  }
}

// 创建 API 实例
const api = new ApiService();

export { api };
export default api;