'use server';

import { revalidatePath } from 'next/cache';

export async function addComment(postId: string, formData: FormData) {
    const content = formData.get('content') as string;
    if (!content.trim()) {
        return { success: false, error: 'Comment cannot be empty.' };
    }
    
    // Here you would typically call your backend API to save the comment.
    console.log('Adding comment:', { postId, content: content.trim() });
    
    // We'll simulate a success response.
    revalidatePath(`/post/${postId}`);
    revalidatePath('/'); // To update comment count on feed
    return { success: true };
}

export async function deletePost(postId: string) {
    // Here you would typically call your backend API to delete the post.
    console.log('Deleting post:', postId);

    // We'll simulate a success response.
    revalidatePath('/');
    return { success: true };
}
