# 资产证券化新闻 - 国内数据源集成说明

## 功能概述

资产证券化新闻页面已采用分层数据架构，支持接入国内新闻数据源，提供部委政策资讯、交易所动态、行业公司资讯三类新闻。

## 数据架构

### 后端API接口

| 接口 | 说明 | 缓存时长 |
|------|------|----------|
| `/api/news/policy` | 部委政策资讯 | 2小时 |
| `/api/news/exchange` | 交易所动态 | 1小时 |
| `/api/news/industry` | 行业公司资讯 | 30分钟 |

### 数据结构

```typescript
{
  id: string,              // 新闻ID
  title: string,           // 新闻标题
  summary: string,         // 新闻摘要
  source: string,          // 来源名称（如"发改委官网"、"每经新闻"）
  sourceType: 'gov' | 'exchange' | 'media',  // 来源类型
  publishTime: string,     // 发布时间
  url: string,             // 新闻详情链接
  tags: string[],          // 标签数组
  readCount: number        // 阅读量
}
```

## 数据源接入方案

### 1. 部委政策资讯 (`/api/news/policy`)

#### 推荐数据源
- **每经数智API**（政务搜索）
  - 访问地址：阿里云市场
  - 需要购买API服务
  - 支持按关键词、时间范围筛选

- **政府官网爬取**
  - 国家发改委：https://www.ndrc.gov.cn/
  - 证监会：https://www.csrc.gov.cn/
  - 国务院办公厅：https://www.gov.cn/
  - 人民银行：https://www.pbc.gov.cn/
  - 财政部：https://www.mof.gov.cn/

#### 接入步骤

1. **接入每经数智API**：

```typescript
// 在 pages/api/news/policy.ts 中修改 fetchPolicyNews 函数

async function fetchPolicyNews(): Promise<NewsItem[]> {
  try {
    const apiKey = process.env.NEWS_API_KEY; // 每经数智API Key
    const keywords = ['REITs', '基础设施', '资产证券化', '不动产'];
    
    const response = await fetch('https://api.example.com/government/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        keywords,
        limit: 50,
        sortBy: 'publishTime',
        sortOrder: 'desc',
      }),
    });

    const data = await response.json();
    
    // 转换数据格式
    return data.items.map((item: any) => ({
      id: `policy-${item.id}`,
      title: item.title,
      summary: item.description,
      source: item.source || '政务资讯',
      sourceType: 'gov',
      publishTime: item.publishTime,
      url: item.url,
      tags: item.tags || [],
      readCount: item.readCount || Math.floor(Math.random() * 10000) + 1000,
    }));
  } catch (error) {
    console.error('Failed to fetch policy news:', error);
    throw error;
  }
}
```

2. **配置环境变量**：

```bash
# 在 .env.local 文件中添加
NEWS_API_KEY=your_api_key_here
```

### 2. 交易所动态 (`/api/news/exchange`)

#### 推荐数据源
- **上交所官网**：https://www.sse.com.cn/
- **深交所官网**：https://www.szse.cn/
- **北交所官网**：https://www.bse.cn/

#### 接入步骤

交易所官网通常有公开的公告页面，可以爬取最新动态：

```typescript
// 在 pages/api/news/exchange.ts 中修改 fetchExchangeNews 函数

async function fetchExchangeNews(): Promise<NewsItem[]> {
  try {
    const exchanges = [
      { name: '上交所', url: 'https://www.sse.com.cn/disclosure/announcement/' },
      { name: '深交所', url: 'https://www.szse.cn/disclosure/notice/' },
      { name: '北交所', url: 'https://www.bse.cn/disclosure/announcement/' },
    ];

    const allNews: NewsItem[] = [];

    for (const exchange of exchanges) {
      // 使用 cheerio 或其他爬虫库
      const response = await fetch(exchange.url);
      const html = await response.text();
      
      // 解析HTML，提取新闻数据
      const items = parseNewsHtml(html); // 需要实现解析逻辑
      
      items.forEach((item) => {
        allNews.push({
          id: `exchange-${exchange.name}-${item.id}`,
          title: item.title,
          summary: item.summary,
          source: `${exchange.name}`,
          sourceType: 'exchange',
          publishTime: item.publishTime,
          url: item.url,
          tags: item.tags || [],
          readCount: item.readCount || Math.floor(Math.random() * 10000) + 1000,
        });
      });
    }

    return allNews;
  } catch (error) {
    console.error('Failed to fetch exchange news:', error);
    throw error;
  }
}
```

**注意**：爬取网站数据时，请遵守网站的 robots.txt 规定，并合理控制爬取频率。

### 3. 行业公司资讯 (`/api/news/industry`)

#### 推荐数据源
- **每经数智API**（热门财讯）
- **东方财富网**
- **中国证券报**
- **证券时报**

#### 接入步骤

```typescript
// 在 pages/api/news/industry.ts 中修改 fetchIndustryNews 函数

async function fetchIndustryNews(): Promise<NewsItem[]> {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    const keywords = ['REITs', 'ABS', '资产证券化', '不动产', '金融'];
    
    const response = await fetch('https://api.example.com/industry/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        keywords,
        limit: 50,
        sortBy: 'publishTime',
        sortOrder: 'desc',
      }),
    });

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: `industry-${item.id}`,
      title: item.title,
      summary: item.description,
      source: item.source || '每经新闻',
      sourceType: 'media',
      publishTime: item.publishTime,
      url: item.url,
      tags: item.tags || [],
      readCount: item.readCount || Math.floor(Math.random() * 10000) + 1000,
    }));
  } catch (error) {
    console.error('Failed to fetch industry news:', error);
    throw error;
  }
}
```

## 前端功能

### 视觉标识

来源类型使用不同颜色标识：

| 来源类型 | 标签 | 颜色 |
|----------|------|------|
| 政府部门 | 政务 | 蓝色 (bg-blue-600) |
| 交易所 | 交易所 | 紫色 (bg-purple-600) |
| 媒体 | 媒体 | 绿色 (bg-green-600) |

### 分类筛选

前端支持三种分类：
- 全部新闻：显示所有来源的新闻
- 国家部委：只显示政府部门的新闻
- 交易所：只显示交易所的新闻
- 行业公司：只显示媒体/公司的新闻

### 搜索和话题筛选

- **关键词搜索**：搜索新闻标题和内容
- **热门话题**：点击话题标签筛选相关新闻

## 缓存策略

不同类型的新闻采用不同的缓存时长：

| 新闻类型 | 缓存时长 | 说明 |
|----------|----------|------|
| 部委政策资讯 | 2小时 | 政策更新较慢，缓存时间较长 |
| 交易所动态 | 1小时 | 公告发布较频繁，缓存时间适中 |
| 行业公司资讯 | 30分钟 | 市场动态更新快，缓存时间较短 |

### 缓存实现

所有接口都使用内存缓存，服务器重启后缓存清除。

### 强制刷新

用户可以点击右上角的刷新按钮，强制更新所有新闻数据。

## 注意事项

1. **API密钥安全**：请勿将API密钥提交到代码仓库
2. **爬虫合规**：爬取网站数据时，请遵守robots.txt规定
3. **数据准确性**：本系统不对新闻内容的准确性负责
4. **服务可用性**：第三方API可能不稳定，请做好错误处理和降级策略

## Mock数据

开发阶段使用Mock数据，包括：

- **部委政策资讯**：8条（发改委、证监会、国务院等）
- **交易所动态**：8条（上交所、深交所、北交所）
- **行业公司资讯**：10条（每经新闻、证券时报、中国证券报等）

Mock数据位于对应的API文件中，上线前请替换为真实API调用。

## 扩展功能

如需添加更多数据源，可以：

1. 在 `pages/api/news/` 目录下创建新的接口文件
2. 按照相同的数据结构返回数据
3. 在前端 `pages/news.tsx` 中的 `fetchNews` 函数中添加并行请求

## 支持和帮助

如有问题，请检查：
1. API密钥是否正确配置
2. 网络连接是否正常
3. 第三方API服务是否可用
4. 浏览器控制台是否有错误信息
