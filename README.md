# NexusDesk - 多智能体客户支持系统

NexusDesk 是一个现代化的基于 Web 的客户支持聊天应用，使用 React 和 TypeScript 构建。它为企业提供了完整的客户互动管理解决方案，拥有管理员、客服和访客三种独立界面。

整个应用完全自包含，运行于浏览器端，利用高级 mock API 模拟完整后端，便于演示和开发。

## 核心技术

- **前端框架**：React 18
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **路由**：React Router v6（使用 `HashRouter`）
- **状态管理**：Zustand
- **UI 组件**：Headless UI（用于模态框和菜单）
- **文件处理**：React Dropzone

## 如何运行本应用

本项目为静态 Web 应用，无需复杂的构建流程。

1. **前置条件**：你需要一个本地 Web 服务器来正确地提供文件。如果已安装 Node.js，可以使用 `serve` 包。
   - 全局安装 serve：`npm install -g serve`
2. **启动服务器**：
   - 在终端进入项目根目录。
   - 运行命令：`serve`
3. **访问应用**：
   - 打开浏览器，访问服务器提供的本地地址（如 `http://localhost:3000`）。

## 项目结构

```
.
├── components/         # 按功能/页面组织的 React 组件
│   ├── admin/          # 管理员面板组件
│   ├── agent/          # 客服界面组件
│   ├── pages/          # 各路由的顶级页面组件
│   ├── shared/         # 跨页面复用组件（如 Sidebar）
│   └── ui/             # 通用 UI 元素（如 Button, Modal）
├── services/           # mock API 及其它服务
│   └── mockApi.ts      # 模拟后端，管理所有内存数据
├── stores/             # Zustand 状态管理
│   ├── adminStore.ts   # 管理员面板状态（密钥、客服）
│   ├── agentStore.ts   # 客服仪表盘状态（聊天、客户）
│   └── authStore.ts    # 全局认证状态（当前用户、密钥）
├── App.tsx             # 主应用组件及路由逻辑
├── constants.tsx       # 全局常量（图标、名称等）
├── index.html          # 入口 HTML，包含依赖 importmap
├── index.tsx           # React 应用入口
├── types.ts            # 所有 TypeScript 类型定义
└── README.md           # 本文档
```

## 主要功能与特性

### 1. 认证

- **密钥登录**：系统使用访问密钥代替传统用户名/密码。
- **角色**：密钥可为 `admin` 或 `agent`，对应不同权限。
- **状态**：`authStore` 管理当前用户会话，并持久化于 `sessionStorage`。

**测试密钥：**

- **管理员密钥**：`ADMIN-SUPER-SECRET`
- **客服“Alice”密钥**：`AGENT-ALICE-123`
- **客服“Bob”密钥**（已停用）：`AGENT-BOB-456`

### 2. 管理员面板（`/admin`）

使用管理员密钥访问。

- **仪表盘**：一览所有客服、在线客服、密钥状态等统计。
- **密钥管理**：完整的密钥增删改查界面。管理员可创建、编辑、删除、停用、激活密钥。
- **客服管理**：只读客服列表，显示状态、会话负载、唯一 `shareId`。

### 3. 客服界面（`/agent`）

使用客服密钥访问。

- **实时聊天 UI**：三栏式专业聊天管理界面。
  - **客户列表**：所有活跃和待处理会话。
  - **聊天窗口**：与选中客户互动的主区域，含消息历史和输入框。
  - **客户详情**：显示选中客户的 IP、设备信息等。
- **客服设置**：
  - **个人资料**：可修改显示名、生成新头像。
  - **状态**：可在侧边栏设置为 `在线`、`忙碌`、`离线`。
  - **快捷回复、欢迎语、黑名单**：完整设置，管理聊天快捷语、自动问候、屏蔽 IP。
  - **分享链接 & 二维码**：每位客服有唯一链接和二维码，便于访客接入。

### 4. 访客聊天（`/chat/:shareId`）

- **动态路由**：访客通过客服专属链接访问聊天（如 `.../#/chat/chat-with-alice`）。
- **会话创建**：mock API 在访客连接时自动创建新客户和会话。
- **实时通信**：界面轮询 mock API，模拟客服消息实时更新。

## 状态管理（Zustand）

- **`authStore`**：管理全局用户状态。`login`、`logout`、`updateCurrentUser`。
- **`adminStore`**：管理员面板数据。`fetchDashboardData`、`createKey`、`updateKey`、`deleteKey`。
- **`agentStore`**：客服界面所有数据。`fetchAgentData`、`setActiveSessionId`、`sendMessage`、`updateSettings`。

## Mock API

`services/mockApi.ts` 是应用数据层的核心。

- **内存数据库**：包含 `DB` 对象，存储所有用户、密钥、会话、消息等。
- **异步模拟**：所有函数均为 `async`，并用 `networkDelay` 模拟真实网络延迟。
- **数据操作**：使用 `immer`（`produce`）安全、不可变地更新状态，防止常见 bug。
