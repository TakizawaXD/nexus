import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import { getAuthProfile } from '@/lib/actions/user.actions';
import { getPosts } from '@/lib/actions/post.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { redirect } from 'next/navigation';

export default async function Home() {
  const profile = await getAuthProfile();

  if (!profile) {
    redirect('/login');
  }

  const { posts: forYouPosts } = await getPosts('foryou');
  const { posts: followingPosts } = await getPosts('following');

  return (
    <Tabs defaultValue="foryou">
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-2 backdrop-blur-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="foryou">Para ti</TabsTrigger>
          <TabsTrigger value="following">Siguiendo</TabsTrigger>
        </TabsList>
      </header>
      
      <CreatePost profile={profile} />
      <Separator />

      <TabsContent value="foryou">
        <Feed serverPosts={forYouPosts} user={profile} />
      </TabsContent>
      <TabsContent value="following">
        {followingPosts.length > 0 ? (
          <Feed serverPosts={followingPosts} user={profile} />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>Las publicaciones de las personas que sigues aparecerán aquí.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
