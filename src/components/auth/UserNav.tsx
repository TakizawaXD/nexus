'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Profile, MockUser } from '@/lib/types';
import { LogOut, User as UserIcon, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserNav({
  user,
  profile,
}: {
  user: MockUser;
  profile: Pick<Profile, 'username'> | null;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    // In a real app, this would sign the user out.
    // Here, we just refresh the page to a logged-out state.
    router.push('/login');
    router.refresh();
  };

  const username = profile?.username ?? 'user';
  const email = user.email ?? 'no-email';
  const avatarUrl = user.avatar_url;
  const fullName = user.full_name;
  const fallback = username.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-auto w-full justify-start gap-3 rounded-full p-2 text-base"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-1 flex-col items-start text-left lg:flex">
            <span className="text-sm font-bold">{fullName ?? username}</span>
            <span className="text-xs text-muted-foreground">@{username}</span>
          </div>
          <ChevronsUpDown className="ml-auto hidden h-4 w-4 shrink-0 opacity-50 lg:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName ?? username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`/u/${username}`}>
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
