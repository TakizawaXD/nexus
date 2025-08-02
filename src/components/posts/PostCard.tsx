'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { PostWithAuthor, MockUser } from '@/lib/types';
import { formatDistanceToNowStrict } from 'date-fns';
import { MessageCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import PostActions from './PostActions';

export default function PostCard({ post, user }: { post: PostWithAuthor, user: MockUser | null }) {
    const [optimisticLikes, setOptimisticLikes] = useState(post.likes_count);
    const [optimisticHasLiked, setOptimisticHasLiked] = useState(post.user_has_liked_post);
    const [isLikePending, startLikeTransition] = useTransition();
    const router = useRouter();

    const handleLike = () => {
        if (!user) {
            return router.push('/login');
        }

        startLikeTransition(async () => {
            if (optimisticHasLiked) {
                setOptimisticHasLiked(false);
                setOptimisticLikes((l) => l - 1);
                // API call to unlike
            } else {
                setOptimisticHasLiked(true);
                setOptimisticLikes((l) => l + 1);
                // API call to like
            }
        });
    }

    const postDate = new Date(post.created_at);

  return (
    <article 
        className="flex gap-4 border-b p-4 transition-colors hover:bg-muted/50"
        aria-labelledby={`post-author-${post.id}`}
    >
        <Link href={`/u/${post.author.username}`} className="flex-shrink-0">
            <Avatar>
            <AvatarImage src={post.author.avatar_url ?? undefined} alt={post.author.username} />
            <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="flex w-full flex-col">
            <div className="flex flex-wrap items-center gap-x-2">
                <Link href={`/u/${post.author.username}`} className="font-bold hover:underline" id={`post-author-${post.id}`}>
                    {post.author.full_name ?? post.author.username}
                </Link>
                <span className="text-sm text-muted-foreground">@{post.author.username}</span>
                <span className="text-sm text-muted-foreground hidden sm:inline">·</span>
                <Link href={`/post/${post.id}`} className="text-sm text-muted-foreground hover:underline">
                    <time dateTime={postDate.toISOString()} title={postDate.toLocaleString()}>
                        {formatDistanceToNowStrict(postDate, {
                        addSuffix: true,
                        })}
                    </time>
                </Link>
                <div className="ml-auto">
                    {user?.id === post.author.id && <PostActions post={post} />}
                </div>
            </div>
            
            <Link href={`/post/${post.id}`} className="flex flex-col">
                <p className="mt-1 whitespace-pre-wrap text-base">{post.content}</p>
                {post.image_url && (
                    <div className="mt-2">
                        <img src={post.image_url} alt="Post image" className="rounded-lg border object-cover max-h-96" data-ai-hint="social media" />
                    </div>
                )}
            </Link>

            <div className="mt-4 flex items-center gap-4">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => router.push(`/post/${post.id}`)}>
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments_count}</span>
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLike} 
                    disabled={isLikePending}
                    className={cn("flex items-center gap-2", optimisticHasLiked ? "text-primary" : "text-muted-foreground hover:text-primary")}
                >
                    <Heart className={cn("h-5 w-5", optimisticHasLiked && "fill-current")} />
                    <span>{optimisticLikes}</span>
                </Button>
            </div>
        </div>
    </article>
  );
}
