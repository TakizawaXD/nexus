'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido.'),
  password: z.string().min(1, 'La contraseña no puede estar vacía.'),
});

const signupSchema = z.object({
    email: z.string().email('Correo electrónico inválido.'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: 'Campos inválidos. Por favor, revisa tus datos.',
    };
  }
  
  const supabase = createServerClient();
  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: 'Las credenciales no son correctas. Por favor, inténtalo de nuevo.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(prevState: any, formData: FormData) {
    const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
             error: validatedFields.error.flatten().fieldErrors,
        };
    }

    const supabase = createServerClient();
    const { email, password } = validatedFields.data;
    const origin = headers().get('origin');
    
    // The username will be extracted from the email before the @
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                user_name: username,
            },
            emailRedirectTo: `${origin}/auth/callback`,
        }
    });

    if (error) {
        if (error.message.includes('User already registered')) {
            return {
                error: 'Este correo electrónico ya está registrado.'
            }
        }
        console.error('Signup Error:', error);
        return {
            error: 'No se pudo crear la cuenta. Por favor, inténtalo de nuevo.',
        };
    }

    return { success: true };
}

export async function logout() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function signInWithGoogle() {
  const supabase = createServerClient();
  const origin = headers().get('origin');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Google Sign-In Error:', error);
    redirect('/login?error=No se pudo iniciar sesión con Google');
  }

  if (data.url) {
    redirect(data.url);
  }
}
