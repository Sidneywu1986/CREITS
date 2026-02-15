# 故障排查指南 - 加载问题解决方案

## 🔍 问题诊断

请告诉我你遇到的具体问题：

### 可能的问题类型

1. **无法下载 ZIP 文件** - 下载失败或文件损坏
2. **解压失败** - ZIP 文件无法解压
3. **安装依赖失败** - `pnpm install` 报错
4. **启动服务器失败** - `pnpm dev` 或 `coze dev` 报错
5. **页面加载失败** - 浏览器无法访问或页面报错
6. **功能无法使用** - 特定功能无法加载或运行

---

## 🚀 最常见问题：Next.js 16 启动失败

### 症状
- `pnpm dev` 启动后立即崩溃
- 浏览器显示 "This site can't be reached"
- 日志显示 "Unhandled Rejection" 或 "TypeError"

### 根本原因
**Next.js 16.1.1 存在已知的启动兼容性问题**，特别是在多 lockfile 环境中。

### ✅ 推荐解决方案：降级到 Next.js 15

```bash
# 1. 修改 package.json
sed -i 's/"next": "16.1.1"/"next": "15.1.6"/g' package.json

# 2. 清理旧依赖
rm -rf node_modules pnpm-lock.yaml .next

# 3. 重新安装
pnpm install

# 4. 启动服务
pnpm dev
```

**这是最稳定可靠的解决方案！**

---

## 📥 问题 1: 无法下载 ZIP 文件

### 症状
- 下载进度卡住
- 下载文件大小为 0 或很小
- 下载的文件无法解压

### 解决方案

#### 方案 A: 检查文件是否存在
```bash
# 在沙箱中检查
ls -lh /workspace/projects/reits-assistant.zip
```

#### 方案 B: 重新生成 ZIP 文件
```bash
# 在项目根目录执行
cd /workspace/projects
rm -f reits-assistant.zip
git archive --format=zip --prefix="reits-assistant/" --output="reits-assistant.zip" HEAD
ls -lh reits-assistant.zip
```

#### 方案 C: 使用 tar.gz 格式（如果 ZIP 有问题）
```bash
# 导出为 tar.gz
git archive --format=tar.gz --prefix="reits-assistant/" --output="reits-assistant.tar.gz" HEAD
```

---

## 📦 问题 2: 解压失败

### 症状
- 解压时报错
- 解压后文件不完整
- 解压后文件夹为空

### 解决方案

#### Windows 系统
```bash
# 使用 7-Zip 或 WinRAR
# 右键 -> 7-Zip -> 提取到 "reits-assistant"
```

#### Mac/Linux 系统
```bash
# 检查 ZIP 文件完整性
unzip -t reits-assistant.zip

# 强制解压
unzip -o reits-assistant.zip

# 如果仍然失败，使用 tar.gz
tar -xzf reits-assistant.tar.gz
```

#### 验证解压结果
```bash
# 检查关键文件是否存在
cd reits-assistant
ls -la
# 应该看到：src/, package.json, next.config.js, tsconfig.json 等
```

---

## 📦 问题 3: 安装依赖失败

### 症状
- `pnpm install` 报错
- 依赖安装不完整
- 提示 Node.js 版本不兼容

### 解决方案

#### 步骤 1: 检查 Node.js 版本
```bash
node --version
# 应该显示 v18.x.x 或更高

# 如果版本过低，升级 Node.js
# 访问 https://nodejs.org 下载最新版本
```

#### 步骤 2: 检查 pnpm 版本
```bash
pnpm --version
# 应该显示 9.x.x 或更高

# 如果没有安装 pnpm
npm install -g pnpm
```

#### 步骤 3: 清理缓存后重新安装
```bash
# 清理 pnpm 缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

#### 步骤 4: 检查网络连接
```bash
# 如果使用国内镜像，配置淘宝镜像
pnpm config set registry https://registry.npmmirror.com

# 重新安装
pnpm install
```

#### 常见错误及解决

**错误 1: `preinstall` 脚本失败**
```bash
# 错误信息: Error: This project requires pnpm

# 解决方案：必须使用 pnpm，不能使用 npm 或 yarn
# 正确命令：
pnpm install

# 错误命令：
npm install  # ❌ 不要使用
yarn install # ❌ 不要使用
```

**错误 2: WASM 模块加载失败**
```bash
# 错误信息: Error loading WASM module

# 解决方案：这是预期的，@docknetwork/crypto-wasm 需要额外配置
# 可以先忽略，不影响其他功能
```

---

## 🚀 问题 4: 启动服务器失败

### 症状
- `pnpm dev` 报错
- 服务器启动后立即崩溃
- 端口被占用

### 解决方案（Next.js 16 启动失败）

**快速修复：降级到 Next.js 15**

```bash
# 1. 修改 package.json
sed -i 's/"next": "16.1.1"/"next": "15.1.6"/g' package.json

# 2. 清理并重新安装
rm -rf node_modules pnpm-lock.yaml .next
pnpm install

# 3. 启动
pnpm dev
```

#### 其他步骤

**检查环境变量**：
```bash
# 确保存在 .env.local 文件
ls -la .env.local

# 如果不存在，创建它
cp .env.example .env.local

# 编辑 .env.local
nano .env.local
```

**检查端口占用**：
```bash
# 检查 5000 端口是否被占用
# Windows:
netstat -ano | findstr :5000

# Mac/Linux:
lsof -i :5000

# 如果端口被占用，杀死进程
# Windows:
taskkill /PID <进程ID> /F

# Mac/Linux:
kill -9 <进程ID>

# 或者使用其他端口
PORT=3001 pnpm dev
```

---

## 🌐 问题 5: 页面加载失败

### 症状
- 浏览器显示 404 或 500 错误
- 页面空白
- 浏览器控制台报错

### 解决方案

#### 步骤 1: 检查服务器是否正常运行
```bash
# 测试服务器响应
curl http://localhost:5000

# 应该返回 HTML 内容
```

#### 步骤 2: 检查浏览器控制台

**打开浏览器控制台**：
- Chrome/Edge: `F12` 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- 查看 Console 标签页的错误信息

#### 步骤 3: 清除浏览器缓存
```
1. 打开浏览器开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"
```

---

## 📋 完整故障排查流程

### 1. 确认问题类型
- 下载问题？→ 查看问题 1
- 解压问题？→ 查看问题 2
- 安装问题？→ 查看问题 3
- 启动问题？→ **降级到 Next.js 15**
- 页面问题？→ 查看问题 5

### 2. 收集错误信息
```bash
# 记录完整的错误信息
pnpm dev > error.log 2>&1
cat error.log
```

### 3. 尝试修复
```bash
# 快速修复 Next.js 16 问题
sed -i 's/"next": "16.1.1"/"next": "15.1.6"/g' package.json
rm -rf node_modules pnpm-lock.yaml .next
pnpm install
pnpm dev
```

---

## 💡 快速修复脚本

创建 `quick-fix.sh` 脚本：

```bash
#!/bin/bash

echo "开始快速修复（降级到 Next.js 15）..."

# 1. 修改 package.json
if [ -f package.json ]; then
    sed -i 's/"next": "16.1.1"/"next": "15.1.6"/g' package.json
    echo "✓ 已修改 package.json"
fi

# 2. 清理
echo "2. 清理缓存..."
rm -rf node_modules .next pnpm-lock.yaml

# 3. 重新安装
echo "3. 重新安装依赖..."
pnpm install

# 4. 启动服务
echo "4. 启动服务..."
pnpm dev

echo "修复完成！"
```

使用方法：
```bash
chmod +x quick-fix.sh
./quick-fix.sh
```

---

## 🆘 仍然无法解决？

### 提供以下信息以便进一步诊断：

1. **操作系统**：Windows/Mac/Linux
2. **Node.js 版本**：`node --version`
3. **pnpm 版本**：`pnpm --version`
4. **Next.js 版本**：`grep '"next"' package.json`
5. **错误信息**：完整的错误输出
6. **操作步骤**：你做了什么

### 获取详细日志
```bash
# 生成详细日志
pnpm dev > debug.log 2>&1 &

# 查看日志
tail -f debug.log
```

---

## 📞 获取帮助

- 查看本地调试指南：`本地调试详细指南.md`
- 查看项目文档：`PROJECT_GUIDE.md`
- 查看快速指南：`QUICK_EXPORT_GUIDE.md`

---

## ✅ 推荐做法

**对于所有用户**：使用 **Next.js 15**，稳定可靠。

```bash
# 一键修复
sed -i 's/"next": "16.1.1"/"next": "15.1.6"/g' package.json
rm -rf node_modules pnpm-lock.yaml .next
pnpm install
pnpm dev
```

**这是最简单、最稳定的解决方案！** ✅
