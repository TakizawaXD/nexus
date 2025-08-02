import { Home, User, PenSquare, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import UserNav from '../auth/UserNav';
import { NexoLogo } from '../shared/NexoLogo';
import { CreatePostDialog } from '../posts/CreatePost';

export default async function Sidebar() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from('profiles').select('username').eq('id', user.id).single()
    : { data: null };

  const navItems = [
    { href: '/', icon: Home, label: 'Home', auth: false },
    {
      href: `/u/${profile?.username}`,
      icon: User,
      label: 'Profile',
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
                <span className="hidden lg:inline">Post</span>
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
              <span className="hidden lg:inline">Login</span>
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}
