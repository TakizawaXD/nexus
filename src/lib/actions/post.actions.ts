'use server';

// Este archivo ya no es necesario para la funcionalidad principal con datos simulados,
// pero se mantiene para la estructura del proyecto.
// Las acciones reales ahora se manejan en el estado del cliente.

export async function addComment(postId: string, formData: FormData) {
    const content = formData.get('content') as string;
    if (!content.trim()) {
        return { success: false, error: 'El comentario no puede estar vacío.' };
    }
    console.log('Agregando comentario (simulado):', { postId, content: content.trim() });
    return { success: true };
}

export async function deletePost(postId: string) {
    console.log('Eliminando publicación (simulado):', postId);
    return { success: true };
}
