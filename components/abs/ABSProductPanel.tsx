'use client';

import { useState, useEffect } from 'react';
import { absDatabase, type ABSProduct } from '@/lib/database/abs-db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  RefreshCw,
  Download,
  Settings,
  Save,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// 特定品种标签配置
const SPECIAL_TAGS = [
  { name: '绿色低碳', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', keywords: ['绿色', '环保', '生态', '可持续', '可再生能源', '清洁能源', '减排', '节能'] },
  { name: '科技创新', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', keywords: ['科技', '创新', '科创', '技术', '研发', '人工智能', '数字化', '智能制造'] },
  { name: '知识产权', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', keywords: ['知识产权', '专利', '商标', '版权', 'IP'] },
  { name: '乡村振兴', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', keywords: ['乡村振兴', '农业', '农村', '农产', '三农', '扶贫'] },
  { name: '"一带一路"', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400', keywords: ['一带一路', '丝绸之路', '跨境', '国际'] },
  { name: '住房租赁', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400', keywords: ['住房租赁', '租赁住房', '保障性租赁住房', '长租公寓', '公寓'] },
];

// ABS分类选项
const ABS_CATEGORIES = ['不限', '交易所', '银行间', '信贷ABS', '企业ABS', 'ABN'];

// 存续状态选项
const STATUS_OPTIONS = ['不限', '存续', '到期'];

export function ABSProductPanel() {
  const [products, setProducts] = useState<ABSProduct[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 筛选条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('不限');
  const [selectedStatus, setSelectedStatus] = useState('不限');
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  
  // 搜索维度
  const [searchDimensions, setSearchDimensions] = useState({
    productName: true,
    issuer: true,
    underlyingAsset: true,
  });

  // 排序
  const [sortField, setSortField] = useState('issue_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('[ABSProductPanel] 开始加载数据...');
      const productsData = await absDatabase.getAllProducts();
      console.log('[ABSProductPanel] 加载到产品数量:', productsData.length);
      if (productsData.length > 0) {
        console.log('[ABSProductPanel] 第一个产品:', productsData[0]);
      } else {
        console.log('[ABSProductPanel] 没有加载到任何产品数据');
      }
      setProducts(productsData);
      
      // 临时：设置测试数据
      if (productsData.length === 0) {
        console.log('[ABSProductPanel] 设置测试数据...');
        setProducts([{
          product_code: 'TEST001',
          product_full_name: '测试ABS产品',
          product_short_name: '测试ABS',
          market_type: '交易所',
          product_type: '企业ABS',
          asset_type_main: '债权类',
          asset_type_sub: '应收账款',
          issuer_name: '测试发起机构',
          trustee_name: '测试托管人',
          total_scale: 100.0,
          issue_date: '2024-01-01',
          total_tranches: 3,
          senior_tranches: 2,
          subordinate_ratio: 10.0,
        } as any]);
      }
    } catch (error) {
      console.error('[ABSProductPanel] 加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 判断产品属于哪个特定品种
  const getSpecialTags = (product: ABSProduct): string[] => {
    const tags: string[] = [];
    const searchFields = [
      product.product_short_name || '',
      product.product_full_name || '',
      product.asset_type_sub || '',
      product.issuer_name || ''
    ].join(' ').toLowerCase();
    
    for (const tag of SPECIAL_TAGS) {
      if (tag.keywords.some(keyword => searchFields.includes(keyword.toLowerCase()))) {
        tags.push(tag.name);
      }
    }
    
    return tags;
  };

  // 筛选产品
  const filteredProducts = products.filter(product => {
    // 关键词搜索 - 仅在输入关键词时才筛选
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      let matchSearch = false;
      if (searchDimensions.productName && 
          (product.product_short_name?.toLowerCase().includes(keyword) || 
           product.product_full_name?.toLowerCase().includes(keyword))) matchSearch = true;
      if (searchDimensions.issuer && product.issuer_name?.toLowerCase().includes(keyword)) matchSearch = true;
      if (searchDimensions.underlyingAsset && product.asset_type_sub?.toLowerCase().includes(keyword)) matchSearch = true;
      if (!matchSearch) return false;
    }

    // 暂时禁用所有筛选，确保数据显示
    // TODO: 实现更灵活的筛选逻辑

    return true;
  });

  // 排序
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let compareValue = 0;
    
    if (sortField === 'issue_date') {
      compareValue = new Date(a.issue_date || '').getTime() - new Date(b.issue_date || '').getTime();
    } else if (sortField === 'total_scale') {
      compareValue = (a.total_scale || 0) - (b.total_scale || 0);
    }
    
    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  // 处理排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatAmount = (amount: number) => {
    return `${amount.toFixed(2)}亿`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const calculateTermYears = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '-';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return years.toFixed(1);
  };

  const exportToExcel = () => {
    // 导出功能
    alert('导出Excel功能开发中...');
  };

  return (
    <div className="p-6">
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">调试信息</h3>
        <div>products.length = {products.length}</div>
        <div>loading = {loading ? 'true' : 'false'}</div>
        {products.length > 0 && (
          <div>第一个产品: {JSON.stringify(products[0])}</div>
        )}
      </div>
      
      {/* 顶部筛选区 */}
      <Card className="mb-6">
        <div className="p-4 space-y-4">
          {/* 我的方案 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                我的方案
              </Button>
              <select className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]">
                <option>默认方案</option>
              </select>
            </div>
          </div>

          {/* 搜索区 */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="请输入关键词搜索"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]"
              />
              <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
                更多
              </Button>
            </div>
            
            {/* 搜索维度 */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchDimensions.productName}
                  onChange={(e) => setSearchDimensions({ ...searchDimensions, productName: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">项目名称</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchDimensions.issuer}
                  onChange={(e) => setSearchDimensions({ ...searchDimensions, issuer: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">原始权益人/发起人</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchDimensions.underlyingAsset}
                  onChange={(e) => setSearchDimensions({ ...searchDimensions, underlyingAsset: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">基础资产</span>
              </label>
            </div>
          </div>

          {/* ABS分类筛选 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">ABS分类:</span>
            {ABS_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="absCategory"
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                  className="accent-[#667eea]"
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>

          {/* 存续状态筛选 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">存续状态:</span>
            {STATUS_OPTIONS.map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStatus === status}
                  onChange={() => setSelectedStatus(status)}
                  className="rounded accent-[#667eea]"
                />
                <span className="text-sm">{status}</span>
              </label>
            ))}
          </div>

          {/* 更多筛选 */}
          {moreFiltersOpen && (
            <div className="border-t pt-4 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">监管部门</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]">
                    <option>不限</option>
                    <option>证监会</option>
                    <option>银保监会</option>
                    <option>交易商协会</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">基础资产类型</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]">
                    <option>不限</option>
                    <option>应收账款</option>
                    <option>融资租赁债权</option>
                    <option>小额贷款债权</option>
                    <option>基础设施收费</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setSearchKeyword('');
              setSelectedCategory('不限');
              setSelectedStatus('不限');
              setSearchDimensions({ productName: true, issuer: true, underlyingAsset: true });
            }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重置
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              保存方案
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
              导出Excel
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              更多指标
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
            >
              {moreFiltersOpen ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  收起筛选
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  更多筛选
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card>
        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共找到 <span className="font-bold text-[#667eea]">{sortedProducts.length}</span> 条记录
                {products.length > 0 && <span className="ml-2 text-xs text-gray-500">(总数据: {products.length})</span>}
              </div>
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="w-[300px]">项目名称</TableHead>
                  <TableHead>原始权益人/发起人</TableHead>
                  <TableHead>基础资产</TableHead>
                  <TableHead>特定品种</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('issue_date')}
                  >
                    <div className="flex items-center">
                      发行公告日
                      {sortField === 'issue_date' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('total_scale')}
                  >
                    <div className="flex items-center">
                      规模(亿)
                      {sortField === 'total_scale' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>存续期</TableHead>
                  <TableHead>债券评级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map((product) => {
                  const specialTags = getSpecialTags(product);
                  return (
                    <TableRow key={product.product_code} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium">
                        {product.product_short_name || product.product_full_name}
                      </TableCell>
                      <TableCell>{product.issuer_name}</TableCell>
                      <TableCell>{product.asset_type_sub}</TableCell>
                      <TableCell>
                        {specialTags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {specialTags.map(tag => {
                              const tagConfig = SPECIAL_TAGS.find(t => t.name === tag);
                              return (
                                <Badge key={tag} className={tagConfig?.color}>
                                  {tag}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(product.issue_date)}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(product.total_scale || 0)}
                      </TableCell>
                      <TableCell>
                        {calculateTermYears(product.issue_date, product.expected_maturity_date || '')}年
                      </TableCell>
                      <TableCell>
                        {product.rating_agency || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                暂无符合条件的记录
              </div>
            )}
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              显示 1-{sortedProducts.length} 条，共 {sortedProducts.length} 条
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                上一页
              </Button>
              <Button variant="outline" size="sm" disabled>
                下一页
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
