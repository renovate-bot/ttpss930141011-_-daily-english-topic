/**
 * Sign-in modal component with modern design.
 * Implements a clean modal interface for authentication.
 */

'use client'

import { useState, Dispatch, SetStateAction } from 'react'
import { signIn } from 'next-auth/react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog'
import { Logo } from '@/components/shared/logo'
import { Icons } from '@/components/shared/Icons'

interface SignInModalProps {
  showSignInModal: boolean
  setShowSignInModal: Dispatch<SetStateAction<boolean>>
}

/**
 * Modal component for user authentication.
 * Provides OAuth sign-in options in a clean modal interface.
 */
export function SignInModal({
  showSignInModal,
  setShowSignInModal,
}: SignInModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  return (
    <Modal className="!max-w-sm" showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full">
        <DialogHeader className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 py-6 pt-8 md:px-12">
          <div className="flex justify-center mb-4">
            <Logo width={80} height={80} />
          </div>
          <DialogTitle className="font-urban text-3xl font-extrabold text-white text-center mb-1">Welcome back</DialogTitle>
          <DialogDescription className="text-base text-gray-200 text-center mb-6">Sign in to continue learning</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-6 md:px-12">
          <Button
            disabled={loadingProvider !== null}
            variant="outline"
            className="cursor-pointer relative w-full h-9 text-lg font-medium text-foreground"
            onClick={() => {
              setLoadingProvider('google')
              signIn('google', { callbackUrl: '/' })
            }}
          >
            {loadingProvider === 'google' ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              <>
                <Icons.google className="mr-2 h-5 w-5" />
                Continue with Google
              </>
            )}
          </Button>

          <Button
            disabled={loadingProvider !== null}
            className="cursor-pointer relative w-full h-9 text-lg font-medium bg-[#24292e] text-white hover:bg-[#24292e]/90"
            onClick={() => {
              setLoadingProvider('github')
              signIn('github', { callbackUrl: '/' })
            }}
          >
            {loadingProvider === 'github' ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              <>
                <Icons.gitHub className="mr-2 h-5 w-5" />
                Continue with GitHub
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * Loading spinner component.
 */
function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}