import { DateTime } from 'luxon'

export class OtpService {
  static OTP_LENGTH = 6
  static OTP_EXPIRY_MINUTES = 10

  generate(): string {
    const digits = Math.floor(Math.random() * Math.pow(10, this.OTP_LENGTH))
      .toString()
      .padStart(this.OTP_LENGTH, '0')
    return digits
  }

  getExpiryTime(): DateTime {
    return DateTime.now().plus({ minutes: this.OTP_EXPIRY_MINUTES })
  }

  isExpired(expiresAt: DateTime | null): boolean {
    if (!expiresAt) return true
    return DateTime.now() > expiresAt
  }
}
