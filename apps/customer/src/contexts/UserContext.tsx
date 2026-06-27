import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, DEMO_USER_ID } from '../lib/supabase'

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

const UserContext = createContext<User | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase
      .from('users')
      .select('*')
      .eq('id', DEMO_USER_ID)
      .single()
      .then(({ data }) => {
        if (data) setUser(data)
      })
  }, [])

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
