'use client'

import { useEffect, useState } from 'react'

import { UserProfile } from '@/app/profile/hooks/useMess'
import { createClient } from '@/lib/client'

import UrgentModal from './UrgentModal'

export default function UrgentNotice() {
  const supabase = createClient()

  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    async function getUsers() {
      const { data, error } = await supabase.from('users').select('*')

      if (error) {
        console.error(error)
        return
      }
      setUsers(data)
    }

    getUsers()
  }, [supabase])

  return (
    <div className="mb-4 rounded-md border p-4 shadow-md shadow-gray-100/10 dark:border-gray-700 dark:bg-gray-900">
       {users.map((user: UserProfile) => (
        <div
          key={user.id}
          className="mb-4 flex items-center justify-between gap-2 p-4"
        >
          <p className="bg-linear-to-tr from-blue-500 to-purple-500 bg-clip-text font-semibold text-transparent dark:text-slate-200">
            {user.name}
          </p>
          <UrgentModal name={user.name} userId={user.id} />
        </div>
      ))}
    </div>
  )
}
