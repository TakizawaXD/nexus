'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function addComment(postId: string, formData: FormData) {
    const content = formData.get('content') as string;
    if (!content.trim()) {
        return { success: false, error: 'Comment cannot be empty.' };
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim()
    });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath(`/post/${postId}`);
    revalidatePath('/'); // To update comment count on feed
    return { success: true };
}

export async function deletePost(postId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    // RLS will ensure the user can only delete their own post
    const { error } = await supabase.from('posts').delete().match({ id: postId, user_id: user.id });

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/');
    // Revalidating the user's profile page if we knew the username would be ideal.
    // For now, revalidating root and relying on client-side navigation to refresh is sufficient.
    return { success: true };
}
