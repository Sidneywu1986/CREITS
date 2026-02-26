import { NextApiRequest, NextApiResponse } from 'next'
import { IPWhitelistService } from '@/lib/security/ip-whitelist'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: '方法不允许' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '无效的ID' })
    }

    const service = new IPWhitelistService()
    await service.removeFromWhitelist(id)

    res.status(200).json({
      success: true,
      message: 'IP已从白名单移除'
    })
  } catch (error) {
    console.error('从白名单移除IP失败:', error)
    res.status(500).json({
      success: false,
      error: '移除IP失败'
    })
  }
}
