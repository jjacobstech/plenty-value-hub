import NewsletterSubscriber from '#models/newsletter_subscriber'
import { subscribeNewsletterValidator, unsubscribeValidator } from '#validators/newsletter'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class NewslettersController {
  async subscribe({ request, response }: HttpContext) {
    const payload = await request.validateUsing(subscribeNewsletterValidator)

    let subscriber = await NewsletterSubscriber.findBy('email', payload.email)

    if (subscriber) {
      if (subscriber.status === 'active') {
        return response.json({
          success: true,
          message: 'You are already subscribed',
          alreadySubscribed: true,
        })
      }

      subscriber.status = 'active'
      await subscriber.save()
    } else {
      subscriber = await NewsletterSubscriber.create({
        email: payload.email,
        name: payload.name || null,
        interests: payload.interests || [],
        source: payload.source || 'website',
        status: 'active',
      })
    }

    await mail.send((message) => {
      message
        .to(subscriber.email)
        .subject("You're subscribed to Plenty Value Newsletter! 🎉")
        .htmlView('emails/newsletter_confirmation', {
          subscriber: subscriber.serialize(),
        })
    })

    return response.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      alreadySubscribed: false,
    })
  }

  async unsubscribe({ request, response }: HttpContext) {
    const payload = await request.validateUsing(unsubscribeValidator)

    const subscriber = await NewsletterSubscriber.findBy('email', payload.email)

    if (!subscriber) {
      return response.json({
        success: true,
        message: 'You have been unsubscribed',
      })
    }

    subscriber.status = 'unsubscribed'
    await subscriber.save()

    return response.json({
      success: true,
      message: 'You have been unsubscribed from the newsletter',
    })
  }
}
