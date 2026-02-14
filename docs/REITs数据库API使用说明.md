# REITs 数据库 API 使用说明

## 概述

REITs 数据库提供 8 张核心数据表的 API 接口，支持产品信息、底层资产、运营数据、财务指标、估值、风险合规、市场表现等全生命周期数据查询。

## 数据格式规范

### 1. 时间序列数据

**定义**：出租率、财务指标、市场表现等随时间变化的数据

**返回格式**：
- 接口返回数组，按报告期（`report_date`）或交易日期（`trade_date`）升序排序
- 前端可直接使用数据绘制折线图、柱状图等趋势图表

**示例**：
```json
{
  "success": true,
  "data": [
    {
      "reit_code": "508000.SH",
      "report_date": "2024-03-31",
      "occupancy_rate": 94.2,
      "rental_income": 30500
    },
    {
      "reit_code": "508000.SH",
      "report_date": "2024-06-30",
      "occupancy_rate": 94.8,
      "rental_income": 31000
    },
    {
      "reit_code": "508000.SH",
      "report_date": "2024-09-30",
      "occupancy_rate": 95.5,
      "rental_income": 32000
    }
  ]
}
```

**应用场景**：
- 财务指标：`reit_financial_metrics`
- 市场表现：`reit_market_stats`
- 产权类运营：`reit_property_equity_ops`
- 经营权类运营：`reit_property_concession_ops`

### 2. 长文本字段

**定义**：风险描述、租户列表、持有人列表等结构化文本

**存储格式**：JSON 字符串

**示例**：
```json
{
  "top_tenant_name": "[\"京东物流\", \"菜鸟网络\", \"苏宁物流\", \"顺丰速运\", \"中通快递\"]",
  "top10_holder_names": "[\"机构A\", \"机构B\", \"机构C\", \"机构D\", \"机构E\"]"
}
```

**前端处理**：
```javascript
// 解析 JSON 字段
const tenants = JSON.parse(data.top_tenant_name);
// tenants = ["京东物流", "菜鸟网络", "苏宁物流", "顺丰速运", "中通快递"]

// 展示时用逗号连接
const displayText = tenants.join(', ');
// "京东物流, 菜鸟网络, 苏宁物流, 顺丰速运, 中通快递"
```

**应用场景**：
- 前十大租户名称：`reit_property_equity_ops.top_tenant_name`
- 前十大持有人名称：`reit_market_stats.top10_holder_names`

### 3. 资产类型判断

**判断依据**：通过 `asset_type_csrc` 字段判断资产类型

**产权类资产**（`reit_property_equity_ops`）：
- 产业园
- 仓储物流
- 商业、购物中心
- 保障性租赁住房
- 租赁住房
- 写字楼
- 公寓
- 厂房
- 数据中心

**经营权类资产**（`reit_property_concession_ops`）：
- 收费公路、高速公路
- 桥梁、隧道
- 港口、机场
- 垃圾焚烧、生物质发电
- 污水处理、供水、供电、供热

**前端判断逻辑**：
```javascript
const EQUITY_ASSET_TYPES = [
  '产业园', '仓储物流', '商业', '购物中心', '保障性租赁住房',
  '租赁住房', '写字楼', '公寓', '厂房', '数据中心'
];

const CONCESSION_ASSET_TYPES = [
  '收费公路', '高速公路', '桥梁', '隧道', '港口', '机场',
  '垃圾焚烧', '生物质发电', '污水处理', '供水', '供电', '供热'
];

const assetTypeCsrc = product.asset_type_csrc || '';
let assetType;

if (EQUITY_ASSET_TYPES.some(type => assetTypeCsrc.includes(type))) {
  assetType = 'equity';
  // 调用产权类运营数据接口
} else if (CONCESSION_ASSET_TYPES.some(type => assetTypeCsrc.includes(type))) {
  assetType = 'concession';
  // 调用经营权类运营数据接口
} else {
  assetType = 'unknown';
}
```

## 历史数据追溯

### 概念

部分表（如 `reit_property_base`）支持历史版本，通过 `effective_date` 和 `expiration_date` 字段实现历史追溯。

### 版本标记

- **最新版本**：`expiration_date = '9999-12-31'`
- **历史版本**：`expiration_date < '9999-12-31'`

### 查询规则

**API 行为**：默认只返回最新版本（`expiration_date = '9999-12-31'`）

**前端展示**：在展示"土地信息"、"权证"等字段时，默认取最新版本

**查询历史数据**（如需要）：
```sql
-- 查询某个资产的历史版本
SELECT * FROM reit_property_base
WHERE property_id = 'PROP-001'
ORDER BY effective_date DESC;

-- 查询特定时间点的版本
SELECT * FROM reit_property_base
WHERE property_id = 'PROP-001'
  AND effective_date <= '2023-01-01'
  AND expiration_date > '2023-01-01';
```

## API 接口列表

### 1. 产品信息

**接口**：`GET /api/database/query/products`

**参数**：
- `reit_code` (可选)：指定基金代码

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "reit_code": "508000.SH",
      "reit_short_name": "沪杭甬高速REIT",
      "fund_manager": "浙江沪杭甬高速公路股份有限公司",
      "asset_type_csrc": "收费公路",
      "listing_date": "2021-06-21",
      "total_assets": 100.5,
      "leverage_ratio": 25.5
    }
  ],
  "count": 1
}
```

### 2. 底层资产

**接口**：`GET /api/database/query/assets`

**参数**：
- `reit_code` (可选)：指定基金代码

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "property_id": "PROP-001",
      "reit_code": "508000.SH",
      "property_name": "杭甬高速公路",
      "location_province": "浙江省",
      "location_city": "杭州市",
      "effective_date": "2020-01-01",
      "expiration_date": "9999-12-31"
    }
  ],
  "count": 1
}
```

### 3. 产权类运营数据

**接口**：`GET /api/database/query/equity-ops`

**参数**：
- `reit_code` (必需)：基金代码
- `property_id` (可选)：资产ID

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "property_id": "PROP-002",
      "reit_code": "508001.SH",
      "report_date": "2024-09-30",
      "occupancy_rate": 95.5,
      "average_rent": 1.8,
      "rental_income": 32000,
      "top_tenant_name": "[\"京东物流\", \"菜鸟网络\", ...]"
    }
  ],
  "count": 1,
  "asset_type": "equity"
}
```

### 4. 经营权类运营数据

**接口**：`GET /api/database/query/concession-ops`

**参数**：
- `reit_code` (必需)：基金代码
- `property_id` (可选)：资产ID

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "property_id": "PROP-001",
      "reit_code": "508000.SH",
      "report_date": "2024-09-30",
      "traffic_volume_avg_daily": 85000,
      "toll_income": 150000,
      "remaining_concession_years": 75
    }
  ],
  "count": 1,
  "asset_type": "concession"
}
```

### 5. 财务指标

**接口**：`GET /api/database/query/metrics`

**参数**：
- `reit_code` (必需)：基金代码

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "reit_code": "508000.SH",
      "report_date": "2024-09-30",
      "report_type": "季报",
      "ffo": 30000,
      "available_for_distribution": 26000,
      "distribution_yield": 5.0
    }
  ],
  "count": 5
}
```

### 6. 市场表现

**接口**：`GET /api/database/query/market`

**参数**：
- `reit_code` (必需)：基金代码

**返回数据**：
```json
{
  "success": true,
  "data": [
    {
      "reit_code": "508000.SH",
      "trade_date": "2025-01-15",
      "close_price": 5.25,
      "daily_volume": 50000,
      "market_cap": 1000000000
    }
  ],
  "count": 5
}
```

## 前端注意事项

### 1. 历史数据展示

在展示 `reit_property_base` 表的"土地信息"、"权证"等字段时，默认取 `expiration_date = '9999-12-31'` 的最新版本。

### 2. 图表库选择

推荐使用 **ECharts** 或 **AntV**，支持：
- K线图（股价）
- 折线图（趋势）
- 饼图（占比）
- 柱状图（对比）

### 3. 响应式设计

- **PC端**：完美展示，主要用户是机构投资者和分析师
- **移动端**：简化适配，保留核心功能

### 4. 数据格式化

- 日期格式：`2024-09-30` → `2024年9月30日`
- 金额格式：`30000` → `3.00 亿元`
- 百分比：`5.2` → `5.2%`
- 数值格式：`50000` → `50,000`

## 测试数据

当前 API 提供测试数据，包含：

- **产品**：沪杭甬高速REIT、普洛斯REIT、首钢绿能REIT
- **资产类型**：
  - 沪杭甬高速REIT：收费公路（经营权类）
  - 普洛斯REIT：仓储物流（产权类）
  - 首钢绿能REIT：垃圾焚烧（经营权类）

## 部署说明

1. **配置 Supabase**：在 `.env.local` 中配置 Supabase 连接参数
2. **初始化数据库**：执行 `database/schema.sql` 创建表结构
3. **导入数据**：使用 Supabase Dashboard 或 API 导入真实 REITs 数据
4. **替换测试数据**：将 API 中的 mock 数据替换为真实数据查询

## 错误处理

所有 API 遵循统一的错误响应格式：

```json
{
  "success": false,
  "error": "错误信息描述"
}
```

常见错误：
- `400 Bad Request`：缺少必需参数
- `405 Method Not Allowed`：请求方法错误
- `500 Internal Server Error`：服务器内部错误
