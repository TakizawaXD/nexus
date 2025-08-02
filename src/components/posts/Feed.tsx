'use client';

import type { PostWithAuthor, User } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
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

  useEffect(() => {
    setPosts(serverPosts);
  }, [serverPosts]);

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
