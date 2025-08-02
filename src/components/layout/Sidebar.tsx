import { Home, User, PenSquare, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import UserNav from '../auth/UserNav';
import { NexoLogo } from '../shared/NexoLogo';
import { CreatePostDialog } from '../posts/CreatePost';
import type { Profile } from '@/lib/types';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { createServerClient } from '@/lib/supabase/server';
import { getAuthProfile } from '@/lib/actions/user.actions';

export default async function Sidebar() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    profile = await getAuthProfile();
  }

  const navItems =
    user && profile
      ? [
          { href: '/', icon: Home, label: 'Inicio' },
          { href: `/u/${profile.username}`, icon: User, label: 'Perfil' },
        ]
      : [];

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
        {user && profile ? (
          <>
            <CreatePostDialog user={user} profile={profile}>
              <Button className="w-full justify-center gap-3 p-3 text-lg lg:justify-start">
                <PenSquare className="h-6 w-6" />
                <span className="hidden lg:inline">Publicar</span>
              </Button>
            </CreatePostDialog>
            <UserNav user={user} profile={profile} />
          </>
        ) : (
          <Link href="/login">
            <Button className="w-full justify-center gap-3 p-3 text-lg lg:justify-start">
              <LogIn className="h-6 w-6" />
              <span className="hidden lg:inline">Iniciar sesión</span>
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}
