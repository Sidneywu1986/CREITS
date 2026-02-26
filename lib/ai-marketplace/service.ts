import { createClient } from '@/lib/supabase/server'

/**
 * Agent模板
 */
export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  version: string
  icon?: string
  author: string
  downloads: number
  rating: number
  reviewCount: number
  price: number
  config: any
  createdAt: string
  isOfficial: boolean
}

/**
 * Agent评论
 */
export interface AgentReview {
  id: string
  templateId: string
  userId: string
  username: string
  rating: number
  comment: string
  createdAt: string
}

/**
 * AI市场服务
 */
export class AIMarketplaceService {
  private supabase

  constructor() {
    this.supabase = createClient()
  }

  /**
   * 获取Agent模板列表
   */
  async getAgentTemplates(category?: string): Promise<AgentTemplate[]> {
    let query = this.supabase
      .from('agent_templates')
      .select('*')
      .order('downloads', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`获取Agent模板失败: ${error.message}`)
    }

    return (data || []).map(record => ({
      id: record.id,
      name: record.name,
      description: record.description,
      category: record.category,
      version: record.version,
      icon: record.icon,
      author: record.author,
      downloads: record.downloads || 0,
      rating: record.rating || 0,
      reviewCount: record.review_count || 0,
      price: record.price || 0,
      config: record.config,
      createdAt: record.created_at,
      isOfficial: record.is_official || false
    }))
  }

  /**
   * 上传自定义Agent
   */
  async uploadCustomAgent(
    name: string,
    description: string,
    category: string,
    config: any,
    price: number,
    userId: string
  ): Promise<AgentTemplate> {
    const { data: userData } = await this.supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single()

    const templateId = crypto.randomUUID()

    const { data, error } = await this.supabase
      .from('agent_templates')
      .insert({
        id: templateId,
        name,
        description,
        category,
        version: '1.0.0',
        author: userData?.username || 'anonymous',
        downloads: 0,
        rating: 0,
        review_count: 0,
        price,
        config,
        created_by: userId,
        is_official: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`上传Agent失败: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      version: data.version,
      icon: data.icon,
      author: data.author,
      downloads: data.downloads || 0,
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      price: data.price || 0,
      config: data.config,
      createdAt: data.created_at,
      isOfficial: data.is_official || false
    }
  }

  /**
   * 安装Agent
   */
  async installAgent(templateId: string, userId: string): Promise<void> {
    // 增加下载计数
    await this.supabase
      .from('agent_templates')
      .update({ downloads: (await this.getAgentTemplateById(templateId))?.downloads || 0 + 1 })
      .eq('id', templateId)

    // 记录安装
    await this.supabase.from('agent_installs').insert({
      template_id: templateId,
      user_id: userId,
      installed_at: new Date().toISOString()
    })
  }

  /**
   * 评论Agent
   */
  async reviewAgent(
    templateId: string,
    userId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    const reviewId = crypto.randomUUID()

    // 保存评论
    await this.supabase.from('agent_reviews').insert({
      id: reviewId,
      template_id: templateId,
      user_id: userId,
      rating,
      comment,
      created_at: new Date().toISOString()
    })

    // 更新平均评分
    await this.updateAverageRating(templateId)
  }

  /**
   * 更新平均评分
   */
  private async updateAverageRating(templateId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('agent_reviews')
      .select('rating')
      .eq('template_id', templateId)

    if (error) return

    const reviews = data || []
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    await this.supabase
      .from('agent_templates')
      .update({
        rating: avgRating,
        review_count: reviews.length
      })
      .eq('id', templateId)
  }

  /**
   * 获取Agent评论列表
   */
  async getAgentReviews(templateId: string): Promise<AgentReview[]> {
    const { data, error } = await this.supabase
      .from('agent_reviews')
      .select(`
        *,
        users (username)
      `)
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`获取评论失败: ${error.message}`)
    }

    return (data || []).map(record => ({
      id: record.id,
      templateId: record.template_id,
      userId: record.user_id,
      username: record.users?.username || 'anonymous',
      rating: record.rating,
      comment: record.comment,
      createdAt: record.created_at
    }))
  }

  /**
   * 获取Agent详情
   */
  async getAgentTemplateById(templateId: string): Promise<AgentTemplate | null> {
    const { data, error } = await this.supabase
      .from('agent_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      version: data.version,
      icon: data.icon,
      author: data.author,
      downloads: data.downloads || 0,
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      price: data.price || 0,
      config: data.config,
      createdAt: data.created_at,
      isOfficial: data.is_official || false
    }
  }

  /**
   * 搜索Agent
   */
  async searchAgents(query: string): Promise<AgentTemplate[]> {
    const { data, error } = await this.supabase
      .from('agent_templates')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('downloads', { ascending: false })

    if (error) {
      throw new Error(`搜索Agent失败: ${error.message}`)
    }

    return (data || []).map(record => ({
      id: record.id,
      name: record.name,
      description: record.description,
      category: record.category,
      version: record.version,
      icon: record.icon,
      author: record.author,
      downloads: record.downloads || 0,
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      price: data.price || 0,
      config: record.config,
      createdAt: record.created_at,
      isOfficial: data.is_official || false
    }))
  }
}
