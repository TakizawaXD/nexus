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
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .rpc('get_posts_with_likes', { p_user_id: user?.id })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], error: 'No se pudieron cargar las publicaciones.' };
    }
    
    return { posts: data, error: null };
}

async function getPostById(id: string) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .rpc('get_post_details', { p_post_id: id, p_user_id: user?.id })
        .single();
    
    if (error) {
        console.error('Error fetching post:', error);
        return { post: null, error: 'No se pudo cargar la publicación.' };
    }

    return { post: data, error: null };
}

async function getCommentsByPostId(postId: string) {
    const supabase = createServerClient();
    
    const { data, error } = await supabase
        .from('comments_with_author')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error('Error fetching comments:', error);
        return { comments: [], error: 'No se pudieron cargar los comentarios.' };
    }
        
    return { comments: data, error: null };
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
        console.error('Error adding comment:', error);
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
    
    // RLS will enforce that only the author can delete their post.
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
        console.error('Error deleting post:', error);
        return { success: false, error: 'No se pudo eliminar la publicación.' };
    }
    
    revalidatePath('/');
    revalidatePath('/post/[id]', 'page');
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
            console.error('Error unliking post:', error);
            return { error: 'No se pudo quitar el "me gusta".' };
        }
    } else {
        // Like
        const { error } = await supabase
            .from('likes')
            .insert({ post_id: postId, user_id: user.id });
        
        if (error) {
             console.error('Error liking post:', error);
             return { error: 'No se pudo dar "me gusta".' };
        }
    }
    
    revalidatePath('/');
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
