'use server';

import { revalidatePath } from "next/cache";

async function createPost(formData: FormData) {
    // MOCK IMPLEMENTATION
    const content = formData.get('content') as string;
    if (!content || content.trim().length === 0) {
        return { error: 'El contenido no puede estar vacío.' };
    }
     if (content.length > 280) {
        return { error: 'La publicación no puede tener más de 280 caracteres.' };
    }
    console.log("Creating post with content:", content);
    revalidatePath('/');
    return {};
}

async function getPosts() {
    // MOCK IMPLEMENTATION
    return { posts: [], error: null };
}

async function getPostById(id: string) {
    // MOCK IMPLEMENTATION
    console.log(`Getting post by id ${id}`);
    return { post: null, error: 'Función no implementada en modo de demostración.' };
}

async function getCommentsByPostId(postId: string) {
    // MOCK IMPLEMENTATION
    console.log(`Getting comments for post ${postId}`);
    return { comments: [], error: null };
}

async function addComment(postId: string, formData: FormData) {
    // MOCK IMPLEMENTATION
    const content = formData.get('content') as string;
    if (!content.trim()) {
        return { error: 'El comentario no puede estar vacío.' };
    }
    console.log(`Adding comment to post ${postId}:`, content);
    revalidatePath(`/post/${postId}`);
    return {};
}

async function deletePost(postId: string) {
    // MOCK IMPLEMENTATION
    console.log(`Deleting post ${postId}`);
    revalidatePath('/');
    revalidatePath('/post/[id]', 'page');
    return { success: true };
}


async function toggleLike(postId: string, hasLiked: boolean) {
    // MOCK IMPLEMENTATION
    console.log(`Toggling like for post ${postId}. Has liked: ${hasLiked}`);
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
