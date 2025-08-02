import { Home, User, PenSquare, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import UserNav from '../auth/UserNav';
import { NexoLogo } from '../shared/NexoLogo';
import { CreatePostDialog } from '../posts/CreatePost';
import { MOCK_USER } from '@/lib/mock-data';

export default async function Sidebar() {
  const user = MOCK_USER; 
  const profile = user ? { username: user.username } : null;

  const navItems = [
    { href: '/', icon: Home, label: 'Inicio', auth: false },
    {
      href: `/u/${profile?.username}`,
      icon: User,
      label: 'Perfil',
      auth: true,
    },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center border-r border-border p-4 sm:flex lg:w-64 lg:items-start">
      <Link href="/" className="mb-8 flex items-center gap-2 self-start">
        <NexoLogo className="h-8 w-8 text-primary" />
        <span className="hidden text-xl font-bold lg:inline">Nexo</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          if (item.auth && !user) return null;
          return (
            <Link key={item.label} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 p-3 text-lg"
              >
                <item.icon className="h-6 w-6" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex w-full flex-col gap-2">
        {user ? (
          <>
            <CreatePostDialog user={user}>
              <Button className="w-full justify-center gap-3 p-3 text-base lg:justify-start">
                <PenSquare className="h-6 w-6" />
                <span className="hidden lg:inline">Publicar</span>
              </Button>
            </CreatePostDialog>

            <UserNav user={user} profile={profile} />
          </>
        ) : (
          <Link href="/login">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 p-3 text-lg"
            >
              <LogIn className="h-6 w-6" />
              <span className="hidden lg:inline">Iniciar Sesión</span>
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}
