import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getLinkages } from '@/lib/config/table-linkage'
import { DataMaskingService } from '@/lib/supabase/audit-log-v2'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' })
  }

  try {
    const { table } = req.query

    if (!table || typeof table !== 'string') {
      return res.status(400).json({ error: '缺少表名参数' })
    }

    const supabase = createClient()
    if (!supabase) {
      return res.status(500).json({ error: '数据库连接失败' })
    }

    // 获取联动配置
    const linkages = getLinkages(table)

    if (linkages.length === 0) {
      return res.status(200).json({
        success: true,
        table,
        linkages: []
      })
    }

    // 加载所有关联表数据
    const linkedData = await Promise.all(
      linkages.map(async (linkage) => {
        const { data, error } = await supabase
          .from(linkage.table)
          .select('*')

        if (error) {
          console.error(`加载${linkage.table}失败:`, error)
          return {
            table: linkage.table,
            foreignKey: linkage.foreignKey,
            type: linkage.type,
            records: [],
            error: error.message
          }
        }

        // 脱敏处理
        const maskedRecords = (data || []).map(record =>
          DataMaskingService.maskObject(record)
        )

        return {
          table: linkage.table,
          foreignKey: linkage.foreignKey,
          type: linkage.type,
          checkField: linkage.checkField,
          updateAction: linkage.updateAction,
          records: maskedRecords,
          count: maskedRecords.length
        }
      })
    )

    res.status(200).json({
      success: true,
      table,
      linkages: linkedData
    })
  } catch (error: any) {
    console.error('获取联动数据失败:', error)
    res.status(500).json({
      success: false,
      error: error.message || '获取联动数据失败'
    })
  }
}
