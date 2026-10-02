import VendorConversion from '#models/vendor_conversion'
import CommissionLedger from '#models/commission_ledger'
import Campaign from '#models/campaign'
import ReportConfiguration from '#models/report_configuration'
import ReportLog from '#models/report_log'
import ReportSchedule from '#models/report_schedule'
import ScheduledReportExecution from '#models/scheduled_report_execution'
import ReportExport from '#models/report_export'
import ReportArchive from '#models/report_archive'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

interface ReportData {
  title: string
  description?: string
  data: any[]
  summary?: Record<string, any>
  charts?: Record<string, any>
  totalRows: number
  totalValue?: number
  generatedAt: DateTime
}

interface ReportFilters {
  campaignId?: number
  affiliateId?: number
  startDate?: DateTime
  endDate?: DateTime
  riskLevel?: string
  status?: string
}

export default class ReportService {
  /**
   * Generate conversion report data
   */
  static async generateConversionReport(
    filters: ReportFilters
  ): Promise<ReportData> {
    let query = VendorConversion.query()

    if (filters.campaignId) {
      query = query.where('campaign_id', filters.campaignId)
    }
    if (filters.affiliateId) {
      query = query.where('affiliate_id', filters.affiliateId)
    }
    if (filters.startDate) {
      const startDate = filters.startDate as DateTime
      const startIso = startDate.toISO()
      if (startIso) {
        query = query.where('created_at', '>=', startIso)
      }
    }
    if (filters.endDate) {
      const endDate = filters.endDate as DateTime
      const endIso = endDate.toISO()
      if (endIso) {
        query = query.where('created_at', '<=', endIso)
      }
    }
    if (filters.status) {
      query = query.where('status', filters.status)
    }

    const conversions = await query

    const totalValue = conversions.reduce((sum, c) => sum + (c.amount || 0), 0)
    const summary = {
      totalConversions: conversions.length,
      totalValue,
      averageValue: conversions.length > 0 ? totalValue / conversions.length : 0,
      pendingConversions: conversions.filter((c) => c.status === 'pending').length,
      approvedConversions: conversions.filter((c) => c.status === 'approved').length,
      rejectedConversions: conversions.filter((c) => c.status === 'rejected').length,
    }

    return {
      title: 'Conversion Report',
      data: conversions.map((c) => ({
        id: c.id,
        campaignId: c.campaignId,
        affiliateId: c.affiliateId,
        amount: c.amount,
        status: c.status,
        isFraudFlagged: c.isFraudFlagged,
        createdAt: c.createdAt,
      })),
      summary,
      totalRows: conversions.length,
      totalValue,
      generatedAt: DateTime.now(),
    }
  }

  /**
   * Generate commission report data
   */
  static async generateCommissionReport(
    filters: ReportFilters
  ): Promise<ReportData> {
    let query = CommissionLedger.query()

    if (filters.affiliateId) {
      query = query.where('affiliate_id', filters.affiliateId)
    }
    if (filters.startDate) {
      const startDate = filters.startDate as DateTime
      const startIso = startDate.toISO()
      if (startIso) {
        query = query.where('created_at', '>=', startIso)
      }
    }
    if (filters.endDate) {
      const endDate = filters.endDate as DateTime
      const endIso = endDate.toISO()
      if (endIso) {
        query = query.where('created_at', '<=', endIso)
      }
    }
    if (filters.status) {
      query = query.where('status', filters.status)
    }

    const commissions = await query

    const totalAmount = commissions.reduce((sum, c) => sum + (c.amount || 0), 0)
    const summary = {
      totalCommissions: commissions.length,
      totalAmount,
      averageAmount: commissions.length > 0 ? totalAmount / commissions.length : 0,
      paidCommissions: commissions.filter((c) => c.status === 'paid').length,
      pendingCommissions: commissions.filter((c) => c.status === 'pending').length,
      heldCommissions: commissions.filter((c) => c.onHold).length,
    }

    return {
      title: 'Commission Report',
      data: commissions.map((c) => ({
        id: c.id,
        affiliateId: c.affiliateId,
        amount: c.amount,
        rate: c.rate,
        status: c.status,
        onHold: c.onHold,
        createdAt: c.createdAt,
      })),
      summary,
      totalRows: commissions.length,
      totalValue: totalAmount,
      generatedAt: DateTime.now(),
    }
  }

  /**
   * Generate campaign report data
   */
  static async generateCampaignReport(
    filters: ReportFilters
  ): Promise<ReportData> {
    let query = Campaign.query()

    if (filters.campaignId) {
      query = query.where('id', filters.campaignId)
    }
    if (filters.startDate) {
      const startDate = filters.startDate as DateTime
      const startIso = startDate.toISO()
      if (startIso) {
        query = query.where('created_at', '>=', startIso)
      }
    }
    if (filters.endDate) {
      const endDate = filters.endDate as DateTime
      const endIso = endDate.toISO()
      if (endIso) {
        query = query.where('created_at', '<=', endIso)
      }
    }
    if (filters.status) {
      query = query.where('status', filters.status)
    }

    const campaigns = await query.preload('vendor')

    const summary = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
      pausedCampaigns: campaigns.filter((c) => c.status === 'paused').length,
      archivedCampaigns: campaigns.filter((c) => c.status === 'archived').length,
    }

    return {
      title: 'Campaign Report',
      data: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        vendorId: c.vendorId,
        status: c.status,
        commissionType: c.commissionType,
        createdAt: c.createdAt,
      })),
      summary,
      totalRows: campaigns.length,
      generatedAt: DateTime.now(),
    }
  }

  /**
   * Create a report log entry
   */
  static async createReportLog(
    reportConfigurationId: number,
    userId: number,
    reportData: ReportData,
    format: 'pdf' | 'csv' | 'excel' | 'json'
  ): Promise<ReportLog> {
    const fileName = `report_${uuidv4()}_${DateTime.now().toFormat('yyyyMMdd_HHmmss')}.${this.getFileExtension(format)}`
    const filePath = `/reports/${fileName}`
    const fileUrl = `/api/reports/download/${uuidv4()}`

    const reportLog = await ReportLog.create({
      reportConfigurationId,
      userId,
      reportFileName: fileName,
      reportFilePath: filePath,
      reportFileUrl: fileUrl,
      status: 'completed',
      formatGenerated: format,
      rowCount: reportData.totalRows,
      startDate: DateTime.now(),
      endDate: DateTime.now(),
      filtersApplied: reportData,
      totalRows: reportData.totalRows,
      totalValue: reportData.totalValue,
      generationTimeMs: 0,
      metadata: {
        title: reportData.title,
        description: reportData.description,
      },
    })

    return reportLog
  }

  /**
   * Send report via email
   */
  static async sendReportEmail(
    reportLog: ReportLog,
    emailRecipients: string[]
  ): Promise<boolean> {
    try {
      // Placeholder for email service integration
      // In production, integrate with Resend, SendGrid, or similar
      console.log(`Sending report ${reportLog.id} to ${emailRecipients.join(', ')}`)

      await reportLog.merge({
        emailSentTo: emailRecipients.join(','),
        emailSentAt: DateTime.now(),
      }).save()

      return true
    } catch (error) {
      console.error('Failed to send report email:', error)
      return false
    }
  }

  /**
   * Schedule a report for recurring execution
   */
  static async scheduleReport(
    reportConfigurationId: number,
    scheduleConfig: {
      cronExpression: string
      scheduleType: 'cron' | 'interval' | 'manual'
      intervalMinutes?: number
      maxOccurrences?: number
      endDate?: DateTime
    }
  ): Promise<ReportSchedule> {
    const schedule = await ReportSchedule.create({
      reportConfigurationId,
      cronExpression: scheduleConfig.cronExpression,
      scheduleType: scheduleConfig.scheduleType,
      intervalMinutes: scheduleConfig.intervalMinutes,
      maxOccurrences: scheduleConfig.maxOccurrences,
      startDate: DateTime.now(),
      endDate: scheduleConfig.endDate || null,
      nextRunAt: DateTime.now(),
      isActive: true,
      isPaused: false,
      retryCount: 0,
      maxRetries: 3,
    })

    return schedule
  }

  /**
   * Execute a scheduled report
   */
  static async executeScheduledReport(
    reportScheduleId: number
  ): Promise<ReportLog | null> {
    const schedule = await ReportSchedule.find(reportScheduleId)
    if (!schedule) return null

    const execution = await ScheduledReportExecution.create({
      reportScheduleId,
      executionStatus: 'running',
      scheduledFor: DateTime.now(),
      triggeredBy: 'scheduler',
    })

    try {
      const config = await ReportConfiguration.find(schedule.reportConfigurationId)
      if (!config) return null

      const startTime = DateTime.now()

      let reportData: ReportData

      const filters: ReportFilters = {
        startDate: config.scheduleConfig?.startDate
          ? DateTime.fromISO(config.scheduleConfig.startDate as string)
          : DateTime.now().minus({ months: 1 }),
        endDate: DateTime.now(),
      }

      switch (config.reportType) {
        case 'conversion':
          reportData = await this.generateConversionReport(filters)
          break
        case 'commission':
          reportData = await this.generateCommissionReport(filters)
          break
        case 'campaign':
          reportData = await this.generateCampaignReport(filters)
          break
        default:
          throw new Error(`Unsupported report type: ${config.reportType}`)
      }

      const reportLog = await this.createReportLog(
        config.id,
        config.userId,
        reportData,
        config.format
      )

      if (config.emailRecipients) {
        const recipients = config.emailRecipients.split(',').map((e: string) => e.trim())
        await this.sendReportEmail(reportLog, recipients)
      }

      const endTime = DateTime.now()
      const duration = endTime.diff(startTime, 'milliseconds').milliseconds

      await execution.merge({
        reportLogId: reportLog.id,
        executionStatus: 'completed',
        executedAt: DateTime.now(),
        executionDurationMs: Number(duration),
      }).save()

      await schedule.merge({
        lastRunAt: DateTime.now(),
        nextRunAt: this.calculateNextRun(schedule),
        occurrencesCount: schedule.occurrencesCount + 1,
      }).save()

      return reportLog
    } catch (error) {
      await execution.merge({
        executionStatus: 'failed',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
      }).save()

      await schedule.merge({
        retryCount: schedule.retryCount + 1,
        lastErrorMessage: error instanceof Error ? error.message : 'Unknown error',
      }).save()

      return null
    }
  }

  /**
   * Archive a report
   */
  static async archiveReport(reportLogId: number): Promise<ReportArchive> {
    const reportLog = await ReportLog.find(reportLogId)
    if (!reportLog) throw new Error('Report not found')

    const archiveLocation = `/archives/${reportLog.reportFileName}.gz`

    const archive = await ReportArchive.create({
      reportLogId,
      archiveLocation,
      archiveFormat: 'gzip',
      originalFileSize: reportLog.fileSize,
      compressedFileSize: reportLog.fileSize ? Math.floor(reportLog.fileSize * 0.3) : null,
      compressionRatio: 0.3,
      archivedAt: DateTime.now(),
      retentionUntil: DateTime.now().plus({ years: 1 }),
      isRetrievable: true,
      storageType: 's3',
    })

    await reportLog.merge({
      isArchived: true,
      archivedAt: DateTime.now(),
      archivedLocation: archiveLocation,
    }).save()

    return archive
  }

  /**
   * Create an export record
   */
  static async createExport(
    reportLogId: number,
    userId: number,
    exportType: 'manual' | 'scheduled' | 'bulk'
  ): Promise<ReportExport> {
    const export_ = await ReportExport.create({
      reportLogId,
      userId,
      exportType,
      exportIdentifier: uuidv4(),
      includeHeaders: true,
      totalRecords: 0,
      exportedRecords: 0,
      isEncrypted: false,
      expiresAt: DateTime.now().plus({ days: 30 }),
    })

    return export_
  }

  /**
   * Calculate next run time for scheduled report
   */
  private static calculateNextRun(schedule: ReportSchedule): DateTime {
    if (schedule.scheduleType === 'interval' && schedule.intervalMinutes) {
      return DateTime.now().plus({ minutes: schedule.intervalMinutes })
    }

    // For cron, would need a cron parser library
    // Placeholder: add 1 day for weekly schedules
    return DateTime.now().plus({ days: 1 })
  }

  /**
   * Get file extension for format
   */
  private static getFileExtension(format: 'pdf' | 'csv' | 'excel' | 'json'): string {
    const extensions: Record<string, string> = {
      pdf: 'pdf',
      csv: 'csv',
      excel: 'xlsx',
      json: 'json',
    }
    return extensions[format] || 'pdf'
  }
}
