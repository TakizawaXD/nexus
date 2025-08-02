'use client';

import type { PostWithAuthor, MockUser } from '@/lib/types';
import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { Skeleton } from '../ui/skeleton';

export default function Feed({
  serverPosts,
  user
}: {
  serverPosts: PostWithAuthor[];
  user: MockUser | null;
}) {
  const [posts, setPosts] = useState(serverPosts);

  useEffect(() => {
    setPosts(serverPosts);
  }, [serverPosts]);

  // Real-time functionality would be connected here via WebSockets or polling.
  // For now, it just loads the server-rendered posts.

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
