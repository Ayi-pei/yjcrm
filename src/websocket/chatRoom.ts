// WebSocket Durable Object 处理实时聊天
interface Env {
  DB: D1Database;
  CHAT_ROOM: DurableObjectNamespace;
  ENVIRONMENT: string;
}

export class ChatRoom {
  private state: DurableObjectState;
  private sessions: Map<string, WebSocket>;
  private userSessions: Map<string, Set<string>>; // userId -> Set of sessionIds
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.userSessions = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    // 处理 WebSocket 升级
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    return new Response('Expected WebSocket', { status: 400 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const userType = url.searchParams.get('userType'); // 'agent' | 'customer'
    
    if (!userId || !userType) {
      return new Response('Missing userId or userType', { status: 400 });
    }

    // 创建 WebSocket 连接
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // 接受 WebSocket 连接
    server.accept();

    // 生成会话ID
    const sessionId = crypto.randomUUID();
    
    // 存储连接
    this.sessions.set(sessionId, server);
    
    // 按用户分组连接
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    // 设置消息处理
    server.addEventListener('message', (event) => {
      this.handleMessage(sessionId, userId, userType, event.data);
    });

    // 设置关闭处理
    server.addEventListener('close', () => {
      this.handleClose(sessionId, userId);
    });

    // 发送连接确认
    server.send(JSON.stringify({
      type: 'connected',
      sessionId,
      userId,
      userType,
      timestamp: new Date().toISOString()
    }));

    // 通知其他用户该用户上线
    this.broadcastUserStatus(userId, userType, 'online');

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleMessage(sessionId: string, userId: string, userType: string, data: string) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'chat_message':
          await this.handleChatMessage(sessionId, userId, userType, message);
          break;
        case 'typing_start':
          this.handleTypingStatus(userId, userType, true, message.chatSessionId);
          break;
        case 'typing_stop':
          this.handleTypingStatus(userId, userType, false, message.chatSessionId);
          break;
        case 'join_chat':
          this.handleJoinChat(sessionId, userId, message.chatSessionId);
          break;
        case 'leave_chat':
          this.handleLeaveChat(sessionId, userId, message.chatSessionId);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendToSession(sessionId, {
        type: 'error',
        message: 'Invalid message format'
      });
    }
  }

  private async handleChatMessage(sessionId: string, userId: string, userType: string, message: any) {
    // 广播消息给聊天会话中的所有参与者
    const chatMessage = {
      type: 'new_message',
      data: {
        id: message.messageId,
        sessionId: message.chatSessionId,
        senderId: userId,
        senderType: userType,
        content: message.content,
        messageType: message.messageType || 'text',
        timestamp: new Date().toISOString()
      }
    };

    // 发送给聊天会话中的所有用户
    this.broadcastToChatSession(message.chatSessionId, chatMessage, userId);
  }

  private handleTypingStatus(userId: string, userType: string, isTyping: boolean, chatSessionId: string) {
    const typingMessage = {
      type: 'typing_status',
      data: {
        userId,
        userType,
        isTyping,
        chatSessionId,
        timestamp: new Date().toISOString()
      }
    };

    // 发送给聊天会话中的其他用户
    this.broadcastToChatSession(chatSessionId, typingMessage, userId);
  }

  private handleJoinChat(sessionId: string, userId: string, chatSessionId: string) {
    // 用户加入特定聊天会话
    // 这里可以实现更复杂的房间管理逻辑
    this.sendToSession(sessionId, {
      type: 'joined_chat',
      chatSessionId,
      timestamp: new Date().toISOString()
    });
  }

  private handleLeaveChat(sessionId: string, userId: string, chatSessionId: string) {
    // 用户离开特定聊天会话
    this.sendToSession(sessionId, {
      type: 'left_chat',
      chatSessionId,
      timestamp: new Date().toISOString()
    });
  }

  private handleClose(sessionId: string, userId: string) {
    // 清理连接
    this.sessions.delete(sessionId);
    
    const userSessions = this.userSessions.get(userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.userSessions.delete(userId);
        // 用户完全离线
        this.broadcastUserStatus(userId, 'unknown', 'offline');
      }
    }
  }

  private sendToSession(sessionId: string, message: any) {
    const session = this.sessions.get(sessionId);
    if (session && session.readyState === WebSocket.READY_STATE_OPEN) {
      session.send(JSON.stringify(message));
    }
  }

  private sendToUser(userId: string, message: any) {
    const userSessions = this.userSessions.get(userId);
    if (userSessions) {
      userSessions.forEach(sessionId => {
        this.sendToSession(sessionId, message);
      });
    }
  }

  private broadcastUserStatus(userId: string, userType: string, status: 'online' | 'offline') {
    const statusMessage = {
      type: 'user_status',
      data: {
        userId,
        userType,
        status,
        timestamp: new Date().toISOString()
      }
    };

    // 广播给所有连接的用户
    this.sessions.forEach((session, sessionId) => {
      this.sendToSession(sessionId, statusMessage);
    });
  }

  private broadcastToChatSession(chatSessionId: string, message: any, excludeUserId?: string) {
    // 这里需要根据 chatSessionId 找到相关的用户
    // 简化版本：广播给所有连接的用户（除了发送者）
    this.sessions.forEach((session, sessionId) => {
      // 在实际应用中，这里应该检查用户是否属于该聊天会话
      this.sendToSession(sessionId, message);
    });
  }

  // 公共方法：从外部发送消息到特定用户
  async sendMessageToUser(userId: string, message: any) {
    this.sendToUser(userId, message);
  }

  // 公共方法：广播消息给所有连接的用户
  async broadcast(message: any) {
    this.sessions.forEach((session, sessionId) => {
      this.sendToSession(sessionId, message);
    });
  }
}