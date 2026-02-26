import { NextApiRequest, NextApiResponse } from 'next'
import { APIPlatformService } from '@/lib/api/platform'
import { createClient } from '@/lib/supabase/server'

/**
 * API密钥管理API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 认证
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return res.status(401).json({ error: '未授权' })
  }

  // 获取用户信息
  const { data: userData } = await supabase
    .from('users')
    .select('username, role, organization_id')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return res.status(404).json({ error: '用户不存在' })
  }

  const service = new APIPlatformService()

  if (req.method === 'POST') {
    // 创建API密钥
    try {
      const { name, scopes, rateLimit, expiresIn } = req.body

      if (!name || !scopes || !Array.isArray(scopes)) {
        return res.status(400).json({ error: '缺少必需参数' })
      }

      const apiKey = await service.createAPIKey(
        name,
        scopes,
        rateLimit || 1000,
        user.id,
        userData.organization_id,
        expiresIn
      )

      res.status(201).json({
        success: true,
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          key: apiKey.key,
          prefix: apiKey.prefix,
          scopes: apiKey.scopes,
          rateLimit: apiKey.rateLimit,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt
        }
      })
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message })
    }
  } else if (req.method === 'GET') {
    // 获取API密钥列表
    try {
      const apiKeys = await service.getAPIKeys(user.id, userData.organization_id)

      res.status(200).json({
        success: true,
        apiKeys
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  } else {
    res.status(405).json({ error: '方法不允许' })
  }
}
