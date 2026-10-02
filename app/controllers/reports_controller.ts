import ReportConfiguration from '#models/report_configuration'
import ReportLog from '#models/report_log'
import ReportSchedule from '#models/report_schedule'
import ReportService from '#services/report_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class ReportsController {
  /**
   * Create a new report configuration
   */
  async createConfiguration({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const {
      name,
      description,
      reportType,
      format,
      filters,
      columns,
      aggregations,
      frequency,
      scheduleConfig,
      emailRecipients,
      includeCharts,
      includeSummary,
      includeTrends,
    } = request.all()

    const config = await ReportConfiguration.create({
      userId: user.id,
      name,
      description: description || null,
      reportType,
      format: format || 'pdf',
      filters: filters || null,
      columns: columns || null,
      aggregations: aggregations || null,
      frequency: frequency || 'once',
      scheduleConfig: scheduleConfig || null,
      emailRecipients: emailRecipients || null,
      includeCharts: includeCharts !== false,
      includeSummary: includeSummary !== false,
      includeTrends: includeTrends !== false,
      isActive: true,
      isTemplate: false,
    })

    return response.json({
      success: true,
      data: config,
    })
  }

  /**
   * List report configurations
   */
  async listConfigurations({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const isTemplate = request.input('is_template', false)

    let query = ReportConfiguration.query()

    if (user.role === 'vendor') {
      query = query.where('user_id', user.id)
    }

    if (isTemplate) {
      query = query.where('is_template', true)
    }

    const configs = await query.paginate(page, limit)

    return response.json({
      success: true,
      data: configs.all(),
      paging: {
        total: configs.total,
        perPage: configs.perPage,
        currentPage: configs.currentPage,
        lastPage: configs.lastPage,
      },
    })
  }

  /**
   * Get a specific report configuration
   */
  async getConfiguration({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const configId = request.param('id')

    const config = await ReportConfiguration.find(configId)
    if (!config) {
      return response.status(404).json({ error: 'Configuration not found' })
    }

    if (user.role === 'vendor' && config.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: config,
    })
  }

  /**
   * Update a report configuration
   */
  async updateConfiguration({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const configId = request.param('id')

    const config = await ReportConfiguration.find(configId)
    if (!config) {
      return response.status(404).json({ error: 'Configuration not found' })
    }

    if (user.role === 'vendor' && config.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const updates = request.only([
      'name',
      'description',
      'format',
      'filters',
      'columns',
      'aggregations',
      'frequency',
      'scheduleConfig',
      'emailRecipients',
      'includeCharts',
      'includeSummary',
      'includeTrends',
      'isActive',
    ])

    await config.merge(updates).save()

    return response.json({
      success: true,
      data: config,
    })
  }

  /**
   * Delete a report configuration
   */
  async deleteConfiguration({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const configId = request.param('id')

    const config = await ReportConfiguration.find(configId)
    if (!config) {
      return response.status(404).json({ error: 'Configuration not found' })
    }

    if (user.role === 'vendor' && config.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    await config.delete()

    return response.json({
      success: true,
      message: 'Configuration deleted',
    })
  }

  /**
   * Generate a report on-demand
   */
  async generateReport({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    if (!['admin', 'vendor'].includes(user.role)) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const configId = request.param('id')
    const config = await ReportConfiguration.find(configId)

    if (!config) {
      return response.status(404).json({ error: 'Configuration not found' })
    }

    if (user.role === 'vendor' && config.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      let reportData

      const startDateStr = config.filters && typeof config.filters === 'object' && 'startDate' in config.filters
        ? (config.filters as Record<string, any>).startDate
        : null
      const endDateStr = config.filters && typeof config.filters === 'object' && 'endDate' in config.filters
        ? (config.filters as Record<string, any>).endDate
        : null

      const filters = {
        startDate: startDateStr ? DateTime.fromISO(startDateStr as string) : DateTime.now().minus({ months: 1 }),
        endDate: endDateStr ? DateTime.fromISO(endDateStr as string) : DateTime.now(),
        campaignId: config.filters && typeof config.filters === 'object' && 'campaignId' in config.filters
          ? (config.filters as Record<string, any>).campaignId
          : undefined,
        affiliateId: config.filters && typeof config.filters === 'object' && 'affiliateId' in config.filters
          ? (config.filters as Record<string, any>).affiliateId
          : undefined,
        status: config.filters && typeof config.filters === 'object' && 'status' in config.filters
          ? (config.filters as Record<string, any>).status
          : undefined,
      }

      switch (config.reportType) {
        case 'conversion':
          reportData = await ReportService.generateConversionReport(filters)
          break
        case 'commission':
          reportData = await ReportService.generateCommissionReport(filters)
          break
        case 'campaign':
          reportData = await ReportService.generateCampaignReport(filters)
          break
        default:
          return response.status(400).json({ error: 'Unsupported report type' })
      }

      const reportLog = await ReportService.createReportLog(
        config.id,
        config.userId,
        reportData,
        config.format
      )

      return response.json({
        success: true,
        data: reportLog,
      })
    } catch (error) {
      return response.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to generate report',
      })
    }
  }

  /**
   * List report logs
   */
  async listReportLogs({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const configId = request.input('config_id')

    let query = ReportLog.query()

    if (user.role === 'vendor') {
      query = query.where('user_id', user.id)
    }

    if (status) {
      query = query.where('status', status)
    }

    if (configId) {
      query = query.where('report_configuration_id', configId)
    }

    const logs = await query.orderBy('created_at', 'desc').paginate(page, limit)

    return response.json({
      success: true,
      data: logs.all(),
      paging: {
        total: logs.total,
        perPage: logs.perPage,
        currentPage: logs.currentPage,
        lastPage: logs.lastPage,
      },
    })
  }

  /**
   * Get a specific report log
   */
  async getReportLog({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const logId = request.param('id')

    const log = await ReportLog.find(logId)
    if (!log) {
      return response.status(404).json({ error: 'Report log not found' })
    }

    if (user.role === 'vendor' && log.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    return response.json({
      success: true,
      data: log,
    })
  }

  /**
   * Download a generated report
   */
  async downloadReport({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const logId = request.param('id')

    const log = await ReportLog.find(logId)
    if (!log) {
      return response.status(404).json({ error: 'Report not found' })
    }

    if (user.role === 'vendor' && log.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    if (log.status !== 'completed') {
      return response.status(400).json({ error: 'Report is not ready for download' })
    }

    // Placeholder: In production, serve the actual file
    return response.json({
      success: true,
      message: 'Report download initiated',
      downloadUrl: log.reportFileUrl,
    })
  }

  /**
   * Create a report schedule
   */
  async createSchedule({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const configId = request.param('id')

    const config = await ReportConfiguration.find(configId)
    if (!config) {
      return response.status(404).json({ error: 'Configuration not found' })
    }

    if (user.role === 'vendor' && config.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const { cronExpression, scheduleType, intervalMinutes, maxOccurrences, endDate } = request.all()

    const schedule = await ReportService.scheduleReport(config.id, {
      cronExpression: cronExpression || '0 0 * * *',
      scheduleType: scheduleType || 'cron',
      intervalMinutes,
      maxOccurrences,
      endDate: endDate ? DateTime.fromISO(endDate) : undefined,
    })

    return response.json({
      success: true,
      data: schedule,
    })
  }

  /**
   * List report schedules
   */
  async listSchedules({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const configId = request.param('id')

    const config = await ReportConfiguration.find(configId)
    if (!config) {
      return response.status(404).json({ error: 'Configuration not found' })
    }

    if (user.role === 'vendor' && config.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const schedules = await ReportSchedule.query().where('report_configuration_id', config.id)

    return response.json({
      success: true,
      data: schedules,
    })
  }

  /**
   * Update a schedule
   */
  async updateSchedule({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const scheduleId = request.param('scheduleId')

    const schedule = await ReportSchedule.find(scheduleId)
    if (!schedule) {
      return response.status(404).json({ error: 'Schedule not found' })
    }

    const config = await ReportConfiguration.find(schedule.reportConfigurationId)
    if (!config) {
      return response.status(404).json({ error: 'Configuration not found' })
    }

    if (user.role === 'vendor' && config.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    const updates = request.only([
      'cronExpression',
      'intervalMinutes',
      'isActive',
      'isPaused',
      'maxOccurrences',
    ])

    await schedule.merge(updates).save()

    return response.json({
      success: true,
      data: schedule,
    })
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const scheduleId = request.param('scheduleId')

    const schedule = await ReportSchedule.find(scheduleId)
    if (!schedule) {
      return response.status(404).json({ error: 'Schedule not found' })
    }

    const config = await ReportConfiguration.find(schedule.reportConfigurationId)
    if (!config) {
      return response.status(404).json({ error: 'Configuration not found' })
    }

    if (user.role === 'vendor' && config.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    await schedule.delete()

    return response.json({
      success: true,
      message: 'Schedule deleted',
    })
  }

  /**
   * Archive a report
   */
  async archiveReport({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const logId = request.param('id')

    const log = await ReportLog.find(logId)
    if (!log) {
      return response.status(404).json({ error: 'Report not found' })
    }

    if (user.role === 'vendor' && log.userId !== user.id) {
      return response.status(403).json({ error: 'Unauthorized' })
    }

    try {
      const archive = await ReportService.archiveReport(log.id)

      return response.json({
        success: true,
        data: archive,
      })
    } catch (error) {
      return response.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to archive report',
      })
    }
  }

  /**
   * Get report statistics
   */
  async getStats({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    let query = ReportLog.query()

    if (user.role === 'vendor') {
      query = query.where('user_id', user.id)
    }

    if (startDate) {
      query = query.where('created_at', '>=', startDate)
    }
    if (endDate) {
      query = query.where('created_at', '<=', endDate)
    }

    const logs = await query

    const stats = {
      totalReports: logs.length,
      completedReports: logs.filter((l) => l.status === 'completed').length,
      failedReports: logs.filter((l) => l.status === 'failed').length,
      archivedReports: logs.filter((l) => l.isArchived).length,
      totalGenerationTimeMs: logs.reduce((sum, l) => sum + (l.generationTimeMs || 0), 0),
      averageGenerationTimeMs:
        logs.length > 0
          ? logs.reduce((sum, l) => sum + (l.generationTimeMs || 0), 0) / logs.length
          : 0,
      reportsByFormat: {
        pdf: logs.filter((l) => l.formatGenerated === 'pdf').length,
        csv: logs.filter((l) => l.formatGenerated === 'csv').length,
        excel: logs.filter((l) => l.formatGenerated === 'excel').length,
        json: logs.filter((l) => l.formatGenerated === 'json').length,
      },
    }

    return response.json({
      success: true,
      data: stats,
    })
  }
}
