import { useEffect, useState } from 'react'

import { createClient } from '@/lib/client'
import { getErrorMessage } from '@/lib/errorHandler'

export function usePushNotification(userId: string | null) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && userId) {
      // Service Worker রেজিস্টার করা
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription)
        })
      })
    }
  }, [userId])

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // 🌟 সাবস্ক্রাইব করার ফাংশন
  const subscribeToPush = async () => {
    try {
      if (!userId) throw new Error('User not logged in')

      const registration = await navigator.serviceWorker.ready
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      })

      // ডাটাবেজে JSONB আকারে সাবস্ক্রিপশন সেভ করা
      const { error } = await supabase
        .from('users')
        .update({ push_subscription: JSON.parse(JSON.stringify(subscription)) })
        .eq('id', userId)

      if (error) throw error

      setIsSubscribed(true)
      alert('✅ Notifications enabled successfully!')
    } catch (error) {
      alert('Failed to subscribe: ' + getErrorMessage(error))
    }
  }

  // 🌟 আনসাবস্ক্রাইব করার ফাংশন (নতুন)
  const unsubscribeFromPush = async () => {
    try {
      if (!userId) throw new Error('User not logged in')

      // ১. ব্রাউজার থেকে সাবস্ক্রিপশন রিমুভ করা
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
      }

      // ২. ডাটাবেজ থেকে সাবস্ক্রিপশন মুছে ফেলা (null করে দেওয়া)
      const { error } = await supabase
        .from('users')
        .update({ push_subscription: null })
        .eq('id', userId)

      if (error) throw error

      setIsSubscribed(false)
      alert('🔕 Notifications disabled successfully!')
    } catch (error) {
      alert('Failed to unsubscribe: ' + getErrorMessage(error))
    }
  }

  // রিটার্ন অবজেক্টে unsubscribeFromPush যোগ করা হলো
  return { isSubscribed, subscribeToPush, unsubscribeFromPush }
}
