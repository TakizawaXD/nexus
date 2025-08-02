import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import type { PostWithAuthor } from '@/lib/types';
import { MOCK_USER, MOCK_POSTS } from '@/lib/mock-data';

export const revalidate = 0;

export default async function Home() {
  const user = MOCK_USER;
  const serverPosts: PostWithAuthor[] = MOCK_POSTS;

  return (
    <div className="w-full">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
        <h1 className="text-xl font-bold">Home</h1>
      </header>
      
      {user && <CreatePost user={user} />}

      <Separator />

      <Feed serverPosts={serverPosts} user={user}/>
    </div>
  );
}
