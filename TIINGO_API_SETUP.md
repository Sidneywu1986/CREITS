# 资产证券化新闻 - Tiingo API 集成说明

## 功能概述

资产证券化新闻页面已接入 Tiingo News API，提供真实的 REITs、ABS 相关新闻数据。

## 配置步骤

### 1. 获取 Tiingo API Key

1. 访问 [Tiingo 官网](https://api.tiingo.com/)
2. 注册账号并登录
3. 进入 API Keys 页面
4. 创建新的 API Key（免费层级支持每分钟 500 次请求）

### 2. 配置环境变量

在项目根目录创建或编辑 `.env.local` 文件：

```bash
TIINGO_API_KEY=your_api_key_here
```

### 3. 重启开发服务器

配置环境变量后，需要重启开发服务器才能生效：

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
coze dev
```

## API 功能说明

### 后端接口：`/api/news`

- **请求方式**: GET
- **参数**: 无（默认获取 REITs、ABS、房地产相关新闻）
- **返回数据**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "新闻标题",
        "source": "新闻来源",
        "category": "national|exchange|industry",
        "date": "2024-01-18 09:30",
        "views": 12580,
        "summary": "新闻摘要",
        "tags": ["标签1", "标签2"],
        "url": "新闻详情链接"
      }
    ],
    "cached": false,
    "timestamp": "2024-01-18T10:00:00.000Z"
  }
  ```

### 缓存机制

- **缓存时长**: 5 分钟
- **缓存位置**: 内存（服务器重启后清除）
- **缓存标识**: 响应中的 `cached` 字段为 `true` 时表示使用缓存数据

### Tiingo API 参数

当前配置的查询参数：

- `tags`: reits,abs,realestate,infrastructure,mortgage
- `limit`: 50（每次最多获取 50 条新闻）
- `sortBy`: publishedDate
- `sortOrder`: desc（最新优先）

## 前端功能

### 搜索和筛选

- **关键词搜索**: 在搜索框中输入关键词，搜索新闻标题和内容
- **分类筛选**: 点击顶部标签筛选（全部新闻、国家部委、交易所、行业公司）
- **话题筛选**: 点击热门话题标签，筛选相关新闻

### 刷新功能

- 点击右上角的刷新按钮，可以强制刷新新闻数据
- 如果 API 调用失败，会自动使用缓存数据（如果有）
- 缓存数据会在响应中显示警告信息

### 错误处理

- 如果未配置 API Key，页面会显示错误提示
- 如果 API 调用失败，页面会显示错误信息
- 错误情况下可以点击"重新加载"按钮重试

## 注意事项

1. **API Key 安全**: 请勿将 API Key 提交到代码仓库
2. **免费额度**: Tiingo 免费层级有请求限制，生产环境请购买付费计划
3. **缓存更新**: 缓存会在 5 分钟后自动过期，或通过刷新按钮强制更新
4. **数据来源**: 新闻数据来自 Tiingo API，我们不对内容的准确性负责

## 扩展功能（可选）

如需自定义新闻来源或筛选条件，可以修改 `pages/api/news.ts` 中的参数：

```typescript
const tags = ['reits', 'abs', 'realestate', 'infrastructure', 'mortgage'];
const limit = '50';  // 调整获取数量
```

## 支持和帮助

如有问题，请检查：
1. API Key 是否正确配置
2. 网络连接是否正常
3. Tiingo API 服务是否可用
4. 浏览器控制台是否有错误信息
