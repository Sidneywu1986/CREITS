import type { NextApiRequest, NextApiResponse } from 'next';
import { ConsistencyChecker } from '@/lib/consistency/checker';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { table, data, crossTableData } = req.body;

    if (!table || !data) {
      return res.status(400).json({ error: 'Missing required parameters: table and data' });
    }

    let results;

    if (crossTableData && Object.keys(crossTableData).length > 0) {
      // 执行跨表一致性检查
      const dataMap = new Map<string, any[]>();

      // 添加当前表数据
      dataMap.set(table, data);

      // 添加其他表数据
      Object.entries(crossTableData).forEach(([tableName, tableData]) => {
        if (tableName !== table) {
          dataMap.set(tableName, tableData as any[]);
        }
      });

      // 首先执行单表检查
      const singleTableResults = ConsistencyChecker.checkRecords(data as any[], table);
      
      // 然后执行跨表检查
      const crossTableResults = ConsistencyChecker.checkCrossTableConsistency(dataMap);

      // 合并结果
      const allResults: any[] = [];
      singleTableResults.forEach((recordResults) => {
        allResults.push(...recordResults);
      });
      allResults.push(...crossTableResults);

      results = allResults;
    } else {
      // 仅执行单表一致性检查
      const resultsMap = ConsistencyChecker.checkRecords(data as any[], table);
      
      // 将 Map 转换为数组
      results = Array.from(resultsMap.values()).flat();
    }

    // 获取汇总统计
    const summary = ConsistencyChecker.getSummary(results);

    res.status(200).json({
      success: true,
      results,
      summary,
    });
  } catch (error) {
    console.error('Consistency check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
