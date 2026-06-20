'use client'

import { Bell, BellOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePushNotification } from '@/hooks/usePushNotification'

export function PushNotificationBtn() {
  const { userId, isLoading } = useCurrentUser()

  const { isSubscribed, subscribeToPush, unsubscribeFromPush } =
    usePushNotification(userId)

  // ইউজার আইডি না থাকলে বাটন দেখানোর দরকার নেই
  if (isLoading) return <div>Loading...</div>
  if (!userId) return null

  return isSubscribed ? (
    <Button
      variant="outline"
      className="border-red-200 text-red-600 shadow-sm hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
      onClick={unsubscribeFromPush}
    >
      <BellOff className="mr-2 h-4 w-4" /> Disable Notifications
    </Button>
  ) : (
    <Button
      variant="outline"
      className="border-blue-200 text-blue-600 shadow-sm hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"
      onClick={subscribeToPush}
    >
      <Bell className="mr-2 h-4 w-4" /> Enable Notifications
    </Button>
  )
}
