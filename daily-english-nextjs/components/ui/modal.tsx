"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { Drawer } from "vaul";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  showModal?: boolean;
  setShowModal?: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  desktopOnly?: boolean;
  preventDefaultClose?: boolean;
}

/**
 * Custom Dialog implementation that prevents scroll lock
 */
function DialogNoScrollLock({ children, open, onOpenChange }: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  useEffect(() => {
    if (!open) return;

    // Save original body style
    const originalStyle = document.body.style.cssText;

    // Override Radix UI's modifications
    const overrideBodyStyles = () => {
      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'scroll';
      document.body.style.paddingRight = '';
    };
    
    // Apply immediately and after a delay to ensure it sticks
    overrideBodyStyles();
    const timer = setTimeout(overrideBodyStyles, 10);
    const timer2 = setTimeout(overrideBodyStyles, 50);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      // Restore original style
      document.body.style.cssText = originalStyle;
    };
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function Modal({
  children,
  className,
  showModal,
  setShowModal,
  onClose,
  desktopOnly,
  preventDefaultClose,
}: ModalProps) {
  const closeModal = ({ dragged }: { dragged?: boolean } = {}) => {
    if (preventDefaultClose && !dragged) {
      return;
    }
    // fire onClose event if provided
    if (onClose) {
      onClose();
    }

    // if setShowModal is defined, use it to close modal
    if (setShowModal) {
      setShowModal(false);
    }
  };
  
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (isMobile && !desktopOnly) {
    return (
      <Drawer.Root
        open={setShowModal ? showModal : true}
        onOpenChange={(open) => {
          if (!open) {
            closeModal({ dragged: true });
          }
        }}
      >
        <Drawer.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" />
        <Drawer.Portal>
          <Drawer.Content
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border bg-background",
              className,
            )}
          >
            <div className="sticky top-0 z-20 flex w-full items-center justify-center bg-inherit">
              <div className="my-3 h-1.5 w-16 rounded-full bg-muted-foreground/20" />
            </div>
            {children}
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }
  
  return (
    <DialogNoScrollLock
      open={setShowModal ? showModal : true}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-0 shadow-lg duration-200 sm:max-w-lg overflow-hidden md:max-w-md md:rounded-2xl md:border",
            className,
          )}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogNoScrollLock>
  );
}