import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#D4AF37] transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-[14px] border border-white/10 bg-[#0E2442]/50 px-4 py-2 text-sm text-[#EAF2FF] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]/50 focus-visible:border-[#D4AF37]/50 disabled:cursor-not-allowed disabled:opacity-50 hover:border-white/20 focus:bg-[#0B1B32]",
            icon && "pl-11",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
