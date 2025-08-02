'use client';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import type { MockUser, CommentWithAuthor } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';

type CreateCommentProps = {
    user: MockUser;
    postId: string;
    onCommentCreated: (newComment: CommentWithAuthor) => void;
};

export default function CreateComment({ user, postId, onCommentCreated }: CreateCommentProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    startTransition(async () => {
        await new Promise(res => setTimeout(res, 500)); // Simulate API delay
        
        const newComment: CommentWithAuthor = {
            id: `c${Date.now()}`,
            post_id: postId,
            content: content.trim(),
            created_at: new Date().toISOString(),
            author: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
            }
        };
        
        onCommentCreated(newComment);
        
        setContent('');
        formRef.current?.reset();
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    });
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const avatarUrl = user?.avatar_url;
  const username = user?.username ?? 'U';
  const fallback = username.charAt(0).toUpperCase();

  return (
    <form onSubmit={handleAction} ref={formRef} className="flex gap-4 p-4">
      <Avatar>
        <AvatarImage src={avatarUrl ?? undefined} alt={username} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col">
        <Textarea
          ref={textareaRef}
          name="content"
          value={content}
          onChange={handleInput}
          onInput={handleInput}
          placeholder="Publica tu respuesta"
          className="w-full resize-none border-none bg-transparent p-0 text-lg focus-visible:ring-0"
          rows={1}
          required
        />
        <div className="mt-2 flex items-center justify-end">
          <Button type="submit" disabled={isPending || !content.trim()} size="sm">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Responder
          </Button>
        </div>
      </div>
    </form>
  );
}
