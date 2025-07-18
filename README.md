# NexusDesk - Multi-Agent Customer Support System

# NexusDesk - 多智能体客户支持系统

NexusDesk is a modern, web-based customer support chat application built with React and TypeScript. It provides a complete solution for businesses to manage customer interactions, featuring distinct interfaces for administrators, support agents, and visitors.

NexusDesk 是一个现代化的基于 Web 的客户支持聊天应用，使用 React 和 TypeScript 构建。它为企业提供了完整的客户互动管理解决方案，拥有管理员、客服和访客三种独立界面。

The entire application is self-contained and runs in the browser, using a sophisticated mock API to simulate a full backend for demonstration and development purposes.

整个应用完全自包含，运行于浏览器端，利用高级 mock API 模拟完整后端，便于演示和开发。

## Core Technologies / 核心技术

- **Frontend Framework**: React 18 / 前端框架：React 18
- **Language**: TypeScript / 语言：TypeScript
- **Styling**: Tailwind CSS / 样式：Tailwind CSS
- **Routing**: React Router v6 (using `HashRouter`) / 路由：React Router v6（使用 `HashRouter`）
- **State Management**: Zustand / 状态管理：Zustand
- **UI Components**: Headless UI for modals and menus / UI 组件：Headless UI（用于模态框和菜单）
- **File Handling**: React Dropzone / 文件处理：React Dropzone

## How to Run the Application / 如何运行本应用

This project is a static web application and does not require a complex build process.

本项目为静态 Web 应用，无需复杂的构建流程。

1.  **Prerequisite**: You need a local web server to serve the files correctly. If you have Node.js installed, you can use the `serve` package.
    - Install `serve` globally: `npm install -g serve`
      前置条件：你需要一个本地 Web 服务器来正确地提供文件。如果已安装 Node.js，可以使用 `serve` 包。

- 全局安装 serve：`npm install -g serve`

2.  **Start the Server**:
    - Navigate to the project's root directory in your terminal.
    - Run the command: `serve`
      启动服务器：

- 在终端进入项目根目录。
- 运行命令：`serve`

3.  **Access the App**:
    - Open your web browser and go to the local address provided by the server (e.g., `http://localhost:3000`).
      访问应用：

- 打开浏览器，访问服务器提供的本地地址（如 `http://localhost:3000`）。

## Project Structure / 项目结构

```
.
├── components/         # React components, organized by feature/page / 按功能/页面组织的 React 组件
│   ├── admin/          # Components for the admin panel / 管理员面板组件
│   ├── agent/          # Components for the agent interface / 客服界面组件
│   ├── pages/          # Top-level page components for each route / 各路由的顶级页面组件
│   ├── shared/         # Components used across multiple pages (e.g., Sidebar) / 跨页面复用组件（如 Sidebar）
│   └── ui/             # Generic, reusable UI elements (e.g., Button, Modal) / 通用 UI 元素（如 Button, Modal）
├── services/           # Mock API and other services / mock API 及其它服务
│   └── mockApi.ts      # Simulates the backend, manages all data in-memory / 模拟后端，管理所有内存数据
├── stores/             # Zustand state management stores / Zustand 状态管理
│   ├── adminStore.ts   # State for the admin panel (keys, agents) / 管理员面板状态（密钥、客服）
│   ├── agentStore.ts   # State for the agent dashboard (chats, customers) / 客服仪表盘状态（聊天、客户）
│   └── authStore.ts    # Global authentication state (current user, key) / 全局认证状态（当前用户、密钥）
├── App.tsx             # Main application component with routing logic / 主应用组件及路由逻辑
├── constants.tsx       # Application-wide constants (icons, names) / 全局常量（图标、名称等）
├── index.html          # The main HTML entry point, includes importmap for dependencies / 入口 HTML，包含依赖 importmap
├── index.tsx           # React application entry point / React 应用入口
├── types.ts            # All TypeScript type definitions / 所有 TypeScript 类型定义
└── README.md           # This documentation file / 本文档
```

## Key Features & Functionality / 主要功能与特性

### 1. Authentication / 认证

- **Key-Based Login**: The system uses access keys instead of traditional username/passwords. / 密钥登录：系统使用访问密钥代替传统用户名/密码。
- **Roles**: Keys can be for an `admin` or an `agent`, granting access to different parts of the application. / 角色：密钥可为 `admin` 或 `agent`，对应不同权限。
- **State**: The `authStore` manages the current user's session, which is persisted in `sessionStorage`. / 状态：`authStore` 管理当前用户会话，并持久化于 `sessionStorage`。

**Test Keys / 测试密钥：**

- **Admin Key**: `ADMIN-SUPER-SECRET` / 管理员密钥：`ADMIN-SUPER-SECRET`
- **Agent "Alice" Key**: `AGENT-ALICE-123` / 客服“Alice”密钥：`AGENT-ALICE-123`
- **Agent "Bob" Key** (Suspended): `AGENT-BOB-456` / 客服“Bob”密钥（已停用）：`AGENT-BOB-456`

### 2. Admin Panel (`/admin`) / 管理员面板（`/admin`）

Accessed with an admin key. / 使用管理员密钥访问。

- **Dashboard**: Provides at-a-glance statistics about total agents, online agents, and key status. / 仪表盘：一览所有客服、在线客服、密钥状态等统计。
- **Key Management**: A full CRUD interface for managing access keys. Admins can create, edit, delete, suspend, and activate keys. / 密钥管理：完整的密钥增删改查界面。管理员可创建、编辑、删除、停用、激活密钥。
- **Agent Management**: A view-only list of all agents in the system, showing their status, session load, and unique `shareId`. / 客服管理：只读客服列表，显示状态、会话负载、唯一 `shareId`。

### 3. Agent Interface (`/agent`) / 客服界面（`/agent`）

Accessed with an agent key. / 使用客服密钥访问。

- **Live Chat UI**: A three-column layout for professional chat management. / 实时聊天 UI：三栏式专业聊天管理界面。
  - **Customer List**: A list of all active and pending conversations. / 客户列表：所有活跃和待处理会话。
  - **Chat Window**: The main area for interacting with a selected customer, including message history and a message input form. / 聊天窗口：与选中客户互动的主区域，含消息历史和输入框。
  - **Customer Details**: Displays information about the selected customer (IP address, device info, etc.). / 客户详情：显示选中客户的 IP、设备信息等。
- **Agent Settings**:
  - **Profile**: Agents can change their display name and generate a new random avatar. / 个人资料：可修改显示名、生成新头像。
  - **Status**: Agents can set their status to `online`, `busy`, or `offline` from the sidebar. / 状态：可在侧边栏设置为 `在线`、`忙碌`、`离线`。
  - **Quick Replies, Welcome Messages, Blacklist**: Fully functional settings to manage chat shortcuts, automated greetings, and block specific IPs. / 快捷回复、欢迎语、黑名单：完整设置，管理聊天快捷语、自动问候、屏蔽 IP。
  - **Share Link & QR Code**: Each agent has a unique link and corresponding QR code to share with visitors. / 分享链接 & 二维码：每位客服有唯一链接和二维码，便于访客接入。

### 4. Visitor Chat (`/chat/:shareId`) / 访客聊天（`/chat/:shareId`）

- **Dynamic Routing**: Visitors access the chat using an agent-specific URL (e.g., `.../#/chat/chat-with-alice`). / 动态路由：访客通过客服专属链接访问聊天（如 `.../#/chat/chat-with-alice`）。
- **Session Creation**: The mock API automatically creates a new customer and chat session when a visitor connects. / 会话创建：mock API 在访客连接时自动创建新客户和会话。
- **Real-Time Communication**: The interface polls the mock API to simulate real-time message updates from the agent. / 实时通信：界面轮询 mock API，模拟客服消息实时更新。

## State Management (Zustand) / 状态管理（Zustand）

- **`authStore`**: Handles global user state. `login`, `logout`, `updateCurrentUser`. / 管理全局用户状态。`login`、`logout`、`updateCurrentUser`。
- **`adminStore`**: Manages data for the admin panel. `fetchDashboardData`, `createKey`, `updateKey`, `deleteKey`. / 管理员面板数据。`fetchDashboardData`、`createKey`、`updateKey`、`deleteKey`。
- **`agentStore`**: Manages all data for the agent view. `fetchAgentData`, `setActiveSessionId`, `sendMessage`, `updateSettings`. / 客服界面所有数据。`fetchAgentData`、`setActiveSessionId`、`sendMessage`、`updateSettings`。

## Mock API

The file `services/mockApi.ts` is the heart of the application's data layer. / `services/mockApi.ts` 是应用数据层的核心。

- **In-Memory Database**: It contains a `DB` object that holds all users, keys, sessions, messages, etc., in memory. / 内存数据库：包含 `DB` 对象，存储所有用户、密钥、会话、消息等。
- **Async Simulation**: All functions are `async` and use a `networkDelay` to simulate real network latency. / 异步模拟：所有函数均为 `async`，并用 `networkDelay` 模拟真实网络延迟。
- **Data Manipulation**: It uses the `immer` library (`produce`) for safe and immutable updates to the state, preventing common bugs. / 数据操作：使用 `immer`（`produce`）安全、不可变地更新状态，防止常见 bug。
