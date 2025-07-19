#!/bin/bash

# NexusDesk Cloudflare Workers 部署脚本

echo "🚀 开始部署 NexusDesk 到 Cloudflare Workers..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装，请先安装："
    echo "npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请先登录 Cloudflare："
    wrangler login
fi

# 第一步：创建 D1 数据库
echo "📊 创建 D1 数据库..."
DB_OUTPUT=$(wrangler d1 create nexusdesk-db 2>&1)
if [[ $? -eq 0 ]]; then
    echo "✅ 数据库创建成功"
    # 提取数据库 ID
    DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    echo "📝 数据库 ID: $DB_ID"
    
    # 更新 wrangler.toml 中的数据库 ID
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-database-id-here/$DB_ID/" wrangler.toml
    else
        # Linux
        sed -i "s/your-database-id-here/$DB_ID/" wrangler.toml
    fi
    echo "✅ wrangler.toml 已更新"
else
    echo "⚠️  数据库可能已存在，继续部署..."
fi

# 第二步：执行数据库迁移
echo "🗄️  执行数据库迁移..."
wrangler d1 execute nexusdesk-db --file=./schema.sql
if [[ $? -eq 0 ]]; then
    echo "✅ 数据库结构创建成功"
else
    echo "❌ 数据库结构创建失败"
    exit 1
fi

# 第三步：插入种子数据
echo "🌱 插入种子数据..."
wrangler d1 execute nexusdesk-db --file=./seed.sql
if [[ $? -eq 0 ]]; then
    echo "✅ 种子数据插入成功"
else
    echo "❌ 种子数据插入失败"
    exit 1
fi

# 第四步：构建前端
echo "🔨 构建前端应用..."
npm run build
if [[ $? -eq 0 ]]; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败"
    exit 1
fi

# 第五步：部署 Workers
echo "☁️  部署到 Cloudflare Workers..."
wrangler deploy
if [[ $? -eq 0 ]]; then
    echo "🎉 部署成功！"
    echo ""
    echo "📋 部署信息："
    echo "   - Worker 名称: nexusdesk-api"
    echo "   - 数据库: nexusdesk-db"
    echo "   - 数据库 ID: $DB_ID"
    echo ""
    echo "🔑 测试账号："
    echo "   - 管理员: ADMIN-SUPER-SECRET"
    echo "   - 客服 Alice: AGENT-ALICE-123"
    echo "   - 客服 Bob: AGENT-BOB-456 (已停用)"
    echo ""
    echo "🌐 访问您的应用："
    wrangler pages project list 2>/dev/null || echo "   请在 Cloudflare Dashboard 中查看您的 Worker URL"
else
    echo "❌ 部署失败"
    exit 1
fi