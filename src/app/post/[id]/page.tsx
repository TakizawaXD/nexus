import CommentCard from "@/components/comments/CommentCard";
import CreateComment from "@/components/comments/CreateComment";
import PostCard from "@/components/posts/PostCard";
import { Separator } from "@/components/ui/separator";
import type { CommentWithAuthor, PostWithAuthor } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MOCK_USER, MOCK_POSTS, MOCK_COMMENTS } from '@/lib/mock-data';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }) {
    const post = MOCK_POSTS.find(p => p.id === params.id);

    if (!post || !post.author) {
        return { title: 'Post not found' };
    }
    
    return {
        title: `Post by @${post.author.username}: "${post.content.substring(0, 50)}..."`,
    };
}


export default async function PostPage({ params }: { params: { id: string } }) {
    const user = MOCK_USER;
    const postData = MOCK_POSTS.find(p => p.id === params.id);
    
    if (!postData) {
        notFound();
    }

    const post: PostWithAuthor = postData;

    const commentsData = MOCK_COMMENTS.filter(c => c.post_id === params.id);

    const comments: CommentWithAuthor[] = commentsData;

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
