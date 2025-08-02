'use client';

import {
  Home,
  User,
  Bell,
  Search,
  PenSquare,
  LogIn,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { NexoLogo } from '../shared/NexoLogo';
import { CreatePostDialog } from '../posts/CreatePost';
import type { Profile } from '@/lib/types';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();

  const navItems = profile
    ? [
        { href: '/', label: 'Inicio', icon: Home },
        { href: '#', label: 'Explorar', icon: Search, disabled: true },
        { href: '#', label: 'Notificaciones', icon: Bell, disabled: true },
        { href: '/chat', label: 'Mensajes', icon: MessageSquare },
        { href: `/u/${profile.username}`, label: 'Perfil', icon: User },
      ]
    : [
        { href: '/', label: 'Inicio', icon: Home },
        { href: '#', label: 'Explorar', icon: Search, disabled: true },
      ];

  const authButtons = [
    { href: '/login', label: 'Iniciar Sesión', icon: LogIn },
    { href: '/register', label: 'Registrarse', icon: UserPlus },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center border-r border-border p-4 sm:flex lg:w-64 lg:items-start">
      <Link
        href="/"
        className="mb-4 flex items-center gap-2 self-start px-2"
      >
        <NexoLogo className="h-8 w-8 text-primary" />
        <span className="hidden text-2xl font-bold lg:inline">Nexo</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.label} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={item.href} passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 rounded-full p-3 text-xl',
                        isActive && 'font-bold'
                      )}
                      disabled={(item as any).disabled}
                      aria-disabled={(item as any).disabled}
                    >
                      <item.icon className="h-7 w-7" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4 lg:hidden"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
        {profile && (
          <CreatePostDialog profile={profile}>
            <Button className="mt-4 w-full justify-center gap-3 rounded-full p-3 text-lg lg:w-auto lg:px-16">
              <PenSquare className="h-7 w-7 lg:hidden" />
              <span className="hidden text-lg font-bold lg:inline">
                Publicar
              </span>
            </Button>
          </CreatePostDialog>
        )}
      </nav>

      <div className="mt-auto flex w-full flex-col gap-2">
        {profile ? (
          <ThemeSwitcher profile={profile} />
        ) : (
          <div className="flex flex-col gap-2 lg:items-start items-center">
            {authButtons.map((item) => (
              <Link key={item.href} href={item.href} className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-center lg:justify-start gap-3 rounded-full p-3"
                >
                  <item.icon className="h-6 w-6" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
