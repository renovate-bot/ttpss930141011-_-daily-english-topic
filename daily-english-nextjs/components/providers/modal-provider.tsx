/**
 * Modal provider component.
 * Manages all modal states in the application.
 */

'use client'

import { SignInModal } from '@/components/modals/sign-in-modal'
import { useSignInModal } from '@/hooks/use-sign-in-modal'

/**
 * Provider component that renders all modals.
 * This ensures modals are available throughout the app.
 */
export function ModalProvider() {
  const { isOpen, close } = useSignInModal()

  return (
    <>
      <SignInModal 
        showSignInModal={isOpen} 
        setShowSignInModal={close} 
      />
      {/* Add more modals here as needed */}
    </>
  )
}