import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// VAPID কনফিগারেশন
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url: string = '/'
) {
  try {
    // ডাটাবেজ থেকে ইউজারের সাবস্ক্রিপশন আনা
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: user } = await supabase
      .from('users')
      .select('push_subscription')
      .eq('id', userId)
      .single()

    // যদি ইউজার নোটিফিকেশন অন না করে থাকে
    if (!user || !user.push_subscription) {
      console.log(`⚠️ User ${userId} is not subscribed to push notifications.`)
      return false
    }

    // পুশ মেসেজ পাঠানো
    const payload = JSON.stringify({ title, body, url })
    await webpush.sendNotification(user.push_subscription, payload)

    console.log(`✅ Push notification sent to User ${userId}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to send push to User ${userId}:`, error)
    return false
  }
}
