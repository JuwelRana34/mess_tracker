import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ModalProps {
  trigger?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Modal({
  trigger,
  title,
  description,
  children,
  className,
  open,
  onOpenChange,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* যদি trigger প্রপস থাকে তবেই এটি দেখাবে */}
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className={className || 'sm:max-w-106.25'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* মেইন কন্টেন্ট এখানে রেন্ডার হবে */}
        <div className="py-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
