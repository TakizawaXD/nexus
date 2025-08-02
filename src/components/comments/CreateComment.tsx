'use client';

import { addComment } from '@/lib/actions/post.actions';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import type { MockUser } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useRef, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function CreateComment({ user, postId }: { user: MockUser; postId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleAction = async (formData: FormData) => {
    const content = formData.get('content') as string;
    if (!content.trim()) return;

    startTransition(async () => {
        const result = await addComment(postId, formData);
        if (result.success) {
            formRef.current?.reset();
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error || 'Could not post reply.'
            })
        }
    });
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const avatarUrl = user?.avatar_url;
  const username = user?.username ?? 'U';
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
          placeholder="Post your reply"
          className="w-full resize-none border-none bg-transparent p-0 text-lg focus-visible:ring-0"
          rows={1}
          required
        />
        <div className="mt-2 flex items-center justify-end">
          <Button type="submit" disabled={isPending} size="sm">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reply
          </Button>
        </div>
      </div>
    </form>
  );
}
