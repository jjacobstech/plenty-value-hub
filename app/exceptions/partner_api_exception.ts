import { Exception } from '@adonisjs/core/exceptions'

export type PartnerErrorType =
  | 'invalid_request_error'
  | 'authentication_error'
  | 'permission_error'
  | 'rate_limit_error'
  | 'idempotency_error'
  | 'api_error'

/** Error raised inside /v1 and rendered in the SPEC §6 shape by the exception handler. */
export default class PartnerApiException extends Exception {
  constructor(
    message: string,
    public readonly errorType: PartnerErrorType,
    public readonly code: string,
    status: number,
    public readonly param?: string
  ) {
    super(message, { status, code })
  }
}
