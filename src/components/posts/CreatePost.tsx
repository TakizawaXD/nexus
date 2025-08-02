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
import type { MockUser, PostWithAuthor } from '@/lib/types';
import { Loader2, Send } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { MOCK_USER } from '@/lib/mock-data';

type CreatePostFormProps = {
    user: MockUser;
    onPostSuccess: (newPost: PostWithAuthor) => void;
    onClose: () => void;
}

function CreatePostForm({ user, onPostSuccess, onClose }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPost: PostWithAuthor = {
        id: `p${Date.now()}`,
        content,
        image_url: null,
        created_at: new Date().toISOString(),
        author: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
        },
        user_has_liked_post: false,
        likes_count: 0,
        comments_count: 0
    };

    console.log('Nueva Publicación:', newPost);

    onPostSuccess(newPost);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsSubmitting(false);
    onClose();
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const avatarUrl = user?.avatar_url;
  const username = user?.username ?? 'U';
  const fallback = username.charAt(0).toUpperCase();

  return (
    <div className="flex w-full flex-col">
        <div className="flex gap-4 p-4">
            <Avatar>
                <AvatarImage src={avatarUrl ?? undefined} alt={username} />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            placeholder="¿Qué está pasando?"
            maxLength={280}
            className="w-full min-h-[80px] resize-none border-none bg-transparent p-0 text-lg focus-visible:ring-0"
            rows={2}
            />
        </div>
        <DialogFooter className="p-4 border-t">
            <span className="text-sm text-muted-foreground mr-auto">{280 - content.length} caracteres restantes</span>
            <Button onClick={onClose} variant="ghost">Cancelar</Button>
            <Button onClick={handlePost} disabled={isSubmitting || content.trim().length === 0}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Publicar
            </Button>
        </DialogFooter>
    </div>
  );
}

export function CreatePostDialog({ user, children, onPostCreated }: { user: MockUser, children: ReactNode, onPostCreated: (newPost: PostWithAuthor) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Crear Publicación</DialogTitle>
                </DialogHeader>
                <CreatePostForm user={user} onPostSuccess={onPostCreated} onClose={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

// This is the inline version for the main feed
export default function CreatePost({ user, onPostCreated }: { user: MockUser, onPostCreated: (newPost: PostWithAuthor) => void }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPost: PostWithAuthor = {
        id: `p${Date.now()}`,
        content,
        image_url: null,
        created_at: new Date().toISOString(),
        author: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
        },
        user_has_liked_post: false,
        likes_count: 0,
        comments_count: 0
    };

    console.log('Nueva Publicación:', newPost);
    onPostCreated(newPost);
    setContent('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    setIsSubmitting(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const avatarUrl = user?.avatar_url;
  const username = user?.username ?? 'U';
  const fallback = username.charAt(0).toUpperCase();

  return (
    <div className="flex gap-4 border-b border-border p-4">
      <Avatar>
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          placeholder="¿Qué está pasando?"
          maxLength={280}
          className="w-full resize-none border-none bg-transparent p-0 text-lg focus-visible:ring-0"
          rows={1}
        />
        <div className="mt-2 flex items-center justify-end">
          <span className="mr-4 text-sm text-muted-foreground">{280 - content.length}</span>
          <Button onClick={handlePost} disabled={isSubmitting || content.trim().length === 0} size="sm">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
}
