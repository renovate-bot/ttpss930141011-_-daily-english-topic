/**
 * User navigation component.
 * Displays user information and authentication controls.
 */

'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import Image from 'next/image'
import { type Locale } from '@/i18n-config'

interface UserNavProps {
  locale?: Locale
}

/**
 * Get a color for the avatar based on the user's name/email
 */
function getAvatarColor(name: string | null | undefined, email: string | null | undefined): string {
  const str = name || email || 'user'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 60%, 50%)`
}

/**
 * User navigation component with dropdown menu.
 */
export function UserNav({ locale = 'zh-TW' }: UserNavProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <Button asChild variant="ghost" size="sm">
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    )
  }

  const userInitial = (session.user.name?.[0] || session.user.email?.[0] || '?').toUpperCase()
  const avatarColor = getAvatarColor(session.user.name, session.user.email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 p-0 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20">
          <div className="relative h-full w-full">
            {session.user.image ? (
              <div className="relative h-full w-full rounded-lg overflow-hidden">
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User avatar'}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div 
                className="flex h-full w-full items-center justify-center rounded-lg text-white font-semibold text-sm"
                style={{ backgroundColor: avatarColor }}
              >
                {userInitial}
              </div>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-lg border-white/20" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              {session.user.image ? (
                <div className="relative h-full w-full rounded-lg overflow-hidden">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div 
                  className="flex h-full w-full items-center justify-center rounded-lg text-white font-semibold text-sm"
                  style={{ backgroundColor: avatarColor }}
                >
                  {userInitial}
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs leading-none text-gray-400">
                {session.user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/20" />
        <DropdownMenuItem asChild className="text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer">
          <Link href={`/${locale}/dashboard/billing`}>
            <span className="mr-2">💳</span>
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer">
          <Link href="/profile">
            <span className="mr-2">👤</span>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer">
          <Link href="/settings">
            <span className="mr-2">⚙️</span>
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/20" />
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
        >
          <span className="mr-2">🚪</span>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}