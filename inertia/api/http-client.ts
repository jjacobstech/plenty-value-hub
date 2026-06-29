import axios from 'axios'

function getCsrfToken() {
  const match = document.cookie.split('; ').find(r => r.startsWith('XSRF-TOKEN='))
  return match ? decodeURIComponent(match.split('=')[1]) : ''
}

const api = axios.create()

api.interceptors.request.use((config) => {
  config.headers['X-XSRF-TOKEN'] = getCsrfToken()
  return config
})

export { api as apiClient }
export default api
