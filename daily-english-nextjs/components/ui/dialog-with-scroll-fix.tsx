"use client"

import * as React from "react"
import { Dialog as BaseDialog, DialogContent as BaseDialogContent } from "./dialog"
import { applyScrollbarCompensation, removeScrollbarCompensation, getScrollbarWidth } from "@/lib/fix-scrollbar-shift"

interface DialogProps extends React.ComponentProps<typeof BaseDialog> {
  children: React.ReactNode;
}

/**
 * Enhanced Dialog component that prevents layout shift when scrollbar disappears.
 */
export function DialogWithScrollFix({ children, onOpenChange, ...props }: DialogProps) {
  const handleOpenChange = React.useCallback((open: boolean) => {
    if (open) {
      const scrollbarWidth = getScrollbarWidth();
      if (scrollbarWidth > 0) {
        applyScrollbarCompensation(scrollbarWidth);
      }
    } else {
      removeScrollbarCompensation();
    }
    
    onOpenChange?.(open);
  }, [onOpenChange]);

  return (
    <BaseDialog onOpenChange={handleOpenChange} {...props}>
      {children}
    </BaseDialog>
  );
}

// Re-export other dialog components for convenience
export { 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
  DialogPortal
} from "./dialog";