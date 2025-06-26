import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'
import LoadingDots from './loading-dots'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background cursor-pointer select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  hapticEffect?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled = false, hapticEffect = true, ...props }, ref) => {
    const [loading, setLoading] = React.useState(false);  
    const Comp = asChild ? Slot : 'button'

    const handleClick = async (event: React.MouseEvent) => {
      const { onClick } = props;

      event.stopPropagation();
      
      if (hapticEffect) {
        if ('vibrate' in navigator) {
          navigator.vibrate(100); 
        }
      }

      if (onClick) {
        setLoading(true)
        await Promise.resolve(onClick(event as React.MouseEvent<HTMLButtonElement>))
        setLoading(false)
      }

      if (event.defaultPrevented) return;
    };
    
    if (hapticEffect) {
      return (
        <motion.div
          whileHover={
            !disabled
              ? {
                  translateY: "-1px",
                }
              : {}
          }
          whileTap={
            !disabled
              ? {
                  scale: 0.95,
                }
              : {}
          }
          className={cn(buttonVariants({ variant, size, className }))}
        >
          {loading ? (
            <LoadingDots />
          ) : (
            <Comp
              ref={ref}
              {...props}
              className="w-full h-full"
              disabled={disabled || loading}
              onClick={handleClick}
            />
          )}
        </motion.div>
      );
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
