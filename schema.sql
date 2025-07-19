-- NexusDesk Cloudflare D1 数据库结构
-- 基于现有的 TypeScript 类型设计

-- 用户角色表
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    level INTEGER NOT NULL,
    color TEXT NOT NULL
);

-- 插入默认角色
INSERT OR IGNORE INTO roles (name, display_name, level, color) VALUES
('admin', 'Administrator', 100, '#dc2626'),
('agent', 'Support Agent', 50, '#2563eb'),
('customer', 'Customer', 10, '#059669');

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    avatar_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

-- 客服扩展信息表
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
    current_sessions INTEGER DEFAULT 0,
    max_sessions INTEGER DEFAULT 5,
    share_id TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 客户扩展信息表
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    device_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 访问密钥表
CREATE TABLE IF NOT EXISTS access_keys (
    id TEXT PRIMARY KEY,
    key_value TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('admin', 'agent')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
    agent_id TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE SET NULL
);

-- 聊天会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('open', 'closed', 'pending')),
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_message_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
);

-- 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'customer', 'system')),
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 客服设置表
CREATE TABLE IF NOT EXISTS agent_settings (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL UNIQUE,
    auto_welcome_enabled BOOLEAN DEFAULT TRUE,
    sound_notifications BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
);

-- 快捷回复表
CREATE TABLE IF NOT EXISTS quick_replies (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    shortcut TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
);

-- 欢迎消息表
CREATE TABLE IF NOT EXISTS welcome_messages (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    message TEXT NOT NULL,
    delay_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
);

-- 黑名单表
CREATE TABLE IF NOT EXISTS blacklisted_users (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    reason TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_share_id ON agents(share_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_access_keys_key_value ON access_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_access_keys_agent_id ON access_keys(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_customer_id ON chat_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_id ON chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_agent_settings_agent_id ON agent_settings(agent_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_agent_id ON quick_replies(agent_id);
CREATE INDEX IF NOT EXISTS idx_welcome_messages_agent_id ON welcome_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_blacklisted_users_agent_id ON blacklisted_users(agent_id);