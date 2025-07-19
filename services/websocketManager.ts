import { realApi } from "./realApi";

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
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
        this.emit("connected", {});
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit(message.type, message.data || message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.emit("disconnected", {});
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
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
      handlers.forEach((handler) => handler(data));
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
  sendChatMessage(
    chatSessionId: string,
    messageId: string,
    content: string,
    messageType = "text"
  ) {
    this.send("chat_message", {
      chatSessionId,
      messageId,
      content,
      messageType,
    });
  }

  startTyping(chatSessionId: string) {
    this.send("typing_start", { chatSessionId });
  }

  stopTyping(chatSessionId: string) {
    this.send("typing_stop", { chatSessionId });
  }

  joinChat(chatSessionId: string) {
    this.send("join_chat", { chatSessionId });
  }

  leaveChat(chatSessionId: string) {
    this.send("leave_chat", { chatSessionId });
  }
}

export const wsManager = new WebSocketManager();
