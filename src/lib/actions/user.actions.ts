'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '../supabase/server';
import { z } from 'zod';
import type { Database } from '../database.types';

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
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, followers_count:followers!followers_following_id_fkey(count), following_count:following:followers!followers_follower_id_fkey(count)')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return { profile: null, posts: [], error: 'Perfil no encontrado', isFollowing: false };
    }

    const { data: posts, error: postsError } = await supabase
        .rpc('get_posts_with_likes', { p_user_id: user?.id })
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false });

    let isFollowing = false;
    if (user && user.id !== profile.id) {
        const { data: follow } = await supabase
            .from('followers')
            .select('follower_id')
            .eq('following_id', profile.id)
            .eq('follower_id', user.id)
            .maybeSingle();
        isFollowing = !!follow;
    }

    return {
        profile,
        posts: posts || [],
        isFollowing,
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
      console.error('Error unfollowing:', error);
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
        console.error('Error following:', error);
        return { success: false, error: error.message };
    }
  }

  // Revalidate the path of the user being followed/unfollowed
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', profileId).single();
  if (profile) {
    revalidatePath(`/u/${profile.username}`);
  }
  revalidatePath('/');
  
  return { success: true };
}

async function uploadImage(supabase: ReturnType<typeof createServerClient>, userId: string, file: File, bucket: 'avatars' | 'banners'): Promise<string | null> {
    if (!file || file.size === 0) {
        return null;
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true }); // Use upsert to allow overwriting
        
    if (uploadError) {
        console.error(`Error uploading ${bucket}:`, uploadError);
        throw new Error(`Error al subir la imagen: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
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

    try {
        // Check if username is already taken by another user
        const { data: existingProfile } = await supabase
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

        const avatarFile = formData.get('avatar') as File;
        const bannerFile = formData.get('banner') as File;

        const profileDataToUpdate: Partial<Database['public']['Tables']['profiles']['Update']> = {
            username,
            full_name: fullName,
            bio,
            updated_at: new Date().toISOString(),
        };

        const [avatarUrl, bannerUrl] = await Promise.all([
            uploadImage(supabase, user.id, avatarFile, 'avatars'),
            uploadImage(supabase, user.id, bannerFile, 'banners')
        ]);

        if (avatarUrl) {
            profileDataToUpdate.avatar_url = avatarUrl;
        }

        if (bannerUrl) {
            profileDataToUpdate.banner_url = bannerUrl;
        }
        
        const { error } = await supabase
            .from('profiles')
            .update(profileDataToUpdate)
            .eq('id', user.id);

        if (error) {
            throw new Error(error.message);
        }

        revalidatePath(`/u/${username}`);
        revalidatePath('/settings/profile');

        return { success: true, message: '¡Perfil actualizado con éxito!', errors: null };
    } catch (e: any) {
        return { success: false, message: e.message, errors: null };
    }
}
