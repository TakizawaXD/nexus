import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import * as postActions from '@/lib/actions/post.actions';
import type { PostWithAuthor } from '@/lib/types';
import { MOCK_POSTS, MOCK_USER } from '@/lib/mock-data';
import { Profile } from '@/lib/types';

export default async function Home() {
  const user = MOCK_USER;
  const profile = MOCK_USER as Profile;
  const posts = MOCK_POSTS as PostWithAuthor[];

  return (
    <div className="w-full">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
        <h1 className="text-xl font-bold">Inicio</h1>
      </header>
      
      {user && profile && <CreatePost user={user} profile={profile} />}

      <Separator />

      <Feed serverPosts={posts} user={user}/>
    </div>
  );
}
