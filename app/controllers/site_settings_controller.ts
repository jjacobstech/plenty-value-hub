import SiteSetting from '#models/site_setting'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import { createReadStream } from 'node:fs'
import { extname } from 'node:path'
import { randomBytes } from 'node:crypto'

export default class SiteSettingsController {
  async index({ response }: HttpContext) {
    const settings = await SiteSetting.all()
    return response.json(settings.map((s) => s.serialize()))
  }

  async show({ params, response }: HttpContext) {
    const settings = await SiteSetting.query().where('key', params.key)
    return response.json(settings.map((s) => s.serialize()))
  }

  async upsert({ request, response }: HttpContext) {
    const body = request.body() as Record<string, any>
    const { key, label, value } = body

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

    await drive.use('fs').putStream(key, createReadStream(file.tmpPath!), {
      contentType: file.headers['content-type'],
      visibility: 'public',
    })

    const url = await drive.use('fs').getUrl(key)
    return response.json({ success: true, url })
  }
}
