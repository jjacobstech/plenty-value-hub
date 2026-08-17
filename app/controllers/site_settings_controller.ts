import SiteSetting from '#models/site_setting'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'
import drive from '@adonisjs/drive/services/main'
import { createReadStream } from 'node:fs'
import { extname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { PaymentService } from '#services/payment_service'

const storageDisk = env.get('DRIVE')

export default class SiteSettingsController {
  async index({ response }: HttpContext) {
    const settings = await SiteSetting.all()
    const paymentSettings = await PaymentService.getConfig()

    return response.json([
      ...settings.map((s) => s.serialize()),
      {
        key: 'payment_settings',
        label: 'Payment Settings',
        value: JSON.stringify(paymentSettings),
      },
    ])
  }

  async show({ params, response }: HttpContext) {
    const settings = await SiteSetting.query().where('key', params.key)
    if (params.key === 'payment_settings') {
      const paymentSettings = await PaymentService.getConfig()
      return response.json([
        {
          key: 'payment_settings',
          label: 'Payment Settings',
          value: JSON.stringify(paymentSettings),
        },
      ])
    }

    return response.json(settings.map((s) => s.serialize()))
  }

  async paymentConfig({ response }: HttpContext) {
    const paymentSettings = await PaymentService.getConfig()
    return response.json(paymentSettings)
  }

  async upsert({ request, response }: HttpContext) {
    const body = request.body() as Record<string, any>
    const { key, label, value } = body

    if (key === 'payment_settings') {
      const savedSettings = await PaymentService.saveConfig(value)
      return response.json({
        key: 'payment_settings',
        label: 'Payment Settings',
        value: JSON.stringify(savedSettings),
      })
    }

    let setting = await SiteSetting.findBy('key', key)
    if (setting) {
      setting.value = value
      if (label) setting.label = label
      await setting.save()
    } else {
      setting = await SiteSetting.create({ key, label: label || null, value })
    }

    return response.json(setting.serialize())
  }

  async uploadImage({ request, response }: HttpContext) {
    const file = request.file('image', {
      size: 10 * 1024 * 1024,
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!file) {
      return response.badRequest({ error: 'No image file provided' })
    }

    if (!file.isValid) {
      return response.unprocessableEntity({ error: file.errors[0]?.message ?? 'Invalid file' })
    }

    const ext = extname(file.clientName).toLowerCase().replace('.', '') || 'jpg'
    const key = `site/${randomBytes(8).toString('hex')}.${ext}`

    await drive.use(storageDisk).putStream(key, createReadStream(file.tmpPath!), {
      contentType: file.headers['content-type'],
      visibility: 'public',
    })

    const url = await drive.use(storageDisk).getUrl(key)
    return response.json({ success: true, url })
  }
}
