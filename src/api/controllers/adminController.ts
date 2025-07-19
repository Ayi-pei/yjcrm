// 管理员控制器
import type { Env } from '../../worker';
import { generateId, generateRandomString, successResponse, errorResponse } from '../utils/helpers';

export class AdminController {
  // 获取管理员仪表盘数据
  static async getDashboard(request: Request, env: Env): Promise<Response> {
    try {
      // 获取所有客服
      const agents = await env.DB.prepare(`
        SELECT a.*, u.name, u.avatar_url
        FROM agents a
        JOIN users u ON a.user_id = u.id
        ORDER BY u.name
      `).all();

      // 获取所有密钥
      const keys = await env.DB.prepare(`
        SELECT * FROM access_keys ORDER BY created_at DESC
      `).all();

      const formattedAgents = agents.results.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        currentSessions: agent.current_sessions,
        maxSessions: agent.max_sessions,
        shareId: agent.share_id,
        avatarUrl: agent.avatar_url
      }));

      const formattedKeys = keys.results.map((key: any) => ({
        id: key.id,
        keyValue: key.key_value,
        type: key.type,
        status: key.status,
        createdAt: key.created_at,
        expiresAt: key.expires_at,
        agentId: key.agent_id,
        note: key.note
      }));

      return successResponse({
        agents: formattedAgents,
        keys: formattedKeys
      });

    } catch (error) {
      console.error('Get admin dashboard error:', error);
      return errorResponse('Failed to get dashboard data', 500);
    }
  }

  // 获取所有密钥
  static async getKeys(request: Request, env: Env): Promise<Response> {
    try {
      const keys = await env.DB.prepare(`
        SELECT ak.*, u.name as agent_name
        FROM access_keys ak
        LEFT JOIN agents a ON ak.agent_id = a.id
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY ak.created_at DESC
      `).all();

      const formattedKeys = keys.results.map((key: any) => ({
        id: key.id,
        keyValue: key.key_value,
        type: key.type,
        status: key.status,
        createdAt: key.created_at,
        expiresAt: key.expires_at,
        agentId: key.agent_id,
        agentName: key.agent_name,
        note: key.note
      }));

      return successResponse(formattedKeys);

    } catch (error) {
      console.error('Get keys error:', error);
      return errorResponse('Failed to get keys', 500);
    }
  }

  // 创建新密钥
  static async createKey(request: Request, env: Env): Promise<Response> {
    try {
      const { type, agentId, note, expiresAt } = await request.json();

      if (!type || !['admin', 'agent'].includes(type)) {
        return errorResponse('Invalid key type', 400);
      }

      if (type === 'agent' && !agentId) {
        return errorResponse('Agent ID is required for agent keys', 400);
      }

      // 生成密钥值
      const keyValue = `${type.toUpperCase()}-${generateRandomString(12)}`;
      const keyId = generateId();

      // 插入密钥
      await env.DB.prepare(`
        INSERT INTO access_keys (id, key_value, type, status, agent_id, note, expires_at)
        VALUES (?, ?, ?, 'active', ?, ?, ?)
      `).bind(keyId, keyValue, type, agentId, note, expiresAt).run();

      // 获取创建的密钥信息
      const newKey = await env.DB.prepare(`
        SELECT ak.*, u.name as agent_name
        FROM access_keys ak
        LEFT JOIN agents a ON ak.agent_id = a.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE ak.id = ?
      `).bind(keyId).first();

      const formattedKey = {
        id: newKey.id,
        keyValue: newKey.key_value,
        type: newKey.type,
        status: newKey.status,
        createdAt: newKey.created_at,
        expiresAt: newKey.expires_at,
        agentId: newKey.agent_id,
        agentName: newKey.agent_name,
        note: newKey.note
      };

      return successResponse(formattedKey, 201);

    } catch (error) {
      console.error('Create key error:', error);
      return errorResponse('Failed to create key', 500);
    }
  }

  // 更新密钥
  static async updateKey(request: Request, env: Env, keyId: string): Promise<Response> {
    try {
      const data = await request.json();

      // 构建更新查询
      const updateFields = [];
      const values = [];

      if (data.status !== undefined) {
        updateFields.push('status = ?');
        values.push(data.status);
      }
      if (data.note !== undefined) {
        updateFields.push('note = ?');
        values.push(data.note);
      }
      if (data.expiresAt !== undefined) {
        updateFields.push('expires_at = ?');
        values.push(data.expiresAt);
      }

      if (updateFields.length === 0) {
        return errorResponse('No fields to update', 400);
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(keyId);

      await env.DB.prepare(`
        UPDATE access_keys SET ${updateFields.join(', ')} WHERE id = ?
      `).bind(...values).run();

      // 获取更新后的密钥信息
      const updatedKey = await env.DB.prepare(`
        SELECT ak.*, u.name as agent_name
        FROM access_keys ak
        LEFT JOIN agents a ON ak.agent_id = a.id
        LEFT JOIN users u ON a.user_id = u.id
        WHERE ak.id = ?
      `).bind(keyId).first();

      if (!updatedKey) {
        return errorResponse('Key not found', 404);
      }

      const formattedKey = {
        id: updatedKey.id,
        keyValue: updatedKey.key_value,
        type: updatedKey.type,
        status: updatedKey.status,
        createdAt: updatedKey.created_at,
        expiresAt: updatedKey.expires_at,
        agentId: updatedKey.agent_id,
        agentName: updatedKey.agent_name,
        note: updatedKey.note
      };

      return successResponse(formattedKey);

    } catch (error) {
      console.error('Update key error:', error);
      return errorResponse('Failed to update key', 500);
    }
  }

  // 删除密钥
  static async deleteKey(request: Request, env: Env, keyId: string): Promise<Response> {
    try {
      const result = await env.DB.prepare(`
        DELETE FROM access_keys WHERE id = ?
      `).bind(keyId).run();

      if (result.changes === 0) {
        return errorResponse('Key not found', 404);
      }

      return successResponse({ message: 'Key deleted successfully' });

    } catch (error) {
      console.error('Delete key error:', error);
      return errorResponse('Failed to delete key', 500);
    }
  }

  // 获取所有客服
  static async getAgents(request: Request, env: Env): Promise<Response> {
    try {
      const agents = await env.DB.prepare(`
        SELECT a.*, u.name, u.avatar_url,
               COUNT(cs.id) as active_sessions
        FROM agents a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN chat_sessions cs ON a.id = cs.agent_id AND cs.status IN ('open', 'pending')
        GROUP BY a.id, u.name, u.avatar_url
        ORDER BY u.name
      `).all();

      const formattedAgents = agents.results.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        currentSessions: agent.active_sessions,
        maxSessions: agent.max_sessions,
        shareId: agent.share_id,
        avatarUrl: agent.avatar_url,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at
      }));

      return successResponse(formattedAgents);

    } catch (error) {
      console.error('Get agents error:', error);
      return errorResponse('Failed to get agents', 500);
    }
  }
}