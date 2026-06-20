'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/client'

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) throw error

        if (user) {
          setUserId(user.id)
        } else {
          setUserId(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUserId(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { userId, isLoading }
}
