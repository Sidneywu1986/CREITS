# REITs后台管理系统 - 部署指南

## 概述

本文档提供了REITs后台管理系统第一阶段生产环境必备功能的部署指南，包括：
1. Supabase Auth 集成
2. 审计日志系统
3. 权限管理功能

---

## 环境准备

### 1. Supabase 项目设置

#### 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目
3. 记录以下信息：
   - Project URL
   - Project Reference ID
   - anon public key
   - service_role key (admin)

#### 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. 执行数据库迁移

#### 方式一：使用 Supabase Dashboard

1. 访问 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `lib/supabase/schema.sql` 文件内容
4. 执行SQL脚本

#### 方式二：使用 CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 执行迁移
supabase db push
```

### 3. 验证数据库表

执行以下SQL验证表是否创建成功：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

应该包含以下表：
- `users`
- `roles`
- `permissions`
- `audit_logs`
- `login_attempts`

---

## 功能使用指南

### 1. 用户认证

#### 注册新用户

1. 访问 `/register` 页面
2. 填写注册信息：
   - 用户名
   - 邮箱
   - 密码（至少6位）
   - 角色（默认：查看者）
3. 点击注册

#### 用户登录

1. 访问 `/login` 页面
2. 输入用户名和密码
3. 点击登录

#### 密码安全特性

- 使用 PBKDF2 密钥派生
- 10000次迭代
- 随机盐值
- 安全哈希存储

#### 账户锁定策略

- 连续失败5次锁定账户
- 锁定时长：30分钟
- 成功登录后重置失败计数

### 2. 权限管理

#### 默认角色

| 角色代码 | 角色名称 | 描述 |
|---------|---------|------|
| super_admin | 超级管理员 | 拥有所有权限 |
| admin | 管理员 | 管理REITs数据和系统用户 |
| editor | 编辑 | 可以编辑REITs数据 |
| viewer | 查看者 | 只能查看数据 |
| guest | 访客 | 仅限基础数据访问 |

#### 权限管理界面

1. 访问 `/admin/permissions` 页面
2. 选择角色
3. 查看和编辑该角色的权限
4. 添加/删除权限

#### 权限检查

在组件中使用 `usePermission` Hook：

```typescript
import { usePermission } from '@/hooks/usePermission';

function MyComponent() {
  const { user, canRead, canUpdate } = usePermission();

  if (!user) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      {canRead('reits:product') && (
        <button>查看产品信息</button>
      )}
      {canUpdate('reits:product') && (
        <button>编辑产品信息</button>
      )}
    </div>
  );
}
```

### 3. 审计日志

#### 审计日志记录

系统会自动记录以下操作：
- 用户登录/登出
- 数据创建/更新/删除
- 权限变更
- 一致性检查
- 系统配置更新

#### 审计日志查询

1. 访问 `/admin/audit-logs` 页面
2. 使用筛选条件：
   - 资源类型
   - 操作类型
   - 结果（成功/失败）
3. 查看日志详情

#### 导出审计日志

点击"导出"按钮，日志将导出为CSV格式。

#### 日志保留策略

默认保留90天，可通过 `AuditLogService.cleanup()` 方法清理。

---

## API 接口说明

### 认证相关

#### 注册用户

```typescript
// 前端调用
import { registerUser } from '@/lib/supabase/auth';

const result = await registerUser(
  'username',
  'user@example.com',
  'password123',
  'roleId'
);
```

#### 用户登录

```typescript
import { loginUser } from '@/lib/supabase/auth';

const result = await loginUser('username', 'password');
```

### 审计日志相关

#### 记录审计日志

```typescript
import { AuditLogService } from '@/lib/supabase/audit-log';

await AuditLogService.log({
  userId: 'user-id',
  username: 'username',
  action: 'create',
  resourceType: 'reit_product_info',
  resourceId: 'resource-id',
  newValue: { name: 'new product' },
  result: 'success',
});
```

#### 查询审计日志

```typescript
import { AuditLogService } from '@/lib/supabase/audit-log';

const { data, total } = await AuditLogService.query({
  resourceType: 'reit_product_info',
  action: 'create',
  result: 'success',
}, 1, 50);
```

### 权限相关

#### 加载用户权限

```typescript
import { loadUserPermissions } from '@/lib/supabase/auth';

const permissions = await loadUserPermissions('role-id');
```

#### 检查用户权限

```typescript
import { checkUserPermission } from '@/lib/supabase/auth';

const hasPermission = await checkUserPermission(
  'user-id',
  'reit_product_info',
  'read'
);
```

---

## 安全最佳实践

### 1. 密码安全

- ✅ 使用 PBKDF2 密钥派生
- ✅ 10000次迭代
- ✅ 随机盐值
- ✅ 最小密码长度6位
- ✅ 账户锁定机制

### 2. 会话管理

- ✅ 使用 Supabase Auth 管理会话
- ✅ 会话自动刷新
- ✅ Token 过期处理
- ✅ 安全的本地存储

### 3. 审计日志

- ✅ 记录所有关键操作
- ✅ 包含用户IP和User-Agent
- ✅ 敏感数据加密存储
- ✅ 日志导出功能
- ✅ 定期清理旧日志

### 4. 权限控制

- ✅ 基于角色的访问控制（RBAC）
- ✅ 细粒度的权限检查
- ✅ 前端和后端双重验证
- ✅ 动态权限加载

---

## 故障排查

### 问题1：无法连接到Supabase

**解决方案**：
1. 检查 `.env.local` 文件配置
2. 验证 Supabase 项目 URL 和密钥
3. 检查网络连接

### 问题2：注册失败

**可能原因**：
- 用户名已存在
- 邮箱已被注册
- 数据库连接失败

**解决方案**：
- 检查用户名和邮箱是否唯一
- 查看浏览器控制台错误信息
- 检查 Supabase 日志

### 问题3：登录失败

**可能原因**：
- 用户名或密码错误
- 账户被锁定
- 账户被禁用

**解决方案**：
- 确认用户名和密码正确
- 等待30分钟后重试（如果被锁定）
- 联系管理员解锁账户

### 问题4：权限检查失败

**可能原因**：
- 用户未登录
- 用户角色未配置
- 权限未正确设置

**解决方案**：
- 确保用户已登录
- 检查用户角色配置
- 验证权限设置

---

## 后续优化建议

1. **增强认证**
   - 集成邮箱验证
   - 添加双因素认证（2FA）
   - 支持第三方登录（Google、GitHub等）

2. **增强审计日志**
   - 实现日志告警
   - 添加日志分析功能
   - 实现日志可视化

3. **增强权限管理**
   - 添加数据行级权限
   - 实现权限继承
   - 添加权限模板

4. **性能优化**
   - 实现权限缓存
   - 优化数据库查询
   - 添加日志索引

---

## 联系支持

如有问题，请联系：
- 开发团队：dev@example.com
- 技术支持：support@example.com

---

**版本**：v1.0.0  
**最后更新**：2024年
