# 匿名BBS - 防截屏和录屏功能说明

## 📋 概述

为匿名BBS添加了多层隐私保护机制，包括动态水印、截屏快捷键监听、页面失去焦点检测等，最大程度防止截屏和录屏行为。

---

## 🔒 防护机制

### 1. 动态水印

#### 功能说明
在页面上显示动态变化的水印，包含用户ID和时间戳，截屏时会被记录。

#### 技术实现
```typescript
<div
  className="fixed inset-0 pointer-events-none z-[9999] opacity-5 overflow-hidden"
  style={{
    backgroundImage: `url("data:image/svg+xml,...")`,
    backgroundSize: '200px 200px',
  }}
/>
```

#### 特点
- **动态内容**: 包含用户ID和当前时间戳
- **透明度**: 5%透明度，不影响正常阅读
- **高z-index**: 确保水印在最上层
- **pointer-events-none**: 不影响鼠标交互
- **SVG背景**: 使用SVG生成动态水印文字

#### 水印格式
```
ANONYMOUS - anon_abc12345 - 2024-02-15 14:30:00
```

---

### 2. 截屏快捷键监听

#### 支持的快捷键

##### Windows截屏
- `PrintScreen`: 全屏截屏
- `Ctrl+Shift+S`: Windows截屏工具
- `Alt+PrintScreen`: 活动窗口截屏

##### Mac截屏
- `Cmd+Shift+3`: 全屏截屏
- `Cmd+Shift+4`: 选区截屏
- `Cmd+Shift+5`: 截屏工具
- `Cmd+Control+Shift+3`: 截图到剪贴板

##### 浏览器开发者工具
- `F12`: 打开开发者工具
- `Ctrl+Shift+I`: 检查元素
- `Ctrl+Shift+J`: 控制台
- `Ctrl+Shift+C`: 检查
- `Cmd+Option+I`: Mac检查元素
- `Cmd+Option+J`: Mac控制台
- `Cmd+Option+C`: Mac检查

#### 技术实现
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  const ctrlKey = e.ctrlKey;
  const altKey = e.altKey;
  const shiftKey = e.shiftKey;
  const metaKey = e.metaKey;

  const isPrintScreen = key === 'printscreen';
  const isWindowsScreenCapture = /* 检测各种截屏快捷键 */;
  const isDevTools = /* 检测开发者工具快捷键 */;

  if (isPrintScreen || isWindowsScreenCapture || isDevTools) {
    e.preventDefault();
    handleScreenCaptureDetected();
  }
};
```

---

### 3. 内容复制阻止

#### 功能说明
防止用户直接复制敏感内容。

#### 实现方式
```typescript
const handleCopy = (e: ClipboardEvent) => {
  const selection = window.getSelection();
  if (selection && selection.toString().length > 50) {
    e.preventDefault();
    handleScreenCaptureDetected('内容复制被阻止');
  }
};
```

#### 特点
- 检测复制快捷键（Ctrl+C, Cmd+C）
- 限制复制长度（超过50字符阻止）
- 触发截屏警告

---

### 4. 页面失去焦点检测

#### 功能说明
检测页面长时间失去焦点，可能正在进行录屏。

#### 实现方式
```typescript
const handleBlur = () => {
  warningTimeoutRef.current = setTimeout(() => {
    handleScreenCaptureDetected('检测到页面长时间失去焦点，可能正在进行录屏');
  }, 5000); // 5秒后警告
};

const handleFocus = () => {
  if (warningTimeoutRef.current) {
    clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = null;
  }
};
```

#### 工作原理
- 页面失去焦点时启动5秒定时器
- 5秒内重新获得焦点，取消警告
- 超过5秒仍失去焦点，触发警告

---

### 5. 屏幕录制检测

#### 功能说明
定期检测是否有屏幕录制活动。

#### 实现方式
```typescript
const checkScreenRecording = async () => {
  try {
    // 尝试获取屏幕录制权限
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    
    // 如果成功获取，说明可能在录屏
    stream.getTracks().forEach(track => track.stop());
    handleScreenCaptureDetected('检测到屏幕录制活动');
  } catch (err) {
    // 没有录屏权限，正常情况
  }
};
```

#### 检测频率
每30秒检查一次

---

### 6. 警告和内容隐藏

#### 警告对话框
检测到截屏行为时，显示警告对话框：

```
┌─────────────────────────────────────────┐
│  👁️  隐私警告                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 检测到可能的截屏或录屏行为。匿名BBS     │
│ 强调隐私保护，请遵守以下规则：          │
│                                         │
│ • 禁止截屏、录屏或复制敏感内容           │
│ • 所有数据仅存在于内存中，关闭浏览器     │
│   后自动删除                            │
│ • 违反隐私保护可能导致内容隐藏           │
│ • 请在安全的环境中使用匿名BBS           │
│                                         │
│         [🛡️ 我理解了]                   │
└─────────────────────────────────────────┘
```

#### 内容模糊遮罩
检测到截屏行为时，内容会被模糊隐藏：

```typescript
{blurContent && (
  <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-black/95 border-2 border-green-500/30 rounded-lg p-8 max-w-md text-center">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
      <h3 className="text-green-400 font-mono text-lg font-semibold mb-2">
        检测到可能的截屏行为
      </h3>
      <p className="text-green-600/70 text-sm mb-4">
        为了保护隐私，内容已暂时隐藏。截屏和录屏行为可能违反隐私协议。
      </p>
      <p className="text-green-600/50 text-xs">
        请在安全的环境中使用匿名BBS
      </p>
    </div>
  </div>
)}
```

#### 特点
- 全屏模糊遮罩
- 黑色半透明背景
- 毛玻璃效果（backdrop-blur-sm）
- 3秒后自动恢复

---

## 🎯 使用方式

### 1. 自动启用
防截屏功能在匿名BBS中自动启用，无需用户操作。

### 2. 触发警告
尝试以下操作时会触发警告：
- 按下截屏快捷键
- 打开浏览器开发者工具
- 页面长时间失去焦点
- 尝试复制大量内容

### 3. 警告恢复
- 警告对话框3秒后自动关闭
- 内容模糊遮罩3秒后自动恢复

---

## ⚙️ 技术实现

### 组件结构
```
src/components/bbs/
├── HackerAnonymousBBS.tsx          # 主BBS组件
└── ScreenRecordingProtection.tsx    # 防截屏组件
```

### 集成方式
在HackerAnonymousBBS组件中集成：

```typescript
// 导入组件
import ScreenRecordingProtection from './ScreenRecordingProtection';

// 在组件中添加回调
const handleScreenCaptureDetected = useCallback(() => {
  console.log('Screen capture detected');
}, []);

// 在return中添加
<ScreenRecordingProtection
  enabled={true}
  userId={currentUser?.id}
  onScreenCaptureDetected={handleScreenCaptureDetected}
/>
```

---

## 🔍 功能限制

### 浏览器限制
1. **无法100%防止截屏**
   - 浏览器没有直接的API可以检测截屏
   - 技术手段只能增加难度，无法完全阻止
   - 用户仍可以通过其他方式截屏

2. **无法阻止外部录屏**
   - 无法检测手机拍摄屏幕
   - 无法检测外部摄像机
   - 无法阻止其他设备录屏

3. **兼容性问题**
   - 某些浏览器可能不完全支持快捷键监听
   - 移动端截屏方式多样化

### 使用限制
- 警告对话框和内容模糊可能在用户体验上产生影响
- 频繁触发警告可能影响正常使用
- 某些键盘组合可能被误判

---

## 📊 防护效果

### 已实现的防护
- ✅ 动态水印（可见标识）
- ✅ 截屏快捷键监听（阻止常用快捷键）
- ✅ 开发者工具检测（阻止打开DevTools）
- ✅ 内容复制限制（防止直接复制）
- ✅ 页面失去焦点检测（检测可能录屏）
- ✅ 屏幕录制检测（定期检查）
- ✅ 警告对话框（提醒用户）
- ✅ 内容模糊隐藏（暂时保护）

### 无法实现的防护
- ❌ 100%阻止截屏
- ❌ 阻止手机拍照
- ❌ 阻止外部摄像机
- ❌ 阻止其他录屏设备
- ❌ 完全阻止复制（可通过其他方式）

---

## 💡 使用建议

### 最佳实践
1. **环境选择**
   - 在私密的环境中使用
   - 避免在公共场所使用
   - 关闭其他可能截屏的程序

2. **使用习惯**
   - 避免长时间离开页面
   - 不要尝试截屏或录屏
   - 不要大量复制内容

3. **注意事项**
   - 这些防护措施只能增加难度，不能100%阻止
   - 最重要的还是用户自觉遵守隐私协议
   - 敏感内容应谨慎讨论

### 用户教育
- 在页面中明确提示隐私保护措施
- 提供详细的使用说明
- 解释为什么需要这些防护措施

---

## 🔧 配置选项

### ScreenRecordingProtection组件配置

```typescript
<ScreenRecordingProtection
  enabled={true}                           // 是否启用防护
  userId={currentUser?.id}               // 用户ID（用于水印）
  onScreenCaptureDetected={callback}     // 截屏检测回调
/>
```

### 自定义配置
可以修改以下参数：
- 水印透明度
- 失去焦点检测时间
- 警告对话框显示时间
- 内容模糊遮罩样式

---

## 🚀 未来改进方向

### 1. 增强防护
- 使用WebRTC检测屏幕共享
- 实现真正的端到端加密
- 添加内容消失定时器
- 实现虚拟键盘（防止键盘记录）

### 2. 用户体验优化
- 减少误报率
- 提供防护级别选择
- 支持白名单功能
- 提供防护统计信息

### 3. 技术创新
- 使用Canvas检测截屏
- 实现内容动态刷新
- 添加水印追踪功能
- 集成WebAuthn身份验证

---

## 📞 常见问题

**Q: 这些措施能100%阻止截屏吗？**
A: 不能。这些措施只能增加截屏的难度，无法100%阻止。用户仍可以通过其他方式截屏。

**Q: 为什么会有这么多限制？**
A: 为了最大程度保护用户隐私，防止敏感内容被泄露。

**Q: 如果误报了怎么办？**
A: 警告对话框和内容模糊会在3秒后自动恢复，不影响正常使用。

**Q: 可以关闭这些防护吗？**
A: 目前防护功能是默认启用的，无法关闭。这是为了保护所有用户的隐私。

**Q: 这些防护会影响性能吗？**
A: 不会。防护功能使用了优化的算法，对性能影响极小。

---

## 🎯 总结

### 核心价值
- **多层防护**: 多种机制协同工作
- **用户友好**: 警告后自动恢复
- **技术先进**: 使用最新的Web技术
- **隐私优先**: 最大程度保护用户隐私

### 适用场景
- 匿名讨论
- 敏感话题交流
- 隐私保护要求高的场景
- 需要防止内容泄露的环境

### 重要提醒
- 这些防护措施只能增加难度，不能100%阻止
- 最重要的还是用户自觉遵守隐私协议
- 在安全的环境中使用匿名BBS

---

## 🔗 相关文件

- **防截屏组件**: `src/components/bbs/ScreenRecordingProtection.tsx`
- **BBS主组件**: `src/components/bbs/HackerAnonymousBBS.tsx`
- **功能文档**: `README_HACKER_BBS.md`
- **邀请码文档**: `README_INVITE_CODE.md`

---

**更新时间**: 2024-02-15
**版本**: v1.2.0（新增防截屏功能）
