import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-[#0B4AA2] text-white shadow-lg shadow-[#0B4AA2]/20 hover:bg-[#0D59C2] hover:shadow-[#0B4AA2]/30",
        destructive:
          "bg-red-500 text-slate-50 shadow-sm hover:bg-red-500/90",
        outline:
          "border border-white/10 bg-transparent shadow-sm hover:bg-white/5 hover:border-white/20 text-[#EAF2FF]",
        secondary:
          "bg-white/5 text-[#EAF2FF] shadow-sm hover:bg-white/10 border border-white/5",
        ghost: "hover:bg-white/5 hover:text-[#EAF2FF]",
        link: "text-[#D4AF37] underline-offset-4 hover:underline",
        gold: "bg-[#D4AF37] text-[#07111F] font-bold hover:bg-[#E5C35D] shadow-lg shadow-[#D4AF37]/20",
      },
      size: {
        default: "h-11 px-6 py-2 rounded-[14px]",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-[16px] px-8",
        icon: "h-11 w-11 rounded-[14px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
