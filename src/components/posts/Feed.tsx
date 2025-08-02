'use client';

import type { PostWithAuthor } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { Skeleton } from '../ui/skeleton';
import { createBrowserClient } from '@/lib/supabase/client';

export default function Feed({
  serverPosts,
  user
}: {
  serverPosts: PostWithAuthor[];
  user: User | null;
}) {
  const [posts, setPosts] = useState(serverPosts);
  const supabase = createBrowserClient();

  useEffect(() => {
    setPosts(serverPosts);
  }, [serverPosts]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
            // This is not efficient, but it's a simple way to get real-time updates.
            // A better approach would be to specifically handle insert, update, delete events.
            // For now, we just refetch everything.
            // This requires a page reload for the new data to show up currently.
            // We can improve this with client-side data fetching and state management.
            console.log('Change received!', payload)
            // router.refresh(); // This would trigger a full server-side refetch
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);


  if (!posts) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex space-x-4 animate-pulse">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
             <div className="flex space-x-4 animate-pulse">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col">
      {posts.map((post, idx) => (
        <div key={post.id} className="animate-in fade-in-0" style={{ animationDelay: `${idx * 100}ms`}}>
            <PostCard post={post} user={user} />
        </div>
      ))}
    </div>
  );
}
