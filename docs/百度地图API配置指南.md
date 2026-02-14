# 百度地图 API Key 配置指南

## 快速开始

### 第一步：申请 API Key

1. 访问百度地图开放平台：http://lbsyun.baidu.com/apiconsole/key/create
2. 登录或注册百度账号
3. 创建应用，填写以下信息：
   - 应用名称：REITs智能助手
   - 应用类型：浏览器端
   - 启用服务：JavaScript API v3.0

### 第二步：替换代码中的 API Key

打开文件：`src/components/reits/BaiduMapLocationSelector.tsx`

找到第 **52** 行左右的代码：

```typescript
const script = document.createElement('script');
script.src = `https://api.map.baidu.com/api?v=3.0&ak=YOUR_BAIDU_MAP_AK&callback=initBaiduMap`;
```

将 `YOUR_BAIDU_MAP_AK` 替换为你申请到的 API Key，例如：

```typescript
const script = document.createElement('script');
script.src = `https://api.map.baidu.com/api?v=3.0&ak=你的实际API密钥&callback=initBaiduMap`;
```

### 第三步：测试地图

1. 保存文件
2. 刷新浏览器
3. 地图应该正常加载并显示

## 免费版配额

- 每天：6,000 次调用
- 每秒：50 次并发

超出免费额度后，地图可能无法正常显示，建议购买付费版或监控使用量。

## 获取 API Key 示例

假设你申请到的 API Key 是：`abcd1234efgh5678ijkl9012mnop3456`

修改后的代码应该是：

```typescript
const script = document.createElement('script');
script.src = `https://api.map.baidu.com/api?v=3.0&ak=abcd1234efgh5678ijkl9012mnop3456&callback=initBaiduMap`;
```

## 注意事项

1. ⚠️ **不要将真实的 API Key 提交到公开的代码仓库**
2. ⚠️ **生产环境建议配置 Referer 白名单**
3. ⚠️ **监控 API 调用量，避免超出免费额度**

## 环境变量方案（推荐）

如果使用环境变量，可以创建 `.env.local` 文件：

```env
NEXT_PUBLIC_BAIDU_MAP_AK=你的实际API密钥
```

然后修改代码：

```typescript
const script = document.createElement('script');
const apiKey = process.env.NEXT_PUBLIC_BAIDU_MAP_AK || 'YOUR_BAIDU_MAP_AK';
script.src = `https://api.map.baidu.com/api?v=3.0&ak=${apiKey}&callback=initBaiduMap`;
```

## 故障排查

### 地图显示空白
- 检查 API Key 是否正确
- 检查浏览器控制台是否有错误
- 确认网络连接正常

### 搜索功能不工作
- 确认已启用 "JavaScript API v3.0" 服务
- 检查 API Key 是否有剩余配额

### API Key 无效
- 确认应用类型为"浏览器端"
- 确认已启用正确的服务
- 联系百度地图技术支持

## 相关文档

- [百度地图 JavaScript API v3.0 文档](https://lbsyun.baidu.com/index.php?title=jspopular3.0)
- [百度地图计费说明](https://lbsyun.baidu.com/apiconsole/price)
- [百度地图常见问题](https://lbsyun.baidu.com/index.php?title=faq)
