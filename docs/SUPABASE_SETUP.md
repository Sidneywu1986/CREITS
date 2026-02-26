# Supabase 配置与使用指南

## 概述

本文档说明如何配置和使用 Supabase 数据库存储 REITs 相关数据。

## 已完成的配置

### ✅ 1. 数据库表结构

已创建以下7个表：

| 表名 | 说明 | 用途 |
|------|------|------|
| `reits_products` | REITs 产品信息 | 存储REITs产品基本信息 |
| `reits_policies` | 政策数据 | 存储REITs相关政策 |
| `reits_news` | 新闻数据 | 存储REITs相关新闻 |
| `reits_announcements` | 公告数据 | 存储REITs相关公告 |
| `reits_valuation_history` | 估值历史 | 存储REITs净值和价格历史 |
| `reits_model_training` | 模型训练记录 | 存储模型训练结果 |
| `reits_evolution_tasks` | 进化任务记录 | 存储智能进化任务记录 |

### ✅ 2. 环境变量配置

`.env.local` 文件中已配置：

```env
# Supabase 项目URL
NEXT_PUBLIC_SUPABASE_URL=https://raplkhuxnrmshilrkjwi.supabase.co

# Supabase 匿名密钥
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_VJ7XA999pkRBwYn2ANAtGw_bHAJph0H
```

### ✅ 3. Supabase 客户端

文件位置：`src/storage/database/supabase-client.ts`

- 支持多种环境变量来源：
  - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Next.js 约定)
  - `COZE_SUPABASE_URL` / `COZE_SUPABASE_ANON_KEY` (Coze 约定)
- 自动从 .env 文件加载
- 支持带认证的客户端

### ✅ 4. 数据访问服务

文件位置：`lib/supabase/reits-data-service.ts`

提供以下服务：

- `reitsProductService` - REITs 产品 CRUD
- `reitsPolicyService` - 政策 CRUD
- `reitsNewsService` - 新闻 CRUD
- `reitsAnnouncementService` - 公告 CRUD
- `reitsValuationHistoryService` - 估值历史 CRUD
- `reitsModelTrainingService` - 模型训练记录 CRUD
- `reitsEvolutionTaskService` - 进化任务记录 CRUD

## 使用示例

### 1. 导入服务

```typescript
import {
  reitsProductService,
  reitsPolicyService,
  reitsNewsService
} from '@/lib/supabase/reits-data-service';
```

### 2. 查询数据

```typescript
// 获取所有 REITs 产品
const products = await reitsProductService.getAll();

// 获取最新政策
const policies = await reitsPolicyService.getAll({
  limit: 10,
  orderBy: 'publish_date'
});

// 获取特定代码的产品
const product = await reitsProductService.getByCode('508001');
```

### 3. 插入数据

```typescript
// 创建 REITs 产品
const newProduct = await reitsProductService.create({
  code: '508001',
  name: '沪杭甬REIT',
  issuingMarket: 'SH',
  status: 'active',
  underlyingAsset: '高速公路',
  fundSize: 50.5,
  nav: 1.2345,
  navDate: '2024-02-26T00:00:00Z',
  listingDate: '2022-06-01T00:00:00Z',
  manager: '浙江沪杭甬高速公路股份有限公司',
  custodian: '招商银行股份有限公司',
  description: '基础设施公募REITs'
});

// 批量创建政策
const policies = await reitsPolicyService.batchCreate([
  {
    title: '关于推进基础设施REITs试点的通知',
    content: '...',
    source: '国家发改委',
    url: 'https://...',
    publishDate: '2024-02-26T00:00:00Z',
    impactScore: 0.8,
    impactDirection: 'positive',
    impactLevel: 'high',
    affectedReits: ['508001', '508005'],
    keyPoints: ['要点1', '要点2'],
    summary: '政策摘要'
  }
]);
```

### 4. 更新数据

```typescript
// 更新产品
const updatedProduct = await reitsProductService.update(product.id, {
  nav: 1.2456,
  navDate: new Date().toISOString()
});
```

### 5. 删除数据

```typescript
// 删除产品
await reitsProductService.delete(product.id);
```

## API 端点示例

### 1. 获取产品列表

```typescript
// app/api/reits/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { reitsProductService } from '@/lib/supabase/reits-data-service';

export async function GET(request: NextRequest) {
  try {
    const products = await reitsProductService.getAll();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### 2. 保存政策数据

```typescript
// app/api/reits/policies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { reitsPolicyService } from '@/lib/supabase/reits-data-service';

export async function POST(request: NextRequest) {
  try {
    const policyData = await request.json();
    const policy = await reitsPolicyService.create(policyData);
    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

## 集成到数据采集流程

### 1. 保存政策数据

```typescript
import { webSearchService } from '@/lib/coze-integration/web-search-service';
import { cozeLLMService } from '@/lib/coze-integration/llm-service';
import { reitsPolicyService } from '@/lib/supabase/reits-data-service';

async function collectAndSavePolicies() {
  // 1. 搜索政策
  const policies = await webSearchService.searchPolicies({
    keywords: ['REITs', '政策'],
    count: 20,
    timeRange: '1m'
  });

  // 2. 分析政策
  const analyzedPolicies = [];
  for (const policy of policies) {
    const analysis = await cozeLLMService.analyzePolicyImpact(
      policy.snippet,
      policy.title
    );

    analyzedPolicies.push({
      title: policy.title,
      content: policy.snippet,
      source: policy.siteName,
      url: policy.url,
      publishDate: policy.publishTime,
      impactScore: analysis.impactScore,
      impactDirection: analysis.impactDirection,
      impactLevel: analysis.impactLevel,
      affectedReits: analysis.affectedReits,
      keyPoints: analysis.keyPoints,
      summary: analysis.summary,
      authorityLevel: policy.authorityLevel || 50
    });
  }

  // 3. 保存到数据库
  await reitsPolicyService.batchCreate(analyzedPolicies);

  console.log(`保存了 ${analyzedPolicies.length} 条政策数据`);
}
```

### 2. 保存新闻数据

```typescript
import { webSearchService } from '@/lib/coze-integration/web-search-service';
import { cozeLLMService } from '@/lib/coze-integration/llm-service';
import { reitsNewsService } from '@/lib/supabase/reits-data-service';

async function collectAndSaveNews() {
  // 1. 搜索新闻
  const newsList = await webSearchService.searchNews({
    keywords: ['REITs', '市场'],
    count: 30,
    timeRange: '1d'
  });

  // 2. 分析新闻
  const analyzedNews = [];
  for (const news of newsList) {
    const analysis = await cozeLLMService.analyzeNewsSentiment(
      news.snippet,
      news.title
    );

    analyzedNews.push({
      title: news.title,
      content: news.snippet,
      snippet: news.snippet,
      source: news.siteName,
      url: news.url,
      publishTime: news.publishTime,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.score,
      confidence: analysis.confidence,
      keywords: analysis.keywords,
      summary: analysis.summary,
      authorityLevel: news.authorityLevel || 50
    });
  }

  // 3. 保存到数据库
  await reitsNewsService.batchCreate(analyzedNews);

  console.log(`保存了 ${analyzedNews.length} 条新闻数据`);
}
```

### 3. 保存模型训练记录

```typescript
import { tensorflowTrainingService } from '@/lib/tensorflow/training-service';
import { reitsModelTrainingService } from '@/lib/supabase/reits-data-service';

async function trainAndSaveModel() {
  // 1. 训练模型
  const result = await tensorflowTrainingService.trainValuationModel(
    { inputs, outputs },
    { epochs: 100, batchSize: 32 }
  );

  // 2. 保存训练记录
  await reitsModelTrainingService.create({
    modelType: 'valuation',
    modelVersion: 'v1.0.0',
    architecture: 'dense',
    trainingStartTime: new Date(Date.now() - result.trainingTime).toISOString(),
    trainingEndTime: new Date().toISOString(),
    epochs: result.epochs,
    batchSize: 32,
    initialLoss: result.history.loss[0],
    finalLoss: result.finalLoss,
    finalAccuracy: result.finalAccuracy,
    validationLoss: result.history.valLoss[result.history.valLoss.length - 1],
    validationAccuracy: result.history.valAccuracy[result.history.valAccuracy.length - 1],
    stoppedEarly: result.stoppedEarly,
    bestEpoch: result.bestEpoch,
    dataCount: inputs.length,
    trainingTime: result.trainingTime,
    modelPath: '/models/valuation',
    hyperparameters: {},
    evaluationMetrics: result.evaluationResult,
    trainingHistory: result.history,
    status: 'completed'
  });

  console.log('模型训练记录已保存');
}
```

## 数据库 Schema 说明

### 表结构详情

详见 `src/storage/database/shared/schema.ts` 文件。

### 索引

所有表都已创建适当的索引以提高查询性能：
- 产品表：`code`, `status`, `issuing_market`
- 政策表：`title`, `source`, `publish_date`, `impact_score`
- 新闻表：`title`, `source`, `publish_time`, `sentiment`, `sentiment_score`
- 公告表：`product_id`, `product_code`, `announcement_type`, `publish_date`, `importance`
- 估值历史表：`product_id`, `product_code`, `valuation_date`
- 模型训练表：`model_type`, `model_version`, `status`, `training_start_time`
- 进化任务表：`task_type`, `scheduled_time`, `success`

## 测试验证

### 运行测试脚本

```bash
# 测试 Supabase 连接
npx tsx scripts/test-supabase-simple.ts

# 验证所有表
npx tsx scripts/verify-supabase-tables.ts
```

### API 测试

```bash
# 获取产品列表
curl http://localhost:5000/api/reits/products

# 创建产品
curl -X POST http://localhost:5000/api/reits/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "508001",
    "name": "沪杭甬REIT",
    "issuingMarket": "SH"
  }'
```

## 注意事项

### 1. 权限说明

- 使用匿名密钥 (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) 只能访问公开数据
- 如果需要访问私有数据，需要在 Supabase Dashboard 中配置 Row Level Security (RLS)
- 对于服务端操作，可以考虑使用服务角色密钥 (`SUPABASE_SERVICE_ROLE_KEY`)

### 2. 数据类型

- 所有时间字段使用 ISO 8601 格式字符串
- 金额和价格使用 `numeric` 类型，避免浮点数精度问题
- JSON 字段使用 `jsonb` 类型，支持高效查询

### 3. 字段命名

- TypeScript 变量使用 camelCase (如 `updatedAt`)
- 数据库字段使用 snake_case (如 `updated_at`)
- Supabase 查询时必须使用 snake_case

### 4. 批量操作

- 使用批量插入可以提高性能
- 批量插入限制：单次最多插入 1000 条记录
- 大批量数据建议分批插入

## 下一步

1. 创建 API 端点暴露数据访问功能
2. 集成到数据采集流程
3. 实现数据可视化界面
4. 配置 Row Level Security (RLS)
5. 实现数据备份和恢复
