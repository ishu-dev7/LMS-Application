import { createContext, useContext, useState, type ReactNode } from 'react'
import { api, setSession, clearSession, getStoredUser, getToken, type StoredUser } from './api'
import type { AuthResponse } from './types'

interface AuthContextValue {
  user: StoredUser | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, displayName: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => (getToken() ? getStoredUser() : null))

  function apply(res: AuthResponse) {
    const u: StoredUser = { userId: res.userId, email: res.email, displayName: res.displayName, role: res.role }
    setSession(res.token, u)
    setUser(u)
  }

  async function login(email: string, password: string) {
    apply(await api.post<AuthResponse>('/api/auth/login', { email, password }))
  }

  async function register(email: string, displayName: string, password: string) {
    apply(await api.post<AuthResponse>('/api/auth/register', { email, displayName, password }))
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
