import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import * as postActions from '@/lib/actions/post.actions';
import { getAuthProfile } from '@/lib/actions/user.actions';
import { createServerClient } from '@/lib/supabase/server';
import Sidebar from '@/components/layout/Sidebar';


export default async function Home() {
  const supabase = createServerClient();
  const { data: { user }} = await supabase.auth.getUser();
  const profile = await getAuthProfile();
  const { posts, error } = await postActions.getPosts();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex flex-1 justify-center">
        <div className="w-full max-w-2xl flex-col border-x border-border">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
            <h1 className="text-xl font-bold">Inicio</h1>
          </header>
          
          {user && profile && <CreatePost user={user} profile={profile} />}

          <Separator />

          <Feed serverPosts={posts ?? []} user={user} />
        </div>
        <div className="hidden lg:block w-80 p-4">
            {/* Right sidebar content can go here */}
        </div>
      </main>
    </div>
  );
}
