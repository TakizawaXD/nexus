'use client';

import CommentCard from "@/components/comments/CommentCard";
import CreateComment from "@/components/comments/CreateComment";
import PostCard from "@/components/posts/PostCard";
import { Separator } from "@/components/ui/separator";
import type { CommentWithAuthor, PostWithAuthor } from "@/lib/types";
import { notFound, useParams } from "next/navigation";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MOCK_USER, MOCK_POSTS, MOCK_COMMENTS } from '@/lib/mock-data';
import { useEffect, useState } from "react";

export default function PostPage() {
    const params = useParams<{ id: string }>();
    const [post, setPost] = useState<PostWithAuthor | null>(null);
    const [comments, setComments] = useState<CommentWithAuthor[]>([]);
    const user = MOCK_USER;

    useEffect(() => {
        const postData = MOCK_POSTS.find(p => p.id === params.id);
        if (postData) {
            setPost(postData);
            const commentsData = MOCK_COMMENTS.filter(c => c.post_id === params.id);
            setComments(commentsData);
        } else {
            notFound();
        }
    }, [params.id]);

    const handleCommentCreated = (newComment: CommentWithAuthor) => {
        setComments(prevComments => [newComment, ...prevComments]);
        if (post) {
            setPost(currentPost => currentPost ? {...currentPost, comments_count: currentPost.comments_count + 1} : null);
        }
    };
    
    if (!post) {
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
                <div className="p-8 text-center">Cargando publicación...</div>
            </div>
        );
    }

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

            <PostCard post={post} user={user} />
                        
            {user && (
                <div className="border-b">
                    <CreateComment user={user} postId={post.id} onCommentCreated={handleCommentCreated} />
                </div>
            )}

            <div className="flex flex-col">
                {comments.length > 0 ? (
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
