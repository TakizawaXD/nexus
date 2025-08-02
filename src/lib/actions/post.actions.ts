'use server';

import { revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/server";
import type { PostWithAuthor } from "../types";

async function createPost(formData: FormData) {
    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'No autenticado. Debes iniciar sesión para publicar.' };
    }

    const content = formData.get('content') as string;

    if (!content || content.trim().length === 0) {
        return { error: 'El contenido no puede estar vacío.' };
    }
     if (content.length > 280) {
        return { error: 'La publicación no puede tener más de 280 caracteres.' };
    }

    const { error } = await supabase.from('posts').insert({
        content,
        author_id: user.id
    });

    if (error) {
        return { error: 'No se pudo crear la publicación. Inténtalo de nuevo.' };
    }

    revalidatePath('/');
    return {};
}

async function getPosts() {
    const supabase = createServerClient();
     // Required to await this to satisfy Next.js SSR rules
     // see: https://github.com/supabase/auth-helpers/issues/527
    await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('posts_with_author')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], error: 'No se pudieron cargar las publicaciones.' };
    }
    
    return { posts: data, error: null };
}

async function getPostById(id: string) {
    const supabase = createServerClient();

    const { data, error } = await supabase
        .from('posts_with_author')
        .select('*')
        .eq('id', id)
        .single();
    
    return { post: data, error: error?.message };
}

async function getCommentsByPostId(postId: string) {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
        .from('comments_with_author')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
        
    return { comments: data, error: error?.message };
}


async function addComment(postId: string, formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Debes iniciar sesión para comentar.' };
    }

    const content = formData.get('content') as string;
    if (!content.trim()) {
        return { error: 'El comentario no puede estar vacío.' };
    }
    
    const { error } = await supabase.from('comments').insert({
        content,
        post_id: postId,
        author_id: user.id,
    });

    if (error) {
        return { error: 'No se pudo agregar el comentario.' };
    }

    revalidatePath(`/post/${postId}`);
    return {};
}

async function deletePost(postId: string) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { success: false, error: 'No autenticado.' };
    }
    
    // First, check if the post belongs to the user
    const { data: post } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();
        
    if (post?.author_id !== user.id) {
        return { success: false, error: 'No autorizado para eliminar esta publicación.' };
    }

    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
        return { success: false, error: 'No se pudo eliminar la publicación.' };
    }
    
    revalidatePath('/');
    return { success: true };
}


async function toggleLike(postId: string, hasLiked: boolean) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Debes iniciar sesión para dar "me gusta".' };
    }
    
    if (hasLiked) {
        // Unlike
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        
        if (error) {
            return { error: 'No se pudo quitar el "me gusta".' };
        }
    } else {
        // Like
        const { error } = await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: user.id });
        
        if (error) {
             return { error: 'No se pudo dar "me gusta".' };
        }
    }
    
    revalidatePath(`/`);
    revalidatePath(`/post/${postId}`);
    return {};
}

export {
    createPost,
    getPosts,
    getPostById,
    getCommentsByPostId,
    addComment,
    deletePost,
    toggleLike
}
