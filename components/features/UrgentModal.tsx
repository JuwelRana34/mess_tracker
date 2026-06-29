import { useState } from 'react'

import { toast } from 'sonner'

import { testPushAction } from '@/actions/testPush'

import { Modal } from '../shared/Modal'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function UrgentModal({
  name,
  userId,
}: {
  name: string
  userId: string
}) {
  const [loading, setLoading] = useState<boolean>(false)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [title, setTitle] = useState<string | ''>('')
  const [message, setMessage] = useState<string | ''>('')

  const handleUrgentNotice = async (userId: string) => {
    setLoading(true)
    if (!title || !message) {
      toast.error(
        'Please provide both title and message for the urgent notice.'
      )
      setLoading(false)
      return
    }

    try {
      await testPushAction(userId, title, message)

      toast.success('Urgent notice sent successfully!')
      setModalOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to send urgent notice. Please try again.')
    } finally {
      setTitle('')
      setMessage('')
      setLoading(false)
    }
  }
  return (
    <Modal
      title="Urgent Notice"
      trigger={
        <Button variant="destructive" className="capitalize">
          urgent notice
        </Button>
      }
      open={modalOpen}
      onOpenChange={setModalOpen}
      description={`Are you sure you want to send an urgent notice to "${name}" ?`}
    >
      <div className="flex w-full flex-col gap-2">
        <Input
          placeholder="Title Here..."
          className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="Enter urgent notice message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button
          disabled={loading}
          variant="destructive"
          className="w-full cursor-pointer capitalize"
          onClick={() => handleUrgentNotice(userId)}
        >
          {loading ? 'Sending...' : 'Send Urgent Notice'}
        </Button>
      </div>
    </Modal>
  )
}
