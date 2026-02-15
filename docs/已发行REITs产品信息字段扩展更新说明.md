# 已发行REITs产品信息字段扩展更新说明

## 更新时间
2025-01-15

## 更新目的
为已发行REITs产品列表页面增加更多实时行情字段，提供更全面的市场数据展示。

## 新增字段

### 1. 开盘价 (open)
- **说明**: 当日开盘价格
- **数据类型**: number
- **显示格式**: 两位小数（如 8.50）
- **单位**: 元
- **生成方式**: 模拟数据（发行价的98%-100%）

### 2. 最新价 (price)
- **说明**: 当前最新成交价格
- **数据类型**: number
- **显示格式**: 两位小数（如 8.65）
- **单位**: 元
- **颜色**: 普通文本（黑色/白色）
- **备注**: 已存在字段，优化显示格式

### 3. 涨跌幅 (changePercent)
- **说明**: 当日涨跌百分比
- **数据类型**: number
- **显示格式**: 两位小数 + 百分号（如 +1.23% 或 -0.56%）
- **颜色**: 红涨绿跌（>0 红色，<0 绿色，=0 灰色）
- **生成方式**: 模拟数据（-1% 到 +1%）

### 4. 涨跌额 (change)
- **说明**: 当日涨跌绝对值
- **数据类型**: number
- **显示格式**: 两位小数（如 +0.12 或 -0.05）
- **颜色**: 红涨绿跌
- **备注**: 已存在字段，保留显示

### 5. 成交量 (volume)
- **说明**: 当日成交数量
- **数据类型**: number
- **显示格式**: 智能格式化
  - >= 1亿手：显示为"X.XX亿手"
  - >= 1万手：显示为"X.XX万手"
  - < 1万手：显示为"X手"
- **单位**: 手
- **生成方式**: 模拟数据（0-1000万手）

### 6. 换手率 (turnoverRate)
- **说明**: 成交量占流通份额的比例
- **数据类型**: number
- **显示格式**: 两位小数 + 百分号（如 0.85%）
- **颜色**: 普通文本
- **计算公式**: 换手率 = 成交量 / 流通份额 × 100%
- **生成方式**: 模拟数据（0-2%）

## 字段顺序调整

### 修改前
1. 代码
2. 名称
3. 收盘价
4. 首发价
5. 发行时间
6. 涨跌幅
7. 涨跌额

### 修改后
1. 代码
2. 名称
3. **开盘价** ⬅️ 新增
4. **最新价** ⬅️ 新增
5. **涨跌幅** ⬅️ 调整顺序
6. **涨跌额** ⬅️ 调整顺序
7. **成交量** ⬅️ 新增
8. **换手率** ⬅️ 新增
9. 发行时间 ⬅️ 移到最后

## 修改内容

### 1. 数据服务 (`src/lib/services/simple-real-data-service.ts`)

#### Quote接口更新
```typescript
export interface Quote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  turnoverRate: number;  // ⬅️ 新增字段
  updateTime: string;
}
```

#### 模拟数据生成
```typescript
const mockVolume = Math.floor(Math.random() * 10000000); // 随机成交量
const mockTurnoverRate = (Math.random() * 2).toFixed(2); // 随机换手率 0-2%

const mockQuote: Quote = {
  // ... 其他字段
  volume: mockVolume,
  turnoverRate: parseFloat(mockTurnoverRate),
  // ...
};
```

#### 真实数据解析
```typescript
// 估算换手率（如果API不提供）
const turnoverRate = volume > 0 
  ? parseFloat(((volume / 10000000) * 0.1).toFixed(2)) 
  : 0;

return {
  // ... 其他字段
  volume,
  turnoverRate,
  // ...
};
```

### 2. REITs列表页面 (`pages/issued-reits.tsx`)

#### 数据映射
```typescript
const productsWithQuotes = data.map((p: any) => ({
  ...p,
  issuePrice: p.issuePrice,
  price: p.quote?.price || p.issuePrice,
  open: p.quote?.open || 0,  // ⬅️ 新增
  change: p.quote?.change || 0,
  changePercent: p.quote?.changePercent || 0,
  volume: p.quote?.volume || 0,  // ⬅️ 新增
  turnoverRate: p.quote?.turnoverRate || 0,  // ⬅️ 新增
}));
```

#### 表格表头
```tsx
<thead>
  <tr className="border-b border-gray-200 dark:border-gray-700">
    <th className="text-left py-3 px-4 font-semibold text-sm">代码</th>
    <th className="text-left py-3 px-4 font-semibold text-sm">名称</th>
    <th className="text-right py-3 px-4 font-semibold text-sm">开盘价</th>
    <th className="text-right py-3 px-4 font-semibold text-sm">最新价</th>
    <th className="text-right py-3 px-4 font-semibold text-sm">涨跌幅</th>
    <th className="text-right py-3 px-4 font-semibold text-sm">涨跌额</th>
    <th className="text-right py-3 px-4 font-semibold text-sm">成交量</th>
    <th className="text-right py-3 px-4 font-semibold text-sm">换手率</th>
    <th className="text-center py-3 px-4 font-semibold text-sm">发行时间</th>
  </tr>
</thead>
```

#### 数据行显示
```tsx
<td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
  {product.open > 0 ? product.open.toFixed(2) : '-'}
</td>
<td className="py-3 px-4 text-sm text-right font-medium">
  {product.price ? product.price.toFixed(2) : '0.00'}
</td>
<td className={`py-3 px-4 text-sm text-right font-semibold ${product.changePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
  {product.changePercent >= 0 ? '+' : ''}{product.changePercent.toFixed(2)}%
</td>
<td className={`py-3 px-4 text-sm text-right font-semibold ${product.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
  {product.change >= 0 ? '+' : ''}{product.change.toFixed(2)}
</td>
<td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
  {product.volume > 0 ? formatVolume(product.volume) : '-'}
</td>
<td className={`py-3 px-4 text-sm text-right font-semibold ${product.turnoverRate >= 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
  {product.turnoverRate > 0 ? product.turnoverRate.toFixed(2) + '%' : '-'}
</td>
```

#### 成交量格式化函数
```tsx
const formatVolume = (volume: number) => {
  if (volume >= 100000000) {
    return `${(volume / 100000000).toFixed(2)}亿手`;
  } else if (volume >= 10000) {
    return `${(volume / 10000).toFixed(2)}万手`;
  }
  return `${volume}手`;
};
```

## 数据展示效果

### 示例数据
| 代码 | 名称 | 开盘价 | 最新价 | 涨跌幅 | 涨跌额 | 成交量 | 换手率 | 发行时间 |
|------|------|--------|--------|--------|--------|--------|--------|----------|
| 508000 | 沪杭甬高速REIT | 8.45 | 8.65 | +1.23% | +0.12 | 123.45万手 | 0.85% | 2021-06-07 |
| 508001 | 普洛斯REIT | 3.52 | 3.55 | +0.85% | +0.03 | 89.76万手 | 0.65% | 2021-06-21 |

### 颜色规范
- **开盘价**: 灰色（`text-gray-600 dark:text-gray-400`）
- **最新价**: 黑色/白色（普通文本）
- **涨跌幅**: 红涨绿跌（`text-red-600` 或 `text-green-600`）
- **涨跌额**: 红涨绿跌
- **成交量**: 灰色
- **换手率**: 黑色/白色（普通文本）

## 注意事项

1. **数据一致性**: 确保所有数据生成函数都包含新增字段
2. **类型安全**: Quote接口已更新，包含所有字段定义
3. **显示格式**: 所有小数统一保留两位小数
4. **响应式布局**: 表格支持水平滚动，适配移动端
5. **数据验证**: 新增字段都有默认值（0），避免空值错误

## 后续优化建议

1. **真实数据接入**: 接入真实的实时行情API，替换模拟数据
2. **历史数据**: 增加历史行情查询功能
3. **K线图**: 集成K线图展示价格走势
4. **数据排序**: 支持按各列排序（如按成交量、涨跌幅排序）
5. **筛选功能**: 增加涨跌幅、成交量等筛选条件

## 测试建议

### 功能测试
1. 访问 `/issued-reits` 页面，检查表格是否正确显示所有字段
2. 检查成交量格式化是否正确（万手、亿手）
3. 检查换手率是否在合理范围内（0-2%）
4. 检查涨跌幅颜色是否正确（红涨绿跌）

### 数据验证
1. 确认开盘价 <= 最高价
2. 确认开盘价 >= 最低价
3. 确认换手率 = 成交量 / 流通份额 × 100%（真实数据时）
4. 确认涨跌幅和涨跌额的关系正确

### 边界测试
1. 测试成交量为0的情况
2. 测试换手率为0的情况
3. 测试开盘价为0的情况
4. 测试涨跌幅度较大（如±10%）的情况

## 相关文件

- `pages/issued-reits.tsx` - REITs列表页面
- `src/lib/services/simple-real-data-service.ts` - 数据服务
- `src/lib/data/real-reits-products.ts` - REITs产品数据
- `src/types/index.ts` - 类型定义

## 版本历史

### v1.0.0 (2025-01-15)
- 新增开盘价字段
- 新增成交量字段
- 新增换手率字段
- 优化最新价显示
- 调整字段顺序
- 增加成交量智能格式化
