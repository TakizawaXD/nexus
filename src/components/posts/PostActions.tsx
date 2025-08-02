'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import * as postActions from "@/lib/actions/post.actions";
import type { PostWithAuthor } from "@/lib/types";
import { MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "../ui/button";

export default function PostActions({ post }: { post: PostWithAuthor }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await postActions.deletePost(post.id);
      if (result.success) {
        toast({
          title: "Publicación eliminada",
        });
        // The realtime subscription will remove the post from the UI
        if(window.location.pathname.includes('/post/')) {
            router.push('/');
        }
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "No se pudo eliminar la publicación.",
        });
      }
    });
  };

  return (
    <AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Más opciones</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente tu publicación
                    y eliminará sus datos de nuestros servidores.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                    {isDeletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Eliminar
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
