import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  total_orders: number
  points: number
  plastic_reduction_pct: number
  co2_offset_kg: number
}

interface AuthResult {
  error?: string
  needsConfirmation?: boolean
}

interface UserContextType {
  user: User | null
  loading: boolean
  loginWithEmail: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  loginAsDemo: (id: string) => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  loginWithEmail: async () => ({}),
  register: async () => ({}),
  loginAsDemo: async () => {},
  logout: async () => {},
})

const DEMO_KEY = 'loopee_user_id'

async function fetchUserProfile(id: string): Promise<User | null> {
  const { data } = await supabase.from('users').select('*').eq('id', id).single()
  return data ?? null
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      // 1. Check Supabase Auth session first
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        if (mounted) { setUser(profile); setLoading(false) }
        return
      }
      // 2. Fall back to demo localStorage
      const demoId = localStorage.getItem(DEMO_KEY)
      if (demoId) {
        const profile = await fetchUserProfile(demoId)
        if (mounted) setUser(profile)
      }
      if (mounted) setLoading(false)
    }

    init()

    // React to auth state changes (sign in / sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        if (mounted) setUser(profile)
      } else if (event === 'SIGNED_OUT') {
        const demoId = localStorage.getItem(DEMO_KEY)
        if (demoId) {
          const profile = await fetchUserProfile(demoId)
          if (mounted) setUser(profile)
        } else {
          if (mounted) setUser(null)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loginWithEmail = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'Đăng ký thất bại, vui lòng thử lại' }

    // Insert profile into public.users
    await supabase.from('users').insert({
      id: data.user.id,
      name: name.trim(),
      email,
      avatar_url: null,
      total_orders: 0,
      points: 0,
      plastic_reduction_pct: 0,
      co2_offset_kg: 0,
    })

    // If no session yet = email confirmation required
    if (!data.session) return { needsConfirmation: true }
    return {}
  }

  const loginAsDemo = async (id: string) => {
    await supabase.auth.signOut()
    localStorage.setItem(DEMO_KEY, id)
    const profile = await fetchUserProfile(id)
    setUser(profile)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem(DEMO_KEY)
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, loading, loginWithEmail, register, loginAsDemo, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext).user
export const useAuth = () => useContext(UserContext)
