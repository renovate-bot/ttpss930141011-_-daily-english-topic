/**
 * Custom hook for managing sign-in modal state.
 * Provides a centralized way to control the sign-in modal.
 */

'use client'

import { create } from 'zustand'

interface SignInModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Zustand store for sign-in modal state management.
 */
const useSignInModalStore = create<SignInModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))

/**
 * Custom hook to use the sign-in modal.
 * 
 * @example
 * ```tsx
 * const { isOpen, open, close } = useSignInModal()
 * 
 * return (
 *   <>
 *     <button onClick={open}>Sign In</button>
 *     <SignInModal showSignInModal={isOpen} setShowSignInModal={close} />
 *   </>
 * )
 * ```
 */
export function useSignInModal() {
  const isOpen = useSignInModalStore((state) => state.isOpen)
  const open = useSignInModalStore((state) => state.open)
  const close = useSignInModalStore((state) => state.close)
  const toggle = useSignInModalStore((state) => state.toggle)

  return { isOpen, open, close, toggle }
}