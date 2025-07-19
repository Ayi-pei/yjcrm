// 认证控制器
import type { Env } from '../../worker';
import { generateId } from '../utils/helpers';

export class AuthController {
  static async login(request: Request, env: Env): Promise<Response> {
    try {
      const { keyValue } = await request.json() as { keyValue: string };
      
      if (!keyValue) {
        return new Response(
          JSON.stringify({ error: 'Key value is required' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 查询访问密钥
      const keyQuery = await env.DB.prepare(`
        SELECT ak.*, a.user_id as agent_user_id, a.share_id, a.status as agent_status,
               a.current_sessions, a.max_sessions
        FROM access_keys ak
        LEFT JOIN agents a ON ak.agent_id = a.id
        WHERE ak.key_value = ? AND ak.status = 'active'
      `).bind(keyValue).first();

      if (!keyQuery) {
        return new Response(
          JSON.stringify({ error: 'Invalid or inactive key' }), 
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 获取用户信息
      let userId = keyQuery.agent_user_id;
      if (!userId && keyQuery.type === 'admin') {
        // 管理员密钥，查找管理员用户
        const adminUser = await env.DB.prepare(`
          SELECT u.* FROM users u 
          JOIN roles r ON u.role_id = r.id 
          WHERE r.name = 'admin' 
          LIMIT 1
        `).first();
        userId = adminUser?.id;
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User not found' }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 获取完整用户信息
      const userQuery = await env.DB.prepare(`
        SELECT u.*, r.name as role_name, r.display_name as role_display_name, 
               r.level as role_level, r.color as role_color
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `).bind(userId).first();

      if (!userQuery) {
        return new Response(
          JSON.stringify({ error: 'User not found' }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 构建用户对象
      let user: any = {
        id: userQuery.id,
        name: userQuery.name,
        role: {
          id: userQuery.role_id,
          name: userQuery.role_name,
          displayName: userQuery.role_display_name,
          level: userQuery.role_level,
          color: userQuery.role_color
        },
        avatarUrl: userQuery.avatar_url
      };

      // 如果是客服，添加客服特有属性
      if (keyQuery.type === 'agent' && keyQuery.agent_user_id) {
        user = {
          ...user,
          status: keyQuery.agent_status || 'offline',
          currentSessions: keyQuery.current_sessions || 0,
          maxSessions: keyQuery.max_sessions || 5,
          shareId: keyQuery.share_id
        };
      }

      // 构建密钥对象
      const key = {
        id: keyQuery.id,
        keyValue: keyQuery.key_value,
        type: keyQuery.type,
        status: keyQuery.status,
        createdAt: keyQuery.created_at,
        expiresAt: keyQuery.expires_at,
        agentId: keyQuery.agent_id,
        note: keyQuery.note
      };

      return new Response(
        JSON.stringify({ user, key }), 
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );

    } catch (error) {
      console.error('Login error:', error);
      return new Response(
        JSON.stringify({ error: 'Login failed' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  static async logout(request: Request, env: Env): Promise<Response> {
    // 对于无状态的 API，登出主要是客户端清除数据
    return new Response(
      JSON.stringify({ message: 'Logged out successfully' }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}