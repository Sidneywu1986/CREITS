import { createClient } from '@/lib/supabase/server'

/**
 * 机构（租户）信息
 */
export interface Organization {
  id: string
  name: string
  code: string
  logo?: string
  theme?: ThemeConfig
  isActive: boolean
  plan: 'free' | 'professional' | 'enterprise'
  maxUsers: number
  createdAt: string
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  logo?: string
  favicon?: string
  customCSS?: string
}

/**
 * 多租户服务
 */
export class MultiTenantService {
  private supabase

  constructor() {
    this.supabase = createClient()
  }

  /**
   * 创建机构
   */
  async createOrganization(
    name: string,
    code: string,
    plan: 'free' | 'professional' | 'enterprise' = 'free',
    userId: string
  ): Promise<Organization> {
    const { data, error } = await this.supabase
      .from('organizations')
      .insert({
        name,
        code,
        plan,
        is_active: true,
        created_by: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`创建机构失败: ${error.message}`)
    }

    // 将用户添加到机构
    await this.supabase.from('user_organizations').insert({
      user_id: userId,
      organization_id: data.id,
      role: 'owner',
      joined_at: new Date().toISOString()
    })

    // 为机构创建默认角色
    await this.createDefaultRoles(data.id)

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      logo: data.logo,
      theme: data.theme,
      isActive: data.is_active,
      plan: data.plan,
      maxUsers: data.max_users,
      createdAt: data.created_at
    }
  }

  /**
   * 创建默认角色
   */
  private async createDefaultRoles(organizationId: string): Promise<void> {
    const defaultRoles = [
      {
        organization_id: organizationId,
        code: 'org_admin',
        name: '机构管理员',
        description: '机构内所有权限',
        permissions: ['*']
      },
      {
        organization_id: organizationId,
        code: 'org_editor',
        name: '编辑',
        description: '可以编辑内容',
        permissions: ['reits:read', 'reits:create', 'reits:update']
      },
      {
        organization_id: organizationId,
        code: 'org_viewer',
        name: '查看者',
        description: '只能查看内容',
        permissions: ['reits:read']
      }
    ]

    await this.supabase.from('org_roles').insert(defaultRoles)
  }

  /**
   * 获取用户所属机构
   */
  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const { data, error } = await this.supabase
      .from('user_organizations')
      .select(`
        role,
        organizations (*)
      `)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`获取机构列表失败: ${error.message}`)
    }

    return (data || []).map((item: any) => ({
      id: item.organizations?.id,
      name: item.organizations?.name,
      code: item.organizations?.code,
      logo: item.organizations?.logo,
      theme: item.organizations?.theme,
      isActive: item.organizations?.is_active,
      plan: item.organizations?.plan,
      maxUsers: item.organizations?.max_users,
      createdAt: item.organizations?.created_at
    }))
  }

  /**
   * 更新机构主题
   */
  async updateOrganizationTheme(
    organizationId: string,
    theme: Partial<ThemeConfig>,
    userId: string
  ): Promise<void> {
    // 检查权限
    const hasPermission = await this.checkPermission(organizationId, userId, 'org:admin')
    if (!hasPermission) {
      throw new Error('权限不足')
    }

    const { error } = await this.supabase
      .from('organizations')
      .update({
        theme: theme,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)

    if (error) {
      throw new Error(`更新主题失败: ${error.message}`)
    }
  }

  /**
   * 添加用户到机构
   */
  async addUserToOrganization(
    organizationId: string,
    userId: string,
    role: string
  ): Promise<void> {
    // 检查用户是否已在机构中
    const { data: existing } = await this.supabase
      .from('user_organizations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      throw new Error('用户已在机构中')
    }

    await this.supabase.from('user_organizations').insert({
      user_id: userId,
      organization_id: organizationId,
      role,
      joined_at: new Date().toISOString()
    })
  }

  /**
   * 从机构移除用户
   */
  async removeUserFromOrganization(
    organizationId: string,
    userId: string,
    requesterId: string
  ): Promise<void> {
    // 检查权限
    const hasPermission = await this.checkPermission(organizationId, requesterId, 'org:admin')
    if (!hasPermission) {
      throw new Error('权限不足')
    }

    await this.supabase
      .from('user_organizations')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
  }

  /**
   * 创建自定义角色
   */
  async createCustomRole(
    organizationId: string,
    code: string,
    name: string,
    description: string,
    permissions: string[]
  ): Promise<void> {
    await this.supabase.from('org_roles').insert({
      organization_id: organizationId,
      code,
      name,
      description,
      permissions
    })
  }

  /**
   * 分配角色给用户
   */
  async assignRoleToUser(
    organizationId: string,
    userId: string,
    roleCode: string
  ): Promise<void> {
    await this.supabase
      .from('user_organizations')
      .update({ role: roleCode })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
  }

  /**
   * 检查权限
   */
  async checkPermission(
    organizationId: string,
    userId: string,
    requiredPermission: string
  ): Promise<boolean> {
    // 获取用户在机构中的角色
    const { data, error } = await this.supabase
      .from('user_organizations')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return false
    }

    // 获取角色权限
    const { data: roleData } = await this.supabase
      .from('org_roles')
      .select('permissions')
      .eq('organization_id', organizationId)
      .eq('code', data.role)
      .single()

    if (!roleData) {
      return false
    }

    const permissions = roleData.permissions || []

    // 检查是否有通配符权限
    if (permissions.includes('*')) {
      return true
    }

    // 检查是否有具体权限
    return permissions.includes(requiredPermission)
  }

  /**
   * 获取机构数据隔离的查询条件
   */
  getDataIsolationFilter(organizationId: string): Record<string, any> {
    return {
      organization_id: organizationId
    }
  }

  /**
   * 获取机构用户列表
   */
  async getOrganizationUsers(organizationId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('user_organizations')
      .select(`
        role,
        joined_at,
        users (*)
      `)
      .eq('organization_id', organizationId)

    if (error) {
      throw new Error(`获取机构用户列表失败: ${error.message}`)
    }

    return (data || []).map((item: any) => ({
      userId: item.users?.id,
      username: item.users?.username,
      email: item.users?.email,
      role: item.role,
      joinedAt: item.joined_at
    }))
  }

  /**
   * 上传机构Logo
   */
  async uploadOrganizationLogo(
    organizationId: string,
    logoUrl: string,
    userId: string
  ): Promise<void> {
    // 检查权限
    const hasPermission = await this.checkPermission(organizationId, userId, 'org:admin')
    if (!hasPermission) {
      throw new Error('权限不足')
    }

    await this.supabase
      .from('organizations')
      .update({ logo: logoUrl })
      .eq('id', organizationId)
  }

  /**
   * 获取机构详情
   */
  async getOrganizationDetails(organizationId: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      logo: data.logo,
      theme: data.theme,
      isActive: data.is_active,
      plan: data.plan,
      maxUsers: data.max_users,
      createdAt: data.created_at
    }
  }
}
