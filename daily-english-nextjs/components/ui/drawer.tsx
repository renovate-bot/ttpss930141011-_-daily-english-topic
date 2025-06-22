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
  const [isVisible, setIsVisible] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setIsVisible(true)
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      const timeout = setTimeout(() => {
        setIsVisible(false)
      }, 300) // Match animation duration
      return () => clearTimeout(timeout)
    }
  }, [open])

  if (!isVisible) return null

  return (
    <DrawerContext.Provider value={{ direction }}>
      <div className="fixed inset-0 z-50 flex">
        <div
          className={cn(
            "fixed inset-0 bg-black/80 transition-opacity duration-300",
            isAnimating ? "opacity-100" : "opacity-0"
          )}
          onClick={() => onOpenChange?.(false)}
        />
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<DrawerContentProps>, { isAnimating })
            : child
        )}
      </div>
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
  isAnimating?: boolean
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, isAnimating, ...props }, ref) => {
    const { direction } = React.useContext(DrawerContext)

    const baseStyles = "fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform duration-300 ease-out"
    const directionStyles = {
      bottom: "inset-x-0 bottom-0 border-t max-h-[96vh] rounded-t-[10px]",
      top: "inset-x-0 top-0 border-b max-h-[96vh] rounded-b-[10px]",
      left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
      right: "inset-y-0 right-0 h-full w-full sm:w-[400px] border-l",
    }

    const transformStyles = {
      bottom: isAnimating ? "translate-y-0" : "translate-y-full",
      top: isAnimating ? "translate-y-0" : "-translate-y-full",
      left: isAnimating ? "translate-x-0" : "-translate-x-full",
      right: isAnimating ? "translate-x-0" : "translate-x-full",
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          directionStyles[direction || "bottom"],
          transformStyles[direction || "bottom"],
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