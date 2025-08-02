'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '../supabase/server';
import { z } from 'zod';
import { Database } from '../database.types';

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres.' })
    .max(20, { message: 'El nombre de usuario no puede tener más de 20 caracteres.' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'El nombre de usuario solo puede contener letras, números y guiones bajos.' }),
  fullName: z
    .string()
    .max(50, { message: 'El nombre completo no puede tener más de 50 caracteres.' })
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(160, { message: 'La biografía no puede tener más de 160 caracteres.' })
    .optional()
    .nullable(),
});

export async function getProfileWithPosts(username: string) {
    const supabase = createServerClient();
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, followers_count:followers(count), following_count:following(count)')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        return { profile: null, posts: [], error: 'Perfil no encontrado' };
    }

    const { data: posts, error: postsError } = await supabase
        .from('posts_with_author')
        .select('*')
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false });

    return {
        profile,
        posts,
        error: postsError?.message
    }
}

export async function toggleFollow(profileId: string, isFollowing: boolean) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  if (isFollowing) {
    // Unfollow
    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
    
    if (error) {
      return { success: false, error: error.message };
    }

  } else {
    // Follow
    const { error } = await supabase
        .from('followers')
        .insert({
            follower_id: user.id,
            following_id: profileId,
        })
    if (error) {
        return { success: false, error: error.message };
    }
  }

  revalidatePath(`/u/${profileId}`);
  revalidatePath('/');
  
  return { success: true };
}

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'No autenticado.', errors: null };
    }

    const validatedFields = profileFormSchema.safeParse({
        username: formData.get('username'),
        fullName: formData.get('fullName'),
        bio: formData.get('bio'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Campos inválidos.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { username, fullName, bio } = validatedFields.data;

    // Check if username is already taken by another user
    const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .not('id', 'eq', user.id)
        .single();
    
    if (existingProfile) {
        return {
            success: false,
            message: 'El nombre de usuario ya está en uso.',
            errors: { username: ['Este nombre de usuario ya está en uso.'] }
        }
    }
    
    const { error } = await supabase
        .from('profiles')
        .update({
            username,
            full_name: fullName,
            bio,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        return { success: false, message: error.message, errors: null };
    }

    // Handle avatar upload
    const avatarFile = formData.get('avatar') as File;
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);
            
        if (uploadError) {
             return { success: false, message: `Error al subir el avatar: ${uploadError.message}`, errors: null };
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

        const { error: urlUpdateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);
        
        if (urlUpdateError) {
            return { success: false, message: `Error al actualizar la URL del avatar: ${urlUpdateError.message}`, errors: null };
        }
    }

    revalidatePath(`/u/${username}`);
    revalidatePath('/settings/profile');

    return { success: true, message: '¡Perfil actualizado con éxito!', errors: null };
}
