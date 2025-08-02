import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import Sidebar from '@/components/layout/Sidebar';
import { MOCK_POSTS, MOCK_USER } from '@/lib/mock-data';
import type { PostWithAuthor } from '@/lib/types';


export default async function Home() {
  const profile = MOCK_USER;
  const posts: PostWithAuthor[] = MOCK_POSTS;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex flex-1 justify-center">
        <div className="w-full max-w-2xl flex-col border-x border-border">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
            <h1 className="text-xl font-bold">Inicio</h1>
          </header>
          
          <CreatePost profile={profile} />

          <Separator />

          <Feed serverPosts={posts} user={MOCK_USER} />
        </div>
        <div className="hidden lg:block w-80 p-4">
            {/* Right sidebar content can go here */}
        </div>
      </main>
    </div>
  );
}
