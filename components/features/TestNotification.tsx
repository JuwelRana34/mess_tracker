'use client'
import { testPushAction } from "@/actions/testPush"

 // বাটন ইভেন্ট চালানোর জন্য এটি অবশ্যই দিতে হবে


export default function TestNotification() {
  const handleSendNotification = async () => {
    // সরাসরি lib/push না ডেকে, সার্ভার অ্যাকশন কল করছি
    const result = await testPushAction('58f7c054-fb87-4226-ac06-c5e9f4c0b6f8', 'Test notification from Next.js 13.4 app', 'This is a test notification sent from the Next.js 13.4 app using server actions.')

    if (result.success) {
      alert('Notification sent!')
    } else {
      alert('Failed to send notification.')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Test Notification</h2>
      <button
        onClick={handleSendNotification}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Send Notification
      </button>
    </div>
  )
}
