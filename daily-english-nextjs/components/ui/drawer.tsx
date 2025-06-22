"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DrawerContext = React.createContext<{
  direction?: "top" | "bottom" | "left" | "right"
}>({})

interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  direction?: "top" | "bottom" | "left" | "right"
  children: React.ReactNode
}

export function Drawer({
  open = false,
  onOpenChange,
  direction = "bottom",
  children,
}: DrawerProps) {
  return (
    <DrawerContext.Provider value={{ direction }}>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80"
            onClick={() => onOpenChange?.(false)}
          />
          {children}
        </div>
      )}
    </DrawerContext.Provider>
  )
}

export const DrawerTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  return <button ref={ref} onClick={onClick} {...props} />
})
DrawerTrigger.displayName = "DrawerTrigger"

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, ...props }, ref) => {
    const { direction } = React.useContext(DrawerContext)

    const baseStyles = "fixed z-50 gap-4 bg-background p-6 shadow-lg"
    const directionStyles = {
      bottom: "inset-x-0 bottom-0 border-t max-h-[96vh] rounded-t-[10px]",
      top: "inset-x-0 top-0 border-b max-h-[96vh] rounded-b-[10px]",
      left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
      right: "inset-y-0 right-0 h-full w-full sm:w-[400px] border-l",
    }

    const animationStyles = {
      bottom: "animate-in slide-in-from-bottom",
      top: "animate-in slide-in-from-top",
      left: "animate-in slide-in-from-left",
      right: "animate-in slide-in-from-right",
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          directionStyles[direction || "bottom"],
          animationStyles[direction || "bottom"],
          className
        )}
        {...props}
      >
        {/* Drag handle for mobile */}
        {(direction === "bottom" || direction === "top") && (
          <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" />
        )}
        {children}
      </div>
    )
  }
)
DrawerContent.displayName = "DrawerContent"

export const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

export const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

export const DrawerTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerDescription"

export const DrawerClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
      className
    )}
    {...props}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
    <span className="sr-only">Close</span>
  </button>
))
DrawerClose.displayName = "DrawerClose"