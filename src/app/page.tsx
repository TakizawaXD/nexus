import CreatePost from '@/components/posts/CreatePost';
import Feed from '@/components/posts/Feed';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPosts } from '@/lib/actions/post.actions';
import { getAuthProfile } from '@/lib/actions/user.actions';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';

export default async function Home() {
  const profile = await getAuthProfile();
  
  const forYouPostsResult = await getPosts('foryou');
  const followingPostsResult = await getPosts('following');

  return (
    <>
      <Sidebar />
      <main className="flex flex-1">
        <div className="flex-1 max-w-2xl border-x border-border">
          <Tabs defaultValue="foryou">
            <header className="sticky top-0 z-10 border-b bg-background/80 px-4 py-2 backdrop-blur-md">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="foryou">Para ti</TabsTrigger>
                <TabsTrigger value="following" disabled={!profile}>Siguiendo</TabsTrigger>
              </TabsList>
            </header>
            
            {profile && (
              <>
                <CreatePost profile={profile} />
                <Separator />
              </>
            )}


            <TabsContent value="foryou">
              <Feed serverPosts={forYouPostsResult.posts} user={profile} />
            </TabsContent>
            <TabsContent value="following">
              {profile && followingPostsResult.posts.length > 0 ? (
                <Feed serverPosts={followingPostsResult.posts} user={profile} />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {profile ? (
                    <p>Las publicaciones de las personas que sigues aparecerán aquí.</p>
                  ) : (
                    <p>Inicia sesión para ver las publicaciones de las personas que sigues.</p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        <RightSidebar />
      </main>
    </>
  );
}
