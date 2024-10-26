import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/styles"

const badgeDeltaVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      type: {
        increase: "bg-green-50 text-green-700 ring-green-600/20",
        decrease: "bg-red-50 text-red-700 ring-red-600/20",
      },
    },
    defaultVariants: {
      type: "increase",
    },
  }
)

export interface BadgeDeltaProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeDeltaVariants> {}

function BadgeDelta({ className, type, ...props }: BadgeDeltaProps) {
  return (
    <span className={cn(badgeDeltaVariants({ type }), className)} {...props} />
  )
}

export { BadgeDelta, badgeDeltaVariants }