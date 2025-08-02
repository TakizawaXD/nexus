'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { MOCK_USER } from '@/lib/mock-data'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const user = MOCK_USER;

  return (
    <div className='flex items-center justify-between rounded-full p-2 hover:bg-accent'>
        <div className='flex items-center gap-2'>
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url ?? undefined} />
                <AvatarFallback>
                    <User />
                </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
                <p className="font-bold text-sm">{user.full_name}</p>
                <p className="text-muted-foreground text-sm">@{user.username}</p>
            </div>
        </div>
        <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="rounded-full"
        >
        <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
        </Button>
    </div>
  )
}
