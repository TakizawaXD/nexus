'use server';

import { revalidatePath } from 'next/cache';

export async function addComment(postId: string, formData: FormData) {
    const content = formData.get('content') as string;
    if (!content.trim()) {
        return { success: false, error: 'El comentario no puede estar vacío.' };
    }
    
    // Aquí normalmente llamarías a tu API de backend para guardar el comentario.
    console.log('Agregando comentario:', { postId, content: content.trim() });
    
    // Simularemos una respuesta exitosa.
    revalidatePath(`/post/${postId}`);
    revalidatePath('/'); // Para actualizar el recuento de comentarios en el feed
    return { success: true };
}

export async function deletePost(postId: string) {
    // Aquí normalmente llamarías a tu API de backend para eliminar la publicación.
    console.log('Eliminando publicación:', postId);

    // Simularemos una respuesta exitosa.
    revalidatePath('/');
    return { success: true };
}
