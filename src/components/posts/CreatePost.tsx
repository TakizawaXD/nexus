'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { Profile } from '@/lib/types';
import { Loader2, X } from 'lucide-react';
import { useRef, useState, useTransition, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createPost as createPostAction } from '@/lib/actions/post.actions';

type CreatePostFormProps = {
    profile: Profile;
    onSuccess: () => void;
}

function CreatePostForm({ profile, onSuccess }: CreatePostFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
        const result = await createPostAction(formData);
        if (result.error) {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Éxito',
                description: 'Tu publicación ha sido creada.',
            });
            formRef.current?.reset();
            onSuccess();
        }
    });
  }

  const avatarUrl = profile?.avatar_url;
  const username = profile?.username ?? 'U';
  const fallback = username.charAt(0).toUpperCase();

  return (
    <form action={handleAction} ref={formRef}>
        <div className="flex gap-4 p-4">
            <Avatar>
                <AvatarImage src={avatarUrl ?? undefined} alt={username} />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <Textarea
            name="content"
            placeholder="¿Qué está pasando?"
            maxLength={280}
            className="w-full min-h-[80px] resize-none border-none bg-transparent p-0 text-lg focus-visible:ring-0"
            rows={2}
            />
        </div>
        <DialogFooter className="p-4 border-t">
            <Button type="submit" disabled={isPending} className="rounded-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publicar
            </Button>
        </DialogFooter>
    </form>
  );
}

export function CreatePostDialog({ profile, children }: { profile: Profile, children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        setOpen(false);
        router.refresh(); 
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 gap-0">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
                    <DialogTitle>Crear Publicación</DialogTitle>
                    <DialogClose asChild>
                      <Button variant="ghost" size="icon" className='h-6 w-6'>
                        <X className="h-4 w-4" />
                      </Button>
                    </DialogClose>
                </DialogHeader>
                <CreatePostForm profile={profile} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}

// This is the inline version for the main feed
export default function CreatePost({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleAction = async (formData: FormData) => {
    startTransition(async () => {
        const result = await createPostAction(formData);

        if (result.error) {
             toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Éxito',
                description: 'Publicación creada.',
            });
            formRef.current?.reset();
            if(textareaRef.current) textareaRef.current.style.height = 'auto';
            router.refresh();
        }
    });
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const avatarUrl = profile?.avatar_url;
  const username = profile?.username ?? 'U';
  const fallback = username.charAt(0).toUpperCase();

  return (
    <div className="flex gap-4 border-b border-border p-4">
      <Avatar>
        <AvatarImage src={avatarUrl ?? undefined} alt={username} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <form action={handleAction} ref={formRef} className="flex w-full flex-col">
        <Textarea
          ref={textareaRef}
          name="content"
          onInput={handleInput}
          placeholder="¿Qué novedades tienes?"
          maxLength={280}
          className="w-full resize-none border-none bg-transparent p-0 text-lg focus-visible:ring-0"
          rows={1}
        />
        <div className="mt-4 flex items-center justify-end">
          <Button type="submit" disabled={isPending} size="sm" className="rounded-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publicar
          </Button>
        </div>
      </form>
    </div>
  );
}
