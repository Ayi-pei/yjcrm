// Cloudflare Workers 主入口文件
// 处理 API 请求和 WebSocket 连接

export interface Env {
  DB: D1Database;
  CHAT_ROOM: DurableObjectNamespace;
  ENVIRONMENT: string;
}

// 导入路由处理器
import { handleApiRequest } from './api/routes';
import { ChatRoom } from './websocket/chatRoom';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS 处理
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // WebSocket 升级请求
      if (request.headers.get('Upgrade') === 'websocket') {
        return handleWebSocketUpgrade(request, env);
      }

      // API 路由处理
      if (url.pathname.startsWith('/api/')) {
        const response = await handleApiRequest(request, env);
        // 添加 CORS 头
        Object.entries(corsHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        return response;
      }

      // 静态文件服务 (由 assets 处理)
      return new Response('Not Found', { status: 404 });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }), 
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }
  },
};

// WebSocket 连接处理
async function handleWebSocketUpgrade(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId') || 'default';
  
  // 获取 Durable Object 实例
  const id = env.CHAT_ROOM.idFromName(roomId);
  const chatRoom = env.CHAT_ROOM.get(id);
  
  // 转发 WebSocket 请求到 Durable Object
  return chatRoom.fetch(request);
}

// 导出 Durable Object 类
export { ChatRoom };