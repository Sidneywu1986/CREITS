# 飞书集成使用指南

## 📚 目录

- [功能概览](#功能概览)
- [前置准备](#前置准备)
- [配置步骤](#配置步骤)
- [使用说明](#使用说明)
- [API文档](#api文档)
- [常见问题](#常见问题)

---

## 功能概览

### 1. 飞书文档集成
- ✅ 自动创建飞书文档
- ✅ 写入REITs报告内容
- ✅ 生成文档链接

### 2. 飞书审批集成
- ✅ 创建REITs项目审批
- ✅ 查询审批状态
- ✅ 获取审批详情

---

## 前置准备

### 1. 注册飞书开发者账号

1. 访问 [飞书开放平台](https://open.feishu.cn)
2. 注册并登录

### 2. 创建飞书应用

1. 进入"创建企业自建应用"
2. 填写应用信息：
   - **应用名称**：REITs智能助手
   - **应用描述**：REITs项目管理和智能分析系统
3. 创建完成后，记录以下信息：
   - App ID
   - App Secret

### 3. 配置应用权限

进入应用设置，申请以下权限：

#### 文档集成权限
- `docx:document` - 文档管理权限
- `drive:drive` - 云空间权限

#### 审批集成权限
- `approval:approval` - 审批管理权限
- `approval:approval:instance` - 审批实例权限

---

## 配置步骤

### 1. 配置环境变量

复制环境变量模板：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# 飞书应用配置
FEISHU_APP_ID=cli_xxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 可选配置
FEISHU_ENCRYPT_KEY=xxxxxxxx
FEISHU_VERIFICATION_TOKEN=xxxxxxxx
```

**获取 App ID 和 App Secret：**
1. 进入飞书应用详情页
2. 点击"凭证与基础信息"
3. 复制 App ID 和 App Secret

### 2. 创建审批模板（审批功能）

1. 进入飞书审批后台
2. 创建审批模板
3. 配置表单字段：
   - `project_name` - 项目名称（文本）
   - `project_type` - 项目类型（文本）
   - `project_amount` - 项目金额（数字）
   - `project_manager` - 项目负责人（成员）
   - `description` - 项目描述（多行文本）
4. 配置审批流程
5. 获取审批模板代码（`approval_code`）
6. 添加到环境变量：

```env
FEISHU_REITS_APPROVAL_CODE=REITS_APPROVAL_TEMPLATE_CODE
```

---

## 使用说明

### 方式1：使用管理界面

访问飞书集成页面：http://localhost:5000/feishu

#### 创建文档

1. 点击"文档集成"标签
2. 填写文档标题和内容
3. 点击"创建文档"
4. 获取文档链接

#### 创建审批

1. 点击"审批集成"标签
2. 填写项目信息：
   - 项目名称
   - 项目类型
   - 项目金额（万元）
   - 项目负责人
   - 项目描述
3. 点击"发起审批"
4. 获取审批链接

### 方式2：使用API

#### 创建文档

```typescript
const response = await fetch('/api/feishu/document/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'REITs项目尽职调查报告',
    content: '文档内容...',
  }),
});

const data = await response.json();
console.log(data.document.url);
```

#### 创建审批

```typescript
const response = await fetch('/api/feishu/approval/reits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectName: 'XX商业地产REITs',
    projectType: 'C-REITs',
    projectAmount: 50000,
    projectManager: '张三',
    description: '项目描述...',
  }),
});

const data = await response.json();
console.log(data.instance.url);
```

---

## API文档

### 文档API

#### 创建文档

**POST** `/api/feishu/document/create`

**请求体：**
```json
{
  "title": "文档标题",
  "content": "文档内容"
}
```

**响应：**
```json
{
  "success": true,
  "document": {
    "documentId": "doxxxxxxxxxxxx",
    "title": "文档标题",
    "url": "https://feishu.cn/doc/doxxxxxxxxxxxx"
  }
}
```

### 审批API

#### 创建审批实例

**POST** `/api/feishu/approval/reits`

**请求体：**
```json
{
  "projectName": "XX商业地产REITs",
  "projectType": "C-REITs",
  "projectAmount": 50000,
  "projectManager": "张三",
  "description": "项目描述"
}
```

**响应：**
```json
{
  "success": true,
  "instance": {
    "instanceId": "xxxxxxxx",
    "status": "RUNNING",
    "approvalCode": "REITS_APPROVAL",
    "title": "REITs项目审批：XX商业地产REITs",
    "url": "https://feishu.cn/approval/approval/view/xxxxxxxx"
  }
}
```

#### 查询审批状态

**GET** `/api/feishu/approval/instances/{instanceId}`

**响应：**
```json
{
  "success": true,
  "status": {
    "instanceId": "xxxxxxxx",
    "status": "APPROVED",
    "approvalCode": "REITS_APPROVAL"
  },
  "detail": {
    // 审批详情
  }
}
```

---

## 常见问题

### 1. 如何获取飞书应用凭证？

1. 进入飞书开放平台
2. 选择你的应用
3. 点击"凭证与基础信息"
4. 复制 App ID 和 App Secret

### 2. 如何创建审批模板？

1. 进入飞书审批后台
2. 点击"创建审批模板"
3. 配置表单字段和审批流程
4. 启用模板并获取 approval_code

### 3. 权限不足怎么办？

确保应用已申请以下权限：
- `docx:document` - 文档权限
- `approval:approval` - 审批权限

在应用管理中点击"权限管理"进行申请。

### 4. API调用失败？

检查以下几点：
- ✅ 环境变量配置正确
- ✅ 应用权限已申请并通过
- ✅ 网络连接正常
- ✅ 凭证未过期

### 5. 如何测试集成功能？

1. 访问 http://localhost:5000/feishu
2. 使用管理界面测试创建文档和审批
3. 查看操作日志
4. 点击生成的链接验证结果

---

## 安全注意事项

⚠️ **重要提醒：**

1. **不要提交敏感信息**
   - 永远不要将 `.env.local` 提交到 Git
   - 使用 `.env.local.example` 作为模板

2. **保护应用凭证**
   - 不要在前端代码中使用 App Secret
   - 只在后端API中使用
   - 定期更换密钥

3. **权限最小化原则**
   - 只申请必要的权限
   - 定期审查权限使用情况

---

## 进阶使用

### 1. 批量创建文档

```typescript
const documents = await Promise.all(
  reports.map(report =>
    fetch('/api/feishu/document/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: report.title,
        content: report.content,
      }),
    }).then(res => res.json())
  )
);
```

### 2. 定时创建报告

使用定时任务定期生成报告并推送到飞书文档：

```typescript
// 每周一早上9点生成报告
cron.schedule('0 9 * * 1', async () => {
  const report = await generateWeeklyReport();
  const document = await createFeishuDocument(
    '周报：' + report.date,
    report.content
  );
  console.log('报告已生成：', document.url);
});
```

### 3. 审批状态监控

```typescript
// 监控审批状态
setInterval(async () => {
  const status = await getApprovalInstanceStatus(instanceId);
  if (status === 'APPROVED') {
    console.log('审批已通过');
    // 执行后续操作
  }
}, 60000); // 每分钟检查一次
```

---

## 技术支持

如果遇到问题：

1. 查看日志：`/app/work/logs/bypass/`
2. 检查环境变量配置
3. 验证飞书应用权限
4. 查看飞书开放平台文档：https://open.feishu.cn/document/

---

## 更新日志

- **2025-02-13** - 初始版本
  - 实现文档集成功能
  - 实现审批集成功能
  - 提供管理界面
