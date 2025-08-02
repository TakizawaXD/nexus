import PostCard from '@/components/posts/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import * as userActions from '@/lib/actions/user.actions';
import type { PostWithAuthor } from '@/lib/types';
import { notFound } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';
import FollowButton from '@/components/users/FollowButton';
import { Separator } from '@/components/ui/separator';
import { createServerClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }: { params: { username: string } }) {
    const supabase = createServerClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('username', params.username)
        .single();

    return {
        title: profile?.full_name ? `${profile.full_name} (@${params.username})` : `@${params.username}`,
    };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  const { profile, posts, isFollowing, error } = await userActions.getProfileWithPosts(params.username);

  if (!profile || error) {
    notFound();
  }
  
  const userPosts: PostWithAuthor[] = posts ?? [];

  return (
    <div>
        <div className="h-48 bg-muted relative" data-ai-hint="abstract background">
            {profile.banner_url ? (
                <img 
                  src={profile.banner_url} 
                  alt="Profile banner" 
                  className="h-full w-full object-cover" 
                />
            ) : (
                <div className="h-full w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"></div>
            )}
        </div>
        <div className="p-4">
            <div className='flex justify-between items-start'>
                <Avatar className="-mt-16 h-32 w-32 border-4 border-background">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>
                        <UserIcon className="h-16 w-16" />
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
            
            {profile.bio && <p className="mt-4">{profile.bio}</p>}

            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                <p><span className="font-bold text-foreground">{profile.following_count ?? 0}</span> Siguiendo</p>
                <p><span className="font-bold text-foreground">{profile.followers_count ?? 0}</span> Seguidores</p>
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
                    <p>Este usuario aún no ha publicado nada.</p>
                </div>
            )}
        </div>
    </div>
  );
}
