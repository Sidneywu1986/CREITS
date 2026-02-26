# 数据采集管道与知识图谱系统

## 概述

本系统实现了REITs智能助手的数据采集管道与知识图谱功能，为Agent提供丰富的外部数据支持。

## 功能模块

### 第一阶段：数据采集管道 ✅

#### 1. 外部数据采集服务 (ExternalDataCollector)
- **功能**: 采集四类数据资产
  - REITs基础数据（深交所/上交所公募REITs平台）
  - 政策文件（发改委/证监会官网）
  - 财经新闻（国内新闻API）
  - 交易所公告（深交所/上交所公告系统）
- **特性**:
  - 支持全量和增量采集
  - 自动记录采集日志
  - 数据质量监控
  - 速率限制保护

#### 2. 用户行为追踪服务 (UserBehaviorTracker)
- **功能**: 前端无痕埋点
  - 页面访问追踪
  - 搜索行为追踪
  - 导出行为追踪
  - Agent交互追踪
- **隐私保护**:
  - SHA-256 Hash用户ID（不可逆）
  - 敏感词自动过滤
  - 90天数据保留
  - 用户可禁用追踪

#### 3. 数据规范化服务 (DataNormalizer)
- **功能**: 数据清洗与规范化
  - 统一数据格式
  - 自动清洗和去重
  - 数据验证
  - 时间序列索引
- **特性**:
  - 智能字段映射
  - 类型自动转换
  - 数据完整性检查
  - 质量报告生成

### 第二阶段：知识图谱 ✅

#### 1. 知识图谱构建服务 (KnowledgeGraph)
- **功能**: 构建REITs领域知识图谱
  - 从八张表抽取REITs节点
  - 从政策库抽取政策节点
  - 从新闻库抽取事件节点
  - 计算节点关联强度
- **节点类型**:
  - REITs节点（REITs产品）
  - 政策节点（监管政策）
  - 事件节点（新闻/公告）
  - 资产节点（底层资产）
  - 基金节点（管理公司）
- **关系类型**:
  - affects（政策→REITs）
  - related_to（事件→REITs）
  - contains（REITs→资产）
  - managed_by（REITs→基金）

#### 2. 图谱查询接口
- 自然语言问答（规划中）
- 关联分析（规划中）
- 趋势预测（规划中）

## 数据库表结构

### 数据采集表
- `collected_reits` - 已上市REITs基础信息
- `collected_policies` - 政策文件（带全文）
- `collected_news` - 新闻（带情感标签）
- `collected_announcements` - 交易所公告
- `data_collection_config` - 数据采集配置
- `data_collection_logs` - 数据采集日志
- `data_quality_metrics` - 数据质量监控

### 用户行为表
- `user_page_views` - 用户页面访问记录（脱敏）
- `user_searches` - 用户搜索行为记录（脱敏）
- `user_exports` - 用户导出行为记录（脱敏）
- `user_agent_interactions` - 用户Agent交互记录（脱敏）
- `user_behavior_aggregated` - 用户行为聚合统计
- `user_behavior_privacy` - 用户行为隐私配置

### 知识图谱表
- `graph_nodes` - 图谱节点
- `graph_edges` - 图谱关系
- `node_reits` - REITs节点属性
- `node_policies` - 政策节点属性
- `node_events` - 事件节点属性
- `node_assets` - 资产节点属性
- `node_funds` - 基金公司节点属性
- `graph_paths` - 图谱路径
- `graph_query_cache` - 图谱查询缓存

## API使用

### 启动数据采集

```bash
POST /api/v1/data-collection/pipeline
Headers:
  X-API-Key: your-api-key
Body:
{
  "action": "collect",
  "dataType": "reits",
  "collectionType": "incremental"
}
```

### 构建知识图谱

```bash
POST /api/v1/data-collection/pipeline
Headers:
  X-API-Key: your-api-key
Body:
{
  "action": "build-graph"
}
```

### 生成数据质量报告

```bash
POST /api/v1/data-collection/pipeline
Headers:
  X-API-Key: your-api-key
Body:
{
  "action": "report"
}
```

### 完整管道（采集 + 规范化 + 构建图谱）

```bash
POST /api/v1/data-collection/pipeline
Headers:
  X-API-Key: your-api-key
Body:
{
  "action": "full-pipeline"
}
```

## 使用示例

### 1. 启动REITs数据采集

```typescript
import { externalDataCollector, DataType, CollectionType } from '@/lib/data-collection/external-collector';

// 增量采集
const result = await externalDataCollector.startCollection(
  DataType.REITS,
  CollectionType.INCREMENTAL
);

console.log(`采集完成: ${result.recordsCollected} 条记录`);
```

### 2. 追踪用户行为

```typescript
import { userBehaviorTracker } from '@/lib/data-collection/user-behavior-tracker';

// 追踪页面访问
await userBehaviorTracker.trackPageView(
  userId,
  '/reits/180101',
  '首钢绿能',
  '/reits'
);

// 追踪搜索行为
await userBehaviorTracker.trackSearch(
  userId,
  '基础设施REITs',
  'reits',
  { asset_type: 'infrastructure' },
  10
);

// 追踪导出行为
await userBehaviorTracker.trackExport(
  userId,
  'pdf',
  'single',
  'reits',
  null,
  1,
  1024000
);
```

### 3. 构建知识图谱

```typescript
import { knowledgeGraph } from '@/lib/knowledge-graph/graph-builder';

// 构建完整图谱
const result = await knowledgeGraph.buildGraph();

console.log(`图谱构建完成:`);
console.log(`- REITs节点: ${result.reits}`);
console.log(`- 政策节点: ${result.policies}`);
console.log(`- 事件节点: ${result.events}`);
console.log(`- 资产节点: ${result.assets}`);
console.log(`- 基金节点: ${result.funds}`);
console.log(`- 关系: ${result.edges}`);
```

### 4. 获取节点关系网络

```typescript
// 获取节点关系网络（深度2）
const network = await knowledgeGraph.getNodeNetwork(nodeId, 2);

console.log(`节点: ${network.nodes.length}`);
console.log(`关系: ${network.edges.length}`);
```

## 部署说明

### 1. 执行数据库Schema

```bash
# 数据采集表
psql -f lib/supabase/data-collection-schema.sql

# 用户行为表
psql -f lib/supabase/user-behavior-schema.sql

# 知识图谱表
psql -f lib/supabase/knowledge-graph-schema.sql
```

### 2. 配置环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_USER_HASH_SALT=your-salt-for-hashing
```

### 3. 设置定时任务

使用Cron或其他调度工具定时执行数据采集：

```bash
# 每小时采集一次新闻
0 * * * * curl -X POST http://localhost:5000/api/v1/data-collection/pipeline \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"action":"collect","dataType":"news"}'

# 每天采集一次政策
0 2 * * * curl -X POST http://localhost:5000/api/v1/data-collection/pipeline \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"action":"collect","dataType":"policies"}'

# 每天构建一次知识图谱
0 3 * * * curl -X POST http://localhost:5000/api/v1/data-collection/pipeline \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"action":"build-graph"}'
```

## 保密措施

### 1. 数据采集
- ✅ 公开政策/公告：无需加密
- ✅ 财经新闻：匿名调用
- ✅ 用户行为：脱敏+聚合
- ✅ 外部研报：签署NDA

### 2. 数据存储
- 公开数据（政策、公告、新闻）：明文存储
- 内部数据（处理后的洞察）：加密存储
- 敏感数据（用户行为）：加密+访问控制

### 3. 对外低调
- 爬虫频率：模拟人类访问
- API调用：使用普通账号
- 数据使用：内部训练用
- 知识产权：尊重版权

## 下一步计划

### 第三阶段：智能提升（规划中）
- 集成自我进化服务
- 优化Agent权重
- 用新闻情绪优化市场预测
- 用政策变化优化风险评估

### 知识图谱增强（规划中）
- 自然语言问答接口
- 关联分析功能
- 趋势预测功能
- 可视化界面

## 技术栈

- **数据库**: PostgreSQL (Supabase)
- **后端**: Next.js API Routes
- **语言**: TypeScript
- **加密**: crypto-js (SHA-256)
- **调度**: Cron (计划中)

## 许可证

内部使用，禁止外传。
