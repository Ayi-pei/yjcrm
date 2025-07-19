# 🚀 Cloudflare Workers 部署指南

## 📋 部署前准备

### 1. 安装必要工具
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 检查项目结构
确保您的项目包含以下文件：
- `wrangler.toml` - Cloudflare Workers 配置
- `schema.sql` - 数据库结构
- `seed.sql` - 种子数据
- `src/worker.ts` - Workers 主入口
- `src/api/` - API 控制器
- `src/websocket/` - WebSocket 处理

## 🛠️ 手动部署步骤

### 第一步：创建 D1 数据库
```bash
# 创建数据库
wrangler d1 create nexusdesk-db

# 复制输出中的 database_id，更新 wrangler.toml
# 将 "your-database-id-here" 替换为实际的数据库 ID
```

### 第二步：初始化数据库
```bash
# 创建数据库结构
wrangler d1 execute nexusdesk-db --file=./schema.sql

# 插入种子数据
wrangler d1 execute nexusdesk-db --file=./seed.sql
```

### 第三步：构建前端
```bash
npm run build
```

### 第四步：部署 Workers
```bash
wrangler deploy
```

## 🚀 一键部署

我们提供了自动化部署脚本：

```bash
# 给脚本执行权限
chmod +x scripts/deploy.sh

# 运行部署脚本
./scripts/deploy.sh
```

## 🔧 配置说明

### wrangler.toml 配置
```toml
name = "nexusdesk-api"           # Worker 名称
compatibility_date = "2024-01-15" # 兼容性日期
main = "src/worker.ts"           # 入口文件

[assets]
directory = "./dist"             # 前端构建输出目录

[[d1_databases]]
binding = "DB"                   # 数据库绑定名称
database_name = "nexusdesk-db"   # 数据库名称
database_id = "your-db-id"       # 数据库 ID（需要替换）

[durable_objects]
bindings = [
  { name = "CHAT_ROOM", class_name = "ChatRoom" }
]

[vars]
ENVIRONMENT = "production"       # 环境变量
```

## 📊 数据库结构

### 主要表格
- `users` - 用户基础信息
- `roles` - 用户角色
- `agents` - 客服扩展信息
- `customers` - 客户扩展信息
- `access_keys` - 访问密钥
- `chat_sessions` - 聊天会话
- `chat_messages` - 聊天消息
- `agent_settings` - 客服设置
- `quick_replies` - 快捷回复
- `welcome_messages` - 欢迎消息
- `blacklisted_users` - 黑名单

## 🔑 API 端点

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 管理员
- `GET /api/admin/dashboard` - 管理员仪表盘
- `GET /api/admin/keys` - 获取所有密钥
- `POST /api/admin/keys` - 创建新密钥
- `PUT /api/admin/keys/{id}` - 更新密钥
- `DELETE /api/admin/keys/{id}` - 删除密钥
- `GET /api/admin/agents` - 获取所有客服

### 客服
- `GET /api/agent/{id}/dashboard` - 客服仪表盘
- `GET /api/agent/{id}/settings` - 获取客服设置
- `PUT /api/agent/{id}/settings` - 更新客服设置
- `PUT /api/agent/{id}/status` - 更新客服状态
- `PUT /api/agent/{id}/profile` - 更新客服资料

### 聊天
- `POST /api/chat/visitor/{shareId}` - 创建访客会话
- `GET /api/chat/visitor/session/{sessionId}` - 获取访客会话
- `GET /api/chat/session/{sessionId}` - 获取会话详情
- `GET /api/chat/session/{sessionId}/messages` - 获取消息
- `POST /api/chat/session/{sessionId}/messages` - 发送消息

## 🌐 WebSocket 连接

### 连接 URL
```
wss://your-worker-domain/websocket?userId={userId}&userType={userType}
```

### 消息类型
- `chat_message` - 聊天消息
- `typing_start` - 开始输入
- `typing_stop` - 停止输入
- `join_chat` - 加入聊天
- `leave_chat` - 离开聊天

## 🔍 测试账号

部署完成后，您可以使用以下测试账号：

- **管理员**: `ADMIN-SUPER-SECRET`
- **客服 Alice**: `AGENT-ALICE-123`
- **客服 Bob**: `AGENT-BOB-456` (已停用)

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `wrangler.toml` 中的 `database_id` 是否正确
   - 确认数据库已创建并初始化

2. **WebSocket 连接失败**
   - 检查 Durable Objects 配置
   - 确认 `ChatRoom` 类正确导出

3. **API 请求失败**
   - 检查 CORS 配置
   - 确认路由配置正确

4. **前端资源加载失败**
   - 确认 `npm run build` 成功执行
   - 检查 `assets.directory` 配置

### 调试命令

```bash
# 查看 Worker 日志
wrangler tail

# 查看数据库内容
wrangler d1 execute nexusdesk-db --command="SELECT * FROM users LIMIT 5"

# 本地开发模式
wrangler dev
```

## 📈 性能优化

### 建议配置
- 启用 Cloudflare 缓存
- 配置适当的 TTL
- 使用 KV 存储会话数据
- 优化数据库查询

### 监控
- 设置 Cloudflare Analytics
- 配置错误报告
- 监控 API 响应时间

## 🔒 安全考虑

- 定期轮换访问密钥
- 配置适当的 CORS 策略
- 启用 DDoS 保护
- 监控异常访问模式

## 📞 支持

如果遇到部署问题，请检查：
1. Cloudflare Dashboard 中的 Workers 状态
2. D1 数据库连接状态
3. 域名配置
4. SSL 证书状态