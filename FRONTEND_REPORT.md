# REITs智能助手 - 前端技术报告

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [页面路由](#页面路由)
- [组件架构](#组件架构)
- [核心功能模块](#核心功能模块)
- [依赖分析](#依赖分析)
- [样式方案](#样式方案)
- [集成服务](#集成服务)
- [开发规范](#开发规范)
- [构建与部署](#构建与部署)
- [性能优化](#性能优化)

---

## 📖 项目概述

### 基本信息

| 项目信息 | 详情 |
|---------|------|
| **项目名称** | REITs智能助手 |
| **版本** | 0.1.0 |
| **框架** | Next.js 16.1.1 (Pages Router) |
| **UI框架** | React 19.2.3 |
| **语言** | TypeScript 5 |
| **包管理器** | pnpm 9.0.0 |
| **端口** | 5000 |

### 项目描述

基于Next.js的REITs智能助手Web应用，提供：
- 多Agent协同工作的REITs发行全流程服务
- REITs和ABS产品数据展示与管理
- 市场行情、新闻资讯、估值计算等功能
- 专业的八张表数据展示系统
- 匿名BBS社区交流平台

---

## 🛠️ 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.1.1 | React框架，支持SSR和路由 |
| **React** | 19.2.3 | UI库 |
| **TypeScript** | 5 | 类型安全 |
| **pnpm** | 9.0.0 | 包管理器 |

### UI组件库

| 技术 | 版本 | 说明 |
|------|------|------|
| **shadcn/ui** | latest | 基于Radix UI的组件库 |
| **Radix UI** | ^1.2.12 | 无样式可访问组件 |
| **lucide-react** | ^0.468.0 | 图标库 |
| **Tailwind CSS** | ^3.4.0 | CSS框架 |
| **class-variance-authority** | ^0.7.1 | 组件变体管理 |
| **clsx** | ^2.1.1 | 条件类名工具 |
| **tailwind-merge** | ^2.6.0 | Tailwind类名合并 |

### 数据可视化

| 技术 | 版本 | 用途 |
|------|------|------|
| **echarts** | ^6.0.0 | 图表库 |
| **echarts-for-react** | ^3.0.6 | ECharts React封装 |
| **recharts** | 2.15.4 | 轻量级图表库 |

### 状态管理与表单

| 技术 | 版本 | 用途 |
|------|------|------|
| **zustand** | ^5.0.11 | 状态管理 |
| **@tanstack/react-query** | ^5.90.21 | 数据获取与缓存 |
| **react-hook-form** | ^7.70.0 | 表单管理 |
| **zod** | ^4.3.5 | 数据校验 |
| **@hookform/resolvers** | ^5.2.2 | 表单验证器 |

### 地图与位置

| 技术 | 版本 | 用途 |
|------|------|------|
| **react-leaflet** | ^5.0.0 | 地图组件 |
| **leaflet** | ^1.9.4 | 地图库 |

### 文档处理

| 技术 | 版本 | 用途 |
|------|------|------|
| **react-markdown** | 9.0.1 | Markdown渲染 |
| **mammoth** | ^1.11.0 | Word文档转换 |
| **pdfjs-dist** | 3.11.174 | PDF渲染 |
| **remark-gfm** | 4.0.0 | GitHub Flavored Markdown |

### 数据库与存储

| 技术 | 版本 | 用途 |
|------|------|------|
| **@supabase/supabase-js** | 2.95.3 | Supabase客户端 |
| **drizzle-orm** | ^0.45.1 | ORM工具 |
| **pg** | ^8.17.2 | PostgreSQL客户端 |
| **@aws-sdk/client-s3** | ^3.958.0 | AWS S3客户端 |

### 第三方集成

| 技术 | 版本 | 用途 |
|------|------|------|
| **@larksuiteoapi/node-sdk** | ^1.59.0 | 飞书SDK |
| **coze-coding-dev-sdk** | ^0.7.16 | Coze SDK |

### 工具库

| 技术 | 版本 | 用途 |
|------|------|------|
| **date-fns** | ^4.1.0 | 日期处理 |
| **idb** | ^8.0.3 | IndexedDB封装 |
| **cmdk** | ^1.1.1 | 命令面板 |
| **sonner** | ^2.0.7 | Toast通知 |

---

## 📁 项目结构

```
workspace/projects/
├── .coze                           # Coze配置文件
├── .cozeproj                       # Coze项目配置
├── .gitignore
├── .prettierrc
├── package.json                    # 依赖配置
├── tsconfig.json                   # TypeScript配置
├── tailwind.config.ts              # Tailwind配置
├── next.config.ts                  # Next.js配置
├── .eslintrc.json                  # ESLint配置
│
├── database/                       # 数据库相关
│   ├── schema-reits-postgres.sql  # REITs八张表建表脚本
│   └── schema-abs-postgres.sql    # ABS数据库建表脚本
│
├── docs/                           # 文档
│   ├── REITS_DATABASE_SETUP.md    # REITs数据库初始化指南
│   └── ABS_DATABASE_SETUP.md      # ABS数据库初始化指南
│
├── pages/                          # 页面路由（Pages Router）
│   ├── _app.tsx                   # 全局App配置
│   ├── _document.tsx              # HTML文档配置
│   ├── _error.tsx                 # 错误页面
│   ├── index.tsx                  # 首页
│   ├── agents.tsx                 # Agent选择
│   ├── agent-personalities.tsx    # Agent个性展示
│   ├── chat/[id].tsx              # Agent对话
│   ├── expert/[id].tsx            # 专家详情
│   ├── expert/index.tsx           # 专家列表
│   ├── projects.tsx               # 项目管理
│   ├── market.tsx                 # 市场行情
│   ├── news.tsx                   # 新闻资讯
│   ├── issuance-status.tsx        # 发行状态
│   ├── issued-reits.tsx           # 已发行REITs列表
│   ├── issued-reits/[code].tsx    # REITs详情
│   ├── issued-reits/[code]/documents.tsx # REITs文档
│   ├── abs-products.tsx           # ABS产品列表
│   ├── abs-products/[category].tsx # ABS分类
│   ├── abs-dashboard.tsx          # ABS仪表盘
│   ├── issued-abs.tsx             # 已发行ABS
│   ├── issued-abs/[code].tsx      # ABS详情
│   ├── reits-data-tables.tsx      # REITs八张表 ⭐
│   ├── valuation-calculator.tsx   # 估值计算器
│   ├── calculator.tsx             # 计算器
│   ├── bbs.tsx                    # 匿名BBS
│   ├── pricing.tsx                # 定价管理
│   ├── knowledge/[agentId].tsx    # 知识库
│   ├── law.tsx                    # 法律法规
│   ├── games.tsx                  # 小游戏
│   ├── points/                    # 积分系统
│   │   ├── index.tsx
│   │   ├── recharge.tsx
│   │   └── withdraw.tsx
│   ├── settings.tsx               # 设置
│   ├── test-router.tsx            # 路由测试
│   └── test-server/[code].tsx     # 服务测试
│
├── src/
│   ├── app.disabled/              # App Router（未启用）
│   │   ├── agents/
│   │   ├── chat/
│   │   ├── issuance-status/
│   │   ├── issued-abs/
│   │   ├── issued-reits/
│   │   ├── knowledge/
│   │   ├── layout.tsx
│   │   ├── market/
│   │   ├── news/
│   │   ├── projects/
│   │   └── page.tsx
│   │
│   ├── components/                # 组件库
│   │   ├── layout/                # 布局组件
│   │   │   ├── Header.tsx         # 顶部导航
│   │   │   ├── Sidebar.tsx        # 侧边栏
│   │   │   ├── Footer.tsx         # 底部
│   │   │   └── MainLayout.tsx     # 主布局
│   │   │
│   │   ├── reits/                 # REITs组件
│   │   │   ├── REITsEightTables.tsx     # 八张表展示 ⭐
│   │   │   ├── REITsChart.tsx           # 图表组件
│   │   │   ├── REITsValuationCalculator.tsx # 估值计算器
│   │   │   ├── AnnouncementQuery.tsx     # 公告查询
│   │   │   ├── LocationAnalysis.tsx      # 位置分析
│   │   │   ├── BaiduMapLocationSelector.tsx # 百度地图选择器
│   │   │   ├── MapLocationSelector.tsx   # 地图选择器
│   │   │   ├── MapLocationSelectorWrapper.tsx
│   │   │   └── FloatingValuationCalculator.tsx
│   │   │
│   │   ├── bbs/                   # BBS组件
│   │   │   ├── HackerAnonymousBBS.tsx        # 匿名BBS（科技风）
│   │   │   └── ScreenRecordingProtection.tsx  # 截屏保护
│   │   │
│   │   ├── agent/                 # Agent组件
│   │   │   └── AgentPersonalityDisplay.tsx
│   │   │
│   │   ├── pricing/               # 定价组件
│   │   │   └── PricingTiers.tsx
│   │   │
│   │   ├── knowledge/             # 知识库组件
│   │   │   └── RegulationsKnowledgeBase.tsx
│   │   │
│   │   ├── common/                # 通用组件
│   │   │   └── DraggableFloatingWindow.tsx
│   │   │
│   │   ├── ProjectBBS.tsx         # 项目BBS
│   │   │
│   │   └── ui/                    # shadcn/ui组件库（38个）
│   │       ├── accordion.tsx      # 手风琴
│   │       ├── alert.tsx          # 警告
│   │       ├── alert-dialog.tsx   # 警告对话框
│   │       ├── aspect-ratio.tsx   # 宽高比
│   │       ├── avatar.tsx         # 头像
│   │       ├── badge.tsx          # 徽章
│   │       ├── breadcrumb.tsx     # 面包屑
│   │       ├── button.tsx         # 按钮
│   │       ├── button-group.tsx   # 按钮组
│   │       ├── calendar.tsx       # 日历
│   │       ├── card.tsx           # 卡片
│   │       ├── carousel.tsx       # 轮播
│   │       ├── chart.tsx          # 图表
│   │       ├── checkbox.tsx       # 复选框
│   │       ├── collapsible.tsx    # 折叠
│   │       ├── command.tsx        # 命令面板
│   │       ├── context-menu.tsx   # 上下文菜单
│   │       ├── dialog.tsx         # 对话框
│   │       ├── drawer.tsx         # 抽屉
│   │       ├── dropdown-menu.tsx  # 下拉菜单
│   │       ├── empty.tsx          # 空状态
│   │       ├── field.tsx          # 字段
│   │       ├── form.tsx           # 表单
│   │       ├── hover-card.tsx     # 悬停卡片
│   │       ├── input.tsx          # 输入框
│   │       ├── input-group.tsx    # 输入组
│   │       ├── input-otp.tsx      # OTP输入
│   │       ├── item.tsx           # 列表项
│   │       ├── kbd.tsx            # 键盘快捷键
│   │       ├── label.tsx          # 标签
│   │       ├── menubar.tsx        # 菜单栏
│   │       ├── navigation-menu.tsx # 导航菜单
│   │       ├── pagination.tsx     # 分页
│   │       ├── popover.tsx        # 弹出层
│   │       ├── progress.tsx       # 进度条
│   │       ├── radio-group.tsx    # 单选组
│   │       ├── resizable.tsx      # 可调整大小
│   │       ├── scroll-area.tsx    # 滚动区域
│   │       ├── select.tsx         # 选择器
│   │       ├── separator.tsx      # 分隔线
│   │       ├── sheet.tsx          # 侧边抽屉
│   │       ├── sidebar.tsx        # 侧边栏
│   │       ├── skeleton.tsx       # 骨架屏
│   │       ├── slider.tsx         # 滑块
│   │       ├── sonner.tsx         # Toast通知
│   │       ├── spinner.tsx        # 加载中
│   │       ├── switch.tsx         # 开关
│   │       ├── table.tsx          # 表格
│   │       ├── tabs.tsx           # 标签页
│   │       ├── textarea.tsx       # 文本域
│   │       ├── toggle.tsx         # 切换
│   │       ├── toggle-group.tsx   # 切换组
│   │       └── tooltip.tsx        # 工具提示
│   │
│   ├── lib/                       # 工具库
│   │   ├── utils.ts               # 通用工具
│   │   ├── database/              # 数据库服务
│   │   │   ├── reit-db.ts         # REITs数据库操作 ⭐
│   │   │   ├── abs-db.ts          # ABS数据库操作
│   │   │   └── supabase-client.ts # Supabase客户端
│   │   └── supabase/              # Supabase相关
│   │
│   ├── styles/                    # 样式文件
│   │   └── globals.css            # 全局样式
│   │
│   └── types/                     # TypeScript类型
│       ├── reits.ts               # REITs类型定义
│       ├── abs.ts                 # ABS类型定义
│       └── index.ts
│
├── public/                        # 静态资源
│   ├── images/                    # 图片资源
│   ├── icons/                     # 图标
│   └── favicon.ico
│
├── scripts/                       # 脚本
│   ├── build.sh                   # 构建脚本
│   ├── dev.sh                     # 开发脚本
│   ├── start.sh                   # 启动脚本
│   ├── create-reits-sample-data.js # REITs示例数据
│   ├── create-abs-sample-data.js   # ABS示例数据
│   ├── init-reits-database.js     # REITs数据库初始化
│   ├── init-abs-database.js       # ABS数据库初始化
│   ├── clear-reits-tables.js      # 清空REITs表
│   ├── clear-abs-tables.js        # 清空ABS表
│   └── rebuild-reits-tables.js    # 重建REITs表
│
└── styles/                        # 额外样式
    └── globals.css
```

---

## 🧭 页面路由

### 统计信息

| 类型 | 数量 |
|------|------|
| 总页面数 | 35 |
| 静态页面 | 20 |
| 动态路由 | 9 |
| 嵌套路由 | 1 |

### 路由列表

| 路由 | 页面文件 | 说明 |
|------|----------|------|
| `/` | `pages/index.tsx` | 首页 |
| `/agents` | `pages/agents.tsx` | Agent选择 |
| `/agent-personalities` | `pages/agent-personalities.tsx` | Agent个性展示 |
| `/chat/[id]` | `pages/chat/[id].tsx` | Agent对话 |
| `/expert` | `pages/expert/index.tsx` | 专家列表 |
| `/expert/[id]` | `pages/expert/[id].tsx` | 专家详情 |
| `/projects` | `pages/projects.tsx` | 项目管理 |
| `/market` | `pages/market.tsx` | 市场行情 |
| `/news` | `pages/news.tsx` | 新闻资讯 |
| `/issuance-status` | `pages/issuance-status.tsx` | 发行状态 |
| `/issued-reits` | `pages/issued-reits.tsx` | 已发行REITs列表 |
| `/issued-reits/[code]` | `pages/issued-reits/[code].tsx` | REITs详情 |
| `/issued-reits/[code]/documents` | `pages/issued-reits/[code]/documents.tsx` | REITs文档 |
| `/reits-data-tables` | `pages/reits-data-tables.tsx` | REITs八张表 ⭐ |
| `/valuation-calculator` | `pages/valuation-calculator.tsx` | 估值计算器 |
| `/calculator` | `pages/calculator.tsx` | 计算器 |
| `/abs-products` | `pages/abs-products.tsx` | ABS产品列表 |
| `/abs-products/[category]` | `pages/abs-products/[category].tsx` | ABS分类 |
| `/abs-dashboard` | `pages/abs-dashboard.tsx` | ABS仪表盘 |
| `/issued-abs` | `pages/issued-abs.tsx` | 已发行ABS |
| `/issued-abs/[code]` | `pages/issued-abs/[code].tsx` | ABS详情 |
| `/bbs` | `pages/bbs.tsx` | 匿名BBS |
| `/pricing` | `pages/pricing.tsx` | 定价管理 |
| `/knowledge/[agentId]` | `pages/knowledge/[agentId].tsx` | 知识库 |
| `/law` | `pages/law.tsx` | 法律法规 |
| `/games` | `pages/games.tsx` | 小游戏 |
| `/points` | `pages/points/index.tsx` | 积分首页 |
| `/points/recharge` | `pages/points/recharge.tsx` | 积分充值 |
| `/points/withdraw` | `pages/points/withdraw.tsx` | 积分提现 |
| `/settings` | `pages/settings.tsx` | 设置 |

---

## 🧩 组件架构

### 组件统计

| 类型 | 数量 |
|------|------|
| UI组件 | 38 |
| 布局组件 | 4 |
| 业务组件 | 15 |
| 总计 | 57 |

### 布局组件

| 组件 | 路径 | 说明 |
|------|------|------|
| MainLayout | `src/components/layout/MainLayout.tsx` | 主布局容器 |
| Header | `src/components/layout/Header.tsx` | 顶部导航栏 |
| Sidebar | `src/components/layout/Sidebar.tsx` | 侧边栏导航 |
| Footer | `src/components/layout/Footer.tsx` | 底部信息 |

### REITs组件

| 组件 | 路径 | 说明 |
|------|------|------|
| REITsEightTables | `src/components/reits/REITsEightTables.tsx` | 八张表数据展示 ⭐ |
| REITsChart | `src/components/reits/REITsChart.tsx` | REITs图表组件 |
| REITsValuationCalculator | `src/components/reits/REITsValuationCalculator.tsx` | REITs估值计算器 |
| AnnouncementQuery | `src/components/reits/AnnouncementQuery.tsx` | 公告查询 |
| LocationAnalysis | `src/components/reits/LocationAnalysis.tsx` | 地理位置分析 |
| BaiduMapLocationSelector | `src/components/reits/BaiduMapLocationSelector.tsx` | 百度地图选择器 |
| MapLocationSelector | `src/components/reits/MapLocationSelector.tsx` | 地图选择器 |
| MapLocationSelectorWrapper | `src/components/reits/MapLocationSelectorWrapper.tsx` | 地图选择器封装 |
| FloatingValuationCalculator | `src/components/reits/FloatingValuationCalculator.tsx` | 浮动估值计算器 |

### BBS组件

| 组件 | 路径 | 说明 |
|------|------|------|
| HackerAnonymousBBS | `src/components/bbs/HackerAnonymousBBS.tsx` | 黑客风格匿名BBS |
| ScreenRecordingProtection | `src/components/bbs/ScreenRecordingProtection.tsx` | 截屏保护 |

### 其他业务组件

| 组件 | 路径 | 说明 |
|------|------|------|
| AgentPersonalityDisplay | `src/components/agent/AgentPersonalityDisplay.tsx` | Agent个性展示 |
| PricingTiers | `src/components/pricing/PricingTiers.tsx` | 定价档位 |
| RegulationsKnowledgeBase | `src/components/knowledge/RegulationsKnowledgeBase.tsx` | 法规知识库 |
| DraggableFloatingWindow | `src/components/common/DraggableFloatingWindow.tsx` | 可拖动浮动窗口 |
| ProjectBBS | `src/components/ProjectBBS.tsx` | 项目BBS |

### shadcn/ui组件库（38个）

#### 基础组件
- `button` - 按钮
- `input` - 输入框
- `textarea` - 文本域
- `label` - 标签
- `badge` - 徽章
- `avatar` - 头像
- `card` - 卡片
- `separator` - 分隔线

#### 导航组件
- `tabs` - 标签页
- `breadcrumb` - 面包屑
- `navigation-menu` - 导航菜单
- `menubar` - 菜单栏
- `dropdown-menu` - 下拉菜单
- `context-menu` - 上下文菜单
- `sidebar` - 侧边栏
- `pagination` - 分页

#### 表单组件
- `form` - 表单
- `field` - 字段
- `checkbox` - 复选框
- `radio-group` - 单选组
- `switch` - 开关
- `select` - 选择器
- `input-otp` - OTP输入
- `input-group` - 输入组
- `calendar` - 日历
- `slider` - 滑块

#### 反馈组件
- `alert` - 警告
- `alert-dialog` - 警告对话框
- `dialog` - 对话框
- `drawer` - 抽屉
- `sheet` - 侧边抽屉
- `popover` - 弹出层
- `hover-card` - 悬停卡片
- `tooltip` - 工具提示
- `sonner` - Toast通知
- `progress` - 进度条
- `skeleton` - 骨架屏
- `spinner` - 加载中
- `empty` - 空状态

#### 布局组件
- `accordion` - 手风琴
- `collapsible` - 折叠
- `resizable` - 可调整大小
- `scroll-area` - 滚动区域
- `aspect-ratio` - 宽高比

#### 数据展示组件
- `table` - 表格
- `chart` - 图表
- `carousel` - 轮播

#### 交互组件
- `toggle` - 切换
- `toggle-group` - 切换组
- `command` - 命令面板
- `kbd` - 键盘快捷键
- `item` - 列表项

---

## ⚡ 核心功能模块

### 1. REITs八张表数据展示 ⭐

**路由**：`/reits-data-tables`

**组件**：
- `pages/reits-data-tables.tsx` - 主页面
- `src/components/reits/REITsEightTables.tsx` - 八张表组件
- `src/lib/database/reit-db.ts` - 数据库服务

**功能**：
- 产品信息表
- 资产信息表
- 财务指标表
- 运营数据表
- 市场表现表
- 投资者结构表
- 分红历史表
- 风险指标表

**特性**：
- 按Tab切换八张表
- 固定表头
- 响应式设计
- 数据排序
- 搜索过滤

### 2. Agent对话系统

**路由**：`/chat/[id]`

**组件**：
- `pages/chat/[id].tsx`
- `src/components/agent/AgentPersonalityDisplay.tsx`

**功能**：
- 多Agent协同
- 流式对话
- 消息历史
- 上下文管理

**Agent类型**：
- 法务风控合规 Agent
- 政策解读 Agent
- 尽职调查 Agent
- 申报材料生成 Agent
- 定价发行建议 Agent
- 存续期管理 Agent

### 3. 市场行情

**路由**：`/market`

**组件**：
- `pages/market.tsx`
- `src/components/reits/REITsChart.tsx`

**功能**：
- 实时行情
- 历史数据
- 图表展示
- 数据对比

### 4. 估值计算器

**路由**：`/valuation-calculator`

**组件**：
- `pages/valuation-calculator.tsx`
- `src/components/reits/REITsValuationCalculator.tsx`
- `src/components/reits/FloatingValuationCalculator.tsx`

**功能**：
- DCF估值
- 可比公司法
- 资产基础法
- 浮动窗口

### 5. 地理位置分析

**路由**：集成在REITs详情页

**组件**：
- `src/components/reits/LocationAnalysis.tsx`
- `src/components/reits/BaiduMapLocationSelector.tsx`
- `src/components/reits/MapLocationSelector.tsx`

**功能**：
- 地图展示
- 地址解析
- 距离计算
- 周边搜索

### 6. 匿名BBS

**路由**：`/bbs`

**组件**：
- `pages/bbs.tsx`
- `src/components/bbs/HackerAnonymousBBS.tsx`
- `src/components/bbs/ScreenRecordingProtection.tsx`

**功能**：
- 科技风UI
- 匿名发帖
- 截屏保护
- 回复功能

### 7. ABS产品管理

**路由**：
- `/abs-dashboard` - ABS仪表盘
- `/abs-products` - 产品列表
- `/abs-products/[category]` - 分类查看
- `/issued-abs` - 已发行ABS
- `/issued-abs/[code]` - ABS详情

**组件**：
- `pages/abs-dashboard.tsx`
- `pages/abs-products.tsx`
- `src/lib/database/abs-db.ts`

**功能**：
- 产品查询
- 分类浏览
- 票面利率
- 交易结构

### 8. 积分系统

**路由**：
- `/points` - 积分首页
- `/points/recharge` - 充值
- `/points/withdraw` - 提现

**功能**：
- 积分查询
- 充值功能
- 提现功能
- 交易记录

### 9. 知识库

**路由**：`/knowledge/[agentId]`

**组件**：
- `pages/knowledge/[agentId].tsx`
- `src/components/knowledge/RegulationsKnowledgeBase.tsx`

**功能**：
- 法规检索
- 知识管理
- 文档上传
- 智能搜索

---

## 📦 依赖分析

### 生产依赖（64个）

#### 核心依赖
- `next@16.1.1` - React框架
- `react@19.2.3` - UI库
- `react-dom@19.2.3` - React DOM
- `typescript@5` - TypeScript
- `@types/react@19` - React类型
- `@types/react-dom@19` - React DOM类型

#### UI组件
- `@radix-ui/*` - 26个Radix UI组件
- `lucide-react@0.468.0` - 图标库
- `clsx@2.1.1` - 类名工具
- `class-variance-authority@0.7.1` - 变体管理
- `tailwind-merge@2.6.0` - Tailwind合并

#### 数据可视化
- `echarts@6.0.0` - 图表库
- `echarts-for-react@3.0.6` - ECharts React
- `recharts@2.15.4` - 轻量图表

#### 状态管理
- `zustand@5.0.11` - 状态管理
- `@tanstack/react-query@5.90.21` - 数据获取
- `react-hook-form@7.70.0` - 表单管理
- `zod@4.3.5` - 数据校验
- `@hookform/resolvers@5.2.2` - 表单验证

#### 数据库
- `@supabase/supabase-js@2.95.3` - Supabase客户端
- `drizzle-orm@0.45.1` - ORM工具
- `pg@8.17.2` - PostgreSQL客户端
- `drizzle-zod@0.8.3` - Zod集成
- `drizzle-kit@0.31.8` - Drizzle工具

#### 存储
- `@aws-sdk/client-s3@3.958.0` - S3客户端
- `@aws-sdk/lib-storage@3.958.0` - S3上传工具

#### 第三方集成
- `@larksuiteoapi/node-sdk@1.59.0` - 飞书SDK
- `coze-coding-dev-sdk@0.7.16` - Coze SDK

#### 文档处理
- `react-markdown@9.0.1` - Markdown渲染
- `mammoth@1.11.0` - Word转换
- `pdfjs-dist@3.11.174` - PDF渲染
- `remark-gfm@4.0.0` - GFM支持

#### 地图
- `react-leaflet@5.0.0` - Leaflet React
- `leaflet@1.9.4` - Leaflet地图

#### 工具库
- `date-fns@4.1.0` - 日期处理
- `idb@8.0.3` - IndexedDB
- `cmdk@1.1.1` - 命令面板
- `sonner@2.0.7` - Toast通知
- `input-otp@1.4.2` - OTP输入

#### 其他
- `embla-carousel-react@8.6.0` - 轮播
- `react-resizable-panels@4.2.0` - 可调整面板
- `react-day-picker@9.13.0` - 日历选择
- `next-themes@0.4.6` - 主题切换
- `vaul@1.1.2` - 抽屉
- `dotenv@17.2.3` - 环境变量

### 开发依赖（14个）

#### 代码质量
- `eslint@9` - 代码检查
- `eslint-config-next@16.1.1` - Next.js ESLint配置
- `typescript@5` - TypeScript
- `@types/node@20` - Node类型
- `@types/pg@8.16.0` - PostgreSQL类型
- `@types/leaflet@1.9.21` - Leaflet类型

#### 样式
- `tailwindcss@3.4.0` - Tailwind CSS
- `autoprefixer@10.4.24` - 自动前缀

#### 开发工具
- `@react-dev-inspector/babel-plugin@2.0.1` - 开发检查器Babel插件
- `@react-dev-inspector/middleware@2.0.1` - 开发检查器中间件
- `react-dev-inspector@2.0.1` - 开发检查器

#### 包管理
- `only-allow@1.2.2` - 强制使用pnpm
- `pnpm@9.0.0` - 包管理器

---

## 🎨 样式方案

### Tailwind CSS配置

**配置文件**：`tailwind.config.ts`

**核心特性**：
- 原子化CSS
- 响应式设计
- 暗黑模式支持
- 自定义主题
- 插件扩展

**配置内容**：
```typescript
// tailwind.config.ts
{
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // 更多自定义颜色...
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
```

### 全局样式

**文件**：`src/styles/globals.css`

**特性**：
- CSS变量定义
- 基础样式重置
- 暗黑模式样式
- 自定义动画

**CSS变量**：
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### 工具函数

**文件**：`src/lib/utils.ts`

**核心函数**：
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**用途**：
- 合并Tailwind类名
- 处理类名冲突
- 条件类名生成

### 组件样式规范

**shadcn/ui组件样式规范**：
- 使用`cn()`函数合并类名
- 使用CSS变量定义颜色
- 支持暗黑模式
- 响应式设计

**示例**：
```typescript
// Button组件
const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
```

---

## 🔌 集成服务

### 1. Supabase集成

**SDK**：`@supabase/supabase-js@2.95.3`

**用途**：
- 数据存储（PostgreSQL）
- 实时订阅
- 文件存储
- 身份认证

**配置文件**：`src/lib/supabase/client.ts`

**功能**：
- REITs数据存储
- ABS数据存储
- 用户数据管理
- 实时数据更新

### 2. AWS S3集成

**SDK**：`@aws-sdk/client-s3@3.958.0`

**用途**：
- 文件上传
- 文件下载
- 图片存储

**功能**：
- 文档上传
- 图片存储
- 文件分享

### 3. 飞书集成

**SDK**：`@larksuiteoapi/node-sdk@1.59.0`

**用途**：
- 审批流程
- 文档管理
- 消息通知

**功能**：
- 审批申请
- 文档同步
- 消息推送

### 4. Coze SDK集成

**SDK**：`coze-coding-dev-sdk@0.7.16`

**用途**：
- AI对话
- Agent管理
- 知识库集成

**功能**：
- Agent对话
- 消息流式输出
- 上下文管理

---

## 📐 开发规范

### 命名规范

**文件命名**：
- 组件文件：PascalCase（如`Button.tsx`）
- 工具文件：kebab-case（如`reit-db.ts`）
- 页面文件：kebab-case（如`reits-data-tables.tsx`）

**变量命名**：
- 组件：PascalCase（如`Button`）
- 函数：camelCase（如`getUserData`）
- 常量：UPPER_SNAKE_CASE（如`API_BASE_URL`）
- 类型：PascalCase（如`User`）

### 代码规范

**TypeScript规范**：
- 严格模式
- 显式类型标注
- 接口优先
- 类型复用

**React规范**：
- 函数组件
- Hooks使用
- Props接口定义
- 组件注释

**示例**：
```typescript
/**
 * REITs产品信息卡片组件
 * @param product - REITs产品信息
 */
interface ProductCardProps {
  product: REITsProduct;
  onEdit?: (code: string) => void;
  onDelete?: (code: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.fundName}</CardTitle>
        <CardDescription>{product.fundCode}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 内容 */}
      </CardContent>
    </Card>
  );
}
```

### 目录规范

**页面目录**：`pages/`
- 每个路由对应一个文件
- 动态路由使用`[param]`格式
- 嵌套路由创建子目录

**组件目录**：`src/components/`
- 按功能模块分组
- 复用组件放在`ui/`目录
- 业务组件按功能分类

### Git提交规范

**格式**：`<type>(<scope>): <subject>`

**类型**：
- `feat` - 新功能
- `fix` - 修复
- `docs` - 文档
- `style` - 样式
- `refactor` - 重构
- `test` - 测试
- `chore` - 构建/工具

**示例**：
```
feat(reits): 添加REITs八张表数据展示功能
fix(reits-chart): 修复图表数据渲染错误
docs(readme): 更新项目文档
```

---

## 🚀 构建与部署

### 开发环境

**启动命令**：
```bash
pnpm dev
```

**配置文件**：`.coze`
```toml
[project]
requires = ["nodejs-24"]

[dev]
build = ["pnpm", "install"]
run = ["pnpm", "run", "dev"]
```

**特性**：
- 热更新（HMR）
- 端口：5000
- TypeScript检查
- ESLint检查

### 生产环境

**构建命令**：
```bash
pnpm build
```

**启动命令**：
```bash
pnpm start
```

**配置文件**：`.coze`
```toml
[deploy]
build = ["pnpm", "run", "build"]
run = ["pnpm", "run", "start"]
```

**构建产物**：
- `.next/` - Next.js构建目录
- `public/` - 静态资源
- `node_modules/.pnpm/` - 依赖

### 脚本说明

| 脚本 | 命令 | 说明 |
|------|------|------|
| `dev` | `bash ./scripts/dev.sh` | 启动开发环境 |
| `build` | `bash ./scripts/build.sh` | 构建生产版本 |
| `start` | `bash ./scripts/start.sh` | 启动生产环境 |
| `lint` | `eslint` | 代码检查 |
| `ts-check` | `tsc -p tsconfig.json` | TypeScript类型检查 |

### 环境变量

**文件**：`.env.local`

**配置项**：
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AWS S3
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=
NEXT_PUBLIC_AWS_REGION=
NEXT_PUBLIC_AWS_BUCKET=

# 飞书
LARK_APP_ID=
LARK_APP_SECRET=

# Coze
COZE_API_KEY=
```

---

## ⚡ 性能优化

### 代码分割

**动态导入**：
```typescript
// 懒加载组件
const REITsChart = dynamic(() => import('@/components/reits/REITsChart'), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false,
});
```

### 图片优化

**Next.js Image组件**：
```typescript
import Image from 'next/image';

<Image
  src="/reits-logo.png"
  alt="REITs Logo"
  width={200}
  height={100}
  priority
/>
```

### 数据缓存

**React Query缓存**：
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['reits', code],
  queryFn: () => fetchREITsData(code),
  staleTime: 5 * 60 * 1000, // 5分钟
  cacheTime: 10 * 60 * 1000, // 10分钟
});
```

### 懒加载

**组件懒加载**：
- 路由级别懒加载
- 组件级别懒加载
- 图表库懒加载

### 优化建议

1. **代码分割**：使用`dynamic()`导入大型组件
2. **图片优化**：使用Next.js Image组件
3. **数据缓存**：使用React Query缓存数据
4. **按需加载**：避免一次性加载所有组件
5. **Tree Shaking**：移除未使用的代码
6. **代码压缩**：启用Gzip压缩
7. **CDN加速**：使用CDN分发静态资源

---

## 📊 项目统计

### 代码统计

| 指标 | 数量 |
|------|------|
| 页面文件 | 35 |
| 组件文件 | 57 |
| UI组件 | 38 |
| 业务组件 | 19 |
| 工具文件 | 10+ |
| 类型文件 | 5+ |
| 样式文件 | 2 |

### 依赖统计

| 类型 | 数量 |
|------|------|
| 生产依赖 | 64 |
| 开发依赖 | 14 |
| Radix UI组件 | 26 |
| 总依赖包 | 78+ |

### 功能统计

| 功能模块 | 数量 |
|----------|------|
| REITs功能 | 8 |
| ABS功能 | 5 |
| Agent功能 | 6 |
| 工具功能 | 3 |
| 社区功能 | 1 |

---

## 🎯 总结

### 项目亮点

1. **现代化技术栈**：Next.js 16 + React 19 + TypeScript 5
2. **优秀的UI组件库**：shadcn/ui + Radix UI
3. **完整的功能模块**：REITs + ABS + Agent + 市场
4. **专业的数据展示**：八张表 + 图表可视化
5. **强大的集成能力**：Supabase + AWS S3 + 飞书 + Coze
6. **规范的代码结构**：清晰的目录组织
7. **完善的开发工具**：TypeScript + ESLint + Prettier

### 技术优势

- ✅ 类型安全（TypeScript）
- ✅ 组件化开发（React）
- ✅ 响应式设计（Tailwind CSS）
- ✅ 状态管理（Zustand + React Query）
- ✅ 数据可视化（ECharts + Recharts）
- ✅ 表单处理（React Hook Form + Zod）
- ✅ 地图功能（Leaflet）
- ✅ 文档处理（Markdown + PDF + Word）

### 改进建议

1. **测试覆盖**：添加单元测试和集成测试
2. **性能监控**：添加性能监控工具
3. **错误处理**：完善错误边界和错误日志
4. **文档完善**：补充API文档和组件文档
5. **国际化**：添加多语言支持
6. **PWA支持**：添加PWA功能
7. **SEO优化**：优化页面SEO

---

## 📞 联系信息

**项目名称**：REITs智能助手

**技术栈**：Next.js 16 + React 19 + TypeScript 5

**文档生成时间**：2024年

---

**报告结束**
