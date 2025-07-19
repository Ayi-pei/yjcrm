-- 种子数据：插入测试用户和配置
-- 这些数据对应原来 mockApi.ts 中的测试数据

-- 插入测试用户
INSERT OR IGNORE INTO users (id, name, role_id, avatar_url) VALUES
('admin-1', 'System Admin', 1, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
('agent-alice', 'Alice Johnson', 2, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('agent-bob', 'Bob Smith', 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face');

-- 插入客服信息
INSERT OR IGNORE INTO agents (id, user_id, status, current_sessions, max_sessions, share_id) VALUES
('agent-alice', 'agent-alice', 'online', 0, 5, 'chat-with-alice'),
('agent-bob', 'agent-bob', 'offline', 0, 3, 'chat-with-bob');

-- 插入访问密钥
INSERT OR IGNORE INTO access_keys (id, key_value, type, status, agent_id, note) VALUES
('key-admin-1', 'ADMIN-SUPER-SECRET', 'admin', 'active', NULL, 'Main admin key'),
('key-alice-1', 'AGENT-ALICE-123', 'agent', 'active', 'agent-alice', 'Alice agent key'),
('key-bob-1', 'AGENT-BOB-456', 'agent', 'suspended', 'agent-bob', 'Bob agent key (suspended)');

-- 插入客服设置
INSERT OR IGNORE INTO agent_settings (id, agent_id, auto_welcome_enabled, sound_notifications) VALUES
('settings-alice', 'agent-alice', TRUE, TRUE),
('settings-bob', 'agent-bob', TRUE, FALSE);

-- 插入 Alice 的快捷回复
INSERT OR IGNORE INTO quick_replies (id, agent_id, shortcut, message) VALUES
('qr-alice-1', 'agent-alice', '/hello', 'Hello! How can I help you today?'),
('qr-alice-2', 'agent-alice', '/thanks', 'Thank you for contacting us!'),
('qr-alice-3', 'agent-alice', '/wait', 'Please wait a moment while I check that for you.');

-- 插入 Alice 的欢迎消息
INSERT OR IGNORE INTO welcome_messages (id, agent_id, message, delay_seconds) VALUES
('wm-alice-1', 'agent-alice', 'Welcome! I''m Alice, your support agent.', 2),
('wm-alice-2', 'agent-alice', 'How can I assist you today?', 5);

-- 插入 Bob 的快捷回复
INSERT OR IGNORE INTO quick_replies (id, agent_id, shortcut, message) VALUES
('qr-bob-1', 'agent-bob', '/hi', 'Hi there! What can I do for you?'),
('qr-bob-2', 'agent-bob', '/bye', 'Have a great day!');

-- 插入 Bob 的欢迎消息
INSERT OR IGNORE INTO welcome_messages (id, agent_id, message, delay_seconds) VALUES
('wm-bob-1', 'agent-bob', 'Hello! I''m Bob from support.', 1);