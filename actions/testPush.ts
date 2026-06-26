'use server'

import { sendPushNotification } from '@/lib/push';







export async function testPushAction(userId: string) {
  try {
    const success = await sendPushNotification(
      userId,
      'hey chodom🚀',
      'হ্যালো! 👋 আপনার আজকের balpaknami টাস্কটি এখনো পেন্ডিং রয়েছে। নির্ধারিত সময়ের আগেই অনুগ্রহ করে কাজটি সম্পন্ন করুন। '
    )
    return { success }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
