import './css/app.css'
import { client } from './client'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import 'quill-table-better/dist/quill-table-better.css'
import { Toaster } from 'sonner'

const appName = import.meta.env.VITE_APP_NAME || 'Plenty Value'

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) => {
    return resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx'))
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <App {...props} />
        <Toaster position="top-center" richColors />
      </TuyauProvider>
    )
  },
  progress: {
    color: '#4B5563',
  },
})
