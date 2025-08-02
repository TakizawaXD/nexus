'use client';

import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import type { PostWithAuthor } from '@/lib/types';
import { MOCK_USER, MOCK_POSTS } from '@/lib/mock-data';
import { useState } from 'react';

export default function Home() {
  const user = MOCK_USER;
  const [posts, setPosts] = useState<PostWithAuthor[]>(MOCK_POSTS);

  const handlePostCreated = (newPost: PostWithAuthor) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <div className="w-full">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
        <h1 className="text-xl font-bold">Inicio</h1>
      </header>
      
      {user && <CreatePost user={user} onPostCreated={handlePostCreated} />}

      <Separator />

      <Feed serverPosts={posts} user={user}/>
    </div>
  );
}
