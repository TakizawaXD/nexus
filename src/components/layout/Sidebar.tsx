import { Home, User, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { NexoLogo } from '../shared/NexoLogo';
import { CreatePostDialog } from '../posts/CreatePost';
import type { Profile } from '@/lib/types';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { MOCK_USER } from '@/lib/mock-data';

export default function Sidebar() {
  const profile: Profile = MOCK_USER;

  const navItems =
      [
          { href: '/', icon: Home, label: 'Inicio' },
          { href: `/u/${profile.username}`, icon: User, label: 'Perfil' },
      ];

  return (
    <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center border-r border-border p-4 sm:flex lg:w-64 lg:items-start">
      <Link href="/" className="mb-8 flex items-center gap-2 self-start">
        <NexoLogo className="h-8 w-8 text-primary" />
        <span className="hidden text-xl font-bold lg:inline">Nexo</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-3 text-lg"
            >
              <item.icon className="h-6 w-6" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex w-full flex-col gap-2">
        <ThemeSwitcher />
        <CreatePostDialog profile={profile}>
            <Button className="w-full justify-center gap-3 p-3 text-lg lg:justify-start">
            <PenSquare className="h-6 w-6" />
            <span className="hidden lg:inline">Publicar</span>
            </Button>
        </CreatePostDialog>
      </div>
    </aside>
  );
}
