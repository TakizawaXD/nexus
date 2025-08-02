import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import * as postActions from '@/lib/actions/post.actions';
import type { PostWithAuthor } from '@/lib/types';
import { createServerClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null };

  const { posts, error } = await postActions.getPosts();

  if (error) {
    return <div className="p-8 text-center text-destructive">{error}</div>
  }

  return (
    <div className="w-full">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
        <h1 className="text-xl font-bold">Inicio</h1>
      </header>
      
      {user && profile && <CreatePost user={user} profile={profile} />}

      <Separator />

      <Feed serverPosts={posts as PostWithAuthor[]} user={user}/>
    </div>
  );
}
