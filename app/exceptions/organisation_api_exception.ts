import { Exception } from '@adonisjs/core/exceptions'

export type OrganisationErrorType =
  | 'invalid_request_error'
  | 'authentication_error'
  | 'permission_error'
  | 'rate_limit_error'
  | 'idempotency_error'
  | 'api_error'

/** Error raised inside /api/v1/organisations and rendered in the SPEC §6 shape by the exception handler. */
export default class OrganisationApiException extends Exception {
  constructor(
    message: string,
    public readonly errorType: OrganisationErrorType,
    public readonly code: string,
    status: number,
    public readonly param?: string
  ) {
    super(message, { status, code })
  }
}
