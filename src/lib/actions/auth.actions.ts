'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '../supabase/server';
import { z } from 'zod';
import { headers } from 'next/headers';

const signupSchema = z.object({
    username: z.string().min(3, "El usuario debe tener al menos 3 caracteres.").max(20, "El usuario no puede tener más de 20 caracteres.").regex(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guiones bajos."),
    email: z.string().email("Email inválido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export async function login(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const data = Object.fromEntries(formData);
  const { email, password } = data;

  if (!email || !password) {
      return { message: 'Email y contraseña son requeridos.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password: password as string
  });

  if (error) {
    return { message: "Credenciales inválidas. Por favor, inténtalo de nuevo." }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const data = Object.fromEntries(formData);
  const validatedFields = signupSchema.safeParse(data);

  if(!validatedFields.success){
      return { 
          message: 'Campos inválidos.', 
          success: false,
          errors: validatedFields.error.flatten().fieldErrors,
      }
  }

  const { username, email, password } = validatedFields.data;

  // Check if username is already taken
  const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
  
  if (existingProfile) {
      return {
          message: 'Este nombre de usuario ya está en uso.',
          success: false,
          errors: { username: ['Este nombre de usuario ya está en uso.'] }
      }
  }

  const origin = headers().get('origin')!;

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        full_name: username, // Default full_name to username
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return { message: "No se pudo crear el usuario. Puede que el email ya esté en uso.", success: false, errors: null }
  }

  if (!user) {
    return { message: 'No se pudo crear el usuario. Inténtalo de nuevo.', success: false, errors: null }
  }

  return { message: '¡Cuenta creada! Revisa tu email para verificar tu cuenta antes de iniciar sesión.', success: true, errors: null };
}


export async function signInWithGoogle() {
  const supabase = createServerClient();
  const origin = headers().get('origin')!;
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Google sign in error:', error);
    redirect('/login?message=No se pudo iniciar sesión con Google.');
  }

  if (data.url) {
    redirect(data.url);
  }
}
