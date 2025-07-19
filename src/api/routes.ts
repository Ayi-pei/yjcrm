// API 路由处理器
import type { Env } from '../worker';
import { AuthController } from './controllers/authController';
import { AgentController } from './controllers/agentController';
import { AdminController } from './controllers/adminController';
import { ChatController } from './controllers/chatController';

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  const method = request.method;

  // 路由映射
  const routes = [
    // 认证相关
    { pattern: /^\/auth\/login$/, method: 'POST', handler: AuthController.login },
    { pattern: /^\/auth\/logout$/, method: 'POST', handler: AuthController.logout },
    
    // 管理员相关
    { pattern: /^\/admin\/dashboard$/, method: 'GET', handler: AdminController.getDashboard },
    { pattern: /^\/admin\/keys$/, method: 'GET', handler: AdminController.getKeys },
    { pattern: /^\/admin\/keys$/, method: 'POST', handler: AdminController.createKey },
    { pattern: /^\/admin\/keys\/([^\/]+)$/, method: 'PUT', handler: AdminController.updateKey },
    { pattern: /^\/admin\/keys\/([^\/]+)$/, method: 'DELETE', handler: AdminController.deleteKey },
    { pattern: /^\/admin\/agents$/, method: 'GET', handler: AdminController.getAgents },
    
    // 客服相关
    { pattern: /^\/agent\/([^\/]+)\/dashboard$/, method: 'GET', handler: AgentController.getDashboard },
    { pattern: /^\/agent\/([^\/]+)\/settings$/, method: 'GET', handler: AgentController.getSettings },
    { pattern: /^\/agent\/([^\/]+)\/settings$/, method: 'PUT', handler: AgentController.updateSettings },
    { pattern: /^\/agent\/([^\/]+)\/status$/, method: 'PUT', handler: AgentController.updateStatus },
    { pattern: /^\/agent\/([^\/]+)\/profile$/, method: 'PUT', handler: AgentController.updateProfile },
    
    // 聊天相关
    { pattern: /^\/chat\/session\/([^\/]+)$/, method: 'GET', handler: ChatController.getSession },
    { pattern: /^\/chat\/session\/([^\/]+)\/messages$/, method: 'GET', handler: ChatController.getMessages },
    { pattern: /^\/chat\/session\/([^\/]+)\/messages$/, method: 'POST', handler: ChatController.sendMessage },
    { pattern: /^\/chat\/visitor\/([^\/]+)$/, method: 'POST', handler: ChatController.createVisitorSession },
    { pattern: /^\/chat\/visitor\/session\/([^\/]+)$/, method: 'GET', handler: ChatController.getVisitorSession },
  ];

  // 查找匹配的路由
  for (const route of routes) {
    if (route.method === method) {
      const match = path.match(route.pattern);
      if (match) {
        try {
          // 提取路径参数
          const params = match.slice(1);
          return await route.handler(request, env, ...params);
        } catch (error) {
          console.error('Route handler error:', error);
          return new Response(
            JSON.stringify({ error: 'Internal Server Error' }), 
            { 
              status: 500, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }
      }
    }
  }

  // 404 - 路由未找到
  return new Response(
    JSON.stringify({ error: 'Not Found' }), 
    { 
      status: 404, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}