import PostCard from '@/components/posts/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileWithPosts } from '@/lib/actions/user.actions';
import type { PostWithAuthor } from '@/lib/types';
import { notFound } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';
import FollowButton from '@/components/users/FollowButton';
import { Separator } from '@/components/ui/separator';
import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/lib/database.types';

export async function generateMetadata({ params }: { params: { username: string } }) {
    const supabase = createServerClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('username', params.username)
        .single();

    return {
        title: `Perfil de ${profile?.full_name ?? params.username}`,
    };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  const { profile, posts, error } = await getProfileWithPosts(params.username);

  if (!profile || error) {
    notFound();
  }
  
  let isFollowing = false;
  if (authUser) {
    const { data: follow } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', profile.id)
        .eq('follower_id', authUser.id)
        .maybeSingle();
    isFollowing = !!follow;
  }

  const userPosts: PostWithAuthor[] = posts ?? [];

  return (
    <div>
        <div className="h-48 bg-muted" data-ai-hint="abstract background">
            <img 
              src={profile.banner_url ?? 'https://placehold.co/600x200.png'} 
              alt="Profile banner" 
              className="h-full w-full object-cover" 
            />
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
