'use client';

import { createClient } from '@/lib/supabase/client';
import type { PostWithAuthor } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { Skeleton } from '../ui/skeleton';

export default function Feed({
  serverPosts,
  user
}: {
  serverPosts: PostWithAuthor[];
  user: User | null;
}) {
  const [posts, setPosts] = useState(serverPosts);
  const supabase = createClient();

  useEffect(() => {
    setPosts(serverPosts);
  }, [serverPosts]);

  useEffect(() => {
    const channel = supabase
      .channel('realtime posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        async (payload) => {
            const { data: newPosts } = await supabase
                .from('posts')
                .select('*, author:profiles(*), likes(user_id)')
                .order('created_at', { ascending: false });

            const formattedPosts: PostWithAuthor[] =
                newPosts?.map((post) => ({
                ...post,
                author: Array.isArray(post.author) ? post.author[0] : post.author,
                user_has_liked_post: !!user && post.likes.some(
                    (like) => like.user_id === user?.id
                ),
            })) ?? [];
            setPosts(formattedPosts);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  if (!posts) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
             <div className="flex space-x-4">
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
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} user={user} />
      ))}
    </div>
  );
}
