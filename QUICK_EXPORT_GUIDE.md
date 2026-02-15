# 快速导出指南

## 方法 1：使用导出脚本（推荐）

### 步骤 1：运行导出脚本

```bash
# 在项目根目录执行
./export-code.sh
```

### 步骤 2：选择导出方式

脚本会提供 3 个选项：
1. 导出为 Git 压缩包（.tar.gz）
2. 导出为 ZIP 压缩包（.zip）
3. 推送到远程 Git 仓库

### 步骤 3：按照提示完成导出

根据选择的导出方式，按照脚本的提示完成后续操作。

---

## 方法 2：手动导出（Git 压缩包）

### 步骤 1：导出代码

```bash
# 在项目根目录执行
git archive --format=tar.gz --prefix="reits-assistant/" --output="reits-assistant.tar.gz" HEAD
```

### 步骤 2：下载文件

将生成的 `reits-assistant.tar.gz` 文件下载到本地。

### 步骤 3：在本地解压

```bash
# 在本地执行
tar -xzf reits-assistant.tar.gz
cd reits-assistant
```

### 步骤 4：初始化本地 Git

```bash
git init
git add .
git commit -m "Initial commit: REITs 智能助手代码"
```

---

## 方法 3：手动导出（ZIP 压缩包）

### 步骤 1：导出代码

```bash
# 在项目根目录执行
git archive --format=zip --prefix="reits-assistant/" --output="reits-assistant.zip" HEAD
```

### 步骤 2：下载文件

将生成的 `reits-assistant.zip` 文件下载到本地。

### 步骤 3：在本地解压

```bash
# 在本地执行
unzip reits-assistant.zip
cd reits-assistant
```

### 步骤 4：初始化本地 Git

```bash
git init
git add .
git commit -m "Initial commit: REITs 智能助手代码"
```

---

## 方法 4：直接克隆远程仓库

如果项目已经配置了远程仓库：

```bash
# 在本地执行
git clone <远程仓库URL>
cd <项目目录>
```

---

## 本地调试步骤

### 1. 安装依赖

```bash
# 进入项目目录
cd reits-assistant

# 安装依赖（必须使用 pnpm）
pnpm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 填入你的配置
nano .env.local
# 或使用其他编辑器
```

### 3. 启动开发服务器

```bash
# 使用 Coze CLI（推荐）
coze dev

# 或使用 pnpm
pnpm dev
```

### 4. 访问应用

- 主页：http://localhost:5000
- BBS 测试：http://localhost:5000/test/encryption
- 性能测试：http://localhost:5000/test/performance

---

## 常见问题

### Q: 导出的代码包含哪些内容？
A:
- 完整的源代码
- 配置文件（.coze, .babelrc, .gitignore 等）
- 文档（docs/ 目录）
- 数据库 Schema（database/schema.sql）
- 不包含：node_modules, .next, .git

### Q: 如何配置百度地图 API Key？
A: 访问 [百度地图开放平台](https://lbsyun.baidu.com/)，注册账号并创建应用，获取 API Key，然后填入 `.env.local` 文件。

### Q: 如何配置 Supabase？
A: 如果需要使用 Supabase 数据库，在 `.env.local` 中填入你的 Supabase URL 和 Anon Key。

### Q: 项目依赖哪些 npm 包？
A: 所有依赖都在 `package.json` 中，运行 `pnpm install` 会自动安装。

### Q: 为什么必须使用 pnpm？
A: 项目已配置 `preinstall` 脚本，强制使用 pnpm。pnpm 更快、更节省空间，且依赖管理更严格。

### Q: 如何查看详细的项目文档？
A: 查看 `PROJECT_GUIDE.md` 文件，包含完整的项目说明、技术栈、开发规范等。

### Q: 性能测试页面如何使用？
A: 访问 http://localhost:5000/test/performance，点击"运行所有测试"按钮，查看各个模块的性能指标。

### Q: 加密测试页面如何使用？
A: 访问 http://localhost:5000/test/encryption，测试 BBS 签名和书密码加密功能。

---

## 项目结构

导出的代码包含以下主要内容：

```
reits-assistant/
├── src/                      # 源代码
│   ├── components/          # React 组件
│   ├── lib/                # 工具函数和 API
│   ├── pages/              # 页面路由
│   ├── stores/             # 状态管理
│   ├── types/              # TypeScript 类型
│   └── hooks/              # 自定义 Hooks
├── database/                # 数据库相关
│   └── schema.sql          # 数据库 Schema
├── docs/                    # 项目文档
│   ├── 核心模块实现优化计划.md
│   ├── 快速实施指南.md
│   ├── 安全增强与测试完善指南.md
│   └── REITs数据获取方式详细分析.md
├── public/                  # 静态资源
├── .coze                   # Coze CLI 配置
├── .env.example            # 环境变量模板
├── next.config.js          # Next.js 配置
├── package.json            # 依赖管理
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.ts      # Tailwind 配置
├── PROJECT_GUIDE.md        # 项目详细指南
└── README.md               # 项目说明
```

---

## 技术支持

- 项目文档：`PROJECT_GUIDE.md`
- 快速指南：`QUICK_EXPORT_GUIDE.md`（本文件）
- API 文档：`docs/快速实施指南.md`
- 安全指南：`docs/安全增强与测试完善指南.md`

---

## 注意事项

1. **必须使用 pnpm**：项目配置了 `preinstall` 脚本，强制使用 pnpm 管理依赖。

2. **环境变量**：复制 `.env.example` 到 `.env.local`，并根据实际情况填写配置。

3. **百度地图 API Key**：如果需要使用地图功能，必须申请百度地图 API Key。

4. **数据库 Schema**：如果需要使用 MySQL 数据库，需要导入 `database/schema.sql`。

5. **性能优化**：WASM 模块已配置延迟加载，首次加载会更快。

6. **安全性**：当前 BBS 签名为模拟实现，如需真实签名功能，需要集成 `@docknetwork/crypto-wasm`。

---

## 导出完成后

导出完成后，你可以：

1. **本地调试**：按照"本地调试步骤"进行开发和测试。

2. **部署到服务器**：使用 `coze build` 构建生产版本，然后部署到服务器。

3. **自定义开发**：根据项目文档进行二次开发。

4. **性能优化**：参考 `docs/核心模块实现优化计划.md` 进行性能优化。

5. **安全增强**：参考 `docs/安全增强与测试完善指南.md` 进行安全增强。

---

## 联系方式

如有问题，请参考项目文档或在项目仓库提交 Issue。
