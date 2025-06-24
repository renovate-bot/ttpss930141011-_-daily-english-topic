/**
 * Authentication error page.
 * Displays user-friendly error messages for auth failures.
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Map error codes to user-friendly messages.
 */
const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  OAuthSignIn: 'Error during OAuth sign in. Please try again.',
  OAuthCallback: 'Error during OAuth callback. Please try again.',
  OAuthCreateAccount: 'Could not create OAuth account. Please try again.',
  EmailCreateAccount: 'Could not create email account. Please try again.',
  Callback: 'Error during callback. Please try again.',
  OAuthAccountNotLinked: 'This account is already linked with another sign in method.',
  Default: 'An unexpected error occurred. Please try again.',
}

/**
 * Authentication error page content component.
 */
function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription>
            Something went wrong during authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
          
          {error && (
            <div className="text-xs text-slate-500">
              Error code: {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/signin">
                Try Again
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/">
                Go Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-slate-500">
            If this problem persists, please contact support
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Authentication error page component with Suspense boundary.
 */
export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}