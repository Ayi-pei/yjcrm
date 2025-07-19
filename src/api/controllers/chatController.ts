// 聊天控制器
import type { Env } from '../../worker';
import { generateId, getClientIP, getUserAgent, parseDeviceInfo, successResponse, errorResponse } from '../utils/helpers';

export class ChatController {
  // 创建访客会话
  static async createVisitorSession(request: Request, env: Env, shareId: string): Promise<Response> {
    try {
      // 查找对应的客服
      const agent = await env.DB.prepare(`
        SELECT a.*, u.name as agent_name, u.avatar_url as agent_avatar
        FROM agents a
        JOIN users u ON a.user_id = u.id
        WHERE a.share_id = ? AND a.status != 'offline'
      `).bind(shareId).first();

      if (!agent) {
        return errorResponse('Agent not available', 404);
      }

      // 获取访客信息
      const clientIP = getClientIP(request);
      const userAgent = getUserAgent(request);
      const deviceInfo = parseDeviceInfo(userAgent);

      // 创建访客用户
      const customerId = generateId();
      const customerUserId = generateId();
      const customerName = `Visitor ${customerId.slice(0, 8)}`;
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random`;

      // 插入访客用户
      await env.DB.prepare(`
        INSERT INTO users (id, name, role_id, avatar_url)
        VALUES (?, ?, 3, ?)
      `).bind(customerUserId, customerName, avatarUrl).run();

      // 插入访客详细信息
      await env.DB.prepare(`
        INSERT INTO customers (id, user_id, is_online, ip_address, device_info)
        VALUES (?, ?, TRUE, ?, ?)
      `).bind(customerId, customerUserId, clientIP, deviceInfo).run();

      // 创建聊天会话
      const sessionId = generateId();
      await env.DB.prepare(`
        INSERT INTO chat_sessions (id, customer_id, agent_id, status)
        VALUES (?, ?, ?, 'pending')
      `).bind(sessionId, customerId, agent.id).run();

      // 发送系统欢迎消息
      const welcomeMessageId = generateId();
      await env.DB.prepare(`
        INSERT INTO chat_messages (id, session_id, sender_id, sender_type, content, type)
        VALUES (?, ?, ?, 'system', 'Welcome! You are now connected to our support team.', 'text')
      `).bind(welcomeMessageId, sessionId, customerUserId).run();

      // 更新客服当前会话数
      await env.DB.prepare(`
        UPDATE agents SET current_sessions = current_sessions + 1 WHERE id = ?
      `).bind(agent.id).run();

      return successResponse({
        sessionId,
        customerId,
        agentName: agent.agent_name,
        agentAvatar: agent.agent_avatar,
        status: 'connected'
      });

    } catch (error) {
      console.error('Create visitor session error:', error);
      return errorResponse('Failed to create session', 500);
    }
  }

  // 获取访客会话信息
  static async getVisitorSession(request: Request, env: Env, sessionId: string): Promise<Response> {
    try {
      const session = await env.DB.prepare(`
        SELECT cs.*, 
               cu.name as customer_name, cu.avatar_url as customer_avatar,
               au.name as agent_name, au.avatar_url as agent_avatar,
               a.status as agent_status
        FROM chat_sessions cs
        JOIN customers c ON cs.customer_id = c.id
        JOIN users cu ON c.user_id = cu.id
        JOIN agents a ON cs.agent_id = a.id
        JOIN users au ON a.user_id = au.id
        WHERE cs.id = ?
      `).bind(sessionId).first();

      if (!session) {
        return errorResponse('Session not found', 404);
      }

      return successResponse({
        id: session.id,
        status: session.status,
        customer: {
          id: session.customer_id,
          name: session.customer_name,
          avatarUrl: session.customer_avatar
        },
        agent: {
          id: session.agent_id,
          name: session.agent_name,
          avatarUrl: session.agent_avatar,
          status: session.agent_status
        },
        startTime: session.start_time,
        lastMessageTime: session.last_message_time
      });

    } catch (error) {
      console.error('Get visitor session error:', error);
      return errorResponse('Failed to get session', 500);
    }
  }

  // 获取会话消息
  static async getMessages(request: Request, env: Env, sessionId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const messages = await env.DB.prepare(`
        SELECT cm.*, u.name as sender_name, u.avatar_url as sender_avatar
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.id
        WHERE cm.session_id = ?
        ORDER BY cm.timestamp ASC
        LIMIT ? OFFSET ?
      `).bind(sessionId, limit, offset).all();

      const formattedMessages = messages.results.map((msg: any) => ({
        id: msg.id,
        sessionId: msg.session_id,
        senderId: msg.sender_id,
        senderType: msg.sender_type,
        senderName: msg.sender_name,
        senderAvatar: msg.sender_avatar,
        content: msg.content,
        type: msg.type,
        timestamp: msg.timestamp
      }));

      return successResponse(formattedMessages);

    } catch (error) {
      console.error('Get messages error:', error);
      return errorResponse('Failed to get messages', 500);
    }
  }

  // 发送消息
  static async sendMessage(request: Request, env: Env, sessionId: string): Promise<Response> {
    try {
      const { senderId, senderType, content, type = 'text' } = await request.json();

      if (!senderId || !senderType || !content) {
        return errorResponse('Missing required fields', 400);
      }

      // 验证会话存在
      const session = await env.DB.prepare(`
        SELECT id FROM chat_sessions WHERE id = ?
      `).bind(sessionId).first();

      if (!session) {
        return errorResponse('Session not found', 404);
      }

      // 插入消息
      const messageId = generateId();
      await env.DB.prepare(`
        INSERT INTO chat_messages (id, session_id, sender_id, sender_type, content, type)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(messageId, sessionId, senderId, senderType, content, type).run();

      // 更新会话最后消息时间
      await env.DB.prepare(`
        UPDATE chat_sessions SET last_message_time = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(sessionId).run();

      // 获取完整消息信息
      const message = await env.DB.prepare(`
        SELECT cm.*, u.name as sender_name, u.avatar_url as sender_avatar
        FROM chat_messages cm
        JOIN users u ON cm.sender_id = u.id
        WHERE cm.id = ?
      `).bind(messageId).first();

      const formattedMessage = {
        id: message.id,
        sessionId: message.session_id,
        senderId: message.sender_id,
        senderType: message.sender_type,
        senderName: message.sender_name,
        senderAvatar: message.sender_avatar,
        content: message.content,
        type: message.type,
        timestamp: message.timestamp
      };

      // TODO: 通过 WebSocket 广播消息给相关用户

      return successResponse(formattedMessage, 201);

    } catch (error) {
      console.error('Send message error:', error);
      return errorResponse('Failed to send message', 500);
    }
  }

  // 获取会话详情
  static async getSession(request: Request, env: Env, sessionId: string): Promise<Response> {
    try {
      const session = await env.DB.prepare(`
        SELECT cs.*,
               c.is_online as customer_online, c.ip_address, c.device_info,
               cu.name as customer_name, cu.avatar_url as customer_avatar,
               au.name as agent_name, au.avatar_url as agent_avatar,
               a.status as agent_status
        FROM chat_sessions cs
        JOIN customers c ON cs.customer_id = c.id
        JOIN users cu ON c.user_id = cu.id
        JOIN agents a ON cs.agent_id = a.id
        JOIN users au ON a.user_id = au.id
        WHERE cs.id = ?
      `).bind(sessionId).first();

      if (!session) {
        return errorResponse('Session not found', 404);
      }

      return successResponse({
        id: session.id,
        status: session.status,
        startTime: session.start_time,
        lastMessageTime: session.last_message_time,
        customer: {
          id: session.customer_id,
          name: session.customer_name,
          avatarUrl: session.customer_avatar,
          isOnline: session.customer_online,
          ipAddress: session.ip_address,
          deviceInfo: session.device_info
        },
        agent: {
          id: session.agent_id,
          name: session.agent_name,
          avatarUrl: session.agent_avatar,
          status: session.agent_status
        }
      });

    } catch (error) {
      console.error('Get session error:', error);
      return errorResponse('Failed to get session', 500);
    }
  }
}