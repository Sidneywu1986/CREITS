import { NextApiRequest, NextApiResponse } from 'next'
import { ConsistencyChecker } from '@/lib/consistency/checker'
import { createClient } from '@/lib/supabase/server'

/**
 * 数据一致性检查API
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 认证
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: '未授权' })
  }

  if (req.method === 'POST') {
    // 执行检查
    try {
      const { type, table, recordId } = req.body

      const checker = new ConsistencyChecker()
      let violations

      if (type === 'full') {
        violations = await checker.fullCheck()
      } else if (type === 'record' && table && recordId) {
        violations = await checker.checkRecord(table, recordId)
      } else {
        return res.status(400).json({ error: '无效的检查类型' })
      }

      res.status(200).json({
        success: true,
        violations
      })
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '检查失败'
      })
    }
  } else if (req.method === 'GET') {
    // 获取违规记录
    try {
      const checker = new ConsistencyChecker()
      const violations = await checker.getViolations(false)

      res.status(200).json({ violations })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  } else if (req.method === 'PATCH') {
    // 标记为已解决
    try {
      const { violationId } = req.body

      if (!violationId) {
        return res.status(400).json({ error: '缺少violationId' })
      }

      const checker = new ConsistencyChecker()
      await checker.markResolved(violationId)

      res.status(200).json({ success: true })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: '方法不允许' })
  }
}
