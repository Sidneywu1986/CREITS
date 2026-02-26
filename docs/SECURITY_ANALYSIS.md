# 安全智能分析功能文档

## 概述

安全智能分析模块提供了自动化的安全监控和告警功能，帮助管理员实时发现和响应安全威胁。

## 核心功能

### 1. SecurityAgent 服务

位置：`lib/security/security-agent.ts`

**功能：**
- 分析登录模式异常（暴力破解、非常规时间、多IP登录）
- 分析权限异常（频繁权限拒绝）
- 运行完整安全分析并存储告警

**检测规则：**

#### 登录模式异常

1. **暴力破解**
   - 同一IP 5次以上失败登录 → 高危
   - 同一IP 10次以上失败登录 → 严重

2. **非常规时间登录**
   - 凌晨0-6点3次以上成功登录 → 中危

3. **多IP异常登录**
   - 同一用户从3个以上不同IP登录 → 中危

#### 权限异常

1. **权限异常**
   - 24小时内5次以上权限拒绝（更新/删除操作） → 高危

### 2. 异常告警服务

位置：`lib/notification/alerter.ts`

**功能：**
- 发送飞书告警（使用webhook）
- 发送邮件告警
- 支持自定义告警配置

**使用方式：**

```typescript
import { SecurityAlerter } from '@/lib/notification/alerter'

const alerter = new SecurityAlerter({
  type: 'feishu',
  webhookUrl: process.env.NEXT_PUBLIC_FEISHU_WEBHOOK
})

await alerter.send(alert)
```

### 3. 安全仪表盘

位置：`pages/admin/security.tsx`

**功能：**
- 实时显示安全告警统计
- 按时间范围筛选告警
- 查看告警详情
- 确认和解决告警
- 手动运行安全分析

**权限要求：**
- 需要 `system:security` 权限才能查看仪表盘
- 需要 `system:analyze` 权限才能运行分析

## 数据库表

### security_alerts

```sql
CREATE TABLE security_alerts (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES users(id),
  ip_address VARCHAR(50),
  details JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**字段说明：**
- `type`: 告警类型（bruteforce, unusual_time, multiple_ips, permission_escalation）
- `severity`: 严重级别（critical, high, medium, low）
- `status`: 状态（new, acknowledged, resolved）
- `details`: 告警详情（JSON格式，包含失败次数、IP数量等）

## API 接口

### POST /api/admin/security/analyze

运行安全分析

**请求：**
```http
POST /api/admin/security/analyze
Content-Type: application/json
```

**响应：**
```json
{
  "success": true,
  "alerts": [...],
  "summary": {
    "total": 5,
    "critical": 1,
    "high": 2,
    "medium": 2,
    "low": 0
  }
}
```

## 配置说明

### 环境变量

```env
# 飞书告警 Webhook
NEXT_PUBLIC_FEISHU_WEBHOOK=https://open.feishu.cn/open-apis/bot/v2/hook/...

# 应用URL（用于告警链接）
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 飞书 Webhook 配置

1. 在飞书群设置中创建机器人
2. 获取 Webhook URL
3. 将 URL 配置到环境变量 `NEXT_PUBLIC_FEISHU_WEBHOOK`
4. 高危和严重告警会自动发送到飞书群

## 使用指南

### 1. 查看安全仪表盘

1. 登录系统
2. 点击侧边栏「系统管理」→「安全分析」
3. 查看实时告警列表和统计数据

### 2. 手动运行分析

1. 在安全仪表盘页面
2. 选择时间范围（1小时、24小时、7天）
3. 点击「运行分析」按钮
4. 等待分析完成，系统会自动更新告警列表

### 3. 处理告警

1. 在告警列表中找到待处理的告警
2. 点击「确认」按钮将状态改为「已确认」
3. 处理完安全问题后，点击「解决」按钮将状态改为「已解决」

### 4. 自动告警

- 高危（high）和严重（critical）告警会自动发送到飞书群
- 管理员可以点击飞书消息中的链接直接跳转到安全仪表盘

## 最佳实践

1. **定期运行分析**
   - 建议每天至少运行一次安全分析
   - 对于高风险时期，可以每小时运行一次

2. **及时处理告警**
   - 优先处理严重和高危告警
   - 定期查看并解决所有待处理告警

3. **监控异常模式**
   - 关注频繁失败的IP地址
   - 注意非常规时间的登录行为
   - 监控多IP登录的用户

4. **告警通知**
   - 配置飞书 webhook 实现实时通知
   - 根据团队需求调整告警接收人

## 技术架构

```
┌─────────────────┐
│   前端页面      │
│  /admin/security │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API 路由      │
│  /api/admin/    │
│  security/analyze│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SecurityAgent   │
│  - 分析登录模式 │
│  - 分析权限异常 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   数据库        │
│ security_alerts │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ SecurityAlerter │
│  - 飞书通知     │
│  - 邮件通知     │
└─────────────────┘
```

## 扩展建议

### 1. 定时任务

建议使用 cron 或 Vercel Cron Jobs 定期自动运行分析：

```javascript
// 可以集成到 pages/api/cron/security.ts
export default async function handler(req, res) {
  // 每天凌晨3点运行
  const agent = new SecurityAgent()
  await agent.runFullAnalysis()
}
```

### 2. 实时监控

使用 Supabase Realtime 监听新告警：

```javascript
const subscription = supabase
  .channel('security_alerts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'security_alerts'
  }, (payload) => {
    // 实时处理新告警
  })
  .subscribe()
```

### 3. 自定义检测规则

可以根据业务需求添加更多检测规则：

- 异常文件访问
- 敏感数据导出
- 批量操作检测
- 账户信息变更

## 故障排查

### 问题1: 飞书告警未发送

**原因：**
- Webhook URL 配置错误
- Webhook 已失效
- 网络问题

**解决：**
- 检查环境变量 `NEXT_PUBLIC_FEISHU_WEBHOOK`
- 重新获取 Webhook URL
- 检查网络连接

### 问题2: 分析无告警

**原因：**
- 没有足够的登录数据
- 检测阈值设置过高
- 时间范围选择不当

**解决：**
- 积累更多登录数据
- 调整检测阈值
- 扩大时间范围

### 问题3: 页面加载失败

**原因：**
- 权限不足
- 数据库连接问题
- Supabase 客户端配置错误

**解决：**
- 确认用户有 `system:security` 权限
- 检查数据库连接
- 验证 Supabase 配置
