import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/client'

// --- Types ---
export interface UserProfile {
  id: string
  name: string
  group_id: string | null
  group_serial: number
  skip_credit: number
  role: string
  groups?: {
    group_name: string
    name?: string
    join_code: string
  }
}

export interface TaskRecord {
  id: string
  type: 'trash' | 'toilet'
  status: 'pending' | 'completed' | 'missed'
  due_date: string
  assigned_to: string
  completed_by: string | null
  assigned?: { name: string }
  completer?: { name: string }
}

// --- Custom Hook ---
export function useMess() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

  const supabase = createClient()

  // ১. ইউজার এবং টাস্ক ডাটা আনা
  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true)
    const { data: authData } = await supabase.auth.getUser()
    const authUser = authData?.user

    if (authUser) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!userError && userData) {
        let groupInfo = null
        let fetchedTasks: TaskRecord[] = []

        if (userData.group_id) {
          const { data: groupData } = await supabase
            .from('groups')
            .select('*')
            .eq('id', userData.group_id)
            .single()

          groupInfo = groupData

          const { data: tasksData } = await supabase
            .from('tasks')
            .select(
              `
                id, type, status, due_date, assigned_to, completed_by,
                assigned:users!tasks_assigned_to_fkey(name),
                completer:users!tasks_completed_by_fkey(name)
            `
            )
            .eq('group_id', userData.group_id)
            .order('due_date', { ascending: false })

          if (tasksData) fetchedTasks = tasksData as unknown as TaskRecord[]
        }

        setTasks(fetchedTasks)
        setUser({ ...userData, groups: groupInfo } as UserProfile)
      }
    }
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchUserInfo()
  }, [fetchUserInfo])

  // ২. গ্রুপ তৈরি করা
  const createGroup = async (groupName: string) => {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { data: authData } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (!authUser?.id) throw new Error('User ID is missing.')

    const { data: newGroup, error: groupError } = await supabase
      .from('groups')
      .insert([
        {
          group_name: groupName,
          admin_id: authUser.id,
          join_code: joinCode,
          total_members: 1,
          current_trash_turn: 1,
          current_toilet_turn: 1,
          current_rannaghor_turn: 1,
        },
      ])
      .select()
      .single()

    if (groupError) throw groupError

    await supabase
      .from('users')
      .update({ group_id: newGroup.id, role: 'admin', group_serial: 1 })
      .eq('id', authUser.id)

    await fetchUserInfo()
  }

  // ৩. গ্রুপে জয়েন করা
  const joinGroup = async (joinCode: string) => {
    const { data: authData } = await supabase.auth.getUser()
    const authUser = authData?.user
    if (!authUser?.id) throw new Error('Not logged in')

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('id, total_members')
      .eq('join_code', joinCode.toUpperCase())
      .single()

    if (groupError || !groupData) throw new Error('Invalid Join Code!')

    const newSerial = groupData.total_members + 1

    await supabase
      .from('users')
      .update({
        group_id: groupData.id,
        group_serial: newSerial,
        role: 'member',
      })
      .eq('id', authUser.id)

    await supabase
      .from('groups')
      .update({ total_members: newSerial })
      .eq('id', groupData.id)

    await fetchUserInfo()
  }

  // ৪. টাস্ক কমপ্লিট করা (প্রক্সি লজিক সহ)
  const completeTask = async (taskId: string, assignedToId: string) => {
    if (!user) return
    setCompletingTaskId(taskId)
    try {
      await supabase
        .from('tasks')
        .update({ status: 'completed', completed_by: user.id })
        .eq('id', taskId)

      if (user.id !== assignedToId) {
        await supabase
          .from('users')
          .update({ skip_credit: (user.skip_credit || 0) + 1 })
          .eq('id', user.id)
        alert('🎉 Awesome! You earned 1 Skip Credit for helping out!')
      }
      await fetchUserInfo()
    } catch (error) {
      console.error(error)
      alert('Failed to complete task.')
    } finally {
      setCompletingTaskId(null)
    }
  }

  // ৫. টাস্ক স্কিপ করা
  const skipTask = async (taskId: string, groupId: string) => {
    if (!user || user.skip_credit <= 0) return
    setCompletingTaskId(taskId)
    try {
      await supabase
        .from('users')
        .update({ skip_credit: user.skip_credit - 1 })
        .eq('id', user.id)
      const { data: groupData } = await supabase
        .from('groups')
        .select('total_members')
        .eq('id', groupId)
        .single()

      const nextSerial =
        user.group_serial >= (groupData?.total_members || 1)
          ? 1
          : user.group_serial + 1
      const { data: nextUser } = await supabase
        .from('users')
        .select('id')
        .eq('group_id', groupId)
        .eq('group_serial', nextSerial)
        .maybeSingle()

      if (nextUser) {
        await supabase
          .from('tasks')
          .update({ assigned_to: nextUser.id, status: 'pending' })
          .eq('id', taskId)
      }
      alert('✅ Task assigned to the next member.')
      await fetchUserInfo()
    } catch (error) {
      console.error(error)
      alert('Failed to skip task.')
    } finally {
      setCompletingTaskId(null)
    }
  }

  // ৬. সাইন আউট
  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

  return {
    user,
    tasks,
    isLoading,
    completingTaskId,
    createGroup,
    joinGroup,
    completeTask,
    skipTask,
    signOut,
  }
}
