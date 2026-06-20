'use server'

import { sendPushNotification } from '@/lib/push'

export async function testPushAction(userId: string) {
  try {
    const success = await sendPushNotification(
      userId,
      'Hello man 🚀',
      'This is a test notification from the app.'
    )
    return { success }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
