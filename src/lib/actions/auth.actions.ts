'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '../supabase/server';

export async function login(prevState: any, formData: FormData) {
  const supabase = createServerClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = Object.fromEntries(formData)

  const { error } = await supabase.auth.signInWithPassword(data as any)

  if (error) {
    return { message: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = createServerClient()
  const data = Object.fromEntries(formData);

  if(!data.email || !data.password || !data.username){
    return { message: 'Por favor, completa todos los campos.', success: false }
  }

  // Check if username is already taken
  const { data: existingProfile, error: existingProfileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', data.username)
      .single();
  
  if (existingProfile) {
      return {
          message: 'Este nombre de usuario ya está en uso.',
          success: false,
      }
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email: data.email as string,
    password: data.password as string,
    options: {
      data: {
        username: data.username,
        full_name: data.username, // Default full_name to username
      },
      // emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return { message: error.message, success: false }
  }

  if (!user) {
    return { message: 'No se pudo crear el usuario. Inténtalo de nuevo.', success: false }
  }

  return { message: '¡Cuenta creada! Revisa tu email para verificar tu cuenta antes de iniciar sesión.', success: true };
}


export async function signInWithGoogle() {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
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
