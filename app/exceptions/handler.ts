import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'
import { createJsonLogEntry, writeJsonLog, DEFAULT_LOG_FILE } from '#services/json_logger'

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
    return super.handle(error, ctx)
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
