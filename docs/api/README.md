# REITs开放API平台 - 开发者文档

## 概述

REITs开放API平台提供RESTful API接口，允许第三方应用访问REITs数据和服务。

## 认证

### API密钥

所有API请求都需要在请求头中包含API密钥：

```http
X-API-Key: reit_xxxx_yyyy
```

### 获取API密钥

联系管理员获取API密钥，或通过管理后台创建。

## 速率限制

- 默认：1000次请求/分钟
- 可根据需求调整
- 超过限制将返回429状态码

### 响应头

```http
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2024-01-15T10:01:00Z
```

## API端点

### 1. 获取REITs产品列表

**请求**
```http
GET /api/v1/reits/products
```

**响应**
```json
{
  "success": true,
  "data": [
    {
      "reit_code": "508001",
      "reit_name": "华安张江光大园REIT",
      "listing_date": "2021-06-21",
      "fund_size": 5000000000,
      "avg_occupancy": 0.95
    }
  ],
  "meta": {
    "count": 1,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### 2. 获取单个产品详情

**请求**
```http
GET /api/v1/reits/products/:code
```

**参数**
- `code`: REITs产品代码

**响应**
```json
{
  "success": true,
  "data": {
    "reit_code": "508001",
    "reit_name": "华安张江光大园REIT",
    "listing_date": "2021-06-21",
    "fund_size": 5000000000,
    "avg_occupancy": 0.95,
    "asset_type": "产业园区"
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### 3. 获取底层资产列表

**请求**
```http
GET /api/v1/reits/properties
```

**响应**
```json
{
  "success": true,
  "data": [
    {
      "property_id": "PROP001",
      "reit_code": "508001",
      "property_name": "张江光大园一期",
      "city": "上海",
      "occupancy_rate": 0.98
    }
  ],
  "meta": {
    "count": 1,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### 4. Agent分析

**请求**
```http
POST /api/v1/agent/analyze
```

**请求体**
```json
{
  "context": {
    "table": "reit_product_info",
    "data": {
      "reit_code": "508001",
      "fund_size": 5000000000
    },
    "userId": "user123"
  }
}
```

**响应**
```json
{
  "success": true,
  "data": {
    "action": "approve",
    "finalScore": 85.5,
    "confidence": 0.88,
    "reasons": [
      {
        "category": "总体评估",
        "reasoning": "综合得分85.5分，符合审批标准",
        "evidence": ["财务健康度：85分", "风险等级：88分"],
        "confidence": 0.85
      }
    ],
    "dimensions": [
      {
        "id": "financial_health",
        "name": "财务健康度",
        "weight": 0.30,
        "score": 85,
        "details": ["资产负债率：45%", "现金流比率：1.2"]
      }
    ],
    "suggestions": [
      "建议直接通过审批"
    ],
    "timestamp": "2024-01-15T10:00:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

## 权限范围

| 权限 | 描述 |
|-----|------|
| `reits:read` | 读取REITs数据 |
| `agent:analyze` | 使用Agent分析 |
| `admin:*` | 管理员权限 |

## 错误码

| 状态码 | 错误码 | 描述 |
|-------|--------|------|
| 401 | UNAUTHORIZED | 未授权 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | NOT_FOUND | 资源不存在 |
| 429 | RATE_LIMIT_EXCEEDED | 超过速率限制 |
| 500 | INTERNAL_ERROR | 内部错误 |

## SDK示例

### JavaScript/TypeScript

```typescript
class REITsAPI {
  constructor(private apiKey: string) {}

  async getProducts() {
    const response = await fetch('/api/v1/reits/products', {
      headers: {
        'X-API-Key': this.apiKey
      }
    })
    return response.json()
  }

  async analyzeWithAgent(context: any) {
    const response = await fetch('/api/v1/agent/analyze', {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ context })
    })
    return response.json()
  }
}

// 使用
const api = new REITsAPI('reit_xxxx_yyyy')
const products = await api.getProducts()
console.log(products)
```

### Python

```python
import requests

class REITsAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = 'http://localhost:5000/api/v1'

    def get_headers(self):
        return {'X-API-Key': self.api_key}

    def get_products(self):
        response = requests.get(
            f'{self.base_url}/reits/products',
            headers=self.get_headers()
        )
        return response.json()

    def analyze_with_agent(self, context: dict):
        response = requests.post(
            f'{self.base_url}/agent/analyze',
            headers={**self.get_headers(), 'Content-Type': 'application/json'},
            json={'context': context}
        )
        return response.json()

# 使用
api = REITsAPI('reit_xxxx_yyyy')
products = api.get_products()
print(products)
```

## 联系支持

如有问题，请联系：support@reits-platform.com
