'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { PostWithAuthor } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import PostActions from './PostActions';
import { useToast } from '@/hooks/use-toast';
import * as postActions from '@/lib/actions/post.actions';

export default function PostCard({ post, user }: { post: PostWithAuthor, user: User | null }) {
    const [optimisticLikes, setOptimisticLikes] = useState(post.likes_count);
    const [optimisticHasLiked, setOptimisticHasLiked] = useState(post.user_has_liked_post);
    const [isLikePending, startLikeTransition] = useTransition();
    const router = useRouter();
    const { toast } = useToast();

    const handleLike = () => {
        if (!user) {
            return router.push('/login');
        }
        if (isLikePending) return;

        startLikeTransition(async () => {
            const originalLikes = optimisticLikes;
            const originalHasLiked = optimisticHasLiked;
            
            setOptimisticHasLiked(prev => !prev);
            setOptimisticLikes(prev => (optimisticHasLiked ? prev - 1 : prev + 1));
            
            const result = await postActions.toggleLike(post.id, optimisticHasLiked);

            if (result.error) {
                // Revert optimistic update on error
                setOptimisticLikes(originalLikes);
                setOptimisticHasLiked(originalHasLiked);
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                });
            } else {
                router.refresh();
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
                            locale: es,
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
