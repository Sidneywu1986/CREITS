import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@/lib/supabase/server'
import { IPWhitelistService } from '@/lib/security/ip-whitelist'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // 获取白名单
    try {
      const service = new IPWhitelistService()
      const whitelist = await service.getUserWhitelist()

      res.status(200).json({
        success: true,
        data: whitelist
      })
    } catch (error) {
      console.error('获取白名单失败:', error)
      res.status(500).json({
        success: false,
        error: '获取白名单失败'
      })
    }
  } else if (req.method === 'POST') {
    // 添加IP到白名单
    try {
      const { ip_address, description } = req.body

      if (!ip_address) {
        return res.status(400).json({ error: 'IP地址不能为空' })
      }

      if (!IPWhitelistService.isValidIP(ip_address) && !IPWhitelistService.isValidCIDR(ip_address)) {
        return res.status(400).json({ error: 'IP地址格式无效' })
      }

      const service = new IPWhitelistService()
      const item = await service.addToWhitelist(ip_address, description)

      res.status(200).json({
        success: true,
        data: item,
        message: 'IP已添加到白名单'
      })
    } catch (error: any) {
      console.error('添加IP到白名单失败:', error)

      if (error.message?.includes('duplicate')) {
        return res.status(400).json({
          success: false,
          error: '该IP已在白名单中'
        })
      }

      res.status(500).json({
        success: false,
        error: '添加IP失败'
      })
    }
  } else {
    res.status(405).json({ error: '方法不允许' })
  }
}
