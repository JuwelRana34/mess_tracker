'use client'

import { useState } from 'react'

// Hook ইমপোর্ট করুন

import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  Loader2,
  LogOut,
  PlusCircle,
  ShowerHead,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'

import { PushNotificationBtn } from '@/components/shared/NotificationBtn'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getErrorMessage } from '@/lib/errorHandler'

import { TaskRecord, UserProfile, useMess } from './hooks/useMess'
import { useCurrentUser } from '@/hooks/useCurrentUser'

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function ProfilePage() {
  const {
    user,
    tasks,
    isLoading,
    completingTaskId,
    createGroup,
    joinGroup,
    completeTask,
    skipTask,
    signOut,
  } = useMess()
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (!user?.id) return window.location.replace('/signin')
  // যদি গ্রুপ না থাকে, তবে No Group UI দেখাবো
  if (user && !user.group_id) {
    return (
      <NoGroupView
        user={user}
        onCreate={createGroup}
        onJoin={joinGroup}
        onSignOut={signOut}
      />
    )
  }

  // যদি গ্রুপ থাকে, তবে ড্যাশবোর্ড দেখাবো
  return (
    <DashboardView
      user={user!}
      tasks={tasks}
      completingTaskId={completingTaskId}
      onComplete={completeTask}
      onSkip={skipTask}
      onSignOut={signOut}
    />
  )
}

// -------------------------------------------------------------
// SUB COMPONENT 1: No Group View (Create / Join Mess)
// -------------------------------------------------------------
function NoGroupView({
  user,
  onCreate,
  onJoin,
  onSignOut,
}: {
  user: UserProfile
  onCreate: (n: string) => Promise<void>
  onJoin: (c: string) => Promise<void>
  onSignOut: () => void
}) {
  const [isJoinMode, setIsJoinMode] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    await onCreate(newGroupName)
    setIsProcessing(false)
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      await onJoin(joinCodeInput)
    } catch (error) {
      alert(getErrorMessage(error))
    }
    setIsProcessing(false)
  }

  return (
    <div className="container mx-auto mt-10 max-w-md p-4 md:p-8">
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gray-50 pb-4 text-center dark:bg-gray-800/30">
          <Avatar className="mx-auto mb-4 h-16 w-16 border-2 border-gray-200">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            />
            <AvatarFallback>{user?.name?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">Welcome, {user?.name}!</CardTitle>
          <CardDescription>
            You are not in any mess yet. Create a new one or join an existing
            mess.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {!isJoinMode ? (
            <>
              {/* Create Mess */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                  <PlusCircle className="h-5 w-5 text-blue-600" /> Create New
                  Mess
                </h3>
                <form onSubmit={handleCreate} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Enter Mess Name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white p-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 py-6 font-bold hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Create Mess as Admin'
                    )}
                  </Button>
                </form>
              </div>

              {/* Join Mess Button */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="mb-2 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                  <Users className="h-5 w-5 text-emerald-600" /> Join Existing
                  Mess
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setIsJoinMode(true)}
                  className="w-full border-emerald-200 bg-white py-6 text-emerald-700 hover:bg-emerald-50 dark:bg-gray-900"
                >
                  Go to Join Page
                </Button>
              </div>
            </>
          ) : (
            // Join Mess Form
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Button
                variant="ghost"
                onClick={() => setIsJoinMode(false)}
                className="mb-4 -ml-2 text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                  <Users className="h-5 w-5 text-emerald-600" /> Enter Join Code
                </h3>
                <form onSubmit={handleJoin} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="e.g. A7X9WQ"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    className="rounded-lg border border-emerald-200 bg-white p-4 text-center font-mono text-2xl font-bold tracking-widest uppercase outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-900"
                    maxLength={6}
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isProcessing || joinCodeInput.length < 6}
                    className="w-full bg-emerald-600 py-6 font-bold hover:bg-emerald-700"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Join Mess'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={onSignOut}
            className="mt-4 w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// -------------------------------------------------------------
// SUB COMPONENT 2: Dashboard View
// -------------------------------------------------------------
function DashboardView({
  user,
  tasks,
  completingTaskId,
  onComplete,
  onSkip,
  onSignOut,
}: {
  user: UserProfile
  tasks: TaskRecord[]
  completingTaskId: string | null
  onComplete: (id: string, assignedTo: string) => void
  onSkip: (id: string, groupId: string) => void
  onSignOut: () => void
}) {
  const totalCompletedByMe = tasks.filter(
    (t) => t.status === 'completed' && t.completed_by === user.id
  ).length
  const missedTasks = tasks.filter(
    (t) =>
      t.assigned_to === user.id &&
      (t.status === 'missed' ||
        (t.status === 'completed' && t.completed_by !== user.id))
  )

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-start md:p-8 dark:border-gray-800 dark:bg-gray-900">
        <Avatar className="h-24 w-24 border-4 border-blue-50 shadow-sm md:h-28 md:w-28 dark:border-blue-900/30">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
          />
          <AvatarFallback>
            {user?.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:justify-start">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {user?.name}
            </h1>
            <Badge
              variant={user?.role === 'admin' ? 'default' : 'secondary'}
              className={
                user?.role === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-100 text-emerald-800'
              }
            >
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </Badge>
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {user?.groups?.group_name || user?.groups?.name}{' '}
            <span className="px-2 text-gray-300">|</span> Serial: #
            {user?.group_serial}
          </p>

          {user?.role === 'admin' && user?.groups && (
            <div className="mt-2 inline-flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Invite Code:
              </span>
              <span className="cursor-pointer font-mono text-lg font-bold tracking-widest text-blue-700 select-all dark:text-blue-400">
                {user?.groups?.join_code}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 shadow-sm hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/30"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
        <PushNotificationBtn />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
          <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 opacity-10">
            <Gift className="h-32 w-32" />
          </div>
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Gift className="h-5 w-5" /> Skip Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-5xl font-extrabold">{user.skip_credit || 0}</p>
            <p className="mt-2 text-sm font-medium text-emerald-50 opacity-90">
              Earned by helping others
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-gray-700 dark:text-gray-300">
              Total Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-extrabold text-blue-600 dark:text-blue-500">
              {totalCompletedByMe}
            </p>
            <p className="mt-2 text-sm font-medium text-gray-500">
              All time record
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity History */}
      <Card className="border-gray-100 shadow-sm dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Activity History</CardTitle>
          <CardDescription className="text-md">
            View all recent tasks from your mess.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <TabsTrigger value="all" className="rounded-md px-6">
                All History
              </TabsTrigger>
              <TabsTrigger
                value="missed"
                className="rounded-md px-6 data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
              >
                My Missed Tasks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800/30">
                  No tasks have been created in this mess yet.
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    user={user}
                    completingTaskId={completingTaskId}
                    onComplete={onComplete}
                    onSkip={onSkip}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="missed" className="space-y-3">
              {missedTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 py-10 text-center text-gray-500 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400 opacity-50" />
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">
                    Great job! You haven&apos;t missed any tasks.
                  </p>
                </div>
              ) : (
                missedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/30 dark:bg-red-950/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/50 dark:text-red-400">
                        <XCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 capitalize dark:text-white">
                          {task.type === 'trash'
                            ? 'Moila Felano'
                            : 'Toilet Porishkar'}
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                          {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="mb-1 border-red-200 bg-red-100 text-red-600 dark:bg-red-900/30"
                      >
                        Penalty Applied
                      </Badge>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Covered by {task.completer?.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// -------------------------------------------------------------
// SUB COMPONENT 3: Task Card (To keep the list clean)
// -------------------------------------------------------------
function TaskCard({
  task,
  user,
  completingTaskId,
  onComplete,
  onSkip,
}: {
  task: TaskRecord
  user: UserProfile
  completingTaskId: string | null
  onComplete: (id: string, assignedTo: string) => void
  onSkip: (id: string, groupId: string) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-center gap-4">
        <div
          className={`rounded-full p-3 shadow-inner ${task.type === 'trash' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30' : 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30'}`}
        >
          {task.type === 'trash' ? (
            <Trash2 className="h-6 w-6" />
          ) : (
            <ShowerHead className="h-6 w-6" />
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 capitalize dark:text-white">
            {task.type === 'trash' ? 'Moila Felano' : 'Toilet Porishkar'}
          </p>
          <p className="text-sm font-medium text-gray-500">
            Assigned: {task.assigned?.name || 'Unknown'} •{' '}
            {new Date(task.due_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="text-right">
        {task.status === 'completed' ? (
          task.assigned_to === task.completed_by ? (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 px-3 py-1 text-green-600 dark:bg-green-900/20"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Completed
            </Badge>
          ) : (
            <div className="flex flex-col items-end">
              <Badge
                variant="outline"
                className="mb-1 border-blue-200 bg-blue-50 px-2 text-blue-600 dark:bg-blue-900/20"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" /> Proxy Complete
              </Badge>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-gray-800">
                Done by {task.completer?.name}
              </span>
            </div>
          )
        ) : task.status === 'missed' ? (
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 px-3 py-1 text-red-600 dark:bg-red-900/20"
            >
              <XCircle className="mr-1 h-3 w-3" /> Missed
            </Badge>
            <Button
              size="sm"
              onClick={() => onComplete(task.id, task.assigned_to)}
              disabled={completingTaskId === task.id}
              className="h-8 bg-green-600 px-3 text-xs text-white hover:bg-green-700"
            >
              {completingTaskId === task.id ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              )}{' '}
              Mark Complete
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 px-3 py-1 text-amber-600 dark:bg-amber-900/20"
            >
              Pending
            </Badge>
            <Button
              size="sm"
              onClick={() => onComplete(task.id, task.assigned_to)}
              disabled={completingTaskId === task.id}
              className="h-8 bg-green-600 px-3 text-xs text-white hover:bg-green-700"
            >
              {completingTaskId === task.id ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              )}{' '}
              Mark Complete
            </Button>
            {user.id === task.assigned_to && task.type === 'trash' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSkip(task.id, user.group_id || '')}
                disabled={
                  completingTaskId === task.id || (user.skip_credit || 0) <= 0
                }
                className="h-8 border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <Gift className="mr-1 h-3 w-3" /> Skip with 1 Credit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
