# REITs智能助手 - 定价档位实现说明

## 📦 新增文件

### 核心文件
1. **定价档位服务**
   - 文件: `src/lib/services/pricing-tier-service.ts`
   - 功能: 定义定价配置、档位枚举、权限校验、使用量统计

2. **定价页面**
   - 文件: `pages/pricing.tsx`
   - 功能: 展示定价档位、功能对比、常见问题、联系客服

3. **定价档位组件**
   - 文件: `src/components/pricing/PricingTiers.tsx`
   - 功能: 四个档位的卡片展示、价格计算、功能列表

### 数据集成文件
4. **开源数据服务**
   - 文件: `src/lib/services/open-data-service.ts`
   - 功能: 集成OpenStreetMap、高德、百度、国家统计局数据

5. **运营商数据服务**
   - 文件: `src/lib/services/carrier-data-service.ts`
   - 功能: 集成联通、移动、电信运营商数据

6. **地理位置分析服务**
   - 文件: `src/lib/services/location-analysis-service.ts`
   - 功能: 聚合多个数据源，提供统一的地理位置分析接口

7. **地图选择器组件**
   - 文件: `src/components/reits/MapLocationSelector.tsx`
   - 功能: 基于Leaflet的地图选择、定位、搜索、范围可视化

### 修改的文件
8. **地理位置分析页面**
   - 文件: `src/components/reits/LocationAnalysis.tsx`
   - 修改: 集成地图选择器组件，支持数据源选择

9. **地理位置分析API**
   - 文件: `pages/api/location-analysis/index.ts`
   - 修改: 集成定价档位校验、权限控制、使用量统计

### 文档文件
10. **定价档位设计文档**
    - 文件: `PRICING_TIER_DESIGN.md`
    - 内容: 详细的设计方案、定价策略、功能对比、转化策略

---

## 🎯 四个档位

### 1. 基础免费版（Free）
- **价格**: ¥0（永久免费）
- **数据源**: OpenStreetMap、国家统计局
- **分析能力**: 2km半径，每月50次
- **功能**: 基础POI查询、投资评分

### 2. A档 - 基础付费版（Basic）
- **价格**: ¥199/月，¥1,990/年
- **数据源**: OSM、高德、百度、国家统计局
- **分析能力**: 5km半径，每月500次
- **功能**: 历史数据、导出报告、AI洞察

### 3. B档 - 专业版（Professional）⭐推荐
- **价格**: ¥999/月，¥9,990/年
- **数据源**: 全部开源 + 联通智慧足迹
- **分析能力**: 10km半径，每月2000次
- **功能**: 实时数据、对比分析、竞品分析

### 4. C档 - 企业版（Enterprise）
- **价格**: ¥4,999/月，¥49,990/年
- **数据源**: 全部数据源 + 三大运营商聚合
- **分析能力**: 50km半径，无限次
- **功能**: 专属经理、定制开发、7x24支持

---

## 🔧 使用方式

### 1. 查看定价页面
访问: `http://localhost:5000/pricing`

### 2. 调用地理位置分析API

```bash
curl -X POST http://localhost:5000/api/location-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "address": "北京市朝阳区三里屯",
    "useOpenData": true,
    "openDataSource": "aggregated",
    "userId": "user_123"
  }'
```

### 3. 使用运营商数据

```bash
curl -X POST http://localhost:5000/api/location-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "address": "上海市陆家嘴金融区",
    "useCarrierData": true,
    "carrierDataSource": "china_unicom",
    "useOpenData": true,
    "userId": "user_456"
  }'
```

### 4. 使用地图选择器
在LocationAnalysis页面点击"使用地图选择"按钮，打开地图选择器。

---

## 📊 功能对比

| 功能 | 免费版 | A档 | B档 | C档 |
|------|--------|-----|------|------|
| OSM数据 | ✅ | ✅ | ✅ | ✅ |
| 高德数据 | ❌ | ✅ | ✅ | ✅ |
| 百度数据 | ❌ | ✅ | ✅ | ✅ |
| 联通数据 | ❌ | ❌ | ✅ | ✅ |
| 移动数据 | ❌ | ❌ | ❌ | ✅ |
| 电信数据 | ❌ | ❌ | ❌ | ✅ |
| 分析半径 | 2km | 5km | 10km | 50km |
| 月分析次数 | 50 | 500 | 2000 | 无限 |

---

## 🚀 待实现功能

### 已完成 ✅
- [x] 定价档位服务
- [x] 定价页面展示
- [x] 档位卡片组件
- [x] 开源数据集成
- [x] 运营商数据集成
- [x] 地图选择器组件
- [x] API权限校验

### 待实现 ⏳
- [ ] 用户档位数据库
- [ ] 支付系统集成
- [ ] 订阅管理功能
- [ ] 使用量统计
- [ ] 退款流程
- [ ] 发票开具

---

## 📝 注意事项

### 1. 数据源说明
- **OpenStreetMap**: 完全免费，无需API Key
- **高德地图**: 需要API Key，注册: https://lbs.amap.com/
- **百度地图**: 需要API Key，注册: https://lbsyun.baidu.com/
- **国家统计局**: 完全免费
- **运营商数据**: 需要商业合作申请

### 2. API Key配置
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_AMAP_API_KEY=your_amap_key
NEXT_PUBLIC_BAIDU_API_KEY=your_baidu_key
NEXT_PUBLIC_CHINA_UNICOM_API_KEY=your_unicom_key
```

### 3. 权限校验
所有API调用都会检查用户的档位和权限：
- 检查分析次数是否用完
- 检查数据源是否可用
- 检查分析半径是否超过限制

### 4. 升级降级
- **升级**: 立即生效，按比例补差价
- **降级**: 月末生效，已付费金额不退

---

## 📞 联系方式

如有任何问题，请查看文档或联系客服。

---

**更新时间**: 2024-01-15
**版本**: v1.0.0
