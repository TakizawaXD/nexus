import { Home, User, Bell, Search, PenSquare, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { NexoLogo } from '../shared/NexoLogo';
import { CreatePostDialog } from '../posts/CreatePost';
import type { Profile } from '@/lib/types';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { getAuthProfile } from '@/lib/actions/user.actions';

export default async function Sidebar() {
  const profile = await getAuthProfile();

  const navItems = profile
    ? [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '#', icon: Search, label: 'Explorar' },
        { href: '#', icon: Bell, label: 'Notificaciones' },
        { href: `/u/${profile.username}`, icon: User, label: 'Perfil' },
      ]
    : [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '#', icon: Search, label: 'Explorar' },
        { href: '/login', icon: LogIn, label: 'Iniciar Sesión' },
        { href: '/register', icon: UserPlus, label: 'Registrarse' },
      ];

  return (
    <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center border-r border-border p-4 sm:flex lg:w-64 lg:items-start">
      <Link href="/" className="mb-4 flex items-center gap-2 self-start px-2">
        <NexoLogo className="h-8 w-8 text-primary" />
        <span className="hidden text-2xl font-bold lg:inline">Nexo</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-full p-3 text-xl"
            >
              <item.icon className="h-7 w-7" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>
          </Link>
        ))}
        {profile && (
          <CreatePostDialog profile={profile}>
            <Button className="w-full justify-center gap-3 rounded-full p-3 text-lg lg:mt-4 lg:w-auto lg:px-10">
              <PenSquare className="h-7 w-7 lg:hidden" />
              <span className="hidden text-lg font-bold lg:inline">Publicar</span>
            </Button>
          </CreatePostDialog>
        )}
      </nav>

      <div className="mt-auto flex w-full flex-col gap-2">
        <ThemeSwitcher profile={profile} />
      </div>
    </aside>
  );
}
