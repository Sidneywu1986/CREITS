# 扣子平台集成功能总结

## 📋 新增文件

### 1. 配置文件
- **`/.env.local.example`**
  - 环境变量配置示例
  - 包含coze-coding-dev-sdk和Bot API的配置说明

- **`/src/config/coze.ts`**
  - 扣子Bot配置
  - 提供Bot ID和API Token的管理
  - 实现Bot API调用函数

### 2. API路由
- **`/src/app/api/bot/chat/route.ts`**
  - Bot聊天API端点
  - 用于调用扣子平台的独立Bot

- **`/src/app/api/webhook/coze/route.ts`**
  - Webhook接收端点
  - 用于接收扣子平台的主动推送消息

### 3. 文档
- **`/docs/COZE_INTEGRATION.md`**
  - 完整的集成指南
  - 包含三种方案的详细说明
  - 提供常见问题解答

### 4. 页面
- **`/src/app/integration/page.tsx`**
  - 集成指南演示页面
  - 提供三种方案的测试界面
  - 实时显示操作日志

## 🔧 修改文件

### 1. 导航栏
- **`/src/components/layout/Sidebar.tsx`**
  - 新增"集成指南"导航项
  - 使用Zap图标

## 📚 三种集成方案

### 方案一：coze-coding-dev-sdk（推荐）

**优点：**
- ✅ 无需额外配置
- ✅ 支持流式输出
- ✅ 已在项目中实现
- ✅ 支持多模态（图片、视频）

**使用方式：**
- 已在 `/api/chat` 实现
- 直接使用 `/chat/[id]` 页面即可

**示例：**
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: '消息内容' }],
    agentId: 'policy', // 选择Agent
  }),
});
```

### 方案二：扣子Bot API

**优点：**
- ✅ 可以调用扣子平台独立Bot
- ✅ 灵活的配置方式

**配置要求：**
1. 在 `.env.local` 中配置Bot ID和Token
2. 环境变量格式：
   ```env
   COZE_POLICY_BOT_ID=7384xxxxx
   COZE_POLICY_BOT_TOKEN=pat_xxxx
   ```

**使用方式：**
```typescript
const response = await fetch('/api/bot/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    botKey: 'policy-bot',
    message: '消息内容',
  }),
});
```

**支持的Bot：**
- `policy-bot`：政策解读Bot
- `due-diligence-bot`：尽职调查Bot
- `material-bot`：申报材料生成Bot
- `pricing-bot`：定价发行建议Bot
- `management-bot`：存续期管理Bot
- `collaboration-bot`：智能协作Bot

### 方案三：Webhook

**优点：**
- ✅ 支持主动推送
- ✅ 事件驱动

**配置要求：**
1. 本地开发需要内网穿透（如ngrok）
2. 在扣子平台配置Webhook地址
3. 可选配置签名验证

**使用方式：**
- Webhook端点：`/api/webhook/coze`
- 扣子平台会主动推送消息到此端点

## 🚀 快速开始

### 1. 查看集成指南

访问：http://localhost:5000/integration

### 2. 测试方案一（SDK）

直接在聊天页面测试：
- 访问：http://localhost:5000/chat/policy
- 发送消息即可

### 3. 测试方案二（Bot API）

1. 复制环境变量示例：
   ```bash
   cp .env.local.example .env.local
   ```

2. 配置Bot ID和Token：
   ```env
   COZE_POLICY_BOT_ID=your_bot_id
   COZE_POLICY_BOT_TOKEN=your_bot_token
   ```

3. 在集成页面测试或使用API调用

### 4. 测试方案三（Webhook）

1. 启动内网穿透（本地开发）：
   ```bash
   ngrok http 5000
   ```

2. 在扣子平台配置Webhook地址

3. 测试推送功能

## 📖 详细文档

完整文档请查看：`/docs/COZE_INTEGRATION.md`

## 🔍 注意事项

### 安全性
- ⚠️ 永远不要将 `.env.local` 提交到Git仓库
- ⚠️ 使用 `.env.local.example` 作为模板
- ⚠️ 生产环境使用平台的环境变量管理

### 调试
- 查看日志：`/app/work/logs/bypass/`
- 查看浏览器控制台
- 使用集成页面的测试功能

### 性能优化
- 方案一支持流式输出，响应更快
- 方案二适合调用复杂配置的Bot
- 方案三适合实时推送场景

## 📞 获取帮助

如果遇到问题：
1. 查看集成文档：`/docs/COZE_INTEGRATION.md`
2. 查看项目日志：`/app/work/logs/bypass/`
3. 检查环境变量配置
4. 验证API密钥是否正确

## 🎯 适用场景

| 场景 | 推荐方案 |
|------|----------|
| 快速使用LLM能力 | 方案一：coze-coding-dev-sdk |
| 调用扣子平台独立Bot | 方案二：Bot API |
| 接收扣子平台推送 | 方案三：Webhook |
| 需要流式输出 | 方案一 |
| 复杂Bot配置 | 方案二 |
| 事件驱动应用 | 方案三 |
