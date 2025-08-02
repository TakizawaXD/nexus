'use client';

import type { PostWithAuthor } from '@/lib/types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState, useRef } from 'react';
import PostCard from './PostCard';
import { Skeleton } from '../ui/skeleton';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Feed({
  serverPosts,
  user
}: {
  serverPosts: PostWithAuthor[];
  user: User | null;
}) {
  const [posts, setPosts] = useState(serverPosts);
  const router = useRouter();
  const supabase = createBrowserClient();
  const isMounted = useRef(false);

  useEffect(() => {
    if(!isMounted.current) {
        isMounted.current = true;
        setPosts(serverPosts);
    }
  }, [serverPosts]);

  useEffect(() => {
    const handleChanges = (payload: RealtimePostgresChangesPayload<PostWithAuthor>) => {
      console.log('Change received!', payload);
      
      if (payload.eventType === 'INSERT') {
        // Fetch the new post with author data
        const fetchNewPost = async () => {
            const { data: newPost, error } = await supabase
                .from('posts_with_author')
                .select('*')
                .eq('id', payload.new.id)
                .single();
            if (newPost) {
                setPosts(currentPosts => [newPost, ...currentPosts]);
            }
        }
        fetchNewPost();
      } else if (payload.eventType === 'UPDATE') {
          // No need to fetch, we have the data
          setPosts(currentPosts => currentPosts.map(post => 
              post.id === payload.new.id ? { ...post, ...payload.new } : post
          ));
      } else if (payload.eventType === 'DELETE') {
          setPosts(currentPosts => currentPosts.filter(post => post.id !== payload.old.id));
      }
    };

    const channel = supabase
      .channel('realtime posts')
      .on<PostWithAuthor>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        handleChanges
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);


  if (!posts) {
    return (
        <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 animate-pulse">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            ))}
        </div>
    )
  }

  return (
    <div className="flex flex-col">
      {posts.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>Aún no hay publicaciones. ¡Sé el primero!</p>
        </div>
      ) : (
        posts.map((post, idx) => (
            <div key={post.id} className="animate-in fade-in-0" style={{ animationDelay: `${idx * 150}ms`, transition: 'opacity 0.5s'}}>
                <PostCard post={post} user={user} />
            </div>
        ))
      )}
    </div>
  );
}
