import { createClient } from '@/lib/supabase/server'

/**
 * 报表组件类型
 */
export type ReportComponentType = 'table' | 'chart' | 'metric' | 'text' | 'image'

/**
 * 报表组件
 */
export interface ReportComponent {
  id: string
  type: ReportComponentType
  position: { x: number; y: number; width: number; height: number }
  config: {
    title?: string
    dataSource: string
    query?: string
    chartType?: 'line' | 'bar' | 'pie' | 'area'
    chartConfig?: any
    tableColumns?: Array<{ key: string; label: string }>
    metricKey?: string
    format?: string
  }
}

/**
 * 报表定义
 */
export interface ReportDefinition {
  id: string
  name: string
  description: string
  organizationId?: string
  components: ReportComponent[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

/**
 * 报表实例
 */
export interface ReportInstance {
  id: string
  reportId: string
  name: string
  format: 'pdf' | 'excel' | 'json'
  data: any
  generatedAt: string
  generatedBy: string
  expiresAt?: string
}

/**
 * 报表计划
 */
export interface ReportSchedule {
  id: string
  reportId: string
  name: string
  cron: string
  recipients: string[]
  format: 'pdf' | 'excel' | 'json'
  isActive: boolean
  lastRunAt?: string
  nextRunAt?: string
  createdBy: string
}

/**
 * 智能报表服务
 */
export class ReportService {
  private supabase

  constructor() {
    this.supabase = createClient()
  }

  /**
   * 创建报表
   */
  async createReport(
    name: string,
    description: string,
    components: ReportComponent[],
    userId: string,
    organizationId?: string
  ): Promise<ReportDefinition> {
    const reportId = crypto.randomUUID()

    const { data, error } = await this.supabase
      .from('reports')
      .insert({
        id: reportId,
        name,
        description,
        organization_id: organizationId,
        components,
        created_by: userId,
        updated_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`创建报表失败: ${error.message}`)
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      organizationId: data.organization_id,
      components: data.components,
      createdAt: data.created_at,
      createdBy: data.created_by,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by
    }
  }

  /**
   * 更新报表
   */
  async updateReport(
    reportId: string,
    updates: Partial<ReportDefinition>,
    userId: string
  ): Promise<void> {
    await this.supabase
      .from('reports')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
  }

  /**
   * 获取报表列表
   */
  async getReports(organizationId?: string): Promise<ReportDefinition[]> {
    let query = this.supabase
      .from('reports')
      .select('*')
      .order('updated_at', { ascending: false })

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`获取报表列表失败: ${error.message}`)
    }

    return (data || []).map(record => ({
      id: record.id,
      name: record.name,
      description: record.description,
      organizationId: record.organization_id,
      components: record.components,
      createdAt: record.created_at,
      createdBy: record.created_by,
      updatedAt: record.updated_at,
      updatedBy: record.updated_by
    }))
  }

  /**
   * 生成报表
   */
  async generateReport(
    reportId: string,
    format: 'pdf' | 'excel' | 'json',
    userId: string
  ): Promise<ReportInstance> {
    // 获取报表定义
    const report = await this.getReportById(reportId)
    if (!report) {
      throw new Error('报表不存在')
    }

    // 收集数据
    const data = await this.collectReportData(report)

    // 格式化输出
    let formattedData: any

    switch (format) {
      case 'json':
        formattedData = JSON.stringify(data, null, 2)
        break
      case 'excel':
        formattedData = await this.generateExcel(data)
        break
      case 'pdf':
        formattedData = await this.generatePDF(report, data)
        break
      default:
        throw new Error(`不支持的格式: ${format}`)
    }

    // 保存实例
    const instanceId = crypto.randomUUID()

    await this.supabase.from('report_instances').insert({
      id: instanceId,
      report_id: reportId,
      name: `${report.name}_${new Date().toISOString().slice(0, 10)}`,
      format,
      data: formattedData,
      generated_by: userId,
      generated_at: new Date().toISOString()
    })

    return {
      id: instanceId,
      reportId,
      name: `${report.name}_${new Date().toISOString().slice(0, 10)}`,
      format,
      data: formattedData,
      generatedAt: new Date().toISOString(),
      generatedBy: userId
    }
  }

  /**
   * 收集报表数据
   */
  private async collectReportData(report: ReportDefinition): Promise<any> {
    const data: any = {}

    for (const component of report.components) {
      switch (component.type) {
        case 'table':
        case 'chart':
        case 'metric':
          data[component.id] = await this.queryDataSource(component.config.dataSource)
          break
        default:
          data[component.id] = null
      }
    }

    return data
  }

  /**
   * 查询数据源
   */
  private async queryDataSource(dataSource: string): Promise<any[]> {
    // 根据数据源类型查询
    switch (dataSource) {
      case 'reit_products':
        const { data: products } = await this.supabase
          .from('reit_product_info')
          .select('*')
          .limit(100)
        return products || []
      case 'reit_properties':
        const { data: properties } = await this.supabase
          .from('reit_property_base')
          .select('*')
          .limit(100)
        return properties || []
      default:
        return []
    }
  }

  /**
   * 生成Excel（简化版）
   */
  private async generateExcel(data: any): Promise<string> {
    // 实际应用中应该使用exceljs或其他库
    // 这里返回模拟数据
    return JSON.stringify(data)
  }

  /**
   * 生成PDF（简化版）
   */
  private async generatePDF(report: ReportDefinition, data: any): Promise<string> {
    // 实际应用中应该使用puppeteer或其他库
    // 这里返回模拟数据
    return JSON.stringify({
      title: report.name,
      description: report.description,
      generatedAt: new Date().toISOString(),
      data
    })
  }

  /**
   * 获取报表实例
   */
  async getReportInstance(instanceId: string): Promise<ReportInstance | null> {
    const { data, error } = await this.supabase
      .from('report_instances')
      .select('*')
      .eq('id', instanceId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      reportId: data.report_id,
      name: data.name,
      format: data.format,
      data: data.data,
      generatedAt: data.generated_at,
      generatedBy: data.generated_by,
      expiresAt: data.expires_at
    }
  }

  /**
   * 创建报表计划
   */
  async createSchedule(
    reportId: string,
    name: string,
    cron: string,
    recipients: string[],
    format: 'pdf' | 'excel' | 'json',
    userId: string
  ): Promise<ReportSchedule> {
    const scheduleId = crypto.randomUUID()

    const { data, error } = await this.supabase
      .from('report_schedules')
      .insert({
        id: scheduleId,
        report_id: reportId,
        name,
        cron,
        recipients,
        format,
        is_active: true,
        created_by: userId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`创建报表计划失败: ${error.message}`)
    }

    return {
      id: data.id,
      reportId: data.report_id,
      name: data.name,
      cron: data.cron,
      recipients: data.recipients,
      format: data.format,
      isActive: data.is_active,
      lastRunAt: data.last_run_at,
      nextRunAt: data.next_run_at,
      createdBy: data.created_by
    }
  }

  /**
   * 执行报表计划
   */
  async executeSchedule(scheduleId: string): Promise<void> {
    // 获取计划
    const { data: schedule } = await this.supabase
      .from('report_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single()

    if (!schedule || !schedule.is_active) {
      return
    }

    // 生成报表
    const instance = await this.generateReport(
      schedule.report_id,
      schedule.format,
      schedule.created_by
    )

    // 发送报表
    await this.sendReport(instance, schedule.recipients)

    // 更新计划
    await this.supabase
      .from('report_schedules')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: this.calculateNextRun(schedule.cron)
      })
      .eq('id', scheduleId)
  }

  /**
   * 发送报表
   */
  private async sendReport(instance: ReportInstance, recipients: string[]): Promise<void> {
    // 实际应用中应该实现邮件发送逻辑
    console.log(`发送报表 ${instance.name} 到: ${recipients.join(', ')}`)
  }

  /**
   * 计算下次运行时间（简化版）
   */
  private calculateNextRun(cron: string): string {
    // 实际应用中应该使用cron-parser等库解析cron表达式
    // 这里简化为24小时后
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }

  /**
   * 获取报表详情
   */
  async getReportById(reportId: string): Promise<ReportDefinition | null> {
    const { data, error } = await this.supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      organizationId: data.organization_id,
      components: data.components,
      createdAt: data.created_at,
      createdBy: data.created_by,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by
    }
  }
}
