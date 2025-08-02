'use server';

import { revalidatePath } from 'next/cache';
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
    // MOCK IMPLEMENTATION
    console.log(`Fetching profile for ${username}`);
    return { 
        profile: null, 
        posts: [], 
        isFollowing: false, 
        error: 'Función no implementada en modo de demostración.' 
    };
}

export async function toggleFollow(profileId: string, isFollowing: boolean) {
    // MOCK IMPLEMENTATION
    console.log(`Toggling follow for ${profileId}. Was following: ${isFollowing}`);
    return { success: true };
}


export async function updateProfile(prevState: any, formData: FormData) {
    // MOCK IMPLEMENTATION
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
    
    console.log('Updating profile with:', validatedFields.data);
    
    const avatarFile = formData.get('avatar') as File;
    const bannerFile = formData.get('banner') as File;

    if(avatarFile && avatarFile.size > 0) {
        console.log('Avatar file:', avatarFile.name);
    }
    if(bannerFile && bannerFile.size > 0) {
        console.log('Banner file:', bannerFile.name);
    }

    revalidatePath(`/u/${validatedFields.data.username}`);
    revalidatePath('/settings/profile');

    return { success: true, message: 'Perfil actualizado con éxito (simulado).', errors: null };
}
