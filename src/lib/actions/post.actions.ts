'use server';

import { revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/server";
import { PostWithAuthor } from "../types";

async function createPost(formData: FormData) {
    const supabase = createServerClient();
    const { data: { user }} = await supabase.auth.getUser();

    if (!user) {
        return { error: "Debes iniciar sesión para publicar." };
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
        console.error("Error creating post:", error);
        return { error: "No se pudo crear la publicación."}
    }

    revalidatePath('/');
    revalidatePath('/foryou');
    return {};
}

async function getPosts(type: 'foryou' | 'following' = 'foryou') {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('posts_with_details')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
    
    if (type === 'following' && user) {
        const { data: followingIds } = await supabase
            .from('followers')
            .select('followed_id')
            .eq('follower_id', user.id);

        const ids = followingIds?.map(f => f.followed_id) ?? [];
        query = query.in('author_id', ids);
    }

    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching posts:', error);
        return { posts: [], error: 'No se pudieron cargar las publicaciones.' };
    }

    return { posts: data as PostWithAuthor[], error: null };
}

async function getPostById(id: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching post ${id}:`, error);
        return { post: null, error: 'No se pudo encontrar la publicación.' };
    }

    return { post: data as PostWithAuthor, error: null };
}

async function getCommentsByPostId(postId: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('comments_with_author')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
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
        author_id: user.id,
        post_id: postId
    });

    if (error) {
        console.error('Error adding comment:', error);
        return { error: 'No se pudo añadir el comentario.' };
    }
    
    revalidatePath(`/post/${postId}`);
    return {};
}

async function deletePost(postId: string) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autorizado." };
    }

    // First, verify the user is the author of the post
    const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

    if (fetchError || !post) {
        return { error: "No se encontró la publicación." };
    }

    if (post.author_id !== user.id) {
        return { error: "No tienes permiso para eliminar esta publicación." };
    }
    
    // Proceed with deletion
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        return { error: "No se pudo eliminar la publicación." };
    }
    
    revalidatePath('/');
    revalidatePath(`/post/${postId}`);
    return { success: true };
}


async function toggleLike(postId: string, hasLiked: boolean) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: "No autorizado." };
    }

    if (hasLiked) {
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', postId);
        
        if (error) {
            console.error('Error unliking post:', error);
            return { error: "No se pudo quitar el 'me gusta'." };
        }
    } else {
        const { error } = await supabase
            .from('likes')
            .insert({ user_id: user.id, post_id: postId });

        if (error) {
            console.error('Error liking post:', error);
            return { error: "No se pudo dar 'me gusta'." };
        }
    }

    revalidatePath('/');
    revalidatePath(`/post/${postId}`);
    return { success: true };
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
