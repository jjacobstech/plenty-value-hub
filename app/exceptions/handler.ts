import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'
import { createJsonLogEntry, writeJsonLog, DEFAULT_LOG_FILE, logJsonError } from '#services/json_logger'
import OrganisationApiException from '#exceptions/organisation_api_exception'
import { publicId } from '#services/organisation/public_id'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (_, { inertia }) => inertia.render('errors/not_found', {}),
    '500..599': (_, { inertia }) => inertia.render('errors/server_error', {}),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (ctx.request.url().startsWith('/api/v1/organisations/')) return this.renderOrganisationError(error, ctx)
    return super.handle(error, ctx)
  }

  /** Renders /api/v1/organisations errors in the organisation API shape (SPEC §6). */
  private renderOrganisationError(error: any, ctx: HttpContext) {
    const requestId = ctx.organisationRequestId ?? publicId('req_')
    ctx.response.header('Request-Id', requestId)

    if (error instanceof OrganisationApiException) {
      return ctx.response.status(error.status).json({
        error: { type: error.errorType, code: error.code, message: error.message, param: error.param ?? null, request_id: requestId },
      })
    }

    if (error?.code === 'E_VALIDATION_ERROR') {
      const first = error.messages?.[0] ?? {}
      const code =
        first.rule === 'required' ? 'parameter_missing' : first.rule === 'unknown' ? 'parameter_unknown' : 'parameter_invalid'
      return ctx.response.status(400).json({
        error: { type: 'invalid_request_error', code, message: first.message ?? 'Invalid request.', param: first.field ?? null, request_id: requestId },
      })
    }

    if (error?.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.status(404).json({
        error: { type: 'invalid_request_error', code: 'resource_missing', message: 'No such endpoint.', param: null, request_id: requestId },
      })
    }

    const status = error?.status ?? 500
    if (status >= 500) {
      logJsonError({ event: 'organisation_api_internal_error', message: 'Organisation API request failed', error, context: { requestId, path: ctx.request.url() } })
      return ctx.response.status(500).json({
        error: { type: 'api_error', code: 'internal_error', message: 'Something went wrong on our side.', param: null, request_id: requestId },
      })
    }

    return ctx.response.status(status).json({
      error: { type: 'invalid_request_error', code: 'parameter_invalid', message: error.message ?? 'Invalid request.', param: null, request_id: requestId },
    })
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    const entry = createJsonLogEntry({
      level: 'error',
      event: 'http_exception',
      message: error instanceof Error ? error.message : 'Unhandled application error',
      error,
      context: {
        method: ctx.request.method(),
        url: ctx.request.url(),
        route: ctx.route?.pattern,
        status: ctx.response.getStatus(),
      },
      request: {
        ip: ctx.request.ip(),
        headers: Object.fromEntries(
          Object.entries(ctx.request.headers()).map(([key, value]) => [
            key,
            Array.isArray(value) ? value : [value],
          ])
        ),
      },
      metadata: {
        appEnv: app.getEnvironment(),
        loggerFile: DEFAULT_LOG_FILE,
      },
    })

    await writeJsonLog(entry)

    return super.report(error, ctx)
  }
}
