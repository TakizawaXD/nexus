import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import { MOCK_POSTS, MOCK_USER } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function Home() {
  const profile = MOCK_USER;

  const forYouPosts = MOCK_POSTS;
  const followingPosts = MOCK_POSTS.filter(p => p.author.id !== '3');

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
