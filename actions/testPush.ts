'use server'

import { sendPushNotification } from '@/lib/push'

export async function testPushAction(userId: string, title: string, message: string) {
  try {
    const success = await sendPushNotification(
      userId,
      title,
      message
    )
    return { success }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
