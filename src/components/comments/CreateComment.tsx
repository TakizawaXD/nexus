'use client';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import type { CommentWithAuthor, Profile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { addComment } from '@/lib/actions/post.actions';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type CreateCommentProps = {
    user: User;
    postId: string;
};

export default function CreateComment({ user, postId }: CreateCommentProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleAction = async (formData: FormData) => {
    startTransition(async () => {
        const result = await addComment(postId, formData);

        if(result.error) {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            });
        } else {
            formRef.current?.reset();
            if(textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            router.refresh();
        }
    });
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const avatarUrl = user.user_metadata?.avatar_url;
  const username = user.user_metadata?.user_name ?? 'U';
  const fallback = username.charAt(0).toUpperCase();

  return (
    <form action={handleAction} ref={formRef} className="flex gap-4 p-4">
      <Avatar>
        <AvatarImage src={avatarUrl ?? undefined} alt={username} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col">
        <Textarea
          ref={textareaRef}
          name="content"
          onInput={handleInput}
          placeholder="Publica tu respuesta"
          className="w-full resize-none border-none bg-transparent p-0 text-lg focus-visible:ring-0"
          rows={1}
          required
        />
        <div className="mt-2 flex items-center justify-end">
          <Button type="submit" disabled={isPending} size="sm">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Responder
          </Button>
        </div>
      </div>
    </form>
  );
}
