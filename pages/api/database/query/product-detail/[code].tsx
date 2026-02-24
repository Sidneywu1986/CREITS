import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid code parameter' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 从产品列表API获取所有产品数据
  const productsResponse = await fetch(`${req.headers.host ? `http://${req.headers.host}` : 'http://localhost:5000'}/api/database/query/products`);
  const productsData = await productsResponse.json();

  if (!productsData.success || !productsData.data) {
    return res.status(500).json({ error: 'Failed to fetch products data' });
  }

  // 查找指定代码的产品（去掉交易所后缀进行匹配）
  const normalizedCode = code.replace(/\.(SH|SZ|sh|sz)$/, '');
  const product = productsData.data.find((p: any) => {
    const productCode = p.reit_code || p.code || '';
    const normalizedProductCode = productCode.replace(/\.(SH|SZ|sh|sz)$/, '');
    return normalizedProductCode === normalizedCode;
  });

  if (!product) {
    console.warn(`未找到REITs产品，代码: ${code} (标准化后: ${normalizedCode})`);
    return res.status(404).json({ error: 'REITs product not found', code });
  }

  // 生成模拟行情数据
  const issuePrice = product.fund_size / (product.total_assets / 100);
  const mockChange = (Math.random() - 0.5) * 2; // -1% 到 +1%
  const mockChangePercent = mockChange;
  const mockPrice = issuePrice + (issuePrice * mockChange / 100);
  const mockOpen = mockPrice * (0.98 + Math.random() * 0.04);
  const mockHigh = mockPrice * (1.0 + Math.random() * 0.1);
  const mockLow = mockPrice * (0.9 + Math.random() * 0.08);
  const mockVolume = Math.floor(Math.random() * 10000000); // 100万到1100万
  const mockTurnoverRate = Math.random() * 5; // 0-5%

  // 构造返回数据（符合REITsProduct接口格式）
  const productDetail = {
    id: `REIT-${product.reit_code}`,
    code: product.reit_code || product.code,
    name: product.reit_short_name || product.name,
    issuer: product.fund_manager || '',
    assetType: product.asset_type_national || product.asset_type_csrc || '',
    location: '全国', // 默认值，可以后续根据实际情况设置
    issueDate: product.listing_date || '',
    listingDate: product.listing_date || '',
    issuePrice: parseFloat(issuePrice.toFixed(2)),
    issueScale: product.fund_size || 0,
    assets: [], // 默认为空数组
    description: `${product.reit_short_name || product.name}是由${product.fund_manager}管理，${product.asset_manager}作为资产管理人，${product.operator}作为运营机构的公募REITs产品。主要资产类型为${product.asset_type_national}，基金规模为${product.fund_size}亿元。`,
    exchange: (product.reit_code || product.code || '').includes('508') ? 'SSE' as const : 'SZSE' as const,
    quote: {
      code: product.reit_code || product.code,
      name: product.reit_short_name || product.name,
      price: parseFloat(mockPrice.toFixed(2)),
      change: parseFloat(mockChange.toFixed(2)),
      changePercent: parseFloat(mockChangePercent.toFixed(2)),
      open: parseFloat(mockOpen.toFixed(2)),
      high: parseFloat(mockHigh.toFixed(2)),
      low: parseFloat(mockLow.toFixed(2)),
      volume: mockVolume,
      turnoverRate: parseFloat(mockTurnoverRate.toFixed(2)),
      updateTime: new Date().toISOString(),
    },
    // 额外的元数据
    fund_manager: product.fund_manager,
    asset_manager: product.asset_manager,
    operator: product.operator,
    total_assets: product.total_assets,
    asset_type_csrc: product.asset_type_csrc,
    product_structure: product.product_structure,
    duration_years: product.duration_years,
    leverage_ratio: product.leverage_ratio,
  };

  return res.status(200).json({
    success: true,
    data: productDetail,
  });
}
