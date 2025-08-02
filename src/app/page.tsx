import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import { MOCK_POSTS, MOCK_USER } from '@/lib/mock-data';
import type { PostWithAuthor } from '@/lib/types';


export default async function Home() {
  const profile = MOCK_USER;
  const posts: PostWithAuthor[] = MOCK_POSTS;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
        <h1 className="text-xl font-bold">Inicio</h1>
      </header>
      
      <CreatePost profile={profile} />

      <Separator />

      <Feed serverPosts={posts} user={MOCK_USER} />
    </>
  );
}
