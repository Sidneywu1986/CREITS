import { NextApiRequest, NextApiResponse } from 'next'
import { APIPlatformService } from '@/lib/api/platform'

/**
 * 外部API认证中间件
 */
async function authenticateAPI(req: NextApiRequest): Promise<{
  success: boolean;
  apiKeyId?: string;
  userId?: string;
  organizationId?: string;
  error?: string;
}> {
  const apiKey = req.headers['x-api-key'] as string

  if (!apiKey) {
    return { success: false, error: 'Missing API key' }
  }

  const service = new APIPlatformService()
  const validation = await service.validateAPIKey(apiKey)

  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  return {
    success: true,
    apiKeyId: validation.apiKeyId,
    userId: validation.userId,
    organizationId: validation.organizationId
  }
}

/**
 * 检查速率限制中间件
 */
async function checkRateLimit(apiKeyId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: string;
}> {
  const service = new APIPlatformService()
  return await service.checkRateLimit(apiKeyId)
}

/**
 * 记录API调用
 */
async function recordUsage(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number
): Promise<void> {
  const service = new APIPlatformService()
  await service.recordAPIUsage({
    apiKeyId,
    endpoint,
    method,
    statusCode,
    responseTime
  })
}

/**
 * RESTful API路由 - REITs产品信息
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now()

  try {
    // 认证
    const auth = await authenticateAPI(req)
    if (!auth.success) {
      res.status(401).json({
        success: false,
        error: auth.error,
        code: 'UNAUTHORIZED'
      })
      await recordUsage('anonymous', req.url || '', req.method || 'GET', 401, Date.now() - startTime)
      return
    }

    // 检查速率限制
    const rateLimit = await checkRateLimit(auth.apiKeyId!)
    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        resetAt: rateLimit.resetAt
      })
      await recordUsage(auth.apiKeyId!, req.url || '', req.method || 'GET', 429, Date.now() - startTime)
      return
    }

    // 添加速率限制头
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString())
    res.setHeader('X-RateLimit-Reset', rateLimit.resetAt)

    const platformService = new APIPlatformService()
    const apiKeyData = await platformService.getAPIKeyDetails(auth.apiKeyId!)

    // 路由分发
    const path = req.url?.split('/api/v1')?.[1] || ''

    // GET /api/v1/reits/products - 获取REITs产品列表
    if (req.method === 'GET' && path.startsWith('/reits/products')) {
      if (!apiKeyData?.scopes?.includes('reits:read')) {
        res.status(403).json({ success: false, error: 'Insufficient permissions', code: 'FORBIDDEN' })
        await recordUsage(auth.apiKeyId!, path, 'GET', 403, Date.now() - startTime)
        return
      }

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()

      const { data, error } = await supabase
        .from('reit_product_info')
        .select('*')
        .limit(100)

      if (error) {
        res.status(500).json({ success: false, error: error.message })
        await recordUsage(auth.apiKeyId!, path, 'GET', 500, Date.now() - startTime)
        return
      }

      res.status(200).json({
        success: true,
        data,
        meta: {
          count: data?.length || 0,
          timestamp: new Date().toISOString()
        }
      })
      await recordUsage(auth.apiKeyId!, path, 'GET', 200, Date.now() - startTime)
      return
    }

    // GET /api/v1/reits/products/:code - 获取单个产品详情
    if (req.method === 'GET' && path.match(/^\/reits\/products\/[^/]+$/)) {
      if (!apiKeyData?.scopes?.includes('reits:read')) {
        res.status(403).json({ success: false, error: 'Insufficient permissions', code: 'FORBIDDEN' })
        await recordUsage(auth.apiKeyId!, path, 'GET', 403, Date.now() - startTime)
        return
      }

      const code = path.split('/').pop()
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()

      const { data, error } = await supabase
        .from('reit_product_info')
        .select('*')
        .eq('reit_code', code)
        .single()

      if (error || !data) {
        res.status(404).json({ success: false, error: 'Product not found' })
        await recordUsage(auth.apiKeyId!, path, 'GET', 404, Date.now() - startTime)
        return
      }

      res.status(200).json({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString()
        }
      })
      await recordUsage(auth.apiKeyId!, path, 'GET', 200, Date.now() - startTime)
      return
    }

    // GET /api/v1/reits/properties - 获取底层资产列表
    if (req.method === 'GET' && path.startsWith('/reits/properties')) {
      if (!apiKeyData?.scopes?.includes('reits:read')) {
        res.status(403).json({ success: false, error: 'Insufficient permissions', code: 'FORBIDDEN' })
        await recordUsage(auth.apiKeyId!, path, 'GET', 403, Date.now() - startTime)
        return
      }

      const { createClient } = await import('@/lib/supabase/server')
      const supabase = createClient()

      const { data, error } = await supabase
        .from('reit_property_base')
        .select('*')
        .limit(100)

      if (error) {
        res.status(500).json({ success: false, error: error.message })
        await recordUsage(auth.apiKeyId!, path, 'GET', 500, Date.now() - startTime)
        return
      }

      res.status(200).json({
        success: true,
        data,
        meta: {
          count: data?.length || 0,
          timestamp: new Date().toISOString()
        }
      })
      await recordUsage(auth.apiKeyId!, path, 'GET', 200, Date.now() - startTime)
      return
    }

    // GET /api/v1/agent/analyze - Agent分析
    if (req.method === 'POST' && path === '/agent/analyze') {
      if (!apiKeyData?.scopes?.includes('agent:analyze')) {
        res.status(403).json({ success: false, error: 'Insufficient permissions', code: 'FORBIDDEN' })
        await recordUsage(auth.apiKeyId!, path, 'POST', 403, Date.now() - startTime)
        return
      }

      const { ExplainableApprovalAgent } = await import('@/lib/agent/explainable-approval-agent')
      const agent = new ExplainableApprovalAgent()

      const { context } = req.body
      const decision = await agent.analyze(context)

      res.status(200).json({
        success: true,
        data: decision,
        meta: {
          timestamp: new Date().toISOString()
        }
      })
      await recordUsage(auth.apiKeyId!, path, 'POST', 200, Date.now() - startTime)
      return
    }

    // 不支持的端点
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      code: 'NOT_FOUND'
    })
    await recordUsage(auth.apiKeyId!, path, req.method || 'GET', 404, Date.now() - startTime)

  } catch (error: any) {
    console.error('API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    })
  }
}
