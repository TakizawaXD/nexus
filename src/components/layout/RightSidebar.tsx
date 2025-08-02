import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { getUsersToFollow } from '@/lib/actions/user.actions';
import { createServerClient } from '@/lib/supabase/server';
import SuggestedUser from '../users/SuggestedUser';

const trends = [
  { category: 'Tendencia en tu país', topic: '#ReactJS', posts: '15.2k posts' },
  { category: 'Programación', topic: '#TypeScript', posts: '8,453 posts' },
  { category: 'Tecnología', topic: 'Next.js 15', posts: '21.8k posts' },
  { category: 'Gaming', topic: 'The Witcher 4', posts: '3,112 posts' },
];

export default async function RightSidebar() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let usersToFollow = [];
  if (user) {
    usersToFollow = await getUsersToFollow();
  }

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

      {user && usersToFollow.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>A quién seguir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usersToFollow.map((profile) => (
              <SuggestedUser key={profile.id} profile={profile} />
            ))}
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
