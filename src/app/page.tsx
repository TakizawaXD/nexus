import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import type { PostWithAuthor } from '@/lib/types';

// This tells Next.js to revalidate this page on every request.
// It's useful for ensuring the feed is always fresh on initial load.
export const revalidate = 0;

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:profiles(*), likes(user_id)')
    .order('created_at', { ascending: false });

  const serverPosts: PostWithAuthor[] =
    posts?.map((post) => ({
      ...post,
      author: Array.isArray(post.author) ? post.author[0] : post.author,
      user_has_liked_post: !!user && post.likes.some(
        (like) => like.user_id === user?.id
      ),
    })) ?? [];

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
