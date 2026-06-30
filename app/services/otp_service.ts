import { DateTime } from 'luxon'

export class OtpService {
  static OTP_LENGTH = 6
  static OTP_EXPIRY_MINUTES = 10

  generate(): string {
    const digits = Math.floor(Math.random() * Math.pow(10, OtpService.OTP_LENGTH))
      .toString()
      .padStart(OtpService.OTP_LENGTH, '0')
    return digits
  }

  getExpiryTime(): DateTime {
    return DateTime.now().plus({ minutes: OtpService.OTP_EXPIRY_MINUTES })
  }

  isExpired(expiresAt: DateTime | null): boolean {
    if (!expiresAt) return true
    return DateTime.now() > expiresAt
  }
}
