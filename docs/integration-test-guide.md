# 集成测试与验证文档

本文档提供完整的测试和验证指南，确保Supabase和飞书集成正常工作。

## 📋 目录
1. [环境准备](#1环境准备)
2. [数据库测试](#2数据库测试)
3. [飞书集成测试](#3飞书集成测试)
4. [API路由测试](#4api路由测试)
5. [前端功能测试](#5前端功能测试)
6. [性能测试](#6性能测试)
7. [验收清单](#7验收清单)

---

## 1. 环境准备

### 1.1 检查环境变量
```bash
# 查看当前环境变量配置
cat .env.local
```

必需的环境变量：
```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 飞书配置
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=your_app_secret

# MySQL配置（用于数据迁移，可选）
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=reits_db
```

### 1.2 启动开发服务器
```bash
# 启动开发环境
pnpm dev

# 或使用coze命令
coze dev
```

访问：http://localhost:5000

---

## 2. 数据库测试

### 2.1 运行数据库连接测试
```bash
# 自动化测试
node scripts/test-supabase-connection.js
```

**预期输出**：
```
========================================
  Supabase 数据库连接测试
========================================

========== 检查环境变量 ==========
✅ 环境变量配置正确
   URL: https://your-project.supabase.co
   Key: eyJhbGciOiJIUzI1NiIs...

========== 测试数据库连接 ==========
✅ 数据库连接成功

========== 检查数据库表 ==========
✅ reit_product_info - 表已创建
✅ reit_property_base - 表已创建
✅ reit_property_equity_ops - 表已创建
✅ reit_property_concession_ops - 表已创建
✅ reit_financial_metrics - 表已创建
✅ reit_valuation - 表已创建
✅ reit_risk_compliance - 表已创建
✅ reit_market_stats - 表已创建

========== 测试数据操作 ==========
1️⃣  插入测试数据...
✅ 插入成功
2️⃣  查询测试数据...
✅ 查询成功
3️⃣  更新测试数据...
✅ 更新成功
4️⃣  删除测试数据...
✅ 删除成功

========== 测试报告 ==========

🎉 所有测试通过！Supabase配置成功！
```

### 2.2 手动数据库测试

#### 测试1：查询产品列表
```bash
curl -X GET "http://localhost:5000/api/database/query/products" \
  -H "Content-Type: application/json"
```

**预期响应**：
```json
{
  "success": true,
  "data": [
    {
      "reit_code": "508000.SH",
      "reit_short_name": "沪杭甬高速REIT",
      "fund_manager": "浙江沪杭甬高速公路股份有限公司",
      ...
    }
  ],
  "count": 50
}
```

#### 测试2：查询市场数据
```bash
curl -X GET "http://localhost:5000/api/database/query/market?reit_code=508000.SH" \
  -H "Content-Type: application/json"
```

#### 测试3：查询财务指标
```bash
curl -X GET "http://localhost:5000/api/database/query/metrics?reit_code=508000.SH" \
  -H "Content-Type: application/json"
```

#### 测试4：查询资产信息
```bash
curl -X GET "http://localhost:5000/api/database/query/assets?reit_code=508000.SH" \
  -H "Content-Type: application/json"
```

### 2.3 数据库服务测试

在浏览器Console中执行：
```javascript
import { reitsDB } from '@/lib/database/reits-db';

// 测试1：获取所有产品
const products = await reitsDB.getAllProducts();
console.log('产品数量:', products.length);

// 测试2：获取单个产品
const product = await reitsDB.getProductByCode('508000.SH');
console.log('产品信息:', product);

// 测试3：获取完整信息
const fullInfo = await reitsDB.getFullProductInfo('508000.SH');
console.log('完整信息:', fullInfo);

// 测试4：搜索产品
const searchResults = await reitsDB.searchProducts('高速');
console.log('搜索结果:', searchResults);

// 测试5：获取统计数据
const stats = await reitsDB.getProductStats();
console.log('统计数据:', stats);
```

---

## 3. 飞书集成测试

### 3.1 运行飞书连接测试
```bash
# 配置测试用户ID（在.env.local中）
TEST_FEISHU_USER_ID=your_user_open_id

# 运行测试
node scripts/test-feishu-connection.js
```

**预期输出**：
```
========================================
  飞书集成测试
========================================

========== 检查环境变量 ==========
✅ 环境变量配置正确
   App ID: cli_xxxxxxxxxxxxxxxx
   App Secret: xxxxxxxxxx...

========== 测试访问令牌 ==========
✅ 获取访问令牌成功
   Token: eyJhbGciOiJIUzI1NiIs...
   过期时间: 7200秒

========== 测试发送消息 ==========
✅ 消息发送成功
   接收人: ou_xxxxxxxxxxxxxxxx

========== 测试审批功能 ==========
✅ 创建审批成功
   实例代码: INST_xxxxxxxxxxxxxxxx
   标题: REITs智能助手-测试审批

========== 测试报告 ==========

🎉 基础连接测试通过！
```

### 3.2 API路由测试

#### 测试1：发送文本消息
```bash
curl -X POST "http://localhost:5000/api/feishu/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ou_xxxxxxxxxxxxxxxx",
    "messageType": "text",
    "content": "这是一条测试消息"
  }'
```

#### 测试2：发送审批通知
```bash
curl -X POST "http://localhost:5000/api/feishu/send-approval-notification" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ou_xxxxxxxxxxxxxxxx",
    "approvalTitle": "测试审批",
    "reitName": "测试REIT",
    "fundManager": "测试管理人",
    "status": "PENDING"
  }'
```

#### 测试3：创建审批
```bash
curl -X POST "http://localhost:5000/api/feishu/create-approval" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ou_xxxxxxxxxxxxxxxx",
    "reitCode": "508000.SH",
    "reitName": "沪杭甬高速REIT",
    "fundManager": "浙江沪杭甬高速公路股份有限公司",
    "totalAssets": 50.00,
    "approverIds": ["approver_id_1", "approver_id_2"]
  }'
```

### 3.3 前端功能测试

#### 测试1：发送风险预警
在浏览器Console中执行：
```javascript
import { sendRiskAlert } from '@/lib/services/feishu/message';

await sendRiskAlert({
  receiveId: 'ou_xxxxxxxxxxxxxxxx',
  idType: 'open_id',
  reitCode: '508000.SH',
  reitName: '沪杭甬高速REIT',
  riskType: '出租率下降',
  riskLevel: 'HIGH',
  description: '本月出租率下降至85%，低于去年同期水平。',
  recommendation: '建议加强租赁推广，提升出租率。'
});
```

#### 测试2：上传文档
```javascript
import { uploadFile } from '@/lib/services/feishu/document';

const file = new File(['测试内容'], 'test.txt');
const fileInfo = await uploadFile(file, 'test.txt');
console.log('文件上传成功:', fileInfo);
```

---

## 4. API路由测试

### 4.1 产品查询API

```bash
# 获取所有产品
curl http://localhost:5000/api/database/query/products

# 按资产类型筛选
curl "http://localhost:5000/api/database/query/products?asset_type_national=交通基础设施"

# 分页查询
curl "http://localhost:5000/api/database/query/products?limit=10&offset=0"
```

### 4.2 市场数据API

```bash
# 获取所有产品的最新市场数据
curl http://localhost:5000/api/database/query/market

# 获取特定产品的市场数据
curl "http://localhost:5000/api/database/query/market?reit_code=508000.SH"

# 获取日期范围内的数据
curl "http://localhost:5000/api/database/query/market?start_date=2024-01-01&end_date=2024-12-31"
```

### 4.3 财务指标API

```bash
# 获取财务指标
curl "http://localhost:5000/api/database/query/metrics?reit_code=508000.SH"

# 按报告类型筛选
curl "http://localhost:5000/api/database/query/metrics?reit_code=508000.SH&report_type=年报"
```

### 4.4 资产信息API

```bash
# 获取资产信息
curl "http://localhost:5000/api/database/query/assets?reit_code=508000.SH"

# 获取产权类运营数据
curl "http://localhost:5000/api/database/query/equity-ops?reit_code=508000.SH"

# 获取经营权类运营数据
curl "http://localhost:5000/api/database/query/concession-ops?reit_code=508000.SH"
```

---

## 5. 前端功能测试

### 5.1 已发行REITs页面测试

访问：http://localhost:5000/issued-reits

**测试项**：
- [ ] 页面正常加载
- [ ] 产品列表正常显示
- [ ] 开盘价、最新价、成交量、换手率字段正常显示
- [ ] 涨跌幅红绿颜色正确
- [ ] 小数位数正确（2位）
- [ ] 排序功能正常
- [ ] 分页功能正常
- [ ] 搜索功能正常

### 5.2 REITs八张表页面测试

访问：http://localhost:5000/reits-eight-tables

**测试项**：
- [ ] 产品信息表正常显示
- [ ] 底层资产表正常显示
- [ ] 运营数据表正常显示
- [ ] 财务指标表正常显示
- [ ] 估值信息表正常显示
- [ ] 风险合规表正常显示
- [ ] 市场表现表正常显示
- [ ] 图表正常渲染
- [ ] 数据导出功能正常

### 5.3 REITs估值计算器测试

访问：http://localhost:5000/valuation-calculator

**测试项**：
- [ ] 表单输入正常
- [ ] 计算结果正确
- [ ] 图表显示正常
- [ ] 重置功能正常

### 5.4 匿名BBS测试

访问：http://localhost:5000/bbs

**测试项**：
- [ ] 页面正常加载
- [ ] 可以创建新主题
- [ ] 可以发送消息
- [ ] 消息实时更新
- [ ] 在线用户数显示正确

---

## 6. 性能测试

### 6.1 数据库查询性能

```javascript
// 在浏览器Console中执行
import { reitsDB } from '@/lib/database/reits-db';

// 测试查询性能
console.time('查询所有产品');
const products = await reitsDB.getAllProducts();
console.timeEnd('查询所有产品');

console.time('查询完整信息');
const fullInfo = await reitsDB.getFullProductInfo('508000.SH');
console.timeEnd('查询完整信息');

console.time('搜索产品');
const results = await reitsDB.searchProducts('高速');
console.timeEnd('搜索产品');
```

**预期性能**：
- 查询所有产品：< 500ms
- 查询完整信息：< 1000ms
- 搜索产品：< 300ms

### 6.2 前端渲染性能

```javascript
// 在浏览器Console中执行
console.time('页面加载');
console.timeEnd('页面加载');

// 使用Chrome DevTools Performance面板分析
```

### 6.3 API响应性能

```bash
# 测试API响应时间
time curl http://localhost:5000/api/database/query/products
```

**预期性能**：
- API响应时间：< 200ms (P95)
- 数据库查询时间：< 100ms (P95)

---

## 7. 验收清单

### 7.1 功能验收

#### 数据库功能
- [ ] 所有8张表已创建
- [ ] 数据连接正常
- [ ] CRUD操作正常
- [ ] 批量操作正常
- [ ] 搜索功能正常
- [ ] 统计查询正常
- [ ] 数据导出正常

#### 飞书集成
- [ ] 访问令牌获取正常
- [ ] 消息发送正常
- [ ] 审批创建正常
- [ ] 审批查询正常
- [ ] 文档上传正常
- [ ] 卡片消息正常

#### 前端功能
- [ ] 已发行REITs页面正常
- [ ] REITs八张表页面正常
- [ ] 估值计算器正常
- [ ] 匿名BBS正常
- [ ] 所有路由正常
- [ ] 样式显示正常

### 7.2 性能验收

- [ ] 页面加载时间 < 2s
- [ ] API响应时间 < 200ms (P95)
- [ ] 数据库查询时间 < 100ms (P95)
- [ ] 首屏渲染时间 < 1s
- [ ] 无内存泄漏

### 7.3 安全验收

- [ ] 环境变量已配置
- [ ] 敏感信息未泄露
- [ ] API有适当的错误处理
- [ ] 日志中无敏感信息
- [ ] 跨域配置正确

### 7.4 兼容性验收

- [ ] Chrome浏览器正常
- [ ] Firefox浏览器正常
- [ ] Safari浏览器正常
- [ ] Edge浏览器正常
- [ ] 移动端浏览器正常

---

## 8. 问题排查

### 8.1 数据库连接失败

**症状**：`Supabase连接失败`

**排查步骤**：
1. 检查 `.env.local` 中的Supabase配置
2. 验证网络连接
3. 检查Supabase项目是否正常
4. 查看浏览器Console错误信息
5. 查看项目日志：`/app/work/logs/bypass/app.log`

### 8.2 飞书API调用失败

**症状**：`飞书API调用失败`

**排查步骤**：
1. 检查App ID和App Secret是否正确
2. 检查权限是否已配置
3. 检查审批模板代码是否正确
4. 查看飞书开放平台错误码
5. 运行 `node scripts/test-feishu-connection.js` 测试

### 8.3 API路由404

**症状**：`API路由返回404`

**排查步骤**：
1. 确认路由文件存在：`pages/api/...`
2. 检查路由路径是否正确
3. 重启开发服务器
4. 清除浏览器缓存

### 8.4 数据显示异常

**症状**：数据不显示或显示错误

**排查步骤**：
1. 检查数据库中是否有数据
2. 检查API返回的数据格式
3. 检查前端数据处理逻辑
4. 查看浏览器Console错误信息

---

## 9. 回归测试

每次修改后，运行以下测试确保功能正常：

### 快速回归测试
```bash
# 1. 测试数据库连接
node scripts/test-supabase-connection.js

# 2. 测试飞书连接（如需要）
node scripts/test-feishu-connection.js

# 3. 启动开发服务器
pnpm dev

# 4. 访问主要页面
# - http://localhost:5000/issued-reits
# - http://localhost:5000/bbs
```

### 完整回归测试
按照本文档第1-6节的完整测试流程执行。

---

## 📞 需要帮助？

如果测试失败：
1. 查看项目日志：`/app/work/logs/bypass/app.log`
2. 查看浏览器Console错误信息
3. 查看网络请求（F12 → Network）
4. 参考相关配置文档

---

## 📚 相关文档

- [Supabase配置指南](supabase-setup-guide.md)
- [飞书集成指南](feishu-integration-guide.md)
- [数据迁移指南](migration-guide.md)
- [数据库Schema定义](../database/schema.sql)
