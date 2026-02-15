# 飞书集成配置指南

本文档帮助你快速配置飞书应用，实现REITs项目的审批、文档、消息功能。

## 📋 目录
1. [创建飞书应用](#1创建飞书应用)
2. [获取应用凭证](#2获取应用凭证)
3. [配置权限](#3配置权限)
4. [创建审批模板](#4创建审批模板)
5. [配置环境变量](#5配置环境变量)
6. [测试集成](#6测试集成)
7. [API参考](#7api参考)

---

## 1. 创建飞书应用

### 步骤1：登录飞书开放平台
1. 访问 https://open.feishu.cn
2. 使用飞书账号登录
3. 进入"管理后台"

### 步骤2：创建企业自建应用
1. 点击"创建企业自建应用"
2. 填写应用信息：
   - **应用名称**: `REITs智能助手`
   - **应用描述**: `REITs发行审批和协作系统`
   - **应用图标**: 上传应用图标（可选）
3. 点击"创建"
4. 复制保存以下信息：
   - **App ID**: 后续配置需要
   - **App Secret**: 后续配置需要

---

## 2. 获取应用凭证

### 步骤1：获取App ID和App Secret
1. 进入应用详情页
2. 点击左侧"凭证与基础信息"
3. 找到并复制：
   - **App ID**: 类似 `cli_xxxxxxxxxxxxxxxx`
   - **App Secret**: 点击"查看"按钮获取

### 步骤2：设置Encrypt Key和Verification Token（可选）
1. 在同一页面，向下滚动到"事件订阅"
2. 设置以下信息（用于Webhook验证）：
   - **Encrypt Key**: 点击"生成"按钮
   - **Verification Token**: 点击"生成"按钮
3. 保存这些值，后续配置需要

---

## 3. 配置权限

### 必需权限列表

进入应用详情页，点击左侧"权限管理"，申请以下权限：

#### 审批相关权限
- ✅ `approval:instance:query` - 查询审批实例
- ✅ `approval:instance:approve` - 审批通过
- ✅ `approval:instance:reject` - 审批拒绝
- ✅ `approval:instance:cancel` - 撤回审批
- ✅ `approval:instance:transfer` - 转发审批
- ✅ `approval:definition:query` - 查询审批模板

#### 消息相关权限
- ✅ `im:message` - 发送消息
- ✅ `im:message:group_at_msg` - 群组@消息
- ✅ `im:chat` - 获取群组信息
- ✅ `im:conversation` - 获取会话信息

#### 文件相关权限
- ✅ `drive:drive` - 访问云文档
- ✅ `drive:file` - 文件读写
- ✅ `drive:file:readonly` - 文件只读

#### 用户相关权限
- ✅ `contact:user.base:readonly` - 读取用户基本信息
- ✅ `contact:user.base:readonly` - 读取用户ID

### 配置权限
1. 勾选以上所有权限
2. 点击"批量开通"
3. 进入"发布管理"，点击"创建版本"
4. 填写版本信息，点击"保存"
5. 点击"申请发布"
6. 等待管理员审批通过

---

## 4. 创建审批模板

### 步骤1：创建审批模板
1. 在飞书中进入"审批"应用
2. 点击"管理后台"
3. 点击"审批模板" → "新建模板"
4. 填写模板信息：
   - **模板名称**: `REITs发行审批`
   - **审批说明**: `用于REITs发行申请的审批流程`

### 步骤2：配置表单字段
添加以下表单字段：

| 字段名称 | 字段类型 | 必填 | 说明 |
|---------|---------|------|------|
| reit_code | 单行文本 | ✅ | REITs代码 |
| reit_name | 单行文本 | ✅ | REITs名称 |
| fund_manager | 单行文本 | ✅ | 基金管理人 |
| total_assets | 数字 | ✅ | 募集规模（亿元） |
| approval_type | 单选 | ✅ | 审批类型 |
| project_description | 多行文本 | ❌ | 项目描述 |
| risk_assessment | 多行文本 | ❌ | 风险评估 |

### 步骤3：配置审批流程
设置审批节点：
- **节点1**: 部门主管审批
- **节点2**: 风控审批
- **节点3**: 财务审批
- **节点4**: 最终审批

### 步骤4：获取模板代码
1. 保存模板
2. 在模板详情页找到"模板代码"
3. 复制保存（类似 `APPROVAL_CODE_xxxxxxxxxxxxxxxx`）

---

## 5. 配置环境变量

### 编辑环境变量文件
在项目根目录的 `.env.local` 文件中添加：

```bash
# ============================================
# 飞书集成配置（文档和审批功能）
# ============================================

# 飞书应用ID（必需）
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx

# 飞书应用密钥（必需）
FEISHU_APP_SECRET=your_app_secret_here

# 飞书加密密钥（可选，用于Webhook验证）
# FEISHU_ENCRYPT_KEY=your_encrypt_key_here

# 飞书验证令牌（可选，用于Webhook验证）
# FEISHU_VERIFICATION_TOKEN=your_verification_token_here

# REITs审批模板代码（必需，用于审批功能）
# FEISHU_REITS_APPROVAL_CODE=APPROVAL_CODE_xxxxxxxxxxxxxxxx

# 飞书文档文件夹token（可选，用于存储申报材料）
# FEISHU_DOCUMENT_FOLDER_TOKEN=your_folder_token_here
```

### 替换实际值
将以下占位符替换为你的实际值：
- `cli_xxxxxxxxxxxxxxxx` → 你的App ID
- `your_app_secret_here` → 你的App Secret
- `APPROVAL_CODE_xxxxxxxxxxxxxxxx` → 审批模板代码
- `your_encrypt_key_here` → Encrypt Key（如果配置了Webhook）
- `your_verification_token_here` → Verification Token（如果配置了Webhook）
- `your_folder_token_here` → 文档文件夹token（可选）

---

## 6. 测试集成

### 测试1：验证飞书配置
```bash
# 运行测试脚本
npm run test:feishu

# 或手动测试
node scripts/test-feishu-connection.js
```

### 测试2：发送消息
在浏览器Console中执行：
```javascript
import { sendTextMessage } from '@/lib/services/feishu/message';

// 发送测试消息
await sendTextMessage(
  'your_user_id', // 替换为你的飞书user_id
  'open_id',
  '这是一条来自REITs智能助手的测试消息'
);
```

### 测试3：创建审批
```javascript
import { createREITsApproval } from '@/lib/services/feishu/approval';

// 创建测试审批
await createREITsApproval({
  userId: 'your_user_id',
  reitCode: '508000.SH',
  reitName: '沪杭甬高速REIT',
  fundManager: '浙江沪杭甬高速公路股份有限公司',
  totalAssets: 50.00,
  approverIds: ['approver_user_id_1', 'approver_user_id_2'],
});
```

### 测试4：上传文档
```javascript
import { uploadFile } from '@/lib/services/feishu/document';

// 上传测试文档
const file = new File(['test content'], 'test.txt');
const fileInfo = await uploadFile(file, 'test.txt');
console.log('文件上传成功:', fileInfo);
```

---

## 7. API参考

### 审批服务 (`src/lib/services/feishu/approval.ts`)

#### 创建审批实例
```typescript
import { createREITsApproval } from '@/lib/services/feishu/approval';

const instance = await createREITsApproval({
  userId: 'user_id',
  reitCode: '508000.SH',
  reitName: 'REITs名称',
  fundManager: '基金管理人',
  totalAssets: 50.00,
  approverIds: ['approver_1', 'approver_2'],
});
```

#### 查询审批实例
```typescript
import { getApprovalInstance } from '@/lib/services/feishu/approval';

const instance = await getApprovalInstance('instance_code');
```

#### 审批通过/拒绝
```typescript
import { approveInstance, rejectInstance } from '@/lib/services/feishu/approval';

// 通过
await approveInstance({
  instanceCode: 'instance_code',
  nodeId: 'node_id',
  userId: 'user_id',
  comment: '审批通过',
});

// 拒绝
await rejectInstance({
  instanceCode: 'instance_code',
  nodeId: 'node_id',
  userId: 'user_id',
  comment: '拒绝原因',
});
```

### 消息服务 (`src/lib/services/feishu/message.ts`)

#### 发送文本消息
```typescript
import { sendTextMessage } from '@/lib/services/feishu/message';

await sendTextMessage('user_id', 'open_id', '消息内容');
```

#### 发送审批通知
```typescript
import { sendApprovalNotification } from '@/lib/services/feishu/message';

await sendApprovalNotification({
  receiveId: 'user_id',
  idType: 'open_id',
  approvalTitle: 'REITs发行审批',
  approvalCode: 'approval_code',
  reitName: 'REITs名称',
  fundManager: '基金管理人',
  status: 'PENDING',
});
```

#### 发送风险预警
```typescript
import { sendRiskAlert } from '@/lib/services/feishu/message';

await sendRiskAlert({
  receiveId: 'user_id',
  idType: 'open_id',
  reitCode: '508000.SH',
  reitName: 'REITs名称',
  riskType: '出租率下降',
  riskLevel: 'HIGH',
  description: '本月出租率下降至85%...',
  recommendation: '建议加强租赁推广...',
});
```

### 文档服务 (`src/lib/services/feishu/document.ts`)

#### 上传文件
```typescript
import { uploadFile } from '@/lib/services/feishu/document';

const file = new File([...], 'document.pdf');
const fileInfo = await uploadFile(file, 'document.pdf');
```

#### 创建文档
```typescript
import { createREITsMaterialDocument } from '@/lib/services/feishu/document';

await createREITsMaterialDocument({
  reitCode: '508000.SH',
  reitName: 'REITs名称',
  materialType: '尽职调查报告',
  materialContent: '文档内容...',
});
```

---

## ✅ 配置检查清单

完成以下检查，确认配置成功：

- [ ] 已创建飞书应用
- [ ] 已获取App ID和App Secret
- [ ] 已配置所有必需权限
- [ ] 已创建审批模板
- [ ] 已在`.env.local`中配置环境变量
- [ ] 已测试消息发送
- [ ] 已测试审批创建
- [ ] 已测试文档上传

---

## 🔐 安全提示

⚠️ **重要安全事项**：

1. **不要提交敏感信息到Git仓库**
   ```bash
   # .gitignore中已包含
   .env.local
   .env.*.local
   ```

2. **权限最小化原则**
   - 只申请必需的权限
   - 定期审查权限使用情况
   - 生产环境使用最小权限账号

3. **Webhook验证**
   - 生产环境必须配置Encrypt Key和Verification Token
   - 验证所有Webhook请求的签名

4. **日志脱敏**
   - 不要记录敏感信息（user_id、access_token等）
   - 使用日志级别控制敏感信息输出

---

## 📞 需要帮助？

如果遇到问题：
1. 查看飞书开放平台文档：https://open.feishu.cn/document
2. 查看项目日志：`/app/work/logs/bypass/app.log`
3. 检查权限配置是否正确
4. 检查环境变量配置是否正确

---

## 📚 相关文档

- [飞书开放平台官方文档](https://open.feishu.cn/document)
- [飞书审批API文档](https://open.feishu.cn/document/server-docs/approval-v4)
- [飞书消息API文档](https://open.feishu.cn/document/server-docs/im/message-v1)
- [飞书文档API文档](https://open.feishu.cn/document/server-docs/docs/docs/)
- [Supabase配置指南](supabase-setup-guide.md)
- [数据迁移指南](migration-guide.md)
