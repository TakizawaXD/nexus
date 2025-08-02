import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import { MOCK_POSTS, MOCK_USER } from '@/lib/mock-data';
import type { PostWithAuthor } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default async function Home() {
  const profile = MOCK_USER;
  const posts: PostWithAuthor[] = MOCK_POSTS;

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-2 backdrop-blur-md">
        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foryou">Para ti</TabsTrigger>
            <TabsTrigger value="following">Siguiendo</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <Tabs defaultValue="foryou">
        <TabsContent value="foryou">
          <CreatePost profile={profile} />
          <Separator />
          <Feed serverPosts={posts} user={MOCK_USER} />
        </TabsContent>
        <TabsContent value="following">
           <div className="p-8 text-center text-muted-foreground">
              <p>Las publicaciones de las personas que sigues aparecerán aquí.</p>
            </div>
        </TabsContent>
      </Tabs>
      
    </>
  );
}
