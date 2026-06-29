import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

function dashboardForRole(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'vendor') return '/vendor'
  if (role === 'affiliate') return '/affiliate'
  return '/marketplace'
}

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response }: HttpContext) {
    const { email, password } = request.all()
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)
    return response.redirect(dashboardForRole(user.role ?? 'consumer'))
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/auth/login')
  }
}
