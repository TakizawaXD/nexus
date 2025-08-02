import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MOCK_PROFILES } from '@/lib/mock-data';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const trends = [
  { category: 'Tendencia en tu país', topic: '#ReactJS', posts: '15.2k posts' },
  { category: 'Programación', topic: '#TypeScript', posts: '8,453 posts' },
  { category: 'Tecnología', topic: 'Next.js 15', posts: '21.8k posts' },
  { category: 'Gaming', topic: 'The Witcher 4', posts: '3,112 posts' },
];

export default function RightSidebar() {
  const usersToFollow = MOCK_PROFILES.slice(1, 4);

  return (
    <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-6 p-4 lg:flex">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Buscar en Nexo" className="pl-10 rounded-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencias para ti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.topic}>
              <p className="text-sm text-muted-foreground">{trend.category}</p>
              <p className="font-bold">{trend.topic}</p>
              <p className="text-sm text-muted-foreground">{trend.posts}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A quién seguir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {usersToFollow.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback>{profile.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/u/${profile.username}`} className="font-bold hover:underline">
                    {profile.full_name ?? profile.username}
                  </Link>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="rounded-full">Seguir</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
