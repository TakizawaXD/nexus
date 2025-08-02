import CommentCard from "@/components/comments/CommentCard";
import CreateComment from "@/components/comments/CreateComment";
import PostCard from "@/components/posts/PostCard";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import type { CommentWithAuthor, PostWithAuthor } from "@/lib/types";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: post } = await supabase.from('posts').select('content, author:profiles(username)').eq('id', params.id).single();

    if (!post || !post.author) {
        return { title: 'Post not found' };
    }
    
    return {
        title: `Post by @${post.author.username}: "${post.content.substring(0, 50)}..."`,
    };
}


export default async function PostPage({ params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    const { data: postData } = await supabase
        .from('posts')
        .select('*, author:profiles(*), likes(user_id)')
        .eq('id', params.id)
        .single();
    
    if (!postData) {
        notFound();
    }

    const post: PostWithAuthor = {
        ...postData,
        author: Array.isArray(postData.author) ? postData.author[0] : postData.author,
        user_has_liked_post: !!user && postData.likes.some(
            (like: any) => like.user_id === user?.id
        ),
    };

    const { data: commentsData } = await supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .eq('post_id', params.id)
        .order('created_at', { ascending: true });

    const comments: CommentWithAuthor[] = commentsData?.map(comment => ({
        ...comment,
        author: Array.isArray(comment.author) ? comment.author[0] : comment.author,
    })) ?? [];

    return (
        <div className="w-full">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
                <Link href="/" passHref>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Post</h1>
            </header>

            <PostCard post={post} user={user} />
                        
            {user && (
                <div className="border-b">
                    <CreateComment user={user} postId={post.id} />
                </div>
            )}

            <div className="flex flex-col">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <CommentCard key={comment.id} comment={comment} />
                    ))
                ) : (
                    !user && (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>No comments yet. Sign in to leave a reply!</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
