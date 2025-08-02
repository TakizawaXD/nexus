import PostCard from '@/components/posts/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PostWithAuthor } from '@/lib/types';
import { notFound } from 'next/navigation';
import { User } from 'lucide-react';
import FollowButton from '@/components/users/FollowButton';
import { Separator } from '@/components/ui/separator';
import { MOCK_USER, MOCK_PROFILES, MOCK_POSTS } from '@/lib/mock-data';

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
  const authUser = MOCK_USER;
  
  const profile = MOCK_PROFILES.find(p => p.username === params.username);

  if (!profile) {
    notFound();
  }
  
  const isFollowing = false; // Mock data

  const userPosts: PostWithAuthor[] = MOCK_POSTS.filter(p => p.author.id === profile.id)

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
