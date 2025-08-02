import CommentCard from "@/components/comments/CommentCard";
import CreateComment from "@/components/comments/CreateComment";
import PostCard from "@/components/posts/PostCard";
import { Separator } from "@/components/ui/separator";
import type { PostWithAuthor } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MOCK_POSTS, MOCK_COMMENTS, MOCK_USER } from "@/lib/mock-data";

export default async function PostPage({ params }: { params: { id: string }}) {
    const user = MOCK_USER;
    const post = MOCK_POSTS.find(p => p.id === params.id) as PostWithAuthor | undefined;

    if (!post) {
        notFound();
    }
    
    const comments = MOCK_COMMENTS.filter(c => c.post_id === params.id);

    return (
        <div className="w-full">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
                <Link href="/" passHref>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">Publicación</h1>
            </header>

            <PostCard post={post as PostWithAuthor} user={user} />
                        
            {user && (
                <div className="border-b">
                    <CreateComment user={user} postId={post.id} />
                </div>
            )}

            <div className="flex flex-col">
                {comments && comments.length > 0 ? (
                    comments.map(comment => (
                        <CommentCard key={comment.id} comment={comment} />
                    ))
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>Aún no hay comentarios. ¡Sé el primero en responder!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
