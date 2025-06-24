'use client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmLeaveDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}
export default function ConfirmLeaveDialog({ open, onClose, onConfirm }: ConfirmLeaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Club?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to leave this club?
        </DialogDescription>
        <DialogFooter className="flex-col justify-center gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={async () => { await onConfirm(); onClose(); }}>Leave</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
