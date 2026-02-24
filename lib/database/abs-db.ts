/**
 * ABS产品数据库
 * 存储和管理ABS（资产支持证券）产品数据
 */

export interface ABSProduct {
  id: string;
  // 产品基本信息
  product_name: string;
  product_code: string;
  issuer_name: string;
  issue_date: string;
  
  // 基础资产信息
  asset_type_main: string;  // 基础资产大类：债权类、未来经营收入类、不动产抵押贷款类
  asset_type_sub: string;   // 基础资产细分类型
  underlying_asset: string;  // 基础资产描述
  
  // 发行信息
  issuing_market: string;   // 发行场所：交易所、银行间、其他
  total_scale: number;      // 发行规模（亿元）
  rating: string;           // 评级
  
  // 存续信息
  status: string;           // 存续状态：存续、到期
  
  // 时间戳
  created_at: string;
  updated_at: string;
}

class ABSDatabase {
  private products: ABSProduct[] = [];
  private initialized = false;

  /**
   * 初始化数据库（加载示例数据）
   */
  private async initialize() {
    if (this.initialized) return;

    // 示例数据 - REITs相关ABS
    const sampleProducts: ABSProduct[] = [
      {
        id: '1',
        product_name: '华泰-中信建投-保利地产不动产投资信托基金REITs',
        product_code: 'SZA234567',
        issuer_name: '保利发展控股集团股份有限公司',
        issue_date: '2023-05-15',
        asset_type_main: '不动产抵押贷款类',
        asset_type_sub: 'CMBS',
        underlying_asset: '商业物业租金收益权',
        issuing_market: '交易所',
        total_scale: 25.5,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        product_name: '中信证券-万科商业地产资产支持专项计划',
        product_code: 'SZA234568',
        issuer_name: '万科企业股份有限公司',
        issue_date: '2023-04-20',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '商业物业租金',
        underlying_asset: '购物中心、写字楼租金收益',
        issuing_market: '交易所',
        total_scale: 30.8,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        product_name: '招商局-中信建投-蛇口网谷CMBS',
        product_code: 'SZA234569',
        issuer_name: '招商局蛇口工业区控股股份有限公司',
        issue_date: '2023-03-10',
        asset_type_main: '不动产抵押贷款类',
        asset_type_sub: 'CMBS',
        underlying_asset: '产业园区不动产抵押贷款',
        issuing_market: '交易所',
        total_scale: 18.2,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        product_name: '上海城投-城建基础设施ABS',
        product_code: 'SHB123456',
        issuer_name: '上海城市建设投资开发总公司',
        issue_date: '2023-06-08',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '基础设施收费',
        underlying_asset: '城市基础设施收费权',
        issuing_market: '交易所',
        total_scale: 42.3,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '5',
        product_name: '北京基础设施投资集团-轨道交通ABS',
        product_code: 'BJB234567',
        issuer_name: '北京市基础设施投资有限公司',
        issue_date: '2023-05-28',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '基础设施收费',
        underlying_asset: '轨道交通运营收入',
        issuing_market: '交易所',
        total_scale: 55.6,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '6',
        product_name: '苏州城投-绿色债券ABS',
        product_code: 'SZA234570',
        issuer_name: '苏州市城市建设投资发展（集团）有限公司',
        issue_date: '2023-04-15',
        asset_type_main: '债权类',
        asset_type_sub: '应收账款',
        underlying_asset: '绿色项目应收账款',
        issuing_market: '交易所',
        total_scale: 22.1,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '7',
        product_name: '深圳地铁集团-地铁物业REITs相关ABS',
        product_code: 'SZA234571',
        issuer_name: '深圳市地铁集团有限公司',
        issue_date: '2023-07-05',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '基础设施收费',
        underlying_asset: '地铁站点商业物业收益权',
        issuing_market: '交易所',
        total_scale: 38.9,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '8',
        product_name: '中国交建-PPP项目资产支持专项计划',
        product_code: 'SZA234572',
        issuer_name: '中国交通建设股份有限公司',
        issue_date: '2023-03-25',
        asset_type_main: '未来经营收入类',
        asset_type_sub: 'PPP项目',
        underlying_asset: 'PPP项目收益权',
        issuing_market: '交易所',
        total_scale: 65.4,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '9',
        product_name: '广州地铁-地下空间开发ABS',
        product_code: 'SZA234573',
        issuer_name: '广州市地铁集团有限公司',
        issue_date: '2023-02-18',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '基础设施收费',
        underlying_asset: '地下空间商业开发收益',
        issuing_market: '交易所',
        total_scale: 28.7,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '10',
        product_name: '中建投-万科住房租赁ABS',
        product_code: 'SZA234574',
        issuer_name: '万科企业股份有限公司',
        issue_date: '2023-06-20',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '住房租赁',
        underlying_asset: '长租公寓租金收益权',
        issuing_market: '交易所',
        total_scale: 15.6,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '11',
        product_name: '天津城投-基础设施ABS',
        product_code: 'SHB234567',
        issuer_name: '天津城市基础设施建设投资集团有限公司',
        issue_date: '2023-05-12',
        asset_type_main: '债权类',
        asset_type_sub: '应收账款',
        underlying_asset: '基础设施应收账款',
        issuing_market: '交易所',
        total_scale: 35.2,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '12',
        product_name: '重庆城投-长江大桥收费权ABS',
        product_code: 'SHB234568',
        issuer_name: '重庆城市交通开发投资（集团）有限公司',
        issue_date: '2023-04-08',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '基础设施收费',
        underlying_asset: '桥梁收费权',
        issuing_market: '交易所',
        total_scale: 48.5,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '13',
        product_name: '浙江交投-高速公路ABS',
        product_code: 'SZA234575',
        issuer_name: '浙江省交通投资集团有限公司',
        issue_date: '2023-03-30',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '基础设施收费',
        underlying_asset: '高速公路收费权',
        issuing_market: '交易所',
        total_scale: 52.8,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '14',
        product_name: '中建-绿色建筑CMBS',
        product_code: 'SZA234576',
        issuer_name: '中国建筑股份有限公司',
        issue_date: '2023-07-15',
        asset_type_main: '不动产抵押贷款类',
        asset_type_sub: 'CMBS',
        underlying_asset: '绿色商业物业抵押贷款',
        issuing_market: '交易所',
        total_scale: 32.4,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '15',
        product_name: '广州城投-广州塔ABS',
        product_code: 'SZA234577',
        issuer_name: '广州市城市建设投资集团有限公司',
        issue_date: '2023-02-28',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '基础设施收费',
        underlying_asset: '广州塔旅游观光收益权',
        issuing_market: '交易所',
        total_scale: 19.8,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '16',
        product_name: '湖北交投-科技创新ABS',
        product_code: 'SZA234578',
        issuer_name: '湖北省交通投资集团有限公司',
        issue_date: '2023-06-25',
        asset_type_main: '债权类',
        asset_type_sub: '应收账款',
        underlying_asset: '科技创新项目应收账款',
        issuing_market: '交易所',
        total_scale: 26.5,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '17',
        product_name: '华夏幸福-PPP项目ABS',
        product_code: 'SZA234579',
        issuer_name: '华夏幸福基业股份有限公司',
        issue_date: '2022-11-15',
        asset_type_main: '未来经营收入类',
        asset_type_sub: 'PPP项目',
        underlying_asset: 'PPP项目收益权',
        issuing_market: '交易所',
        total_scale: 58.3,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '18',
        product_name: '碧桂园-住房租赁ABS',
        product_code: 'SZA234580',
        issuer_name: '碧桂园控股有限公司',
        issue_date: '2022-09-20',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '住房租赁',
        underlying_asset: '长租公寓租金收益权',
        issuing_market: '交易所',
        total_scale: 21.4,
        rating: 'AA+',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '19',
        product_name: '南京城投-基础设施收费ABS',
        product_code: 'SHB234569',
        issuer_name: '南京市城市建设投资（控股）集团有限公司',
        issue_date: '2022-12-10',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '基础设施收费',
        underlying_asset: '城市基础设施收费权',
        issuing_market: '交易所',
        total_scale: 41.6,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '20',
        product_name: '华润置地-商业物业CMBS',
        product_code: 'SZA234581',
        issuer_name: '华润置地有限公司',
        issue_date: '2022-10-25',
        asset_type_main: '不动产抵押贷款类',
        asset_type_sub: 'CMBS',
        underlying_asset: '购物中心物业抵押贷款',
        issuing_market: '交易所',
        total_scale: 44.7,
        rating: 'AAA',
        status: '存续',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      // 添加一些到期项目作为示例
      {
        id: '21',
        product_name: '中粮地产-商业物业ABS（已到期）',
        product_code: 'SZA210001',
        issuer_name: '中粮地产（集团）股份有限公司',
        issue_date: '2018-05-20',
        asset_type_main: '不动产抵押贷款类',
        asset_type_sub: 'CMBS',
        underlying_asset: '商业物业抵押贷款',
        issuing_market: '交易所',
        total_scale: 28.5,
        rating: 'AAA',
        status: '到期',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '22',
        product_name: '龙湖地产-住房租赁ABS（已到期）',
        product_code: 'SZA210002',
        issuer_name: '龙湖集团控股有限公司',
        issue_date: '2018-08-15',
        asset_type_main: '未来经营收入类',
        asset_type_sub: '住房租赁',
        underlying_asset: '长租公寓租金收益权',
        issuing_market: '交易所',
        total_scale: 17.3,
        rating: 'AAA',
        status: '到期',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.products = sampleProducts;
    this.initialized = true;
    console.log('[ABSDatabase] 数据库初始化完成，加载产品数量:', this.products.length);
  }

  /**
   * 获取所有ABS产品
   */
  async getAllProducts(): Promise<ABSProduct[]> {
    await this.initialize();
    return [...this.products];
  }

  /**
   * 根据ID获取产品
   */
  async getProductById(id: string): Promise<ABSProduct | null> {
    await this.initialize();
    return this.products.find(p => p.id === id) || null;
  }

  /**
   * 根据发起机构获取产品
   */
  async getProductsByIssuer(issuerName: string): Promise<ABSProduct[]> {
    await this.initialize();
    return this.products.filter(p => 
      p.issuer_name.toLowerCase().includes(issuerName.toLowerCase())
    );
  }

  /**
   * 根据资产类型获取产品
   */
  async getProductsByAssetType(assetType: string): Promise<ABSProduct[]> {
    await this.initialize();
    return this.products.filter(p => 
      p.asset_type_main === assetType || p.asset_type_sub.includes(assetType)
    );
  }

  /**
   * 搜索产品（支持产品名称、发起机构、基础资产）
   */
  async searchProducts(keyword: string): Promise<ABSProduct[]> {
    await this.initialize();
    const lowerKeyword = keyword.toLowerCase();
    return this.products.filter(p =>
      (p.product_name || '').toLowerCase().includes(lowerKeyword) ||
      (p.issuer_name || '').toLowerCase().includes(lowerKeyword) ||
      (p.underlying_asset || '').toLowerCase().includes(lowerKeyword) ||
      (p.asset_type_sub || '').toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 获取统计信息
   */
  async getStatistics() {
    await this.initialize();
    
    const totalProducts = this.products.length;
    const totalScale = this.products.reduce((sum, p) => sum + (p.total_scale || 0), 0);
    const uniqueIssuers = new Set(this.products.map(p => p.issuer_name)).size;
    
    // 按资产类型统计
    const byAssetType: Record<string, number> = {};
    this.products.forEach(p => {
      const type = p.asset_type_main || '其他';
      byAssetType[type] = (byAssetType[type] || 0) + 1;
    });

    // 按年份统计
    const byYear: Record<string, { count: number; scale: number }> = {};
    this.products.forEach(p => {
      const year = new Date(p.issue_date).getFullYear();
      if (!byYear[year]) {
        byYear[year] = { count: 0, scale: 0 };
      }
      byYear[year].count += 1;
      byYear[year].scale += p.total_scale || 0;
    });

    return {
      totalProducts,
      totalScale,
      uniqueIssuers,
      byAssetType,
      byYear,
    };
  }

  /**
   * 添加新产品（用于扩展）
   */
  async addProduct(product: Omit<ABSProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ABSProduct> {
    await this.initialize();
    const newProduct: ABSProduct = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.products.push(newProduct);
    return newProduct;
  }
}

// 导出单例
export const absDatabase = new ABSDatabase();
