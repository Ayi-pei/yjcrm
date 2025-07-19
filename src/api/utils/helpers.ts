// 工具函数

// 生成唯一ID
export function generateId(): string {
  return crypto.randomUUID();
}

// 生成随机字符串
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 格式化日期时间
export function formatDateTime(date: Date = new Date()): string {
  return date.toISOString();
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证IP地址格式
export function isValidIP(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

// 获取客户端IP地址
export function getClientIP(request: Request): string {
  // Cloudflare 提供的真实IP
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For') || 
         request.headers.get('X-Real-IP') || 
         '127.0.0.1';
}

// 获取用户代理信息
export function getUserAgent(request: Request): string {
  return request.headers.get('User-Agent') || 'Unknown';
}

// 简单的设备信息解析
export function parseDeviceInfo(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile Device';
  if (userAgent.includes('Tablet')) return 'Tablet';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux PC';
  return 'Unknown Device';
}

// 错误响应生成器
export function errorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }), 
    { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

// 成功响应生成器
export function successResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data), 
    { 
      status, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}