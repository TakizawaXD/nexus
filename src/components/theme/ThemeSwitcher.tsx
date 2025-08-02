'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import type { Profile } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { signOut } from '@/lib/actions/auth.actions'

export function ThemeSwitcher({ profile }: { profile: Profile | null }) {
  const { theme, setTheme } = useTheme()

  if (!profile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='flex w-full items-center justify-between rounded-full p-2 text-left transition-colors hover:bg-accent'>
          <div className='flex items-center gap-2'>
              <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback>
                      <User />
                  </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                  <p className="font-bold text-sm">{profile.full_name}</p>
                  <p className="text-muted-foreground text-sm">@{profile.username}</p>
              </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mb-2" align="end">
          <DropdownMenuItem asChild>
              <Link href={`/settings/profile`}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
              </Link>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Cambiar Tema</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={signOut} className="w-full">
            <button type="submit" className="w-full">
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </button>
          </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
