'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Profile } from '../types';

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

export async function getAuthProfile(): Promise<Profile | null> {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (error) {
        console.error('Error fetching auth profile:', error);
        return null;
    }

    return profile;
}

export async function getProfileByUsername(username: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('profiles_with_follow_counts')
        .select('*')
        .eq('username', username)
        .single();
    
    if (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        return { profile: null, error: 'No se pudo encontrar el perfil.' };
    }
    
    return { profile: data, error: null };
}

export async function getProfileWithPosts(username: string) {
    const supabase = createServerClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    const { data: profile, error: profileError } = await supabase
        .from('profiles_with_follow_counts')
        .select('*')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        return { profile: null, posts: [], isFollowing: false, error: 'Perfil no encontrado' };
    }

    const { data: posts, error: postsError } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false });

    if (postsError) {
        return { profile: null, posts: [], isFollowing: false, error: 'Error al cargar las publicaciones' };
    }

    let isFollowing = false;
    if (authUser) {
        const { data: follow, error: followError } = await supabase
            .from('followers')
            .select('*')
            .eq('follower_id', authUser.id)
            .eq('followed_id', profile.id)
            .maybeSingle();

        if (follow) {
            isFollowing = true;
        }
    }

    return { profile, posts, isFollowing, error: null };
}

export async function toggleFollow(profileId: string, isFollowing: boolean) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Debes iniciar sesión para seguir a alguien.' };
    }

    if (user.id === profileId) {
        return { success: false, error: 'No puedes seguirte a ti mismo.' };
    }

    if (isFollowing) {
        // Unfollow
        const { error } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', user.id)
            .eq('followed_id', profileId);
        
        if (error) {
            console.error('Error unfollowing:', error);
            return { success: false, error: 'No se pudo dejar de seguir.' };
        }
    } else {
        // Follow
        const { error } = await supabase
            .from('followers')
            .insert({ follower_id: user.id, followed_id: profileId });
        
        if (error) {
            console.error('Error following:', error);
            return { success: false, error: 'No se pudo seguir.' };
        }
    }

    revalidatePath(`/u/${user.username}`);
    return { success: true };
}


export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if(!user) {
        return { success: false, message: 'No autenticado', errors: null };
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

    const { error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .not('id', 'eq', user.id)
        .single();
    
    if (usernameError && usernameError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking username uniqueness:', usernameError);
        return { success: false, message: 'Error al verificar el nombre de usuario.', errors: null };
    }

    if (!usernameError) {
         return {
            success: false,
            message: 'El nombre de usuario ya está en uso.',
            errors: { username: ['Este nombre de usuario ya está en uso.'] }
        };
    }
    
    const updates: Partial<Profile> = {
        username,
        full_name: fullName,
        bio
    };

    const avatarFile = formData.get('avatar') as File;
    if(avatarFile && avatarFile.size > 0) {
        const filePath = `${user.id}/avatar.${avatarFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            return { success: false, message: 'No se pudo subir la foto de perfil.', errors: null };
        }

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        updates.avatar_url = `${publicUrl}?t=${new Date().getTime()}`;
    }

    const bannerFile = formData.get('banner') as File;
     if(bannerFile && bannerFile.size > 0) {
        const filePath = `${user.id}/banner.${bannerFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
            .from('banners')
            .upload(filePath, bannerFile, { upsert: true });

        if (uploadError) {
            console.error('Error uploading banner:', uploadError);
            return { success: false, message: 'No se pudo subir el banner.', errors: null };
        }

        const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(filePath);
        updates.banner_url = `${publicUrl}?t=${new Date().getTime()}`;
    }

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, message: 'No se pudo actualizar el perfil.', errors: null };
    }

    revalidatePath(`/u/${username}`);
    revalidatePath('/settings/profile');

    return { success: true, message: 'Perfil actualizado con éxito.', errors: null };
}

export async function getUsersToFollow(limit = 3) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }
    
    const { data: followingIds } = await supabase
        .from('followers')
        .select('followed_id')
        .eq('follower_id', user.id);
    
    const idsToExclude = followingIds?.map(f => f.followed_id) ?? [];
    idsToExclude.push(user.id);

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${idsToExclude.join(',')})`)
        .limit(limit);

    if (error) {
        console.error("Error fetching users to follow:", error);
        return [];
    }
    
    return data;
}
