'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
  password: z.string().min(1, { message: 'La contraseña no puede estar vacía.' }),
});

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Por favor, introduce un correo electrónico válido.' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

export async function login(prevState: any, formData: FormData) {
  const supabase = createServerClient();
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos.',
    };
  }

  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      errors: null,
      message: error.message,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = createServerClient();
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos.',
    };
  }

  const { email, password } = validatedFields.data;
  const username = email.split('@')[0].toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_name: username,
        full_name: username,
        avatar_url: '', // Default avatar can be set here
      },
    },
  });

  if (error) {
     if (error.code === 'user_already_exists') {
        return {
            errors: null,
            message: "Ya existe un usuario con este correo electrónico."
        }
    }
    return {
      errors: null,
      message: error.message,
    };
  }

  if (!data.user) {
    return {
      errors: null,
      message: 'No se pudo crear el usuario. Por favor, inténtalo de nuevo.',
    };
  }
  
  // Create a profile for the new user
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    username: username,
    full_name: username,
  });

  if (profileError) {
      console.error("Error creating profile for new user:", profileError);
      // Even if profile creation fails, the user is signed up.
      // We can handle this case, e.g., by prompting the user to complete their profile later.
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signInWithGoogle() {
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        }
    });

    if(error) {
        console.error("Google sign-in error:", error);
        redirect('/login?message=No se pudo iniciar sesión con Google.');
    }

    if(data.url) {
        redirect(data.url);
    }
}

export async function signOut() {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
