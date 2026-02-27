import { createClient } from '@/lib/supabase/server'

export interface IPWhitelistItem {
  id: string
  user_id: string
  ip_address: string
  description: string | null
  created_at: string
  created_by: string | null
}

export class IPWhitelistService {
  private _supabase: any = null

  private get supabase() {
    if (!this._supabase) {
      try {
        this._supabase = createClient()
      } catch (error) {
        console.warn('Failed to create Supabase client:', error)
        this._supabase = null
      }
    }
    return this._supabase
  }

  constructor() {
    // 延迟初始化
  }

  // 添加IP到白名单
  async addToWhitelist(ipAddress: string, description?: string, userId?: string): Promise<IPWhitelistItem> {
    const supabase = this.supabase
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = userId || user?.id

    if (!currentUserId) {
      throw new Error('用户未登录')
    }

    const { data, error } = await supabase
      .from('user_ip_whitelist')
      .insert({
        user_id: currentUserId,
        ip_address: ipAddress,
        description: description || null,
        created_by: user?.id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as IPWhitelistItem
  }

  // 从白名单移除IP
  async removeFromWhitelist(whitelistId: string): Promise<void> {
    const supabase = this.supabase
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('用户未登录')
    }

    const { error } = await supabase
      .from('user_ip_whitelist')
      .delete()
      .eq('id', whitelistId)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }
  }

  // 获取用户白名单
  async getUserWhitelist(userId?: string): Promise<IPWhitelistItem[]> {
    const supabase = this.supabase
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = userId || user?.id

    if (!currentUserId) {
      throw new Error('用户未登录')
    }

    const { data, error } = await supabase
      .from('user_ip_whitelist')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data || []) as IPWhitelistItem[]
  }

  // 检查IP是否在白名单中
  async isIPAllowed(ipAddress: string, userId?: string): Promise<boolean> {
    const supabase = this.supabase
    if (!supabase) {
      return false
    }

    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = userId || user?.id

    if (!currentUserId) {
      return false
    }

    const { data, error } = await supabase
      .from('user_ip_whitelist')
      .select('id')
      .eq('user_id', currentUserId)
      .eq('ip_address', ipAddress)
      .single()

    if (error || !data) {
      return false
    }

    return true
  }

  // 检查IP是否在白名单中（批量检查）
  async areIPsAllowed(ipAddresses: string[], userId?: string): Promise<Record<string, boolean>> {
    const supabase = this.supabase
    if (!supabase) {
      return {}
    }

    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = userId || user?.id

    if (!currentUserId) {
      return {}
    }

    const { data, error } = await supabase
      .from('user_ip_whitelist')
      .select('ip_address')
      .eq('user_id', currentUserId)

    if (error || !data) {
      return {}
    }

    const allowedIPs = new Set(data.map((item: any) => item.ip_address))
    const result: Record<string, boolean> = {}

    ipAddresses.forEach(ip => {
      result[ip] = allowedIPs.has(ip)
    })

    return result
  }

  // 获取用户的当前IP
  static getCurrentIP(req: any): string {
    // 尝试从各种头部获取真实IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '0.0.0.0'

    return ip
  }

  // 验证IP地址格式
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  // CIDR格式验证
  static isValidCIDR(cidr: string): boolean {
    const cidrRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/
    return cidrRegex.test(cidr)
  }

  // 检查IP是否在CIDR范围内
  static isIPInCIDR(ip: string, cidr: string): boolean {
    if (!this.isValidIP(ip) || !this.isValidCIDR(cidr)) {
      return false
    }

    const [cidrAddress, prefixLength] = cidr.split('/')
    const cidrPrefix = parseInt(prefixLength, 10)

    // 将IP转换为32位整数
    const ipToNum = (ipAddr: string): number => {
      return ipAddr.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
    }

    const ipNum = ipToNum(ip)
    const cidrNum = ipToNum(cidrAddress)
    const mask = cidrPrefix === 0 ? 0 : ~0 << (32 - cidrPrefix)

    return (ipNum & mask) === (cidrNum & mask)
  }
}
