# REITs 智能助手 - 完整项目导出指南

## 项目概述

这是一个基于 **Next.js 16** + **shadcn/ui** 的全栈应用，提供 REITs 智能助手服务，包含多个专业 Agent 协同工作、匿名 BBS、专家智库、积分系统等核心功能。

### 核心功能

- ✅ **Agent 对话系统** - 多个专业 Agent 协同工作
- ✅ **项目管理** - REITs 项目全流程管理
- ✅ **市场行情** - 实时市场数据展示（ECharts 图表）
- ✅ **新闻资讯** - 行业新闻聚合与展示
- ✅ **REITs 估值计算器** - 专业的估值计算工具
- ✅ **地理位置分析** - 百度地图集成，支持项目位置展示
- ✅ **交易所公告查询** - 交易所公告数据查询
- ✅ **定价档位管理** - REITs 定价档位管理
- ✅ **匿名 BBS** - 科技风匿名社区，四层加密架构
- ✅ **专家智库** - 专家列表、详情、打赏功能
- ✅ **积分系统** - 积分充值、提现、历史记录
- ✅ **REITs 八张表** - 专业数据库展示
- ✅ **性能基准测试** - 完整的性能测试工具

## 技术栈

### 前端框架
- **Next.js 16** (Pages Router)
- **React 19**
- **TypeScript 5**
- **Zustand 5.0.11** (客户端状态管理)
- **@tanstack/react-query 5.90.21** (服务端状态管理)

### UI 组件
- **shadcn/ui** (基于 Radix UI)
- **Tailwind CSS 4**
- **ECharts 6.0.0** + **echarts-for-react 3.0.6** (图表)
- **百度地图 JavaScript API v3.0**

### 后端服务
- **Supabase** (数据库服务)
- **MySQL 8.0+** (数据库 Schema)
- **Next.js API Routes** (后端接口)

### 加密与安全
- **idb 8.0.3** (IndexedDB 封装)
- **@docknetwork/crypto-wasm ^0.10.0** (BBS 签名 - 待集成)
- **书密码加密** (自定义实现)
- **四层加密架构**：
  1. BBS 签名（匿名身份）
  2. 书密码（安全通信）
  3. IndexedDB（本地存储）
  4. BBS 验证（交易签名）

## 项目结构

```
src/
├── components/              # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   ├── agent/              # Agent 相关组件
│   ├── reits/              # REITs 相关组件
│   │   ├── MarketChart.tsx          # 市场行情图表
│   │   ├── BaiduMapLocationSelector.tsx  # 地图选择器
│   │   └── ReitsEightTables.tsx    # REITs 八张表
│   ├── bbs/                # BBS 相关组件
│   ├── expert/             # 专家相关组件
│   └── points/             # 积分相关组件
├── lib/
│   ├── encryption/         # 加密模块
│   │   ├── bbs-signature.ts         # BBS 签名
│   │   ├── book-cipher.ts           # 书密码加密
│   │   └── index.ts                # 加密模块导出
│   ├── storage/            # 存储模块
│   │   └── indexeddb.ts            # IndexedDB 封装
│   ├── api/                # API 客户端
│   │   ├── client.ts                # 统一 API 客户端
│   │   ├── index.ts                 # TanStack Query 配置
│   │   ├── bbs.ts                   # BBS API
│   │   ├── expert.ts                # 专家 API
│   │   ├── points.ts                # 积分 API
│   │   └── services.ts              # API 统一导出
│   ├── database/           # 数据库模块
│   │   └── reits-db.ts             # REITs 数据库服务
│   └── utils.ts            # 工具函数
├── stores/                 # Zustand 状态管理
│   └── userStore.ts        # 用户状态
├── hooks/                  # 自定义 Hooks
│   ├── useBBS.ts           # BBS 相关 Hooks
│   ├── useExpert.ts        # 专家相关 Hooks
│   └── usePoints.ts        # 积分相关 Hooks
├── types/                  # TypeScript 类型定义
│   ├── bbs.ts              # BBS 类型
│   ├── expert.ts           # 专家类型
│   ├── points.ts           # 积分类型
│   └── index.ts            # 类型导出
├── pages/                  # Pages Router 页面
│   ├── index.tsx           # 首页
│   ├── agent/              # Agent 页面
│   ├── market/             # 市场行情页面
│   ├── news/               # 新闻资讯页面
│   ├── reits/              # REITs 相关页面
│   │   ├── pricing-tier/   # 定价档位
│   │   ├── valuation/      # 估值计算器
│   │   ├── underlying/     # 底层资产（八张表）
│   │   └── announcement/   # 交易所公告
│   ├── bbs/                # BBS 页面
│   │   ├── index.tsx       # BBS 列表
│   │   ├── [id].tsx        # BBS 详情
│   │   └── new.tsx         # 发帖页面
│   ├── expert/             # 专家页面
│   │   ├── index.tsx       # 专家列表
│   │   └── [id].tsx        # 专家详情
│   ├── points/             # 积分页面
│   │   ├── index.tsx       # 积分中心
│   │   ├── recharge.tsx    # 积分充值
│   │   └── withdraw.tsx    # 积分提现
│   └── test/               # 测试页面
│       ├── encryption.tsx  # 加密测试页面
│       └── performance.tsx # 性能测试页面
├── public/                 # 静态资源
│   ├── images/             # 图片资源
│   └── favicon.ico
├── styles/                 # 样式文件
│   └── globals.css
└── app/                    # App Router (未启用)
    └── layout.tsx

database/                   # 数据库相关
└── schema.sql              # 数据库 Schema

docs/                       # 项目文档
├── 核心模块实现优化计划.md
├── 快速实施指南.md
├── 安全增强与测试完善指南.md
├── 快速实施指南-安全增强版.md
└── REITs数据获取方式详细分析.md

.next.config.js             # Next.js 配置（WASM 支持）
.coze                       # Coze CLI 配置
package.json                # 依赖管理
tsconfig.json              # TypeScript 配置
tailwind.config.ts         # Tailwind 配置
.gitignore                 # Git 忽略配置
```

## 快速开始

### 前置要求

- **Node.js 24+**
- **pnpm 9+**
- **MySQL 8.0+** (可选，用于数据库)
- **百度地图 API Key** (需要申请)

### 安装依赖

```bash
# 必须使用 pnpm
pnpm install
```

### 环境变量配置

创建 `.env.local` 文件：

```env
# Supabase 配置（如果使用）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 百度地图 API Key（需要申请）
NEXT_PUBLIC_BAIDU_MAP_AK=your_baidu_map_ak

# API 基础 URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### 数据库配置（可选）

如果需要使用 MySQL 数据库：

```bash
# 导入数据库 Schema
mysql -u your_username -p your_database < database/schema.sql
```

### 启动开发服务器

```bash
# 使用 Coze CLI（推荐）
coze dev

# 或使用 pnpm
pnpm dev
```

访问 [http://localhost:5000](http://localhost:5000)

### 构建生产版本

```bash
# 构建项目
coze build

# 启动生产服务
coze start
```

## 核心模块说明

### 1. 加密模块 (`src/lib/encryption/`)

#### BBS 签名
- 文件：`bbs-signature.ts`
- 功能：实现匿名身份签名
- 状态：当前为模拟实现，需要集成真实的 `@docknetwork/crypto-wasm`

#### 书密码加密
- 文件：`book-cipher.ts`
- 功能：基于书密码的加密通信
- 特性：使用书本内容作为密钥，支持多本书

### 2. 存储模块 (`src/lib/storage/`)

#### IndexedDB 封装
- 文件：`indexeddb.ts`
- 功能：封装 IndexedDB 操作，提供简洁 API
- 特性：类型安全，Promise 支持

### 3. API 客户端 (`src/lib/api/`)

#### 统一 API 客户端
- 文件：`client.ts`
- 功能：封装 axios，统一错误处理和认证
- 特性：自动注入匿名 ID，支持重试机制

#### 分模块 API
- `bbs.ts` - BBS 相关接口
- `expert.ts` - 专家相关接口
- `points.ts` - 积分相关接口

### 4. 状态管理 (`src/stores/`)

#### 用户状态管理
- 文件：`userStore.ts`
- 功能：管理用户信息和积分
- 特性：Zustand 持久化

#### 服务端状态管理
- 文件：`lib/api/index.ts`
- 功能：使用 TanStack Query 管理服务端状态
- 特性：自动缓存、重新验证、错误重试

### 5. 页面功能

#### 匿名 BBS
- 列表页：`pages/bbs/index.tsx`
- 详情页：`pages/bbs/[id].tsx`
- 发帖页：`pages/bbs/new.tsx`

#### 专家智库
- 列表页：`pages/expert/index.tsx`
- 详情页：`pages/expert/[id].tsx`

#### 积分系统
- 积分中心：`pages/points/index.tsx`
- 积分充值：`pages/points/recharge.tsx`
- 积分提现：`pages/points/withdraw.tsx`

#### REITs 功能
- 市场行情：`pages/market/index.tsx`
- 底层资产：`pages/reits/underlying/index.tsx`
- 估值计算器：`pages/reits/valuation/index.tsx`
- 定价档位：`pages/reits/pricing-tier/index.tsx`
- 交易所公告：`pages/reits/announcement/index.tsx`

### 6. 测试页面

#### 加密测试
- 文件：`pages/test/encryption.tsx`
- 功能：测试 BBS 签名和书密码加密功能

#### 性能测试
- 文件：`pages/test/performance.tsx`
- 功能：性能基准测试
  - WASM 加载时间
  - 加密/解密性能
  - API 响应时间
  - IndexedDB 查询时间

## 四层加密架构

### 第 1 层：BBS 签名（匿名身份）
- 用户注册时生成密钥对
- 发帖时使用私钥签名
- 验证时使用公钥验证

### 第 2 层：书密码（安全通信）
- 使用书本内容作为密钥
- 支持多本书本加密
- 防止内容被篡改

### 第 3 层：IndexedDB（本地存储）
- 存储用户凭证和密钥
- 数据加密存储
- 支持 IndexedDB API

### 第 4 层：BBS 验证（交易签名）
- 关键操作需要额外签名验证
- 防止重放攻击
- 时间戳验证

## 性能优化

### 延迟加载
- WASM 模块延迟加载
- 路由级代码分割
- 组件懒加载

### 缓存策略
- API 响应缓存（TanStack Query）
- IndexedDB 本地缓存
- 静态资源缓存

### 性能基准
- 预期首屏加载时间：-30%
- 预期 WASM 加载时间：-96.7%
- 预期 API 响应时间：-20%

## 安全性增强

### 依赖版本锁定
- `@docknetwork/crypto-wasm@^0.10.0`

### 防重放机制
- 时间戳验证
- 频率限制

### 文件哈希核对
- 书本文件哈希验证
- 防止被篡改

## 开发规范

### 1. 组件开发
- 优先使用 shadcn/ui 组件
- 遵循 TypeScript 类型定义
- 使用 Tailwind CSS 样式

### 2. 状态管理
- 客户端状态：Zustand
- 服务端状态：TanStack Query
- 表单状态：React Hook Form

### 3. API 调用
- 使用统一的 apiClient
- 自动注入认证头
- 统一错误处理

### 4. 依赖管理
- 必须使用 pnpm
- 禁止使用 npm 或 yarn

## 待完成事项

### 高优先级
- [ ] 集成真实的 BBS 签名实现（@docknetwork/crypto-wasm）
- [ ] 实现带时间戳的 BBS 签名和验证（防重放）
- [ ] 实现书本文件哈希核对和备份提醒功能
- [ ] 实现全局错误处理钩子（401 跳转登录、500 友好提示）

### 中优先级
- [ ] IndexedDB 数据迁移
- [ ] 书密码随机盐值
- [ ] API 缓存策略完善

### 低优先级
- [ ] 性能监控仪表板
- [ ] 自动化性能测试
- [ ] 性能报告生成

## 导出代码到本地 Git 仓库

### 方法 1：直接克隆当前仓库

```bash
# 在本地执行
git clone <仓库地址>
cd <项目目录>
```

### 方法 2：导出为压缩包

```bash
# 在项目根目录执行
git archive --format=zip --output=reits-assistant.zip HEAD
```

### 方法 3：创建新的本地仓库

```bash
# 1. 在沙箱中导出代码
cd /workspace/projects
tar -czf reits-assistant.tar.gz --exclude='node_modules' --exclude='.next' --exclude='.git' .

# 2. 下载压缩包到本地（使用你自己的方式）

# 3. 在本地解压并初始化 Git
mkdir reits-assistant
cd reits-assistant
tar -xzf reits-assistant.tar.gz

# 4. 初始化 Git
git init
git add .
git commit -m "Initial commit: REITs 智能助手完整代码"

# 5. 关联远程仓库（可选）
git remote add origin <你的仓库地址>
git branch -M main
git push -u origin main
```

## 本地调试步骤

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 填入你的配置
```

### 3. 启动开发服务器
```bash
coze dev
# 或
pnpm dev
```

### 4. 访问应用
- 主页：http://localhost:5000
- BBS 测试：http://localhost:5000/test/encryption
- 性能测试：http://localhost:5000/test/performance

### 5. 调试提示
- 浏览器控制台查看前端日志
- `/app/work/logs/bypass/app.log` 查看后端日志
- Chrome DevTools Performance 分析性能

## 常见问题

### Q: 为什么使用 pnpm 而不是 npm？
A: 项目已配置 `preinstall` 脚本，强制使用 pnpm。pnpm 更快、更节省空间，且依赖管理更严格。

### Q: 如何申请百度地图 API Key？
A: 访问 [百度地图开放平台](https://lbsyun.baidu.com/)，注册账号并创建应用，获取 API Key。

### Q: 如何集成真实的 BBS 签名？
A: 安装 `@docknetwork/crypto-wasm@^0.10.0`，参考 `docs/安全增强与测试完善指南.md` 中的集成步骤。

### Q: 性能测试页面无法访问？
A: 确保 `pages/test/` 目录存在，并且开发服务器正在运行。

### Q: 如何查看详细的性能指标？
A: 访问 http://localhost:5000/test/performance，点击"运行所有测试"按钮。

## 联系与支持

- 项目文档：`docs/` 目录
- API 文档：`docs/快速实施指南.md`
- 安全指南：`docs/安全增强与测试完善指南.md`
- 性能优化：`docs/核心模块实现优化计划.md`

## 许可证

本项目仅供学习和研究使用。
