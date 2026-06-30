import { createContext, useContext } from 'react'
import { usePage } from '@inertiajs/react'

const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = usePage().props as any

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    return null
  }
  return context
}
