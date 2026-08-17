import axios from 'axios'
import { toast } from 'sonner'

function getCsrfToken() {
  const match = document.cookie.split('; ').find((r) => r.startsWith('XSRF-TOKEN='))
  return match ? decodeURIComponent(match.split('=')[1]) : ''
}

const api = axios.create()

api.interceptors.request.use((config) => {
  config.headers['X-XSRF-TOKEN'] = getCsrfToken()
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show error toast if explicitly handled by the component
    const isHandledByComponent = error.config?.headers?.['X-Skip-Toast'] === 'true'

    if (!isHandledByComponent && error.response) {
      const status = error.response.status
      const data = error.response.data
      const errorMessage = data?.error || data?.message || `Error: ${status}`

      // Show error alert based on status code
      if (status === 401) {
        toast.error('Session expired. Please log in again.')
        // Could redirect to login here if needed
      } else if (status === 403) {
        toast.error('Access denied. You do not have permission for this action.')
      } else if (status === 404) {
        toast.error('Resource not found.')
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.')
      } else if (status >= 400) {
        toast.error(errorMessage)
      }
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

export { api as apiClient }
export default api
