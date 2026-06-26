import { NextResponse } from 'next/server';



import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { randomSms } from '@/lib/randomSms';























































































webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // আজকের তারিখ বের করা (যাতে শুধু আজকের বা তার আগের পেন্ডিং কাজ ধরে)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // 🌟 ডাটাবেজ থেকে পেন্ডিং টাস্ক এবং ওই ইউজারের সাবস্ক্রিপশন একসাথে আনা (Join Query)
    const { data: pendingTasks, error } = await supabase
      .from('tasks')
      .select(
        `
        id,
        type,
        assigned_to,
        users!tasks_assigned_to_fkey ( push_subscription )
      `
      )
      .eq('status', 'pending')
      .lte('due_date', todayStr) // আজকের বা আগের যেকোনো পেন্ডিং কাজ

    if (error) throw error

    // যদি কারো কাজ বাকি না থাকে
    if (!pendingTasks || pendingTasks.length === 0) {
      console.log(
        '✅ কোনো পেন্ডিং কাজ নেই। সবাইকে নোটিফিকেশন পাঠানোর দরকার নেই।'
      )
      return NextResponse.json({ message: 'No pending tasks found.' })
    }

    let sentCount = 0

    // 🌟 যাদের কাজ বাকি, তাদের সবাইকে লুপ চালিয়ে নোটিফিকেশন পাঠানো
    for (const task of pendingTasks) {
      // Supabase রিলেশন থেকে ডেটা Object বা Array হিসেবে আসতে পারে
      const userObj = Array.isArray(task.users) ? task.users[0] : task.users

      if (userObj && userObj.push_subscription) {
        const taskName =
          task.type === 'trash' ? 'ময়লা ফেলার' : 'টয়লেট পরিষ্কার করার'

        const randomBody = randomSms(taskName)

        const payload = JSON.stringify({
          title: '🚨 রিমাইন্ডার: ডিউটি বাকি আছে!',
          body: randomBody,
          url: '/profile',
        })

        try {
          await webpush.sendNotification(userObj.push_subscription, payload)
          sentCount++
          console.log(`✅ Push sent to user ID: ${task.assigned_to}`)
        } catch (pushError) {
          console.error(
            `❌ Failed to send to user ${task.assigned_to}:`,
            pushError
          )
          // যদি ইউজারের সাবস্ক্রিপশন বাতিল বা এক্সপায়ার হয়ে যায়, সেটার এরর এখানে ধরা পড়বে
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Push sent successfully to ${sentCount} users!`,
    })
  } catch (error) {
    console.error('Push Error:', error)
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 })
  }
}
