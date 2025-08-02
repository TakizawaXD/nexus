import PostCard from '@/components/posts/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/server';
import type { PostWithAuthor } from '@/lib/types';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { User } from 'lucide-react';
import FollowButton from '@/components/users/FollowButton';
import { Separator } from '@/components/ui/separator';

export async function generateMetadata({ params }: { params: { username: string } }) {
    return {
        title: `${params.username}'s Profile`,
    };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, followers_count, following_count')
    .eq('username', params.username)
    .single();

  if (!profile) {
    notFound();
  }
  
  let isFollowing = false;
  if (authUser) {
    const { data: followingRelation } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('follower_id', authUser.id)
      .eq('following_id', profile.id)
      .maybeSingle();
    isFollowing = !!followingRelation;
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:profiles(*), likes(user_id)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  const userPosts: PostWithAuthor[] =
    posts?.map((post) => ({
      ...post,
      author: Array.isArray(post.author) ? post.author[0] : post.author,
      user_has_liked_post: !!authUser && post.likes.some(
        (like) => like.user_id === authUser?.id
      ),
    })) ?? [];

  return (
    <div>
        <div className="h-48 bg-muted/50" data-ai-hint="abstract background"></div>
        <div className="p-4">
            <div className='flex justify-between items-start'>
                <Avatar className="-mt-16 h-32 w-32 border-4 border-background">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>
                        <User className="h-16 w-16" />
                    </AvatarFallback>
                </Avatar>
                {authUser && authUser.id !== profile.id && (
                    <FollowButton profileId={profile.id} isFollowing={isFollowing} />
                )}
            </div>

            <div className="mt-4">
                <h1 className="text-2xl font-bold">{profile.full_name ?? profile.username}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
            </div>
            
            <p className="mt-4">A visionary creator shaping the future of digital art. Follow for a journey into imagination and innovation.</p>

            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                <p><span className="font-bold text-foreground">{profile.following_count}</span> Following</p>
                <p><span className="font-bold text-foreground">{profile.followers_count}</span> Followers</p>
            </div>
        </div>
        
        <Separator />
        
        <div className="border-t border-border">
            {userPosts.length > 0 ? (
                userPosts.map((post) => (
                    <PostCard key={post.id} post={post} user={authUser} />
                ))
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <p>This user hasn't posted anything yet.</p>
                </div>
            )}
        </div>
    </div>
  );
}
