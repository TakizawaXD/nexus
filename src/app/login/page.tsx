import Link from 'next/link';
import { AuthForm } from '@/components/auth/AuthForm';
import { NexoLogo } from '@/components/shared/NexoLogo';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = createServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                <NexoLogo className="h-8 w-8 text-primary" />
                <span>Nexo</span>
            </Link>
        </div>
        
        <AuthForm type="login" />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
