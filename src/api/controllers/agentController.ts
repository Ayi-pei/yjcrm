// 客服控制器
import type { Env } from '../../worker';
import { generateId, successResponse, errorResponse } from '../utils/helpers';

export class AgentController {
  // 获取客服仪表盘数据
  static async getDashboard(request: Request, env: Env, agentId: string): Promise<Response> {
    try {
      // 获取客服的所有会话
      const sessions = await env.DB.prepare(`
        SELECT cs.*, 
               c.is_online as customer_online, c.last_seen,
               cu.name as customer_name, cu.avatar_url as customer_avatar,
               c.ip_address, c.device_info
        FROM chat_sessions cs
        JOIN customers c ON cs.customer_id = c.id
        JOIN users cu ON c.user_id = cu.id
        WHERE cs.agent_id = ? AND cs.status IN ('open', 'pending')
        ORDER BY cs.last_message_time DESC
      `).bind(agentId).all();

      // 获取所有相关的客户信息
      const customers = sessions.results.map((session: any) => ({
        id: session.customer_id,
        name: session.customer_name,
        isOnline: session.customer_online,
        lastSeen: session.last_seen,
        ipAddress: session.ip_address,
        deviceInfo: session.device_info,
        avatarUrl: session.customer_avatar
      }));

      // 获取所有相关的消息
      const sessionIds = sessions.results.map((s: any) => s.id);
      let messages: any[] = [];
      
      if (sessionIds.length > 0) {
        const placeholders = sessionIds.map(() => '?').join(',');
        const messagesResult = await env.DB.prepare(`
          SELECT cm.*, u.name as sender_name, u.avatar_url as sender_avatar
          FROM chat_messages cm
          JOIN users u ON cm.sender_id = u.id
          WHERE cm.session_id IN (${placeholders})
          ORDER BY cm.timestamp DESC
          LIMIT 100
        `).bind(...sessionIds).all();

        messages = messagesResult.results.map((msg: any) => ({
          id: msg.id,
          sessionId: msg.session_id,
          senderId: msg.sender_id,
          senderType: msg.sender_type,
          content: msg.content,
          type: msg.type,
          timestamp: msg.timestamp
        }));
      }

      // 格式化会话数据
      const formattedSessions = sessions.results.map((session: any) => ({
        id: session.id,
        customerId: session.customer_id,
        agentId: session.agent_id,
        status: session.status,
        startTime: session.start_time,
        lastMessageTime: session.last_message_time
      }));

      return successResponse({
        sessions: formattedSessions,
        customers,
        messages
      });

    } catch (error) {
      console.error('Get agent dashboard error:', error);
      return errorResponse('Failed to get dashboard data', 500);
    }
  }

  // 获取客服设置
  static async getSettings(request: Request, env: Env, agentId: string): Promise<Response> {
    try {
      // 获取基本设置
      const settings = await env.DB.prepare(`
        SELECT * FROM agent_settings WHERE agent_id = ?
      `).bind(agentId).first();

      if (!settings) {
        // 如果没有设置，创建默认设置
        const settingsId = generateId();
        await env.DB.prepare(`
          INSERT INTO agent_settings (id, agent_id, auto_welcome_enabled, sound_notifications)
          VALUES (?, ?, TRUE, TRUE)
        `).bind(settingsId, agentId).run();

        return successResponse({
          id: settingsId,
          agentId,
          autoWelcomeEnabled: true,
          soundNotifications: true,
          quickReplies: [],
          welcomeMessages: [],
          blacklist: []
        });
      }

      // 获取快捷回复
      const quickReplies = await env.DB.prepare(`
        SELECT * FROM quick_replies WHERE agent_id = ? ORDER BY created_at
      `).bind(agentId).all();

      // 获取欢迎消息
      const welcomeMessages = await env.DB.prepare(`
        SELECT * FROM welcome_messages WHERE agent_id = ? ORDER BY delay_seconds
      `).bind(agentId).all();

      // 获取黑名单
      const blacklist = await env.DB.prepare(`
        SELECT * FROM blacklisted_users WHERE agent_id = ? ORDER BY timestamp DESC
      `).bind(agentId).all();

      return successResponse({
        id: settings.id,
        agentId: settings.agent_id,
        autoWelcomeEnabled: settings.auto_welcome_enabled,
        soundNotifications: settings.sound_notifications,
        quickReplies: quickReplies.results.map((qr: any) => ({
          id: qr.id,
          shortcut: qr.shortcut,
          message: qr.message
        })),
        welcomeMessages: welcomeMessages.results.map((wm: any) => ({
          id: wm.id,
          message: wm.message,
          delaySeconds: wm.delay_seconds
        })),
        blacklist: blacklist.results.map((bl: any) => ({
          id: bl.id,
          ipAddress: bl.ip_address,
          reason: bl.reason,
          timestamp: bl.timestamp
        }))
      });

    } catch (error) {
      console.error('Get agent settings error:', error);
      return errorResponse('Failed to get settings', 500);
    }
  }

  // 更新客服设置
  static async updateSettings(request: Request, env: Env, agentId: string): Promise<Response> {
    try {
      const data = await request.json();

      // 更新基本设置
      if (data.autoWelcomeEnabled !== undefined || data.soundNotifications !== undefined) {
        await env.DB.prepare(`
          UPDATE agent_settings 
          SET auto_welcome_enabled = COALESCE(?, auto_welcome_enabled),
              sound_notifications = COALESCE(?, sound_notifications),
              updated_at = CURRENT_TIMESTAMP
          WHERE agent_id = ?
        `).bind(
          data.autoWelcomeEnabled,
          data.soundNotifications,
          agentId
        ).run();
      }

      // 更新快捷回复
      if (data.quickReplies) {
        // 删除现有的快捷回复
        await env.DB.prepare(`DELETE FROM quick_replies WHERE agent_id = ?`).bind(agentId).run();
        
        // 插入新的快捷回复
        for (const qr of data.quickReplies) {
          await env.DB.prepare(`
            INSERT INTO quick_replies (id, agent_id, shortcut, message)
            VALUES (?, ?, ?, ?)
          `).bind(generateId(), agentId, qr.shortcut, qr.message).run();
        }
      }

      // 更新欢迎消息
      if (data.welcomeMessages) {
        // 删除现有的欢迎消息
        await env.DB.prepare(`DELETE FROM welcome_messages WHERE agent_id = ?`).bind(agentId).run();
        
        // 插入新的欢迎消息
        for (const wm of data.welcomeMessages) {
          await env.DB.prepare(`
            INSERT INTO welcome_messages (id, agent_id, message, delay_seconds)
            VALUES (?, ?, ?, ?)
          `).bind(generateId(), agentId, wm.message, wm.delaySeconds).run();
        }
      }

      // 更新黑名单
      if (data.blacklist) {
        // 删除现有的黑名单
        await env.DB.prepare(`DELETE FROM blacklisted_users WHERE agent_id = ?`).bind(agentId).run();
        
        // 插入新的黑名单
        for (const bl of data.blacklist) {
          await env.DB.prepare(`
            INSERT INTO blacklisted_users (id, agent_id, ip_address, reason)
            VALUES (?, ?, ?, ?)
          `).bind(generateId(), agentId, bl.ipAddress, bl.reason).run();
        }
      }

      return successResponse({ message: 'Settings updated successfully' });

    } catch (error) {
      console.error('Update agent settings error:', error);
      return errorResponse('Failed to update settings', 500);
    }
  }

  // 更新客服状态
  static async updateStatus(request: Request, env: Env, agentId: string): Promise<Response> {
    try {
      const { status } = await request.json();

      if (!['online', 'offline', 'busy'].includes(status)) {
        return errorResponse('Invalid status', 400);
      }

      await env.DB.prepare(`
        UPDATE agents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(status, agentId).run();

      return successResponse({ message: 'Status updated successfully', status });

    } catch (error) {
      console.error('Update agent status error:', error);
      return errorResponse('Failed to update status', 500);
    }
  }

  // 更新客服个人资料
  static async updateProfile(request: Request, env: Env, agentId: string): Promise<Response> {
    try {
      const { name, avatarUrl } = await request.json();

      // 获取客服的用户ID
      const agent = await env.DB.prepare(`
        SELECT user_id FROM agents WHERE id = ?
      `).bind(agentId).first();

      if (!agent) {
        return errorResponse('Agent not found', 404);
      }

      // 更新用户信息
      await env.DB.prepare(`
        UPDATE users 
        SET name = COALESCE(?, name), 
            avatar_url = COALESCE(?, avatar_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(name, avatarUrl, agent.user_id).run();

      // 获取更新后的用户信息
      const updatedUser = await env.DB.prepare(`
        SELECT u.*, r.name as role_name, r.display_name as role_display_name,
               r.level as role_level, r.color as role_color,
               a.status, a.current_sessions, a.max_sessions, a.share_id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN agents a ON u.id = a.user_id
        WHERE u.id = ?
      `).bind(agent.user_id).first();

      const formattedUser = {
        id: updatedUser.id,
        name: updatedUser.name,
        role: {
          id: updatedUser.role_id,
          name: updatedUser.role_name,
          displayName: updatedUser.role_display_name,
          level: updatedUser.role_level,
          color: updatedUser.role_color
        },
        avatarUrl: updatedUser.avatar_url,
        status: updatedUser.status,
        currentSessions: updatedUser.current_sessions,
        maxSessions: updatedUser.max_sessions,
        shareId: updatedUser.share_id
      };

      return successResponse(formattedUser);

    } catch (error) {
      console.error('Update agent profile error:', error);
      return errorResponse('Failed to update profile', 500);
    }
  }
}