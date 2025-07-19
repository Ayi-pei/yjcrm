const API_BASE_URL = "https://nexusdesk-api.yfapp.workers.dev/api";
const WS_BASE_URL = "https://nexusdesk-api.yfapp.workers.dev";

class RealApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ keyValue }),
    });
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  // 管理员相关
  async getAdminDashboard() {
    return this.request("/admin/dashboard");
  }

  async getKeys() {
    return this.request("/admin/keys");
  }

  async createKey(data: any) {
    return this.request("/admin/keys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateKey(id: string, data: any) {
    return this.request(`/admin/keys/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteKey(id: string) {
    return this.request(`/admin/keys/${id}`, { method: "DELETE" });
  }

  async getAgents() {
    return this.request("/admin/agents");
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
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async setAgentStatus(agentId: string, status: string) {
    return this.request(`/agent/${agentId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async updateAgentDetails(agentId: string, data: any) {
    return this.request(`/agent/${agentId}/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 聊天相关
  async createVisitorSession(shareId: string) {
    return this.request(`/chat/visitor/${shareId}`, { method: "POST" });
  }

  async getVisitorSession(sessionId: string) {
    return this.request(`/chat/visitor/session/${sessionId}`);
  }

  async getSession(sessionId: string) {
    return this.request(`/chat/session/${sessionId}`);
  }

  async getMessages(sessionId: string, limit = 50, offset = 0) {
    return this.request(
      `/chat/session/${sessionId}/messages?limit=${limit}&offset=${offset}`
    );
  }

  async sendMessage(
    sessionId: string,
    senderId: string,
    senderType: string,
    content: string,
    type = "text"
  ) {
    return this.request(`/chat/session/${sessionId}/messages`, {
      method: "POST",
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
