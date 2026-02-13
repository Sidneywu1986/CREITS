# 扣子平台集成指南

本文档说明如何将REITs智能助手与扣子平台部署的智能体联动。

## 📚 目录

- [方案一：使用 coze-coding-dev-sdk（推荐）](#方案一使用-coze-coding-dev-sdk推荐)
- [方案二：使用扣子Bot API](#方案二使用扣子bot-api)
- [方案三：使用Webhook](#方案三使用webhook)
- [常见问题](#常见问题)

---

## 方案一：使用 coze-coding-dev-sdk（推荐）

这是当前项目已经实现的方式，SDK会自动调用扣子平台的LLM能力。

### ✅ 优点

- 无需额外配置
- 已在项目中实现
- 支持流式输出
- 支持多模态（图片、视频）
- 自动处理认证和上下文

### 🔧 使用方式

#### 1. 本地开发

SDK会自动使用默认配置，无需额外设置：

```typescript
// 已经在 src/app/api/chat/route.ts 中实现
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const config = new Config();
const client = new LLMClient(config, customHeaders);

const stream = client.stream(messages, { temperature: 0.7 });
```

#### 2. 自定义配置（可选）

如果需要自定义API密钥或模型，创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
# API密钥（可选，不设置则使用默认）
COZE_API_KEY=your_api_key_here

# API地址（可选）
COZE_API_BASE_URL=https://api.coze.com

# 超时时间（毫秒，可选）
COZE_API_TIMEOUT=30000

# 模型（可选）
COZE_MODEL=doubao-seed-1-8-251228
```

#### 3. 已实现的Agent

项目已定义6个专业Agent：

| Agent ID | 名称 | 用途 |
|----------|------|------|
| `policy` | 政策解读 Agent | 解读REITs相关政策法规 |
| `due-diligence` | 尽职调查 Agent | 分析项目风险 |
| `material` | 申报材料生成 Agent | 生成申报材料 |
| `pricing` | 定价发行建议 Agent | 提供定价建议 |
| `management` | 存续期管理 Agent | 运营管理建议 |
| `collaboration` | 智能协作 Agent | 多Agent协同 |

#### 4. 调用示例

**前端调用：**

```typescript
// 已经在 src/app/chat/[id]/page.tsx 中实现
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content
    })),
    agentId: 'policy', // 选择Agent
  }),
});
```

**后端API：**

```typescript
// 已经在 src/app/api/chat/route.ts 中实现
POST /api/chat
Body: {
  "messages": [
    { "role": "user", "content": "解释一下REITs发行流程" }
  ],
  "agentId": "policy"
}
```

---

## 方案二：使用扣子Bot API

如果你在扣子平台创建了独立的Bot，想要调用它。

### 📋 步骤

#### 1. 获取Bot信息

1. 登录扣子平台
2. 找到你的Bot
3. 获取 **Bot ID** 和 **API Token**

#### 2. 配置环境变量

创建或编辑 `.env.local`：

```bash
cp .env.local.example .env.local
```

添加Bot配置：

```env
# 政策解读Bot
COZE_POLICY_BOT_ID=7384xxxxx
COZE_POLICY_BOT_TOKEN=pat_xxxx

# 尽职调查Bot
COZE_DUE_DILIGENCE_BOT_ID=7384xxxxx
COZE_DUE_DILIGENCE_BOT_TOKEN=pat_xxxx

# 申报材料生成Bot
COZE_MATERIAL_BOT_ID=7384xxxxx
COZE_MATERIAL_BOT_TOKEN=pat_xxxx

# 定价发行建议Bot
COZE_PRICING_BOT_ID=7384xxxxx
COZE_PRICING_BOT_TOKEN=pat_xxxx

# 存续期管理Bot
COZE_MANAGEMENT_BOT_ID=7384xxxxx
COZE_MANAGEMENT_BOT_TOKEN=pat_xxxx

# 智能协作Bot
COZE_COLLABORATION_BOT_ID=7384xxxxx
COZE_COLLABORATION_BOT_TOKEN=pat_xxxx
```

#### 3. 调用API

**API端点：**

```
POST /api/bot/chat
```

**请求体：**

```json
{
  "botKey": "policy-bot",
  "message": "解释一下REITs发行流程",
  "conversationId": "optional-conversation-id"
}
```

**响应：**

```json
{
  "content": "REITs发行流程包括...",
  "conversationId": "xxx"
}
```

**前端调用示例：**

```typescript
const response = await fetch('/api/bot/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    botKey: 'policy-bot',
    message: '解释一下REITs发行流程',
  }),
});

const data = await response.json();
console.log(data.content);
```

#### 4. Bot配置映射

| 前端botKey | Agent类型 | 环境变量 |
|------------|-----------|----------|
| `policy-bot` | 政策解读 | `COZE_POLICY_BOT_ID` |
| `due-diligence-bot` | 尽职调查 | `COZE_DUE_DILIGENCE_BOT_ID` |
| `material-bot` | 申报材料生成 | `COZE_MATERIAL_BOT_ID` |
| `pricing-bot` | 定价发行建议 | `COZE_PRICING_BOT_ID` |
| `management-bot` | 存续期管理 | `COZE_MANAGEMENT_BOT_ID` |
| `collaboration-bot` | 智能协作 | `COZE_COLLABORATION_BOT_ID` |

---

## 方案三：使用Webhook

如果你希望扣子平台主动向你的应用推送消息。

### 📋 步骤

#### 1. 配置Webhook端点

Webhook端点已实现：`/api/webhook/coze`

#### 2. 在扣子平台配置Webhook

1. 登录扣子平台
2. 找到你的Bot设置
3. 配置Webhook地址：
   - **本地开发**：使用内网穿透工具（如ngrok）
     ```bash
     # 安装ngrok
     brew install ngrok  # macOS
     # 或下载：https://ngrok.com/download

     # 启动ngrok
     ngrok http 5000

     # Webhook地址为：https://xxxx-xx-xx-xx-xx.ngrok.io/api/webhook/coze
     ```
   - **生产环境**：使用实际域名
     ```
     https://your-domain.com/api/webhook/coze
     ```

#### 3. 配置签名验证（推荐）

创建 `.env.local`：

```env
COZE_WEBHOOK_SECRET=your_webhook_secret
```

更新Webhook验证逻辑（需要参考扣子平台文档）：

```typescript
// src/app/api/webhook/coze/route.ts
function verifySignature(
  body: any,
  signature: string | null,
  secret: string | undefined
): boolean {
  // 实现签名验证
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(body));
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}
```

#### 4. 测试Webhook

```bash
curl -X POST http://localhost:5000/api/webhook/coze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "data": {
      "message": "测试消息"
    }
  }'
```

---

## 常见问题

### Q1: 如何选择合适的方案？

| 场景 | 推荐方案 |
|------|----------|
| 项目已经运行，需要使用LLM能力 | 方案一：使用coze-coding-dev-sdk |
| 在扣子平台有现成的Bot，想直接调用 | 方案二：使用Bot API |
| 需要扣子平台主动推送消息 | 方案三：使用Webhook |

### Q2: API密钥从哪里获取？

**方案一（coze-coding-dev-sdk）：**
- 如果在扣子平台部署，SDK会自动获取
- 如果本地开发，SDK使用默认配置（通常无需手动设置）

**方案二（Bot API）：**
- 登录扣子平台
- 找到你的Bot
- 在Bot设置中找到API Token

### Q3: 如何测试集成？

**测试方案一：**
```bash
# 启动项目
coze dev

# 访问聊天页面
http://localhost:5000/chat/policy
```

**测试方案二：**
```bash
curl -X POST http://localhost:5000/api/bot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "botKey": "policy-bot",
    "message": "测试消息"
  }'
```

**测试方案三：**
```bash
curl -X POST http://localhost:5000/api/webhook/coze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message",
    "data": {"message": "测试消息"}
  }'
```

### Q4: 支持流式输出吗？

- ✅ **方案一**：支持，已实现SSE流式输出
- ❌ **方案二**：不支持，Bot API返回完整响应
- ❌ **方案三**：不支持，Webhook是推送模式

### Q5: 如何处理多轮对话？

**方案一：**
```typescript
// 维护对话历史
const conversationHistory = [
  { role: 'system', content: '你是一个REITs专家' },
  { role: 'user', content: '第一轮对话' },
  { role: 'assistant', content: 'AI回复' },
  { role: 'user', content: '第二轮对话' },
];

const response = await client.invoke(conversationHistory);
```

**方案二：**
```typescript
// 使用conversationId
const response1 = await callCozeBot('policy-bot', '第一轮对话');
const conversationId = response1.conversationId;

const response2 = await callCozeBot('policy-bot', '第二轮对话', conversationId);
```

### Q6: 环境变量安全注意事项

⚠️ **重要：**

1. **永远不要提交 `.env.local` 到Git仓库**
2. 使用 `.env.local.example` 作为模板
3. 在 `.gitignore` 中添加 `.env.local`

```bash
# .gitignore
.env.local
.env.production
```

4. 生产环境使用平台的环境变量管理功能

### Q7: 如何调试？

**查看日志：**

```bash
# 开发环境日志
tail -f /app/work/logs/bypass/dev.log

# 应用日志
tail -f /app/work/logs/bypass/app.log

# 浏览器控制台
# 打开浏览器开发者工具查看前端日志
```

**启用调试模式：**

```typescript
// src/app/api/chat/route.ts
console.log('Request messages:', messages);
console.log('Selected agent:', agentId);
```

### Q8: 支持哪些模型？

支持以下模型（在 `coze-coding-dev-sdk` 中）：

| 模型ID | 说明 | 适用场景 |
|--------|------|----------|
| `doubao-seed-1-8-251228` | 多模态Agent优化模型（默认） | Agent场景、多模态理解 |
| `doubao-seed-1-6-251015` | 平衡性能模型 | 通用对话 |
| `doubao-seed-1-6-flash-250615` | 快速响应模型 | 快速回复 |
| `doubao-seed-1-6-thinking-250715` | 思考模型 | 复杂推理 |
| `doubao-seed-1-6-vision-250815` | 视觉模型 | 图片/视频理解 |
| `doubao-seed-1-6-lite-251015` | 轻量级模型 | 简单任务、成本优化 |
| `deepseek-v3-2-251201` | DeepSeek V3.2模型 | 高级推理 |
| `glm-4-7-251222` | GLM-4-7模型 | 通用场景 |
| `deepseek-r1-250528` | DeepSeek R1模型 | 研究和分析 |
| `kimi-k2-250905` | Kimi K2模型 | 长文本处理 |

---

## 📞 获取帮助

如果遇到问题，可以：

1. 查看项目日志：`/app/work/logs/bypass/`
2. 查看浏览器控制台错误
3. 检查环境变量配置
4. 验证API密钥是否正确
5. 确认网络连接正常

---

## 📚 参考文档

- [coze-coding-dev-sdk TypeScript文档](/skills/public/prod/llm/typescript/README.md)
- [扣子平台官方文档](https://www.coze.cn/docs)
- [项目README](../../README.md)
