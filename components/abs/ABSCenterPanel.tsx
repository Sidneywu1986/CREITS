'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  RefreshCw,
  Download,
  Building2,
  DollarSign,
  TrendingUp,
  Building,
  Filter,
  Calendar,
  X,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { absDatabase, type ABSProduct } from '@/lib/database/abs-db';

// 特定品种标签配置
const SPECIAL_TAGS = [
  { name: '绿色低碳', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', keywords: ['绿色', '环保', '生态', '可持续', '可再生能源', '清洁能源', '减排', '节能'] },
  { name: '科技创新', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', keywords: ['科技', '创新', '科创', '技术', '研发', '人工智能', '数字化', '智能制造'] },
  { name: '知识产权', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', keywords: ['知识产权', '专利', '商标', '版权', 'IP'] },
  { name: '乡村振兴', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', keywords: ['乡村振兴', '农业', '农村', '农产', '三农', '扶贫'] },
  { name: '"一带一路"', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400', keywords: ['一带一路', '丝绸之路', '跨境', '国际'] },
  { name: '住房租赁', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400', keywords: ['住房租赁', '租赁住房', '保障性租赁住房', '长租公寓', '公寓'] },
];

// 资产类型选项
const ASSET_TYPE_OPTIONS = ['不限', '债权类', '未来经营收入类', '不动产抵押贷款类'];

// 发行场所选项
const MARKET_OPTIONS = ['不限', '交易所', '银行间', '其他'];

// 存续状态选项
const STATUS_OPTIONS = ['不限', '存续', '到期'];

// 专项筛选选项
const SPECIAL_FILTER_OPTIONS = ['不限', 'REITs相关', '城投平台', 'PPP项目'];

export function ABSCenterPanel() {
  const [products, setProducts] = useState<ABSProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ABSProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAssetType, setSelectedAssetType] = useState('不限');
  const [selectedMarket, setSelectedMarket] = useState('不限');
  const [selectedStatus, setSelectedStatus] = useState('不限');
  const [selectedSpecial, setSelectedSpecial] = useState('不限');

  // 排序
  const [sortField, setSortField] = useState('issue_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchKeyword, selectedAssetType, selectedMarket, selectedStatus, selectedSpecial]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('[ABSCenterPanel] 开始加载数据...');
      const productsData = await absDatabase.getAllProducts();
      console.log('[ABSCenterPanel] 加载到产品数量:', productsData.length);
      setProducts(productsData);
      setLastUpdate(new Date().toLocaleString('zh-CN'));
    } catch (error) {
      console.error('[ABSCenterPanel] 加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // 关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(p =>
        (p.product_name || '').toLowerCase().includes(keyword) ||
        (p.issuer_name || '').toLowerCase().includes(keyword) ||
        (p.asset_type_sub || '').toLowerCase().includes(keyword)
      );
    }

    // 资产类型筛选
    if (selectedAssetType !== '不限') {
      filtered = filtered.filter(p => (p.asset_type_main || '') === selectedAssetType);
    }

    // 发行场所筛选
    if (selectedMarket !== '不限') {
      filtered = filtered.filter(p => (p.issuing_market || '') === selectedMarket);
    }

    // 存续状态筛选
    if (selectedStatus !== '不限') {
      filtered = filtered.filter(p => (p.status || '') === selectedStatus);
    }

    // 专项筛选（REITs相关、城投平台等）
    if (selectedSpecial !== '不限') {
      if (selectedSpecial === 'REITs相关') {
        filtered = filtered.filter(p =>
          (p.product_name || '').toLowerCase().includes('reits') ||
          (p.underlying_asset || '').toLowerCase().includes('不动产') ||
          (p.underlying_asset || '').toLowerCase().includes('物业') ||
          (p.asset_type_sub || '').toLowerCase().includes('cmbs') ||
          (p.asset_type_sub || '').toLowerCase().includes('不动产')
        );
      } else if (selectedSpecial === '城投平台') {
        filtered = filtered.filter(p =>
          (p.issuer_name || '').toLowerCase().includes('城投') ||
          (p.issuer_name || '').toLowerCase().includes('平台') ||
          (p.issuer_name || '').toLowerCase().includes('投资') ||
          (p.product_name || '').toLowerCase().includes('城投')
        );
      } else if (selectedSpecial === 'PPP项目') {
        filtered = filtered.filter(p =>
          (p.product_name || '').toLowerCase().includes('ppp') ||
          (p.asset_type_sub || '').toLowerCase().includes('ppp')
        );
      }
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof ABSProduct];
      let bValue: any = b[sortField as keyof ABSProduct];

      if (sortField === 'issue_date') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSpecialTags = (product: ABSProduct) => {
    const productName = (product.product_name || '').toLowerCase();
    const underlyingAsset = (product.underlying_asset || '').toLowerCase();
    const combinedText = productName + ' ' + underlyingAsset;

    return SPECIAL_TAGS.filter(tag =>
      tag.keywords.some(keyword => combinedText.includes(keyword.toLowerCase()))
    );
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿元`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // 计算统计数据
  const stats = {
    totalProducts: products.length,
    totalScale: products.reduce((sum, p) => sum + (p.total_scale || 0), 0),
    reitsRelated: products.filter(p =>
      (p.product_name || '').toLowerCase().includes('reits') ||
      (p.underlying_asset || '').toLowerCase().includes('不动产') ||
      (p.underlying_asset || '').toLowerCase().includes('物业') ||
      (p.asset_type_sub || '').toLowerCase().includes('cmbs')
    ).length,
    cityPlatform: products.filter(p =>
      (p.issuer_name || '').toLowerCase().includes('城投') ||
      (p.issuer_name || '').toLowerCase().includes('平台') ||
      (p.issuer_name || '').toLowerCase().includes('投资')
    ).length,
  };

  // 准备发行趋势图数据
  const getTrendData = () => {
    const trendMap = new Map<string, { count: number; scale: number }>();
    
    products.forEach(p => {
      const year = new Date(p.issue_date || '').getFullYear();
      if (year > 2015 && year <= new Date().getFullYear()) {
        const key = `${year}`;
        if (!trendMap.has(key)) {
          trendMap.set(key, { count: 0, scale: 0 });
        }
        const data = trendMap.get(key)!;
        data.count += 1;
        data.scale += p.total_scale || 0;
      }
    });

    const years = Array.from(trendMap.keys()).sort();
    const counts = years.map(y => trendMap.get(y)!.count);
    const scales = years.map(y => trendMap.get(y)!.scale);

    return { years, counts, scales };
  };

  // 准备类型分布图数据
  const getTypeDistribution = () => {
    const typeMap = new Map<string, number>();
    
    products.forEach(p => {
      const subType = p.asset_type_sub || '其他';
      typeMap.set(subType, (typeMap.get(subType) || 0) + 1);
    });

    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const trendData = getTrendData();
  const typeData = getTypeDistribution();

  // 趋势图配置
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          color: '#fff'
        }
      },
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      data: ['发行数量', '发行规模（亿元）'],
      textStyle: { color: '#cbd5e1', fontSize: 13 },
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: trendData.years,
        axisLabel: { color: '#cbd5e1', fontSize: 12 },
        axisLine: { lineStyle: { color: '#64748b' } }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '数量',
        position: 'left',
        axisLabel: { color: '#cbd5e1', fontSize: 12 },
        axisLine: { lineStyle: { color: '#64748b' } },
        splitLine: { lineStyle: { color: '#475569', type: 'dashed' } },
        nameTextStyle: { color: '#cbd5e1', fontSize: 12 }
      },
      {
        type: 'value',
        name: '规模（亿元）',
        position: 'right',
        axisLabel: { color: '#cbd5e1', fontSize: 12 },
        axisLine: { lineStyle: { color: '#64748b' } },
        splitLine: { show: false },
        nameTextStyle: { color: '#cbd5e1', fontSize: 12 }
      }
    ],
    series: [
      {
        name: '发行数量',
        type: 'line',
        smooth: true,
        data: trendData.counts,
        itemStyle: { 
          color: '#60a5fa',
          borderWidth: 2,
          borderColor: '#fff'
        },
        lineStyle: { 
          color: '#60a5fa', 
          width: 3,
          shadowColor: 'rgba(96, 165, 250, 0.5)',
          shadowBlur: 10
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(96, 165, 250, 0.5)' },
              { offset: 1, color: 'rgba(96, 165, 250, 0.1)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 8
      },
      {
        name: '发行规模（亿元）',
        type: 'bar',
        yAxisIndex: 1,
        data: trendData.scales,
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#a78bfa' },
              { offset: 1, color: '#7c3aed' }
            ]
          },
          borderRadius: [6, 6, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  };

  // 类型分布图配置
  const typeOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#475569',
      textStyle: {
        color: '#fff',
        fontSize: 13
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: { 
        color: '#cbd5e1',
        fontSize: 12
      },
      itemGap: 12
    },
    series: [
      {
        name: '基础资产类型',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#1e293b',
          borderWidth: 3
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: '#cbd5e1',
          fontSize: 12,
          fontWeight: '500'
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: '#64748b'
          }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: typeData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: [
              '#60a5fa',  // 蓝色
              '#a78bfa',  // 紫色
              '#f472b6',  // 粉色
              '#34d399',  // 绿色
              '#fbbf24',  // 黄色
              '#f97316',  // 橙色
              '#06b6d4',  // 青色
              '#8b5cf6',  // 深紫
            ][index % 8],
            borderWidth: 3,
            borderColor: '#1e293b'
          }
        }))
      }
    ]
  };

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedAssetType('不限');
    setSelectedMarket('不限');
    setSelectedStatus('不限');
    setSelectedSpecial('不限');
  };

  const exportData = () => {
    const headers = ['产品名称', '发起机构', '基础资产', '资产类型', '发行日期', '发行规模(亿元)', '状态'];
    const rows = filteredProducts.map(p => [
      p.product_name,
      p.issuer_name,
      p.underlying_asset,
      p.asset_type_sub,
      formatDate(p.issue_date || ''),
      (p.total_scale || 0).toFixed(2),
      p.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ABS数据中心_${new Date().toLocaleDateString('zh-CN')}.csv`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#667eea]/20 to-[#667eea]/10 border-[#667eea]/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="text-sm text-slate-300 flex items-center">
              <Building2 className="mr-2 h-4 w-4 text-[#667eea]" />
              发行总数
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.totalProducts}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              更新: {lastUpdate}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#764ba2]/20 to-[#764ba2]/10 border-[#764ba2]/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="text-sm text-slate-300 flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-[#764ba2]" />
              发行总规模
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatAmount(stats.totalScale)}
            </div>
            <div className="text-sm text-slate-400 mt-1">累计发行</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border-emerald-500/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="text-sm text-slate-300 flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-emerald-400" />
              REITs相关ABS
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.reitsRelated}
            </div>
            <div className="text-sm text-slate-400 mt-1">不动产类资产</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-500/10 border-orange-500/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="text-sm text-slate-300 flex items-center">
              <Building className="mr-2 h-4 w-4 text-orange-400" />
              城投平台ABS
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.cityPlatform}
            </div>
            <div className="text-sm text-slate-400 mt-1">基础设施类</div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-white">
              <TrendingUp className="mr-2 h-5 w-5 text-[#667eea]" />
              ABS发行趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={trendOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center text-white">
              <Building2 className="mr-2 h-5 w-5 text-[#764ba2]" />
              基础资产类型分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={typeOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>
      </div>

      {/* 产品列表 */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              ABS产品列表
              <span className="ml-2 text-sm font-normal text-slate-400">
                共 {filteredProducts.length} 个项目
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportData} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                <Download className="mr-2 h-4 w-4" />
                导出数据
              </Button>
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选区域 */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="搜索产品名称、发起机构、基础资产..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-9 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#667eea]"
                  />
                </div>
              </div>

              <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
                <SelectTrigger className="w-[160px] bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="资产类型" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {ASSET_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-slate-700">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger className="w-[120px] bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="发行场所" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {MARKET_OPTIONS.map(option => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-slate-700">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[100px] bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-slate-700">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSpecial} onValueChange={setSelectedSpecial}>
                <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-white">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="专项筛选" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {SPECIAL_FILTER_OPTIONS.map(option => (
                    <SelectItem key={option} value={option} className="text-white hover:bg-slate-700">{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-300 hover:bg-slate-700 hover:text-white">
                <X className="mr-2 h-4 w-4" />
                重置
              </Button>
            </div>
          </div>

          {/* 表格 */}
          <div className="rounded-md border border-slate-700/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-700/30">
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-700/50 text-slate-300"
                    onClick={() => handleSort('product_name')}
                  >
                    产品名称
                    {sortField === 'product_name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead className="text-slate-300">发起机构</TableHead>
                  <TableHead className="text-slate-300">基础资产类型</TableHead>
                  <TableHead className="text-slate-300">特殊标签</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-700/50 text-right text-slate-300"
                    onClick={() => handleSort('total_scale')}
                  >
                    发行规模
                    {sortField === 'total_scale' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-700/50 text-slate-300"
                    onClick={() => handleSort('issue_date')}
                  >
                    发行日期
                    {sortField === 'issue_date' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead className="text-slate-300">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      暂无匹配的数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.slice(0, 20).map((product) => {
                    const specialTags = getSpecialTags(product);
                    return (
                      <TableRow key={product.id} className="hover:bg-slate-700/30 border-b border-slate-700/50">
                        <TableCell className="font-medium text-white">
                          <div className="max-w-[200px] truncate" title={product.product_name}>
                            {product.product_name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="max-w-[120px] truncate" title={product.issuer_name}>
                            {product.issuer_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-500">
                              {product.asset_type_main}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {product.asset_type_sub}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {specialTags.map((tag) => (
                              <Badge key={tag.name} className={tag.color} variant="secondary">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-white">
                          {formatAmount(product.total_scale || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-300">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {formatDate(product.issue_date || '')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.status === '存续' ? 'default' : 'secondary'}
                            className={product.status === '存续'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-600/50 text-slate-400 border-slate-600/30'
                            }
                          >
                            {product.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length > 20 && (
            <div className="mt-4 text-center text-sm text-slate-400">
              显示前 20 条数据，共 {filteredProducts.length} 条。使用筛选条件缩小范围或导出全部数据。
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
