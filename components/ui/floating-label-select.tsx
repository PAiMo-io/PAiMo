import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/select'
import { FloatingLabel } from '@/components/ui/floating-label-input'

interface FloatingLabelSelectProps
  extends React.ComponentPropsWithoutRef<typeof Select> {
  id?: string
  label?: string
  placeholder?: string
  children: React.ReactNode
}

function FloatingLabelSelect({ id, label, placeholder = ' ', children, ...props }: FloatingLabelSelectProps) {
  return (
    <Select {...props}>
      <div className="relative">
        <SelectTrigger id={id} className={cn('w-full peer')}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
      </div>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}

FloatingLabelSelect.displayName = 'FloatingLabelSelect'

export { FloatingLabelSelect }
