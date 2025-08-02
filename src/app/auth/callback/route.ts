import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
        // Check if a profile already exists for this user
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

        // If no profile exists and there's no error checking for it, create one
        if (!profile && !profileError) {
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    username: data.user.user_metadata.user_name || data.user.email?.split('@')[0],
                    full_name: data.user.user_metadata.full_name,
                    avatar_url: data.user.user_metadata.avatar_url,
                });

            if (insertError) {
                console.error("Error creating profile from oAuth callback:", insertError);
                // Redirect to an error page or show a message
                return NextResponse.redirect('/login?message=Error al crear tu perfil.');
            }
        } else if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
             console.error("Error checking for profile:", profileError);
        }
      
      return NextResponse.redirect(`${new URL(request.url).origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect('/login?message=No se pudo iniciar sesión. Por favor, inténtalo de nuevo.');
}
