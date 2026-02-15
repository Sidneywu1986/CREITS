# REITs产品涨跌幅小数位控制更新说明

## 更新时间
2025-01-15

## 更新目的
统一控制已发行REITs产品的涨跌幅显示格式，确保所有涨跌幅数据均保留两位小数。

## 修改内容

### 1. REITs列表页面 (`pages/issued-reits.tsx`)

#### 修改前问题
- 涨跌幅列显示的是 `change`（涨跌额），而不是 `changePercent`（涨跌幅）
- 涨跌额列计算的是相对于首发价的百分比，格式不正确
- 收盘价和首发价没有使用 `.toFixed(2)` 格式化

#### 修改后
```tsx
// 收盘价 - 保留两位小数
<td className="py-3 px-4 text-sm text-right">
  {product.price ? product.price.toFixed(2) : '0.00'}
</td>

// 首发价 - 保留两位小数
<td className="py-3 px-4 text-sm text-right">
  {product.issuePrice ? product.issuePrice.toFixed(2) : '-'}
</td>

// 涨跌幅 - 使用 changePercent，保留两位小数
<td className={`py-3 px-4 text-sm text-right font-semibold ${product.changePercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
  {product.changePercent >= 0 ? '+' : ''}{product.changePercent.toFixed(2)}%
</td>

// 涨跌额 - 使用 change，保留两位小数
<td className={`py-3 px-4 text-sm text-right font-semibold ${product.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
  {product.change >= 0 ? '+' : ''}{product.change.toFixed(2)}
</td>
```

### 2. 服务端数据生成 (`src/lib/services/simple-real-data-service.ts`)

#### 修改内容
在生成模拟数据和解析真实数据时，统一使用 `toFixed(2)` 保留两位小数。

#### 模拟数据生成
```tsx
// 修改前
change: (Math.random() - 0.5) * 2, // -1% 到 +1%
changePercent: (Math.random() - 0.5) * 2,

// 修改后
const mockChange = (Math.random() - 0.5) * 2; // -1% 到 +1%
const mockQuote: Quote = {
  change: parseFloat(mockChange.toFixed(2)), // 保留两位小数
  changePercent: parseFloat(mockChange.toFixed(2)), // 保留两位小数
};
```

#### 真实数据解析
```tsx
// 修改前
return {
  code,
  name,
  price: close,
  change,
  changePercent,
  // ...
};

// 修改后
return {
  code,
  name,
  price: close,
  change: parseFloat(change.toFixed(2)), // 保留两位小数
  changePercent: parseFloat(changePercent.toFixed(2)), // 保留两位小数
  // ...
};
```

## 影响范围

### 已确认正确的页面
以下页面已经正确使用 `.toFixed(2)` 显示涨跌幅，无需修改：

1. **REITs详情页** (`pages/issued-reits/[code].tsx`)
   - 涨跌幅：`{quote.changePercent.toFixed(2)}%` ✅
   - 涨跌额：`{quote.change.toFixed(2)}` ✅
   - 最新价：`{quote.price.toFixed(2)}` ✅

2. **市场行情页** (`pages/market.tsx`)
   - 全球REITs指数：`{item.changePercent.toFixed(2)}%` ✅
   - 全球主要市场股指：`{item.changePercent.toFixed(2)}%` ✅
   - REITs产品表格：`{item.changePercent.toFixed(2)}%` ✅

## 数据格式规范

### 字段说明
- `change`：涨跌额（绝对值），例如：+0.12（表示价格涨了0.12元）
- `changePercent`：涨跌幅（百分比），例如：+1.23%（表示价格涨了1.23%）

### 显示格式
- **涨跌幅**：`+1.23%` 或 `-1.23%`（两位小数 + 百分号）
- **涨跌额**：`+0.12` 或 `-0.12`（两位小数，无百分比符号）
- **价格**：`8.50`（两位小数，无百分比符号）

### 颜色规范
- **上涨（>= 0）**：红色（`text-red-600` / `text-red-400`）
- **下跌（< 0）**：绿色（`text-green-600` / `text-green-400`）
- **持平（= 0）**：灰色（`text-gray-600` / `text-gray-400`）

## 测试建议

### 功能测试
1. 访问 `/issued-reits` 页面，检查列表中每个产品的涨跌幅显示
2. 点击任意产品，进入详情页，检查实时行情卡片的涨跌幅显示
3. 访问 `/market` 页面，检查全球REITs指数和全球主要市场股指的涨跌幅显示

### 数据验证
1. 检查涨跌幅是否都是两位小数
2. 检查涨跌幅的颜色是否正确（红涨绿跌）
3. 检查涨跌幅的符号是否正确（正数为上涨，负数为下跌）

### 边界测试
1. 测试涨跌幅为 0 的情况
2. 测试涨跌幅为非常小数值（如 0.01%）的情况
3. 测试涨跌幅为非常大数值（如 10.00%）的情况

## 注意事项

1. **服务端 vs 前端**：最佳实践是在服务端返回原始浮点数，前端显示时才格式化。但为了确保数据一致性，我们在服务端就使用了 `toFixed(2)`。

2. **类型转换**：使用 `parseFloat()` 将格式化后的字符串转回数字类型，避免后续计算时出现类型错误。

3. **数据来源**：
   - 模拟数据：已修改，保证两位小数
   - 真实数据：从新浪财经API获取，解析时自动格式化为两位小数

## 后续优化建议

1. **国际化**：考虑支持不同地区的数字格式（如千分位分隔符）
2. **精度控制**：如果需要更高精度，可以考虑使用 `toFixed(4)` 或更多位小数
3. **性能优化**：对于大量数据，可以考虑在服务端统一格式化，减少前端计算负担
4. **数据验证**：添加数据验证逻辑，确保涨跌幅在合理范围内（如 -20% 到 +20%）

## 相关文件

- `pages/issued-reits.tsx` - REITs列表页
- `pages/issued-reits/[code].tsx` - REITs详情页
- `pages/market.tsx` - 市场行情页
- `src/lib/services/simple-real-data-service.ts` - 数据服务
